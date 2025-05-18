// app/edit-profile.tsx
import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  Alert,
} from 'react-native';
import {
  useFonts,
  Poppins_400Regular,
  Poppins_500Medium,
  Poppins_600SemiBold,
} from '@expo-google-fonts/poppins';
import { Save, ArrowLeft } from 'lucide-react-native';
import { useAuthStore } from '@/store/authStore'; 
import { router, useLocalSearchParams } from 'expo-router';
import { api } from '@/lib/axios';
import { AxiosError } from 'axios';


interface ProfileData {
  phoneNumber: string;
  role: string;
  isActive: boolean;
  name: string; // Added name
  address?: string; // Added address
}

// Define the structure for the form data state
interface FormData {
  phoneNumber: string;
  name: string;
  address: string;
}

// Define the structure for the change request payload
interface ProfileChangeRequestPayload {
  requestedPhoneNumber: string;
  requestedName: string;
  requestedAddress: string;
  // You could also include original values if your backend requires them
  // originalPhoneNumber?: string;
  // originalName?: string;
  // originalAddress?: string;
}



export default function EditProfileScreen(): React.JSX.Element | null {
  const [fontsLoaded, fontError] = useFonts({
    Poppins_400Regular,
    Poppins_500Medium,
    Poppins_600SemiBold,
  });

  // Zustand store hook - not directly used for updating store on submit anymore,
  // as changes are now requests.
  // const updateUserInStore = useAuthStore((state) => state.updateUser);

  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [formData, setFormData] = useState<FormData>({
    phoneNumber: '',
    name: '',
    address: '',
  });
  const [originalData, setOriginalData] = useState<ProfileData | null>(null); // Store original fetched data
  const [error, setError] = useState<string | null>(null);

  

 


  useEffect(() => {
    const fetchProfile = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const response = await api.get('/auth/profile');
        const fetchedData = response.data;
        console.log("auth/profile",response.data  )
        setOriginalData(fetchedData); // Store original data
        setFormData({
          phoneNumber: fetchedData.phoneNumber || '',
          name: fetchedData.name || "",
          address: fetchedData.address || '',
        });
      } catch (err) {
        console.error('Failed to load profile for editing:', err);
        let message = 'Failed to load profile data. Please try again.';
        if (err instanceof AxiosError && err.response?.data?.message) {
          message = err.response.data.message;
        }
        setError(message);
        Alert.alert('Error', message);
      } finally {
        setIsLoading(false);
      }
    };
    fetchProfile();
  }, []);

  const handleInputChange = (name: keyof FormData, value: string) => {
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const handleSubmitChangeRequest = async () => {
    setIsSubmitting(true);
    setError(null);

    // Basic validation (optional, enhance as needed)
    if (!formData.name.trim() || !formData.phoneNumber.trim() || !formData.address.trim()) {
        Alert.alert('Validation Error', 'Please fill in all fields.');
        setIsSubmitting(false);
        return;
    }

    // Construct the payload for the change request
    const payload: ProfileChangeRequestPayload = {
      requestedPhoneNumber: formData.phoneNumber,
      requestedName: formData.name,
      requestedAddress: formData.address,
    };

    // Determine if any actual changes were made (optional, backend might also do this)
    let changesMade = false;
    if (originalData) {
        if (originalData.phoneNumber !== formData.phoneNumber ||
            originalData.name !== formData.name ||
            originalData.address !== formData.address) {
            changesMade = true;
        }
    } else {
        changesMade = true; // If original data isn't there, assume changes
    }

    if (!changesMade) {
        Alert.alert('No Changes', 'You haven\'t made any changes to your profile.');
        setIsSubmitting(false);
        return;
    }


    try {
      // Replace with your actual API endpoint for submitting change requests
      // The backend should handle this payload and create pending requests
      await api.post('/profile-change-requests', payload); // Example endpoint

      Alert.alert(
        'Request Submitted',
        'Your profile change request has been submitted successfully. It will be reviewed by an administrator.'
      );
      router.back(); // Go back to the previous screen
    } catch (err) {
      console.error('Failed to submit profile change request:', err);
      let message = 'Failed to submit your request. Please try again.';
      if (err instanceof AxiosError && err.response?.data?.message) {
        message = typeof err.response.data.message === 'string'
            ? err.response.data.message
            : 'An unexpected error occurred while submitting your request.';
      }
      setError(message);
      Alert.alert('Error', message);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!fontsLoaded && !fontError) {
    return null;
  }
  if (fontError) {
    console.error("Font loading error:", fontError);
    return <Text>Error loading fonts.</Text>;
  }

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#3b82f6" />
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} keyboardShouldPersistTaps="handled">
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <ArrowLeft size={24} color="#1e293b" />
        </TouchableOpacity>
        <Text style={styles.title}>Request Profile Change</Text>
        <View style={{ width: 40 }} />
      </View>

      {/* <View style={styles.infoBox}>
        <Text style={styles.infoText}>
          Changes to your profile information need to be approved.
          Please submit your desired changes below.
        </Text>
      </View> */}

      <View style={styles.formContainer}>
        {error && !isSubmitting && <Text style={styles.errorText}>{error}</Text>}

        {/* <View style={styles.inputGroup}>
          <Text style={styles.label}>Name</Text>
          <TextInput
            style={styles.disabledInput}
            value={formData.name}
            onChangeText={(text) => handleInputChange('name', text)}
            placeholder="Enter your full name"
            autoCapitalize="words"
            editable={false}
            placeholderTextColor="#94a3b8"
          />
        </View> */}

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Name</Text>
          <TextInput
            style={styles.input}
            value={formData.name}
            onChangeText={(text) => handleInputChange('name', text)}
            placeholder="Enter your full name"
            autoCapitalize="words"
            editable={!isSubmitting}
            placeholderTextColor="#94a3b8"
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Old Phone Number</Text>
          <TextInput
            style={styles.disabledInput}
            value={formData.phoneNumber}
            
            placeholder="Enter your phone number"
            keyboardType="phone-pad"
            autoComplete="tel"
            editable={false}
            placeholderTextColor="#94a3b8"
          />
        </View>
        <View style={styles.inputGroup}>
          <Text style={styles.label}>New Phone Number</Text>
          <TextInput
            style={styles.input}
            value={formData.phoneNumber}
            onChangeText={(text) => handleInputChange('phoneNumber', text)}
            placeholder="Enter your phone number"
            keyboardType="phone-pad"
            autoComplete="tel"
            editable={!isSubmitting}
            placeholderTextColor="#94a3b8"
          />
        </View>

        {/* <View style={styles.inputGroup}>
          <Text style={styles.label}>Address</Text>
          <TextInput
            style={[styles.disabledInput, styles.textArea]} // Added textArea style for multiline
            value={formData.address}
            onChangeText={(text) => handleInputChange('address', text)}
            placeholder="Enter your full address"
            editable={false}
            placeholderTextColor="#94a3b8"
            multiline
            numberOfLines={3}
          />
        </View> */}

        {/* <View style={styles.inputGroup}>
          <Text style={styles.label}>Address</Text>
          <TextInput
            style={[styles.input, styles.textArea]} // Added textArea style for multiline
            value={formData.address}
            onChangeText={(text) => handleInputChange('address', text)}
            placeholder="Enter your full address"
            editable={!isSubmitting}
            placeholderTextColor="#94a3b8"
            multiline
            numberOfLines={3}
          />
        </View> */}

        <TouchableOpacity
          style={[styles.submitButton, isSubmitting && styles.submitButtonDisabled]}
          onPress={handleSubmitChangeRequest}
          disabled={isSubmitting}
        >
          {isSubmitting ? (
            <ActivityIndicator color="#ffffff" size="small" />
          ) : (
            <>
              <Save size={20} color="#ffffff" />
              <Text style={styles.submitButtonText}>Save Changes</Text>
            </>
          )}
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FAF7FF',
  },
  container: {
    flex: 1,
    backgroundColor: '#FAF7FF',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 60, // Adjust for status bar height if necessary
    paddingBottom: 20,
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
  },
  backButton: {
    padding: 8,
  },
  title: {
    fontFamily: 'Poppins_600SemiBold',
    fontSize: 18, // Slightly reduced size for longer title
    color: '#1e293b',
    textAlign: 'center',
  },
  infoBox: {
    backgroundColor: '#C191FF', // Light blue background
    padding: 15,
    marginHorizontal: 20,
    marginTop: 20,
    borderRadius: 8,
    borderLeftWidth: 4,
    borderLeftColor: '#9747FF', // Sky blue border
  },
  infoText: {
    fontFamily: 'Poppins_400Regular',
    fontSize: 14,
    color: '#fff', // Darker sky blue text
    lineHeight: 20,
  },
  formContainer: {
    padding: 20,
    marginTop: 10, // Reduced margin after infoBox
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontFamily: 'Poppins_500Medium',
    fontSize: 14,
    color: '#334155',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#cbd5e1',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontFamily: 'Poppins_400Regular',
    fontSize: 16,
    color: '#1e293b',
  },
  disabledInput: {
    backgroundColor: '#fff', // Light gray to blend subtly with background
    opacity: 1,  // Slight opacity to indicate disabled state
    color: '#9ca3af', // Light gray text
    borderColor: '#cbd5e1',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontFamily: 'Poppins_400Regular',
    fontSize: 16,
    pointerEvents: 'none', // Disable interaction
  },
  textArea: {
    minHeight: 80, // For multiline address
    textAlignVertical: 'top', // Align text to top for multiline
  },
  submitButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#9747FF', // Changed to a sky blue color
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 12,
    marginTop: 20,
  },
  submitButtonDisabled: {
    backgroundColor: '#7dd3fc', // Lighter sky blue for disabled state
  },
  submitButtonText: {
    fontFamily: 'Poppins_600SemiBold',
    fontSize: 16,
    color: '#ffffff',
    marginLeft: 8,
  },
  errorText: {
    fontFamily: 'Poppins_400Regular',
    fontSize: 14,
    color: '#ef4444',
    textAlign: 'center',
    marginBottom: 15,
  },
});