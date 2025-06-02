import { api } from "@/lib/axios";


interface ContactFormInput {
  name: string;
  mobile: string;
  address: string;
}

interface ContactFormResponse {
  message: string;
  data: {
    _id: string;
    name: string;
    mobile: string;
    address: string;
    createdAt: string;
    updatedAt: string;
    __v: number;
  };
}

export const submitContactForm = async (
  input: ContactFormInput
): Promise<ContactFormResponse> => {
  const response = await api.post<ContactFormResponse>('contact/', input);
  return response.data;
};
