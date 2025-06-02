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
export const searchProductsByName = async (
  name: string,
  page = 1,
  limit = 10
): Promise<{ results: Product[]; hasMore: boolean }> => {
  if (!name.trim()) return { results: [], hasMore: false };

  try {
    const response = await api.get(`/customer/products`, {
      params: { name, page, limit },
    });

    const rawResults: ApiSearchProduct[] = response.data.results || [];

    const mappedResults: Product[] = rawResults.map(apiProduct => ({
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
    }));

    const hasMore = response.data.hasMore ?? (rawResults.length === limit);

    return { results: mappedResults, hasMore };

  } catch (error) {
    console.error("Error searching products:", error);
    throw error;
  }
};
