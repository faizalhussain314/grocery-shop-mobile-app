import { useCallback } from 'react';
import { BackHandler } from 'react-native';
import { RelativePathString, router, useFocusEffect } from 'expo-router';

/**
 * Custom hook to handle back button press and redirect to a specific route
 * @param redirectPath - The path to redirect to when back button is pressed
 */
export const useBackRedirect = (redirectPath: string) => {
  useFocusEffect(
    useCallback(() => {
      const onBackPress = () => {
        router.replace(redirectPath as RelativePathString);
        return true; // Prevent default back action
      };

      const subscription = BackHandler.addEventListener(
        'hardwareBackPress',
        onBackPress
      );

      return () => subscription.remove();
    }, [redirectPath])
  );
};