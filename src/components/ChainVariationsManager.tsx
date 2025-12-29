import { useState, useEffect } from 'react';

interface ChainVariation {
  id?: string;
  brand: string;
  thickness: string;
  length: string;
  stock: number;
  price_modifier: number;
  is_active: boolean;
}

interface ChainVariationsManagerProps {
  productId: string;
  onVariationsChange?: (variations: ChainVariation[]) => void;
}

// Opciones de marcas disponibles
const BRANDS = ['BARBADA', 'TRADICIONAL', 'GUCCI', 'CARTIER', 'TURBILLON'];

// Opciones de grosores y largos por marca
const BRAND_OPTIONS: Record<string, { thickness: string[]; lengths: Record<string, string[]> }> = {
  BARBADA: {
    thickness: ['2.4MM', '3MM', '4MM', '7.1MM'],
    lengths: {
      '2.4MM': ['45CM', '50CM', '60CM'],
      '3MM': ['50CM', '60CM', '70CM'],
      '4MM': ['55CM'],
      '7.1MM': ['55CM'],
    },
  },
  TRADICIONAL: {
    thickness: ['1.5MM', '3.6MM', '4.4MM'],
    lengths: {
      '1.5MM': ['45CM', '50CM', '60CM'],
      '3.6MM': ['50CM', '70CM'],
      '4.4MM': ['60CM', '70CM'],
    },
  },
  GUCCI: {
    thickness: ['1.8MM', '4MM'],
    lengths: {
      '1.8MM': ['45CM', '50CM'],
      '4MM': ['50CM', '60CM'],
    },
  },
  CARTIER: {
    thickness: ['2MM', '4.6MM', '6MM'],
    lengths: {
      '2MM': ['45CM', '50CM', '60CM'],
      '4.6MM': ['50CM', '60CM', '70CM'],
      '6MM': ['55CM', '70CM'],
    },
  },
  TURBILLON: {
    thickness: ['1MM', '2MM', '2.8MM'],
    lengths: {
      '1MM': ['45CM', '50CM', '60CM'],
      '2MM': ['50CM', '60CM', '70CM'],
      '2.8MM': ['50CM', '60CM', '70CM'],
    },
  },
};

