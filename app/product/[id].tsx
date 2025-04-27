import { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  TextInput, // TextInput might not be needed for quantity now
  Share as RNShare,
  Platform,
  ActivityIndicator,
} from 'react-native';
import { useLocalSearchParams, Link, useRouter } from 'expo-router';
import { getProductById, Product } from '@/services/productService';
import {
  useFonts,
  Poppins_400Regular,
  Poppins_500Medium,
  Poppins_600SemiBold,
} from '@expo-google-fonts/poppins';
import { ArrowLeft, Share2, Minus, Plus } from 'lucide-react-native';
import Constants from 'expo-constants';
import { useDispatch } from 'react-redux'; // Keep useDispatch for thunk
import { addItemToCartThunk } from '@/thunks/cartActions';
import Toast from 'react-native-toast-message';
// import { useAppDispatch } from '@/lib/hook'; // Use standard useDispatch unless you have a custom hook

// Assuming formatKg is defined near your ProductCard or in a common helpers file
// If not, copy the formatKg helper function here or import it.
// For this example, let's assume you'll import it or place it here.
// import { formatKg } from '../components/ProductCard'; // Adjust path as needed

// --- Helper to format KG display (Copying from ProductCard if not imported) ---
const formatKg = (kg: number): string => {
    // Avoid precision issues like 0.7500000000000001
    const fixedKg = parseFloat(kg.toFixed(3));
    // Show integer if whole number, otherwise show decimals down to 3 places
     // Check if fixedKg is a whole number (within a small tolerance for float comparisons)
    if (Math.abs(fixedKg - Math.round(fixedKg)) < 0.0001) {
        return Math.round(fixedKg).toString(); // Show as integer if it's like 1.000 -> 1
    }
    return fixedKg.toFixed(3); // Otherwise show with 3 decimals
};


