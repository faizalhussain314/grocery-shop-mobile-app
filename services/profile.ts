import { api } from '@/lib/axios';

export interface Profile {
  id: string;
  phoneNumber: string;
  role: string;
  isActive: boolean;
}

type ProfileResponse = {
  user: {
    id: string;
    name: string;
    email: string;
    phoneNumber: string;
    role: 'customer' | string;
    isActive: boolean;
    vendorId?: string;
    isVeg?: boolean;
  };
  vendorUser?: {
    id: string;
    name: string;
    email: string;
    phoneNumber: string;
    role: 'vendor' | string;
    isActive: boolean;
    address?: string;
    latitude?: number;
    longitude?: number;
  };
  vendorCode?: string;
  serviceLocations?: string[];
  rating?: number;
  status?: string;
  mapUrl?: string;
};

export const getProfile = async (): Promise<ProfileResponse> => {
  const response = await api.get<ProfileResponse>('/auth/profile');
  console.log("response.data",response.data)
  return response.data;
};
