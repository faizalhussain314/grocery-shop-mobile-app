import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  Pressable,
} from 'react-native';
import { Product } from '@/services/productService';
import { Link } from 'expo-router';
import { Plus, Minus } from 'lucide-react-native';

// Import a Cart Context or Store hook if you have one
// import { useCart } from '@/context/CartContext'; 

interface ProductCardProps {
  product: Product;
  baseUrl: string;
  // You might get initial quantity/increment from cart if item already exists
  // initialQuantity?: number;
  // initialIncrement?: '250g' | '500g';
}

const ProductCard: React.FC<ProductCardProps> = ({ 
  product, 
  baseUrl, 
  // initialQuantity = 1, // Default starting quantity
  // initialIncrement = '500g' // Default starting increment
}) => {
  
  const [quantity, setQuantity] = useState<number>(1); // Start quantity at 1
  const [selectedIncrement, setSelectedIncrement] = useState<'250g' | '500g'>('500g'); // Default increment

  // --- Cart Integration Placeholder ---
  // const { addToCartOrUpdate, findCartItemDetails } = useCart(); 
  
  // Example useEffect to sync with cart state (Optional)
  // This is more complex as cart might store total grams, not quantity/increment
  // You might need findCartItemDetails(product.id) which returns { quantity, increment }
  // useEffect(() => {
  //   const cartDetails = findCartItemDetails ? findCartItemDetails(product.id) : null; 
  //   if (cartDetails) {
  //      setQuantity(cartDetails.quantity);
  //      setSelectedIncrement(cartDetails.increment);
  //   } else {
  //      setQuantity(1); // Reset to default if not in cart
  //      setSelectedIncrement('500g');
  //   }
  // }, [product.id, findCartItemDetails]);
  // --- End Cart Integration Placeholder ---

  const handleIncrement = () => {
    setQuantity(prev => prev + 1);
  };

  const handleDecrement = () => {
    // Allow decrementing down to 1 (or 0 if you prefer and disable Add button)
    setQuantity(prev => Math.max(1, prev - 1)); 
  };

  const handleSelectIncrement = (increment: '250g' | '500g') => {
      setSelectedIncrement(increment);
      // Optional: Reset quantity to 1 when increment changes? 
      // setQuantity(1); 
  };

  const handleAddToCart = () => {
      // --- Cart Logic ---
      // Pass the product ID (or full product), quantity, and selected increment
      // The cart context/reducer will calculate total grams and price.
      // addToCartOrUpdate(product.id, quantity, selectedIncrement); 
      console.log(`Adding to cart: ${product.name} - ${quantity} x ${selectedIncrement}`);

      // Optional: Provide user feedback
      // e.g., Show temporary message, change button text, etc.
  };

  // Static base price display
  // *** Adjust unit ('500g', '1kg') based on your actual base price ***
  const basePriceDisplay = product.price ? `₹${product.price.toFixed(2)} / 500g` : 'Price unavailable'; 

  return (
    <Link href={`/product/${product.id}`} asChild> 
      <Pressable style={styles.productCard}>
        <Image 
          source={{ uri: `${baseUrl}${product.image}` }} 
          style={styles.productImage} 
        />
        <View style={styles.productInfo}>
          <Text style={styles.productName} numberOfLines={1}>{product.name}</Text>
          
          {/* Rating */}
          {product.rating && (
             <View style={styles.ratingContainer}>
               <Text style={styles.rating}>⭐ {product.rating}</Text>
             </View>
          )}
         
          {/* Static Price Display */}
          <Text style={styles.basePrice}>{basePriceDisplay}</Text>

          {/* --- Controls --- */}
          <View style={styles.controlsContainer}>
            
             {/* Row 1: Weight Increment Selector */}
             <View style={styles.incrementSelectorRow}>
                <TouchableOpacity
                  style={[
                    styles.incrementButton, 
                    selectedIncrement === '250g' && styles.incrementButtonActive
                  ]}
                  onPress={() => handleSelectIncrement('250g')}
                  activeOpacity={0.7}
                >
                    <Text style={[
                        styles.incrementButtonText,
                        selectedIncrement === '250g' && styles.incrementButtonTextActive
                    ]}>250g</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[
                    styles.incrementButton, 
                    selectedIncrement === '500g' && styles.incrementButtonActive
                  ]}
                   onPress={() => handleSelectIncrement('500g')}
                   activeOpacity={0.7}
                 >
                    <Text style={[
                        styles.incrementButtonText,
                        selectedIncrement === '500g' && styles.incrementButtonTextActive
                    ]}>500g</Text>
                </TouchableOpacity>
             </View>

             {/* Row 2: Quantity Selector */}
             <View style={styles.quantitySelectorRow}>
                 <TouchableOpacity 
                    style={[styles.quantityControlButton, styles.decrementButton]} 
                    onPress={handleDecrement}
                    activeOpacity={0.7}
                  >
                    <Minus size={18} color="#475569" /> 
                  </TouchableOpacity>

                  <View style={styles.quantityDisplay}>
                    <Text style={styles.quantityText}>{quantity}</Text> 
                  </View>

                 <TouchableOpacity 
                    style={[styles.quantityControlButton, styles.incrementButtonQty]} 
                    onPress={handleIncrement}
                    activeOpacity={0.7}
                  >
                    <Plus size={18} color="#166534" /> 
                  </TouchableOpacity>
             </View>

             {/* Row 3: Add to Cart Button */}
             <TouchableOpacity 
                style={styles.addToCartButton} 
                onPress={handleAddToCart}
                activeOpacity={0.8} // Slightly less fade on main button
                // disabled={quantity === 0} // Uncomment if quantity can be 0
              >
                <Text style={styles.addToCartButtonText}>Add to Cart</Text>
              </TouchableOpacity>

          </View>
          {/* --- End Controls --- */}

        </View>
      </Pressable>
    </Link>
  );
};

