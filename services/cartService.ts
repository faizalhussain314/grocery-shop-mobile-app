import { api } from "@/lib/axios";
import * as SecureStore from 'expo-secure-store';
import Constants from 'expo-constants';


// Add an item to the cart
export const addToCart = async (productId: string, quantity: string) => {
  try {
    const token = await SecureStore.getItemAsync('token');
    console.log('Auth Token:', token);
    

    const payload = {
      productId,
      quantity: parseFloat(quantity), // Send number, if backend expects number
    };
    console.log("Payload being sent to cart:", payload);

    const response = await api.post('/customer/cart', payload);
    return response.data;
  } catch (error: any) {
    console.error('Error adding item to cart:', error.response?.data || error.message);
    throw new Error('Failed to add item to cart');
  }
};

