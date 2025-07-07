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
  // Alert, // Replaced by custom modal for consistency
} from 'react-native';
import {
  useFonts,
  Poppins_400Regular,
  Poppins_500Medium,
  Poppins_600SemiBold,
} from '@expo-google-fonts/poppins';
import { Save, ArrowLeft } from 'lucide-react-native';
// import { useAuthStore } from '@/store/authStore'; // Not directly used for update logic now
import { router } from 'expo-router';
import { api } from '@/lib/axios';
import { AxiosError } from 'axios';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAuthStore } from '@/store/authStore';
import { useBackRedirect } from './hooks/useBackRedirect';

// --- Type Definitions ---

// Expected structure from the GET /auth/profile endpoint
interface UserProfileDataFromAPI {
  id: string;
  name: string;
  email: string;
  phoneNumber: string;
  role: 'customer' | string;
  isActive: boolean;
  address?: string; // Assuming address can be part of the user object
  vendorId?: string;
  isVeg?: boolean;
}

interface VendorUserDataFromAPI {
  id: string;
  name: string;
  email: string;
  phoneNumber: string;
  role: 'vendor' | string;
  isActive: boolean;
  address?: string;
  latitude?: number;
  longitude?: number;
}

// As per user's provided getProfile function's response
type ProfileResponse = {
  user: UserProfileDataFromAPI;
  vendorUser?: VendorUserDataFromAPI;
  vendorCode?: string;
  serviceLocations?: string[];
  rating?: number;
  status?: string;
  mapUrl?: string;
};


// Structure for storing original profile data fetched from the server
interface OriginalProfileData {
  phoneNumber: string;
  role: string;
  isActive: boolean;
  name: string;
  address: string; // Ensure address is always string, defaults to ''
}

// Structure for the form data state
interface FormData {
  name: string;
  address: string;
  newNumber: string; // For the new phone number input
}

// Structure for the PATCH request payload (all fields optional)
interface ProfileChangeRequestPayload {
  requestedPhoneNumber?: string;
  requestedName?: string;
  requestedAddress?: string;
  complaintType?: 'Change Number'; // Specific type for phone change
}

