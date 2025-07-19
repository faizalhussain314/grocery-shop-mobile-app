// app/_layout.tsx
import { useEffect, useState } from 'react';
import { Stack, Slot, usePathname, router } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { Linking, Alert } from 'react-native';
import { useAuthStore } from '../store/authStore';
import Toast from 'react-native-toast-message';
import { Provider } from 'react-redux';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import store from '@/store/store';
import UpdateRequiredOverlay from './components/UpdateRequiredOverlay';
import { checkAppVersion, VersionResponse } from '../services/versionService';

// Static app version - Update this when you release a new version
const CURRENT_APP_VERSION = '1.0.0';

// Simple version check - if versions don't match, show update
const isUpdateRequired = (currentVersion: string, serverVersion: string): boolean => {
  return currentVersion !== serverVersion;
};

export default function RootLayout() {
  const checkAuth = useAuthStore((state) => state.checkAuth);
  const logout = useAuthStore((state) => state.logout);
  const { token, user } = useAuthStore();
  const pathname = usePathname();
  const [ready, setReady] = useState(false);
  
  // Version check state
  const [showUpdateOverlay, setShowUpdateOverlay] = useState(false);
  const [versionInfo, setVersionInfo] = useState<VersionResponse | null>(null);
  const [versionCheckComplete, setVersionCheckComplete] = useState(false);

  // Check app version on startup
  useEffect(() => {
    const performVersionCheck = async () => {
      try {
        const versionResponse = await checkAppVersion();
        setVersionInfo(versionResponse);
        
        // Check if update is required
        const updateNeeded = isUpdateRequired(CURRENT_APP_VERSION, versionResponse.version);
        
        if (updateNeeded || versionResponse.updateType === 'force') {
          setShowUpdateOverlay(true);
        }
      } catch (error) {
        console.error('Version check failed:', error);
        // Continue with app initialization even if version check fails
      } finally {
        setVersionCheckComplete(true);
      }
    };

    performVersionCheck();
  }, []);

  useEffect(() => {
    // Only proceed with auth check after version check is complete
    if (versionCheckComplete) {
      checkAuth().finally(() => setReady(true));
    }
  }, [versionCheckComplete]);

  useEffect(() => {
    if (ready && token && user) {
      // Check if user role is not customer
      if (user.role !== 'customer') {
        // Show error toast
        Toast.show({
          type: 'error',
          text1: 'Access Denied',
          text2: 'Only customers are allowed to access this app.',
        });
        
        // Logout and redirect to login
        logout();
        router.replace('/login');
        return;
      }
      
      // If user is customer and on login/register page, redirect to tabs
      if (pathname === '/login' || pathname === '/register') {
        router.replace('/(tabs)');
      }
    }
  }, [ready, token, user, pathname]);

  const handleUpdatePress = () => {
    // Handle update action
    Alert.alert(
      'Update App',
      'Please update the app from the Play Store to continue.',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Update',
          onPress: () => {
            // Open Play Store or App Store
            const storeUrl = 'https://kadai2manai.com/';
            Linking.openURL(storeUrl).catch((err) => {
              console.error('Failed to open store:', err);
              Toast.show({
                type: 'error',
                text1: 'Error',
                text2: 'Could not open app store. Please update manually.',
              });
            });
          },
        },
      ],
    );
  };

  // Don't render the main app until version check is complete and no update is required
  if (!versionCheckComplete || showUpdateOverlay) {
    return (
      <SafeAreaProvider>
        <StatusBar style="dark" backgroundColor="#ffffff" />
        <UpdateRequiredOverlay
          visible={showUpdateOverlay}
          onUpdatePress={handleUpdatePress}
          message={versionInfo?.message || "A new version is available. Please update to continue using the app."}
          currentVersion={CURRENT_APP_VERSION}
          latestVersion={versionInfo?.version}
        />
        <Toast />
      </SafeAreaProvider>
    );
  }

  return (
    <SafeAreaProvider>
      <Provider store={store}>
        <StatusBar style="dark" backgroundColor="#ffffff" />
        <Toast />
        <Slot />
      </Provider>
    </SafeAreaProvider>
  );
}