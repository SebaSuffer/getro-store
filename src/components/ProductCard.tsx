import { useState, useEffect } from 'react';
import { addToCart, getCart } from '../utils/cart';
import type { Product } from '../data/products';

interface ProductCardProps {
  product: Product;
  hidePrice?: boolean;
}

const ProductCard = ({ product: initialProduct, hidePrice = false }: ProductCardProps) => {
  const [isInCart, setIsInCart] = useState(false);
  const [isAdding, setIsAdding] = useState(false);
  const [currentStock, setCurrentStock] = useState(initialProduct.stock);
  const [product, setProduct] = useState(initialProduct);
  const [displayPrice, setDisplayPrice] = useState(initialProduct.price);

  useEffect(() => {
    const checkCart = () => {
      const cart = getCart();
      setIsInCart(cart.some(item => item.product.id === product.id));
    };
    
    const handleProductUpdate = async (event?: CustomEvent) => {
      // Recargar producto desde la API cuando se actualiza
      try {
        const { getProductById } = await import('../data/products');
        const { getProductStock } = await import('../utils/stock');
        const updatedProduct = await getProductById(product.id);
        if (updatedProduct) {
          console.log('ProductCard: Actualizando producto', product.id, updatedProduct.name);
          setProduct(updatedProduct);
          const stock = await getProductStock(updatedProduct.id);
          setCurrentStock(stock || updatedProduct.stock);
        }
      } catch (error) {
        console.error('Error updating product:', error);
      }
    };
    
    const handleProductDelete = async (event: CustomEvent) => {
      if (event.detail.productId === product.id) {
        // Si el producto fue eliminado, redirigir al catálogo
        try {
          const { getProductById } = await import('../data/products');
          const updatedProduct = await getProductById(product.id);
          if (!updatedProduct) {
            // Producto eliminado, redirigir al catálogo
            window.location.href = '/catalogo';
          }
        } catch (error) {
          // Si hay error, asumir que fue eliminado
          window.location.href = '/catalogo';
        }
      }
    };
    
    // Cargar stock actualizado al montar y calcular precio con cadena base
    const loadStock = async () => {
      try {
        const { getProductStock } = await import('../utils/stock');
        const stock = await getProductStock(product.id);
        setCurrentStock(stock || product.stock);
        
        // Si es un Colgante, cargar la cadena por defecto y calcular precio
        if (product.category === 'Colgantes' && !hidePrice) {
          try {
            const chainsResponse = await fetch(`/api/pendants/${product.id}/chains`);
            if (chainsResponse.ok) {
              const chains = await chainsResponse.json();
              if (chains.length > 0) {
                // Buscar la cadena por defecto (PLATA 925) o usar la primera
                const defaultChain = chains.find((c: any) => c.brand === 'PLATA 925') || chains[0];
                if (defaultChain) {
                  const sumPrice = product.price + (defaultChain.price || 0);
                  const { roundToProfessionalPrice } = await import('../utils/priceRounding');
                  const finalPrice = roundToProfessionalPrice(sumPrice);
                  setDisplayPrice(finalPrice);
                }
              }
            }
          } catch (error) {
            console.error('Error loading chains for price:', error);
          }
        }
      } catch (error) {
        console.error('Error loading stock:', error);
      }
    };
    
    loadStock();
    
    checkCart();
    window.addEventListener('cartUpdated', checkCart);
    window.addEventListener('productUpdated', handleProductUpdate as EventListener);
    window.addEventListener('productDeleted', handleProductDelete as EventListener);
    
    return () => {
      window.removeEventListener('cartUpdated', checkCart);
      window.removeEventListener('productUpdated', handleProductUpdate as EventListener);
      window.removeEventListener('productDeleted', handleProductDelete as EventListener);
    };
  }, [product.id]);

  const handleAddToCart = async () => {
    // Prevenir agregar cadenas al carrito
    if (product.category === 'Cadenas') return;
    
    if (currentStock <= 0) return;
    
    setIsAdding(true);
    try {
      // Si es un colgante, cargar la cadena por defecto antes de agregar
      let variation = undefined;
      if (product.category === 'Colgantes') {
        try {
          const chainsResponse = await fetch(`/api/pendants/${product.id}/chains`);
          if (chainsResponse.ok) {
            const chains = await chainsResponse.json();
            if (chains.length > 0) {
              // Buscar la cadena por defecto (PLATA 925) o usar la primera disponible
              const availableChains = chains.filter((c: any) => c.stock > 0);
              const defaultChain = availableChains.find((c: any) => c.brand === 'PLATA 925') || availableChains[0] || chains[0];
              if (defaultChain) {
                variation = {
                  id: defaultChain.id,
                  brand: defaultChain.brand,
                  thickness: defaultChain.thickness || '',
                  length: defaultChain.length || '',
                  price_modifier: defaultChain.price || 0,
                };
              }
            }
          }
        } catch (error) {
          console.error('Error loading chains for cart:', error);
        }
      }
      
      const success = await addToCart(product, 1, variation);
      
      if (!success) {
        alert('No hay suficiente stock disponible');
      } else {
        // Actualizar stock local
        const { getProductStock } = await import('../utils/stock');
        const newStock = await getProductStock(product.id);
        setCurrentStock(newStock || 0);
      }
    } catch (error) {
      console.error('Error adding to cart:', error);
      alert('Error al agregar al carrito');
    }
    
    setTimeout(() => {
      setIsAdding(false);
    }, 300);
  };

  const isOutOfStock = currentStock <= 0;

  return (
    <div className="group relative flex flex-col overflow-hidden bg-white">
      <a href={`/producto/${product.id}`} className="relative aspect-square overflow-hidden bg-gray-50 cursor-pointer">
        {!product.image_url || product.image_url.trim() === '' ? (
          <div className="h-full w-full flex items-center justify-center bg-gray-100 border border-gray-200">
            <span className="text-sm text-gray-400 font-normal">Sin imagen</span>
          </div>
        ) : (
          <img
            alt={product.image_alt || product.name}
            className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
            src={product.image_url}
            loading="lazy"
            onError={(e) => {
              const target = e.target as HTMLImageElement;
              target.style.display = 'none';
              const parent = target.parentElement;
              if (parent && !parent.querySelector('.no-image-placeholder')) {
                const placeholder = document.createElement('div');
                placeholder.className = 'h-full w-full flex items-center justify-center bg-gray-100 border border-gray-200 no-image-placeholder';
                placeholder.innerHTML = '<span class="text-sm text-gray-400 font-normal">Sin imagen</span>';
                parent.appendChild(placeholder);
              }
            }}
          />
        )}
        {product.is_new && (
          <div className="absolute left-4 top-4 bg-black text-white px-3 py-1.5 text-[10px] font-normal uppercase tracking-[0.2em]">
            New
          </div>
        )}
        {isOutOfStock && (
          <div className="absolute inset-0 bg-black/70 flex items-center justify-center">
            <span className="text-white font-normal uppercase tracking-[0.2em] text-sm">Agotado</span>
          </div>
        )}
      </a>
      
      <div className="flex flex-1 flex-col p-6 bg-white">
        <div className="mb-4">
          <p className="text-xs uppercase tracking-[0.2em] text-black/50 mb-2 font-normal">{product.category}</p>
          <h3 className="text-lg font-medium text-black uppercase tracking-[0.05em] leading-tight font-display mb-3">{product.name}</h3>
          {product.description && (
            <p className="text-sm text-black/70 font-normal leading-relaxed line-clamp-2">{product.description}</p>
          )}
        </div>
        
        <div className="mt-auto">
          <div className="mb-4">
            {isOutOfStock ? (
              <span className="text-sm text-red-600/80 font-medium">Sin stock</span>
            ) : (
              <span className="text-sm text-black/70 font-medium">Stock disponible: {currentStock} unidades</span>
            )}
            {product.has_variations && (
              <p className="text-xs text-green-600 font-normal mt-1">Variaciones disponibles</p>
            )}
          </div>
          
          {!hidePrice && product.category !== 'Cadenas' && (
            <div className="mb-6">
              <p className="text-lg font-normal text-black tracking-wide">
                ${displayPrice.toLocaleString('es-CL')} CLP
              </p>
            </div>
          )}
          
          <div className="flex flex-col gap-3">
            <a
              href={`/producto/${product.id}`}
              className="w-full h-12 flex items-center justify-center gap-2 text-xs font-normal uppercase tracking-[0.15em] border border-black/20 text-black hover:border-black/40 transition-all"
            >
              Ver Detalle
            </a>
            {/* Ocultar botón de carrito para cadenas */}
            {product.category !== 'Cadenas' && (
              <button
                onClick={handleAddToCart}
                disabled={isOutOfStock || isAdding}
                className={`w-full h-12 flex items-center justify-center gap-2 text-xs font-normal uppercase tracking-[0.15em] transition-all ${
                  isOutOfStock
                    ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                    : 'bg-black text-white hover:bg-black/90 active:bg-black'
                }`}
                aria-label={`Añadir ${product.name} al carrito`}
                tabIndex={isOutOfStock ? -1 : 0}
              >
                {isOutOfStock ? 'Agotado' : isAdding ? 'Añadido' : 'Añadir al carrito'}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;
