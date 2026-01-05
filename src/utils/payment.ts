// Utilidades para pasarelas de pago

export interface PaymentMethod {
  id: 'mercadopago' | 'transfer';
  name: string;
  icon?: string;
  enabled?: boolean;
}

export interface BankTransferSettings {
  bank_name: string;
  account_type: string;
  account_number: string;
  rut: string;
  account_holder: string;
  email: string;
  is_enabled: boolean;
}

// Cargar métodos de pago dinámicamente
export const getPaymentMethods = async (): Promise<PaymentMethod[]> => {
  const methods: PaymentMethod[] = [
    {
      id: 'mercadopago',
      name: 'Mercado Pago',
      icon: 'https://res.cloudinary.com/ddzoh72zv/image/upload/f_auto,q_auto/v1766458849/Mercado-Pago-Logo_kvhgin.png',
      enabled: true,
    },
  ];

  // Cargar estado de transferencia bancaria
  try {
    const response = await fetch('/api/bank-transfer-settings');
    if (response.ok) {
      const settings = await response.json();
      methods.push({
        id: 'transfer',
        name: 'Transferencia Bancaria',
        icon: 'https://res.cloudinary.com/ddzoh72zv/image/upload/f_auto,q_auto/v1766458838/transferencia-logo_fzj0gc.png',
        enabled: settings.is_enabled === true,
      });
    } else {
      // Si falla, agregar deshabilitado por defecto
      methods.push({
        id: 'transfer',
        name: 'Transferencia Bancaria',
        icon: 'https://res.cloudinary.com/ddzoh72zv/image/upload/f_auto,q_auto/v1766458838/transferencia-logo_fzj0gc.png',
        enabled: false,
      });
    }
  } catch (error) {
    methods.push({
      id: 'transfer',
      name: 'Transferencia Bancaria',
      icon: 'https://res.cloudinary.com/ddzoh72zv/image/upload/f_auto,q_auto/v1766458838/transferencia-logo_fzj0gc.png',
      enabled: false,
    });
  }

  return methods;
};

// Mantener para compatibilidad (solo Mercado Pago)
export const PAYMENT_METHODS: PaymentMethod[] = [
  {
    id: 'mercadopago',
    name: 'Mercado Pago',
    icon: 'https://res.cloudinary.com/ddzoh72zv/image/upload/f_auto,q_auto/v1766458849/Mercado-Pago-Logo_kvhgin.png',
    enabled: true,
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
    // Retornar la URL de pago (init_point o sandbox_init_point)
    return data.init_point || null;
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




