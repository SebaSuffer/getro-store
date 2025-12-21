import type { Product, CartItem } from '../data/products';
import { hasStock, updateProductStock } from './stock';

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

export const addToCart = (product: Product, quantity: number = 1): boolean => {
  if (typeof window === 'undefined') return false;
  
  // Validar stock antes de agregar
  if (!hasStock(product.id, quantity)) {
    return false;
  }
  
  const cart = getCart();
  const existingItemIndex = cart.findIndex(item => item.product.id === product.id);
  
  if (existingItemIndex >= 0) {
    const newQuantity = cart[existingItemIndex].quantity + quantity;
    if (!hasStock(product.id, newQuantity)) {
      return false;
    }
    cart[existingItemIndex].quantity = newQuantity;
  } else {
    cart.push({ product, quantity });
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

export const updateCartItemQuantity = (productId: string, quantity: number): boolean => {
  if (typeof window === 'undefined') return false;
  
  if (quantity <= 0) {
    removeFromCart(productId);
    return true;
  }
  
  // Validar stock
  if (!hasStock(productId, quantity)) {
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
  return cart.reduce((total, item) => total + (item.product.price * item.quantity), 0);
};

// Procesar compra: descontar stock y limpiar carrito
export const processPurchase = (): void => {
  if (typeof window === 'undefined') return;
  
  const cart = getCart();
  
  // Descontar stock de cada producto
  cart.forEach(item => {
    updateProductStock(item.product.id, item.quantity);
  });
  
  // Limpiar carrito
  clearCart();
};
