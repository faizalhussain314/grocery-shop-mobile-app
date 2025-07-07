// ProductCard.js - Auto-expanding Image Version with Conditional Weight Controls
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  Pressable,
  ActivityIndicator,
} from 'react-native';
import { Product } from '@/services/productService';
import { Link } from 'expo-router';
import { Plus, Minus } from 'lucide-react-native';

// --- Redux and Toast Imports ---
import { useDispatch } from 'react-redux';
import Toast from 'react-native-toast-message';
import { addItemToCartThunk } from '@/thunks/cartActions';
import { useCartStore } from '@/store/cartStore';

interface ProductCardProps {
  product: Product;
}

// Helper to format KG display
const formatKg = (kg: number): string => {
  const fixedKg = parseFloat(kg.toFixed(3));
  return Number.isInteger(fixedKg) ? fixedKg.toString() : fixedKg.toFixed(3);
};

const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  const dispatch = useDispatch();

  const cartProductIds = useCartStore((state) => state.cartProductIds);
  const addToCart = useCartStore((state) => state.addToCart);
  const removeFromCart = useCartStore((state) => state.removeFromCart);

  const isInCart = cartProductIds.includes(product._id);

  // Check if product unit is not "piece" to show weight controls
  const shouldShowWeightControls = product.unit !== 'piece';

  // --- State Variables ---
  const [showControls, setShowControls] = useState<boolean>(false);
  const [displayQuantityKg, setDisplayQuantityKg] = useState<number>(0);
  const [is250gSelected, setIs250gSelected] = useState<boolean>(false);
  const [is500gSelected, setIs500gSelected] = useState<boolean>(false);
  const [isAddingToCart, setIsAddingToCart] = useState<boolean>(false);
  const [isRecentlyAdded, setIsRecentlyAdded] = useState<boolean>(false);

  // --- Button Handlers ---
  const handleToggleWeight = (weightInGrams: 250 | 500) => {
    const weightInKg = weightInGrams / 1000;
    const isCurrentlySelected =
      weightInGrams === 250 ? is250gSelected : is500gSelected;

    let newQuantityKg = displayQuantityKg;

    if (isCurrentlySelected) {
      newQuantityKg = Math.max(0, displayQuantityKg - weightInKg);
    } else {
      newQuantityKg = displayQuantityKg + weightInKg;
    }

    setDisplayQuantityKg(parseFloat(newQuantityKg.toFixed(3)));
    if (weightInGrams === 250) {
      setIs250gSelected(!isCurrentlySelected);
    } else {
      setIs500gSelected(!isCurrentlySelected);
    }
  };

  const handleIncrementKg = () => {
    setDisplayQuantityKg((prev) => parseFloat((prev + 1).toFixed(3)));
  };

  const handleDecrementKg = () => {
    setDisplayQuantityKg((prev) =>
      Math.max(0, parseFloat((prev - 1).toFixed(3)))
    );
  };

  useEffect(() => {
    if (displayQuantityKg === 0) {
      setIs250gSelected(false);
      setIs500gSelected(false);
    }
  }, [displayQuantityKg]);

  // --- Add to Cart Logic ---
const handleAddToCartPress = async () => {
  const buttonText = getButtonText();
  
  if (buttonText === 'Added') {
    // Do nothing if the status is already "Added"
    return;
  }

  if (!showControls) {
    setShowControls(true);
    setDisplayQuantityKg(0);
    setIs250gSelected(false);
    setIs500gSelected(false);
    return;
  }

  const quantityInGrams = Math.round(displayQuantityKg * 1000);

  if (quantityInGrams <= 0 || !product || isAddingToCart) {
    if (quantityInGrams <= 0) {
      Toast.show({
        type: 'error',
        text1: 'Select Quantity',
        text2: 'Please add quantity using the buttons.',
      });
    }
    return;
  }

  try {
    setIsAddingToCart(true);
    await dispatch(
      addItemToCartThunk(product._id, quantityInGrams.toString()) as any
    );
    Toast.show({
      type: 'success',
      text1: 'Added to Cart',
      text2: `${product.name} (${formatKg(displayQuantityKg)}kg) added!`,
      visibilityTime: 2000,
    });
    addToCart(product._id);
    setIsRecentlyAdded(true);

    console.log('try block successfully run');
    setShowControls(false);
    setDisplayQuantityKg(0);
    setIs250gSelected(false);
    setIs500gSelected(false);
    setIsRecentlyAdded(true);
  } catch (error) {
    console.error('Add to cart error:', error);
    Toast.show({
      type: 'error',
      text1: 'Add to Cart Failed',
      text2: 'An error occurred. Please try again.',
    });
  } finally {
    setIsAddingToCart(false);
  }
};


  const getButtonText = () => {
  if (isAddingToCart) return '';
  if (!showControls) return isInCart ? 'Added' : 'Add';
  if (displayQuantityKg <= 0) return 'Add Quantity';
  return 'Add to Cart';
};


  useEffect(() => {
    if (!isInCart && isRecentlyAdded) {
      setIsRecentlyAdded(false);
    }
  }, [isInCart]);

