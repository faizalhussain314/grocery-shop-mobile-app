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
    nutrition?: {
      calories?: number;
      protein?: string;
      carbs?: string;
      fiber?: string;
    };
  }
  
  export const getProducts = async (): Promise<Product[]> => {
    
    const response = await api.get("/customer/products");
   console.log("reponse", response.data)
    return response.data; 
  };

  export const getProductById = async (productId: string): Promise<Product> => {
    const res = await api.get(`/products/${productId}`);
    return res.data;
  };
  
  
