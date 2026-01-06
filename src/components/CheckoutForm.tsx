import { useState, useEffect } from 'react';
import { getCart, getCartTotal } from '../utils/cart';
import type { CartItem } from '../data/products';

interface FormData {
  customer_name: string;
  customer_email: string;
  customer_phone: string;
  customer_address: string;
  customer_rut: string;
}


const generateOrderId = (): string => {
  // Generar número de pedido empezando desde 1000 para que no parezca nuevo
  // Usa timestamp para generar un número único pero que parezca secuencial
  const baseNumber = 1000;
  const timestamp = Date.now();
  // Usar los últimos 3 dígitos del timestamp + un número aleatorio pequeño (0-99)
  // Esto genera números entre 1000 y ~2099, pareciendo un negocio establecido
  const randomOffset = Math.floor(Math.random() * 100); // 0-99
  const timestampOffset = (timestamp % 1000); // 0-999
  const orderNumber = baseNumber + timestampOffset + randomOffset;
  return `ORD-${orderNumber}`;
};

const CheckoutForm = () => {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [total, setTotal] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState<FormData>({
    customer_name: '',
    customer_email: '',
    customer_phone: '',
    customer_address: '',
    customer_rut: '',
  });
  const [errors, setErrors] = useState<Partial<Record<keyof FormData, string>>>({});

  useEffect(() => {
    const cart = getCart();
    if (cart.length === 0) {
      window.location.href = '/carrito';
      return;
    }
    
    setCartItems(cart);
    setTotal(getCartTotal());
  }, []);

  const validateForm = (): boolean => {
    const newErrors: Partial<Record<keyof FormData, string>> = {};
    
    if (!formData.customer_name.trim()) {
      newErrors.customer_name = 'El nombre es requerido';
    }
    
    if (!formData.customer_email.trim()) {
      newErrors.customer_email = 'El email es requerido';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.customer_email)) {
      newErrors.customer_email = 'El email no es válido';
    }
    
    if (!formData.customer_phone.trim()) {
      newErrors.customer_phone = 'El teléfono es requerido';
    }
    
    if (!formData.customer_address.trim()) {
      newErrors.customer_address = 'La dirección es requerida';
    }
    
    if (!formData.customer_rut.trim()) {
      newErrors.customer_rut = 'El RUT es requerido';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      const orderId = generateOrderId();
      
      const orderData = {
        id: orderId,
        customer_name: formData.customer_name,
        customer_email: formData.customer_email,
        customer_phone: formData.customer_phone,
        customer_address: formData.customer_address,
        customer_rut: formData.customer_rut,
        total_amount: total,
        payment_method: 'mercadopago',
        items: cartItems,
        created_at: new Date().toISOString(),
        status: 'pending',
        payment_status: 'pending',
        shipping_status: 'not_shipped',
      };
      
      // Guardar orden en Turso antes de procesar pago
      const orderResponse = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(orderData),
      });

      if (!orderResponse.ok) {
        throw new Error('Error al guardar la orden');
      }
      
      // Crear preferencia de pago en Mercado Pago usando la API
      const back_urls = {
        success: `${window.location.origin}/orden-confirmada?status=approved&external_reference=${orderId}`,
        failure: `${window.location.origin}/orden-confirmada?status=rejected&external_reference=${orderId}`,
        pending: `${window.location.origin}/orden-confirmada?status=pending&external_reference=${orderId}`,
      };

      const preferenceResponse = await fetch('/api/mercadopago/create-preference', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          items: cartItems.map(item => ({
            product: item.product,
            quantity: item.quantity,
            variation: item.variation,
            total_amount: (item.product.price + (item.variation?.price_modifier || 0)) * item.quantity,
          })),
          orderId,
          back_urls,
          total_amount: total,
        }),
      });

      if (!preferenceResponse.ok) {
        throw new Error('Error al crear la preferencia de pago');
      }

      const preferenceData = await preferenceResponse.json();
      
      // Actualizar la orden con el preference_id
      await fetch('/api/orders', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: orderId,
          mercado_pago_preference_id: preferenceData.preference_id,
        }),
      });

      // Mostrar número de pedido al usuario antes de redirigir
      alert(`Tu número de pedido es: ${orderId}\n\nGuarda este número para hacer seguimiento de tu compra.\n\nSerás redirigido a Mercado Pago para completar el pago.`);

      // Redirigir a Mercado Pago
      window.location.href = preferenceData.init_point || preferenceData.sandbox_init_point;
      
    } catch (error: any) {
      console.error('Error al procesar la orden:', error);
      alert(error.message || 'Hubo un error al procesar tu orden. Por favor, intenta nuevamente.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInputChange = (field: keyof FormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  if (cartItems.length === 0) {
    return null;
  }

  return (
    <div className="flex flex-col gap-8 lg:flex-row">
      <div className="w-full lg:w-1/2">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="border border-black/10 bg-white p-6">
            <h2 className="text-base font-semibold text-black mb-6 font-sans">Información de Contacto</h2>
            
            <div className="space-y-4">
              <div>
                <label htmlFor="customer_name" className="block text-sm font-medium text-black mb-1.5">
                  Nombre Completo <span className="text-red-600">*</span>
                </label>
                <input
                  type="text"
                  id="customer_name"
                  value={formData.customer_name}
                  onChange={(e) => handleInputChange('customer_name', e.target.value)}
                  className={`w-full border px-4 py-2.5 text-base font-normal ${
                    errors.customer_name
                      ? 'border-red-500'
                      : 'border-black/20'
                  } bg-white text-black focus:outline-none focus:border-black/40 transition-colors font-sans`}
                  required
                />
                {errors.customer_name && (
                  <p className="mt-2 text-sm text-red-600 font-normal">{errors.customer_name}</p>
                )}
              </div>
              
              <div>
                <label htmlFor="customer_email" className="block text-sm font-medium text-black mb-1.5">
                  Email <span className="text-red-600">*</span>
                </label>
                <input
                  type="email"
                  id="customer_email"
                  value={formData.customer_email}
                  onChange={(e) => handleInputChange('customer_email', e.target.value)}
                  className={`w-full border px-4 py-2.5 text-base font-normal ${
                    errors.customer_email
                      ? 'border-red-500'
                      : 'border-black/20'
                  } bg-white text-black focus:outline-none focus:border-black/40 transition-colors font-sans`}
                  required
                />
                {errors.customer_email && (
                  <p className="mt-2 text-sm text-red-600 font-normal">{errors.customer_email}</p>
                )}
              </div>
              
              <div>
                <label htmlFor="customer_phone" className="block text-sm font-medium text-black mb-1.5">
                  Teléfono <span className="text-red-600">*</span>
                </label>
                <input
                  type="tel"
                  id="customer_phone"
                  value={formData.customer_phone}
                  onChange={(e) => handleInputChange('customer_phone', e.target.value)}
                  className={`w-full border px-4 py-2.5 text-base font-normal ${
                    errors.customer_phone
                      ? 'border-red-500'
                      : 'border-black/20'
                  } bg-white text-black focus:outline-none focus:border-black/40 transition-colors font-sans`}
                  required
                />
                {errors.customer_phone && (
                  <p className="mt-2 text-sm text-red-600 font-normal">{errors.customer_phone}</p>
                )}
              </div>
              
              <div>
                <label htmlFor="customer_address" className="block text-sm font-medium text-black mb-1.5">
                  Dirección de Envío <span className="text-red-600">*</span>
                </label>
                <textarea
                  id="customer_address"
                  value={formData.customer_address}
                  onChange={(e) => handleInputChange('customer_address', e.target.value)}
                  rows={2}
                  className={`w-full border px-4 py-2.5 text-base font-normal ${
                    errors.customer_address
                      ? 'border-red-500'
                      : 'border-black/20'
                  } bg-white text-black focus:outline-none focus:border-black/40 transition-colors resize-none font-sans`}
                  required
                />
                {errors.customer_address && (
                  <p className="mt-2 text-sm text-red-600 font-normal">{errors.customer_address}</p>
                )}
              </div>
              
              <div>
                <label htmlFor="customer_rut" className="block text-sm font-medium text-black mb-1.5">
                  RUT <span className="text-red-600">*</span>
                </label>
                <input
                  type="text"
                  id="customer_rut"
                  value={formData.customer_rut}
                  onChange={(e) => handleInputChange('customer_rut', e.target.value)}
                  placeholder="12345678-9"
                  className={`w-full border px-4 py-2.5 text-base font-normal ${
                    errors.customer_rut
                      ? 'border-red-500'
                      : 'border-black/20'
                  } bg-white text-black focus:outline-none focus:border-black/40 transition-colors font-sans`}
                  required
                />
                <p className="mt-1.5 text-xs text-black/50 font-normal font-sans">
                  Formato: 8 dígitos seguidos de guion y dígito verificador (ej: 12345678-9)
                </p>
                {errors.customer_rut && (
                  <p className="mt-2 text-sm text-red-600 font-normal">{errors.customer_rut}</p>
                )}
              </div>
            </div>
          </div>
          
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full inline-flex h-12 items-center justify-center bg-black text-white px-6 text-base font-medium transition-all hover:bg-black/90 disabled:opacity-50 disabled:cursor-not-allowed font-sans"
          >
            {isSubmitting ? 'Procesando...' : 'Confirmar y Pagar'}
          </button>
        </form>
      </div>
      
      <div className="w-full lg:w-1/2">
        <div className="sticky top-24 border border-black/10 bg-white p-8 lg:p-10">
          <h2 className="text-xl font-semibold text-black mb-8 font-sans">Resumen de Compra</h2>
          
          <div className="space-y-5 mb-8">
            {cartItems.map((item) => (
              <div key={item.product.id} className="flex justify-between items-start">
                <div className="flex-1 pr-4">
                  <p className="text-base font-medium text-black font-sans mb-1">
                    {item.product.name}
                  </p>
                  <p className="text-sm text-black/60 font-normal font-sans">
                    Cantidad: {item.quantity}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-lg font-semibold text-black font-sans">
                    ${((item.product.price + (item.variation?.price_modifier || 0)) * item.quantity).toLocaleString('es-CL')} CLP
                  </p>
                </div>
              </div>
            ))}
            
            <div className="border-t-2 border-black/20 pt-6 mt-6">
              <div className="flex justify-between items-center">
                <span className="text-xl font-semibold text-black font-sans">Total</span>
                <span className="text-2xl font-bold text-black font-sans">${total.toLocaleString('es-CL')} CLP</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CheckoutForm;
