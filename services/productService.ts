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
  
    return response.data; 
  };

  export const getProductById = async (productId: string): Promise<Product> => {
    const res = await api.get(`/products/${productId}`);
    return res.data;
  };
  
  export const getProductsBySubCat = async (
    subCatId: string
  ): Promise<Product[]> => {
    const res = await api.get(`/customer/subcategory/${subCatId}`);
  
   
    // Ensure the result is always an array of Product
    const data: Product[] = Array.isArray(res.data)
      ? res.data                      
      : res.data                      
      ? [res.data]                    
      : [];                          
      console.log("getProductBysub",data)
    return data;
  };
  

  export const getQuickPicks = async (): Promise<QuickPicks[]> =>{
    const res = await api.get<QuickPicks[]>("/customer/quick-picks");

  return res.data;
  }

 