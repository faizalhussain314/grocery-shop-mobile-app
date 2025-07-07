import * as SecureStore from 'expo-secure-store';

export interface User {
  id: string;
  name: string;
  phoneNumber: string;
  address: string;
  role: 'customer' | 'admin' | string; // add roles as needed
}

const getUser = async (): Promise<User | null> => {
  const storedUser = await SecureStore.getItemAsync('user');
  if (storedUser) {
    try {
      const user: User = JSON.parse(storedUser);
      return user;
    } catch (error) {
      console.error('Failed to parse user:', error);
      return null;
    }
  }
  return null;
};

export default getUser; // ✅ this is what you should export
