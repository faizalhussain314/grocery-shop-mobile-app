import { useFocusEffect } from '@react-navigation/native';
import { BackHandler } from 'react-native';
import { useCallback } from 'react';
import { RelativePathString, useRouter } from 'expo-router';

export const useBackRedirect = (redirectTo: string) => {
  const router = useRouter();

  useFocusEffect(
    useCallback(() => {
      // If the path is invalid, skip logic but still keep hook stable
      if (!redirectTo) return;

      const onBackPress = () => {
        router.replace(redirectTo as RelativePathString);
        return true; // Prevent default back behavior
      };

      const backHandler = BackHandler.addEventListener(
        'hardwareBackPress',
        onBackPress
      );

      return () => backHandler.remove();
    }, [redirectTo, router])
  );
};
