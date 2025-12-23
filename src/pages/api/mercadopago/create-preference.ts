import type { APIRoute } from 'astro';

export const POST: APIRoute = async ({ request }) => {
  try {
    const body = await request.json();
    const { items, orderId, back_urls } = body;

    const accessToken = import.meta.env.MERCADOPAGO_ACCESS_TOKEN;
    
    if (!accessToken) {
      return new Response(
        JSON.stringify({ error: 'MercadoPago no configurado' }),
        { status: 500, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Formatear items para Mercado Pago
    const preferenceItems = items.map((item: any) => ({
      title: item.product.name,
      quantity: item.quantity,
      unit_price: item.product.price,
      currency_id: 'CLP',
    }));

    const preference = {
      items: preferenceItems,
      external_reference: orderId,
      back_urls,
      auto_return: 'approved',
      payment_methods: {
        excluded_payment_types: [],
        excluded_payment_methods: [],
        installments: 12,
      },
    };

    const response = await fetch('https://api.mercadopago.com/checkout/preferences', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${accessToken}`,
      },
      body: JSON.stringify(preference),
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`MercadoPago API error: ${error}`);
    }

    const data = await response.json();
    
    return new Response(
      JSON.stringify({
        preference_id: data.id,
        init_point: data.init_point,
        sandbox_init_point: data.sandbox_init_point,
      }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
  } catch (error: any) {
    console.error('Error creating MercadoPago preference:', error);
    return new Response(
      JSON.stringify({ error: error.message || 'Error al procesar el pago' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
};



