import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image, TextInput } from 'react-native';
import { useFonts, Poppins_400Regular, Poppins_500Medium, Poppins_600SemiBold } from '@expo-google-fonts/poppins';
import { Minus, Plus, Share2, Trash2 } from 'lucide-react-native';
import { useState, useEffect } from 'react';
import { getCartItems, createOrder } from '@/services/cartService';
import Constants from 'expo-constants';
import Toast from 'react-native-toast-message';
import { useRouter } from 'expo-router';  
import * as SecureStore from 'expo-secure-store'; 



// Define the types
interface Product {
  id: string;
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

export default function CartScreen() {
  const [items, setItems] = useState<CartItem[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();  // Initialize the router

  const BASE_URL = Constants?.expoConfig?.extra?.VITE_WEB_URL ;

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
      const data = await getCartItems();
      setItems(data);
    } catch (error) {
      console.error('Failed to fetch cart items:', error);
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: 'Failed to load cart items',
      });
    }
  };

  const handleQuantityChange = async (id: string, change: number) => {
    const updatedItems = items.map(item =>
      item._id === id
        ? { ...item, quantity: Math.max(1, Math.min(10, item.quantity + change)) }
        : item
    );
    setItems(updatedItems);
  };

  const handleRemoveItem = (id: string) => {
    setItems(currentItems => currentItems.filter(item => item._id !== id));
  };

  const filteredItems = items.filter(item =>
    item.productId.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const calculateTotal = (): number => {
    return filteredItems.reduce(
      (sum, item) => sum + item.productId.price * item.quantity,
      0
    );
  };

  const handleCheckout = async () => {
    console.log('Checkout process started'); // Log when the function is triggered
    try {
      setIsLoading(true);
      console.log('Loading state set to true');
    
      // Retrieve customer ID from SecureStore or context (assuming it's stored under 'user')
      const userString = await SecureStore.getItemAsync('user');
    
      // Parse the user string into an object
      const user = userString ? JSON.parse(userString) : null;
      const customerId = user?.id;
      console.log('Retrieved customerId:', customerId);  // Log the customer ID
      
      if (!customerId) {
        console.error("Customer is not authenticated");
        throw new Error("Customer is not authenticated");
      }
    
      // Prepare the order items in the required structure
      const orderItems = items.map(item => ({
        productId: item.productId.id,  // Extract productId from the item
        quantity: item.quantity,       // Keep the quantity
      }));
      console.log('Prepared orderItems:', orderItems); // Log the items being sent
    
      // Calculate the total price
      const totalPrice = calculateTotal();
      console.log('Total price calculated:', totalPrice); // Log the total price
    
      // Call the createOrder function with the correct arguments
      await createOrder(orderItems, totalPrice);
      console.log('Order created successfully'); // Log success after creating the order
    
      // Show a success toast message
      Toast.show({
        type: 'success',
        text1: 'Success',
        text2: 'Order placed successfully!',
      });
    
      // Navigate to the thank you page
      router.push('/thank-you');
      console.log('Navigated to thank you page'); // Log navigation action
    } catch (error: unknown) {
      // Type guard to check if the error is an instance of Error
      if (error instanceof Error) {
        console.error('Error during checkout:', error.message); // Log the error message
        Toast.show({
          type: 'error',
          text1: 'Error',
          text2: error.message || 'Failed to place order',
        });
      } else {
        console.error('Unknown error during checkout'); // Log an unknown error
        Toast.show({
          type: 'error',
          text1: 'Error',
          text2: 'An unknown error occurred.',
        });
      }
    } finally {
      setIsLoading(false);
      console.log('Loading state set to false'); // Log when loading state is finished
    }
  };
  
  
  
  
  
  
  

  if (!fontsLoaded) {
    return null;
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
          {/* Check if the cart is empty */}
          {filteredItems.length === 0 ? (
            <Text style={styles.emptyCartText}>Your cart is empty!</Text>
          ) : (
            filteredItems.map((item) => (
              <View key={item._id} style={styles.cartItem}>
                <Image
                  source={{ uri: `${BASE_URL}${item.productId.image}` }}
                  style={styles.itemImage}
                />
                <View style={styles.itemDetails}>
                  <View style={styles.itemHeader}>
                    <Text style={styles.itemName}>{item.productId.name}</Text>
                    <TouchableOpacity onPress={() => handleRemoveItem(item._id)}>
                      <Trash2 size={20} color="#ef4444" />
                    </TouchableOpacity>
                  </View>
                  <View style={styles.priceQuantity}>
                    <Text style={styles.itemPrice}>
                      ₹{(item.productId.price * item.quantity).toFixed(2)}
                    </Text>
                    <View style={styles.quantityControls}>
                      <TouchableOpacity
                        style={[
                          styles.quantityButton,
                          item.quantity <= 1 && styles.quantityButtonDisabled,
                        ]}
                        onPress={() => handleQuantityChange(item._id, -1)}
                        disabled={item.quantity <= 1}
                      >
                        <Minus size={16} color={item.quantity <= 1 ? '#94a3b8' : '#64748b'} />
                      </TouchableOpacity>
                      <Text style={styles.quantity}>{item.quantity}</Text>
                      <TouchableOpacity
                        style={[
                          styles.quantityButton,
                          item.quantity >= 10 && styles.quantityButtonDisabled,
                        ]}
                        onPress={() => handleQuantityChange(item._id, 1)}
                        disabled={item.quantity >= 10}
                      >
                        <Plus size={16} color={item.quantity >= 10 ? '#94a3b8' : '#64748b'} />
                      </TouchableOpacity>
                    </View>
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
            <View style={[styles.summaryRow, styles.totalRow]}>
              <Text style={styles.totalLabel}>Total</Text>
              <Text style={styles.totalValue}>₹{total.toFixed(2)}</Text>
            </View>
          </View>
        )}
      </ScrollView>
      {filteredItems.length > 0 && (
      <View style={styles.footer}>
        <TouchableOpacity
          style={[styles.checkoutButton, isLoading && styles.checkoutButtonDisabled]}
          onPress={handleCheckout}
          disabled={isLoading || filteredItems.length === 0}
        >
          <Text style={styles.checkoutText}>
            {isLoading ? 'Processing...' : 'Proceed to Checkout'}
          </Text>
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
    paddingTop: 60,
    paddingBottom: 20,
    backgroundColor: '#ffffff',
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
  },
  searchContainer: {
    padding: 20,
    paddingTop: 0,
    backgroundColor: '#ffffff',
  },
  searchInput: {
    fontFamily: 'Poppins_400Regular',
    fontSize: 16,
    color: '#1e293b',
    backgroundColor: '#f1f5f9',
    padding: 12,
    borderRadius: 12,
  },
  cartItems: {
    padding: 20,
  },
  cartItem: {
    flexDirection: 'row',
    backgroundColor: '#ffffff',
    borderRadius: 16,
    marginBottom: 16,
    overflow: 'hidden',
  },
  itemImage: {
    width: 100,
    height: 100,
  },
  itemDetails: {
    flex: 1,
    padding: 12,
  },
  itemHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 4,
  },
  itemName: {
    fontFamily: 'Poppins_500Medium',
    fontSize: 16,
    color: '#1e293b',
    flex: 1,
    marginRight: 8,
  },
  priceQuantity: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  itemPrice: {
    fontFamily: 'Poppins_600SemiBold',
    fontSize: 18,
    color: '#22c55e',
  },
  quantityControls: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f1f5f9',
    borderRadius: 12,
    padding: 4,
  },
  quantityButton: {
    padding: 8,
    backgroundColor: '#ffffff',
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  quantityButtonDisabled: {
    backgroundColor: '#f1f5f9',
    shadowOpacity: 0,
    elevation: 0,
  },
  quantity: {
    fontFamily: 'Poppins_500Medium',
    fontSize: 16,
    color: '#1e293b',
    marginHorizontal: 16,
  },
  summary: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    margin: 20,
    padding: 20,
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
    marginBottom: 12,
  },
  totalRow: {
    marginTop: 12,
    paddingTop: 12,
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
    padding: 20,
    backgroundColor: '#ffffff',
    borderTopWidth: 1,
    borderTopColor: '#f1f5f9',
  },
  checkoutButton: {
    backgroundColor: '#22c55e',
    paddingVertical: 16,
    borderRadius: 16,
    alignItems: 'center',
  },
  checkoutButtonDisabled: {
    backgroundColor: '#94a3b8',
  },
  checkoutText: {
    fontFamily: 'Poppins_600SemiBold',
    fontSize: 16,
    color: '#ffffff',
  },
  emptyCartText: {
    fontFamily: 'Poppins_600SemiBold',
    fontSize: 18,
    color: '#1e293b',
    textAlign: 'center',
    marginTop: 20,
  },
});
