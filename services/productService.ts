import { api } from "@/lib/axios";

export interface Product {
    _id: string;
    name: string;
    image: string;
    price: number;
    unit: string;
    category: string;
    active: boolean;
    stock: number;
  }

  export interface Product {
    _id: string;
    name: string;
    image: string;
    price: number;
    unit: string;
    stock: number;
    category: string;
    active: boolean;
    description?: string;
    rating?: number;
   
  }

  export interface QuickPicks {
    _id: string;
    name: string;
    category: string;
    subcategory: string;
    price: number;
    unit: string;
    stock: number;
    active: boolean;
    description: string;
    image: string;
    createdAt: Date | string;
    updatedAt: Date | string;
    __v: number;
    quickPicks: boolean;
  }
  
  
  export const getProducts = async (): Promise<Product[]> => {
    const response = await api.get("/customer/products");
  
    // Safely return the product array
    return Array.isArray(response.data.results) ? response.data.results : [];
  };
  

  export const getProductById = async (productId: string): Promise<Product> => {
    const res = await api.get(`/products/${productId}`);
    return res.data;
  };
  
  export const getProductsBySubCat = async (
    subCatId: string,
    page: number = 1,
    limit: number = 10
  ): Promise<{
    results: Product[];
    page: number;
    totalPages: number;
    totalResults: number;
  }> => {
    const res = await api.get(`/customer/subcategory/${subCatId}?page=${page}&limit=${limit}`);
    return res.data;
  };
  
  

  export const getQuickPicks = async (): Promise<QuickPicks[]> =>{
    const res = await api.get("/customer/quick-picks");

  return res.data;
  }

  export const getNewlyAddedProducts = async (): Promise<Product[]> => {
    const response = await api.get('/customer/newly-added');
    return response.data;
  };

 