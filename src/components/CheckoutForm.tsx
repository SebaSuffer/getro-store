import { useState, useEffect } from 'react';
import { getCart, getCartTotal, clearCart, processPurchase } from '../utils/cart';
import { createMercadoPagoPreference, createTransbankTransaction, PAYMENT_METHODS } from '../utils/payment';
import type { CartItem } from '../data/products';

interface FormData {
  customer_name: string;
  customer_email: string;
  customer_phone: string;
  customer_address: string;
  payment_method: 'mercadopago' | 'transbank' | 'transfer';
}

const generateOrderId = (): string => {
  return 'ORD-' + Date.now().toString(36).toUpperCase() + '-' + Math.random().toString(36).substr(2, 5).toUpperCase();
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
    payment_method: 'mercadopago',
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
        total_amount: total,
        payment_method: formData.payment_method,
        items: cartItems,
        created_at: new Date().toISOString(),
        status: 'pending',
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
      
      // Procesar según método de pago
      if (formData.payment_method === 'mercadopago') {
        // Por ahora solo mostrar mensaje - funcionalidad pendiente
        alert('Mercado Pago estará disponible próximamente. Por favor, selecciona otro método de pago.');
        setIsSubmitting(false);
        return;
      } else if (formData.payment_method === 'transbank') {
        // Por ahora solo mostrar mensaje - funcionalidad pendiente
        alert('Transbank estará disponible próximamente. Por favor, selecciona otro método de pago.');
        setIsSubmitting(false);
        return;
      } else if (formData.payment_method === 'transfer') {
        // Transferencia bancaria - procesar compra y redirigir
        await processPurchase();
        window.location.href = `/orden-confirmada?id=${orderId}&method=transfer`;
        return;
      }
      
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
            </div>
          </div>
          
          <div className="border border-black/10 bg-white p-6">
            <h2 className="text-base font-semibold text-black mb-6 font-sans">Método de Pago</h2>
            
            <div className="space-y-3">
              {PAYMENT_METHODS.map((method) => (
                <label
                  key={method.id}
                  className="flex items-center gap-4 p-4 border border-black/10 cursor-pointer hover:border-black/20 transition-colors"
                >
                  <input
                    type="radio"
                    name="payment_method"
                    value={method.id}
                    checked={formData.payment_method === method.id}
                    onChange={(e) => handleInputChange('payment_method', e.target.value as any)}
                    className="text-black"
                  />
                  <div className="flex items-center gap-3">
                    {method.icon && (
                      <img src={method.icon} alt={method.name} className="h-8 w-auto object-contain" />
                    )}
                    <span className="text-base font-normal text-black font-sans">{method.name}</span>
                  </div>
                </label>
              ))}
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
                    ${(item.product.price * item.quantity).toLocaleString('es-CL')} CLP
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
