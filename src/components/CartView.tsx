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
        <h2 className="text-3xl font-light text-black mb-4 font-display tracking-[0.05em] uppercase">Tu carrito está vacío</h2>
        <p className="text-black/60 font-light mb-8 text-sm">Agrega productos para comenzar a comprar</p>
        <a
          href="/catalogo"
          className="inline-flex h-12 items-center justify-center bg-black text-white px-10 text-xs font-light uppercase tracking-[0.2em] transition-all hover:bg-black/90"
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
                <p className="text-[10px] uppercase tracking-[0.3em] text-black/50 mb-2 font-light">{item.product.category}</p>
                <h3 className="text-sm font-normal text-black uppercase tracking-[0.1em] mb-2 font-display">{item.product.name}</h3>
                <p className="text-sm text-black/70 font-light mb-2">
                  ${item.product.price.toLocaleString('es-CL')} CLP
                </p>
                <p className="text-xs text-black/50 font-light">
                  Stock disponible: {item.product.stock}
                </p>
              </div>
              
              <div className="flex items-center gap-6">
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => handleQuantityChange(item.product.id, item.quantity - 1)}
                    className="flex size-10 items-center justify-center border border-black/20 hover:border-black/40 transition-colors"
                    aria-label="Disminuir cantidad"
                  >
                    <span className="material-symbols-outlined" style={{ fontSize: '18px', fontWeight: 300 }}>remove</span>
                  </button>
                  <span className="w-12 text-center font-light text-black text-sm">
                    {item.quantity}
                  </span>
                  <button
                    onClick={() => handleQuantityChange(item.product.id, item.quantity + 1)}
                    disabled={item.quantity >= item.product.stock}
                    className="flex size-10 items-center justify-center border border-black/20 hover:border-black/40 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                    aria-label="Aumentar cantidad"
                  >
                    <span className="material-symbols-outlined" style={{ fontSize: '18px', fontWeight: 300 }}>add</span>
                  </button>
                </div>
                
                <p className="text-lg font-light text-black w-32 text-right">
                  ${(item.product.price * item.quantity).toLocaleString('es-CL')} CLP
                </p>
                
                <button
                  onClick={() => handleRemoveItem(item.product.id)}
                  className="flex size-10 items-center justify-center text-black/40 hover:text-black/60 transition-colors"
                  aria-label="Eliminar producto"
                >
                  <span className="material-symbols-outlined" style={{ fontSize: '20px', fontWeight: 300 }}>close</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
      
      <div className="lg:w-96">
        <div className="sticky top-24 border border-black/10 bg-white p-8">
          <h2 className="text-sm font-light uppercase tracking-[0.2em] text-black mb-8 font-display">Resumen de Compra</h2>
          
          <div className="space-y-4 mb-8">
            <div className="flex justify-between text-sm text-black/70 font-light">
              <span>Subtotal</span>
              <span>${total.toLocaleString('es-CL')} CLP</span>
            </div>
            <div className="flex justify-between text-sm text-black/70 font-light">
              <span>Envío</span>
              <span className="text-black/50">Calculado en checkout</span>
            </div>
            <div className="border-t border-black/10 pt-4 flex justify-between">
              <span className="text-lg font-light text-black">Total</span>
              <span className="text-lg font-light text-black">${total.toLocaleString('es-CL')} CLP</span>
            </div>
          </div>
          
          <button
            onClick={handleCheckout}
            className="w-full inline-flex h-12 items-center justify-center bg-black text-white px-6 text-xs font-light uppercase tracking-[0.2em] transition-all hover:bg-black/90"
          >
            Proceder al Pago
          </button>
          
          <a
            href="/catalogo"
            className="mt-6 block w-full text-center text-xs text-black/60 hover:text-black transition-colors font-light uppercase tracking-[0.2em]"
          >
            Continuar comprando
          </a>
        </div>
      </div>
    </div>
  );
};

export default CartView;
