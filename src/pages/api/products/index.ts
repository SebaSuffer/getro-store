import type { APIRoute } from 'astro';
import { getTursoClient } from '../../../utils/turso';

// GET /api/products - Obtener todos los productos
export const GET: APIRoute = async ({ request }) => {
  const requestId = Math.random().toString(36).substring(7);
  const startTime = Date.now();
  
  try {
    console.log('═══════════════════════════════════════════════════════════');
    console.log(`[API-PRODUCTS-${requestId}] 🚀 Request received`);
    console.log(`[API-PRODUCTS-${requestId}] 📍 URL: ${request.url}`);
    console.log(`[API-PRODUCTS-${requestId}] 📍 Method: ${request.method}`);
    console.log(`[API-PRODUCTS-${requestId}] 🔍 Fetching products from Turso...`);
    
    const clientStartTime = Date.now();
    const client = getTursoClient();
    const clientTime = Date.now() - clientStartTime;
    
    if (!client) {
      console.error(`[API-PRODUCTS-${requestId}] ❌ Turso client not available (took ${clientTime}ms)`);
      console.error(`[API-PRODUCTS-${requestId}] 🔍 Checking environment variables...`);
      console.error(`[API-PRODUCTS-${requestId}]    TURSO_DATABASE_URL: ${process.env.TURSO_DATABASE_URL ? '✓ Set' : '✗ Missing'}`);
      console.error(`[API-PRODUCTS-${requestId}]    TURSO_AUTH_TOKEN: ${process.env.TURSO_AUTH_TOKEN ? '✓ Set' : '✗ Missing'}`);
      
      return new Response(
        JSON.stringify({ 
          error: 'Database not configured',
          details: 'Check TURSO_DATABASE_URL and TURSO_AUTH_TOKEN environment variables'
        }),
        { status: 500, headers: { 'Content-Type': 'application/json' } }
      );
    }

    console.log(`[API-PRODUCTS-${requestId}] ✅ Turso client connected (took ${clientTime}ms)`);
    console.log(`[API-PRODUCTS-${requestId}] 📝 Executing SQL query...`);
    
    const queryStartTime = Date.now();
    const result = await client.execute('SELECT * FROM products ORDER BY created_at DESC');
    const queryTime = Date.now() - queryStartTime;
    
    console.log(`[API-PRODUCTS-${requestId}] ⏱️ Query executed in ${queryTime}ms`);
    console.log(`[API-PRODUCTS-${requestId}] 📊 Query returned ${result.rows.length} rows`);
    
    if (result.rows.length === 0) {
      console.warn(`[API-PRODUCTS-${requestId}] ⚠️ WARNING: No products found in database!`);
      console.warn(`[API-PRODUCTS-${requestId}] ⚠️ Did you run migrate-products.sql?`);
      console.warn(`[API-PRODUCTS-${requestId}] ⚠️ Check: turso/migrate-products.sql`);
    } else {
      console.log(`[API-PRODUCTS-${requestId}] 📋 First 3 rows:`, result.rows.slice(0, 3).map((row: any) => ({
        id: row.id,
        name: row.name,
        price: row.price
      })));
    }
    
    const mapStartTime = Date.now();
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
    const mapTime = Date.now() - mapStartTime;
    
    console.log(`[API-PRODUCTS-${requestId}] ⏱️ Mapping completed in ${mapTime}ms`);
    console.log(`[API-PRODUCTS-${requestId}] ✅ Returning ${products.length} products`);
    
    const totalTime = Date.now() - startTime;
    console.log(`[API-PRODUCTS-${requestId}] ⏱️ Total request time: ${totalTime}ms`);
    console.log('═══════════════════════════════════════════════════════════');
    
    return new Response(JSON.stringify(products), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error: any) {
    const totalTime = Date.now() - startTime;
    console.error('═══════════════════════════════════════════════════════════');
    console.error(`[API-PRODUCTS-${requestId}] ❌ ERROR (took ${totalTime}ms)`);
    console.error(`[API-PRODUCTS-${requestId}] Error type:`, error?.constructor?.name || 'Unknown');
    console.error(`[API-PRODUCTS-${requestId}] Error message:`, error?.message);
    console.error(`[API-PRODUCTS-${requestId}] Error stack:`, error?.stack);
    console.error(`[API-PRODUCTS-${requestId}] Full error:`, error);
    console.error('═══════════════════════════════════════════════════════════');
    
    return new Response(
      JSON.stringify({ 
        error: error.message || 'Error fetching products',
        details: error.stack
      }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
};

