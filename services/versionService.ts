// services/versionService.ts
import { api } from "@/lib/axios"; // Your existing axios instance

export interface VersionResponse {
  _id: string;
  appType: string;
  platform: string;
  version: string;
  updateType: 'none' | 'optional' | 'force';
  message: string;
}

export const checkAppVersion = async (): Promise<VersionResponse> => {
  try {
    const response = await api.get<VersionResponse>('/api/version', {
      params: {
        appType: 'customer',
        platform: 'android'
      }
    });
    return response.data;
  } catch (error) {
    console.error('Failed to check app version:', error);
    throw error;
  }
};