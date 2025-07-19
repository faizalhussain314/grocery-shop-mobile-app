import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
} from 'react-native';
import { useEffect, useState } from 'react';
import {
  useFonts,
  Poppins_400Regular,
  Poppins_500Medium,
  Poppins_600SemiBold,
} from '@expo-google-fonts/poppins';
import { Package } from 'lucide-react-native';
import { getOrders, Order } from '@/services/orderService';

const getStatusColor = (status: string) => {
  switch (status.toLowerCase()) {
    case "placed":
      return "#3b82f6"; 
    case "packing":
      return "#6366f1"; 
    case "ready":
      return "#14b8a6"; 
    case "dispatch": 
      return "#f97316"; 
    case "delivered":
      return "#9747FF"; 
    case "collected":
      return "#ffb700"; 
    case "completed":
      return "#3dff40";
    default:
      return "#6b7280"; 
  }
};

export default function OrdersScreen() {
  const [fontsLoaded] = useFonts({
    Poppins_400Regular,
    Poppins_500Medium,
    Poppins_600SemiBold,
  });

  const [orders, setOrders] = useState<Order[]>([]);
  const [refreshing, setRefreshing] = useState(false);

  const fetchOrders = async () => {
    try {
      const data = await getOrders();
      setOrders(data);
    } catch (error) {
      console.error(error);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchOrders();
    setRefreshing(false);
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  if (!fontsLoaded) return null;

  // Empty state component
  const EmptyOrdersComponent = () => (
    <View style={styles.emptyContainer}>
      <Package size={64} color="#cbd5e1" />
      <Text style={styles.emptyTitle}>No Orders Available</Text>
      <Text style={styles.emptySubtitle}>
        You haven't placed any orders yet. Start shopping to see your orders here!
      </Text>
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>My Orders</Text>
      </View>

      <FlatList
        data={orders}
        keyExtractor={(item) => item._id}
        contentContainerStyle={[
          styles.listContent,
          orders.length === 0 && styles.emptyListContent
        ]}
        ListEmptyComponent={EmptyOrdersComponent}
        renderItem={({ item }) => (
          <TouchableOpacity style={styles.orderCard}>
            <View style={styles.orderHeader}>
              <View style={styles.orderInfo}>
                <Text style={styles.orderDate}>
                  {new Date(item.createdAt).toLocaleDateString()}
                </Text>
                <Text style={styles.trackingNumber}>{item.orderId}</Text>
              </View>
              <View
                style={[
                  styles.statusBadge,
                  { backgroundColor: `${getStatusColor(item.status)}15` },
                ]}
              >
                <Text
                  style={[
                    styles.statusText,
                    { color: getStatusColor(item.status) },
                  ]}
                >
                  {item.status}
                </Text>
              </View>
            </View> 

           <View style={styles.itemsList}>
  {item.items.map((orderItem, index) => {
    const quantityDisplay =
      orderItem.productId?.unit === 'piece'
        ? orderItem.quantity
        : (orderItem.quantity / 1000).toFixed(3);

    const unitLabel = orderItem.productId?.unit === 'piece' ? 'pcs' : 'kg';

    return (
      <View style={styles.orderItem} key={index}>
        <Package size={16} color="#64748b" />
        <View style={{ flex: 1 }}>
          <Text style={styles.itemText} numberOfLines={2}>
            {quantityDisplay} {unitLabel} × {orderItem.productId?.name ?? 'Unknown Product'}
          </Text>
        </View>
      </View>
    );
  })}
</View>


            <View style={styles.orderFooter}>
              <View>
                <Text style={styles.deliveryLabel}>Delivery Time</Text>
                <Text style={styles.deliveryTime}>6:00 AM - 7:00 AM</Text>
              </View>
              <View style={styles.totalContainer}>
                <Text style={styles.totalLabel}>Total</Text>
                <Text style={styles.totalAmount}>₹{item.totalPrice}</Text>
              </View>
            </View>
          </TouchableOpacity>
        )}
        refreshing={refreshing}
        onRefresh={handleRefresh}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FAF7FF',
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
  emptyListContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  emptyTitle: {
    fontFamily: 'Poppins_600SemiBold',
    fontSize: 20,
    color: '#64748b',
    marginTop: 20,
    marginBottom: 8,
    textAlign: 'center',
  },
  emptySubtitle: {
    fontFamily: 'Poppins_400Regular',
    fontSize: 16,
    color: '#94a3b8',
    textAlign: 'center',
    lineHeight: 24,
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
    color: '#9747FF',
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
    color: '#9747FF',
    marginRight: 4,
  },
});