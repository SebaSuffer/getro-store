import { useState, useEffect } from 'react';

interface ChainVariation {
  id: string;
  product_id: string;
  product_name: string;
  product_image_url: string;
  brand: string;
  thickness: string;
  length: string;
  price_modifier: number;
  stock: number;
}

interface ChainsData {
  chains: any[];
  variations: ChainVariation[];
  groupedByBrand: Record<string, ChainVariation[]>;
}

const ChainsViewer = () => {
  const [chainsData, setChainsData] = useState<ChainsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expandedBrands, setExpandedBrands] = useState<Set<string>>(new Set());
  const [selectedVariation, setSelectedVariation] = useState<ChainVariation | null>(null);

  useEffect(() => {
    loadChains();
  }, []);

  const loadChains = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch('/api/chains');
      if (!response.ok) {
        throw new Error('Error al cargar las cadenas');
      }
      
      const data = await response.json();
      setChainsData(data);
      
      // Expandir todas las marcas por defecto
      const brands = Object.keys(data.groupedByBrand || {});
      setExpandedBrands(new Set(brands));
    } catch (err: any) {
      console.error('Error loading chains:', err);
      setError(err.message || 'Error al cargar las cadenas');
    } finally {
      setLoading(false);
    }
  };

  const handleToggleBrand = (brand: string) => {
    const newExpanded = new Set(expandedBrands);
    if (newExpanded.has(brand)) {
      newExpanded.delete(brand);
    } else {
      newExpanded.add(brand);
    }
    setExpandedBrands(newExpanded);
  };

  const handleVariationClick = (variation: ChainVariation) => {
    setSelectedVariation(variation);
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('es-CL', {
      style: 'currency',
      currency: 'CLP',
      minimumFractionDigits: 0,
    }).format(price);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-black mb-4"></div>
          <p className="text-sm text-black/60 font-light">Cargando cadenas...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="text-center">
          <p className="text-sm text-red-600 font-light mb-4">{error}</p>
          <button
            onClick={loadChains}
            className="text-xs uppercase tracking-wider text-black/80 hover:text-black border border-black/20 hover:border-black/40 px-4 py-2 transition-colors"
          >
            Reintentar
          </button>
        </div>
      </div>
    );
  }

  if (!chainsData || Object.keys(chainsData.groupedByBrand || {}).length === 0) {
    return (
      <div className="flex items-center justify-center py-20">
        <p className="text-sm text-black/60 font-light">No hay cadenas disponibles</p>
      </div>
    );
  }

  const brands = Object.keys(chainsData.groupedByBrand).sort();

  return (
    <div className="w-full">
      {/* Lista de marcas */}
      <div className="space-y-4 mb-12">
        {brands.map((brand) => {
          const variations = chainsData.groupedByBrand[brand];
          const isExpanded = expandedBrands.has(brand);
          
          // Agrupar variaciones por grosor dentro de la marca
          const groupedByThickness: Record<string, ChainVariation[]> = {};
          variations.forEach((v) => {
            const thickness = v.thickness || 'Sin especificar';
            if (!groupedByThickness[thickness]) {
              groupedByThickness[thickness] = [];
            }
            groupedByThickness[thickness].push(v);
          });

          return (
            <div key={brand} className="border border-black/10 bg-white">
              {/* Header de marca */}
              <button
                onClick={() => handleToggleBrand(brand)}
                className="w-full px-6 py-4 flex items-center justify-between hover:bg-black/5 transition-colors text-left"
                aria-expanded={isExpanded}
              >
                <h3 className="text-base font-light uppercase tracking-wider text-black">
                  {brand}
                </h3>
                <span
                  className="material-symbols-outlined transition-transform duration-200"
                  style={{
                    fontSize: '20px',
                    fontWeight: 300,
                    transform: isExpanded ? 'rotate(180deg)' : 'rotate(0deg)',
                  }}
                >
                  expand_more
                </span>
              </button>

              {/* Variaciones agrupadas por grosor */}
              {isExpanded && (
                <div className="border-t border-black/10">
                  {Object.keys(groupedByThickness).sort().map((thickness) => {
                    const thicknessVariations = groupedByThickness[thickness];
                    
                    return (
                      <div key={thickness} className="border-b border-black/5 last:border-b-0">
                        <div className="px-6 py-3 bg-black/2">
                          <h4 className="text-sm font-light text-black/80 uppercase tracking-wide">
                            {thickness}
                          </h4>
                        </div>
                        <div className="px-6 py-4 space-y-3">
                          {thicknessVariations.map((variation) => (
                            <button
                              key={variation.id}
                              onClick={() => handleVariationClick(variation)}
                              className={`w-full text-left p-4 border transition-all ${
                                selectedVariation?.id === variation.id
                                  ? 'border-black/30 bg-black/5'
                                  : 'border-black/10 hover:border-black/20 hover:bg-black/2'
                              }`}
                            >
                              <div className="flex items-start justify-between gap-4">
                                <div className="flex-1">
                                  <div className="flex items-center gap-3 mb-2">
                                    <span className="text-sm font-light text-black/90">
                                      {variation.length}
                                    </span>
                                    {variation.stock > 0 ? (
                                      <span className="text-xs text-black/60 font-light">
                                        Stock: {variation.stock}
                                      </span>
                                    ) : (
                                      <span className="text-xs text-red-600/80 font-light">
                                        Sin stock
                                      </span>
                                    )}
                                  </div>
                                  {variation.price_modifier > 0 && (
                                    <p className="text-sm font-light text-black/70">
                                      {formatPrice(variation.price_modifier)}
                                    </p>
                                  )}
                                </div>
                                {variation.product_image_url && (
                                  <div className="w-16 h-16 overflow-hidden bg-gray-50 border border-black/10 flex-shrink-0">
                                    <img
                                      src={variation.product_image_url}
                                      alt={variation.product_name}
                                      className="w-full h-full object-cover"
                                      onError={(e) => {
                                        const target = e.target as HTMLImageElement;
                                        target.style.display = 'none';
                                      }}
                                    />
                                  </div>
                                )}
                              </div>
                            </button>
                          ))}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Panel de detalles de variación seleccionada */}
      {selectedVariation && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={() => setSelectedVariation(null)}>
          <div
            className="bg-white max-w-2xl w-full max-h-[90vh] overflow-y-auto p-8"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start justify-between mb-6">
              <h2 className="text-2xl font-light uppercase tracking-wider text-black">
                {selectedVariation.brand}
              </h2>
              <button
                onClick={() => setSelectedVariation(null)}
                className="text-black/60 hover:text-black transition-colors"
                aria-label="Cerrar"
              >
                <span className="material-symbols-outlined" style={{ fontSize: '24px', fontWeight: 300 }}>
                  close
                </span>
              </button>
            </div>

            {selectedVariation.product_image_url && (
              <div className="mb-6 aspect-square overflow-hidden bg-gray-50 border border-black/10">
                <img
                  src={selectedVariation.product_image_url}
                  alt={selectedVariation.product_name}
                  className="w-full h-full object-cover"
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
              </div>
            )}

            <div className="space-y-4">
              <div>
                <h3 className="text-sm font-light uppercase tracking-wider text-black/60 mb-2">
                  Producto
                </h3>
                <p className="text-base font-light text-black">{selectedVariation.product_name}</p>
              </div>

              <div>
                <h3 className="text-sm font-light uppercase tracking-wider text-black/60 mb-2">
                  Grosor
                </h3>
                <p className="text-base font-light text-black">{selectedVariation.thickness}</p>
              </div>

              <div>
                <h3 className="text-sm font-light uppercase tracking-wider text-black/60 mb-2">
                  Largo
                </h3>
                <p className="text-base font-light text-black">{selectedVariation.length}</p>
              </div>

              {selectedVariation.price_modifier > 0 && (
                <div>
                  <h3 className="text-sm font-light uppercase tracking-wider text-black/60 mb-2">
                    Precio
                  </h3>
                  <p className="text-lg font-light text-black">
                    {formatPrice(selectedVariation.price_modifier)}
                  </p>
                </div>
              )}

              <div>
                <h3 className="text-sm font-light uppercase tracking-wider text-black/60 mb-2">
                  Stock
                </h3>
                <p className={`text-base font-light ${selectedVariation.stock > 0 ? 'text-black' : 'text-red-600'}`}>
                  {selectedVariation.stock > 0 ? `${selectedVariation.stock} unidades disponibles` : 'Sin stock'}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ChainsViewer;

