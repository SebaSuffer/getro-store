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
    const preferenceItems = items.map((item: any) => {
      // Calcular precio unitario: precio base + modificador de variación (si existe)
      const basePrice = item.product?.price || 0;
      const variationModifier = item.variation?.price_modifier || 0;
      const unitPrice = basePrice + variationModifier;
      
      // Construir título con información de variación si existe
      let title = item.product?.name || 'Producto';
      if (item.variation) {
        const variationParts = [];
        if (item.variation.brand) variationParts.push(item.variation.brand);
        if (item.variation.thickness) variationParts.push(item.variation.thickness);
        if (item.variation.length) variationParts.push(item.variation.length);
        if (variationParts.length > 0) {
          title += ` (${variationParts.join(', ')})`;
        }
      }
      
      return {
        title,
        quantity: item.quantity || 1,
        unit_price: unitPrice,
        currency_id: 'CLP',
      };
    });

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
    
    // Usar sandbox_init_point si está disponible (modo test), sino init_point (producción)
    const paymentUrl = data.sandbox_init_point || data.init_point;
    
    return new Response(
      JSON.stringify({
        preference_id: data.id,
        init_point: paymentUrl,
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