export default function ProductScreen() {
  const [product, setProduct] = useState<Product | null>(null);
  // Replace simple 'quantity' state with states for display quantity and toggles
  const [displayQuantity, setDisplayQuantity] = useState(0); // Represents KG or Pieces
  const [is250gSelected, setIs250gSelected] = useState(false);
  const [is500gSelected, setIs500gSelected] = useState(false);


  const [loading, setLoading] = useState(true);
  const { id } = useLocalSearchParams<{ id: string }>();
  const [cartAdded, setCartAdded] = useState(false); // Seems unused based on handleAddToCart logic
  const router = useRouter();
  const [isAddingToCart, setIsAddingToCart] = useState(false);
  const dispatch = useDispatch(); // Use standard useDispatch if useAppDispatch is not specifically required here


  const [fontsLoaded] = useFonts({
    Poppins_400Regular,
    Poppins_500Medium,
    Poppins_600SemiBold,
  });
  const BASE_URL = Constants?.expoConfig?.extra?.VITE_WEB_URL ?? '';

  // --- Quantity Change Handlers (Adapted from ProductCard) ---

  // Handles 250g / 500g button clicks (Toggles selection and updates total)
  const handleToggleWeight = useCallback((weightInGrams: 250 | 500) => {
      if (!product || (product.unit !== 'kg' && product.unit !== 'g')) return; // Only for weight units

      const weightInKg = weightInGrams / 1000; // 0.25 or 0.5
      const isCurrentlySelected = weightInGrams === 250 ? is250gSelected : is500gSelected;

      let newQuantity = displayQuantity;

      if (isCurrentlySelected) {
          // Deselecting: Subtract weight
          newQuantity = Math.max(0, parseFloat((displayQuantity - weightInKg).toFixed(3)));
      } else {
          // Selecting: Add weight
          newQuantity = parseFloat((displayQuantity + weightInKg).toFixed(3));
      }

      // Update selected state for the clicked button
      if (weightInGrams === 250) {
          setIs250gSelected(!isCurrentlySelected);
      } else {
          setIs500gSelected(!isCurrentlySelected);
      }

      // If quantity becomes 0, deselect BOTH toggles
      if (newQuantity === 0) {
          setIs250gSelected(false);
          setIs500gSelected(false);
      }

      setDisplayQuantity(newQuantity); // Update display quantity
  }, [product, displayQuantity, is250gSelected, is500gSelected]); // Add dependencies


  // Handles + / - button clicks (increment/decrement by 1 KG or 1 Piece)
  const handleQuantityChange = useCallback((change: number) => {
      if (!product) return;

      let incrementAmount;
      let newQuantity;

      if (product.unit === 'piece') {
          incrementAmount = 1;
          newQuantity = Math.max(1, displayQuantity + (change * incrementAmount)); // Min 1 piece
      } else { // kg or g
          incrementAmount = 1; // Change is always 1 KG
          newQuantity = Math.max(0, parseFloat((displayQuantity + (change * incrementAmount)).toFixed(3))); // Min 0 KG
          // If quantity becomes 0, deselect toggles
           if (newQuantity === 0) {
              setIs250gSelected(false);
              setIs500gSelected(false);
           }
      }

      setDisplayQuantity(newQuantity);

  }, [product, displayQuantity]); // Add dependencies


  // Remove the old incrementQuantity, decrementQuantity, handleQuickQuantity


  // --- Share and Add to Cart Handlers ---

  const handleShare = useCallback(async () => {
    if (!product) return;

    try {
      const result = await RNShare.share({
        message: Platform.OS === 'ios' ? '' : `Check out ${product.name}!`,
        url: Platform.OS === 'ios' ? `${BASE_URL}/product/${product._id}` : undefined,
        title: `Check out ${product.name}!`,
      });
    } catch (error) {
      console.error('Error sharing:', error);
    }
  }, [product]);

  const handleAddToCart = async () => {
    if (!product || isAddingToCart) return;

    let quantityToSend;
    let displayUnit; // For the toast message

    if (product.unit === 'piece') {
        quantityToSend = Math.max(1, displayQuantity); // Ensure at least 1 piece is sent
        displayUnit = 'piece(s)';
        if (quantityToSend <= 0) { // Should not happen with Math.max(1,...), but good check
             Toast.show({ type: 'error', text1: 'Invalid Quantity', text2:'Please select a valid quantity.' });
             return;
        }
    } else { // kg or g
        quantityToSend = Math.round(displayQuantity * 1000); // Convert KG to grams
        displayUnit = `${formatKg(displayQuantity)}kg`;
        if (quantityToSend <= 0) {
            Toast.show({ type: 'error', text1: 'Select Quantity', text2:'Please add quantity using the buttons.' });
            return;
        }
    }


    try {
      setIsAddingToCart(true);
      // Dispatch the thunk with product._id and the calculated quantityToSend (in grams or pieces)
      await dispatch(addItemToCartThunk(product._id, quantityToSend.toString()) as any);

      Toast.show({
        type: 'success',
        text1: 'Added to Cart',
        text2: `${product.name} (${displayUnit}) added!`,
      });

      // Optional: Reset quantity controls after adding to cart
      if (product.unit === 'piece') {
          setDisplayQuantity(1); // Reset to 1 piece
      } else {
          setDisplayQuantity(0); // Reset to 0 kg
          setIs250gSelected(false);
          setIs500gSelected(false);
      }


    } catch (error) {
      console.error("Add to cart error:", error)
      Toast.show({
        type: 'error',
        text1: 'Add to Cart Failed',
        text2: 'An error occurred. Please try again.',
      });
    } finally {
      setIsAddingToCart(false);
      // setCartAdded(false); // This state seems unused now, can potentially remove
    }
  };

  // --- Effect to fetch Product Data ---
  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const data = await getProductById(id);
        setProduct(data);
        // Initialize display quantity based on product unit after fetching
        if (data) {
             setDisplayQuantity(data.unit === 'piece' ? 1 : 0); // Default to 1 for piece, 0 for weight
             // Optionally, if you want to initialize with minimum quantity if applicable:
             // setDisplayQuantity(data.unit === 'piece' ? 1 : (data.minQuantity ?? 0));
        }

      } catch (error) {
        console.error('Error fetching product:', error);
        // TODO: Handle error display to user
      } finally {
        setLoading(false);
      }
    };

    if (id) fetchProduct();
  }, [id]); // Add id as dependency


    // --- Derived State / Helpers for Rendering ---

   const isWeightUnit = product?.unit === 'kg' || product?.unit === 'g';
   const isAddToCartButtonDisabled = isAddingToCart || (isWeightUnit ? displayQuantity <= 0 : displayQuantity < 1);


  if (!fontsLoaded || !product || loading) {
       return (
           <View style={styles.loaderContainer}>
               <ActivityIndicator size="large" color="#22c55e" />
               <Text style={styles.loadingText}>Loading product...</Text> {/* Added loading text */}
           </View>
       );
   }


  return (
    <View style={styles.container}>
      <View style={{ position: 'absolute', top: 0, left: 0, right: 0, zIndex: 9999, elevation: 50, shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 } }}>
        <Toast position="top" topOffset={60} />
      </View>

      <ScrollView style={styles.scrollView}>
        <View style={styles.header}>
          <Link href=".." asChild>
            <TouchableOpacity style={styles.iconButton}>
              <ArrowLeft size={20} color="#64748b" />
            </TouchableOpacity>
          </Link>
          <TouchableOpacity style={styles.iconButton} onPress={handleShare}>
            <Share2 size={20} color="#64748b" />
          </TouchableOpacity>
        </View>

        <Image
          source={{ uri: `${BASE_URL}${product.image}` }}
          style={styles.productImage}
        />

        <View style={styles.content}>
          <View style={styles.titleSection}>
            <Text style={styles.productName}>{product.name}</Text>
            <View style={styles.priceContainer}>
               {/* Display price per unit (e.g., per 500g or per piece) */}
              <Text style={styles.price}>₹{product.price?.toFixed(2) ?? 'N/A'}</Text>
              <Text style={styles.unit}>/ {product.unit ?? 'N/A'}</Text> {/* Display the product's actual unit */}
            </View>
          </View>

          {product.active && (
            <View style={styles.badge}>
              <Text style={styles.badgeText}>Available</Text>
            </View>
          )}

          <View style={styles.ratingSection}>
             {/* Use optional chaining and nullish coalescing for safety */}
            <Text style={styles.rating}>⭐ {product.rating?.toFixed(1) ?? 'N/A'}</Text>
            <Text style={styles.reviews}>Based on 128 reviews</Text> {/* This seems static */}
          </View>

          <View style={styles.quantitySection}>
            <Text style={styles.quantityLabel}>Quantity</Text>
            <View style={styles.quantityControls}>
               {/* Decrement Button */}
               <TouchableOpacity
                 style={[styles.quantityButton, (isWeightUnit ? displayQuantity <= 0 : displayQuantity <= 1) && styles.quantityButtonDisabled]} // Disable based on unit type
                 onPress={() => handleQuantityChange(-1)} // Use the new handler
                 disabled={isAddingToCart || (isWeightUnit ? displayQuantity <= 0 : displayQuantity <= 1)} // Disable if loading or at min quantity
               >
                 <Minus size={20} color={isAddingToCart || (isWeightUnit ? displayQuantity <= 0 : displayQuantity <= 1) ? "#94a3b8" : "#64748b"} />
               </TouchableOpacity>

               {/* Quantity Display */}
               <View style={styles.quantityDisplay}>
                  {isWeightUnit ? (
                      // For weight units, show formatted KG and the 'kg' unit
                      <Text style={styles.quantityText}>
                          {formatKg(displayQuantity)}
                          <Text style={styles.kgUnit}>kg</Text>
                      </Text>
                  ) : (
                      // For piece units, show the integer quantity
                      <Text style={styles.quantityText}>{displayQuantity}</Text>
                  )}
               </View>

               {/* Increment Button */}
               <TouchableOpacity
                 style={[styles.quantityButton]} // No max quantity check in UI, rely on backend stock
                 onPress={() => handleQuantityChange(1)} // Use the new handler
                 disabled={isAddingToCart} // Disable if loading
               >
                 <Plus size={20} color={isAddingToCart ? "#94a3b8" : "#64748b"} />
               </TouchableOpacity>
            </View>

            {/* Quick Quantity Buttons (250g/500g) - Only for weight units */}
            {isWeightUnit && (
              <View style={styles.quickQuantityButtons}>
                <TouchableOpacity
                  style={[styles.quickQuantityButton, is250gSelected && styles.quickQuantityButtonActive]}
                  onPress={() => handleToggleWeight(250)} // Use the new toggle handler
                  disabled={isAddingToCart}
                >
                  <Text style={[styles.quickQuantityText, is250gSelected && styles.quickQuantityTextActive]}>250g</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.quickQuantityButton, is500gSelected && styles.quickQuantityButtonActive]}
                  onPress={() => handleToggleWeight(500)} // Use the new toggle handler
                  disabled={isAddingToCart}
                >
                  <Text style={[styles.quickQuantityText, is500gSelected && styles.quickQuantityTextActive]}>500g</Text>
                </TouchableOpacity>
              </View>
            )}
             {/* Removed the old quick quantity buttons as they don't fit the new logic */}
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Description</Text>
            <Text style={styles.description}>
              {product.description ?? 'No description available.'}
            </Text>
          </View>

          {product.nutrition && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Nutrition Facts</Text>
              <View style={styles.nutritionGrid}>
                {Object.entries(product.nutrition).map(([key, value]) => (
                  <View key={key} style={styles.nutritionItem}>
                    {/* Ensure value is rendered as text */}
                    <Text style={styles.nutritionValue}>{value?.toString() ?? '-'}</Text>
                    <Text style={styles.nutritionLabel}>{key}</Text>
                  </View>
                ))}
              </View>
            </View>
          )}
        </View>
      </ScrollView>

      <View style={styles.footer}>
        {/* Add to Cart Button - Modified */}
        <TouchableOpacity
          style={[styles.addToCartButton, isAddToCartButtonDisabled && styles.addToCartButtonDisabled]}
          onPress={handleAddToCart}
          disabled={isAddToCartButtonDisabled} // Use the derived disabled state
        >
          {isAddingToCart ? (
            <ActivityIndicator color="#fff" />
          ) : (
            // Determine button text dynamically based on quantity state
            <Text style={styles.addToCartText}>
                {isWeightUnit ?
                    (displayQuantity > 0 ? `Add ${formatKg(displayQuantity)}kg to Cart` : 'Select Quantity')
                    :
                    (displayQuantity > 0 ? `Add ${displayQuantity} to Cart` : 'Select Quantity') // For piece units
                }
            </Text>
          )}
        </TouchableOpacity>


        <Link href="/cart" asChild>
          <TouchableOpacity style={styles.cartIcon}>
            <Text>🛒</Text>
          </TouchableOpacity>
        </Link>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  scrollView: {
    flex: 1,
  },
  header: {
    position: 'absolute',
    top: 60,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    zIndex: 10,
  },
  iconButton: {
    padding: 12,
    backgroundColor: '#ffffff',
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  productImage: {
    width: '100%',
    height: 400,
  },
  content: {
    padding: 20,
  },
  titleSection: {
    marginBottom: 16,
  },
  productName: {
    fontFamily: 'Poppins_600SemiBold',
    fontSize: 24,
    color: '#1e293b',
    marginBottom: 8,
  },
  priceContainer: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  price: {
    fontFamily: 'Poppins_600SemiBold',
    fontSize: 24,
    color: '#22c55e',
    marginRight: 4,
  },
  unit: {
    fontFamily: 'Poppins_400Regular',
    fontSize: 16,
    color: '#64748b',
  },
  badge: {
    backgroundColor: '#22c55e',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    alignSelf: 'flex-start',
    marginBottom: 16,
  },
  badgeText: {
    fontFamily: 'Poppins_500Medium',
    fontSize: 12,
    color: '#ffffff',
  },
  ratingSection: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
  },
  rating: {
    fontFamily: 'Poppins_500Medium',
    fontSize: 16,
    color: '#1e293b',
    marginRight: 8,
  },
  reviews: {
    fontFamily: 'Poppins_400Regular',
    fontSize: 14,
    color: '#64748b',
  },
  quantitySection: {
    marginBottom: 24,
  },
  quantityLabel: {
    fontFamily: 'Poppins_500Medium',
    fontSize: 16,
    color: '#1e293b',
    marginBottom: 12,
  },
   // Adapted quantityControls for ProductScreen
  quantityControls: {
    flexDirection: 'row',
    alignItems: 'center',
    // backgroundColor: '#f8fafc', // Removed background if not desired
    // borderRadius: 12, // Removed border radius if not desired
    // padding: 4, // Removed padding if not desired
    marginBottom: 12,
    borderWidth: 1, // Added borders similar to ProductCard's quantitySelectorRow
    borderColor: '#e2e8f0',
    borderRadius: 8,
    overflow: 'hidden',
  },
   quantityButton: { // Adapted quantityButton for ProductScreen
     paddingVertical: 10, // Increased vertical padding
     paddingHorizontal: 14, // Increased horizontal padding
     alignItems: 'center',
     justifyContent: 'center',
     minWidth: 44, // Ensure decent tap area
   },
   quantityButtonDisabled: {
     backgroundColor: '#f1f5f9', // Use lighter background when disabled
     opacity: 0.6, // Reduce opacity
   },
   // Adapted quantityDisplay for ProductScreen
   quantityDisplay: {
     flexGrow: 1, // Allow text to take available space
     alignItems: 'center',
     justifyContent: 'center',
     paddingVertical: 10, // Match button padding
     backgroundColor: '#f8fafc', // Add a light background
   },
  quantityText: { // Use the same style as ProductCard for quantity text
    fontFamily: 'Poppins_600SemiBold',
    fontSize: 18,
    color: '#1e293b',
  },
   kgUnit: { // Style for the 'kg' unit
      fontFamily: "Poppins_400Regular",
      fontSize: 12,
      color: '#475569',
      marginLeft: 2, // Add a small space before 'kg'
    },

   // Adapted quickQuantityButtons for ProductScreen
  quickQuantityButtons: {
    flexDirection: 'row',
    gap: 12,
  },
   // Adapted quickQuantityButton for ProductScreen
  quickQuantityButton: {
    flex: 1, // Allow buttons to take equal space
    backgroundColor: '#f8fafc',
    paddingVertical: 12,
    paddingHorizontal: 16, // Reduced horizontal padding
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
   quickQuantityButtonActive: {
    backgroundColor: '#22c55e15',
    borderColor: '#22c55e',
  },
   quickQuantityText: { // Adapted quickQuantityText for ProductScreen
    fontFamily: 'Poppins_500Medium',
    fontSize: 14,
    color: '#64748b',
  },
   quickQuantityTextActive: {
    color: '#22c55e',
  },

  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontFamily: 'Poppins_600SemiBold',
    fontSize: 18,
    color: '#1e293b',
    marginBottom: 12,
  },
  description: {
    fontFamily: 'Poppins_400Regular',
    fontSize: 14,
    color: '#64748b',
    lineHeight: 22,
  },
  nutritionGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -8, // Compensate for item padding
  },
  nutritionItem: {
    width: '25%', // 4 items per row
    paddingHorizontal: 8, // Add horizontal padding
    paddingVertical: 4, // Add vertical padding
     alignItems: 'center', // Center text within the item
     marginBottom: 8, // Space between rows
  },
  nutritionValue: {
    fontFamily: 'Poppins_600SemiBold',
    fontSize: 16,
    color: '#1e293b',
    marginBottom: 4,
  },
  nutritionLabel: {
    fontFamily: 'Poppins_400Regular',
    fontSize: 12,
    color: '#64748b',
    textTransform: 'capitalize',
    textAlign: 'center', // Center label text
  },
  footer: {
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#ffffff',
    borderTopWidth: 1,
    borderTopColor: '#f1f5f9',
  },
   // Adapted addToCartButton for ProductScreen
  addToCartButton: {
    flex: 1,
    backgroundColor: '#22c55e', // Use green color
    paddingVertical: 16, // Increased vertical padding
    borderRadius: 16, // Increased border radius
    alignItems: 'center',
    marginRight: 12,
    justifyContent: 'center', // Center content
    minHeight: 56, // Ensure minimum height
  },
   // Added style for disabled add to cart button
   addToCartButtonDisabled: {
       backgroundColor: '#a5d6a7', // Lighter green when disabled
       opacity: 0.8, // Slightly reduced opacity
   },
   // Adapted addToCartText for ProductScreen
  addToCartText: {
    fontFamily: 'Poppins_600SemiBold',
    fontSize: 16,
    color: '#ffffff',
  },
  cartIcon: {
    padding: 12,
    backgroundColor: '#ffffff',
    borderRadius: 50,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
     width: 50, // Fixed size for cart icon
     height: 50,
  },

    // Added loader container and text styles
    loaderContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: '#f8fafc',
    },
    loadingText: {
      marginTop: 12,
      fontFamily: 'Poppins_400Regular',
      fontSize: 16,
      color: '#94a3b8',
    },
});