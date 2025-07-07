import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Modal,
} from 'react-native';
import {
  useFonts,
  Poppins_400Regular,
  Poppins_500Medium,
  Poppins_600SemiBold,
} from '@expo-google-fonts/poppins';
import { useEffect, useState } from 'react';
import { router } from 'expo-router';
import { ActivityIndicator } from 'react-native';
import Toast from 'react-native-toast-message';
import { changePassword } from '@/services/passwordService';
import { useAuthStore } from '@/store/authStore';
import { useBackRedirect } from './hooks/useBackRedirect'; // Import the custom hook
import { storage } from '@/store/storage';
import getUser from '@/lib/getUser';

// Define types for better TypeScript support
interface ValidationErrors {
  password?: string;
  confirmPassword?: string;
}

interface PasswordValidation {
  length: boolean;
  uppercase: boolean;
  lowercase: boolean;
  number: boolean;
  special: boolean;
}

export default function ChangePasswordScreen() {
  const [password, setPassword] = useState<string>('');
  const [confirmPassword, setConfirmPassword] = useState<string>('');
  const [errors, setErrors] = useState<ValidationErrors>({});
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [showSuccessModal, setShowSuccessModal] = useState<boolean>(false);
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState<boolean>(false);
  const [user, setUser] = useState<{ id: string } | null>(null);

  // Load fonts - this should always be called
  const [fontsLoaded] = useFonts({
    Poppins_400Regular,
    Poppins_500Medium,
    Poppins_600SemiBold,
  });

  // Use the custom back redirect hook
  useBackRedirect("/(tabs)/account");

  useEffect(() => {
    const loadUser = async () => {
      const storedUser = await getUser();
      setUser(storedUser);
    };

    loadUser();
  }, []);

  console.log("user", user);
  const userId = user?.id;

  // Password validation function with number requirement
  const validatePassword = (pwd: string): PasswordValidation => {
    const validations = {
      length: pwd.length >= 8,
      uppercase: /[A-Z]/.test(pwd),
      lowercase: /[a-z]/.test(pwd),
      number: /[0-9]/.test(pwd),
      special: /[!@#$%^&*(),.?":{}|<>]/.test(pwd),
    };
    return validations;
  };

  const getValidationColor = (isValid: boolean): string => {
    return isValid ? '#22c55e' : '#ef4444';
  };

  const handlePasswordChange = (text: string): void => {
    setPassword(text);
    if (errors.password) {
      setErrors({ ...errors, password: undefined });
    }
  };

  const handleConfirmPasswordChange = (text: string): void => {
    setConfirmPassword(text);
    if (errors.confirmPassword) {
      setErrors({ ...errors, confirmPassword: undefined });
    }
  };

  const handleSubmit = async (): Promise<void> => {
    if (!userId) {
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: 'User not found. Please try again.',
      });
      return;
    }

    const newErrors: ValidationErrors = {};
    const passwordValidation = validatePassword(password);

    // Validate password requirements
    if (!passwordValidation.length || !passwordValidation.uppercase || 
        !passwordValidation.lowercase || !passwordValidation.number || 
        !passwordValidation.special) {
      newErrors.password = 'Password does not meet requirements';
    }

    // Validate password match
    if (password !== confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    if (!password.trim()) {
      newErrors.password = 'Password is required';
    }

    if (!confirmPassword.trim()) {
      newErrors.confirmPassword = 'Please confirm your password';
    }

    setErrors(newErrors);

    if (Object.keys(newErrors).length > 0) {
      Toast.show({
        type: 'error',
        text1: 'Validation Error',
        text2: 'Please fix the errors below',
      });
      return;
    }

    setIsLoading(true);

    try {
      console.log("userId from handleSubmit", userId);
      await changePassword(password, userId);
      setShowSuccessModal(true);
    } catch (error: any) {
      Toast.show({
        type: 'error',
        text1: 'Change Password Failed',
        text2: error.response?.data?.message || 'Something went wrong',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSuccessModalClose = (): void => {
    setShowSuccessModal(false);
    router.replace('/(tabs)');
  };

  // Show loading indicator while fonts are loading or user is not loaded
  if (!fontsLoaded) {
    return (
      <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color="#9747FF" />
      </View>
    );
  }

  // Show loading indicator while user is being loaded
  if (!userId) {
    return (
      <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color="#9747FF" />
        <Text style={styles.loadingText}>Loading user data...</Text>
      </View>
    );
  }

  const passwordValidation = validatePassword(password);

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <View style={styles.header}>
        <Text style={styles.title}>Change Password</Text>
        <Text style={styles.subtitle}>Create a new secure password</Text>
      </View>

      <View style={styles.form}>
        {/* Password Input */}
        <View style={styles.inputContainer}>
          <Text style={styles.label}>New Password</Text>
          <View style={styles.passwordContainer}>
            <TextInput
              style={[styles.input, errors.password && styles.inputError]}
              placeholder="Enter new password"
              value={password}
              onChangeText={handlePasswordChange}
              secureTextEntry={!showPassword}
            />
            <TouchableOpacity
              style={styles.eyeButton}
              onPress={() => setShowPassword(!showPassword)}
            >
              <Text style={styles.eyeText}>{showPassword ? '👁️' : '👁️‍🗨️'}</Text>
            </TouchableOpacity>
          </View>
          {errors.password && (
            <Text style={styles.errorText}>{errors.password}</Text>
          )}
        </View>

        {/* Password Requirements */}
        {password.length > 0 && (
          <View style={styles.requirementsContainer}>
            <Text style={styles.requirementsTitle}>Password Requirements:</Text>
            <View style={styles.requirement}>
              <Text style={[styles.requirementText, { color: getValidationColor(passwordValidation.length) }]}>
                ✓ At least 8 characters
              </Text>
            </View>
            <View style={styles.requirement}>
              <Text style={[styles.requirementText, { color: getValidationColor(passwordValidation.uppercase) }]}>
                ✓ One uppercase letter
              </Text>
            </View>
            <View style={styles.requirement}>
              <Text style={[styles.requirementText, { color: getValidationColor(passwordValidation.lowercase) }]}>
                ✓ One lowercase letter
              </Text>
            </View>
            <View style={styles.requirement}>
              <Text style={[styles.requirementText, { color: getValidationColor(passwordValidation.number) }]}>
                ✓ At least one number
              </Text>
            </View>
            <View style={styles.requirement}>
              <Text style={[styles.requirementText, { color: getValidationColor(passwordValidation.special) }]}>
                ✓ One special character
              </Text>
            </View>
          </View>
        )}

        {/* Confirm Password Input */}
        <View style={styles.inputContainer}>
          <Text style={styles.label}>Confirm Password</Text>
          <View style={styles.passwordContainer}>
            <TextInput
              style={[styles.input, errors.confirmPassword && styles.inputError]}
              placeholder="Confirm new password"
              value={confirmPassword}
              onChangeText={handleConfirmPasswordChange}
              secureTextEntry={!showConfirmPassword}
            />
            <TouchableOpacity
              style={styles.eyeButton}
              onPress={() => setShowConfirmPassword(!showConfirmPassword)}
            >
              <Text style={styles.eyeText}>{showConfirmPassword ? '👁️' : '👁️‍🗨️'}</Text>
            </TouchableOpacity>
          </View>
          {errors.confirmPassword && (
            <Text style={styles.errorText}>{errors.confirmPassword}</Text>
          )}
        </View>

        {/* Submit Button */}
        <TouchableOpacity
          style={[
            styles.submitButton,
            (isLoading || !password || !confirmPassword) && styles.submitButtonDisabled
          ]}
          onPress={handleSubmit}
          disabled={isLoading || !password || !confirmPassword}
        >
          {isLoading ? (
            <ActivityIndicator color="#ffffff" />
          ) : (
            <Text style={styles.submitButtonText}>Change Password</Text>
          )}
        </TouchableOpacity>
      </View>

      {/* Success Modal */}
      <Modal
        visible={showSuccessModal}
        transparent={true}
        animationType="fade"
        onRequestClose={handleSuccessModalClose}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <View style={styles.successIcon}>
              <Text style={styles.successIconText}>✓</Text>
            </View>
            <Text style={styles.modalTitle}>Password Changed!</Text>
            <Text style={styles.modalMessage}>
              Your password has been successfully updated. You can now use your new password to sign in.
            </Text>
            <TouchableOpacity
              style={styles.modalButton}
              onPress={handleSuccessModalClose}
            >
              <Text style={styles.modalButtonText}>Continue</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  header: {
    padding: 24,
    paddingTop: 60,
    paddingBottom: 32,
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
  },
  form: {
    padding: 24,
    paddingTop: 0,
  },
  inputContainer: {
    marginBottom: 20,
  },
  label: {
    fontFamily: 'Poppins_500Medium',
    fontSize: 14,
    color: '#374151',
    marginBottom: 8,
  },
  passwordContainer: {
    position: 'relative',
  },
  input: {
    fontFamily: 'Poppins_400Regular',
    fontSize: 16,
    color: '#1e293b',
    padding: 16,
    paddingRight: 50,
    backgroundColor: '#FAF7FF',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  inputError: {
    borderColor: '#ef4444',
  },
  eyeButton: {
    position: 'absolute',
    right: 16,
    top: '50%',
    transform: [{ translateY: -12 }],
    padding: 4,
  },
  eyeText: {
    fontSize: 20,
  },
  errorText: {
    fontFamily: 'Poppins_400Regular',
    fontSize: 12,
    color: '#ef4444',
    marginTop: 4,
  },
  requirementsContainer: {
    backgroundColor: '#f8fafc',
    padding: 16,
    borderRadius: 12,
    marginBottom: 20,
  },
  requirementsTitle: {
    fontFamily: 'Poppins_500Medium',
    fontSize: 14,
    color: '#374151',
    marginBottom: 8,
  },
  requirement: {
    marginBottom: 4,
  },
  requirementText: {
    fontFamily: 'Poppins_400Regular',
    fontSize: 12,
  },
  submitButton: {
    backgroundColor: '#9747FF',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 20,
  },
  submitButtonDisabled: {
    opacity: 0.5,
  },
  submitButtonText: {
    fontFamily: 'Poppins_600SemiBold',
    fontSize: 16,
    color: '#ffffff',
  },
  loadingText: {
    fontFamily: 'Poppins_400Regular',
    fontSize: 16,
    color: '#64748b',
    marginTop: 10,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  modalContainer: {
    backgroundColor: '#ffffff',
    borderRadius: 20,
    padding: 32,
    alignItems: 'center',
    width: '100%',
    maxWidth: 320,
  },
  successIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#22c55e',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
  },
  successIconText: {
    fontSize: 40,
    color: '#ffffff',
    fontWeight: 'bold',
  },
  modalTitle: {
    fontFamily: 'Poppins_600SemiBold',
    fontSize: 24,
    color: '#1e293b',
    marginBottom: 12,
    textAlign: 'center',
  },
  modalMessage: {
    fontFamily: 'Poppins_400Regular',
    fontSize: 16,
    color: '#64748b',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 32,
  },
  modalButton: {
    backgroundColor: '#9747FF',
    paddingHorizontal: 32,
    paddingVertical: 12,
    borderRadius: 12,
    width: '100%',
    alignItems: 'center',
  },
  modalButtonText: {
    fontFamily: 'Poppins_600SemiBold',
    fontSize: 16,
    color: '#ffffff',
  },
});