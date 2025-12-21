import type { APIRoute } from 'astro';

export const POST: APIRoute = async ({ request }) => {
  try {
    const body = await request.json();
    const { amount, buy_order, session_id, return_url } = body;

    const apiKey = import.meta.env.TRANSBANK_API_KEY;
    const commerceCode = import.meta.env.TRANSBANK_COMMERCE_CODE;
    const environment = import.meta.env.TRANSBANK_ENVIRONMENT || 'integration';
    
    if (!apiKey || !commerceCode) {
      return new Response(
        JSON.stringify({ error: 'Transbank no configurado' }),
        { status: 500, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const baseUrl = environment === 'production' 
      ? 'https://webpay3g.transbank.cl'
      : 'https://webpay3gint.transbank.cl';

    const transaction = {
      buy_order,
      session_id,
      amount: Math.round(amount),
      return_url,
    };

    const response = await fetch(`${baseUrl}/rswebpaytransaction/api/webpay/v1.2/transactions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Tbk-Api-Key-Id': commerceCode,
        'Tbk-Api-Key-Secret': apiKey,
      },
      body: JSON.stringify(transaction),
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Transbank API error: ${error}`);
    }

    const data = await response.json();
    
    return new Response(
      JSON.stringify({
        token: data.token,
        url: data.url,
      }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
  } catch (error: any) {
    console.error('Error creating Transbank transaction:', error);
    return new Response(
      JSON.stringify({ error: error.message || 'Error al procesar el pago' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
};

