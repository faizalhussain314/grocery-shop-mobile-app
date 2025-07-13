import { useEffect, useState } from 'react';
import { Stack, Slot, usePathname, router } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useAuthStore } from '../store/authStore';
import Toast from 'react-native-toast-message';
import { Provider } from 'react-redux';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import store from '@/store/store';

export default function RootLayout() {
  const checkAuth = useAuthStore((state) => state.checkAuth);
  const logout = useAuthStore((state) => state.logout);
  const { token, user } = useAuthStore();
  const pathname = usePathname();
  const [ready, setReady] = useState(false);

  useEffect(() => {
    checkAuth().finally(() => setReady(true));
  }, []);

  useEffect(() => {
    if (ready && token && user) {
      // Check if user role is not customer
      if (user.role !== 'customer') {
        // Show error toast
        Toast.show({
          type: 'error',
          text1: 'Access Denied',
          text2: 'Only customers are allowed to access this app.',
        });
        
        // Logout and redirect to login
        logout();
        router.replace('/login');
        return;
      }
      
      // If user is customer and on login/register page, redirect to tabs
      if (pathname === '/login' || pathname === '/register') {
        router.replace('/(tabs)');
      }
    }
  }, [ready, token, user, pathname]);

  return (
    <SafeAreaProvider>
      <Provider store={store}>
        <StatusBar style="dark" backgroundColor="#ffffff" />
        <Toast />
        <Slot />
      </Provider>
    </SafeAreaProvider>
  );
}