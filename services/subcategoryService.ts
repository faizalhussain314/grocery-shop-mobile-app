import { api } from '@/lib/axios';

export interface Subcategory {
  _id: string;
  name: string;
  category: string;
  image: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

/* --- envelope --------------------------------------------------- */
interface SubcategoryPage {
  page: number;
  limit: number;
  totalPages: number;
  totalResults: number;
  results: Subcategory[];
}

/**
 * Fetch sub-categories for a given category name.
 */
export const getSubcategoriesByCategoryName = async (
  categoryName: string,
): Promise<Subcategory[]> => {
  const { data } = await api.get<SubcategoryPage>('/subcategories', {
    params: { category: categoryName },
  });

  return data.results;            // ← unwrap here
};
