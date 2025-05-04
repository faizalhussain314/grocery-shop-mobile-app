// ProductCard.js
import React, { useState, useEffect } from 'react'; // Added useEffect for potential sync
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  Pressable,
  ActivityIndicator,
} from 'react-native';
import { Product } from '@/services/productService'; // Assuming correct path
import { Link } from 'expo-router';
import { Plus, Minus } from 'lucide-react-native';

// --- Redux and Toast Imports ---
import { useDispatch } from 'react-redux';
import Toast from 'react-native-toast-message';
import { addItemToCartThunk } from '@/thunks/cartActions'; // Example path

interface ProductCardProps {
  product: Product;
}

// Helper to format KG display
const formatKg = (kg: number): string => {
    // Avoid precision issues like 0.7500000000000001
    const fixedKg = parseFloat(kg.toFixed(3));
    // Show integer if whole number, otherwise show decimals
    return Number.isInteger(fixedKg) ? fixedKg.toString() : fixedKg.toFixed(3);
};


const ProductCard: React.FC<ProductCardProps> = ({
  product,
}) => {
  const dispatch = useDispatch();

  // --- State Variables ---
  const [showControls, setShowControls] = useState<boolean>(false);
  const [displayQuantityKg, setDisplayQuantityKg] = useState<number>(0);
  const [is250gSelected, setIs250gSelected] = useState<boolean>(false);
  const [is500gSelected, setIs500gSelected] = useState<boolean>(false);
  const [isAddingToCart, setIsAddingToCart] = useState<boolean>(false);

  // --- Button Handlers ---

  const handleToggleWeight = (weightInGrams: 250 | 500) => {
    const weightInKg = weightInGrams / 1000;
    const isCurrentlySelected = weightInGrams === 250 ? is250gSelected : is500gSelected;

    let newQuantityKg = displayQuantityKg;

    if (isCurrentlySelected) {
      // Deselecting: Subtract weight
      newQuantityKg = Math.max(0, displayQuantityKg - weightInKg); // Ensure not below 0
    } else {
      // Selecting: Add weight
      newQuantityKg = displayQuantityKg + weightInKg;
    }

    // Update state
    setDisplayQuantityKg(parseFloat(newQuantityKg.toFixed(3))); // Avoid floating point issues
    if (weightInGrams === 250) {
      setIs250gSelected(!isCurrentlySelected);
    } else {
      setIs500gSelected(!isCurrentlySelected);
    }
  };

  const handleIncrementKg = () => {
        // Increment by 1 KG
        setDisplayQuantityKg(prev => parseFloat((prev + 1).toFixed(3)));
      };
    
      const handleDecrementKg = () => {
        // Decrement by 1 KG, minimum 0
        setDisplayQuantityKg(prev => Math.max(0, parseFloat((prev - 1).toFixed(3))));
      };

   // Effect to potentially deselect buttons if quantity becomes 0 via +/-
   useEffect(() => {
    if (displayQuantityKg === 0) {
        setIs250gSelected(false);
        setIs500gSelected(false);
    }
    // Optional: More complex logic to deselect if quantity drops below a threshold?
    // if (displayQuantityKg < 0.5 && is500gSelected) setIs500gSelected(false);
    // if (displayQuantityKg < 0.25 && is250gSelected) setIs250gSelected(false);
   }, [displayQuantityKg])


  // --- Add to Cart Logic ---
  const handleAddToCartPress = async () => {
    // First click: Show controls, initialize state
    if (!showControls) {
      setShowControls(true);
      setDisplayQuantityKg(0); // Start at 0 kg
      setIs250gSelected(false);
      setIs500gSelected(false);
      return;
    }

    // Subsequent clicks: Add to cart if quantity > 0
    const quantityInGrams = Math.round(displayQuantityKg * 1000); // Convert KG to grams

    if (quantityInGrams <= 0 || !product || isAddingToCart) {
        if (quantityInGrams <=0) {
             Toast.show({ type: 'error', text1: 'Select Quantity', text2:'Please add quantity using the buttons.' });
        }
        return;
    }

   

    try {
      setIsAddingToCart(true);
      await dispatch(addItemToCartThunk(product._id, quantityInGrams.toString()) as any);
      Toast.show({
        type: 'success',
        text1: 'Added to Cart',
        text2: `${product.name} (${formatKg(displayQuantityKg)}kg) added!`,
        visibilityTime: 2000,
      });
      
      console.log("try block successfully run")
       setShowControls(false);
       setDisplayQuantityKg(0);
       setIs250gSelected(false);
       setIs500gSelected(false);
    } catch (error) {
      console.error("Add to cart error:", error)
      Toast.show({
        type: 'error',
        text1: 'Add to Cart Failed',
        text2: 'An error occurred. Please try again.',
      });
    } finally {
      setIsAddingToCart(false);
    }
  };

  // Determine button text and disabled state
  const getButtonText = () => {
    if (!showControls) return "Add";
    if (isAddingToCart) return ""; // Loader shown instead

    // Format KG for display, handle 0 case
    const formattedKg = displayQuantityKg > 0 ? formatKg(displayQuantityKg) : '0';
    if (displayQuantityKg <= 0) {
        return "Add Quantity"; // Prompt user if 0
    }
    return `Add to Cart `;
  };

  const isAddToCartButtonDisabled = () => {
      if (!showControls) return false; // Initial 'Add' is enabled
      return displayQuantityKg <= 0 || isAddingToCart;
  }

  const basePriceDisplay = product.price ? `₹${product.price.toFixed(2)} / 500g` : 'Price unavailable';

  return (
    <View style={styles.productCard}>
       <Link href={`/product/${product._id}`} asChild>
            <Pressable>
                <Image
                    source={{ uri: `${product.image}` }}
                    style={styles.productImage}
                />
            </Pressable>
        </Link>
        <View style={styles.productInfo}>
             <Link href={`/product/${product._id}`} asChild>
                <Pressable>
                    <Text style={styles.productName} numberOfLines={1}>{product.name}</Text>
                    {product.rating && (
                        <View style={styles.ratingContainer}>
                            <Text style={styles.rating}>⭐ {product.rating}</Text>
                        </View>
                    )}
                    <Text style={styles.basePrice}>{basePriceDisplay}</Text>
                </Pressable>
            </Link>

            {/* --- Controls Container --- */}
            <View style={styles.controlsContainer}>
                {/* Conditional Rendering for Controls */}
                {showControls && (
                    <>
                        {/* Row 1: Weight Increment Selector */}
                        <View style={styles.incrementSelectorRow}>
                            <TouchableOpacity
                                style={[
                                    styles.incrementButton,
                                    is250gSelected && styles.incrementButtonActive
                                ]}
                                onPress={() => handleToggleWeight(250)}
                                activeOpacity={0.7}
                                disabled={isAddingToCart}
                            >
                                <Text style={[
                                    styles.incrementButtonText,
                                    is250gSelected && styles.incrementButtonTextActive
                                ]}>250g</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={[
                                    styles.incrementButton,
                                    is500gSelected && styles.incrementButtonActive
                                ]}
                                onPress={() => handleToggleWeight(500)}
                                activeOpacity={0.7}
                                disabled={isAddingToCart}
                            >
                                <Text style={[
                                    styles.incrementButtonText,
                                    is500gSelected && styles.incrementButtonTextActive
                                ]}>500g</Text>
                            </TouchableOpacity>
                        </View>

                        {/* Row 2: Quantity Selector (+/-) Displaying KG */}
                        <View style={styles.quantitySelectorRow}>
                            <TouchableOpacity
                                style={[styles.quantityControlButton, styles.decrementButton]}
                                onPress={handleDecrementKg}
                                activeOpacity={0.7}
                                // Disable decrement if already at 0 or adding to cart
                                disabled={displayQuantityKg <= 0 || isAddingToCart}
                            >
                                <Minus size={18} color={displayQuantityKg <= 0 || isAddingToCart ? '#cbd5e1' : '#475569'} />
                            </TouchableOpacity>

                            <View style={styles.quantityDisplay}>
                                {/* Display formatted KG value */}
                                <Text style={styles.quantityText}>{formatKg(displayQuantityKg)}<Text style={styles.kgUnit}>kg</Text></Text>
                            </View>

                            <TouchableOpacity
                                style={[styles.quantityControlButton, styles.incrementButtonQty]}
                                onPress={handleIncrementKg}
                                activeOpacity={0.7}
                                disabled={isAddingToCart}
                            >
                                <Plus size={18} color={isAddingToCart ? '#cbd5e1' : '#388E3C'} />
                            </TouchableOpacity>
                        </View>
                    </>
                )}

                {/* Combined Add / Add to Cart Button */}
                <TouchableOpacity
                    style={[
                        styles.addToCartButton,
                        // Apply disabled style visually if needed
                        isAddToCartButtonDisabled() && styles.addToCartButtonDisabled
                    ]}
                    onPress={handleAddToCartPress}
                    activeOpacity={0.8}
                    disabled={isAddToCartButtonDisabled()}
                >
                    {isAddingToCart ? (
                        <ActivityIndicator size="small" color="#ffffff" />
                    ) : (
                        <Text style={styles.addToCartButtonText}>{getButtonText()}</Text>
                    )}
                </TouchableOpacity>
            </View>
            {/* --- End Controls Container --- */}
        </View>
    </View>
  );
};

