import { useState, useEffect } from 'react';
import { getCart, removeFromCart, updateCartItemQuantity, clearCart, getCartTotal } from '../utils/cart';
import type { CartItem } from '../data/products';

const CartView = () => {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [total, setTotal] = useState(0);

  const updateCart = () => {
    const cart = getCart();
    setCartItems(cart);
    setTotal(getCartTotal());
  };

  useEffect(() => {
    updateCart();
    
    const handleCartUpdate = () => {
      updateCart();
    };
    
    window.addEventListener('cartUpdated', handleCartUpdate);
    
    return () => {
      window.removeEventListener('cartUpdated', handleCartUpdate);
    };
  }, []);

  const handleRemoveItem = (productId: string) => {
    removeFromCart(productId);
    updateCart();
  };

  const handleQuantityChange = (productId: string, newQuantity: number) => {
    if (newQuantity <= 0) {
      handleRemoveItem(productId);
      return;
    }
    
    const success = updateCartItemQuantity(productId, newQuantity);
    if (!success) {
      alert('No hay suficiente stock disponible');
      return;
    }
    
    updateCart();
  };

  const handleCheckout = () => {
    if (cartItems.length === 0) {
      alert('Tu carrito está vacío');
      return;
    }
    
    window.location.href = '/checkout';
  };

  if (cartItems.length === 0) {
    return (
      <div className="text-center py-20">
        <span className="material-symbols-outlined text-6xl text-black/30 mb-6" style={{ fontSize: '64px', fontWeight: 300 }}>
          shopping_bag
        </span>
        <h2 className="text-2xl font-semibold text-black mb-4 font-sans">Tu carrito está vacío</h2>
        <p className="text-black/60 font-normal mb-8 text-base font-sans">Agrega productos para comenzar a comprar</p>
        <a
          href="/catalogo"
          className="inline-flex h-12 items-center justify-center bg-black text-white px-10 text-base font-medium transition-all hover:bg-black/90 font-sans"
        >
          Ver Catálogo
        </a>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-12 lg:flex-row">
      <div className="flex-1">
        <div className="space-y-6">
          {cartItems.map((item) => (
            <div
              key={item.product.id}
              className="flex flex-col gap-6 border border-black/10 bg-white p-6 sm:flex-row sm:items-center"
            >
              <img
                src={item.product.image_url}
                alt={item.product.image_alt || item.product.name}
                className="h-32 w-32 object-cover sm:h-40 sm:w-40"
              />
              
              <div className="flex-1">
                <p className="text-sm uppercase tracking-wide text-black/60 mb-2 font-semibold font-sans">{item.product.category}</p>
                <h3 className="text-xl font-bold text-black mb-3 font-sans">{item.product.name}</h3>
                {item.variation?.brand && (
                  <p className="text-base text-black/70 font-medium mb-2 font-sans">
                    Cadena: {item.variation.brand}
                  </p>
                )}
                {item.product.category !== 'Colgantes' && (
                  <p className="text-lg text-black/80 font-semibold mb-2 font-sans">
                    ${item.product.price.toLocaleString('es-CL')} CLP
                  </p>
                )}
                <p className="text-base text-black/60 font-medium font-sans">
                  Stock disponible: {item.product.stock}
                </p>
              </div>
              
              <div className="flex items-center gap-6">
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => handleQuantityChange(item.product.id, item.quantity - 1)}
                    className="flex size-12 items-center justify-center border-2 border-black/30 hover:border-black/60 hover:bg-black/5 transition-colors font-bold"
                    aria-label="Disminuir cantidad"
                  >
                    <span className="material-symbols-outlined" style={{ fontSize: '20px', fontWeight: 400 }}>remove</span>
                  </button>
                  <span className="w-16 text-center font-bold text-black text-lg">
                    {item.quantity}
                  </span>
                  <button
                    onClick={() => handleQuantityChange(item.product.id, item.quantity + 1)}
                    disabled={item.quantity >= item.product.stock}
                    className="flex size-12 items-center justify-center border-2 border-black/30 hover:border-black/60 hover:bg-black/5 transition-colors disabled:opacity-30 disabled:cursor-not-allowed font-bold"
                    aria-label="Aumentar cantidad"
                  >
                    <span className="material-symbols-outlined" style={{ fontSize: '20px', fontWeight: 400 }}>add</span>
                  </button>
                </div>
                
                <p className="text-2xl font-bold text-black w-40 text-right font-sans">
                  ${((item.product.price + (item.variation?.price_modifier || 0)) * item.quantity).toLocaleString('es-CL')} CLP
                </p>
                
                <button
                  onClick={() => {
                    if (confirm(`¿Eliminar "${item.product.name}" del carrito?`)) {
                      handleRemoveItem(item.product.id);
                    }
                  }}
                  className="flex size-12 items-center justify-center bg-red-600 text-white hover:bg-red-700 transition-colors font-bold rounded"
                  aria-label="Eliminar producto"
                  title="Eliminar del carrito"
                >
                  <span className="material-symbols-outlined" style={{ fontSize: '24px', fontWeight: 400 }}>delete</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
      
      <div className="lg:w-96">
        <div className="sticky top-24 border border-black/10 bg-white p-8">
          <h2 className="text-base font-semibold text-black mb-8 font-sans">Resumen de Compra</h2>
          
          <div className="space-y-4 mb-8">
            <div className="flex justify-between text-sm text-black/80 font-normal font-sans">
              <span>Subtotal</span>
              <span>${total.toLocaleString('es-CL')} CLP</span>
            </div>
            <div className="flex justify-between text-sm text-black/80 font-normal font-sans">
              <span>Envío</span>
              <span className="text-black/50">Calculado en checkout</span>
            </div>
            <div className="border-t border-black/10 pt-4 flex justify-between">
              <span className="text-lg font-semibold text-black font-sans">Total</span>
              <span className="text-lg font-semibold text-black font-sans">${total.toLocaleString('es-CL')} CLP</span>
            </div>
          </div>
          
          <button
            onClick={handleCheckout}
            className="w-full inline-flex h-12 items-center justify-center bg-black text-white px-6 text-base font-medium transition-all hover:bg-black/90 font-sans"
          >
            Proceder al Pago
          </button>
          
          <a
            href="/catalogo"
            className="mt-6 block w-full text-center text-sm text-black/60 hover:text-black transition-colors font-normal font-sans"
          >
            Continuar comprando
          </a>
        </div>
      </div>
    </div>
  );
};

export default CartView;
