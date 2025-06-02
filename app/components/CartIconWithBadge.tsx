import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { ShoppingCart } from 'lucide-react-native';
import { Link } from 'expo-router';
import { useCartStore } from '@/store/cartStore';  // Adjust path

export default function CartIconWithBadge() {
  const { cartCount } = useCartStore();

  return (
    <Link href="/cart" asChild>
      <TouchableOpacity style={styles.iconButton}>
        <View>
          <ShoppingCart size={20} color="#64748b" />
          {cartCount > 0 && (
            <View style={styles.badgeContainer}>
              <Text style={styles.badgeText}>{cartCount}</Text>
            </View>
          )}
        </View>
      </TouchableOpacity>
    </Link>
  );
}

const styles = StyleSheet.create({
  iconButton: {
    // padding: 8,
  },
  badgeContainer: {
    position: 'absolute',
    right: -6,
    top: -4,
    backgroundColor: '#EF4444',
    borderRadius: 8,
    minWidth: 16,
    height: 16,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 4,
  },
  badgeText: {
    color: 'white',
    fontSize: 10,
    fontWeight: 'bold',
  },
});
