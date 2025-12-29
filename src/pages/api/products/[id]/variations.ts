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
      sql: 'SELECT * FROM product_variations WHERE product_id = ? ORDER BY created_at DESC',
      args: [id],
    });

    const variations = result.rows.map((row: any) => ({
      id: row.id,
      product_id: row.product_id,
      chain_type: row.chain_type,
      length: row.length,
      thickness: row.thickness,
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

