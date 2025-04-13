import { useEffect } from 'react';
import { useRouter } from 'expo-router';
import { useAuthStore } from '../../store/authStore';
import { Tabs } from 'expo-router';
import { House, ShoppingBag, Logs, User, ShoppingBasket } from 'lucide-react-native';
import { Text } from 'react-native';

export default function TabLayout() {
  const router = useRouter();

  const { token, isLoading } = useAuthStore((state) => ({
    token: state.token,
    isLoading: state.isLoading,
  }));

  useEffect(() => {
    if (!isLoading && !token) {
      // Delay ensures router is fully hydrated, especially on web
      const timeout = setTimeout(() => {
        router.replace('/login');
      }, 0);
      return () => clearTimeout(timeout);
    }
  }, [isLoading, token]);

  if (isLoading) {
    return <Text>Loading...</Text>; // Optional fallback
  }

  try {
    return (
      <Tabs
        screenOptions={{
          headerShown: false,
          tabBarStyle: {
            backgroundColor: '#ffffff',
            borderTopWidth: 0,
            elevation: 0,
            height: 60,
            paddingBottom: 8,
          },
          tabBarActiveTintColor: '#22c55e',
          tabBarInactiveTintColor: '#64748b',
        }}>
        <Tabs.Screen
          name="index"
          options={{
            title: 'Home',
            tabBarIcon: ({ size, color }) => <House size={size} color={color} />,
          }}
        />
        <Tabs.Screen
          name="shop"
          options={{
            title: 'Shop',
            tabBarIcon: ({ size, color }) => <ShoppingBag size={size} color={color} />,
          }}
        />
        <Tabs.Screen
          name="favorites"
          options={{
            title: 'Orders',
            tabBarIcon: ({ size, color }) => <Logs size={size} color={color} />,
          }}
        />
        <Tabs.Screen
          name="cart"
          options={{
            title: 'Cart',
            tabBarIcon: ({ size, color }) => <ShoppingBasket size={size} color={color} />,
          }}
        />
        <Tabs.Screen
          name="account"
          options={{
            title: 'Account',
            tabBarIcon: ({ size, color }) => <User size={size} color={color} />,
          }}
        />
      </Tabs>
    );
  } catch (error) {
    console.error('TabLayout error:', error);
    return <Text>Error loading tabs</Text>;
  }
}
