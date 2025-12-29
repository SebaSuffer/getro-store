import type { Product, CartItem } from '../data/products';
import { hasStock, updateProductStock, getProductStock } from './stock';

const CART_STORAGE_KEY = 'gotra_cart';

export const getCart = (): CartItem[] => {
  if (typeof window === 'undefined') return [];
  
  const cartData = localStorage.getItem(CART_STORAGE_KEY);
  if (!cartData) return [];
  
  try {
    return JSON.parse(cartData);
  } catch {
    return [];
  }
};

export const addToCart = async (
  product: Product, 
  quantity: number = 1, 
  variation?: { id: string; brand: string; thickness: string; length: string; price_modifier: number }
): Promise<boolean> => {
  if (typeof window === 'undefined') return false;
  
  // Validar stock antes de agregar
  const stockAvailable = await hasStock(product.id, quantity);
  if (!stockAvailable) {
    return false;
  }
  
  const cart = getCart();
  
  // Para productos con variaciones, buscar por producto + variación
  // Para productos sin variaciones, buscar solo por producto
  const existingItemIndex = variation
    ? cart.findIndex(item => 
        item.product.id === product.id && 
        item.variation?.id === variation.id
      )
    : cart.findIndex(item => 
        item.product.id === product.id && 
        !item.variation
      );
  
  if (existingItemIndex >= 0) {
    const newQuantity = cart[existingItemIndex].quantity + quantity;
    const newStockAvailable = await hasStock(product.id, newQuantity);
    if (!newStockAvailable) {
      return false;
    }
    cart[existingItemIndex].quantity = newQuantity;
  } else {
    cart.push({ product, quantity, variation });
  }
  
  localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cart));
  window.dispatchEvent(new Event('cartUpdated'));
  return true;
};

export const removeFromCart = (productId: string): void => {
  if (typeof window === 'undefined') return;
  
  const cart = getCart().filter(item => item.product.id !== productId);
  localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cart));
  window.dispatchEvent(new Event('cartUpdated'));
};

export const updateCartItemQuantity = async (productId: string, quantity: number): Promise<boolean> => {
  if (typeof window === 'undefined') return false;
  
  if (quantity <= 0) {
    removeFromCart(productId);
    return true;
  }
  
  // Validar stock
  const stockAvailable = await hasStock(productId, quantity);
  if (!stockAvailable) {
    return false;
  }
  
  const cart = getCart();
  const item = cart.find(item => item.product.id === productId);
  
  if (item) {
    item.quantity = quantity;
    localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cart));
    window.dispatchEvent(new Event('cartUpdated'));
    return true;
  }
  
  return false;
};

export const clearCart = (): void => {
  if (typeof window === 'undefined') return;
  
  localStorage.removeItem(CART_STORAGE_KEY);
  window.dispatchEvent(new Event('cartUpdated'));
};

export const getCartItemCount = (): number => {
  const cart = getCart();
  return cart.reduce((total, item) => total + item.quantity, 0);
};

export const getCartTotal = (): number => {
  const cart = getCart();
  return cart.reduce((total, item) => {
    const itemPrice = item.product.price + (item.variation?.price_modifier || 0);
    return total + (itemPrice * item.quantity);
  }, 0);
};

// Procesar compra: descontar stock y limpiar carrito
export const processPurchase = async (): Promise<void> => {
  if (typeof window === 'undefined') return;
  
  const cart = getCart();
  
  // Descontar stock de cada producto
  for (const item of cart) {
    const currentStock = await getProductStock(item.product.id);
    const newStock = Math.max(0, currentStock - item.quantity);
    await updateProductStock(item.product.id, newStock, 'sale');
  }
  
  // Limpiar carrito
  clearCart();
};
