import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Image,
} from 'react-native';
import {
  useFonts,
  Poppins_400Regular,
  Poppins_500Medium,
  Poppins_600SemiBold,
} from '@expo-google-fonts/poppins';
import { useState } from 'react';
import { Link, router } from 'expo-router';
import { useAuthStore } from '../store/authStore';
import Toast from 'react-native-toast-message';
import { ActivityIndicator } from 'react-native';
import * as SecureStore from 'expo-secure-store'; 

export default function LoginScreen() {
  const [phoneNumber, setMobileNumber] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const login = useAuthStore((state) => state.login);
  const [isLoading, setIsLoading] = useState(false);

  const [fontsLoaded] = useFonts({
    Poppins_400Regular,
    Poppins_500Medium,
    Poppins_600SemiBold,
  });

  if (!fontsLoaded) {
    return null;
  }

 const handleLogin = async (event: any) => {
  event.preventDefault();
  setError('');

  if (!phoneNumber || !password) {
    setError('Please enter both mobile number and password.');
    Toast.show({
      type: 'error',
      text1: 'Missing Fields',
      text2: 'Mobile number and password are required.',
    });
    return;
  }

  setIsLoading(true);

  Toast.show({
    type: 'info',
    text1: 'Logging in...',
  });

  try {
    await login(phoneNumber, password); // this will throw on failure

    Toast.hide();
    Toast.show({
      type: 'success',
      text1: 'Login Successful',
      text2: 'Welcome back 👋',
    });


    // router.replace('/(tabs)');
  } catch (err: any) {
    Toast.hide();

    let errorMessage = 'Something went wrong. Please try again.';

    if (err?.response?.status === 401 || err?.response?.status === 403) {
      errorMessage = 'Invalid phone number or password.';
     
    } else if (err?.response?.status >= 500) {
      errorMessage = 'An error occurred on our end. Please try again later.';
    
    } else if (err?.message) {
      errorMessage = err.message;
      
    }

    setError(errorMessage);

    Toast.show({
      type: 'error',
      text1: 'Login Failed',
      text2: errorMessage,
    });
  } finally {
    setIsLoading(false);
  }
};

  

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Image
          source={{
            uri: 'https://images.unsplash.com/photo-1542838132-92c53300491e?q=80&w=1000',
          }}
          style={styles.headerImage}
        />
      </View>

      <View style={styles.form}>
        {/* <Text style={styles.title}>Welcome Back</Text> */}
        <Text style={styles.subtitle}>Sign in to continue</Text>

       

        <View style={styles.inputContainer}>
          <TextInput
            style={styles.input}
            placeholder="Mobile Number"
            value={phoneNumber}
            onChangeText={(text) => setMobileNumber(text.trim())}
            keyboardType="phone-pad"
            maxLength={10}
          />
        </View>

        <View style={styles.inputContainer}>
          <TextInput
            style={styles.input}
            placeholder="Password"
            value={password}
           onChangeText={(text) => setPassword(text.trim())}
            secureTextEntry
          />
        </View>
        {error && <Text style={styles.error}>{error}</Text>}


        <TouchableOpacity
          style={[styles.loginButton, isLoading && { opacity: 0.7 }]}
          onPress={handleLogin}
          disabled={isLoading || !phoneNumber || !password}

          
        >
          {isLoading ? (
            <ActivityIndicator color="#ffffff" />
          ) : (
            <Text style={styles.loginButtonText}>Sign In</Text>
          )}
        </TouchableOpacity>

        <View style={styles.footer}>
          <Text style={styles.footerText}>Don't have an account? </Text>
          <Link href="/register" style={styles.registerLink}>
            <Text style={styles.registerText}>Contact Our Support</Text>
          </Link>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  header: {
    height: '40%',
  },
  headerImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  form: {
    flex: 1,
    padding: 24,
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    backgroundColor: '#ffffff',
    marginTop: -30,
  },
  title: {
    fontFamily: 'Poppins_600SemiBold',
    fontSize: 28,
    color: '#1e293b',
    marginBottom: 8,
  },
  subtitle: {
    fontFamily: 'Poppins_400Regular',
    fontSize: 16,
    color: '#64748b',
    marginBottom: 32,
  },
  error: {
    fontFamily: 'Poppins_400Regular',
    fontSize: 14,
    color: '#ef4444',
    marginBottom: 16,
  },
  inputContainer: {
    marginBottom: 16,
  },
  input: {
    fontFamily: 'Poppins_400Regular',
    fontSize: 16,
    color: '#1e293b',
    padding: 16,
    backgroundColor: '#FAF7FF',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  loginButton: {
    backgroundColor: '#9747FF',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 16,
  },
  loginButtonText: {
    fontFamily: 'Poppins_600SemiBold',
    fontSize: 16,
    color: '#ffffff',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 24,
  },
  footerText: {
    fontFamily: 'Poppins_400Regular',
    fontSize: 14,
    color: '#64748b',
  },
  registerLink: {
    marginLeft: 4,
  },
  registerText: {
    fontFamily: 'Poppins_600SemiBold',
    fontSize: 14,
    color: '#9747FF',
  },
})