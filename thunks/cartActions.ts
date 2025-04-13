import { Dispatch } from 'redux';
import { addToCart as addToCartService } from '@/services/cartService';
import { addItemToCart, setLoading, setError } from '@/slice/cartSlice';

export const addItemToCartThunk = (productId: string, quantity: string) => async (dispatch: Dispatch) => {
  dispatch(setLoading(true));
  try {
    const data = await addToCartService(productId, quantity);
    dispatch(addItemToCart({ productId, quantity }));
    dispatch(setLoading(false));
  } catch (error) {
    dispatch(setError('Failed to add item to cart'));
    dispatch(setLoading(false));
  }
};
