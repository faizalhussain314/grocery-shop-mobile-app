import { useDispatch } from 'react-redux';
import type { AppDispatch } from '../store/store'; // Adjust path if needed

export const useAppDispatch = () => useDispatch<AppDispatch>();
