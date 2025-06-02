import { create } from 'zustand';

type CartState = {
  cartCount: number;
  cartProductIds: string[];
  setCartCount: (count: number) => void;
  addToCart: (productId: string) => void;
  removeFromCart: (productId: string) => void;
  setCartProducts: (productIds: string[]) => void;
};

export const useCartStore = create<CartState>((set) => ({
  cartCount: 0,
  cartProductIds: [],
  setCartCount: (count) => set({ cartCount: count }),
  addToCart: (productId) =>
    set((state) => ({
      cartCount: state.cartCount + 1,
      cartProductIds: [...new Set([...state.cartProductIds, productId])],
    })),
  removeFromCart: (productId) =>
    set((state) => ({
      cartCount: Math.max(0, state.cartCount - 1),
      cartProductIds: state.cartProductIds.filter((id) => id !== productId),
    })),
  setCartProducts: (productIds) =>
    set({
      cartProductIds: productIds,
      cartCount: productIds.length,
    }),
}));

