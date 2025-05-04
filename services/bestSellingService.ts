import { api } from "@/lib/axios";

export interface BestSelling {
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

// Dummy data for now
// const dummyBestSelling: BestSelling[] = [
//   {
//     id: "1",
//     name: "Fresh Organic Tomatoes",
//     image: "https://images.unsplash.com/photo-1592924357228-91a4daadcfea?q=80&w=2070&auto=format&fit=crop",
//     price: 2.99,
//     unit: "kg",
//     rating: 4.8,
//     sold: 1200
//   },
//   {
//     id: "2",
//     name: "Green Lettuce",
//     image: "https://images.unsplash.com/photo-1622205313162-be1d5712a43c?q=80&w=2013&auto=format&fit=crop",
//     price: 1.99,
//     unit: "piece",
//     rating: 4.7,
//     sold: 980
//   },
//   {
//     id: "3",
//     name: "Fresh Carrots",
//     image: "https://images.unsplash.com/photo-1598170845058-32b9d6a5da37?q=80&w=1974&auto=format&fit=crop",
//     price: 3.49,
//     unit: "kg",
//     rating: 4.9,
//     sold: 1500
//   },
//   {
//     id: "4",
//     name: "Red Bell Peppers",
//     image: "https://images.unsplash.com/photo-1563565375-f3fdfdbefa83?q=80&w=1974&auto=format&fit=crop",
//     price: 4.99,
//     unit: "kg",
//     rating: 4.6,
//     sold: 850
//   }
// ];

export const getBestSelling = async (): Promise<BestSelling[]> => {

    try {
        const response = await api.get('/customer/best-selling');
        
        return response.data;
      } catch (error: any) {
        console.error('Error fetching cart items:', error.response?.data || error.message);
        throw new Error('Failed to fetch cart items');
      }
};