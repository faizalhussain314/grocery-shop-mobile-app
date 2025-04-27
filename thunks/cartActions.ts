// Inside @/thunks/cartActions.ts
import { Dispatch } from 'redux';
import { addToCart as addToCartService } from '@/services/cartService';
import { addItemToCart, setLoading, setError } from '@/slice/cartSlice';

export const addItemToCartThunk = (productId: string, quantity: string) => async (dispatch: Dispatch) => {
  dispatch(setLoading(true));
  try {
    console.log("Thunk: Calling addToCartService...");
    const data = await addToCartService(productId, quantity);
    console.log("Thunk: addToCartService successful", data); 

   
    dispatch(addItemToCart({ productId, quantity }));

    dispatch(setLoading(false));
   
    return data;
  } catch (error: any) { 
    console.error("Thunk: Error in addItemToCartThunk:", error); 
    dispatch(setError('Failed to add item to cart: ' + (error.message || 'Unknown error'))); // Include error message in state
    dispatch(setLoading(false));

   
    throw error;
  }
};