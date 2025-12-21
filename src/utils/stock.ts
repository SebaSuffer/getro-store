import type { Product } from '../data/products';
import { initialProducts } from '../data/products';

const STOCK_STORAGE_KEY = 'gotra_stock';

// Inicializar stock desde productos iniciales
const initializeStock = (): Record<string, number> => {
  if (typeof window === 'undefined') return {};
  
  const stored = localStorage.getItem(STOCK_STORAGE_KEY);
  if (stored) {
    try {
      return JSON.parse(stored);
    } catch {
      // Si hay error, reinicializar
    }
  }
  
  // Si no hay stock guardado, inicializar con valores por defecto de todos los productos
  const defaultStock: Record<string, number> = {};
  initialProducts.forEach(product => {
    defaultStock[product.id] = product.stock;
  });
  
  localStorage.setItem(STOCK_STORAGE_KEY, JSON.stringify(defaultStock));
  return defaultStock;
};

// Obtener stock de un producto
export const getProductStock = (productId: string): number => {
  if (typeof window === 'undefined') return 0;
  
  const stock = initializeStock();
  return stock[productId] || 0;
};

// Actualizar stock de un producto
export const updateProductStock = (productId: string, quantity: number): void => {
  if (typeof window === 'undefined') return;
  
  const stock = initializeStock();
  stock[productId] = Math.max(0, (stock[productId] || 0) - quantity);
  localStorage.setItem(STOCK_STORAGE_KEY, JSON.stringify(stock));
};

// Validar si hay stock suficiente
export const hasStock = (productId: string, quantity: number): boolean => {
  return getProductStock(productId) >= quantity;
};

// Obtener productos con stock actualizado
export const getProductsWithStock = (products: Product[]): Product[] => {
  return products.map(product => ({
    ...product,
    stock: getProductStock(product.id) || product.stock,
  }));
};

// Resetear stock a valores iniciales
export const resetStock = (): void => {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(STOCK_STORAGE_KEY);
  initializeStock();
};
