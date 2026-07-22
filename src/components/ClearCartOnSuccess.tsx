import { useEffect } from 'react';
import { clearCart } from '../utils/cart';

interface ClearCartOnSuccessProps {
  shouldClear: boolean;
}

const ClearCartOnSuccess = ({ shouldClear }: ClearCartOnSuccessProps) => {
  useEffect(() => {
    if (!shouldClear) return;
    clearCart();
  }, [shouldClear]);

  return null;
};

export default ClearCartOnSuccess;
