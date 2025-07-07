import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image, TextInput, Pressable, ActivityIndicator } from 'react-native';
import { useFonts, Poppins_400Regular, Poppins_500Medium, Poppins_600SemiBold } from '@expo-google-fonts/poppins';
import { Minus, Plus, Share2, Trash2, Scale, ShoppingCart, Package } from 'lucide-react-native'; // Added ShoppingCart and Package icons
import { useState, useEffect, useCallback } from 'react';
import { getCartItems, createOrder, deleteCartItem } from '@/services/cartService'; // Assuming updateCartItem service exists or will be added
import Constants from 'expo-constants';
import Toast from 'react-native-toast-message';
import { useRouter } from 'expo-router';
import * as SecureStore from 'expo-secure-store';
import { useFocusEffect } from '@react-navigation/native';
import { useCartStore } from '@/store/cartStore';


const formatKg = (kg: number): string => {
   
    const fixedKg = parseFloat(kg.toFixed(3));
   
    if (Math.abs(fixedKg - Math.round(fixedKg)) < 0.0001) {
         return Math.round(fixedKg).toString();
    }
    return fixedKg.toFixed(3); 
};



interface Product {
    _id: string;
    name: string;
    category: string;
    price: number; 
    unit: string; 
    stock: number;
    active: boolean;
    image: string;
}

interface CartItem {
    _id: string;
    customer: string;
    productId: Product;
    quantity: number; 
    createdAt: string;
    updatedAt: string;
    __v: number;
}

interface CartItemWithDisplay extends CartItem {
    displayQuantity: number;
    is250gSelected: boolean;
    is500gSelected: boolean; 
}

interface OrderResponse {
  customer: string;
  items: Array<{
      productId: string;
      quantity: number;
      _id: string;
  }>;
  totalPrice: number;
  status: string;
  _id: string;
  createdAt: string;
  updatedAt: string;
  orderId: string; // The order number we need
  __v: number;
}

