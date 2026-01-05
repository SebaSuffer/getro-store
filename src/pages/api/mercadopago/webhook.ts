import type { APIRoute } from 'astro';
import { getTursoClient } from '../../../utils/turso';

// POST /api/mercadopago/webhook - Recibir notificaciones de Mercado Pago
export const POST: APIRoute = async ({ request }) => {
  try {
    const body = await request.json();
    const { type, data } = body;

    // Mercado Pago envía diferentes tipos de notificaciones
    // Nos interesan principalmente: 'payment' para pagos
    if (type === 'payment') {
      const paymentId = data.id;
      
      if (!paymentId) {
        return new Response(
          JSON.stringify({ error: 'Payment ID is required' }),
          { status: 400, headers: { 'Content-Type': 'application/json' } }
        );
      }

      const accessToken = import.meta.env.MERCADOPAGO_ACCESS_TOKEN;
      
      if (!accessToken) {
        return new Response(
          JSON.stringify({ error: 'MercadoPago not configured' }),
          { status: 500, headers: { 'Content-Type': 'application/json' } }
        );
      }

      // Obtener información del pago desde la API de Mercado Pago
      const paymentResponse = await fetch(
        `https://api.mercadopago.com/v1/payments/${paymentId}`,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );

      if (!paymentResponse.ok) {
        throw new Error('Error fetching payment from Mercado Pago');
      }

      const payment = await paymentResponse.json();
      
      // Obtener el external_reference que contiene nuestro orderId
      const orderId = payment.external_reference;
      
      if (!orderId) {
        return new Response(
          JSON.stringify({ error: 'Order ID not found in payment' }),
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

      // Determinar el estado del pago
      let paymentStatus = 'pending';
      let orderStatus = 'pending';
      
      if (payment.status === 'approved') {
        paymentStatus = 'approved';
        orderStatus = 'paid';
      } else if (payment.status === 'rejected' || payment.status === 'cancelled') {
        paymentStatus = 'rejected';
        orderStatus = 'cancelled';
      } else if (payment.status === 'pending' || payment.status === 'in_process') {
        paymentStatus = 'pending';
        orderStatus = 'pending';
      }

      // Actualizar la orden en la base de datos
      await client.execute({
        sql: `UPDATE orders 
              SET payment_status = ?, 
                  status = ?,
                  mercado_pago_payment_id = ?,
                  updated_at = datetime('now')
              WHERE id = ?`,
        args: [paymentStatus, orderStatus, paymentId.toString(), orderId],
      });

      // Si el pago fue aprobado, enviar email de confirmación
      if (payment.status === 'approved') {
        // Obtener información de la orden para el email
        const orderResult = await client.execute({
          sql: 'SELECT * FROM orders WHERE id = ?',
          args: [orderId],
        });

        if (orderResult.rows.length > 0) {
          const order = orderResult.rows[0];
          
          // Enviar email de confirmación (se implementará en el siguiente paso)
          try {
            await fetch(`${new URL(request.url).origin}/api/orders/send-confirmation`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                orderId: order.id,
                customerEmail: order.customer_email,
                customerName: order.customer_name,
              }),
            });
          } catch (emailError) {
            console.error('Error sending confirmation email:', emailError);
            // No fallar el webhook si el email falla
          }
        }
      }

      return new Response(JSON.stringify({ success: true }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Para otros tipos de notificaciones, simplemente confirmar recepción
    return new Response(JSON.stringify({ success: true, message: 'Notification received' }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error: any) {
    console.error('Error processing Mercado Pago webhook:', error);
    return new Response(
      JSON.stringify({ error: error.message || 'Error processing webhook' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
};

