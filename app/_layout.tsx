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
  const { token, user } = useAuthStore();
  const pathname = usePathname();
  const [ready, setReady] = useState(false);

  useEffect(() => {
    checkAuth().finally(() => setReady(true));
  }, []);

  useEffect(() => {
    if (
      ready &&
      token &&
      user &&
      (pathname === '/login' || pathname === '/register')
    ) {
      router.replace('/(tabs)');
    }
  }, [ready, token, user, pathname]);

  return (
    <SafeAreaProvider>
      <Provider store={store}>
        <Toast />
        <StatusBar style="auto" />
        <Slot />
      </Provider>
    </SafeAreaProvider>
  );
}

