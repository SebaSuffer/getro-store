// Utilidades para pasarelas de pago

export interface PaymentMethod {
  id: 'mercadopago' | 'transbank' | 'transfer';
  name: string;
  icon?: string;
}

export const PAYMENT_METHODS: PaymentMethod[] = [
  {
    id: 'mercadopago',
    name: 'Mercado Pago',
    icon: '/images/Mercado-Pago-Logo.png',
  },
  {
    id: 'transbank',
    name: 'Transbank (Webpay)',
    icon: '/images/Transbank-1200px-logo.png',
  },
  {
    id: 'transfer',
    name: 'Transferencia Bancaria',
    icon: '/images/transferencia-logo.png',
  },
];

// Inicializar Mercado Pago SDK
export const initMercadoPago = async (): Promise<any> => {
  if (typeof window === 'undefined') return null;
  
  // Cargar SDK de Mercado Pago dinámicamente
  const script = document.createElement('script');
  script.src = 'https://sdk.mercadopago.com/js/v2';
  script.async = true;
  
  return new Promise((resolve, reject) => {
    script.onload = () => {
      if (window.MercadoPago) {
        const mp = new window.MercadoPago(import.meta.env.PUBLIC_MERCADOPAGO_PUBLIC_KEY || '');
        resolve(mp);
      } else {
        reject(new Error('MercadoPago SDK no se cargó correctamente'));
      }
    };
    script.onerror = reject;
    document.head.appendChild(script);
  });
};

// Crear preferencia de pago en Mercado Pago
export const createMercadoPagoPreference = async (items: any[], orderId: string): Promise<string | null> => {
  try {
    const response = await fetch('/api/mercadopago/create-preference', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        items,
        orderId,
        back_urls: {
          success: `${window.location.origin}/orden-confirmada`,
          failure: `${window.location.origin}/checkout?error=payment_failed`,
          pending: `${window.location.origin}/checkout?status=pending`,
        },
        auto_return: 'approved',
      }),
    });

    if (!response.ok) {
      throw new Error('Error al crear preferencia de pago');
    }

    const data = await response.json();
    return data.init_point || data.preference_id;
  } catch (error) {
    console.error('Error en Mercado Pago:', error);
    return null;
  }
};

// Crear transacción en Transbank
export const createTransbankTransaction = async (amount: number, orderId: string, sessionId: string): Promise<any> => {
  try {
    const response = await fetch('/api/transbank/create-transaction', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        amount,
        buy_order: orderId,
        session_id: sessionId,
        return_url: `${window.location.origin}/orden-confirmada`,
      }),
    });

    if (!response.ok) {
      throw new Error('Error al crear transacción de Transbank');
    }

    return await response.json();
  } catch (error) {
    console.error('Error en Transbank:', error);
    return null;
  }
};

// Declarar tipos para window
declare global {
  interface Window {
    MercadoPago: any;
  }
}



