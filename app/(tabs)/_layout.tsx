import { router, Tabs } from 'expo-router';
import { House, ShoppingBag, Logs, User, ShoppingBasket } from 'lucide-react-native';
import { useCartStore } from '@/store/cartStore';
import { useAuthStore } from '@/store/authStore';
import { useEffect } from 'react';

export default function TabLayout() {
  const { cartCount } = useCartStore();
 const { token, user, isLoading } = useAuthStore();

useEffect(() => {
  if (!isLoading && (!token || !user)) {
    // Add a slight delay to let layout finish mounting
    setTimeout(() => {
      router.replace('/login');
    }, 0);
  }
}, [isLoading, token, user]);


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
          borderRadius: 25,
        },
        tabBarActiveTintColor: '#AC6CFF',
        tabBarInactiveTintColor: '#64748b',
      }}
    >
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
          tabBarBadge: cartCount > 0 ? cartCount : undefined,
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
}
