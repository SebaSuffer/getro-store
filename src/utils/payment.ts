// Utilidades para pasarelas de pago

export type PaymentMethodId = 'mercadopago' | 'webpay' | 'flow' | 'transfer';

export interface PaymentMethod {
  id: PaymentMethodId;
  name: string;
  icon?: string;
  enabled?: boolean;
  url?: string;
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

export const PAYMENT_LINKS: Record<Exclude<PaymentMethodId, 'transfer'>, string> = {
  mercadopago: 'https://link.mercadopago.cl/gotraedicionlimitada',
  webpay: 'https://www.webpay.cl/form-pay/386754',
  flow: 'https://www.flow.cl/btn.php?token=z0af61cc5386ef5b3d1ec6285a607f7ff2936581',
};

const LINK_PAYMENT_METHODS: PaymentMethod[] = [
  {
    id: 'mercadopago',
    name: 'Mercado Pago',
    icon: 'https://res.cloudinary.com/ddzoh72zv/image/upload/f_auto,q_auto/v1766458849/Mercado-Pago-Logo_kvhgin.png',
    enabled: true,
    url: PAYMENT_LINKS.mercadopago,
  },
  {
    id: 'webpay',
    name: 'WebPay',
    icon: 'https://res.cloudinary.com/ddzoh72zv/image/upload/f_auto,q_auto/v1766458837/Transbank-1200px-logo_ljg48x.png',
    enabled: true,
    url: PAYMENT_LINKS.webpay,
  },
  {
    id: 'flow',
    name: 'Flow',
    enabled: true,
    url: PAYMENT_LINKS.flow,
  },
];

// Cargar métodos de pago dinámicamente
export const getPaymentMethods = async (): Promise<PaymentMethod[]> => {
  const methods: PaymentMethod[] = [...LINK_PAYMENT_METHODS];

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
      methods.push({
        id: 'transfer',
        name: 'Transferencia Bancaria',
        icon: 'https://res.cloudinary.com/ddzoh72zv/image/upload/f_auto,q_auto/v1766458838/transferencia-logo_fzj0gc.png',
        enabled: false,
      });
    }
  } catch {
    methods.push({
      id: 'transfer',
      name: 'Transferencia Bancaria',
      icon: 'https://res.cloudinary.com/ddzoh72zv/image/upload/f_auto,q_auto/v1766458838/transferencia-logo_fzj0gc.png',
      enabled: false,
    });
  }

  return methods.filter((method) => method.enabled !== false);
};

export const getPaymentLink = (methodId: PaymentMethodId): string | null => {
  if (methodId === 'transfer') return null;
  return PAYMENT_LINKS[methodId];
};

export const getPaymentMethodLabel = (methodId: PaymentMethodId): string => {
  const labels: Record<PaymentMethodId, string> = {
    mercadopago: 'Mercado Pago',
    webpay: 'WebPay',
    flow: 'Flow',
    transfer: 'Transferencia Bancaria',
  };
  return labels[methodId];
};

// Mantener para compatibilidad
export const PAYMENT_METHODS: PaymentMethod[] = LINK_PAYMENT_METHODS;
