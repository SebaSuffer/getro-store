import type { APIRoute } from 'astro';
import { getTursoClient } from '../../../utils/turso';
import { normalizeDiscountPercent } from '../../../utils/pricing';

let discountColumnReady = false;

const ensureDiscountPercentColumn = async (client: any): Promise<void> => {
  if (discountColumnReady) return;

  const tableInfo = await client.execute({
    sql: "PRAGMA table_info(products)",
    args: [],
  });

  const hasDiscountPercent = tableInfo.rows.some((row: any) => row.name === 'discount_percent');
  if (!hasDiscountPercent) {
    await client.execute("ALTER TABLE products ADD COLUMN discount_percent INTEGER NOT NULL DEFAULT 0");
  }
  discountColumnReady = true;
};

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

    // Asegura compatibilidad con bases antiguas sin columna de descuento
    await ensureDiscountPercentColumn(client);

    console.log(`[API-PRODUCTS-${requestId}] ✅ Turso client connected (took ${clientTime}ms)`);
    console.log(`[API-PRODUCTS-${requestId}] 📝 Executing SQL query...`);
    
    // Verificar si es una petición del admin (header o query param)
    const url = new URL(request.url);
    const isAdmin = url.searchParams.get('admin') === 'true' || request.headers.get('x-admin') === 'true';
    
    const queryStartTime = Date.now();
    const whereClause = isAdmin ? '' : 'WHERE (p.is_active = 1 OR p.is_active IS NULL)';
    const result = await client.execute(`
      SELECT p.*, COUNT(pv.id) AS variation_count
      FROM products p
      LEFT JOIN product_variations pv ON p.id = pv.product_id
      ${whereClause}
      GROUP BY p.id
      ORDER BY p.created_at DESC
    `);
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
      is_active: row.is_active !== undefined ? Boolean(row.is_active) : true,
      has_variations: Boolean(row.variation_count),
      variation_count: row.variation_count,
      display_price: row.display_price || null,
      discount_percent: normalizeDiscountPercent(row.discount_percent),
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

// POST /api/products - Crear un nuevo producto
export const POST: APIRoute = async ({ request }) => {
  try {
    const body = await request.json();
    const { name, description, price, stock, category, image_url, image_alt, is_new, is_featured, chain_type, discount_percent } = body;

    // Validaciones
    if (!name || !category || !price || price <= 0) {
      return new Response(
        JSON.stringify({ error: 'Nombre, categoría y precio son requeridos' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const client = getTursoClient();
    if (!client) {
      return new Response(
        JSON.stringify({ error: 'Database not configured' }),
        { status: 500, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Generar ID único
    const id = 'prod-' + Date.now().toString(36) + '-' + Math.random().toString(36).substr(2, 9);

    await ensureDiscountPercentColumn(client);
    const safeDiscountPercent = normalizeDiscountPercent(discount_percent);
    await client.execute({
      sql: `INSERT INTO products (id, name, description, price, stock, category, image_url, image_alt, is_new, is_featured, is_active, discount_percent, created_at, updated_at)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, datetime('now'), datetime('now'))`,
      args: [
        id,
        name,
        description || '',
        price,
        stock || 0,
        category,
        image_url || '',
        image_alt || name,
        is_new ? 1 : 0,
        is_featured ? 1 : 0,
        (body.is_active !== undefined ? (body.is_active ? 1 : 0) : 1),
        safeDiscountPercent,
      ],
    });

    // Las variaciones ahora se gestionan manualmente desde el panel de administración
    // No se crean automáticamente al crear el producto

    return new Response(
      JSON.stringify({ 
        success: true, 
        id,
        message: 'Producto creado correctamente' 
      }),
      { 
        status: 201, 
        headers: { 'Content-Type': 'application/json' } 
      }
    );
  } catch (error: any) {
    console.error('Error creating product:', error);
    return new Response(
      JSON.stringify({ 
        error: error.message || 'Error al crear el producto',
        details: error.stack
      }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
};

