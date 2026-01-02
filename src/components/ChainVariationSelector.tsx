import { useState, useEffect } from 'react';

interface Chain {
  id: string;
  brand: string;
  name: string;
  thickness: string | null;
  length: string | null;
  price: number;
  stock: number;
  image_url: string | null;
  image_alt: string | null;
  description: string | null;
  is_active: boolean;
}

interface ChainVariationSelectorProps {
  productId: string;
  basePrice: number;
  defaultChainBrand?: string | null; // Marca de cadena por defecto (ej: "PLATA 925")
  onVariationSelect?: (chain: Chain | null, finalPrice: number, sumPrice?: number) => void;
}

const ChainVariationSelector = ({ productId, basePrice, defaultChainBrand, onVariationSelect }: ChainVariationSelectorProps) => {
  const [chains, setChains] = useState<Chain[]>([]);
  const [selectedChain, setSelectedChain] = useState<Chain | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadChains();
  }, [productId]);

  useEffect(() => {
    // Solo ejecutar si hay cadenas
    if (chains.length === 0) return;
    
    // Si ya hay una cadena seleccionada, no hacer nada (evitar loops)
    if (selectedChain) return;
    
    // Si solo hay 1 cadena, seleccionarla automáticamente
    if (chains.length === 1) {
      handleChainClick(chains[0]);
      return;
    }
    
    // Si hay más de 1 cadena, seleccionar la cadena por defecto (PLATA 925) o la primera disponible
    const foundChain = defaultChainBrand 
      ? chains.find(c => c.brand === defaultChainBrand && c.stock > 0)
      : chains.find(c => c.brand === 'PLATA 925' && c.stock > 0) || chains.find(c => c.stock > 0) || chains[0];
    if (foundChain) {
      handleChainClick(foundChain);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [chains, defaultChainBrand]);

  const loadChains = async () => {
    try {
      setIsLoading(true);
      // Cargar cadenas disponibles para este colgante
      const response = await fetch(`/api/pendants/${productId}/chains`);
      if (response.ok) {
        const data = await response.json();
        setChains(data || []);
        
        // La selección automática se maneja en el useEffect
      }
    } catch (error) {
      console.error('Error loading chains:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleChainClick = async (chain: Chain) => {
    // Permitir seleccionar incluso si no hay stock (para mostrar la cadena incluida)
    // El stock se verificará en el botón de agregar al carrito
    setSelectedChain(chain);
    // Calcular precio: basePrice (dije) + price (cadena)
    const sumPrice = basePrice + (chain.price || 0);
    // Redondear a precio profesional (500 o 990)
    const { roundToProfessionalPrice } = await import('../utils/priceRounding');
    const finalPrice = roundToProfessionalPrice(sumPrice);
    onVariationSelect?.(chain, finalPrice, sumPrice);
  };

  if (isLoading) {
    return (
      <div className="mb-6">
        <p className="text-sm text-black/60 font-normal">Cargando opciones de cadenas...</p>
      </div>
    );
  }

  if (chains.length === 0) {
    return null; // No mostrar si no hay cadenas disponibles
  }

  // Si solo hay 1 cadena, mostrarla pero no seleccionable (para eficiencia)
  const hasOnlyOneChain = chains.length === 1;

  return (
    <div className="mb-8 space-y-6 font-sans">
      <div>
        <h3 className="text-base font-semibold text-black mb-4">
          {hasOnlyOneChain ? 'Cadena incluida' : 'Selecciona una cadena'}
        </h3>
        <div className="flex flex-wrap gap-2">
          {chains.map((chain) => {
            const isSelected = selectedChain?.id === chain.id;
            const isOutOfStock = chain.stock <= 0;
            const isDisabled = hasOnlyOneChain || isOutOfStock; // Deshabilitar si solo hay 1 o sin stock
            
            return (
              <button
                key={chain.id}
                onClick={() => !hasOnlyOneChain && handleChainClick(chain)}
                disabled={isDisabled}
                className={`px-4 py-2.5 text-sm font-medium transition-all border-2 ${
                  isSelected
                    ? hasOnlyOneChain
                      ? 'bg-gray-100 text-black border-gray-300 cursor-default'
                      : 'bg-black text-white border-black'
                    : isOutOfStock
                    ? 'bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed line-through'
                    : hasOnlyOneChain
                    ? 'bg-gray-50 text-black/70 border-gray-200 cursor-default'
                    : 'bg-white text-black border-black/20 hover:border-black/40'
                }`}
                aria-label={hasOnlyOneChain 
                  ? `${chain.brand} - Incluida` 
                  : `Seleccionar ${chain.brand} - ${isOutOfStock ? 'Sin stock' : 'Stock disponible'}`}
                title={hasOnlyOneChain ? 'Esta cadena está incluida con el colgante' : undefined}
              >
                {chain.brand}
                {isOutOfStock && (
                  <span className="ml-2 text-xs opacity-70">Sin stock</span>
                )}
              </button>
            );
          })}
        </div>
      </div>
      
      {selectedChain && (
        <div className="mt-4 p-4 bg-black/5 border border-black/10 rounded">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold text-black mb-1">
                {hasOnlyOneChain ? 'Cadena incluida' : 'Cadena seleccionada'}: {selectedChain.brand}
              </p>
              <p className="text-xs text-black/60">
                Stock disponible: {selectedChain.stock} unidades
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ChainVariationSelector;
