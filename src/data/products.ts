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
  // En el servidor, usar Turso directamente
  if (typeof window === 'undefined') {
    if (productsCache && Date.now() - cacheTimestamp < CACHE_DURATION) {
      return productsCache;
    }

    try {
      const { getTursoClient } = await import('../utils/turso');
      const client = getTursoClient();
      
      if (!client) {
        console.error('[SERVER] Turso client not available - check environment variables');
        return [];
      }

      const result = await client.execute('SELECT * FROM products ORDER BY created_at DESC');
      
      const products = result.rows.map((row: any) => ({
        id: row.id,
        name: row.name,
        description: row.description,
        price: row.price,
        stock: row.stock,
        image_url: row.image_url,
        image_alt: row.image_alt,
        category: row.category,
        is_new: Boolean(row.is_new),
        is_featured: Boolean(row.is_featured),
      }));

      // Actualizar cache
      productsCache = products;
      cacheTimestamp = Date.now();
      
      console.log(`[PRODUCTS-SERVER] ✅ Loaded ${products.length} products from Turso`);
      if (products.length === 0) {
        console.warn('[PRODUCTS-SERVER] ⚠️ No products found. Did you run migrate-products.sql?');
      }
      return products;
    } catch (error: any) {
      console.error('[PRODUCTS-SERVER] ❌ Error fetching products from Turso:', error);
      console.error('[PRODUCTS-SERVER] Error details:', {
        message: error.message,
        stack: error.stack,
      });
      return [];
    }
  }

  // En el cliente, usar API
  try {
    const response = await fetch('/api/products');
    if (!response.ok) {
      const errorText = await response.text();
      console.error('[CLIENT] API error:', response.status, errorText);
      throw new Error(`Failed to fetch products: ${response.status}`);
    }
    const products = await response.json();
    
    console.log(`[PRODUCTS-CLIENT] ✅ Loaded ${products.length} products from API`);
    if (products.length === 0) {
      console.warn('[PRODUCTS-CLIENT] ⚠️ No products returned. Check API and database.');
    }
    
    // Actualizar cache
    productsCache = products;
    cacheTimestamp = Date.now();
    
    return products;
  } catch (error: any) {
    console.error('[PRODUCTS-CLIENT] ❌ Error fetching products:', error);
    console.error('[PRODUCTS-CLIENT] Error details:', {
      message: error.message,
      stack: error.stack,
    });
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
  // En el servidor, usar Turso directamente
  if (typeof window === 'undefined') {
    try {
      const { getTursoClient } = await import('../utils/turso');
      const client = getTursoClient();
      
      if (!client) {
        console.error('[SERVER] Turso client not available');
        return null;
      }

      const result = await client.execute({
        sql: 'SELECT * FROM products WHERE id = ?',
        args: [id],
      });

      if (result.rows.length === 0) {
        return null;
      }

      const row = result.rows[0] as any;
      return {
        id: row.id,
        name: row.name,
        description: row.description,
        price: row.price,
        stock: row.stock,
        image_url: row.image_url,
        image_alt: row.image_alt,
        category: row.category,
        is_new: Boolean(row.is_new),
        is_featured: Boolean(row.is_featured),
      };
    } catch (error: any) {
      console.error('[SERVER] Error fetching product from Turso:', error);
      return null;
    }
  }

  // En el cliente, usar API
  try {
    const response = await fetch(`/api/products/${id}`);
    if (!response.ok) {
      if (response.status === 404) {
        console.log(`[CLIENT] Product ${id} not found`);
        return null;
      }
      const errorText = await response.text();
      console.error('[CLIENT] API error:', response.status, errorText);
      throw new Error(`Failed to fetch product: ${response.status}`);
    }
    const product = await response.json();
    console.log(`[CLIENT] Loaded product: ${product.name}`);
    return product;
  } catch (error: any) {
    console.error('[CLIENT] Error fetching product:', error);
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
