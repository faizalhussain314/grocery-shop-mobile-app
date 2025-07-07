import { View, Text, StyleSheet, TouchableOpacity, Image, BackHandler } from 'react-native';
import { useFonts, Poppins_400Regular, Poppins_500Medium, Poppins_600SemiBold } from '@expo-google-fonts/poppins';
import { Link, router, useFocusEffect, useLocalSearchParams } from 'expo-router';
import ConfettiCannon from 'react-native-confetti-cannon';
import LottieView from 'lottie-react-native';
import { useRef, useEffect, useCallback } from 'react';

// Import your custom hook
import { useBackRedirect } from './hooks/useBackRedirect'; // Adjust path as needed

export default function ThankYouScreen() {
   const [fontsLoaded] = useFonts({
     Poppins_400Regular,
     Poppins_500Medium,
     Poppins_600SemiBold,
   });

   // Use useLocalSearchParams to get all parameters first
   const params = useLocalSearchParams();
   const orderId = params.orderId as string | undefined;
   const animationRef = useRef<LottieView>(null);

   // Use the custom hook to handle back navigation
   useBackRedirect('/(tabs)');

   // Log the received parameters when the component mounts
   useEffect(() => {
     console.log('ThankYouScreen received params:', params);
     console.log('ThankYouScreen orderId:', orderId);
   }, [params, orderId]);

   // Handle home button press to clear navigation stack
   const handleHomePress = useCallback(() => {
     // Use router.push with reset to clear the navigation stack
     router.dismissAll();
     router.replace('/(tabs)');
   }, []);

   // Handle track order button press
   const handleTrackOrderPress = useCallback(() => {
     router.dismissAll();
     router.replace('/(tabs)/favorites');
   }, []);

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

       {/* Display the order number if available */}
       {orderId && typeof orderId === 'string' ? (
         <Text style={styles.orderNumberText}>
           Your Order Number is: <Text style={styles.orderNumberValue}>{orderId}</Text>
         </Text>
       ) : (
         <Text style={styles.orderNumberText}>Order number not available.</Text>
       )}

       <Text style={styles.estimatedDelivery}>Estimated delivery: 6 AM - 7 AM</Text>

       {/* Buttons */}
       <View style={styles.buttons}>
         <TouchableOpacity style={styles.homeButton} onPress={handleHomePress}>
           <Text style={styles.homeButtonText}>Back to Home</Text>
         </TouchableOpacity>
         
         <TouchableOpacity style={styles.trackButton} onPress={handleTrackOrderPress}>
           <Text style={styles.trackButtonText}>Track Order</Text>
         </TouchableOpacity>
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
       color: '#9747FF',
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
       backgroundColor: '#9747FF',
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
     orderNumberText: {
        fontFamily: 'Poppins_400Regular',
        fontSize: 18,
        color: '#1e293b',
        marginBottom: 30,
        textAlign: 'center',
      },
      orderNumberValue: {
        fontFamily: 'Poppins_600SemiBold',
        fontSize: 20,
        color: '#1e293b',
      }
   });