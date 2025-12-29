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

interface VariationsModalProps {
  isOpen: boolean;
  onClose: () => void;
  variations: ChainVariation[];
  onSave: (variations: ChainVariation[]) => Promise<void>;
  productId: string;
}

const BRANDS = ['BARBADA', 'TRADICIONAL', 'GUCCI', 'CARTIER', 'TURBILLON'];

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

const VariationsModal = ({ isOpen, onClose, variations: initialVariations, onSave, productId }: VariationsModalProps) => {
  const [variations, setVariations] = useState<ChainVariation[]>(initialVariations);
  const [selectedBrand, setSelectedBrand] = useState<string>('');
  const [selectedThickness, setSelectedThickness] = useState<string>('');
  const [selectedLength, setSelectedLength] = useState<string>('');
  const [stock, setStock] = useState<number>(0);
  const [priceModifier, setPriceModifier] = useState<number>(0);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [customLength, setCustomLength] = useState<string>('');
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setVariations(initialVariations);
    }
  }, [isOpen, initialVariations]);

  const availableThicknesses = selectedBrand ? BRAND_OPTIONS[selectedBrand]?.thickness || [] : [];
  const standardLengths = selectedBrand && selectedThickness 
    ? BRAND_OPTIONS[selectedBrand]?.lengths[selectedThickness] || []
    : [];

  // Auto-seleccionar primera medida estándar cuando se selecciona grosor
  useEffect(() => {
    if (selectedThickness && standardLengths.length > 0 && !customLength && !selectedLength) {
      setSelectedLength(standardLengths[0]);
    }
  }, [selectedThickness, standardLengths.length, customLength]);

  const handleAddVariation = () => {
    if (!selectedBrand || !selectedThickness) {
      alert('Por favor, selecciona marca y grosor');
      return;
    }

    const finalLength = customLength || selectedLength || standardLengths[0] || '';

    if (!finalLength) {
      alert('Por favor, selecciona o ingresa una medida');
      return;
    }

    const newVariation: ChainVariation = {
      brand: selectedBrand,
      thickness: selectedThickness,
      length: finalLength,
      stock,
      price_modifier: priceModifier,
      is_active: true,
    };

    if (editingIndex !== null) {
      const updated = [...variations];
      updated[editingIndex] = newVariation;
      setVariations(updated);
      setEditingIndex(null);
    } else {
      setVariations([...variations, newVariation]);
    }

    // Resetear formulario
    setSelectedBrand('');
    setSelectedThickness('');
    setSelectedLength('');
    setCustomLength('');
    setStock(0);
    setPriceModifier(0);
  };

  const handleEditVariation = (index: number) => {
    const variation = variations[index];
    setSelectedBrand(variation.brand);
    setSelectedThickness(variation.thickness);
    setSelectedLength(variation.length);
    setCustomLength(variation.length);
    setStock(variation.stock);
    setPriceModifier(variation.price_modifier);
    setEditingIndex(index);
  };

  const handleRemoveVariation = (index: number) => {
    if (confirm('¿Estás seguro de que deseas eliminar esta variación?')) {
      setVariations(variations.filter((_, i) => i !== index));
    }
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await onSave(variations);
      onClose();
    } catch (error) {
      console.error('Error saving variations:', error);
      alert('Error al guardar las variaciones');
    } finally {
      setIsSaving(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-black">Gestionar Variaciones de Cadena</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 text-2xl leading-none"
            aria-label="Cerrar"
          >
            ×
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {/* Formulario para añadir/editar */}
          <div className="bg-gray-50 rounded-lg p-4 mb-6">
            <h3 className="text-sm font-semibold text-black mb-4">
              {editingIndex !== null ? 'Editar Variación' : 'Añadir Nueva Variación'}
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium text-black mb-1">Marca</label>
                <select
                  value={selectedBrand}
                  onChange={(e) => {
                    setSelectedBrand(e.target.value);
                    setSelectedThickness('');
                    setSelectedLength('');
                    setCustomLength('');
                  }}
                  className="w-full bg-white border border-gray-300 px-3 py-2 text-black text-sm focus:outline-none focus:border-black rounded"
                >
                  <option value="">Seleccionar...</option>
                  {BRANDS.map((brand) => (
                    <option key={brand} value={brand}>{brand}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-black mb-1">Grosor</label>
                <select
                  value={selectedThickness}
                  onChange={(e) => {
                    setSelectedThickness(e.target.value);
                    setSelectedLength('');
                    setCustomLength('');
                  }}
                  disabled={!selectedBrand}
                  className="w-full bg-white border border-gray-300 px-3 py-2 text-black text-sm focus:outline-none focus:border-black rounded disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <option value="">Seleccionar...</option>
                  {availableThicknesses.map((thickness) => (
                    <option key={thickness} value={thickness}>{thickness}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-black mb-1">
                  Medida Estándar
                  {selectedThickness && standardLengths.length > 0 && (
                    <span className="text-xs text-gray-500 ml-1">({standardLengths.join(', ')})</span>
                  )}
                </label>
                <div className="flex gap-2">
                  <select
                    value={selectedLength}
                    onChange={(e) => {
                      setSelectedLength(e.target.value);
                      setCustomLength('');
                    }}
                    disabled={!selectedThickness}
                    className="flex-1 bg-white border border-gray-300 px-3 py-2 text-black text-sm focus:outline-none focus:border-black rounded disabled:opacity-50"
                  >
                    <option value="">Auto</option>
                    {standardLengths.map((length) => (
                      <option key={length} value={length}>{length}</option>
                    ))}
                  </select>
                  <button
                    onClick={() => {
                      const input = prompt('Ingresa medida personalizada (ej: 65CM):', customLength || '');
                      if (input) {
                        setCustomLength(input);
                        setSelectedLength('');
                      }
                    }}
                    className="px-3 py-2 bg-gray-200 text-black text-sm hover:bg-gray-300 rounded"
                    title="Editar medida personalizada"
                  >
                    ✏️
                  </button>
                </div>
                {customLength && (
                  <p className="text-xs text-gray-600 mt-1">Medida personalizada: {customLength}</p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium text-black mb-1">Stock</label>
                <input
                  type="number"
                  value={stock}
                  onChange={(e) => setStock(parseInt(e.target.value) || 0)}
                  min="0"
                  className="w-full bg-white border border-gray-300 px-3 py-2 text-black text-sm focus:outline-none focus:border-black rounded"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-black mb-1">Modificador Precio (CLP)</label>
                <input
                  type="number"
                  value={priceModifier}
                  onChange={(e) => setPriceModifier(parseInt(e.target.value) || 0)}
                  className="w-full bg-white border border-gray-300 px-3 py-2 text-black text-sm focus:outline-none focus:border-black rounded"
                  placeholder="0"
                />
              </div>
            </div>

            <button
              onClick={handleAddVariation}
              disabled={!selectedBrand || !selectedThickness}
              className="w-full px-4 py-2 bg-black text-white text-sm font-medium hover:bg-gray-800 rounded disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {editingIndex !== null ? 'Actualizar Variación' : 'Añadir Variación'}
            </button>
          </div>

          {/* Lista de variaciones */}
          {variations.length > 0 ? (
            <div>
              <h3 className="text-sm font-semibold text-black mb-3">
                Variaciones Configuradas ({variations.length})
              </h3>
              <div className="space-y-2">
                {variations.map((variation, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-4 bg-white border border-gray-200 rounded-lg"
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-1">
                        <span className="text-sm font-semibold text-black">{variation.brand}</span>
                        <span className="text-xs text-gray-400">•</span>
                        <span className="text-sm text-gray-700">{variation.thickness}</span>
                        <span className="text-xs text-gray-400">×</span>
                        <span className="text-sm text-gray-700">{variation.length}</span>
                      </div>
                      <div className="text-xs text-gray-600">
                        Stock: {variation.stock} unidades
                        {variation.price_modifier !== 0 && (
                          <span className={variation.price_modifier > 0 ? 'text-red-600 ml-2' : 'text-green-600 ml-2'}>
                            Precio: {variation.price_modifier > 0 ? '+' : ''}{variation.price_modifier.toLocaleString('es-CL')} CLP
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleEditVariation(index)}
                        className="px-3 py-1 bg-blue-100 text-blue-700 text-sm hover:bg-blue-200 rounded"
                      >
                        Editar
                      </button>
                      <button
                        onClick={() => handleRemoveVariation(index)}
                        className="px-3 py-1 bg-red-100 text-red-700 text-sm hover:bg-red-200 rounded"
                      >
                        Eliminar
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500 text-sm">
              No hay variaciones configuradas. Añade una usando el formulario de arriba.
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-200 flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 border border-gray-300 text-black text-sm font-medium hover:bg-gray-50 rounded"
          >
            Cancelar
          </button>
          <button
            onClick={handleSave}
            disabled={isSaving}
            className="px-4 py-2 bg-black text-white text-sm font-medium hover:bg-gray-800 rounded disabled:opacity-50"
          >
            {isSaving ? 'Guardando...' : 'Guardar Cambios'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default VariationsModal;