const styles = StyleSheet.create({
  productCard: {
    width: "48%", 
    backgroundColor: "#ffffff",
    borderRadius: 16,
    marginBottom: 16,
    overflow: "hidden",
    shadowColor: "#94a3b8",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.15,
    shadowRadius: 3,
    elevation: 2,
  },
  productImage: { 
    width: "100%", 
    height: 120, 
    resizeMode: 'cover',
  },
  productInfo: { 
    padding: 12, // Increased padding slightly
  },
  productName: {
    fontFamily: "Poppins_500Medium",
    fontSize: 14,
    color: "#1e293b",
    marginBottom: 4,
  },
   ratingContainer: {
    backgroundColor: "#f1f5f9",
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: 10,
    alignSelf: "flex-start",
    marginBottom: 6, 
  },
  rating: {
    fontFamily: "Poppins_400Regular",
    fontSize: 11,
    color: "#475569",
  },
  basePrice: {
      fontFamily: "Poppins_500Medium",
      fontSize: 13,
      color: "#334155", 
      marginBottom: 10, // More space before controls
  },
  controlsContainer: {
      // Container for all controls
  },
  incrementSelectorRow: {
      flexDirection: 'row',
      justifyContent: 'center', // Center the buttons
      marginBottom: 10,
      gap: 10, // Add gap between buttons
  },
  incrementButton: {
      paddingVertical: 6,
      paddingHorizontal: 16, // Wider buttons
      borderRadius: 16, // Pill shape
      borderWidth: 1,
      borderColor: '#cbd5e1', // Default border
      backgroundColor: '#f8fafc', // Default background
  },
  incrementButtonActive: {
      borderColor: '#22c55e', // Active border green
      backgroundColor: '#dcfce7', // Active background light green
  },
  incrementButtonText: {
      fontFamily: "Poppins_500Medium",
      fontSize: 13,
      color: '#475569', // Default text color
  },
  incrementButtonTextActive: {
      color: '#166534', // Active text dark green
  },
  quantitySelectorRow: {
     flexDirection: 'row',
     alignItems: 'center',
     justifyContent: 'space-between', // Spread items
     borderWidth: 1,
     borderColor: '#e2e8f0', 
     borderRadius: 8,
     marginBottom: 12, // Space before Add button
     overflow: 'hidden', 
   },
   quantityControlButton: { 
      paddingVertical: 10, // Taller touch area
      paddingHorizontal: 14, // Wider touch area
      alignItems: 'center',
      justifyContent: 'center',
   },
   decrementButton: {
      // Optional: specific background/border if needed
       borderRightWidth: 1,
       borderColor: '#e2e8f0',
   },
   quantityDisplay: {
      flexGrow: 1, // Takes up middle space
      alignItems: 'center',
      justifyContent: 'center',
      paddingVertical: 10,
      backgroundColor: '#f8fafc', 
   },
   quantityText: {
      fontFamily: "Poppins_600SemiBold",
      fontSize: 16, // Larger quantity number
      color: '#1e293b',
   },
   incrementButtonQty: { // Style for the '+' button in quantity row
      // Optional: specific background/border if needed
       borderLeftWidth: 1,
       borderColor: '#e2e8f0',
   },
   addToCartButton: {
       backgroundColor: '#22c55e', // Green background
       paddingVertical: 12, // Prominent button
       borderRadius: 8,
       alignItems: 'center',
       justifyContent: 'center',
       width: '100%', // Full width
   },
//    addToCartButtonDisabled: { // Optional style if quantity can be 0
//        backgroundColor: '#9ca3af', // Grey out when disabled
//    },
   addToCartButtonText: {
       fontFamily: "Poppins_600SemiBold",
       fontSize: 14,
       color: '#ffffff', // White text
   }
});

export default ProductCard;