import type { APIRoute } from 'astro';
import { getTursoClient } from '../../../utils/turso';

// POST /api/orders - Crear una nueva orden
export const POST: APIRoute = async ({ request }) => {
  try {
    const body = await request.json();
    const {
      id,
      customer_name,
      customer_email,
      customer_phone,
      customer_address,
      total_amount,
      payment_method,
      items,
      status = 'pending',
    } = body;

    if (!id || !customer_name || !customer_email || !customer_address || !total_amount || !payment_method || !items) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields' }),
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

    await client.execute({
      sql: `INSERT INTO orders (id, customer_name, customer_email, customer_phone, customer_address, total_amount, payment_method, status, items)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      args: [
        id,
        customer_name,
        customer_email,
        customer_phone || null,
        customer_address,
        total_amount,
        payment_method,
        status,
        JSON.stringify(items),
      ],
    });

    return new Response(JSON.stringify({ success: true, orderId: id }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error: any) {
    console.error('Error creating order:', error);
    return new Response(
      JSON.stringify({ error: error.message || 'Error creating order' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
};

// GET /api/orders - Obtener todas las órdenes
export const GET: APIRoute = async () => {
  try {
    const client = getTursoClient();
    
    if (!client) {
      return new Response(
        JSON.stringify({ error: 'Database not configured' }),
        { status: 500, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const result = await client.execute('SELECT * FROM orders ORDER BY created_at DESC');
    
    const orders = result.rows.map((row: any) => ({
      id: row.id,
      customer_name: row.customer_name,
      customer_email: row.customer_email,
      customer_phone: row.customer_phone,
      customer_address: row.customer_address,
      total_amount: row.total_amount,
      payment_method: row.payment_method,
      status: row.status,
      items: JSON.parse(row.items),
      created_at: row.created_at,
      updated_at: row.updated_at,
    }));

    return new Response(JSON.stringify(orders), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error: any) {
    console.error('Error fetching orders:', error);
    return new Response(
      JSON.stringify({ error: error.message || 'Error fetching orders' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
};

