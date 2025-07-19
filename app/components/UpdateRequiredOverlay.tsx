// components/UpdateRequiredOverlay.tsx
import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  Dimensions,
  Image,
} from 'react-native';
import { Download, RefreshCw } from 'lucide-react-native';
import {
  useFonts,
  Poppins_400Regular,
  Poppins_500Medium,
  Poppins_600SemiBold,
} from '@expo-google-fonts/poppins';

const { width, height } = Dimensions.get('window');

interface UpdateRequiredOverlayProps {
  visible: boolean;
  onUpdatePress: () => void;
  message?: string;
  currentVersion?: string;
  latestVersion?: string;
}

const UpdateRequiredOverlay: React.FC<UpdateRequiredOverlayProps> = ({
  visible,
  onUpdatePress,
  message = "A new version is available. Please update to continue using the app.",
  currentVersion,
  latestVersion,
}) => {
  const [fontsLoaded] = useFonts({
    Poppins_400Regular,
    Poppins_500Medium,
    Poppins_600SemiBold,
  });

  if (!fontsLoaded) {
    return null;
  }

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="fade"
      statusBarTranslucent={true}
    >
      <View style={styles.overlay}>
        <View style={styles.container}>
          {/* Update Icon */}
          <View style={styles.iconContainer}>
            <View style={styles.iconBackground}>
              <Download size={32} color="#9747FF" />
            </View>
          </View>

          {/* Title */}
          <Text style={styles.title}>Update Required</Text>

          {/* Message */}
          <Text style={styles.message}>{message}</Text>

          {/* Version Info */}
          {currentVersion && latestVersion && (
            <View style={styles.versionContainer}>
              <View style={styles.versionRow}>
                <Text style={styles.versionLabel}>Current Version:</Text>
                <Text style={styles.versionValue}>{currentVersion}</Text>
              </View>
              <View style={styles.versionRow}>
                <Text style={styles.versionLabel}>Latest Version:</Text>
                <Text style={styles.versionValueLatest}>{latestVersion}</Text>
              </View>
            </View>
          )}

          {/* Update Button */}
          <TouchableOpacity style={styles.updateButton} onPress={onUpdatePress}>
            <RefreshCw size={18} color="#ffffff" />
            <Text style={styles.updateButtonText}>Update Now</Text>
          </TouchableOpacity>

          {/* Footer Text */}
          <Text style={styles.footerText}>
            This update includes important improvements and bug fixes.
          </Text>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  container: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 24,
    width: width * 0.9,
    maxWidth: 360,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 10,
    },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 10,
  },
  iconContainer: {
    marginBottom: 20,
  },
  iconBackground: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#F3ECFF',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: '#9747FF',
  },
  title: {
    fontFamily: 'Poppins_600SemiBold',
    fontSize: 22,
    color: '#1E293B',
    marginBottom: 12,
    textAlign: 'center',
  },
  message: {
    fontFamily: 'Poppins_400Regular',
    fontSize: 15,
    color: '#64748B',
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 20,
  },
  versionContainer: {
    width: '100%',
    backgroundColor: '#FAF7FF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  versionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  versionLabel: {
    fontFamily: 'Poppins_400Regular',
    fontSize: 14,
    color: '#64748B',
  },
  versionValue: {
    fontFamily: 'Poppins_500Medium',
    fontSize: 14,
    color: '#1E293B',
  },
  versionValueLatest: {
    fontFamily: 'Poppins_600SemiBold',
    fontSize: 14,
    color: '#9747FF',
  },
  updateButton: {
    backgroundColor: '#9747FF',
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 32,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    marginBottom: 16,
    shadowColor: '#9747FF',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  updateButtonText: {
    fontFamily: 'Poppins_600SemiBold',
    fontSize: 16,
    color: '#FFFFFF',
    marginLeft: 8,
  },
  footerText: {
    fontFamily: 'Poppins_400Regular',
    fontSize: 12,
    color: '#94A3B8',
    textAlign: 'center',
    lineHeight: 16,
  },
});

export default UpdateRequiredOverlay;