import { api } from "@/lib/axios";


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
      productId:productId,
      quantity: parseInt(quantity),
    };
    const response = await api.post('/customer/cart', payload);
    return response.data;
  } catch (error: any) {
    console.error('Error adding item to cart:', error.response?.data || error.message);
    throw new Error('Failed to add item to cart');
  }
};


export const createOrder = async (items: Array<{ productId: string; quantity: number }>, totalPrice: number) => {
  try {
    const payload = {
      items: items.map(item => ({
        productId: item.productId,  
        quantity: item.quantity     
      })),
     
    };
    
    const response = await api.post('/customer/orders', payload);
    return response.data;
  } catch (error: any) {
    console.error('Error creating order:', error.response?.data || error.message);
    throw new Error('Failed to create order');
  }
};


export const deleteCartItem = async (cartItemId: string): Promise<void> => {
  try {
    
    const response = await api.delete(`/customer/cart/${cartItemId}`);

    
    console.log(`Cart item ${cartItemId} deleted successfully.`);

   
  } catch (error) {
    console.error(`Error deleting cart item ${cartItemId}:`, error);
   
    throw error;
  }
};
