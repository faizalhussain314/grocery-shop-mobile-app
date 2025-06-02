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
  name: string;
  address: string;
  phoneNumber: string; // ← New number
  newNumber:string;
}

interface OriginalData {
  name: string;
  address: string;
  phoneNumber: string; // ← Old number
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
    newNumber:'',
    name: '',
    address: '',
  });
  const [originalData, setOriginalData] = useState<ProfileData | null>(null);
  const [modalVisible, setModalVisible] = useState(false);
const [modalMessage, setModalMessage] = useState('');
const [newNumber, setnewNumber] = useState('');

// Store original fetched data
  const [error, setError] = useState<string | null>(null);

  

 


useEffect(() => {
  const fetchProfile = async () => {
    try {
      setIsLoading(true);
      const res = await api.get('/auth/profile');
     const user = res.data.user;

const original: ProfileData = {
  name: user.name ?? '',
  address: user.address ?? '',
  phoneNumber: user.phoneNumber ?? '',
  role: user.role ?? '',
  isActive: user.isActive ?? false,
};

setOriginalData(original);




      setFormData({
        name: user.name ?? '',
        address: user.address ?? '',
        phoneNumber: user.phoneNumber ?? '', // Starts as old, user edits
        newNumber:''
      });
    } catch (err) {
      console.error(err);
      Alert.alert('Error', 'Failed to load your profile.');
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

  if (!formData.name.trim() || !formData.newNumber.trim() || !formData.address.trim()) {
    setModalMessage('Please fill in all fields.');
    setModalVisible(true);
    setIsSubmitting(false);
    return;
  }

  const phoneNumberChanged = formData.newNumber !== originalData?.phoneNumber;
  const nameChanged = formData.name !== originalData?.name;
  const addressChanged = formData.address !== originalData?.address;

  const changesMade = phoneNumberChanged || nameChanged || addressChanged;

  if (!changesMade) {
    setModalMessage('You haven’t made any changes.');
    setModalVisible(true);
    setIsSubmitting(false);
    return;
  }

  const payload: ProfileChangeRequestPayload & { complaintType?: string } = {
    requestedName: formData.name,
    requestedAddress: formData.address,
    requestedPhoneNumber: formData.newNumber,
    ...(phoneNumberChanged && { complaintType: 'Change Number' }) // Add only if number changed
  };

  try {
    await api.post('/auth/profile', payload);

    setModalMessage(
      phoneNumberChanged
        ? 'Your request to change the number has been submitted. We will review and update it shortly.'
        : 'Your profile has been successfully updated.'
    );
    setModalVisible(true);
  } catch (err) {
    console.error('API Error (Full Details):', err);
    setError('Something went wrong while submitting your request. Please try again.');
    setModalMessage('An error occurred. Please try again later.');
    setModalVisible(true);
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
  <Text style={styles.label}>Current Phone Number</Text>
  <TextInput
    style={styles.disabledInput}
    value={originalData?.phoneNumber}
    editable={false}
    placeholderTextColor="#94a3b8"
  />
</View>

       <View style={styles.inputGroup}>
  <Text style={styles.label}>New Phone Number</Text>
  <TextInput
    style={styles.input}
    value={newNumber}
    onChangeText={(text) => handleInputChange('phoneNumber', text)}
    keyboardType="phone-pad"
    editable={!isSubmitting}
    placeholder="Enter new phone number"
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
      {modalVisible && (
  <View style={styles.modalOverlay}>
    <View style={styles.modalContainer}>
      <Text style={styles.modalMessage}>{modalMessage}</Text>
      <TouchableOpacity
        style={styles.modalButton}
        onPress={() => {
          setModalVisible(false);
          if (!error) router.back(); // Only go back if not an error
        }}
      >
        <Text style={styles.modalButtonText}>OK</Text>
      </TouchableOpacity>
    </View>
  </View>
)}


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
  modalOverlay: {
  position: 'absolute',
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  backgroundColor: 'rgba(0, 0, 0, 0.5)',
  justifyContent: 'center',
  alignItems: 'center',
  zIndex: 10,
},
modalContainer: {
  backgroundColor: '#fff',
  padding: 24,
  borderRadius: 12,
  width: '80%',
  alignItems: 'center',
  elevation: 10,
},
modalMessage: {
  fontFamily: 'Poppins_500Medium',
  fontSize: 16,
  color: '#1e293b',
  textAlign: 'center',
  marginBottom: 20,
},
modalButton: {
  backgroundColor: '#9747FF',
  paddingHorizontal: 24,
  paddingVertical: 12,
  borderRadius: 8,
},
modalButtonText: {
  fontFamily: 'Poppins_600SemiBold',
  fontSize: 16,
  color: '#fff',
},

});