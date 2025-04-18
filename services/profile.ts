import { api } from '@/lib/axios';

export interface Profile {
  id: string;
  phoneNumber: string;
  role: string;
  isActive: boolean;
}

export const getProfile = async (): Promise<Profile> => {
  const response = await api.get<Profile>('/auth/profile');
  return response.data;
};
