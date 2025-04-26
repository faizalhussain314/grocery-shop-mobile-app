import create from 'zustand';
import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';
import { api } from '../lib/axios';

interface AuthState {
  token: string | null;
  user: any | null;
  isLoading: boolean;
  login: (phoneNumber: string, password: string) => Promise<void>;
  register: (email: string, password: string, name: string) => Promise<void>;
  logout: () => Promise<void>;
  checkAuth: () => Promise<void>;
}

// Platform-specific storage implementation
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

export const useAuthStore = create<AuthState>((set) => ({
  token: null,
  user: null,
  isLoading: true,
  
  login: async (phoneNumber, password) => {
    set({ isLoading: true }); // Set loading state to true
    try {
      const response = await api.post('/auth/login', { phoneNumber, password });
      const { token, user } = response.data;
  
      await storage.setItem('token', token);
      await storage.setItem('user', JSON.stringify(user)); // Store user as string
      console.log("user:",user);
  
      set({ token, user, isLoading: false }); // Set state after successful login
    } catch (error) {
      set({ isLoading: false });
      throw error; // Optionally, handle error in UI
    }
  },
  
  register: async (email, password, name) => {
    set({ isLoading: true }); // Set loading state to true
    try {
      const response = await api.post('/auth/register', { email, password, name });
      const { token, user } = response.data;
  
      await storage.setItem('token', token);
      await storage.setItem('user', JSON.stringify(user)); // Store user as string
  
      set({ token, user, isLoading: false }); // Set state after successful registration
    } catch (error) {
      set({ isLoading: false });
      throw error; // Optionally, handle error in UI
    }
  },
  
  logout: async () => {
    try {
      await api.post('/auth/logout'); // optional, depending on backend
    } catch (error) {
      console.warn('Logout request failed (maybe expected):', error);
    } finally {
      await storage.removeItem('token');
      await storage.removeItem('user');
      set({ token: null, user: null });
    }
  },
  
  checkAuth: async () => {
    try {
      const token = await storage.getItem('token');
      const userStr = await storage.getItem('user');
      const user = userStr ? JSON.parse(userStr) : null;
  
      if (token && user) {
        // Optionally, you can validate token here with an API call
        const response = await api.post('/auth/validate-token', { token });
        if (response.data.valid) {
          set({ token, user, isLoading: false });
        } else {
          await storage.removeItem('token');
          await storage.removeItem('user');
          set({ token: null, user: null, isLoading: false });
        }
      } else {
        set({ isLoading: false });
      }
    } catch (error) {
      set({ isLoading: false });
      // console.error('Auth check error:', error);
    }
  },
}));


