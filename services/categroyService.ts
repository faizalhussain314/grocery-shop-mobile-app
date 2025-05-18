// services/categoryService.ts
import { api } from '@/lib/axios';

/** Raw category the API sends */
export interface CategoryDTO {
  _id: string;
  name: string;
  image: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

/** Shape of the whole paginated payload */
interface CategoriesResponse {
  limit: number;
  page: number;
  totalPages: number;
  totalResults: number;
  results: CategoryDTO[];
}

/** Category type you want to expose to the app */
export interface Category {
  id: string;
  name: string;
  image: string;
  isActive: boolean;
}

/** Fetch & transform */
export const getCategories = async (): Promise<Category[]> => {
  const { data } = await api.get<CategoriesResponse>('/categories');

  // Convert `_id` → `id` so the component code stays nice and flat
  return data.results.map(({ _id, ...rest }) => ({
    id: _id,
    ...rest,
  }));
};
