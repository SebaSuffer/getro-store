export interface Product {
  id: string;
  name: string;
  description?: string;
  price: number;
  stock: number;
  image_url: string;
  image_alt: string;
  category: string;
  is_new: boolean;
  is_featured: boolean;
}

export interface CartItem {
  product: Product;
  quantity: number;
}

// Cache de productos (para evitar múltiples requests)
let productsCache: Product[] | null = null;
let cacheTimestamp: number = 0;
const CACHE_DURATION = 60000; // 1 minuto

// Obtener todos los productos desde Turso
export const getAllProducts = async (): Promise<Product[]> => {
  // En el servidor, usar cache si está disponible
  if (typeof window === 'undefined') {
    if (productsCache && Date.now() - cacheTimestamp < CACHE_DURATION) {
      return productsCache;
    }
  }

  try {
    const response = await fetch('/api/products');
    if (!response.ok) {
      throw new Error('Failed to fetch products');
    }
    const products = await response.json();
    
    // Actualizar cache
    productsCache = products;
    cacheTimestamp = Date.now();
    
    return products;
  } catch (error) {
    console.error('Error fetching products:', error);
    // Fallback a array vacío si falla
    return [];
  }
};

// Versión síncrona para compatibilidad (devuelve cache o array vacío)
export const getAllProductsSync = (): Product[] => {
  if (typeof window === 'undefined') {
    return productsCache || [];
  }
  return productsCache || [];
};

// Obtener productos destacados
export const getFeaturedProducts = async (): Promise<Product[]> => {
  const allProducts = await getAllProducts();
  return allProducts.filter(p => p.is_featured).slice(0, 4);
};

// Obtener productos por categoría
export const getProductsByCategory = async (category: string): Promise<Product[]> => {
  const allProducts = await getAllProducts();
  return allProducts.filter(p => p.category === category);
};

// Obtener categorías únicas
export const getCategories = async (): Promise<string[]> => {
  const allProducts = await getAllProducts();
  return Array.from(new Set(allProducts.map(p => p.category)));
};

// Obtener producto por ID
export const getProductById = async (id: string): Promise<Product | null> => {
  try {
    const response = await fetch(`/api/products/${id}`);
    if (!response.ok) {
      if (response.status === 404) {
        return null;
      }
      throw new Error('Failed to fetch product');
    }
    return await response.json();
  } catch (error) {
    console.error('Error fetching product:', error);
    return null;
  }
};

// Versión síncrona para compatibilidad
export const getProductByIdSync = (id: string): Product | null => {
  if (!productsCache) return null;
  return productsCache.find(p => p.id === id) || null;
};

// Obtener productos relacionados
export const getRelatedProducts = async (productId: string, limit: number = 4): Promise<Product[]> => {
  const currentProduct = await getProductById(productId);
  if (!currentProduct) return [];

  const allProducts = await getAllProducts();
  
  // Primero, obtener productos de la misma categoría (excluyendo el actual)
  const sameCategory = allProducts.filter(
    p => p.category === currentProduct.category && p.id !== productId
  );

  // Si hay suficientes productos de la misma categoría, devolverlos
  if (sameCategory.length >= limit) {
    return sameCategory.slice(0, limit);
  }

  // Si no hay suficientes, completar con productos destacados
  const featured = allProducts.filter(
    p => p.is_featured && p.id !== productId && !sameCategory.some(sp => sp.id === p.id)
  );

  // Combinar y limitar
  const related = [...sameCategory, ...featured].slice(0, limit);

  // Si aún no hay suficientes, agregar cualquier otro producto
  if (related.length < limit) {
    const others = allProducts.filter(
      p => p.id !== productId && !related.some(r => r.id === p.id)
    );
    related.push(...others.slice(0, limit - related.length));
  }

  return related;
};