const ChainVariationsManager = ({ productId, onVariationsChange }: ChainVariationsManagerProps) => {
  const [variations, setVariations] = useState<ChainVariation[]>([]);
  const [selectedBrand, setSelectedBrand] = useState<string>('');
  const [selectedThickness, setSelectedThickness] = useState<string>('');
  const [selectedLength, setSelectedLength] = useState<string>('');
  const [newVariationStock, setNewVariationStock] = useState<number>(0);
  const [newVariationPriceModifier, setNewVariationPriceModifier] = useState<number>(0);
  const [isLoading, setIsLoading] = useState(false);

  // Cargar variaciones existentes
  useEffect(() => {
    if (productId && productId !== 'new-' + Date.now().toString(36)) {
      loadVariations();
    }
  }, [productId]);

  const loadVariations = async () => {
    try {
      setIsLoading(true);
      const response = await fetch(`/api/products/${productId}/variations`);
      if (response.ok) {
        const data = await response.json();
        setVariations(data || []);
      }
    } catch (error) {
      console.error('Error loading variations:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddVariation = async () => {
    if (!selectedBrand || !selectedThickness || !selectedLength) {
      alert('Por favor, selecciona marca, grosor y largo');
      return;
    }

    // Verificar si ya existe esta combinación
    const exists = variations.some(
      v => v.brand === selectedBrand && 
           v.thickness === selectedThickness && 
           v.length === selectedLength
    );

    if (exists) {
      alert('Esta combinación de marca, grosor y largo ya existe');
      return;
    }

    const newVariation: ChainVariation = {
      brand: selectedBrand,
      thickness: selectedThickness,
      length: selectedLength,
      stock: newVariationStock,
      price_modifier: newVariationPriceModifier,
      is_active: true,
    };

    const updatedVariations = [...variations, newVariation];
    setVariations(updatedVariations);
    onVariationsChange?.(updatedVariations);

    // Guardar en la BD
    try {
      await saveVariations(updatedVariations);
    } catch (error) {
      console.error('Error saving variation:', error);
      alert('Error al guardar la variación. Por favor, intenta nuevamente.');
      // Revertir cambio
      setVariations(variations);
      onVariationsChange?.(variations);
      return;
    }

    // Resetear formulario
    setSelectedBrand('');
    setSelectedThickness('');
    setSelectedLength('');
    setNewVariationStock(0);
    setNewVariationPriceModifier(0);
  };

  const handleRemoveVariation = async (index: number) => {
    if (!confirm('¿Estás seguro de que deseas eliminar esta variación?')) {
      return;
    }

    const updatedVariations = variations.filter((_, i) => i !== index);
    setVariations(updatedVariations);
    onVariationsChange?.(updatedVariations);

    // Guardar en la BD
    try {
      await saveVariations(updatedVariations);
    } catch (error) {
      console.error('Error removing variation:', error);
      alert('Error al eliminar la variación. Por favor, intenta nuevamente.');
      // Revertir cambio
      setVariations(variations);
      onVariationsChange?.(variations);
    }
  };

  const saveVariations = async (variationsToSave: ChainVariation[]) => {
    if (!productId || productId.startsWith('new-')) {
      return; // No guardar si el producto aún no está guardado
    }

    setIsLoading(true);
    try {
      // Obtener el chain_type del producto (por defecto 'plata_925')
      const response = await fetch(`/api/products/${productId}/variations`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          variations: variationsToSave.map(v => ({
            ...v,
            chain_type: 'plata_925', // Por ahora siempre plata_925, se puede mejorar después
          })),
        }),
      });

      if (!response.ok) {
        throw new Error('Error al guardar variaciones');
      }

      // Recargar variaciones para asegurar sincronización
      await loadVariations();
    } finally {
      setIsLoading(false);
    }
  };

  const availableThicknesses = selectedBrand ? BRAND_OPTIONS[selectedBrand]?.thickness || [] : [];
  const availableLengths = selectedBrand && selectedThickness 
    ? BRAND_OPTIONS[selectedBrand]?.lengths[selectedThickness] || []
    : [];

  return (
    <div className="space-y-4">
      {isLoading && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-center">
          <p className="text-xs text-blue-800 font-normal">Guardando variaciones...</p>
        </div>
      )}
      <div className="bg-gradient-to-br from-black/5 to-black/10 border border-black/20 rounded-lg p-5 space-y-4">
        <div className="flex items-center gap-2 mb-4">
          <span className="material-symbols-outlined text-black/70" style={{ fontSize: '18px', fontWeight: 300 }}>
            category
          </span>
          <h3 className="text-sm font-semibold text-black">Gestionar Variaciones de Cadena (Marca, Grosor y Largo)</h3>
        </div>

        {/* Formulario para añadir variación */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
          <div>
            <label className="block text-xs font-semibold text-black mb-1">Marca</label>
            <select
              value={selectedBrand}
              onChange={(e) => {
                setSelectedBrand(e.target.value);
                setSelectedThickness('');
                setSelectedLength('');
              }}
              className="w-full bg-white border border-black/20 px-3 py-2 text-black text-sm font-normal focus:outline-none focus:border-black/40"
            >
              <option value="">Seleccionar...</option>
              {BRANDS.map((brand) => (
                <option key={brand} value={brand}>{brand}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-black mb-1">Grosor</label>
            <select
              value={selectedThickness}
              onChange={(e) => {
                setSelectedThickness(e.target.value);
                setSelectedLength('');
              }}
              disabled={!selectedBrand}
              className="w-full bg-white border border-black/20 px-3 py-2 text-black text-sm font-normal focus:outline-none focus:border-black/40 disabled:opacity-50"
            >
              <option value="">Seleccionar...</option>
              {availableThicknesses.map((thickness) => (
                <option key={thickness} value={thickness}>{thickness}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-black mb-1">Largo</label>
            <select
              value={selectedLength}
              onChange={(e) => setSelectedLength(e.target.value)}
              disabled={!selectedThickness}
              className="w-full bg-white border border-black/20 px-3 py-2 text-black text-sm font-normal focus:outline-none focus:border-black/40 disabled:opacity-50"
            >
              <option value="">Seleccionar...</option>
              {availableLengths.map((length) => (
                <option key={length} value={length}>{length}</option>
              ))}
            </select>
          </div>

          <div className="flex items-end gap-2">
            <button
              onClick={handleAddVariation}
              disabled={!selectedBrand || !selectedThickness || !selectedLength}
              className="flex-1 px-4 py-2 bg-black text-white text-sm font-medium hover:bg-black/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Añadir
            </button>
          </div>
        </div>

        {/* Stock y modificador de precio */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-semibold text-black mb-1">Stock</label>
            <input
              type="number"
              value={newVariationStock}
              onChange={(e) => setNewVariationStock(parseInt(e.target.value) || 0)}
              min="0"
              className="w-full bg-white border border-black/20 px-3 py-2 text-black text-sm font-normal focus:outline-none focus:border-black/40"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-black mb-1">Modificador Precio (CLP)</label>
            <input
              type="number"
              value={newVariationPriceModifier}
              onChange={(e) => setNewVariationPriceModifier(parseInt(e.target.value) || 0)}
              className="w-full bg-white border border-black/20 px-3 py-2 text-black text-sm font-normal focus:outline-none focus:border-black/40"
              placeholder="0"
            />
          </div>
        </div>
      </div>

      {/* Lista de variaciones añadidas */}
      {variations.length > 0 && (
        <div className="border border-black/10 rounded-lg p-4">
          <h4 className="text-xs font-semibold text-black mb-3 uppercase tracking-wide">
            Variaciones Configuradas ({variations.length})
          </h4>
          <div className="space-y-2">
            {variations.map((variation, index) => (
              <div
                key={index}
                className="flex items-center justify-between p-3 bg-white border border-black/10 rounded"
              >
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-semibold text-black">{variation.brand}</span>
                    <span className="text-xs text-black/60">•</span>
                    <span className="text-sm text-black/80">{variation.thickness}</span>
                    <span className="text-xs text-black/60">×</span>
                    <span className="text-sm text-black/80">{variation.length}</span>
                  </div>
                  <div className="text-xs text-black/60 mt-1">
                    Stock: {variation.stock} | 
                    {variation.price_modifier !== 0 && (
                      <span className={variation.price_modifier > 0 ? 'text-red-600' : 'text-green-600'}>
                        {' '}Precio: {variation.price_modifier > 0 ? '+' : ''}{variation.price_modifier.toLocaleString('es-CL')} CLP
                      </span>
                    )}
                  </div>
                </div>
                <button
                  onClick={() => handleRemoveVariation(index)}
                  className="ml-4 text-red-600 hover:text-red-700 transition-colors"
                  aria-label="Eliminar variación"
                >
                  <span className="material-symbols-outlined" style={{ fontSize: '18px', fontWeight: 300 }}>
                    delete
                  </span>
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default ChainVariationsManager;

