import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image ,FlatList } from 'react-native';
import { useFonts, Poppins_400Regular, Poppins_500Medium, Poppins_600SemiBold } from '@expo-google-fonts/poppins';
import { Heart, Share2 } from 'lucide-react-native';
import { Link } from 'expo-router';

const orders = [
  {
    id: '1',
    date: '2024-02-20',
    status: 'Delivered',
    items: ['2x Tomatoes', '1kg Potatoes', '500g Onions'],
    total: '₹250',
  },
  
];

export default function FavoritesScreen() {
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
      <Text style={styles.header}>Your Orders</Text>
      <FlatList
        data={orders}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={styles.orderCard}>
            <View style={styles.orderHeader}>
              <Text style={styles.orderDate}>{item.date}</Text>
              <Text style={[styles.orderStatus, { color: '#4CAF50' }]}>
                {item.status}
              </Text>
            </View>
            {item.items.map((itemName, index) => (
              <Text key={index} style={styles.orderItem}>
                {itemName}
              </Text>
            ))}
            <Text style={styles.orderTotal}>Total: {item.total}</Text>
          </View>
        )}
      />
    </View>
  );
}

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     backgroundColor: '#f8fafc',
//   },
//   header: {
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//     alignItems: 'center',
//     paddingHorizontal: 20,
//     paddingTop: 60,
//     paddingBottom: 20,
//     backgroundColor: '#ffffff',
//   },
//   title: {
//     fontFamily: 'Poppins_600SemiBold',
//     fontSize: 24,
//     color: '#1e293b',
//   },
//   iconButton: {
//     padding: 8,
//     backgroundColor: '#f1f5f9',
//     borderRadius: 12,
//   },
//   scrollView: {
//     flex: 1,
//   },
//   grid: {
//     padding: 20,
//     flexDirection: 'row',
//     flexWrap: 'wrap',
//     justifyContent: 'space-between',
//   },
//   card: {
//     width: '48%',
//     backgroundColor: '#ffffff',
//     borderRadius: 16,
//     marginBottom: 16,
//     overflow: 'hidden',
//   },
//   image: {
//     width: '100%',
//     height: 150,
//   },
//   favoriteButton: {
//     position: 'absolute',
//     top: 8,
//     right: 8,
//     backgroundColor: '#ffffff',
//     borderRadius: 20,
//     padding: 8,
//     shadowColor: '#000',
//     shadowOffset: { width: 0, height: 2 },
//     shadowOpacity: 0.1,
//     shadowRadius: 4,
//     elevation: 2,
//   },
//   organicBadge: {
//     position: 'absolute',
//     top: 8,
//     left: 8,
//     backgroundColor: '#22c55e',
//     paddingHorizontal: 8,
//     paddingVertical: 4,
//     borderRadius: 12,
//   },
//   organicText: {
//     fontFamily: 'Poppins_500Medium',
//     fontSize: 10,
//     color: '#ffffff',
//   },
//   content: {
//     padding: 12,
//   },
//   name: {
//     fontFamily: 'Poppins_500Medium',
//     fontSize: 14,
//     color: '#1e293b',
//     marginBottom: 4,
//   },
//   priceRow: {
//     flexDirection: 'row',
//     alignItems: 'baseline',
//     marginBottom: 8,
//   },
//   price: {
//     fontFamily: 'Poppins_600SemiBold',
//     fontSize: 16,
//     color: '#22c55e',
//     marginRight: 4,
//   },
//   unit: {
//     fontFamily: 'Poppins_400Regular',
//     fontSize: 12,
//     color: '#64748b',
//   },
//   rating: {
//     backgroundColor: '#f1f5f9',
//     paddingHorizontal: 8,
//     paddingVertical: 4,
//     borderRadius: 12,
//     alignSelf: 'flex-start',
//   },
//   ratingText: {
//     fontFamily: 'Poppins_400Regular',
//     fontSize: 12,
//     color: '#64748b',
//   },
// });

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
    paddingTop: 48,
  },
  header: {
    fontSize: 24,
    fontWeight: 'bold',
    padding: 16,
  },
  orderCard: {
    backgroundColor: '#fff',
    margin: 8,
    padding: 16,
    borderRadius: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#eee',
  },
  orderHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  orderDate: {
    fontSize: 16,
    fontWeight: '500',
    fontFamily: 'Poppins_500Medium',
  },
  orderStatus: {
    fontSize: 14,
    fontWeight: '600',
    fontFamily: 'Poppins_500Medium',
  },
  orderItem: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
    fontFamily: 'Poppins_500Medium',
  },
  orderTotal: {
    fontSize: 16,
    fontWeight: '600',
    marginTop: 8,
    color: '#333',
    fontFamily: 'Poppins_500Medium',
  },
});