import { api } from "@/lib/axios";
import Constants from "expo-constants";

const BASE_URL = Constants?.expoConfig?.extra?.VITE_WEB_URL ?? ""; // Ensure BASE_URL is correctly configured

// Define the interface for a Subcategory based on your sample response
export interface Subcategory {
    id: string; // Or _id, depending on your backend
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
        // Assuming your API supports filtering by category name like /subcategories?category=Vegetables
        // Adjust the query parameter ('category') if your API uses a different name (e.g., 'categoryName', 'categoryId')
        // If your API expects category ID, you would pass categoryId here and use that in the URL/params.
        // Sticking to category name based on the sample response structure.
        const response = await api.get<Subcategory[]>(`/subcategories`, {
            params: { category: categoryName }
        });
        return response.data;
    } catch (error) {
        console.error(`Error fetching subcategories for category "${categoryName}":`, error);
        // Depending on desired error handling, you might throw the error, return an empty array, etc.
        throw new Error(`Failed to fetch subcategories: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
};

// You might also need a service to fetch all categories if you don't have one
// src/services/categoryService.ts (Example - might already exist from ProductScreen work)
/*
export interface Category {
    id: string; // Or _id
    name: string;
    image: string; // Assuming image path
    isActive: boolean;
    // ... other fields
}
export const getCategories = async (): Promise<Category[]> => {
    try {
        const response = await axios.get<Category[]>(`${BASE_URL}/categories`); // Adjust endpoint if needed
        return response.data;
    } catch (error) {
        console.error("Error fetching categories:", error);
        throw new Error(`Failed to fetch categories: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
};
*/