export default function CartScreen() {
    const [items, setItems] = useState<CartItemWithDisplay[]>([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [expandedItemId, setExpandedItemId] = useState<string | null>(null); 

    const router = useRouter();
   const cartProductIds = useCartStore((state) => state.cartProductIds);
const addToCart = useCartStore((state) => state.addToCart);
const removeFromCart = useCartStore((state) => state.removeFromCart);

   
   
    const [isFetching, setIsFetching] = useState(true); 
    const [refreshing, setRefreshing] = useState(false);

    const [fontsLoaded] = useFonts({
        Poppins_400Regular,
        Poppins_500Medium,
        Poppins_600SemiBold,
    });
    const { setCartCount, setCartProducts } = useCartStore();

    

   const detectWeightButtonStates = (quantity: number) => {
    // Convert to fixed decimal to avoid floating point precision issues
    const fixedQuantity = parseFloat(quantity.toFixed(3));
    
    // Check if quantity is divisible by 0.5 (500g)
    const is500gActive = (fixedQuantity % 0.5 === 0) && (fixedQuantity % 1 !== 0);
    
    // Check if quantity is divisible by 0.25 (250g) but not by 0.5
    const remainder250 = fixedQuantity % 0.25;
    const remainder500 = fixedQuantity % 0.5;
    const is250gActive = (Math.abs(remainder250) < 0.001) && (Math.abs(remainder500) >= 0.001);
    
    return {
        is250gSelected: is250gActive,
        is500gSelected: is500gActive
    };
};
   


 const fetchCartItems = useCallback(async (isRefresh = false) => {
    if (!isRefresh) setIsFetching(true);

    try {
        const data: CartItem[] = await getCartItems();

        // Filter out any items with null productId
        const validItems = data.filter(item => item.productId !== null);

        const processedItems: CartItemWithDisplay[] = validItems.map(item => {
            const isWeightUnit = item.productId.unit === 'kg' || item.productId.unit === 'g';
            
            let initialDisplayQuantity;
            
            if (isWeightUnit) {
                // For weight units (kg/g), convert grams to kg for display
                // Backend stores in grams, so divide by 1000 to get kg
                initialDisplayQuantity = item.quantity / 1000;
            } else {
                // For piece units, use the quantity as-is (can be fractional like 0.5, 0.25, 0.75)
                // Backend might store fractional pieces (e.g., 0.5 for half piece, 0.25 for quarter piece)
                initialDisplayQuantity = item.quantity/1000;
            }

            const displayQuantity = parseFloat(initialDisplayQuantity.toFixed(3));
            
            // Auto-detect button states based on quantity
            const buttonStates = isWeightUnit ? detectWeightButtonStates(displayQuantity) : {
                is250gSelected: false,
                is500gSelected: false
            };

            return {
                ...item,
                displayQuantity,
                is250gSelected: buttonStates.is250gSelected,
                is500gSelected: buttonStates.is500gSelected,
            };
        });

        setItems(processedItems);
        
        const productIds = processedItems.map(item => item.productId._id);
        setCartProducts(productIds);

        console.log("processedItems.length", processedItems.length);
        setCartCount(processedItems.length);
    } catch (error) {
        console.error('Failed to fetch cart items:', error);
        Toast.show({
            type: 'error',
            text1: 'Error',
            text2: 'Failed to load cart items',
        });
    } finally {
        setIsFetching(false);
        if (isRefresh) setRefreshing(false);
    }
}, []);
    

    useFocusEffect(
        useCallback(() => {
            console.log('Cart screen focused, fetching items...');
            fetchCartItems();

            return () => {
               
                console.log('Cart screen unfocused');
            };
        }, [fetchCartItems])
    );

    const onRefresh = useCallback(() => {
        setRefreshing(true); 
        fetchCartItems(true); 
    }, [fetchCartItems]); 
  
  const handleQuantityChange = (id: string, change: number) => {
    setItems(currentItems => {
        return currentItems.map(item => {
            if (item._id === id) {
                const isWeightUnit = item.productId.unit === 'kg' || item.productId.unit === 'g';
               
                const increment = isWeightUnit ? 1 : 1; 
                
                const currentDisplayQuantity = item.displayQuantity || (item.quantity / 1000);
                let newQuantity = currentDisplayQuantity + (change * increment);

                if (isWeightUnit) {
                     newQuantity = Math.max(0, parseFloat(newQuantity.toFixed(3)));
                    
                     if (newQuantity === 0) {
                        return { 
                            ...item, 
                            displayQuantity: newQuantity, 
                            is250gSelected: false, 
                            is500gSelected: false 
                        };
                     }
                     
                
                     const buttonStates = detectWeightButtonStates(newQuantity);
                     
                     return { 
                         ...item, 
                         displayQuantity: newQuantity,
                         is250gSelected: buttonStates.is250gSelected,
                         is500gSelected: buttonStates.is500gSelected
                     };
                } else { 
                     newQuantity = Math.max(1, newQuantity);
                     return { ...item, displayQuantity: newQuantity };
                }
            }
            return item;
        });
    });
};

    
    const handleToggleWeight = (id: string, weightInGrams: 250 | 500) => {
    const weightInKg = weightInGrams / 1000; 
    setItems(currentItems => {
        return currentItems.map(item => {
            if (item._id === id) {
                 const isWeightUnit = item.productId.unit === 'kg' || item.productId.unit === 'g';
            
                if (isWeightUnit) {
                     // Use existing displayQuantity or calculate from quantity if it doesn't exist
                     const currentDisplayQuantity = item.displayQuantity || (item.quantity / 1000);
                     const currentIs250gSelected = item.is250gSelected || false;
                     const currentIs500gSelected = item.is500gSelected || false;
                     
                     const isCurrentlySelected = weightInGrams === 250 ? currentIs250gSelected : currentIs500gSelected;
                     let newQuantity = currentDisplayQuantity;

                     if (isCurrentlySelected) {
                        // Remove the weight
                        newQuantity = Math.max(0, parseFloat((currentDisplayQuantity - weightInKg).toFixed(3)));
                     } else {
                      
                        newQuantity = parseFloat((currentDisplayQuantity + weightInKg).toFixed(3));
                     }

                    
                     if (newQuantity === 0) {
                         return {
                             ...item,
                             displayQuantity: 0,
                             is250gSelected: false,
                             is500gSelected: false
                         };
                     }
                     
                     const buttonStates = detectWeightButtonStates(newQuantity);

                    return {
                         ...item,
                        displayQuantity: newQuantity,
                         is250gSelected: buttonStates.is250gSelected,
                        is500gSelected: buttonStates.is500gSelected,
                     };
                }
               
                return item;
            }
            return item;
        });
    });
};


    const handleRemoveItem = async  (id: string) => {
    
 const itemToRemove = items.find(item => item._id === id);
    if (!itemToRemove) return;
        
        setItems(currentItems => currentItems.filter(item => item._id !== id));
const productId = itemToRemove.productId._id;

         try {

      console.log(`Attempting to delete cart item: ${id}`);
      await deleteCartItem(id); 
      console.log(`Successfully deleted cart item: ${id} from backend.`);

      setItems(prevItems => {
    const updatedItems = prevItems.filter(item => item._id !== id);
    
    return updatedItems;
});


     
      if (expandedItemId === id) {
          setExpandedItemId(null);
      }
      removeFromCart(productId);


      Toast.show({
          type: 'success',
          text1: 'Item Removed',
          text2: 'Item successfully removed from cart.',
      });
    }
    catch (error) {
        console.error(`Failed to remove cart item ${id}:`, error);
        Toast.show({
            type: 'error',
            text1: 'Removal Failed',
            text2: 'Could not remove item from cart. Please try again.',
        });
      
         setItems(currentItems => currentItems.map(item =>
             item._id === id ? { ...item, isDeleting: false } : item
         ));
    }
   
  };

    const filteredItems = items.filter(item =>
        item.productId.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

  
    const calculateItemPrice = (item: CartItemWithDisplay): number => {
        if (!item.productId || item.displayQuantity === undefined) {
            return 0;
        }

        // if (item.productId.unit === 'piece') {
        //     const quantityForCalculation = Math.max(1, item.displayQuantity);
        //     return item.productId.price * quantityForCalculation;
        // } else {
            const quantityIn500gUnits = item.displayQuantity / 1;
            if (item.displayQuantity <= 0) return 0;
            return item.productId.price * quantityIn500gUnits;
        // }
    };

    const calculateTotal = (): number => {
        return filteredItems.reduce((sum, item) => sum + calculateItemPrice(item), 0);
    };

    // --- Checkout Logic ---
    const handleCheckout = async () => {
       

        try {
            setIsLoading(true);
            

            // Retrieve customer ID
            const userString = await SecureStore.getItemAsync('user');
            const user = userString ? JSON.parse(userString) : null;
            const customerId = user?.id;
           

            if (!customerId) {
                console.error("Customer is not authenticated");
                Toast.show({
                    type: 'error',
                    text1: 'Authentication Error',
                    text2: 'Please log in to checkout.',
                });
                 setIsLoading(false);
                 router.push('/login'); 
                return;
            }

            const orderItems = items.map(item => {
                let quantityToSend;
                if (item.productId.unit === 'piece') {
                    quantityToSend =  item.displayQuantity; 
                } else {
                    
                    quantityToSend = Math.round(item.displayQuantity * 1000);
                   
                     if (quantityToSend <= 0) {
                         console.warn(`Item ${item.productId.name} has zero quantity (${item.displayQuantity}kg), skipping for order creation.`);
                         return null;
                     }
                }
                return {
                    productId: item.productId._id,
                    quantity: quantityToSend, // Send the calculated grams or pieces
                };
            }).filter(item => item !== null); // Filter out items with 0 quantity

            if (orderItems.length === 0) {
                 Toast.show({
                     type: 'error',
                     text1: 'Cart Empty',
                     text2: 'Please add items to your cart before checking out.',
                 });
                 setIsLoading(false);
                 return;
            }

           
            const totalPrice = calculateTotal();

            // return console.log("orderItems", orderItems , totalPrice)

            const orderResponse: OrderResponse = await createOrder(orderItems, totalPrice);
           

            // Show success toast message
            Toast.show({
                type: 'success',
                text1: 'Success',
                text2: 'Order placed successfully!',
            });

               items.forEach(item => {
    const productId = item.productId._id;
    removeFromCart(productId);
});
           
            setItems([]); // Clear local cart state after successful order
         

            router.push({ pathname: '/thank-you', params: { orderId: orderResponse.orderId } });
            

        } catch (error: unknown) {
            if (error instanceof Error) {
                console.error('Error during checkout:', error.message);
                Toast.show({
                    type: 'error',
                    text1: 'Checkout Failed',
                    text2: error.message || 'An error occurred.',
                });
            } else {
                console.error('Unknown error during checkout', error);
                Toast.show({
                    type: 'error',
                    text1: 'Checkout Failed',
                    text2: 'An unknown error occurred.',
                });
            }
        } finally {
            setIsLoading(false);
           
        }
    };
     useEffect(() => {
  setCartCount(items.length);
}, [items]);


    if (!fontsLoaded) {
        return null; 
    }

    if (isFetching && !refreshing) { // Show only on initial load, not during pull-to-refresh
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#9747FF" />
                <Text style={styles.loadingText}>Loading Cart...</Text>
            </View>
        );
    }
    const total = calculateTotal();

   

    return (
        <View style={styles.container}>
            <ScrollView style={styles.scrollView}>
                <View style={styles.header}>
                    <Text style={styles.title}>Cart</Text>
                  
                    {/* <TouchableOpacity style={styles.iconButton}>
                        <Share2 size={20} color="#64748b" />
                    </TouchableOpacity> */}
                </View>

                <View style={styles.searchContainer}>
                    <TextInput
                        style={styles.searchInput}
                        placeholder="Search items..."
                        value={searchQuery}
                        onChangeText={setSearchQuery}
                        placeholderTextColor="#94a3b8"
                    />
                </View>

                <View style={styles.cartItems}>
                    {filteredItems.length === 0 ? (
                        <View style={styles.emptyCartContainer}>
                            <View style={styles.emptyCartIconContainer}>
                                <ShoppingCart size={80} color="#cbd5e1" />
                            </View>
                            <Text style={styles.emptyCartTitle}>Your cart is empty</Text>
                            <Text style={styles.emptyCartSubtitle}>
                                Looks like you haven't added anything to your cart yet
                            </Text>
                            <TouchableOpacity 
                                style={styles.continueShoppingButton}
                                onPress={() => router.push('/(tabs)')}
                            >
                                <Package size={18} color="#ffffff" style={{ marginRight: 8 }} />
                                <Text style={styles.continueShoppingText}>Continue Shopping</Text>
                            </TouchableOpacity>
                        </View>
                    ) : (
                        filteredItems.map((item , index) => (
                            <View key={index} style={styles.cartItem}>
                             <View>
                                <Image
                                    source={{ uri: `${item.productId.image}` }}
                                    style={styles.itemImage}
                                />
                                 <View>
                                             <Text style={styles.itemPrice}>
                                             Price: ₹{item.productId.price.toFixed(2)} 
                                             </Text>
                                        </View>
                                </View>
                                <View style={styles.itemDetails}>
                                    <View style={styles.itemHeader}>
                                    <Text style={styles.itemName} numberOfLines={2}>{item.productId.name || 'Unnamed Product'}</Text>

                                        <TouchableOpacity
                                             style={styles.removeButton}
                                             onPress={() => handleRemoveItem(item._id)}
                                        >
                                            <Trash2 size={20} color="#ef4444" />
                                        </TouchableOpacity>
                                    </View>
                                    <View style={styles.priceQuantity}>
                                       

                                        {/* --- Quantity Controls --- */}
                                       
                                          
                                            <View style={styles.expandedQuantityControls}>
                                                 {/* 250g/500g buttons (only for weight units) */}
                                                 {(item?.productId?.unit === 'kg' || item?.productId?.unit === 'g') && (
                                                    <View style={styles.incrementSelectorRow}>
                                                        {/* 250g Button with Icon */}
                                                        <TouchableOpacity
                                                            style={[
                                                              styles.incrementButton,
                                                              item.is250gSelected && styles.incrementButtonActive // Apply active style
                                                             ]}
                                                            onPress={() => handleToggleWeight(item._id, 250)}
                                                            activeOpacity={0.7}
                                                        >
                                                            <Scale size={16} color={item.is250gSelected ? '#388E3C' : '#475569'} style={styles.incrementButtonIcon} />
                                                            <Text style={[styles.incrementButtonText, item.is250gSelected && styles.incrementButtonTextActive]}>250g</Text>
                                                        </TouchableOpacity>
                                                        {/* 500g Button with Icon */}
                                                        <TouchableOpacity
                                                            style={[
                                                              styles.incrementButton,
                                                              item.is500gSelected && styles.incrementButtonActive // Apply active style
                                                             ]}
                                                            onPress={() => handleToggleWeight(item._id, 500)}
                                                            activeOpacity={0.7}
                                                        >
                                                             <Scale size={16} color={item.is500gSelected ? '#388E3C' : '#475569'} style={styles.incrementButtonIcon} />
                                                            <Text style={[styles.incrementButtonText, item.is500gSelected && styles.incrementButtonTextActive]}>500g</Text>
                                                        </TouchableOpacity>
                                                    </View>
                                                 )}

                                                {/* +/- and Quantity Display Row */}
                                                <View style={styles.quantitySelectorRow}>
                                                    {/* Decrement Button (Expanded View) */}
                                                    <TouchableOpacity
                                                        style={[
                                                           styles.quantityControlButton,
                                                           styles.decrementButton,
                                                            
                                                            item.displayQuantity <= (item.productId.unit === 'piece' ? 1 : 0) && styles.quantityButtonDisabled,
                                                        ]}
                                                        // Expanded view decrement: -1 KG or -1 Piece (as per user request)
                                                        onPress={() => handleQuantityChange(item._id, -1)}
                                                        disabled={item.displayQuantity <= (item.productId.unit === 'piece' ? 1 : 0)}
                                                    >
                                                         <Minus size={18} color={item.displayQuantity <= (item.productId.unit === 'piece' ? 1 : 0) ? '#94a3b8' : '#64748b'} />
                                                    </TouchableOpacity>

                                                    {/* Quantity Display (Pressable to collapse) */}
                                                    <Pressable
                                                        style={styles.quantityDisplay}
                                                        onPress={() => setExpandedItemId(null)} 
                                                    >
                                                        <Text style={styles.quantityText}>
  {item?.productId?.unit === 'piece'
    ? item.displayQuantity || 0 
    : `${formatKg(item.displayQuantity || 0)}`} 
</Text>

                                                    </Pressable>

                                                   
                                                    <TouchableOpacity
                                                        style={[
                                                            styles.quantityControlButton,
                                                            styles.incrementButtonQty,
                                                           
                                                        ]}
                                                       
                                                        onPress={() => handleQuantityChange(item._id, 1)}
                                                    >
                                                        <Plus size={18} color="#64748b" />
                                                    </TouchableOpacity>
                                                </View>
                                            </View>
                                        
                                            
                                        
                                        {/* --- End Quantity Controls --- */}
                                    </View>
                                </View>
                            </View>
                        ))
                    )}
                </View>

                {/* Only render summary if cart has items */}
                {filteredItems.length > 0 && (
                    <View style={styles.summary}>
                        <Text style={styles.summaryTitle}>Order Summary</Text>
                        
                        {/* Item breakdown */}
                        {filteredItems.map((item, index) => {
                            const itemTotal = calculateItemPrice(item);
                            const displayQuantity = item.productId.unit === 'piece' 
                                ? item.displayQuantity 
                                : formatKg(item.displayQuantity);
                            const unit = item.productId.unit === 'piece' 
                                ? (item.displayQuantity === 1 ? 'pc' : 'pcs')
                                : 'kg';
                            
                            return (
                                <View key={index} style={styles.summaryRow}>
                                    <View style={styles.summaryItemLeft}>
                                        <Text style={styles.summaryItemName} numberOfLines={1}>
                                            {item.productId.name}
                                        </Text>
                                        <Text style={styles.summaryItemDetails}>
                                            {displayQuantity} {unit} × ₹{item.productId.price.toFixed(2)}
                                        </Text>
                                    </View>
                                    <Text style={styles.summaryItemPrice}>
                                        ₹{itemTotal.toFixed(2)}
                                    </Text>
                                </View>
                            );
                        })}
                       
                        <View style={[styles.summaryRow, styles.totalRow]}>
                            <Text style={styles.totalLabel}>Total</Text>
                          
                            <Text style={styles.totalValue}>₹{total.toFixed(2)}</Text>
                        </View>
                    </View>
                )}
                 {filteredItems.length === 0 && (
                     
                      <View style={{ height: 50 }} />
                 )}
            </ScrollView>

            {/* Fixed Footer with Checkout Button */}
            {/* Show footer only if cart has items */}
            {filteredItems.length > 0 && (
                <View style={styles.footer}>
                    <TouchableOpacity
    style={[styles.checkoutButton, (isLoading || total <= 0) && styles.checkoutButtonDisabled]} // Disable if loading or total is 0
    onPress={handleCheckout}
    disabled={isLoading || total <= 0} 
>
  {isLoading ? (
    <ActivityIndicator size="small" color="#ffffff" />
  ) : (
    <Text style={styles.checkoutText}>Proceed to Checkout</Text> // This is separate now
  )}
</TouchableOpacity>

                </View>
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#FAF7FF',
    },
    loadingContainer: { // Style for the initial loading view
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#FAF7FF',
    },
    loadingText: {
        marginTop: 15,
        fontFamily: 'Poppins_500Medium',
        fontSize: 16,
        color: '#9747FF',
    },
    scrollViewContent: { // Optional: Add paddingBottom if footer overlaps last item
        paddingBottom: 100, // Adjust needed if footer is tall
    },
    scrollView: {
        flex: 1,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingTop: 60, // Adjust for status bar height + padding
        paddingBottom: 20,
        backgroundColor: '#ffffff',
        borderBottomLeftRadius: 16, // Optional rounded corners
        borderBottomRightRadius: 16,
    },
    title: {
        fontFamily: 'Poppins_600SemiBold',
        fontSize: 24,
        color: '#1e293b',
    },
    iconButton: {
        padding: 8,
        backgroundColor: '#f1f5f9',
        borderRadius: 12,
        alignItems: 'center',
        justifyContent: 'center',
         width: 40, // Fixed width/height for square button
         height: 40,
    },
     removeButton: {
        padding: 4, // Make touch area slightly larger than icon
     },
    searchContainer: {
        padding: 20,
        paddingTop: 0,
        backgroundColor: '#ffffff', // Should match header background for seamless look
        marginBottom: 16, // Space between search and cart items
    },
    searchInput: {
        fontFamily: 'Poppins_400Regular',
        fontSize: 16,
        color: '#1e293b',
        backgroundColor: '#f1f5f9',
        paddingVertical: 12, // Adjust padding for height
        paddingHorizontal: 16,
        borderRadius: 12,
    },
    cartItems: {
        paddingHorizontal: 20, // Horizontal padding for the list
        paddingBottom: 20, // Add some bottom padding
    },
    // Enhanced Empty Cart Styles
    emptyCartContainer: {
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 60,
        paddingHorizontal: 40,
    },
    emptyCartIconContainer: {
        backgroundColor: '#f8fafc',
        borderRadius: 50,
        padding: 30,
        marginBottom: 24,
        borderWidth: 2,
        borderColor: '#e2e8f0',
        borderStyle: 'dashed',
    },
    emptyCartTitle: {
        fontFamily: 'Poppins_600SemiBold',
        fontSize: 24,
        color: '#1e293b',
        textAlign: 'center',
        marginBottom: 8,
    },
    emptyCartSubtitle: {
        fontFamily: 'Poppins_400Regular',
        fontSize: 16,
        color: '#64748b',
        textAlign: 'center',
        lineHeight: 24,
        marginBottom: 32,
    },
    continueShoppingButton: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#9747FF',
        paddingVertical: 14,
        paddingHorizontal: 24,
        borderRadius: 12,
        elevation: 2,
        shadowColor: '#9747FF',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 4,
    },
    continueShoppingText: {
        fontFamily: 'Poppins_600SemiBold',
        fontSize: 16,
        color: '#ffffff',
    },
    cartItem: {
        flexDirection: 'row',
        backgroundColor: '#ffffff',
        borderRadius: 16,
        marginBottom: 16,
        overflow: 'hidden',
        shadowColor: "#94a3b8", // Add subtle shadow
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 3,
        elevation: 2,
    },
    itemImage: {
        width: 90, // Slightly smaller image
        height: 90,
        resizeMode: 'cover',
        borderRadius: 12, // Match container border radius slightly
        margin: 10, // Add some margin around image
    },
    itemDetails: {
        flex: 1,
        paddingVertical: 12,
        paddingRight: 12, // Padding on the right side
        paddingLeft: 0, // No left padding as image has margin
        justifyContent: 'space-between',
    },
    itemHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: 4,
        flexGrow: 1, // Allow item name to take space
    },
    itemName: {
        fontFamily: 'Poppins_500Medium',
        fontSize: 15, // Slightly smaller font
        color: '#1e293b',
        flex: 1, // Allow name to wrap
        marginRight: 8,
    },
    priceQuantity:             { justifyContent: 'space-between', alignItems: 'flex-end' ,paddingVertical: 4,paddingHorizontal:10 , marginTop: 8, },
    expandedQuantityControls:  { flexDirection: 'column', alignItems: 'flex-end' },
    
    itemPrice: {
        fontFamily: 'Poppins_600SemiBold',
        fontSize: 16, 
        paddingInline:10,
        color: '#9747FF',
    },
     basePricePerUnit: {
         fontFamily: 'Poppins_400Regular',
         fontSize: 12,
         color: '#64748b',
         marginTop: 2,
     },
    // --- Simple Quantity Controls (Visible when not expanded) ---
    simpleQuantityControls: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#f1f5f9', // Light background
        borderRadius: 12,
        padding: 4,
    },
     quantityButton: {
        padding: 6, // Smaller padding than expanded buttons
        backgroundColor: '#ffffff',
        borderRadius: 8,
        alignItems: 'center',
        justifyContent: 'center',
        minWidth: 32,
        minHeight: 32,
    },
    quantityButtonDisabled: {
        backgroundColor: '#f8fafc',
        opacity: 0.5,
    },
    simpleQuantityText: {
        fontFamily: 'Poppins_500Medium',
        fontSize: 14,
        color: '#1e293b',
        marginHorizontal: 12,
        minWidth: 40,
        textAlign: 'center',
    },
    // --- Expanded Quantity Controls ---
    incrementSelectorRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 8,
        gap: 8,
    },
    incrementButton: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#f1f5f9',
        paddingVertical: 6,
        paddingHorizontal: 10,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: '#e2e8f0',
    },
    incrementButtonActive: {
        backgroundColor: '#e8f5e8',
        borderColor: '#4ade80',
    },
    incrementButtonIcon: {
        marginRight: 4,
    },
    incrementButtonText: {
        fontFamily: 'Poppins_400Regular',
        fontSize: 12,
        color: '#475569',
    },
    incrementButtonTextActive: {
        color: '#388E3C',
        fontFamily: 'Poppins_500Medium',
    },
    quantitySelectorRow: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#f1f5f9',
        borderRadius: 12,
        padding: 4,
    },
    quantityControlButton: {
        padding: 8,
        backgroundColor: '#ffffff',
        borderRadius: 8,
        alignItems: 'center',
        justifyContent: 'center',
        minWidth: 36,
        minHeight: 36,
    },
    decrementButton: {
        // Specific styles for decrement button if needed
    },
    incrementButtonQty: {
        // Specific styles for increment button if needed
    },
    quantityDisplay: {
        backgroundColor: '#ffffff',
        borderRadius: 8,
        paddingHorizontal: 16,
        paddingVertical: 8,
        marginHorizontal: 8,
        minWidth: 60,
        alignItems: 'center',
    },
    quantityText: {
        fontFamily: 'Poppins_500Medium',
        fontSize: 14,
        color: '#1e293b',
        textAlign: 'center',
    },
    // --- Summary Styles ---
    summary: {
        backgroundColor: '#ffffff',
        marginHorizontal: 20,
        marginBottom: 20,
        borderRadius: 16,
        padding: 20,
        shadowColor: "#94a3b8",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    summaryTitle: {
        fontFamily: 'Poppins_600SemiBold',
        fontSize: 18,
        color: '#1e293b',
        marginBottom: 16,
    },
    summaryRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: 12,
    },
    summaryItemLeft: {
        flex: 1,
        marginRight: 12,
    },
    summaryItemName: {
        fontFamily: 'Poppins_500Medium',
        fontSize: 14,
        color: '#1e293b',
        marginBottom: 2,
    },
    summaryItemDetails: {
        fontFamily: 'Poppins_400Regular',
        fontSize: 12,
        color: '#64748b',
    },
    summaryItemPrice: {
        fontFamily: 'Poppins_500Medium',
        fontSize: 14,
        color: '#1e293b',
    },
    totalRow: {
        borderTopWidth: 1,
        borderTopColor: '#e2e8f0',
        paddingTop: 12,
        marginTop: 8,
        marginBottom: 0,
    },
    totalLabel: {
        fontFamily: 'Poppins_600SemiBold',
        fontSize: 18,
        color: '#1e293b',
    },
    totalValue: {
        fontFamily: 'Poppins_600SemiBold',
        fontSize: 18,
        color: '#9747FF',
    },
    // --- Footer Styles ---
    footer: {
        backgroundColor: '#ffffff',
        paddingHorizontal: 20,
        paddingVertical: 16,
        paddingBottom: Math.max(16, Constants.statusBarHeight || 0), // Add safe area padding
        borderTopWidth: 1,
        borderTopColor: '#e2e8f0',
        shadowColor: "#000",
        shadowOffset: { width: 0, height: -2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 5,
    },
    checkoutButton: {
        backgroundColor: '#9747FF',
        paddingVertical: 16,
        borderRadius: 12,
        alignItems: 'center',
        justifyContent: 'center',
        shadowColor: '#9747FF',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 6,
        minHeight: 52,
    },
    checkoutButtonDisabled: {
        backgroundColor: '#94a3b8',
        shadowOpacity: 0,
        elevation: 0,
    },
    checkoutText: {
        fontFamily: 'Poppins_600SemiBold',
        fontSize: 16,
        color: '#ffffff',
    },
});