import { Tabs } from 'expo-router';
import { House, ShoppingBag, Logs, User , ShoppingBasket } from 'lucide-react-native';

export default function TabLayout() {
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
}