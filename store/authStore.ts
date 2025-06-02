import create from 'zustand';
import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';
import { api } from '../lib/axios';

interface AuthState {
  token: string | null;
  user: any | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (phoneNumber: string, password: string) => Promise<void>;
  register: (email: string, password: string, name: string) => Promise<void>;
  logout: () => Promise<void>;
  checkAuth: () => Promise<void>;
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

export const useAuthStore = create<AuthState>((set) => ({
  token: null,
  user: null,
  isAuthenticated: false,
  isLoading: true,

 login: async (phoneNumber, password) => {
  set({ isLoading: true });
  try {
    const response = await api.post('/auth/login', { phoneNumber, password });

    const { token, user } = response.data;

    if (!token || !user) throw new Error('Invalid response');

    await storage.setItem('token', token);
    await storage.setItem('user', JSON.stringify(user));

    set({ token, user, isLoading: false });
  } catch (error: any) {
    set({ isLoading: false });
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

      set({ token, user, isAuthenticated: true, isLoading: false });
    } catch (_) {
      set({ token: null, user: null, isAuthenticated: false, isLoading: false });
    }
  }
}));
