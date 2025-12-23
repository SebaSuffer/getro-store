import type { APIRoute } from 'astro';
import { getTursoClient } from '../../../utils/turso';

// GET /api/stock/[id] - Obtener stock de un producto
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
      sql: 'SELECT stock FROM products WHERE id = ?',
      args: [id],
    });

    if (result.rows.length === 0) {
      return new Response(
        JSON.stringify({ error: 'Product not found' }),
        { status: 404, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const stock = (result.rows[0] as any).stock;

    return new Response(JSON.stringify({ stock }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error: any) {
    console.error('Error fetching stock:', error);
    return new Response(
      JSON.stringify({ error: error.message || 'Error fetching stock' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
};

// PUT /api/stock/[id] - Actualizar stock de un producto
export const PUT: APIRoute = async ({ params, request }) => {
  try {
    const { id } = params;
    
    if (!id) {
      return new Response(
        JSON.stringify({ error: 'Product ID required' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const body = await request.json();
    const { quantity, change_type = 'adjustment' } = body;

    if (typeof quantity !== 'number') {
      return new Response(
        JSON.stringify({ error: 'Quantity must be a number' }),
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

    // Actualizar stock del producto
    await client.execute({
      sql: 'UPDATE products SET stock = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
      args: [quantity, id],
    });

    // Registrar en historial de stock
    await client.execute({
      sql: 'INSERT INTO stock_history (product_id, quantity, change_type) VALUES (?, ?, ?)',
      args: [id, quantity, change_type],
    });

    return new Response(JSON.stringify({ success: true, stock: quantity }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error: any) {
    console.error('Error updating stock:', error);
    return new Response(
      JSON.stringify({ error: error.message || 'Error updating stock' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
};



