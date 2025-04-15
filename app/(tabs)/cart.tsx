import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image, TextInput } from 'react-native';
import { useFonts, Poppins_400Regular, Poppins_500Medium, Poppins_600SemiBold } from '@expo-google-fonts/poppins';
import { Minus, Plus, Share2, Trash2 } from 'lucide-react-native';
import { Link } from 'expo-router';
import { useState } from 'react';

const cartItems = [
  {
    id: 1,
    name: 'Farm Fresh Produce',
    image: 'https://images.unsplash.com/photo-1610348725531-843dff563e2c?q=80&w=800',
    price: 10.00,
    quantity: 1,
    deliveryStatus: 'Delivered'
  },
  {
    id: 2,
    name: 'Tender Fresh Meats',
    image: 'https://images.unsplash.com/photo-1607623814075-e51df1bdc82f?q=80&w=800',
    price: 15.00,
    quantity: 2,
    deliveryStatus: 'Delivered'
  },
];

export default function CartScreen() {
  const [items, setItems] = useState(cartItems);
  const [searchQuery, setSearchQuery] = useState('');

  const [fontsLoaded] = useFonts({
    Poppins_400Regular,
    Poppins_500Medium,
    Poppins_600SemiBold,
  });

  if (!fontsLoaded) {
    return null;
  }

  const handleQuantityChange = (id: number, change: number) => {
    setItems(currentItems =>
      currentItems.map(item =>
        item.id === id
          ? { ...item, quantity: Math.max(1, Math.min(10, item.quantity + change)) }
          : item
      )
    );
  };

  const handleRemoveItem = (id: number) => {
    setItems(currentItems => currentItems.filter(item => item.id !== id));
  };

  const filteredItems = items.filter(item =>
    item.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const subtotal = filteredItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const deliveryFee = 2.00;
  const discount = subtotal * 0.05; // 5% discount
  const total = subtotal + deliveryFee - discount;

  return (
    <View style={styles.container}>
      <ScrollView style={styles.scrollView}>
        <View style={styles.header}>
          <Text style={styles.title}>Cart</Text>
          <TouchableOpacity style={styles.iconButton}>
            <Share2 size={20} color="#64748b" />
          </TouchableOpacity>
        </View>

        <View style={styles.searchContainer}>
          <TextInput
            style={styles.searchInput}
            placeholder="Search items..."
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholderTextColor="#94a3b8"
          />
        </View>

        <View style={styles.cartItems}>
          {filteredItems.map((item) => (
            <View key={item.id} style={styles.cartItem}>
              <Image source={{ uri: item.image }} style={styles.itemImage} />
              <View style={styles.itemDetails}>
                <View style={styles.itemHeader}>
                  <Text style={styles.itemName}>{item.name}</Text>
                  <TouchableOpacity onPress={() => handleRemoveItem(item.id)}>
                    <Trash2 size={20} color="#ef4444" />
                  </TouchableOpacity>
                </View>
                <Text style={styles.deliveryStatus}>
                  🚚 {item.deliveryStatus}
                </Text>
                <View style={styles.priceQuantity}>
                  <Text style={styles.itemPrice}>₹{(item.price * item.quantity).toFixed(2)}</Text>
                  <View style={styles.quantityControls}>
                    <TouchableOpacity 
                      style={[styles.quantityButton, item.quantity <= 1 && styles.quantityButtonDisabled]}
                      onPress={() => handleQuantityChange(item.id, -1)}
                      disabled={item.quantity <= 1}
                    >
                      <Minus size={16} color={item.quantity <= 1 ? "#94a3b8" : "#64748b"} />
                    </TouchableOpacity>
                    <Text style={styles.quantity}>{item.quantity}</Text>
                    <TouchableOpacity 
                      style={[styles.quantityButton, item.quantity >= 10 && styles.quantityButtonDisabled]}
                      onPress={() => handleQuantityChange(item.id, 1)}
                      disabled={item.quantity >= 10}
                    >
                      <Plus size={16} color={item.quantity >= 10 ? "#94a3b8" : "#64748b"} />
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
            </View>
          ))}
        </View>

        <View style={styles.summary}>
          <Text style={styles.summaryTitle}>Order Summary</Text>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Subtotal</Text>
            <Text style={styles.summaryValue}>₹{subtotal.toFixed(2)}</Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Delivery Fee</Text>
            <Text style={styles.summaryValue}>₹{deliveryFee.toFixed(2)}</Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Discount (5%)</Text>
            <Text style={[styles.summaryValue, styles.discountText]}>-₹{discount.toFixed(2)}</Text>
          </View>
          <View style={[styles.summaryRow, styles.totalRow]}>
            <Text style={styles.totalLabel}>Total</Text>
            <Text style={styles.totalValue}>₹{total.toFixed(2)}</Text>
          </View>
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <Link href="/checkout" asChild>
          <TouchableOpacity style={styles.checkoutButton}>
            <Text style={styles.checkoutText}>Proceed to Checkout</Text>
          </TouchableOpacity>
        </Link>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  scrollView: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 20,
    backgroundColor: '#ffffff',
  },
  title: {
    fontFamily: 'Poppins_600SemiBold',
    fontSize: 24,
    color: '#1e293b',
  },
  iconButton: {
    padding: 8,
    backgroundColor: '#f1f5f9',
    borderRadius: 12,
  },
  searchContainer: {
    padding: 20,
    paddingTop: 0,
    backgroundColor: '#ffffff',
  },
  searchInput: {
    fontFamily: 'Poppins_400Regular',
    fontSize: 16,
    color: '#1e293b',
    backgroundColor: '#f1f5f9',
    padding: 12,
    borderRadius: 12,
  },
  cartItems: {
    padding: 20,
  },
  cartItem: {
    flexDirection: 'row',
    backgroundColor: '#ffffff',
    borderRadius: 16,
    marginBottom: 16,
    overflow: 'hidden',
  },
  itemImage: {
    width: 100,
    height: 100,
  },
  itemDetails: {
    flex: 1,
    padding: 12,
  },
  itemHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 4,
  },
  itemName: {
    fontFamily: 'Poppins_500Medium',
    fontSize: 16,
    color: '#1e293b',
    flex: 1,
    marginRight: 8,
  },
  deliveryStatus: {
    fontFamily: 'Poppins_400Regular',
    fontSize: 14,
    color: '#64748b',
    marginBottom: 8,
  },
  priceQuantity: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  itemPrice: {
    fontFamily: 'Poppins_600SemiBold',
    fontSize: 18,
    color: '#22c55e',
  },
  quantityControls: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f1f5f9',
    borderRadius: 12,
    padding: 4,
  },
  quantityButton: {
    padding: 8,
    backgroundColor: '#ffffff',
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  quantityButtonDisabled: {
    backgroundColor: '#f1f5f9',
    shadowOpacity: 0,
    elevation: 0,
  },
  quantity: {
    fontFamily: 'Poppins_500Medium',
    fontSize: 16,
    color: '#1e293b',
    marginHorizontal: 16,
  },
  summary: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    margin: 20,
    padding: 20,
  },
  summaryTitle: {
    fontFamily: 'Poppins_600SemiBold',
    fontSize: 18,
    color: '#1e293b',
    marginBottom: 16,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  summaryLabel: {
    fontFamily: 'Poppins_400Regular',
    fontSize: 14,
    color: '#64748b',
  },
  summaryValue: {
    fontFamily: 'Poppins_500Medium',
    fontSize: 14,
    color: '#1e293b',
  },
  discountText: {
    color: '#22c55e',
  },
  totalRow: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#f1f5f9',
  },
  totalLabel: {
    fontFamily: 'Poppins_600SemiBold',
    fontSize: 16,
    color: '#1e293b',
  },
  totalValue: {
    fontFamily: 'Poppins_600SemiBold',
    fontSize: 20,
    color: '#22c55e',
  },
  footer: {
    padding: 20,
    backgroundColor: '#ffffff',
    borderTopWidth: 1,
    borderTopColor: '#f1f5f9',
  },
  checkoutButton: {
    backgroundColor: '#22c55e',
    paddingVertical: 16,
    borderRadius: 16,
    alignItems: 'center',
  },
  checkoutText: {
    fontFamily: 'Poppins_600SemiBold',
    fontSize: 16,
    color: '#ffffff',
  },
});