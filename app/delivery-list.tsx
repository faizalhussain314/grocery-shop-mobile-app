import { View, Text, StyleSheet, FlatList, TouchableOpacity } from 'react-native';
import { useFonts, Poppins_400Regular, Poppins_500Medium, Poppins_600SemiBold } from '@expo-google-fonts/poppins';
import { useState, useEffect } from 'react';
import { router } from 'expo-router';
import { ArrowLeft, Plus } from 'lucide-react-native';
import { api } from '../lib/axios';
import { fetchDeliveries } from '@/services/deliveryService';

interface Delivery {
  id: string;
  address: string;
  city: string;
  zipCode: string;
  phone: string;
  instructions?: string;
}

export default function DeliveryListScreen() {
  const [deliveries, setDeliveries] = useState<Delivery[]>([]);
  const [loading, setLoading] = useState(true);

  const [fontsLoaded] = useFonts({
    Poppins_400Regular,
    Poppins_500Medium,
    Poppins_600SemiBold,
  });


  // const getAddressList = async () =>{
  //  const addressList = await fetchDeliveries();
  //  setDeliveries(addressList);
  // }
  // useEffect(() => {
  //   getAddressList();
  // }, []);

  

  if (!fontsLoaded || loading) {
    return <Text>Element Not Found</Text>;
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <ArrowLeft size={24} color="#1e293b" />
        </TouchableOpacity>
        <Text style={styles.title}>Delivery Addresses</Text>
        <TouchableOpacity
          onPress={() => router.push('/add-delivery')}
          style={styles.addButton}
        >
          <Plus size={24} color="#22c55e" />
        </TouchableOpacity>
      </View>

      <FlatList
        data={deliveries}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <Text style={styles.addressText}>{item.address}</Text>
              <Text style={styles.phoneText}>{item.phone}</Text>
            </View>
            <Text style={styles.cityText}>
              {item.city}, {item.zipCode}
            </Text>
            {item.instructions && (
              <Text style={styles.instructionsText}>{item.instructions}</Text>
            )}
          </View>
        )}
        contentContainerStyle={styles.list}
        ListEmptyComponent={() => (
          <View style={styles.emptyState}>
            <Text style={styles.emptyStateText}>No delivery addresses yet</Text>
            <TouchableOpacity
              onPress={() => router.push('/add-delivery')}
              style={styles.addFirstButton}
            >
              <Text style={styles.addFirstButtonText}>Add Your First Address</Text>
            </TouchableOpacity>
          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 20,
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  backButton: {
    padding: 8,
  },
  title: {
    fontFamily: 'Poppins_600SemiBold',
    fontSize: 20,
    color: '#1e293b',
  },
  addButton: {
    padding: 8,
  },
  list: {
    padding: 20,
  },
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  addressText: {
    fontFamily: 'Poppins_500Medium',
    fontSize: 16,
    color: '#1e293b',
    flex: 1,
  },
  phoneText: {
    fontFamily: 'Poppins_400Regular',
    fontSize: 14,
    color: '#64748b',
  },
  cityText: {
    fontFamily: 'Poppins_400Regular',
    fontSize: 14,
    color: '#64748b',
    marginBottom: 8,
  },
  instructionsText: {
    fontFamily: 'Poppins_400Regular',
    fontSize: 14,
    color: '#94a3b8',
    fontStyle: 'italic',
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
  },
  emptyStateText: {
    fontFamily: 'Poppins_400Regular',
    fontSize: 16,
    color: '#64748b',
    marginBottom: 16,
  },
  addFirstButton: {
    backgroundColor: '#22c55e',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 12,
  },
  addFirstButtonText: {
    fontFamily: 'Poppins_600SemiBold',
    fontSize: 14,
    color: '#ffffff',
  },
});