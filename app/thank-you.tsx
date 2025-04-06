import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { useFonts, Poppins_400Regular, Poppins_500Medium, Poppins_600SemiBold } from '@expo-google-fonts/poppins';
import { Link } from 'expo-router';
import ConfettiCannon from 'react-native-confetti-cannon';
import LottieView from 'lottie-react-native';
import { useRef } from 'react';


export default function ThankYouScreen() {
  const [fontsLoaded] = useFonts({
    Poppins_400Regular,
    Poppins_500Medium,
    Poppins_600SemiBold,
  });

  const animationRef = useRef<LottieView>(null);

  if (!fontsLoaded) return null;

  return (
    <View style={styles.container}>
      {/* Lottie animation */}
      <LottieView
        ref={animationRef}
        source={{ uri: 'https://lottie.host/1b93183c-4955-46e5-a185-69295f03b236/VxAl9aszT7.lottie' }}
        autoPlay
        loop={false}
        style={{ width: 200, height: 200, marginBottom: 32 }}
      />

      {/* Confetti! */}
      <ConfettiCannon count={100} origin={{ x: 200, y: 0 }} fadeOut />

      <Text style={styles.title}>Thank You!</Text>
      <Text style={styles.message}>
        Your order has been placed successfully. We'll deliver your fresh groceries right to your doorstep.
      </Text>
      <Text style={styles.orderNumber}>Order #12345</Text>
      <Text style={styles.estimatedDelivery}>Estimated delivery: 6 AM</Text>

      {/* Buttons */}
      <View style={styles.buttons}>
        <Link href="/(tabs)" asChild>
          <TouchableOpacity style={styles.homeButton}>
            <Text style={styles.homeButtonText}>Back to Home</Text>
          </TouchableOpacity>
        </Link>
        <Link href="/(tabs)/account" asChild>
          <TouchableOpacity style={styles.trackButton}>
            <Text style={styles.trackButtonText}>Track Order</Text>
          </TouchableOpacity>
        </Link>
      </View>
    </View>
  );
}


const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
    alignItems: 'center',
    padding: 20,
    paddingTop: 60,
  },
  image: {
    width: 200,
    height: 200,
    marginBottom: 32,
  },
  title: {
    fontFamily: 'Poppins_600SemiBold',
    fontSize: 32,
    color: '#22c55e',
    marginBottom: 16,
  },
  message: {
    fontFamily: 'Poppins_400Regular',
    fontSize: 16,
    color: '#64748b',
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 24,
  },
  orderNumber: {
    fontFamily: 'Poppins_500Medium',
    fontSize: 18,
    color: '#1e293b',
    marginBottom: 8,
  },
  estimatedDelivery: {
    fontFamily: 'Poppins_400Regular',
    fontSize: 16,
    color: '#64748b',
    marginBottom: 32,
  },
  buttons: {
    width: '100%',
    gap: 12,
  },
  homeButton: {
    backgroundColor: '#22c55e',
    paddingVertical: 16,
    borderRadius: 16,
    alignItems: 'center',
  },
  homeButtonText: {
    fontFamily: 'Poppins_600SemiBold',
    fontSize: 16,
    color: '#ffffff',
  },
  trackButton: {
    backgroundColor: '#f1f5f9',
    paddingVertical: 16,
    borderRadius: 16,
    alignItems: 'center',
  },
  trackButtonText: {
    fontFamily: 'Poppins_600SemiBold',
    fontSize: 16,
    color: '#1e293b',
  },
});