
import { api } from '@/lib/axios';

export interface OrderItem {
  productId: {
    _id: string;
    name: string;
    image: string;
    price: number;
    unit: string;
  };
  quantity: number;
}

export interface Order {
  _id: string;
  orderId: string;
  status: string;
  items: OrderItem[];
  totalPrice: number;
  createdAt: string;
}

// Get all customer orders
export const getOrders = async (): Promise<Order[]> => {
  try {
    const response = await api.get('/customer/orders');
    return response.data;
  } catch (error: any) {
    console.error('Error fetching orders:', error.response?.data || error.message);
    throw new Error('Failed to fetch orders');
  }
};

// Get a single order by ID
export const getOrderById = async (orderId: string): Promise<Order> => {
  try {
    const response = await api.get(`/customer/orders/${orderId}`);
    return response.data;
  } catch (error: any) {
    console.error('Error fetching order:', error.response?.data || error.message);
    throw new Error('Failed to fetch order');
  }
};



