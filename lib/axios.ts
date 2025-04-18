import axios from 'axios';
import * as SecureStore from 'expo-secure-store';
import Constants from 'expo-constants';

const baseURL = Constants.expoConfig?.extra?.apiBaseUrl || 'http://69.62.84.189:1234/V1';

export const api = axios.create({
  baseURL,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use(async (config) => {
  const token = await SecureStore.getItemAsync('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
    // console.log("token",token);
  }
  else{
    console.log("token wasn't avaiable");
  }
  
  return config;
});

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      await SecureStore.deleteItemAsync('token');
      // Handle logout or token refresh here
    }
    return Promise.reject(error);
  }
);