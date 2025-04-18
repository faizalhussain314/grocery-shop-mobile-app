import { api } from "@/lib/axios";
import * as SecureStore from 'expo-secure-store';

export interface CartItem {
  id: string;
  productId: string;
  quantity: number;
  product: {
    name: string;
    price: number;
    image: string;
    unit: string;
  };
}

// Get cart items
export const getCartItems = async () => {
  try {
    const response = await api.get('/customer/cart');
    return response.data;
  } catch (error: any) {
    console.error('Error fetching cart items:', error.response?.data || error.message);
    throw new Error('Failed to fetch cart items');
  }
};

// Add an item to the cart
export const addToCart = async (productId: string, quantity: string) => {
  try {
  

    const payload = {
      productId,
      quantity: parseInt(quantity),
    };
    const response = await api.post('/customer/cart', payload);
    return response.data;
  } catch (error: any) {
    console.error('Error adding item to cart:', error.response?.data || error.message);
    throw new Error('Failed to add item to cart');
  }
};

// Create order
export const createOrder = async (items: Array<{ productId: string; quantity: number }>, totalPrice: number) => {
  try {
    const payload = {
      items: items.map(item => ({
        productId: item.productId,  // Extract the productId directly
        quantity: item.quantity      // Quantity as is
      })),
     
    };
    
    const response = await api.post('/customer/orders', payload);
    return response.data;
  } catch (error: any) {
    console.error('Error creating order:', error.response?.data || error.message);
    throw new Error('Failed to create order');
  }
};
