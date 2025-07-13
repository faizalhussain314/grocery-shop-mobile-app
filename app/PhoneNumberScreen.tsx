import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  Alert,
  ActivityIndicator,
  Linking,
  ScrollView,
} from 'react-native';
import { 
  ArrowLeft, 
  Phone, 
  User, 
  Mail, 
  MapPin, 
  Shield, 
  PhoneCall,
  CheckCircle,
  Clock,
  Key
} from 'lucide-react-native';
import { router } from 'expo-router';
import axios, { AxiosError } from 'axios';

// Type definitions
interface VendorData {
  name: string;
  phoneNumber: string;
  email: string;
  address: string;
}

interface VendorApiRequest {
  phoneNumber: string;
}

interface ProcessStepProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  isActive?: boolean;
}

export default function VendorContactScreen(): JSX.Element {
  const [phoneNumber, setPhoneNumber] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [vendorData, setVendorData] = useState<VendorData | null>(null);
  const [showProcess, setShowProcess] = useState<boolean>(true);

  const handleGetVendor = async (): Promise<void> => {
    if (!phoneNumber.trim()) {
      Alert.alert('Error', 'Please enter your phone number');
      return;
    }

    if (phoneNumber.length < 10) {
      Alert.alert('Error', 'Please enter a valid phone number');
      return;
    }

    setLoading(true);
    try {
      const requestData: VendorApiRequest = {
        phoneNumber: phoneNumber.replace(/\D/g, '') // Remove formatting
      };
      
      const response = await axios.post<VendorData>(
        'https://testdata-iv63.onrender.com/v1/customer/get-vendor',
        requestData
      );
      
      setVendorData(response.data);
      setShowProcess(false);
    } catch (error) {
      const axiosError = error as AxiosError;
      console.error('Error fetching vendor:', axiosError);
      
      if (axiosError.response?.status === 404) {
        Alert.alert('Not Found', 'No vendor found for this phone number.');
      } else if (axiosError.response?.status === 400) {
        Alert.alert('Invalid Request', 'Please check your phone number format.');
      } else {
        Alert.alert('Error', 'Unable to find vendor details. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleCallVendor = (): void => {
    if (vendorData?.phoneNumber) {
      const phoneUrl: string = `tel:${vendorData.phoneNumber}`;
      Linking.openURL(phoneUrl).catch((err: Error) => {
        Alert.alert('Error', 'Unable to make phone call');
        console.error('Error making call:', err);
      });
    }
  };

  const formatPhoneNumber = (text: string): string => {
    const cleaned: string = text.replace(/\D/g, '');
    const limited: string = cleaned.substring(0, 10);
    
    if (limited.length > 5) {
      return `${limited.substring(0, 5)}-${limited.substring(5)}`;
    }
    return limited;
  };

  const handlePhoneNumberChange = (text: string): void => {
    const formatted: string = formatPhoneNumber(text);
    setPhoneNumber(formatted);
  };

  const ProcessStep: React.FC<ProcessStepProps> = ({ icon, title, description, isActive = false }) => (
    <View style={[styles.processStep, isActive && styles.activeStep]}>
      <View style={[styles.stepIcon, isActive && styles.activeStepIcon]}>
        {icon}
      </View>
      <View style={styles.stepContent}>
        <Text style={[styles.stepTitle, isActive && styles.activeStepTitle]}>{title}</Text>
        <Text style={[styles.stepDescription, isActive && styles.activeStepDescription]}>
          {description}
        </Text>
      </View>
    </View>
  );

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <ArrowLeft size={24} color="#1F2937" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Password Reset</Text>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {showProcess && (
          <>
            <View style={styles.heroSection}>
              <View style={styles.iconContainer}>
                <View style={styles.iconWrapper}>
                  <Shield size={48} color="#8B5CF6" />
                </View>
              </View>
              <Text style={styles.title}>Contact Your Vendor</Text>
              <Text style={styles.subtitle}>
                Get your password reset by contacting your assigned delivery partner
              </Text>
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Your Phone Number</Text>
              <View style={styles.phoneInputWrapper}>
                <View style={styles.countryCodeContainer}>
                  <Text style={styles.countryCode}>+91</Text>
                </View>
                <TextInput
                  style={styles.phoneInput}
                  value={phoneNumber}
                  onChangeText={handlePhoneNumberChange}
                  placeholder="Enter your phone number"
                  placeholderTextColor="#9CA3AF"
                  keyboardType="phone-pad"
                  maxLength={12}
                  autoFocus
                />
              </View>
            </View>

            <View style={styles.processContainer}>
              <Text style={styles.processTitle}>How it works</Text>
              
              <ProcessStep
                icon={<PhoneCall size={20} color="#8B5CF6" />}
                title="Call from Registered Number"
                description="Use your registered mobile number to call your vendor"
                isActive={true}
              />
              
              <ProcessStep
                icon={<User size={20} color="#64748B" />}
                title="Vendor Verification"
                description="Your vendor will verify your identity and request"
              />
              
              <ProcessStep
                icon={<Key size={20} color="#64748B" />}
                title="Password Reset"
                description="Your new password will be your phone number"
              />
              
              <ProcessStep
                icon={<CheckCircle size={20} color="#64748B" />}
                title="Login with New Password"
                description="Use your phone number as the new password to login"
              />
            </View>

            <TouchableOpacity
              style={[styles.findVendorButton, loading && styles.findVendorButtonDisabled]}
              onPress={handleGetVendor}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="#FFFFFF" />
              ) : (
                <Text style={styles.findVendorButtonText}>Find My Vendor</Text>
              )}
            </TouchableOpacity>
          </>
        )}

        {vendorData && (
          <View style={styles.vendorContainer}>
            <View style={styles.vendorHeader}>
              <View style={styles.vendorIconContainer}>
                <User size={32} color="#8B5CF6" />
              </View>
              <Text style={styles.vendorTitle}>Your Delivery Partner</Text>
            </View>

            <View style={styles.vendorCard}>
              <View style={styles.vendorInfo}>
                <View style={styles.vendorRow}>
                  <User size={20} color="#6B7280" />
                  <Text style={styles.vendorName}>{vendorData.name}</Text>
                </View>
                
                <View style={styles.vendorRow}>
                  <Phone size={20} color="#6B7280" />
                  <Text style={styles.vendorPhone}>{vendorData.phoneNumber}</Text>
                </View>
                
                <View style={styles.vendorRow}>
                  <Mail size={20} color="#6B7280" />
                  <Text style={styles.vendorEmail}>{vendorData.email}</Text>
                </View>
                
                <View style={styles.vendorRow}>
                  <MapPin size={20} color="#6B7280" />
                  <Text style={styles.vendorAddress}>{vendorData.address}</Text>
                </View>
              </View>
            </View>

            <TouchableOpacity
              style={styles.callButton}
              onPress={handleCallVendor}
            >
              <PhoneCall size={20} color="#FFFFFF" />
              <Text style={styles.callButtonText}>Call Vendor</Text>
            </TouchableOpacity>

            <View style={styles.reminderCard}>
              <Clock size={20} color="#F59E0B" />
              <Text style={styles.reminderText}>
                Remember to call from your registered number: +91 {phoneNumber}
              </Text>
            </View>

            <TouchableOpacity
              style={styles.backToSearchButton}
              onPress={() => {
                setVendorData(null);
                setShowProcess(true);
                setPhoneNumber('');
              }}
            >
              <Text style={styles.backToSearchText}>Search Another Number</Text>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 30,
    paddingBottom: 20,
    backgroundColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  backButton: {
    marginRight: 16,
    padding: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1F2937',
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  heroSection: {
    alignItems: 'center',
    paddingTop: 20,
    paddingBottom: 30,
  },
  iconContainer: {
    alignItems: 'center',
    marginBottom: 20,
  },
  iconWrapper: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(139, 92, 246, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#8B5CF6',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
    elevation: 8,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1F2937',
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 15,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 22,
    paddingHorizontal: 20,
  },
  inputContainer: {
    marginBottom: 30,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 12,
  },
  phoneInputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#E5E7EB',
    borderRadius: 16,
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 20,
    height: 64,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  countryCodeContainer: {
    backgroundColor: '#F3F4F6',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    marginRight: 16,
  },
  countryCode: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
  },
  phoneInput: {
    flex: 1,
    fontSize: 16,
    color: '#1F2937',
    paddingVertical: 0,
    fontWeight: '500',
  },
  processContainer: {
    marginBottom: 30,
  },
  processTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 20,
    textAlign: 'center',
  },
  processStep: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 16,
    padding: 20,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  activeStep: {
    backgroundColor: '#F8FAFC',
    borderColor: '#8B5CF6',
    shadowColor: '#8B5CF6',
    shadowOpacity: 0.1,
  },
  stepIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  activeStepIcon: {
    backgroundColor: '#EDE9FE',
    borderWidth: 2,
    borderColor: '#8B5CF6',
  },
  stepContent: {
    flex: 1,
    paddingTop: 2,
  },
  stepTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 6,
  },
  activeStepTitle: {
    color: '#1F2937',
  },
  stepDescription: {
    fontSize: 14,
    color: '#6B7280',
    lineHeight: 20,
  },
  activeStepDescription: {
    color: '#4B5563',
  },
  findVendorButton: {
    backgroundColor: '#8B5CF6',
    borderRadius: 16,
    height: 64,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
    shadowColor: '#8B5CF6',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
  },
  findVendorButtonDisabled: {
    backgroundColor: '#D1D5DB',
    shadowOpacity: 0,
    elevation: 0,
  },
  findVendorButtonText: {
    fontSize: 17,
    fontWeight: '600',
    color: '#FFFFFF',
    letterSpacing: 0.5,
  },
  vendorContainer: {
    paddingTop: 20,
  },
  vendorHeader: {
    alignItems: 'center',
    marginBottom: 24,
  },
  vendorIconContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#EDE9FE',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  vendorTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#1F2937',
  },
  vendorCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 24,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 6,
  },
  vendorInfo: {
    gap: 18,
  },
  vendorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  vendorName: {
    fontSize: 19,
    fontWeight: '700',
    color: '#1F2937',
  },
  vendorPhone: {
    fontSize: 16,
    color: '#374151',
    fontWeight: '600',
  },
  vendorEmail: {
    fontSize: 14,
    color: '#6B7280',
    fontWeight: '500',
  },
  vendorAddress: {
    fontSize: 14,
    color: '#6B7280',
    lineHeight: 20,
    flex: 1,
    fontWeight: '500',
  },
  callButton: {
    backgroundColor: '#10B981',
    borderRadius: 16,
    height: 64,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 12,
    marginBottom: 20,
    shadowColor: '#10B981',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
  },
  callButtonText: {
    fontSize: 17,
    fontWeight: '600',
    color: '#FFFFFF',
    letterSpacing: 0.5,
  },
  reminderCard: {
    backgroundColor: '#FEF3C7',
    borderRadius: 16,
    padding: 20,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#FCD34D',
    shadowColor: '#F59E0B',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  reminderText: {
    fontSize: 14,
    color: '#92400E',
    flex: 1,
    fontWeight: '600',
    lineHeight: 20,
  },
  backToSearchButton: {
    alignItems: 'center',
    paddingVertical: 16,
    marginBottom: 20,
  },
  backToSearchText: {
    fontSize: 16,
    color: '#8B5CF6',
    fontWeight: '600',
  },
});