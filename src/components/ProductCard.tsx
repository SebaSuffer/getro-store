import { useState, useEffect } from 'react';
import { addToCart, getCart } from '../utils/cart';
import type { Product } from '../data/products';

interface ProductCardProps {
  product: Product;
}

const ProductCard = ({ product: initialProduct }: ProductCardProps) => {
  const [isInCart, setIsInCart] = useState(false);
  const [isAdding, setIsAdding] = useState(false);
  const [currentStock, setCurrentStock] = useState(initialProduct.stock);
  const [product, setProduct] = useState(initialProduct);

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
    
    // Cargar stock actualizado al montar
    const loadStock = async () => {
      try {
        const { getProductStock } = await import('../utils/stock');
        const stock = await getProductStock(product.id);
        setCurrentStock(stock || product.stock);
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
    if (currentStock <= 0) return;
    
    setIsAdding(true);
    try {
      const success = await addToCart(product, 1);
      
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
        <img
          alt={product.image_alt || product.name}
          className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
          src={product.image_url}
          loading="lazy"
          onError={(e) => {
            // Fallback si la imagen no carga - usar imagen de Cloudinary
            const target = e.target as HTMLImageElement;
            const fallbackUrl = 'https://res.cloudinary.com/ddzoh72zv/image/upload/f_auto,q_auto/v1766458847/DSC05016_dwuz7c.jpg';
            if (!target.src.includes('cloudinary.com')) {
              target.src = fallbackUrl;
            }
          }}
        />
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
          <p className="text-[10px] uppercase tracking-[0.3em] text-black/50 mb-2 font-normal">{product.category}</p>
          <h3 className="text-base font-medium text-black uppercase tracking-[0.05em] leading-tight font-display">{product.name}</h3>
        </div>
        
        <div className="mt-auto">
          <div className="mb-4">
            {isOutOfStock ? (
              <span className="text-[10px] text-red-600/80 font-normal">Sin stock</span>
            ) : (
              <span className="text-[10px] text-black/60 font-normal">Stock disponible</span>
            )}
            {product.has_variations && (
              <p className="text-[10px] text-green-600 font-normal mt-1">Variaciones disponibles</p>
            )}
          </div>
          
          <div className="mb-6">
            <p className="text-lg font-normal text-black tracking-wide">
              ${product.price.toLocaleString('es-CL')} CLP
            </p>
          </div>
          
          <div className="flex flex-col gap-3">
            <a
              href={`/producto/${product.id}`}
              className="w-full h-11 flex items-center justify-center gap-2 text-[10px] font-normal uppercase tracking-[0.2em] border border-black/20 text-black hover:border-black/40 transition-all"
            >
              Ver Detalle
            </a>
            <button
              onClick={handleAddToCart}
              disabled={isOutOfStock || isAdding}
              className={`w-full h-11 flex items-center justify-center gap-2 text-[10px] font-normal uppercase tracking-[0.2em] transition-all ${
                isOutOfStock
                  ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                  : 'bg-black text-white hover:bg-black/90 active:bg-black'
              }`}
              aria-label={`Añadir ${product.name} al carrito`}
              tabIndex={isOutOfStock ? -1 : 0}
            >
              {isOutOfStock ? 'Agotado' : isAdding ? 'Añadido' : 'Añadir al carrito'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;
