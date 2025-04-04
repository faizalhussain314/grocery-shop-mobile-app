import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput } from 'react-native';
import { useFonts, Poppins_400Regular, Poppins_500Medium, Poppins_600SemiBold } from '@expo-google-fonts/poppins';
import { ArrowLeft, CreditCard, MapPin , Truck } from 'lucide-react-native';
import { Link, router } from 'expo-router';

export default function CheckoutScreen() {
  const [fontsLoaded] = useFonts({
    Poppins_400Regular,
    Poppins_500Medium,
    Poppins_600SemiBold,
  });

  if (!fontsLoaded) {
    return null;
  }

  const handlePlaceOrder = () => {
    router.push('/thank-you');
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Link href=".." asChild>
          <TouchableOpacity style={styles.iconButton}>
            <ArrowLeft size={20} color="#64748b" />
          </TouchableOpacity>
        </Link>
        <Text style={styles.title}>Checkout</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView style={styles.content}>
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <MapPin size={20} color="#22c55e" />
            <Text style={styles.sectionTitle}>Delivery Address</Text>
          </View>
          <View style={styles.card}>
            <TextInput
              style={styles.input}
              placeholder="Street Address"
              placeholderTextColor="#64748b"
            />
            <TextInput
              style={styles.input}
              placeholder="Apartment, suite, etc. (optional)"
              placeholderTextColor="#64748b"
            />
            <View style={styles.row}>
              <TextInput
                style={[styles.input, styles.flex1]}
                placeholder="City"
                placeholderTextColor="#64748b"
              />
              <TextInput
                style={[styles.input, styles.flex1]}
                placeholder="ZIP Code"
                placeholderTextColor="#64748b"
              />
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <CreditCard size={20} color="#22c55e" />
            <Text style={styles.sectionTitle}>Payment Method</Text>
          </View>
          <View style={styles.card}>
            <TextInput
              style={styles.input}
              placeholder="Card Number"
              placeholderTextColor="#64748b"
            />
            <View style={styles.row}>
              <TextInput
                style={[styles.input, styles.flex1]}
                placeholder="MM/YY"
                placeholderTextColor="#64748b"
              />
              <TextInput
                style={[styles.input, styles.flex1]}
                placeholder="CVC"
                placeholderTextColor="#64748b"
              />
            </View>
          </View>
          <View style={styles.paymentOptions}>
          <TouchableOpacity style={[styles.paymentOption, styles.selectedPayment]}>
           <Text style={styles.paymentText}> Cash on Delivery</Text>
          </TouchableOpacity>
        </View>
          <View style={styles.section}>
        {/* <View style={styles.sectionHeader}>
          <CreditCard color="#4CAF50" size={24} />
          <Text style={styles.sectionTitle}>Payment Method</Text>
        </View> */}
       
      </View>
        </View>

        <View style={styles.summary}>
          <Text style={styles.summaryTitle}>Order Summary</Text>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Subtotal</Text>
            <Text style={styles.summaryValue}>₹25.00</Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Delivery Fee</Text>
            <Text style={styles.summaryValue}>₹2.00</Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Discount</Text>
            <Text style={[styles.summaryValue, styles.discountText]}>-₹5.00</Text>
          </View>
          <View style={[styles.summaryRow, styles.totalRow]}>
            <Text style={styles.totalLabel}>Total</Text>
            <Text style={styles.totalValue}>₹22.00</Text>
          </View>
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity style={styles.placeOrderButton} onPress={handlePlaceOrder}>
          <Text style={styles.placeOrderText}>Place Order</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
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
  content: {
    flex: 1,
  },
  section: {
    marginTop: 24,
    paddingHorizontal: 20,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontFamily: 'Poppins_600SemiBold',
    fontSize: 18,
    color: '#1e293b',
    marginLeft: 8,
  },
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 16,
  },
  input: {
    fontFamily: 'Poppins_400Regular',
    fontSize: 16,
    color: '#1e293b',
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: '#f8fafc',
    borderRadius: 12,
    marginBottom: 12,
  },
  row: {
    flexDirection: 'row',
    gap: 12,
  },
  flex1: {
    flex: 1,
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
  
  paymentOptions: {
    marginTop: 8,
  },
  paymentOption: {
    padding: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  selectedPayment: {
    borderColor: '#4CAF50',
    backgroundColor: '#f1f8e9',
  },
  paymentText: {
    fontSize: 16,
    color: '#333',
    flex: 1,
    justifyContent: 'center',
   
    flexDirection: "row",
    alignItems: "center",
  },
  truck:{
    marginTop:100,
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
  placeOrderButton: {
    backgroundColor: '#22c55e',
    paddingVertical: 16,
    borderRadius: 16,
    alignItems: 'center',
  },
  placeOrderText: {
    fontFamily: 'Poppins_600SemiBold',
    fontSize: 16,
    color: '#ffffff',
  },
});