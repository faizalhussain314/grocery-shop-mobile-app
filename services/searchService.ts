// src/services/searchService.ts (or productService.ts)

// Import the main Product type (which requires '_id')
import { Product } from './productService'; // Adjust path if needed
import { api } from '@/lib/axios'; // Adjust path

// Define a temporary type for the raw API response (optional but good practice)
interface ApiSearchProduct {
  _id: string; // API returns _id
  name: string;
  category: string;
  price: number;
  unit: string;
  stock: number;
  active: boolean;
  image: string; // Direct image URL from API
  createdAt: string;
  updatedAt: string;
  description?: string;
  subcategory?: string;
  __v?: number;
}

// Updated search function with mapping
export const searchProductsByName = async (name: string): Promise<Product[]> => {
  if (!name.trim()) {
    return [];
  }
  try {
    const response = await api.get<ApiSearchProduct[]>( // Expecting the raw API type
      `/customer/products?name=${encodeURIComponent(name)}`
    );

    const rawResults = response.data || [];

    // Map the raw results (_id) to the application's Product type (_id)
    const mappedResults: Product[] = rawResults.map((apiProduct) => ({
      // Map _id from API response to _id in the Product type
      _id: apiProduct._id,
      name: apiProduct.name,
      category: apiProduct.category,
      price: apiProduct.price,
      unit: apiProduct.unit,
      stock: apiProduct.stock,
      active: apiProduct.active,
      image: apiProduct.image,
      description: apiProduct.description,
      subcategory: apiProduct.subcategory,
      createdAt: apiProduct.createdAt,
      updatedAt: apiProduct.updatedAt,
      // Make sure ALL properties required by your Product interface are included here
      // For example, if Product also requires 'imageUrl', you'd need to map that.
    }));

    return mappedResults; // Return the array conforming to the Product type (with '_id')

  } catch (error) {
    console.error("Error searching products:", error);
    throw error; // Re-throw or handle as needed
  }
};