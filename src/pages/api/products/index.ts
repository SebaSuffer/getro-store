import type { APIRoute } from 'astro';
import { getTursoClient } from '../../../utils/turso';

// GET /api/products - Obtener todos los productos
export const GET: APIRoute = async () => {
  try {
    console.log('[API-PRODUCTS] Fetching products from Turso...');
    const client = getTursoClient();
    
    if (!client) {
      console.error('[API-PRODUCTS] ❌ Turso client not available');
      console.error('[API-PRODUCTS] Check TURSO_DATABASE_URL and TURSO_AUTH_TOKEN environment variables');
      return new Response(
        JSON.stringify({ 
          error: 'Database not configured',
          details: 'Check TURSO_DATABASE_URL and TURSO_AUTH_TOKEN environment variables'
        }),
        { status: 500, headers: { 'Content-Type': 'application/json' } }
      );
    }

    console.log('[API-PRODUCTS] ✅ Turso client connected, executing query...');
    const result = await client.execute('SELECT * FROM products ORDER BY created_at DESC');
    console.log(`[API-PRODUCTS] ✅ Query returned ${result.rows.length} rows`);
    
    if (result.rows.length === 0) {
      console.warn('[API-PRODUCTS] ⚠️ No products found in database. Did you run migrate-products.sql?');
    }
    
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

    console.log(`[API-PRODUCTS] ✅ Returning ${products.length} products`);
    return new Response(JSON.stringify(products), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error: any) {
    console.error('[API-PRODUCTS] ❌ Error fetching products:', error);
    console.error('[API-PRODUCTS] Error details:', {
      message: error.message,
      stack: error.stack,
      name: error.name,
    });
    return new Response(
      JSON.stringify({ 
        error: error.message || 'Error fetching products',
        details: error.stack
      }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
};