// --- Styles ---
const styles = StyleSheet.create({
  // (Keep existing styles for productCard, productImage, productInfo, etc.)
  productCard: { width: "48%", backgroundColor: "#ffffff", borderRadius: 16, marginBottom: 16, overflow: "hidden", shadowColor: "#94a3b8", shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.15, shadowRadius: 3, elevation: 2 },
  productImage: { width: "100%", height: 120, resizeMode: 'cover' },
  productInfo: { padding: 12, flex: 1, justifyContent: 'space-between' },
  productName: { fontFamily: "Poppins_500Medium", fontSize: 14, color: "#1e293b", marginBottom: 4 },
  ratingContainer: { backgroundColor: "#f1f5f9", paddingHorizontal: 6, paddingVertical: 3, borderRadius: 10, alignSelf: "flex-start", marginBottom: 6 },
  rating: { fontFamily: "Poppins_400Regular", fontSize: 11, color: "#475569" },
  basePrice: { fontFamily: "Poppins_500Medium", fontSize: 13, color: "#334155", marginBottom: 10 },
  controlsContainer: { marginTop: 'auto' },
  incrementSelectorRow: {
      flexDirection: 'row',
      justifyContent: 'center',
      marginBottom: 10,
      gap: 10,
  },
  incrementButton: { paddingVertical: 6, paddingHorizontal: 16, borderRadius: 16, borderWidth: 1, borderColor: '#cbd5e1', backgroundColor: '#f8fafc' },
  incrementButtonActive: { borderColor: '#4CAF50', backgroundColor: '#C8E6C9' },
  incrementButtonText: { fontFamily: "Poppins_500Medium", fontSize: 13, color: '#475569' },
  incrementButtonTextActive: { color: '#388E3C' },

  quantitySelectorRow: {
     flexDirection: 'row',
     alignItems: 'center',
     justifyContent: 'space-between',
     borderWidth: 1,
     borderColor: '#e2e8f0',
     borderRadius: 8,
     marginBottom: 12,
     overflow: 'hidden',
   },
   quantityControlButton: {
     paddingVertical: 10,
     paddingHorizontal: 14,
     alignItems: 'center',
     justifyContent: 'center',
     minWidth: 44, // Ensure decent tap area
   },
   decrementButton: {
       borderRightWidth: 1,
       borderColor: '#e2e8f0',
   },
   quantityDisplay: {
     flexGrow: 1,
     alignItems: 'center',
     justifyContent: 'center',
     paddingVertical: 10,
     backgroundColor: '#f8fafc',
   },
   quantityText: {
     fontFamily: "Poppins_600SemiBold",
     fontSize: 16,
     color: '#1e293b',
   },
   kgUnit: { // Style for the 'kg' unit
       fontFamily: "Poppins_400Regular",
       fontSize: 12,
       color: '#475569',
       marginLeft: 2, // Add a small space before 'kg'
   },
   incrementButtonQty: {
       borderLeftWidth: 1,
       borderColor: '#e2e8f0',
   },

   addToCartButton: { backgroundColor: '#4CAF50', paddingVertical: 12, borderRadius: 8, alignItems: 'center', justifyContent: 'center', width: '100%', minHeight: 44 },
   addToCartButtonDisabled: { backgroundColor: '#a5d6a7' }, // Visually indicate disabled state
   addToCartButtonText: { fontFamily: "Poppins_600SemiBold", fontSize: 14, color: '#ffffff' }
});

export default ProductCard;