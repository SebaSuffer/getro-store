import { useState, useEffect } from 'react';
import { addToCart, getCart } from '../utils/cart';
import ProductCard from './ProductCard';
import type { Product } from '../data/products';

interface ProductDetailProps {
  product: Product;
}

const ProductDetail = ({ product: initialProduct }: ProductDetailProps) => {
  const [isInCart, setIsInCart] = useState(false);
  const [isAdding, setIsAdding] = useState(false);
  const [quantity, setQuantity] = useState(1);
  const [isEditing, setIsEditing] = useState(false);
  const [currentStock, setCurrentStock] = useState(initialProduct.stock);
  const [relatedProducts, setRelatedProducts] = useState<Product[]>([]);
  const [product, setProduct] = useState(initialProduct);
  const [editedDescription, setEditedDescription] = useState(initialProduct.description || '');
  const [hasDescription, setHasDescription] = useState(!!initialProduct.description);

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
          console.log('ProductDetail: Actualizando producto', product.id, updatedProduct.name);
          setProduct(updatedProduct);
          const stock = await getProductStock(updatedProduct.id);
          setCurrentStock(stock || updatedProduct.stock);
          setEditedDescription(updatedProduct.description || '');
          setHasDescription(!!updatedProduct.description);
        }
      } catch (error) {
        console.error('Error updating product:', error);
      }
    };
    
    checkCart();
    window.addEventListener('cartUpdated', checkCart);
    window.addEventListener('productUpdated', handleProductUpdate as EventListener);
    
    // Cargar datos actualizados al montar
    const loadData = async () => {
      try {
        const { getProductById, getRelatedProducts } = await import('../data/products');
        const { getProductStock } = await import('../utils/stock');
        
        // Cargar producto actualizado
        const currentProduct = await getProductById(product.id);
        if (currentProduct) {
          setProduct(currentProduct);
          setEditedDescription(currentProduct.description || '');
          setHasDescription(!!currentProduct.description);
        }
        
        // Cargar stock actualizado
        const stock = await getProductStock(product.id);
        setCurrentStock(stock || product.stock);
        
        // Cargar productos relacionados
        const related = await getRelatedProducts(product.id, 4);
        setRelatedProducts(related);
      } catch (error) {
        console.error('Error loading data:', error);
      }
    };
    
    loadData();
    
    return () => {
      window.removeEventListener('cartUpdated', checkCart);
      window.removeEventListener('productUpdated', handleProductUpdate as EventListener);
    };
  }, [product.id, product.stock]);

  const handleAddToCart = async () => {
    if (currentStock <= 0) return;
    
    setIsAdding(true);
    try {
      const success = await addToCart(product, quantity);
      
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

  const handleSaveDescription = async () => {
    try {
      // Actualizar descripción en Turso
      const response = await fetch(`/api/products/${product.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...product,
          description: editedDescription,
        }),
      });

      if (!response.ok) {
        throw new Error('Error al guardar la descripción');
      }

      setHasDescription(true);
      setIsEditing(false);
      
      // Recargar producto
      const { getProductById } = await import('../data/products');
      const updatedProduct = await getProductById(product.id);
      if (updatedProduct) {
        setProduct(updatedProduct);
      }
    } catch (error) {
      console.error('Error saving description:', error);
      alert('Error al guardar la descripción');
    }
  };

  const isOutOfStock = currentStock <= 0;

  // Información por defecto basada en la categoría
  const getDefaultSpecs = () => {
    const baseSpecs = {
      material: 'Plata Sólida 925',
      pureza: '925/1000',
      garantia: '2 años',
      cuidados: 'Evitar contacto con químicos, perfumes y agua de mar. Limpiar con paño suave.',
      envio: 'Envío gratis a todo Chile en compras sobre $50.000',
      packaging: 'Incluye estuche de regalo y certificado de autenticidad',
    };

    if (product.category === 'Cadenas' || product.category === 'Pulseras') {
      return {
        ...baseSpecs,
        dimensiones: 'Longitud ajustable según modelo',
        peso: 'Peso aproximado según grosor',
      };
    }
    
    if (product.category === 'Anillos') {
      return {
        ...baseSpecs,
        dimensiones: 'Tallas disponibles: 5, 6, 7, 8, 9',
        peso: 'Peso aproximado: 2-5g según modelo',
      };
    }
    
    if (product.category === 'Aros') {
      return {
        ...baseSpecs,
        dimensiones: 'Diámetro estándar, ajustable',
        peso: 'Peso aproximado: 1-3g por par',
      };
    }

    return baseSpecs;
  };

  const specs = getDefaultSpecs();

  return (
    <div className="py-20">
      <div className="mx-auto max-w-[1920px] px-6 lg:px-12">
        <div className="mb-8">
          <a href="/catalogo" className="text-xs font-light uppercase tracking-[0.2em] text-black/60 hover:text-black transition-colors inline-flex items-center gap-2">
            <span className="material-symbols-outlined" style={{ fontSize: '16px', fontWeight: 300 }}>arrow_back</span>
            Volver al Catálogo
          </a>
        </div>

        <div className="grid grid-cols-1 gap-12 lg:grid-cols-2 mb-16">
          {/* Imagen Principal */}
          <div className="relative aspect-square overflow-hidden bg-gray-50">
            <img
              alt={product.image_alt || product.name}
              className="h-full w-full object-cover"
              src={product.image_url}
              loading="eager"
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
              <div className="absolute left-6 top-6 bg-black text-white px-4 py-2 text-[10px] font-light uppercase tracking-[0.2em]">
                New
              </div>
            )}
          </div>

          {/* Información del Producto */}
          <div className="flex flex-col">
            <div className="mb-6">
              <p className="text-[10px] uppercase tracking-[0.3em] text-black/50 mb-3 font-light">{product.category}</p>
              <h1 className="text-3xl sm:text-4xl font-medium text-black tracking-[0.05em] uppercase mb-6 font-display">
                {product.name}
              </h1>
              
              <div className="mb-6">
                {isOutOfStock ? (
                  <span className="text-xs text-red-600/80 uppercase tracking-[0.2em] font-light">Sin stock</span>
                ) : (
                  <span className="text-xs text-black/60 uppercase tracking-[0.2em] font-light">Stock disponible: {currentStock}</span>
                )}
              </div>

              <div className="mb-8">
                <p className="text-3xl font-normal text-black tracking-wide">
                  ${product.price.toLocaleString('es-CL')} CLP
                </p>
              </div>
            </div>

            {/* Descripción */}
            <div className="mb-8">
              <h2 className="text-xs font-light uppercase tracking-[0.2em] text-black mb-4 font-display">Descripción</h2>
              
              {!hasDescription && !isEditing && (
                <div className="border border-yellow-500/30 bg-yellow-500/10 p-4 mb-4">
                  <p className="text-xs text-yellow-800/80 font-light mb-3">
                    ⚠️ Este producto aún no tiene descripción. Puedes agregar una descripción haciendo clic en "Editar Descripción".
                  </p>
                  <button
                    onClick={() => setIsEditing(true)}
                    className="text-xs font-light uppercase tracking-[0.2em] text-yellow-800 hover:text-yellow-900 underline"
                  >
                    Editar Descripción
                  </button>
                </div>
              )}

              {isEditing ? (
                <div className="space-y-4">
                  <textarea
                    value={editedDescription}
                    onChange={(e) => setEditedDescription(e.target.value)}
                    rows={6}
                    className="w-full border border-black/20 px-4 py-3 text-sm font-light bg-white text-black focus:outline-none focus:border-black/40 transition-colors resize-none"
                    placeholder="Agrega una descripción detallada del producto..."
                  />
                  <div className="flex gap-3">
                    <button
                      onClick={handleSaveDescription}
                      className="px-6 py-2 bg-black text-white text-xs font-light uppercase tracking-[0.2em] hover:bg-black/90 transition-colors"
                    >
                      Guardar
                    </button>
                    <button
                      onClick={() => {
                        setIsEditing(false);
                        setEditedDescription(product.description || '');
                      }}
                      className="px-6 py-2 border border-black/20 text-black text-xs font-light uppercase tracking-[0.2em] hover:border-black/40 transition-colors"
                    >
                      Cancelar
                    </button>
                  </div>
                </div>
              ) : (
                <div>
                  {hasDescription ? (
                    <p className="text-sm text-black/70 font-light leading-relaxed whitespace-pre-line mb-4">
                      {editedDescription}
                    </p>
                  ) : (
                    <p className="text-sm text-black/70 font-light leading-relaxed mb-4">
                      {product.description || 'Pieza de joyería fina elaborada con los más altos estándares de calidad.'}
                    </p>
                  )}
                  {hasDescription && (
                    <button
                      onClick={() => setIsEditing(true)}
                      className="text-xs font-light uppercase tracking-[0.2em] text-black/60 hover:text-black underline"
                    >
                      Editar Descripción
                    </button>
                  )}
                </div>
              )}
            </div>

            {/* Especificaciones Técnicas */}
            <div className="mb-8 border-t border-black/10 pt-8">
              <h2 className="text-xs font-light uppercase tracking-[0.2em] text-black mb-6 font-display">Especificaciones</h2>
              <div className="space-y-4">
                <div className="flex justify-between items-start">
                  <span className="text-xs font-light uppercase tracking-[0.1em] text-black/60">Material</span>
                  <span className="text-xs font-light text-black/80 text-right">{specs.material}</span>
                </div>
                <div className="flex justify-between items-start">
                  <span className="text-xs font-light uppercase tracking-[0.1em] text-black/60">Pureza</span>
                  <span className="text-xs font-light text-black/80 text-right">{specs.pureza}</span>
                </div>
                {specs.dimensiones && (
                  <div className="flex justify-between items-start">
                    <span className="text-xs font-light uppercase tracking-[0.1em] text-black/60">Dimensiones</span>
                    <span className="text-xs font-light text-black/80 text-right">{specs.dimensiones}</span>
                  </div>
                )}
                {specs.peso && (
                  <div className="flex justify-between items-start">
                    <span className="text-xs font-light uppercase tracking-[0.1em] text-black/60">Peso</span>
                    <span className="text-xs font-light text-black/80 text-right">{specs.peso}</span>
                  </div>
                )}
                <div className="flex justify-between items-start">
                  <span className="text-xs font-light uppercase tracking-[0.1em] text-black/60">Garantía</span>
                  <span className="text-xs font-light text-black/80 text-right">{specs.garantia}</span>
                </div>
              </div>
            </div>

            {/* Cuidados y Mantenimiento */}
            <div className="mb-8 border-t border-black/10 pt-8">
              <h2 className="text-xs font-light uppercase tracking-[0.2em] text-black mb-4 font-display">Cuidados</h2>
              <p className="text-xs font-light text-black/70 leading-relaxed">
                {specs.cuidados}
              </p>
            </div>

            {/* Información de Envío */}
            <div className="mb-8 border-t border-black/10 pt-8">
              <h2 className="text-xs font-light uppercase tracking-[0.2em] text-black mb-4 font-display">Envío y Packaging</h2>
              <div className="space-y-2">
                <p className="text-xs font-light text-black/70 leading-relaxed">
                  {specs.envio}
                </p>
                <p className="text-xs font-light text-black/70 leading-relaxed">
                  {specs.packaging}
                </p>
              </div>
            </div>

            {/* Cantidad y Botones */}
            <div className="mt-auto space-y-4 border-t border-black/10 pt-8">
              <div className="flex items-center gap-4">
                <label className="text-xs font-light uppercase tracking-[0.2em] text-black">Cantidad</label>
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="flex size-10 items-center justify-center border border-black/20 hover:border-black/40 transition-colors"
                    aria-label="Disminuir cantidad"
                  >
                    <span className="material-symbols-outlined" style={{ fontSize: '18px', fontWeight: 300 }}>remove</span>
                  </button>
                  <span className="w-16 text-center font-light text-black text-sm">
                    {quantity}
                  </span>
                  <button
                    onClick={() => setQuantity(Math.min(currentStock, quantity + 1))}
                    disabled={quantity >= currentStock}
                    className="flex size-10 items-center justify-center border border-black/20 hover:border-black/40 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                    aria-label="Aumentar cantidad"
                  >
                    <span className="material-symbols-outlined" style={{ fontSize: '18px', fontWeight: 300 }}>add</span>
                  </button>
                </div>
              </div>

              <button
                onClick={handleAddToCart}
                disabled={isOutOfStock || isAdding}
                className={`w-full h-14 flex items-center justify-center gap-2 text-xs font-light uppercase tracking-[0.2em] transition-all ${
                  isOutOfStock
                    ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                    : 'bg-black text-white hover:bg-black/90 active:bg-black'
                }`}
                aria-label={`Añadir ${product.name} al carrito`}
                tabIndex={isOutOfStock ? -1 : 0}
              >
                <span className="material-symbols-outlined" style={{ fontSize: '20px', fontWeight: 300 }}>
                  {isAdding ? 'check' : 'shopping_bag'}
                </span>
                {isOutOfStock ? 'Agotado' : isAdding ? 'Añadido' : 'Añadir al Carrito'}
              </button>
            </div>
          </div>
        </div>

        {/* Productos Relacionados */}
        {relatedProducts.length > 0 && (
          <div className="border-t border-black/10 pt-16">
            <h2 className="text-sm font-light uppercase tracking-[0.2em] text-black mb-12 font-display text-center">
              Productos Relacionados
            </h2>
            <div className="grid grid-cols-1 gap-12 sm:grid-cols-2 lg:grid-cols-4 mb-12">
              {relatedProducts.map((relatedProduct) => (
                <ProductCard key={relatedProduct.id} product={relatedProduct} />
              ))}
            </div>
            <div className="text-center">
              <a
                href="/catalogo"
                className="inline-flex h-12 items-center justify-center bg-black text-white px-10 text-xs font-light uppercase tracking-[0.2em] transition-all hover:bg-black/90"
              >
                Ver Todo el Catálogo
              </a>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProductDetail;
