import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface CartState {
  items: Array<{ productId: string, quantity: string }>;
  loading: boolean;
  error: string | null;
}

const initialState: CartState = {
  items: [],
  loading: false,
  error: null,
};

const cartSlice = createSlice({
  name: 'cart',
  initialState,
  reducers: {
    addItemToCart(state, action: PayloadAction<{ productId: string, quantity: string }>) {
      state.items.push(action.payload);
    },
    setLoading(state, action: PayloadAction<boolean>) {
      state.loading = action.payload;
    },
    setError(state, action: PayloadAction<string>) {
      state.error = action.payload;
    },
  },
});

export const { addItemToCart, setLoading, setError } = cartSlice.actions;
export default cartSlice.reducer;
