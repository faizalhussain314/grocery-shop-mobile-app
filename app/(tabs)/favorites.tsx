import { View, Text, StyleSheet, FlatList, TouchableOpacity, Image } from 'react-native';
import { useFonts, Poppins_400Regular, Poppins_500Medium, Poppins_600SemiBold } from '@expo-google-fonts/poppins';
import { Package, ChevronRight } from 'lucide-react-native';

const orders = [
  {
    id: '1',
    date: '2024-02-20',
    status: 'Delivered',
    items: [
      { name: 'Fresh Tomatoes', quantity: '2 kg' },
      { name: 'Organic Potatoes', quantity: '1 kg' },
      { name: 'Red Onions', quantity: '500g' }
    ],
    total: '₹250',
    deliveryTime: '6:00 AM - 7:00 AM',
    trackingNumber: 'ORD123456789'
  },
  {
    id: '2',
    date: '2024-02-19',
    status: 'Processing',
    items: [
      { name: 'Organic Chicken', quantity: '1 kg' },
      { name: 'Fresh Spinach', quantity: '250g' }
    ],
    total: '₹450',
    deliveryTime: '6:00 AM - 7:00 AM',
    trackingNumber: 'ORD987654321'
  }
];

const getStatusColor = (status: string) => {
  switch (status.toLowerCase()) {
    case 'delivered':
      return '#22c55e';
    case 'processing':
      return '#eab308';
    case 'cancelled':
      return '#ef4444';
    default:
      return '#64748b';
  }
};

export default function OrdersScreen() {
  const [fontsLoaded] = useFonts({
    Poppins_400Regular,
    Poppins_500Medium,
    Poppins_600SemiBold,
  });

  if (!fontsLoaded) {
    return null;
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>My Orders</Text>
      </View>

      <FlatList
        data={orders}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        renderItem={({ item }) => (
          <TouchableOpacity style={styles.orderCard}>
            <View style={styles.orderHeader}>
              <View style={styles.orderInfo}>
                <Text style={styles.orderDate}>{item.date}</Text>
                <Text style={styles.trackingNumber}>{item.trackingNumber}</Text>
              </View>
              <View style={[styles.statusBadge, { backgroundColor: `${getStatusColor(item.status)}15` }]}>
                <Text style={[styles.statusText, { color: getStatusColor(item.status) }]}>{item.status}</Text>
              </View>
            </View>

            <View style={styles.itemsList}>
              {item.items.map((orderItem, index) => (
                <View key={index} style={styles.orderItem}>
                  <Package size={16} color="#64748b" />
                  <Text style={styles.itemText}>
                    {orderItem.quantity} × {orderItem.name}
                  </Text>
                </View>
              ))}
            </View>

            <View style={styles.orderFooter}>
              <View>
                <Text style={styles.deliveryLabel}>Delivery Time</Text>
                <Text style={styles.deliveryTime}>{item.deliveryTime}</Text>
              </View>
              <View style={styles.totalContainer}>
                <Text style={styles.totalLabel}>Total</Text>
                <Text style={styles.totalAmount}>{item.total}</Text>
              </View>
            </View>
{/* 
            <TouchableOpacity style={styles.trackButton}>
              <Text style={styles.trackButtonText}>Track Order</Text>
              <ChevronRight size={20} color="#22c55e" />
            </TouchableOpacity> */}
          </TouchableOpacity>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  header: {
    paddingTop: 60,
    paddingHorizontal: 20,
    paddingBottom: 20,
    backgroundColor: '#ffffff',
  },
  title: {
    fontFamily: 'Poppins_600SemiBold',
    fontSize: 24,
    color: '#1e293b',
  },
  listContent: {
    padding: 20,
  },
  orderCard: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  orderHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  orderInfo: {
    flex: 1,
  },
  orderDate: {
    fontFamily: 'Poppins_500Medium',
    fontSize: 16,
    color: '#1e293b',
    marginBottom: 4,
  },
  trackingNumber: {
    fontFamily: 'Poppins_400Regular',
    fontSize: 14,
    color: '#64748b',
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  statusText: {
    fontFamily: 'Poppins_500Medium',
    fontSize: 14,
  },
  itemsList: {
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: '#f1f5f9',
    paddingVertical: 12,
    gap: 8,
  },
  orderItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  itemText: {
    fontFamily: 'Poppins_400Regular',
    fontSize: 14,
    color: '#1e293b',
  },
  orderFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
  },
  deliveryLabel: {
    fontFamily: 'Poppins_400Regular',
    fontSize: 12,
    color: '#64748b',
    marginBottom: 4,
  },
  deliveryTime: {
    fontFamily: 'Poppins_500Medium',
    fontSize: 14,
    color: '#1e293b',
  },
  totalContainer: {
    alignItems: 'flex-end',
  },
  totalLabel: {
    fontFamily: 'Poppins_400Regular',
    fontSize: 12,
    color: '#64748b',
    marginBottom: 4,
  },
  totalAmount: {
    fontFamily: 'Poppins_600SemiBold',
    fontSize: 18,
    color: '#22c55e',
  },
  trackButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f1f5f9',
    paddingVertical: 12,
    borderRadius: 12,
    marginTop: 12,
  },
  trackButtonText: {
    fontFamily: 'Poppins_500Medium',
    fontSize: 14,
    color: '#22c55e',
    marginRight: 4,
  },
});