export default function EditProfileScreen(): React.JSX.Element | null {
  const [fontsLoaded, fontError] = useFonts({
    Poppins_400Regular,
    Poppins_500Medium,
    Poppins_600SemiBold,
  });
 const insets = useSafeAreaInsets();
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [formData, setFormData] = useState<FormData>({
    name: '',
    address: '',
    newNumber: '',
  });
  const [originalData, setOriginalData] = useState<OriginalProfileData | null>(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [modalMessage, setModalMessage] = useState('');
  const [error, setError] = useState<string | null>(null); // For storing submission errors
  const [userId , setuserId] = useState<string>();
    const {user} = useAuthStore();

      useBackRedirect("/(tabs)/account");

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        setIsLoading(true);
        setError(null); // Clear previous errors
        const res = await api.get<ProfileResponse>('/auth/profile');
        const user = res.data.user;

        const original: OriginalProfileData = {
          name: user.name ?? '',
          address: user.address ?? '', // Use user.address, default to '' if undefined
          phoneNumber: user.phoneNumber ?? '',
          role: user.role ?? '',
          isActive: user.isActive ?? false,
          
        };
        setuserId(user.id)


        setOriginalData(original);

        setFormData({
          name: user.name ?? '',
          address: user.address ?? '',
          newNumber: '', // New number field starts empty
        });
      } catch (err) {
        console.error('Fetch Profile Error:', err);
        // Display error in modal instead of Alert
        setModalMessage(
          err instanceof AxiosError && err.response?.data?.message
            ? err.response.data.message
            : 'Failed to load your profile. Please try again.'
        );
        setModalVisible(true);
        setError('Failed to load profile.'); // Set error state for modal behavior
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
    setError(null); // Clear previous submission errors

    if (!originalData) {
        setModalMessage('Original profile data not loaded. Please try again.');
        setModalVisible(true);
        setIsSubmitting(false);
        return;
    }

    const trimmedName = formData.name.trim();
    const trimmedAddress = formData.address.trim();
    const trimmedNewNumber = formData.newNumber.trim();

    const nameChanged = trimmedName !== originalData.name;
    const addressChanged = trimmedAddress !== originalData.address;
    // Phone number changed only if newNumber is not empty and different from original
    const phoneNumberChanged = trimmedNewNumber !== '' && trimmedNewNumber !== originalData.phoneNumber;

    const payload: ProfileChangeRequestPayload = {};
    let changesMade = false;

    if (nameChanged) {
      if (!trimmedName) {
        setModalMessage('Name cannot be empty if you are changing it.');
        setModalVisible(true);
        setIsSubmitting(false);
        return;
      }
      payload.requestedName = trimmedName;
      changesMade = true;
    }

    if (addressChanged) {
      if (!trimmedAddress) {
        setModalMessage('Address cannot be empty if you are changing it.');
        setModalVisible(true);
        setIsSubmitting(false);
        return;
      }
      payload.requestedAddress = trimmedAddress;
      changesMade = true;
    }

    if (phoneNumberChanged) {
      // No need to check if trimmedNewNumber is empty again, as it's part of phoneNumberChanged condition
      payload.requestedPhoneNumber = trimmedNewNumber;
      payload.complaintType = 'Change Number';
      changesMade = true;
    }

    if (!changesMade) {
      setModalMessage('You haven’t made any changes.');
      setModalVisible(true);
      setIsSubmitting(false);
      return;
    }

    try {
    

      const payloadInfo = {
        name:payload.requestedName,
        phoneNumber: payload.requestedPhoneNumber
      }
    
      await api.patch(`auth/updateProfile/${userId}`, payloadInfo);
      await useAuthStore.getState().updateUser({ name: payload.requestedName });

      let successMessage = 'Your profile has been successfully updated.';
      if (payload.requestedPhoneNumber) {
        successMessage =
          'Your request to change the number has been submitted. We will review and update it shortly.';
      }
      setModalMessage(successMessage);
      setModalVisible(true);
      setError(null); 

      // Update originalData and formData for successfully committed non-phone changes
      const updatedOriginalData = { ...originalData };
      let newFormName = formData.name;
      let newFormAddress = formData.address;

      if (payload.requestedName) {
        updatedOriginalData.name = payload.requestedName;
        newFormName = payload.requestedName;
      }
      if (payload.requestedAddress) {
        updatedOriginalData.address = payload.requestedAddress;
        newFormAddress = payload.requestedAddress;
      }
      // originalData.phoneNumber is not updated here as it's a request

      setOriginalData(updatedOriginalData);
      setFormData({
        name: newFormName,
        address: newFormAddress,
        newNumber: '', // Clear new number field after successful submission
      });

    } catch (err) {
      console.error('API Patch Error (Full Details):', err);
      const errorMessage =
        err instanceof AxiosError && err.response?.data?.message
          ? String(err.response.data.message)
          : 'Something went wrong while submitting your request. Please try again.';
      setError(errorMessage);
      setModalMessage(errorMessage);
      setModalVisible(true);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!fontsLoaded && !fontError) {
    return null; // Or a minimal loading state if preferred over blank screen
  }
  if (fontError) {
    console.error("Font loading error:", fontError);
    // Potentially render a more user-friendly error message
    return <View style={styles.loadingContainer}><Text>Error loading fonts.</Text></View>;
  }

  if (isLoading && !modalVisible) { // Don't show main loader if modal (e.g. fetch error modal) is up
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#3b82f6" />
      </View>
    );
  }

  return (
    <React.Fragment>
    <ScrollView style={styles.container} >
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <ArrowLeft size={24} color="#1e293b" />
        </TouchableOpacity>
        <Text style={styles.title}>Request Profile Change</Text>
        <View style={{ width: 40 }} /> 
      </View>

     
      {/* <View style={styles.infoBox}>
        <Text style={styles.infoText}>
          Changes to your profile information (except phone number) will be updated immediately.
          Phone number changes require approval.
        </Text>
      </View> */}
     

      <View style={styles.formContainer}>
        {/* Name Input */}
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

        {/* Current Phone Number (Display Only) */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Current Phone Number</Text>
          <TextInput
            style={styles.disabledInput}
            value={originalData?.phoneNumber || 'Loading...'}
            editable={false}
            placeholderTextColor="#94a3b8"
          />
        </View>

        {/* New Phone Number Input */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>New Phone Number (Optional)</Text>
          <TextInput
            style={styles.input}
            value={formData.newNumber}
            onChangeText={(text) => handleInputChange('newNumber', text)} // Corrected to 'newNumber'
            keyboardType="phone-pad"
            editable={!isSubmitting}
            placeholder="Enter new phone number"
            placeholderTextColor="#94a3b8"
          />
        </View>

        {/* Address Input (Uncommented and Editable) */}
        {/* <View style={styles.inputGroup}>
          <Text style={styles.label}>Address</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
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
     {modalVisible && (
        // The modalOverlay takes safe area insets to cover the whole screen correctly
        <View style={[styles.modalOverlay, { paddingTop: insets.top, paddingBottom: insets.bottom }]}>
          {/* The modalContainer is now centered within the overlay */}
          <View style={styles.modalContainer}>
            <Text style={styles.modalMessage}>{modalMessage}</Text>
            <TouchableOpacity
              style={styles.modalButton}
              onPress={() => {
                setModalVisible(false);
                if (!error && (modalMessage.includes('successfully updated') || modalMessage.includes('submitted'))) {
                  router.back();
                }
                if (error && modalMessage !== 'Failed to load your profile. Please try again.') {
                  setError(null);
                }
              }}
            >
              <Text style={styles.modalButtonText}>OK</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}
    </React.Fragment>
    
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
    height:"100%",
   
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 60, // Adjust for status bar height if necessary (e.g., using react-native-safe-area-context)
    paddingBottom: 20,
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
  },
  backButton: {
    padding: 8, // Make tap target slightly larger
  },
  title: {
    fontFamily: 'Poppins_600SemiBold',
    fontSize: 18,
    color: '#1e293b',
    textAlign: 'center',
    flex: 1, // Allows title to take available space for better centering with unequal button widths
  },
  infoBox: {
    backgroundColor: '#C191FF',
    padding: 15,
    marginHorizontal: 20,
    marginTop: 20,
    borderRadius: 8,
    borderLeftWidth: 4,
    borderLeftColor: '#9747FF',
  },
  infoText: {
    fontFamily: 'Poppins_400Regular',
    fontSize: 14,
    color: '#ffffff', // Ensure contrast with C191FF
    lineHeight: 20,
  },
  formContainer: {
    padding: 20,
    // marginTop: 10, // Use if infoBox is active
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
    backgroundColor: '#f1f5f9', // Slightly different from input to show it's disabled
    borderWidth: 1,
    borderColor: '#e2e8f0',
    color: '#64748b', // Darker gray text for readability
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontFamily: 'Poppins_400Regular',
    fontSize: 16,
    // pointerEvents: 'none', // Not needed for TextInput editable=false
  },
  textArea: {
    minHeight: 80,
    textAlignVertical: 'top',
  },
  submitButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#9747FF',
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 12,
    marginTop: 20, // Add some space before button
    elevation: 2, // Subtle shadow for Android
    shadowColor: '#000', // Shadow for iOS
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 1.41,
    
    position:"relative",
    bottom:0,

  },
  submitButtonDisabled: {
    backgroundColor: '#c084fc', // Lighter purple for disabled state
    elevation: 0,
  },
  submitButtonText: {
    fontFamily: 'Poppins_600SemiBold',
    fontSize: 16,
    color: '#ffffff',
    marginLeft: 8,
  },
  // errorText is not explicitly used, modal handles errors
  // errorText: {
  //   fontFamily: 'Poppins_400Regular',
  //   fontSize: 14,
  //   color: '#ef4444', // Red color for errors
  //   textAlign: 'center',
  //   marginBottom: 15,
  // },
 modalOverlay: {
    flex: 1, // This ensures it covers the full available space
    backgroundColor: 'rgba(0, 0, 0, 0.45)', // This is the dull, dimmed color
    justifyContent: 'center', // Centers the modalContainer vertically
    alignItems: 'center',   // Centers the modalContainer horizontally
    // The paddingTop/paddingBottom from insets will be applied directly in JSX
    position: 'absolute', // Ensures it overlays the entire screen
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 1000, // Make sure it's on top of other content
  },
  modalContainer: { // This will now mimic your successCard style
    width: '80%', // Width of the card
    backgroundColor: '#fff', // White background
    borderRadius: 20, // Rounded corners
    paddingVertical: 30, // Vertical padding
    paddingHorizontal: 24, // Horizontal padding
    alignItems: 'center', // Centers content inside the card
    elevation: 10, // Android shadow
    shadowColor: '#000', // iOS shadow
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  modalMessage: { // This will now mimic your successSubtitle style
    fontFamily: 'Poppins_400Regular', // Regular font
    fontSize: 14, // Smaller font size
    color: '#475569', // Grayish color
    textAlign: 'center',
    marginBottom: 20, // Add margin to separate message from button
    lineHeight: 22,
  },
  modalTitle: { // NEW: Add a title style if you want a prominent message
    fontFamily: 'Poppins_600SemiBold', // Semi-bold font
    fontSize: 18, // Larger font size
    color: '#1e293b', // Darker color
    marginBottom: 8, // Margin below title
    textAlign: 'center',
  },
  modalButton: {
    backgroundColor: '#9747FF',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
    minWidth: 100,
    alignItems: 'center',
    // Align self to stretch if you want it full width of the card
    // alignSelf: 'stretch',
  },
  modalButtonText: {
    fontFamily: 'Poppins_600SemiBold',
    fontSize: 16,
    color: '#fff',
  },
});

