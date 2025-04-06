import { api } from '../lib/axios';

export const fetchDeliveries = async () => {
    try {
      const response = await api.get('/customer/addresses');
      return response.data;
    } catch (error) {
      console.error('Failed to fetch deliveries:', error);
      return null;
    } 
  };