import { api } from "@/lib/axios"; // Adjust the import path based on your axios instance location

export interface BannerResponse {
  success: boolean;
  message: string;
  data: {
    banner_1: string;
    banner_2: string;
    banner_3: string;
  };
}

export interface Banner {
  id: string;
  image: string;
  title: string;
  subtitle: string;
}

export const getBanners = async (): Promise<Banner[]> => {
  try {
    const response = await api.get<BannerResponse>('/settings/banners');
    
    if (response.data.success) {
      // Transform the API response to match the expected banner format
      const banners: Banner[] = [
        {
          id: '1',
          image: response.data.data.banner_1,
          title: 'Fresh & Healthy',
          subtitle: 'Get fresh vegetables delivered to your doorstep',
        },
        {
          id: '2',
          image: response.data.data.banner_2,
          title: 'Organic Products',
          subtitle: 'Handpicked organic produce for your family',
        },
        {
          id: '3',
          image: response.data.data.banner_3,
          title: 'Farm Fresh',
          subtitle: 'Direct from farms to your kitchen',
        },
      ];
      console.log("banners",banners)
      return banners;
    } else {
      throw new Error(response.data.message || 'Failed to fetch banners');
    }
  } catch (error) {
    console.error('Error fetching banners:', error);
    throw error;
  }
};