const isAddToCartButtonDisabled = () => {
  const buttonText = getButtonText();
  if (!showControls) return false;
  return buttonText === 'Add Quantity' || buttonText === 'Added' || displayQuantityKg <= 0 || isAddingToCart;
};




 const basePriceDisplay = product.price
  ? `₹${product.price.toFixed(2)} / ${product.unit === 'piece' ? '1pc' : '1kg'}`
  : 'Price unavailable';

  const getDisplayUnit = (unit: string): string => {
  if (unit === 'piece') return 'pcs';
  return 'kg'; // default to kg for "kg", "gram", etc.
};

  

  return (
    <View style={styles.productCard}>
      {/* Image Container - Flexible height that grows to fill available space */}
      <View style={styles.imageContainer}>
        <Link href={`/product/${product._id}`} asChild>
          <Pressable style={styles.imagePressable}>
            <Image
              source={{ uri: `${product.image}` }}
              style={styles.productImage}
            />
          </Pressable>
        </Link>
      </View>
      
      {/* Fixed Bottom Section - Product Info + Controls */}
      <View style={styles.bottomSection}>
        {/* Product Details */}
        <View style={styles.productDetails}>
          <Link href={`/product/${product._id}`} asChild>
            <Pressable>
              <Text style={styles.productName} numberOfLines={1}>
                {product.name}
              </Text>
              {product.rating && (
                <View style={styles.ratingContainer}>
                  <Text style={styles.rating}>⭐ {product.rating}</Text>
                </View>
              )}
              <Text style={styles.basePrice}>{basePriceDisplay}</Text>
            </Pressable>
          </Link>
        </View>

        {/* Controls Section */}
        {showControls && (
          <View style={styles.controlsContent}>
            {/* Weight Selector - Only show if unit is not "piece" */}
            {shouldShowWeightControls && (
              <View style={styles.incrementSelectorRow}>
                <TouchableOpacity
                  style={[
                    styles.incrementButton,
                    is250gSelected && styles.incrementButtonActive,
                  ]}
                  onPress={() => handleToggleWeight(250)}
                  activeOpacity={0.7}
                  disabled={isAddingToCart}
                >
                  <Text
                    style={[
                      styles.incrementButtonText,
                      is250gSelected && styles.incrementButtonTextActive,
                    ]}
                  >
                    250g
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[
                    styles.incrementButton,
                    is500gSelected && styles.incrementButtonActive,
                  ]}
                  onPress={() => handleToggleWeight(500)}
                  activeOpacity={0.7}
                  disabled={isAddingToCart}
                >
                  <Text
                    style={[
                      styles.incrementButtonText,
                      is500gSelected && styles.incrementButtonTextActive,
                    ]}
                  >
                    500g
                  </Text>
                </TouchableOpacity>
              </View>
            )}

            {/* Quantity Controls */}
            <View style={styles.quantitySelectorRow}>
              <TouchableOpacity
                style={[styles.quantityControlButton, styles.decrementButton]}
                onPress={handleDecrementKg}
                activeOpacity={0.7}
                disabled={displayQuantityKg <= 0 || isAddingToCart}
              >
                <Minus
                  size={18}
                  color={
                    displayQuantityKg <= 0 || isAddingToCart
                      ? '#E0E0E0'
                      : '#5B2B99'
                  }
                />
              </TouchableOpacity>

              <View style={styles.quantityDisplay}>
                <Text style={styles.quantityText}>
                  {formatKg(displayQuantityKg)}
                    <Text style={styles.kgUnit}>{getDisplayUnit(product.unit)}</Text>
                </Text>
              </View>

              <TouchableOpacity
                style={[
                  styles.quantityControlButton,
                  styles.incrementButtonQty,
                ]}
                onPress={handleIncrementKg}
                activeOpacity={0.7}
                disabled={isAddingToCart}
              >
                <Plus
                  size={18}
                  color={isAddingToCart ? '#5B2B99' : '#5B2B99'}
                />
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* Add to Cart Button */}
     <TouchableOpacity
  style={[
    styles.addToCartButton,
    isAddToCartButtonDisabled() && styles.addToCartButtonDisabled,
    isInCart ? styles.addToCartButtonAdded : null, // Only apply added style when in cart
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
    </View>
  );
};

// --- Optimized Styles ---
const styles = StyleSheet.create({
  productCard: {
    width: '48%',
    backgroundColor: '#ffffff',
    borderRadius: 16,
    marginBottom: 16,
    overflow: 'hidden',
    shadowColor: '#94a3b8',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.15,
    shadowRadius: 3,
    // Use flexbox to create flexible layout
    display: 'flex',
    flexDirection: 'column',
    minHeight: 240, // Minimum height for non-expanded cards
  },
  
  // Image container that grows to fill available space
  imageContainer: {
    flex: 1, // This makes the image take all available space
    minHeight: 120, // Minimum image height
  },
  
  imagePressable: {
    flex: 1, // Fill the container
  },
  
  productImage: { 
    width: '100%', 
    height: '100%', // Fill the container completely
    resizeMode: 'cover',
  },
  
  // Fixed bottom section that stays compact
  bottomSection: {
    padding: 12,
    // No flex - this section takes only the space it needs
  },
  
  productDetails: {
    marginBottom: 8,
  },
  
  productName: {
    fontFamily: 'Poppins_500Medium',
    fontSize: 14,
    color: '#1e293b',
    marginBottom: 4,
  },
  
  ratingContainer: {
    backgroundColor: '#f1f5f9',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 10,
    alignSelf: 'flex-start',
    marginBottom: 4,
  },
  
  rating: { 
    fontFamily: 'Poppins_400Regular', 
    fontSize: 11, 
    color: '#475569' 
  },
  
  basePrice: {
    fontFamily: 'Poppins_500Medium',
    fontSize: 13,
    color: '#334155',
  },
  
  controlsContent: {
    marginBottom: 12,
  },
  
  incrementSelectorRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 8,
    gap: 10,
  },
  
  incrementButton: {
    paddingVertical: 6,
    paddingHorizontal: 14,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#cbd5e1',
    backgroundColor: '#FAF7FF',
  },
  
  incrementButtonActive: {
    borderColor: '#C191FF',
    backgroundColor: '#C191FF',
  },
  
  incrementButtonText: {
    fontFamily: 'Poppins_500Medium',
    fontSize: 12,
    color: '#475569',
  },
  
  incrementButtonTextActive: { 
    color: '#fff' 
  },
  
  quantitySelectorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 8,
    overflow: 'hidden',
    marginBottom: 12,
  },
  
  quantityControlButton: {
    paddingVertical: 10,
    paddingHorizontal: 12,
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 44,
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
    backgroundColor: '#FAF7FF',
  },
  
  quantityText: {
    fontFamily: 'Poppins_600SemiBold',
    fontSize: 14,
    color: '#1e293b',
   
  },
  
  kgUnit: {
    fontFamily: 'Poppins_400Regular',
    fontSize: 14,
    color: '#475569',
  },
  
  incrementButtonQty: {
    borderLeftWidth: 1,
    borderColor: '#e2e8f0',
  },
  
  addToCartButton: {
    backgroundColor: '#AC6CFF',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
  },
  
 addToCartButtonDisabled: {
  backgroundColor: '#F3EAFF', // A lighter color indicating the disabled state
},
  
  addToCartButtonText: {
    fontFamily: 'Poppins_600SemiBold',
    fontSize: 14,
    color: '#ffffff',
  },
  addToCartButtonAdded: {
  backgroundColor: '#5B2B99', // A lighter shade indicating that it's added to the cart
},


  
});

export default ProductCard;