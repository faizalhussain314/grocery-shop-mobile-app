import { api } from "@/lib/axios";
import Constants from "expo-constants";

const BASE_URL = Constants?.expoConfig?.extra?.VITE_WEB_URL ?? ""; // Ensure BASE_URL is correctly configured

// Define the interface for a Subcategory based on your sample response
export interface Subcategory {
    _id: string; // Or _id, depending on your backend
    name: string;
    category: string; // Assuming this is the parent category name
    image: string; // Assuming this is the image path relative to BASE_URL
    isActive: boolean;
    createdAt: string;
    updatedAt: string;
    // Add any other fields present in your API response
}

/**
 * Fetches subcategories filtered by category name.
 * @param categoryName The name of the parent category.
 * @returns A promise resolving to an array of Subcategory objects.
 */
export const getSubcategoriesByCategoryName = async (categoryName: string): Promise<Subcategory[]> => {
    try {
      
        const response = await api.get<Subcategory[]>(`/subcategories`, {
            params: { category: categoryName }
        });
        return response.data;
    } catch (error) {
        console.error(`Error fetching subcategories for category "${categoryName}":`, error);
        
        throw new Error(`Failed to fetch subcategories: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
};



