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
      customer_rut,
      total_amount,
      payment_method,
      items,
      status = 'pending',
      payment_status = 'pending',
      shipping_status = 'not_shipped',
      mercado_pago_preference_id,
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
      sql: `INSERT INTO orders (
              id, customer_name, customer_email, customer_phone, customer_address, customer_rut,
              total_amount, payment_method, status, payment_status, shipping_status,
              items, mercado_pago_preference_id, created_at, updated_at
            )
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, datetime('now'), datetime('now'))`,
      args: [
        id,
        customer_name,
        customer_email,
        customer_phone || null,
        customer_address,
        customer_rut || null,
        total_amount,
        payment_method,
        status,
        payment_status,
        shipping_status,
        JSON.stringify(items),
        mercado_pago_preference_id || null,
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

// PATCH /api/orders - Actualizar una orden existente
export const PATCH: APIRoute = async ({ request }) => {
  try {
    const body = await request.json();
    const {
      id,
      customer_name,
      customer_email,
      customer_phone,
      customer_address,
      customer_rut,
      total_amount,
      payment_status,
      shipping_status,
      mercado_pago_preference_id,
      mercado_pago_payment_id,
      status,
    } = body;

    if (!id) {
      return new Response(
        JSON.stringify({ error: 'Order ID is required' }),
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

    // Construir query dinámicamente basado en los campos proporcionados
    const updates: string[] = [];
    const args: any[] = [];

    if (customer_name !== undefined) {
      updates.push('customer_name = ?');
      args.push(customer_name);
    }
    if (customer_email !== undefined) {
      updates.push('customer_email = ?');
      args.push(customer_email);
    }
    if (customer_phone !== undefined) {
      updates.push('customer_phone = ?');
      args.push(customer_phone);
    }
    if (customer_address !== undefined) {
      updates.push('customer_address = ?');
      args.push(customer_address);
    }
    if (customer_rut !== undefined) {
      updates.push('customer_rut = ?');
      args.push(customer_rut);
    }
    if (total_amount !== undefined) {
      updates.push('total_amount = ?');
      args.push(total_amount);
    }
    if (payment_status !== undefined) {
      updates.push('payment_status = ?');
      args.push(payment_status);
    }
    if (shipping_status !== undefined) {
      updates.push('shipping_status = ?');
      args.push(shipping_status);
    }
    if (mercado_pago_preference_id !== undefined) {
      updates.push('mercado_pago_preference_id = ?');
      args.push(mercado_pago_preference_id);
    }
    if (mercado_pago_payment_id !== undefined) {
      updates.push('mercado_pago_payment_id = ?');
      args.push(mercado_pago_payment_id);
    }
    if (status !== undefined) {
      updates.push('status = ?');
      args.push(status);
    }

    if (updates.length === 0) {
      return new Response(
        JSON.stringify({ error: 'No fields to update' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    updates.push('updated_at = datetime(\'now\')');
    args.push(id);

    await client.execute({
      sql: `UPDATE orders SET ${updates.join(', ')} WHERE id = ?`,
      args,
    });

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error: any) {
    console.error('Error updating order:', error);
    return new Response(
      JSON.stringify({ error: error.message || 'Error updating order' }),
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
      customer_rut: row.customer_rut,
      total_amount: row.total_amount,
      payment_method: row.payment_method,
      status: row.status,
      payment_status: row.payment_status || 'pending',
      shipping_status: row.shipping_status || 'not_shipped',
      mercado_pago_preference_id: row.mercado_pago_preference_id,
      mercado_pago_payment_id: row.mercado_pago_payment_id,
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

// DELETE /api/orders - Eliminar una orden
export const DELETE: APIRoute = async ({ request }) => {
  try {
    const url = new URL(request.url);
    const orderId = url.searchParams.get('id');

    if (!orderId) {
      return new Response(
        JSON.stringify({ error: 'Order ID is required' }),
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
      sql: 'DELETE FROM orders WHERE id = ?',
      args: [orderId],
    });

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error: any) {
    console.error('Error deleting order:', error);
    return new Response(
      JSON.stringify({ error: error.message || 'Error deleting order' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
};

// Endpoint para cancelar órdenes pendientes automáticamente después de 3 días
export const PUT: APIRoute = async () => {
  try {
    const client = getTursoClient();
    
    if (!client) {
      return new Response(
        JSON.stringify({ error: 'Database not configured' }),
        { status: 500, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Calcular la fecha de hace 3 días
    const threeDaysAgo = new Date();
    threeDaysAgo.setDate(threeDaysAgo.getDate() - 3);
    const threeDaysAgoISO = threeDaysAgo.toISOString();

    // Actualizar órdenes pendientes que tienen más de 3 días
    const result = await client.execute({
      sql: `UPDATE orders 
            SET payment_status = 'cancelled', 
                status = 'cancelled',
                updated_at = datetime('now')
            WHERE payment_status = 'pending' 
              AND status = 'pending'
              AND created_at < ?`,
      args: [threeDaysAgoISO],
    });

    return new Response(JSON.stringify({ 
      success: true, 
      cancelled: result.rowsAffected || 0 
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error: any) {
    console.error('Error cancelling old orders:', error);
    return new Response(
      JSON.stringify({ error: error.message || 'Error cancelling old orders' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
};



