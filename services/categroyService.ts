import { api } from "@/lib/axios";
import axios from "axios";


export interface Category {
  id: string;
  name: string;
  image: string;
  isActive: boolean;
}

export const getCategories = async (): Promise<Category[]> => {
  const response = await api.get<Category[]>('/categories');
  return response.data;
};