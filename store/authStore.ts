import create from 'zustand';
import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';
import { api } from '../lib/axios';

interface AuthState {
  token: string | null;
  user: any | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (phoneNumber: string, password: string) => Promise<User | undefined>;
  register: (email: string, password: string, name: string) => Promise<void>;
  logout: () => Promise<void>;
  checkAuth: () => Promise<void>;
   updateUser: (updatedFields: Partial<User>) => Promise<void>;
}

export interface User {
  id: string;
  name: string;
  email: string;
  phoneNumber: string;
  role: 'customer' | 'vendor';
  isActive: boolean;
  address: string;
  vendorId?: string;
  isVeg?: boolean;
}

const storage = {
  setItem: async (key: string, value: string): Promise<void> => {
    if (Platform.OS === 'web') {
      localStorage.setItem(key, value);
      return;
    }
    await SecureStore.setItemAsync(key, value);
  },
  getItem: async (key: string): Promise<string | null> => {
    if (Platform.OS === 'web') {
      return localStorage.getItem(key);
    }
    return SecureStore.getItemAsync(key);
  },
  removeItem: async (key: string): Promise<void> => {
    if (Platform.OS === 'web') {
      localStorage.removeItem(key);
      return;
    }
    await SecureStore.deleteItemAsync(key);
  }
};

export const useAuthStore = create<AuthState>((set, get) => ({
  token: null,
  user: null,
  isAuthenticated: false,
  isLoading: true,

 login: async (phoneNumber, password) => {
  set({ isLoading: true });
  try {
    const response = await api.post('/auth/login', { phoneNumber, password });
    
    console.log("response", response.data);
    
    const { token, user } = response.data;
    
    if (!token || !user) throw new Error('Invalid response');
    
    // Check if user role is customer before storing data
    if (user.role !== 'customer') {
      set({ isLoading: false });
      throw new Error('Only customers are allowed to log in.');
    }
    
    await storage.setItem('token', token);
    await storage.setItem('user', JSON.stringify(user));
    
    set({ token, user, isAuthenticated: true, isLoading: false });
    return user;
    
  } catch (error: any) {
    set({ isLoading: false });
    
    // If it's a role-based error, throw it as is
    if (error.message === 'Only customers are allowed to log in.') {
      throw error;
    }
    
    throw new Error(error?.response?.data?.message || 'Login failed');
  }
}
,

  register: async (email, password, name) => {
    set({ isLoading: true });
    try {
      const response = await api.post('/auth/register', { email, password, name });
      const { token, user } = response.data;

     

      await storage.setItem('token', token);
      await storage.setItem('user', JSON.stringify(user));
      

      set({ token, user, isAuthenticated: true, isLoading: false });
    } catch (error) {
      set({ isAuthenticated: false, isLoading: false });
      throw error;
    }
  },

  logout: async () => {
    try {
      await api.post('/auth/logout');
    } catch (_) {}
    await storage.removeItem('token');
    await storage.removeItem('user');
    set({ token: null, user: null, isAuthenticated: false });
  },

checkAuth: async () => {
  try {
    const token = await storage.getItem('token');
    const userStr = await storage.getItem('user');
    const user = userStr ? JSON.parse(userStr) : null;

    if (!token || !user) {
      await storage.removeItem('token');
      await storage.removeItem('user');
      set({ token: null, user: null, isAuthenticated: false, isLoading: false });
      return;
    }

    // Check if user role is customer
    if (user.role !== 'customer') {
      // Clear stored data for non-customer users
      await storage.removeItem('token');
      await storage.removeItem('user');
      set({ token: null, user: null, isAuthenticated: false, isLoading: false });
      return;
    }

    set({ token, user, isAuthenticated: true, isLoading: false });
  } catch (_) {
    set({ token: null, user: null, isAuthenticated: false, isLoading: false });
  }
},

   updateUser: async (updatedFields: Partial<User>) => {
  const { user } = get();
  if (!user) return;

  const updatedUser: User = { ...user, ...updatedFields };

  await storage.setItem('user', JSON.stringify(updatedUser));
  set({ user: updatedUser });
}
}));
