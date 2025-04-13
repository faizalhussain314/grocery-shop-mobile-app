import { configureStore } from '@reduxjs/toolkit';
import cartReducer from '../slice/cartSlice'; // Update this path as needed

const store = configureStore({
  reducer: {
    cart: cartReducer,
  },
});

export default store;
