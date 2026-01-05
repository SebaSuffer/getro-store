import type { APIRoute } from 'astro';
import { getTursoClient } from '../../../utils/turso';
import { sendOrderConfirmationEmail } from '../../../utils/email';

// POST /api/orders/send-confirmation - Enviar email de confirmación de orden
export const POST: APIRoute = async ({ request }) => {
  try {
    const body = await request.json();
    const { orderId, customerEmail, customerName } = body;

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

    // Obtener información completa de la orden
    const result = await client.execute({
      sql: 'SELECT * FROM orders WHERE id = ?',
      args: [orderId],
    });

    if (result.rows.length === 0) {
      return new Response(
        JSON.stringify({ error: 'Order not found' }),
        { status: 404, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const order = result.rows[0];
    const items = JSON.parse(order.items);

    // Enviar email de confirmación
    const emailSent = await sendOrderConfirmationEmail(
      customerEmail || order.customer_email,
      customerName || order.customer_name,
      order.id,
      items,
      order.total_amount
    );

    if (!emailSent) {
      // No fallar si el email no se puede enviar, solo loguear
      console.warn('Email confirmation could not be sent for order:', orderId);
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        emailSent,
        message: emailSent ? 'Confirmation email sent' : 'Email service not configured'
      }),
      {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  } catch (error: any) {
    console.error('Error sending confirmation email:', error);
    return new Response(
      JSON.stringify({ error: error.message || 'Error sending confirmation email' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
};

