import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image, TextInput, Pressable, ActivityIndicator } from 'react-native';
import { useFonts, Poppins_400Regular, Poppins_500Medium, Poppins_600SemiBold } from '@expo-google-fonts/poppins';
import { Minus, Plus, Share2, Trash2, Scale } from 'lucide-react-native'; // Import Scale icon
import { useState, useEffect } from 'react';
import { getCartItems, createOrder } from '@/services/cartService'; // Assuming updateCartItem service exists or will be added
import Constants from 'expo-constants';
import Toast from 'react-native-toast-message';
import { useRouter } from 'expo-router';
import * as SecureStore from 'expo-secure-store';


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

    const BASE_URL = Constants?.expoConfig?.extra?.VITE_WEB_URL;

    const [fontsLoaded] = useFonts({
        Poppins_400Regular,
        Poppins_500Medium,
        Poppins_600SemiBold,
    });

    useEffect(() => {
        fetchCartItems();
    }, []);


    const fetchCartItems = async () => {
        try {
            const data: CartItem[] = await getCartItems();

           
            const processedItems: CartItemWithDisplay[] = data.map(item => {
                const isWeightUnit = item.productId.unit === 'kg' || item.productId.unit === 'g';
                const initialDisplayQuantity = isWeightUnit
                   
                    ? item.quantity / 1000 
                    : item.quantity; 

                return {
                    ...item,
                    displayQuantity: parseFloat(initialDisplayQuantity.toFixed(3)),
                     
                    is250gSelected: false,
                    is500gSelected: false,
                };
            });

            setItems(processedItems);
        } catch (error) {
            console.error('Failed to fetch cart items:', error);
            Toast.show({
                type: 'error',
                text1: 'Error',
                text2: 'Failed to load cart items',
            });
        }
    };

  
    const handleQuantityChange = (id: string, change: number) => {
        setItems(currentItems => {
            return currentItems.map(item => {
                if (item._id === id) {
                    const isWeightUnit = item.productId.unit === 'kg' || item.productId.unit === 'g';
                   
                    const increment = isWeightUnit ? 1 : 1; 
                    let newQuantity = item.displayQuantity + (change * increment);

                    if (isWeightUnit) {
                      
                         newQuantity = Math.max(0, parseFloat(newQuantity.toFixed(3)));
                        
                         if (newQuantity === 0) {
                            return { ...item, displayQuantity: newQuantity, is250gSelected: false, is500gSelected: false };
                         }
                         return { ...item, displayQuantity: newQuantity };
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
                          const isCurrentlySelected = weightInGrams === 250 ? item.is250gSelected : item.is500gSelected;
                          let newQuantity = item.displayQuantity;

                          if (isCurrentlySelected) {
                           
                             newQuantity = Math.max(0, parseFloat((item.displayQuantity - weightInKg).toFixed(3)));
                          } else {
                             
                             newQuantity = parseFloat((item.displayQuantity + weightInKg).toFixed(3));
                          }

                          
                           const newIs250gSelected = weightInGrams === 250 ? !isCurrentlySelected : item.is250gSelected;
                           const newIs500gSelected = weightInGrams === 500 ? !isCurrentlySelected : item.is500gSelected;

                           
                           if (newQuantity === 0) {
                               return {
                                   ...item,
                                   displayQuantity: 0,
                                   is250gSelected: false,
                                   is500gSelected: false
                               };
                           }


                         return {
                              ...item,
                             displayQuantity: newQuantity,
                              is250gSelected: newIs250gSelected,
                             is500gSelected: newIs500gSelected,
                          };
                     }
                    
                     return item;
                 }
                 return item;
             });
         });
         
     };


    const handleRemoveItem = (id: string) => {
    
        setItems(currentItems => currentItems.filter(item => item._id !== id));
      
        if (expandedItemId === id) {
            setExpandedItemId(null);
        }
      
    };

    const filteredItems = items.filter(item =>
        item.productId.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

  
    const calculateTotal = (): number => {
        return filteredItems.reduce(
            (sum, item) => {
                if (!item.productId || item.displayQuantity === undefined) {
                     console.warn("Skipping item in total calculation due to missing data:", item);
                     return sum; 
                }

                if (item.productId.unit === 'piece') {
                   
                    const quantityForCalculation = Math.max(1, item.displayQuantity); 
                    return sum + item.productId.price * quantityForCalculation;
                } else {
                  
                    const quantityIn500gUnits = item.displayQuantity / 0.5;
                  
                     if (item.displayQuantity <= 0) return sum; 

                    return sum + item.productId.price * quantityIn500gUnits;
                }
            },
            0
        );
    };

    // --- Checkout Logic ---
    const handleCheckout = async () => {
        console.log('Checkout process started');
        try {
            setIsLoading(true);
            console.log('Loading state set to true');

            // Retrieve customer ID
            const userString = await SecureStore.getItemAsync('user');
            const user = userString ? JSON.parse(userString) : null;
            const customerId = user?.id;
            console.log('Retrieved customerId:', customerId);

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
                    quantityToSend = Math.max(1, item.displayQuantity); 
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

            // Call the createOrder function
            console.log("order items", orderItems);
            const orderResponse: OrderResponse = await createOrder(orderItems, totalPrice);
            console.log('Order created successfully');

            // Show success toast message
            Toast.show({
                type: 'success',
                text1: 'Success',
                text2: 'Order placed successfully!',
            });

            // Clear cart locally and navigate
            setItems([]); // Clear local cart state after successful order
            router.push({ pathname: '/thank-you', params: { orderId: orderResponse.orderId } });
            console.log('Navigated to thank you page');

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
            console.log('Loading state set to false');
        }
    };


    if (!fontsLoaded) {
        return null; // Or a loading spinner
    }

    const total = calculateTotal();

    return (
        <View style={styles.container}>
            <ScrollView style={styles.scrollView}>
                <View style={styles.header}>
                    <Text style={styles.title}>Cart</Text>
                  
                    <TouchableOpacity style={styles.iconButton}>
                        <Share2 size={20} color="#64748b" />
                    </TouchableOpacity>
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
                        <Text style={styles.emptyCartText}>Your cart is empty!</Text>
                    ) : (
                        filteredItems.map((item , index) => (
                            <View key={index} style={styles.cartItem}>
                                <Image
                                    source={{ uri: `${BASE_URL}${item.productId.image}` }}
                                    style={styles.itemImage}
                                />
                                <View style={styles.itemDetails}>
                                    <View style={styles.itemHeader}>
                                        <Text style={styles.itemName} numberOfLines={2}>{item.productId.name}</Text>
                                        {/* Remove Item Button */}
                                        <TouchableOpacity
                                             style={styles.removeButton}
                                             onPress={() => handleRemoveItem(item._id)}
                                        >
                                            <Trash2 size={20} color="#ef4444" />
                                        </TouchableOpacity>
                                    </View>
                                    <View style={styles.priceQuantity}>
                                        <View>
                                             <Text style={styles.itemPrice}>
                                               Price: ₹{item.productId.price}
                                             </Text>
                                        </View>

                                        {/* --- Quantity Controls --- */}
                                       
                                            // Expanded Controls View
                                            <View style={styles.expandedQuantityControls}>
                                                 {/* 250g/500g buttons (only for weight units) */}
                                                 {(item.productId.unit === 'kg' || item.productId.unit === 'g') && (
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
                                                            {item.productId.unit === 'piece'
                                                                ? item.displayQuantity // Show piece count
                                                                : `${formatKg(item.displayQuantity)}`} {/* Show KG value */}
                                                            {(item.productId.unit === 'kg' || item.productId.unit === 'g') && <Text style={styles.kgUnit}>kg</Text>} {/* Add 'kg' unit */}
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
                        {/* Add other summary rows like subtotal, delivery, etc. if applicable */}
                        <View style={[styles.summaryRow, styles.totalRow]}>
                            <Text style={styles.totalLabel}>Total</Text>
                            {/* Ensure total is formatted with 2 decimal places */}
                            <Text style={styles.totalValue}>₹{total.toFixed(2)}</Text>
                        </View>
                    </View>
                )}
                 {filteredItems.length === 0 && (
                      // Optional: Add some padding below empty cart text if needed
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
                        disabled={isLoading || total <= 0} // Disable if loading or total is 0
                    >
                      <Text>
                        {isLoading ? (
                            <ActivityIndicator size="small" color="#ffffff" />
                        ) : (
                            <Text style={styles.checkoutText}>Proceed to Checkout</Text>
                        )} </Text>
                    </TouchableOpacity>
                </View>
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f8fafc',
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
    priceQuantity: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-end', // Align items at the bottom
        marginTop: 8, // Space above price/quantity row
    },
    itemPrice: {
        fontFamily: 'Poppins_600SemiBold',
        fontSize: 16, 
        color: '#22c55e',
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
          minWidth: 30, // Ensure tap area
          minHeight: 30,
         shadowColor: '#000',
         shadowOffset: { width: 0, height: 1 },
         shadowOpacity: 0.05,
         shadowRadius: 2,
         elevation: 1,
     },
     quantityButtonDisabled: {
         backgroundColor: '#e2e8f0', // Lighter background when disabled
          shadowOpacity: 0,
         elevation: 0,
     },
    quantity: {
        fontFamily: 'Poppins_500Medium',
        fontSize: 15, // Match item name font size
        color: '#1e293b',
        marginHorizontal: 12, // Reduced margin
    },
     kgUnit: { // Style for the 'kg' unit inside quantity
         fontFamily: "Poppins_400Regular",
         fontSize: 11,
         color: '#475569',
         marginLeft: 1,
     },

    // --- Expanded Quantity Controls (Visible when expanded) ---
    expandedQuantityControls: {
        flexDirection: 'column', // Stack buttons vertically
        alignItems: 'flex-end', // Align controls to the right
         borderRadius: 12,
         paddingVertical: 4, // Add some vertical padding if background is used
         paddingHorizontal: 8, // Add some horizontal padding
    },
    incrementSelectorRow: {
        flexDirection: 'row',
        marginBottom: 8, // Space between weight toggles and +/- row
        gap: 8, // Space between 250g and 500g buttons
    },
     // Reuse or adapt styles from ProductCard incrementButton
     incrementButton: {
         flexDirection: 'row', // Arrange icon and text horizontally
         alignItems: 'center',
         paddingVertical: 4, // Smaller padding for cart view
         paddingHorizontal: 10,
         borderRadius: 12, // Rounded corners
         borderWidth: 1,
         borderColor: '#cbd5e1',
         backgroundColor: '#f8fafc', // Light background
     },
     incrementButtonActive: { // Style for selected 250/500g buttons
         borderColor: '#4CAF50',
         backgroundColor: '#C8E6C9',
     },
     incrementButtonIcon: {
         marginRight: 4, // Space between icon and text
     },
     incrementButtonText: {
         fontFamily: "Poppins_500Medium",
         fontSize: 11, // Smaller font
         color: '#475569',
     },
     incrementButtonTextActive: { // Style for text in selected buttons
         color: '#388E3C',
     },

    quantitySelectorRow: {
        flexDirection: 'row',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#e2e8f0',
        borderRadius: 8,
        overflow: 'hidden',
    },
     // Reuse or adapt styles from ProductCard quantityControlButton
     quantityControlButton: {
         paddingVertical: 8, // Slightly less padding than ProductCard
         paddingHorizontal: 10,
         alignItems: 'center',
         justifyContent: 'center',
         minWidth: 36, // Ensure decent tap area
     },
    decrementButton: {
        borderRightWidth: 1,
        borderColor: '#e2e8f0',
    },
    quantityDisplay: {
         alignItems: 'center',
         justifyContent: 'center',
         paddingHorizontal: 12, // Padding inside the display area
     },
     quantityText: { // Style for the main number in expanded view
         fontFamily: "Poppins_600SemiBold",
         fontSize: 15, // Match item name font size
         color: '#1e293b',
     },
     incrementButtonQty: { // Style for the '+' button in expanded view
         borderLeftWidth: 1,
         borderColor: '#e2e8f0',
     },


    summary: {
        backgroundColor: '#ffffff',
        borderRadius: 16,
        marginHorizontal: 20, // Match item horizontal padding
        marginBottom: 16, // Space before footer or end of scroll
        padding: 20,
        shadowColor: "#94a3b8", // Add subtle shadow
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 3,
        elevation: 2,
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
        marginBottom: 10, // Reduced margin
    },
    totalRow: {
        marginTop: 10, // Reduced margin
        paddingTop: 10,
        borderTopWidth: 1,
        borderTopColor: '#f1f5f9',
    },
    totalLabel: {
        fontFamily: 'Poppins_600SemiBold',
        fontSize: 16,
        color: '#1e293b',
    },
    totalValue: {
        fontFamily: 'Poppins_600SemiBold',
        fontSize: 20,
        color: '#22c55e',
    },
    footer: {
        paddingHorizontal: 20, // Match item horizontal padding
        paddingTop: 12, // Padding above button
        paddingBottom: 20, // Padding below button
        backgroundColor: '#ffffff', // White background for footer
        borderTopWidth: 1,
        borderTopColor: '#f1f5f9',
    },
    checkoutButton: {
        backgroundColor: '#22c55e', // Green color
        paddingVertical: 14, // Adjusted padding
        borderRadius: 12, // Match other rounded elements
        alignItems: 'center',
        justifyContent: 'center',
    },
    checkoutButtonDisabled: {
        backgroundColor: '#94a3b8', // Grey color when disabled
    },
    checkoutText: {
        fontFamily: 'Poppins_600SemiBold',
        fontSize: 16,
        color: '#ffffff',
    },
     emptyCartText: {
         fontFamily: 'Poppins_600SemiBold',
         fontSize: 18,
         color: '#64748b', // Grey color for empty state
         textAlign: 'center',
         marginTop: 40, // More space from top
     },
});