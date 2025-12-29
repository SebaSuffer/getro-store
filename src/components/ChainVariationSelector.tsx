import { useState, useEffect } from 'react';

interface ChainVariation {
  id: string;
  brand: string;
  thickness: string;
  length: string;
  stock: number;
  price_modifier: number;
  is_active: boolean;
}

interface ChainVariationSelectorProps {
  productId: string;
  basePrice: number;
  onVariationSelect?: (variation: ChainVariation | null, finalPrice: number) => void;
}

const ChainVariationSelector = ({ productId, basePrice, onVariationSelect }: ChainVariationSelectorProps) => {
  const [variations, setVariations] = useState<ChainVariation[]>([]);
  const [selectedVariation, setSelectedVariation] = useState<ChainVariation | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadVariations();
  }, [productId]);

  const loadVariations = async () => {
    try {
      setIsLoading(true);
      const response = await fetch(`/api/products/${productId}/variations`);
      if (response.ok) {
        const data = await response.json();
        // Filtrar solo variaciones activas
        const activeVariations = data.filter((v: ChainVariation) => v.is_active);
        setVariations(activeVariations);
      }
    } catch (error) {
      console.error('Error loading variations:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleVariationClick = (variation: ChainVariation) => {
    if (variation.stock <= 0) return; // No seleccionar si no hay stock
    
    setSelectedVariation(variation);
    const finalPrice = basePrice + (variation.price_modifier || 0);
    onVariationSelect?.(variation, finalPrice);
  };

  if (isLoading) {
    return (
      <div className="mb-6">
        <p className="text-sm text-black/60 font-normal">Cargando opciones...</p>
      </div>
    );
  }

  if (variations.length === 0) {
    return null; // No mostrar si no hay variaciones
  }

  // Agrupar variaciones por marca
  const variationsByBrand: Record<string, ChainVariation[]> = {};
  variations.forEach((v) => {
    if (!variationsByBrand[v.brand]) {
      variationsByBrand[v.brand] = [];
    }
    variationsByBrand[v.brand].push(v);
  });

  return (
    <div className="mb-8 space-y-6">
      {Object.entries(variationsByBrand).map(([brand, brandVariations]) => (
        <div key={brand} className="space-y-3">
          <div className="flex items-center gap-2 mb-2">
            <h3 className="text-base font-semibold text-black uppercase tracking-wide">{brand}</h3>
            <span className="text-xs text-black/50 font-normal">({brandVariations.length} opciones)</span>
          </div>
          
          <div className="flex flex-wrap gap-2">
            {brandVariations.map((variation) => {
              const isSelected = selectedVariation?.id === variation.id;
              const isOutOfStock = variation.stock <= 0;
              const displayText = `${variation.thickness} × ${variation.length}`;
              
              return (
                <button
                  key={variation.id}
                  onClick={() => handleVariationClick(variation)}
                  disabled={isOutOfStock}
                  className={`px-4 py-2.5 text-sm font-medium transition-all border-2 ${
                    isSelected
                      ? 'bg-black text-white border-black'
                      : isOutOfStock
                      ? 'bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed line-through'
                      : 'bg-white text-black border-black/20 hover:border-black/40'
                  }`}
                  aria-label={`Seleccionar ${displayText} - ${isOutOfStock ? 'Sin stock' : 'Stock disponible'}`}
                >
                  {displayText}
                  {isOutOfStock && (
                    <span className="ml-2 text-xs opacity-70">Sin stock</span>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      ))}
      
      {selectedVariation && (
        <div className="mt-4 p-4 bg-black/5 border border-black/10 rounded">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold text-black mb-1">
                Variación seleccionada: {selectedVariation.brand} {selectedVariation.thickness} × {selectedVariation.length}
              </p>
              <p className="text-xs text-black/60">
                Stock disponible: {selectedVariation.stock} unidades
              </p>
            </div>
            {selectedVariation.price_modifier !== 0 && (
              <div className="text-right">
                <p className="text-xs text-black/60 mb-1">Precio base</p>
                <p className="text-sm font-semibold text-black">
                  ${basePrice.toLocaleString('es-CL')} CLP
                  {selectedVariation.price_modifier > 0 && (
                    <span className="text-red-600 ml-2">+{selectedVariation.price_modifier.toLocaleString('es-CL')}</span>
                  )}
                  {selectedVariation.price_modifier < 0 && (
                    <span className="text-green-600 ml-2">{selectedVariation.price_modifier.toLocaleString('es-CL')}</span>
                  )}
                </p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default ChainVariationSelector;

