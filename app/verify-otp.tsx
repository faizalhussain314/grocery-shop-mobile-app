import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  PermissionsAndroid,
  Platform,
  NativeSyntheticEvent,
  TextInputKeyPressEventData
} from 'react-native';
import { ArrowLeft, MessageSquare, RotateCcw } from 'lucide-react-native';
import { router, useLocalSearchParams } from 'expo-router';

export default function OTPVerificationScreen() {
  const { phone: rawPhone } = useLocalSearchParams();
  const phone = Array.isArray(rawPhone) ? rawPhone[0] : rawPhone;

  const [otp, setOtp] = useState(['', '', '', '']);
  const [loading, setLoading] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);
  const [timer, setTimer] = useState(60);
  const [canResend, setCanResend] = useState(false);
  const [autoFillPermission, setAutoFillPermission] = useState(false);

  const inputRefs = useRef<Array<TextInput | null>>([]);

  useEffect(() => {
    // Start countdown timer
    const interval = setInterval(() => {
      setTimer((prev) => {
        if (prev <= 1) {
          setCanResend(true);
          clearInterval(interval);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    // Request SMS permission and start listening
    requestSMSPermission();

    return () => {
      clearInterval(interval);
    };
  }, []);

  const requestSMSPermission = async () => {
    if (Platform.OS === 'android') {
      try {
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.RECEIVE_SMS,
          {
            title: 'SMS Permission',
            message: 'This app needs access to SMS to automatically detect OTP',
            buttonNeutral: 'Ask Me Later',
            buttonNegative: 'Cancel',
            buttonPositive: 'OK',
          }
        );

        if (granted === PermissionsAndroid.RESULTS.GRANTED) {
          setAutoFillPermission(true);
          // Auto-fill logic could be triggered here when an OTP is received
        } else {
          setAutoFillPermission(false);
        }
      } catch (err) {
        console.warn(err);
      }
    }
  };

  const handleOTPChange = (value: string, index: number) => {
    if (value.length > 1) return; // Prevent multiple characters

    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    // Auto-focus next input
    if (value && index < 3) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyPress = (
    e: NativeSyntheticEvent<TextInputKeyPressEventData>,
    index: number
  ) => {
    // Handle backspace
    if (e.nativeEvent.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleVerifyOTP = () => {
    const otpString = otp.join('');

    if (otpString.length !== 4) {
      Alert.alert('Error', 'Please enter the complete 4-digit OTP');
      return;
    }

    setLoading(true);
    // Simulate the verification process
    setTimeout(() => {
      setLoading(false);
      Alert.alert('Success', 'OTP verified successfully!', [
        {
          text: 'OK',
          onPress: () => router.push(`/create-password?phone=${phone}`),
        },
      ]);
    }, 2000); // Simulating an API call with a timeout
  };

  const handleResendOTP = () => {
    setResendLoading(true);
    // Simulate the resend OTP process
    setTimeout(() => {
      setResendLoading(false);
      Alert.alert('Success', 'OTP sent successfully!');
      setTimer(60);
      setCanResend(false);
      setOtp(['', '', '', '']);
      inputRefs.current[0]?.focus();
    }, 2000); // Simulating an API call with a timeout
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <ArrowLeft size={24} color="#1F2937" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Verify OTP</Text>
      </View>

      <View style={styles.content}>
        <View style={styles.iconContainer}>
          <View style={styles.iconWrapper}>
            <MessageSquare size={48} color="#8B5CF6" />
          </View>
        </View>

        <Text style={styles.title}>Enter Verification Code</Text>
        <Text style={styles.subtitle}>
          We've sent a 4-digit code to{'\n'}
          <Text style={styles.phoneNumber}>+91 {phone}</Text>
        </Text>

        <View style={styles.otpContainer}>
          {otp.map((digit, index) => (
            <TextInput
              key={index}
              ref={(ref) => {
                inputRefs.current[index] = ref;
              }}
              style={[
                styles.otpInput,
                digit ? styles.otpInputFilled : null,
              ]}
              value={digit}
              onChangeText={(value) => handleOTPChange(value, index)}
              onKeyPress={(e) => handleKeyPress(e, index)}
              keyboardType="numeric"
              maxLength={1}
              textAlign="center"
              selectTextOnFocus
            />
          ))}
        </View>

        {autoFillPermission && (
          <View style={styles.autoFillNote}>
            <Text style={styles.autoFillText}>
              📱 Auto-fill enabled - We'll detect OTP from SMS
            </Text>
          </View>
        )}

        <TouchableOpacity
          style={[styles.verifyButton, loading && styles.verifyButtonDisabled]}
          onPress={handleVerifyOTP}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <Text style={styles.verifyButtonText}>Verify OTP</Text>
          )}
        </TouchableOpacity>

        <View style={styles.resendContainer}>
          {canResend ? (
            <TouchableOpacity
              style={styles.resendButton}
              onPress={handleResendOTP}
              disabled={resendLoading}
            >
              {resendLoading ? (
                <ActivityIndicator size="small" color="#8B5CF6" />
              ) : (
                <>
                  <RotateCcw size={16} color="#8B5CF6" />
                  <Text style={styles.resendText}>Resend OTP</Text>
                </>
              )}
            </TouchableOpacity>
          ) : (
            <Text style={styles.timerText}>
              Resend OTP in {formatTime(timer)}
            </Text>
          )}
        </View>

        <TouchableOpacity
          style={styles.changeNumberButton}
          onPress={() => router.back()}
        >
          <Text style={styles.changeNumberText}>Change Phone Number</Text>
        </TouchableOpacity>
      </View>
    </View>
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
    paddingTop: 40,
  },
  iconContainer: {
    alignItems: 'center',
    marginBottom: 32,
  },
  iconWrapper: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1F2937',
    textAlign: 'center',
    marginBottom: 12,
  },
  subtitle: {
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center',
    marginBottom: 40,
    lineHeight: 24,
  },
  phoneNumber: {
    fontWeight: '600',
    color: '#8B5CF6',
  },
  otpContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
    paddingHorizontal: 20,
  },
  otpInput: {
    width: 60,
    height: 60,
    borderWidth: 2,
    borderColor: '#D1D5DB',
    borderRadius: 12,
    fontSize: 24,
    fontWeight: '600',
    color: '#1F2937',
    backgroundColor: '#F9FAFB',
  },
  otpInputFilled: {
    borderColor: '#8B5CF6',
    backgroundColor: '#FFFFFF',
  },
  autoFillNote: {
    backgroundColor: '#F0F9FF',
    borderRadius: 8,
    padding: 12,
    marginBottom: 20,
    borderLeftWidth: 4,
    borderLeftColor: '#3B82F6',
  },
  autoFillText: {
    fontSize: 14,
    color: '#1E40AF',
    textAlign: 'center',
  },
  verifyButton: {
    backgroundColor: '#8B5CF6',
    borderRadius: 12,
    height: 56,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  verifyButtonDisabled: {
    backgroundColor: '#D1D5DB',
  },
  verifyButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  resendContainer: {
    alignItems: 'center',
    marginBottom: 16,
  },
  resendButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 16,
  },
  resendText: {
    fontSize: 14,
    color: '#8B5CF6',
    fontWeight: '500',
    marginLeft: 8,
  },
  timerText: {
    fontSize: 14,
    color: '#6B7280',
  },
  changeNumberButton: {
    alignItems: 'center',
    paddingVertical: 12,
  },
  changeNumberText: {
    fontSize: 14,
    color: '#8B5CF6',
    fontWeight: '500',
  },
});
