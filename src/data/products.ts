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
  discount_percent?: number;
  is_active?: boolean;
  has_variations?: boolean;
  variation_count?: number;
}

export interface CartItem {
  product: Product;
  quantity: number;
  variation?: {
    id: string;
    brand: string;
    thickness: string;
    length: string;
    price_modifier: number;
  };
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

      // En la landing page, solo mostrar productos activos
      // En el admin, mostrar todos (se filtra en el cliente)
      const sql = 'SELECT * FROM products ORDER BY created_at DESC';
      
      const result = await client.execute(sql);
      
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
        discount_percent: Number(row.discount_percent) || 0,
        is_active: row.is_active !== undefined ? Boolean(row.is_active) : true,
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
    console.log('[PRODUCTS-CLIENT] 🌐 Starting fetch to /api/products...');
    const startTime = Date.now();
    
    const response = await fetch('/api/products');
    const fetchTime = Date.now() - startTime;
    
    console.log(`[PRODUCTS-CLIENT] ⏱️ Fetch completed in ${fetchTime}ms`);
    console.log(`[PRODUCTS-CLIENT] 📡 Response status: ${response.status} ${response.statusText}`);
    console.log(`[PRODUCTS-CLIENT] 📡 Response headers:`, {
      'content-type': response.headers.get('content-type'),
      'content-length': response.headers.get('content-length')
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('[PRODUCTS-CLIENT] ❌ API error response:', {
        status: response.status,
        statusText: response.statusText,
        body: errorText
      });
      throw new Error(`Failed to fetch products: ${response.status} - ${errorText}`);
    }
    
    const parseStartTime = Date.now();
    const allProducts = await response.json();
    // En el cliente (landing page), filtrar solo productos activos
    const products = allProducts.filter((p: Product) => p.is_active !== false);
    const parseTime = Date.now() - parseStartTime;
    
    console.log(`[PRODUCTS-CLIENT] ⏱️ JSON parse completed in ${parseTime}ms`);
    console.log(`[PRODUCTS-CLIENT] ✅ Loaded ${products.length} products from API (filtered from ${allProducts.length} total)`);
    
    if (products.length === 0) {
      console.warn('[PRODUCTS-CLIENT] ⚠️ WARNING: No products returned from API!');
      console.warn('[PRODUCTS-CLIENT] ⚠️ This could mean:');
      console.warn('[PRODUCTS-CLIENT]   1. Database is empty (run migrate-products.sql)');
      console.warn('[PRODUCTS-CLIENT]   2. Environment variables not set (TURSO_DATABASE_URL, TURSO_AUTH_TOKEN)');
      console.warn('[PRODUCTS-CLIENT]   3. API route is failing');
    } else {
      console.log('[PRODUCTS-CLIENT] 📋 Products sample:', products.slice(0, 3).map(p => ({
        id: p.id,
        name: p.name,
        price: p.price,
        stock: p.stock
      })));
    }
    
    // Actualizar cache
    productsCache = products;
    cacheTimestamp = Date.now();
    console.log('[PRODUCTS-CLIENT] 💾 Cache updated');
    
    return products;
  } catch (error: any) {
    console.error('═══════════════════════════════════════════════════════════');
    console.error('[PRODUCTS-CLIENT] ❌ ERROR fetching products');
    console.error('[PRODUCTS-CLIENT] Error type:', error?.constructor?.name || 'Unknown');
    console.error('[PRODUCTS-CLIENT] Error message:', error?.message);
    console.error('[PRODUCTS-CLIENT] Error stack:', error?.stack);
    console.error('[PRODUCTS-CLIENT] Full error:', error);
    console.error('═══════════════════════════════════════════════════════════');
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

// Obtener productos destacados (máximo 8 para 2 filas)
export const getFeaturedProducts = async (): Promise<Product[]> => {
  const allProducts = await getAllProducts();
  return allProducts.filter(p => p.is_featured).slice(0, 8);
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
        discount_percent: Number(row.discount_percent) || 0,
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
