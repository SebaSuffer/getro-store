import type { APIRoute } from 'astro';
import { getTursoClient } from '../../../../utils/turso';

// GET /api/products/[id]/variations - Obtener variaciones de un producto
export const GET: APIRoute = async ({ params }) => {
  try {
    const { id } = params;
    
    if (!id) {
      return new Response(
        JSON.stringify({ error: 'Product ID required' }),
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

    const result = await client.execute({
      sql: 'SELECT * FROM product_variations WHERE product_id = ? ORDER BY brand, thickness, length',
      args: [id],
    });

    const variations = result.rows.map((row: any) => ({
      id: row.id,
      product_id: row.product_id,
      chain_type: row.chain_type,
      brand: row.brand,
      thickness: row.thickness,
      length: row.length,
      price_modifier: row.price_modifier,
      stock: row.stock,
      is_active: Boolean(row.is_active),
      created_at: row.created_at,
      updated_at: row.updated_at,
    }));

    return new Response(JSON.stringify(variations), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error: any) {
    console.error('Error fetching product variations:', error);
    return new Response(
      JSON.stringify({ error: error.message || 'Error fetching variations' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
};

// POST /api/products/[id]/variations - Crear o actualizar variaciones
export const POST: APIRoute = async ({ params, request }) => {
  try {
    const { id } = params;
    
    if (!id) {
      return new Response(
        JSON.stringify({ error: 'Product ID required' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const body = await request.json();
    const { variations } = body;

    if (!Array.isArray(variations)) {
      return new Response(
        JSON.stringify({ error: 'Variations must be an array' }),
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

    // Eliminar variaciones existentes del producto
    await client.execute({
      sql: 'DELETE FROM product_variations WHERE product_id = ?',
      args: [id],
    });

    // Insertar nuevas variaciones
    for (const variation of variations) {
      const variationId = `var-${id}-${variation.brand}-${variation.thickness}-${variation.length}`.replace(/[^a-zA-Z0-9-]/g, '-');
      
      await client.execute({
        sql: `INSERT INTO product_variations 
              (id, product_id, chain_type, brand, thickness, length, price_modifier, stock, is_active, created_at, updated_at)
              VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, datetime('now'), datetime('now'))`,
        args: [
          variationId,
          id,
          variation.chain_type || 'plata_925',
          variation.brand,
          variation.thickness,
          variation.length,
          variation.price_modifier || 0,
          variation.stock || 0,
          variation.is_active !== false ? 1 : 0,
        ],
      });
    }

    return new Response(
      JSON.stringify({ success: true, count: variations.length }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
  } catch (error: any) {
    console.error('Error saving product variations:', error);
    return new Response(
      JSON.stringify({ error: error.message || 'Error saving variations' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
};
