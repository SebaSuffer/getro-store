import { useState, useEffect } from 'react';
import { addToCart, getCart } from '../utils/cart';
import ProductCard from './ProductCard';
import ChainVariationSelector from './ChainVariationSelector';
import type { Product } from '../data/products';

interface ProductDetailProps {
  product: Product;
}

const ProductDetail = ({ product: initialProduct }: ProductDetailProps) => {
  const [isInCart, setIsInCart] = useState(false);
  const [isAdding, setIsAdding] = useState(false);
  const [quantity, setQuantity] = useState(1);
  const [currentStock, setCurrentStock] = useState(initialProduct.stock);
  const [relatedProducts, setRelatedProducts] = useState<Product[]>([]);
  const [product, setProduct] = useState(initialProduct);
  const [selectedVariation, setSelectedVariation] = useState<any>(null);
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
          console.log('ProductDetail: Actualizando producto', product.id, updatedProduct.name);
          setProduct(updatedProduct);
          const stock = await getProductStock(updatedProduct.id);
          setCurrentStock(stock || updatedProduct.stock);
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
    
    // Si es una cadena, verificar que se haya seleccionado una variación
    if (product.category === 'Cadenas' && !selectedVariation) {
      alert('Por favor, selecciona una variación (marca, grosor y largo) antes de añadir al carrito');
      return;
    }
    
    setIsAdding(true);
    try {
      const success = await addToCart(product, quantity, selectedVariation ? {
        id: selectedVariation.id,
        brand: selectedVariation.brand,
        thickness: selectedVariation.thickness,
        length: selectedVariation.length,
        price_modifier: selectedVariation.price_modifier || 0,
      } : undefined);
      
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
          <a href="/catalogo" className="text-sm font-normal text-black/60 hover:text-black transition-colors inline-flex items-center gap-2 font-sans">
            <span className="material-symbols-outlined" style={{ fontSize: '18px', fontWeight: 300 }}>arrow_back</span>
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
              <p className="text-sm uppercase tracking-wide text-black/60 mb-3 font-normal font-sans">{product.category}</p>
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-semibold text-black tracking-tight mb-6 font-sans">
                {product.name}
              </h1>
              
              <div className="mb-6">
                {isOutOfStock ? (
                  <span className="text-base text-red-600 font-medium font-sans">Sin stock</span>
                ) : (
                  <span className="text-base text-black/70 font-medium font-sans">
                    Stock disponible: {currentStock}
                    {selectedVariation && (
                      <span className="text-sm text-black/50 ml-2">
                        ({selectedVariation.brand} {selectedVariation.thickness} × {selectedVariation.length})
                      </span>
                    )}
                  </span>
                )}
              </div>

              <div className="mb-8">
                <p className="text-4xl font-bold text-black tracking-tight font-sans">
                  ${displayPrice.toLocaleString('es-CL')} CLP
                </p>
                {selectedVariation && selectedVariation.price_modifier !== 0 && (
                  <p className="text-sm text-black/60 font-normal mt-2">
                    Precio base: ${product.price.toLocaleString('es-CL')} CLP
                    {selectedVariation.price_modifier > 0 && (
                      <span className="text-red-600 ml-2">+{selectedVariation.price_modifier.toLocaleString('es-CL')} CLP</span>
                    )}
                    {selectedVariation.price_modifier < 0 && (
                      <span className="text-green-600 ml-2">{selectedVariation.price_modifier.toLocaleString('es-CL')} CLP</span>
                    )}
                  </p>
                )}
              </div>
            </div>

            {/* Selector de Variaciones (solo para cadenas) */}
            {product.category === 'Cadenas' && (
              <div className="mb-8">
                <ChainVariationSelector
                  productId={product.id}
                  basePrice={product.price}
                  onVariationSelect={(variation, finalPrice) => {
                    setSelectedVariation(variation);
                    setDisplayPrice(finalPrice);
                    if (variation) {
                      setCurrentStock(variation.stock);
                    } else {
                      setCurrentStock(product.stock);
                    }
                  }}
                />
              </div>
            )}

            {/* Descripción */}
            <div className="mb-8">
              <h2 className="text-lg font-semibold text-black mb-4 font-sans">Descripción</h2>
              <p className="text-base text-black/80 font-normal leading-relaxed whitespace-pre-line font-sans">
                {product.description || 'Pieza de joyería fina elaborada con los más altos estándares de calidad.'}
              </p>
            </div>

            {/* Especificaciones Técnicas */}
            <div className="mb-8 border-t border-black/10 pt-8">
              <h2 className="text-lg font-semibold text-black mb-6 font-sans">Especificaciones</h2>
              <div className="space-y-4">
                <div className="flex justify-between items-start">
                  <span className="text-base font-medium text-black/70 font-sans">Material</span>
                  <span className="text-base font-normal text-black/90 text-right font-sans">{specs.material}</span>
                </div>
                <div className="flex justify-between items-start">
                  <span className="text-base font-medium text-black/70 font-sans">Pureza</span>
                  <span className="text-base font-normal text-black/90 text-right font-sans">{specs.pureza}</span>
                </div>
                {specs.dimensiones && (
                  <div className="flex justify-between items-start">
                    <span className="text-base font-medium text-black/70 font-sans">Dimensiones</span>
                    <span className="text-base font-normal text-black/90 text-right font-sans">{specs.dimensiones}</span>
                  </div>
                )}
                {specs.peso && (
                  <div className="flex justify-between items-start">
                    <span className="text-base font-medium text-black/70 font-sans">Peso</span>
                    <span className="text-base font-normal text-black/90 text-right font-sans">{specs.peso}</span>
                  </div>
                )}
                <div className="flex justify-between items-start">
                  <span className="text-base font-medium text-black/70 font-sans">Garantía</span>
                  <span className="text-base font-normal text-black/90 text-right font-sans">{specs.garantia}</span>
                </div>
              </div>
            </div>

            {/* Cuidados y Mantenimiento */}
            <div className="mb-8 border-t border-black/10 pt-8">
              <h2 className="text-lg font-semibold text-black mb-4 font-sans">Cuidados</h2>
              <p className="text-base font-normal text-black/80 leading-relaxed font-sans">
                {specs.cuidados}
              </p>
            </div>

            {/* Información de Envío */}
            <div className="mb-8 border-t border-black/10 pt-8">
              <h2 className="text-lg font-semibold text-black mb-4 font-sans">Envío y Packaging</h2>
              <div className="space-y-2">
                <p className="text-base font-normal text-black/80 leading-relaxed font-sans">
                  {specs.envio}
                </p>
                <p className="text-base font-normal text-black/80 leading-relaxed font-sans">
                  {specs.packaging}
                </p>
              </div>
            </div>

            {/* Cantidad y Botones */}
            <div className="mt-auto space-y-4 border-t border-black/10 pt-8">
              <div className="flex items-center gap-4">
                <label className="text-base font-medium text-black font-sans">Cantidad</label>
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="flex size-12 items-center justify-center border border-black/20 hover:border-black/40 transition-colors"
                    aria-label="Disminuir cantidad"
                  >
                    <span className="material-symbols-outlined" style={{ fontSize: '20px', fontWeight: 300 }}>remove</span>
                  </button>
                  <span className="w-20 text-center font-semibold text-black text-lg font-sans">
                    {quantity}
                  </span>
                  <button
                    onClick={() => setQuantity(Math.min(currentStock, quantity + 1))}
                    disabled={quantity >= currentStock}
                    className="flex size-12 items-center justify-center border border-black/20 hover:border-black/40 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                    aria-label="Aumentar cantidad"
                  >
                    <span className="material-symbols-outlined" style={{ fontSize: '20px', fontWeight: 300 }}>add</span>
                  </button>
                </div>
              </div>

              <button
                onClick={handleAddToCart}
                disabled={isOutOfStock || isAdding || (product.category === 'Cadenas' && !selectedVariation)}
                className={`w-full h-14 flex items-center justify-center gap-2 text-base font-semibold transition-all font-sans ${
                  isOutOfStock || (product.category === 'Cadenas' && !selectedVariation)
                    ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                    : 'bg-black text-white hover:bg-black/90 active:bg-black'
                }`}
                aria-label={`Añadir ${product.name} al carrito`}
                tabIndex={isOutOfStock || (product.category === 'Cadenas' && !selectedVariation) ? -1 : 0}
              >
                <span className="material-symbols-outlined" style={{ fontSize: '22px', fontWeight: 300 }}>
                  {isAdding ? 'check' : 'shopping_bag'}
                </span>
                {isOutOfStock 
                  ? 'Agotado' 
                  : product.category === 'Cadenas' && !selectedVariation
                  ? 'Selecciona una variación'
                  : isAdding 
                  ? 'Añadido' 
                  : 'Añadir al Carrito'}
              </button>
            </div>
          </div>
        </div>

        {/* Productos Relacionados */}
        {relatedProducts.length > 0 && (
          <div className="border-t border-black/10 pt-16">
            <h2 className="text-xl font-semibold text-black mb-12 font-sans text-center">
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
                className="inline-flex h-12 items-center justify-center bg-black text-white px-10 text-base font-semibold transition-all hover:bg-black/90 font-sans"
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
