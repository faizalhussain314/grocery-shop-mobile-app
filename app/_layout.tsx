import { useEffect } from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useFrameworkReady } from '@/hooks/useFrameworkReady';
import { useAuthStore } from '../store/authStore';
import Toast from 'react-native-toast-message';
import { router, usePathname } from 'expo-router';
import store from '@/store/store';
import { Provider } from 'react-redux';
import { View } from 'lucide-react-native';

export default function RootLayout() {
  useFrameworkReady();
  const checkAuth = useAuthStore((state) => state.checkAuth);
  const isLoading = useAuthStore((state) => state.isLoading);
  const user = useAuthStore((state) => state.user);
  const pathname = usePathname();

  useEffect(() => {
    checkAuth();
  }, []);

  useEffect(() => {
    if (user && (pathname === '/login' || pathname === '/register')) {
      router.replace('/(tabs)');
    }
  }, [user, pathname]);

  if (isLoading) {
    return null;
  }

  return (
    <>
     <Provider store={store}>
     
<Toast />
      <Stack screenOptions={{ headerShown: false }}>
    
     
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="login" options={{ headerShown: false }} />
        <Stack.Screen name="register" options={{ headerShown: false }} />
        <Stack.Screen name="+not-found" options={{ headerShown: false }} />
      </Stack>
      <StatusBar style="auto" />
      </Provider>
    </>
  );
}