import { useState, useEffect } from 'react';
import VariationsModal from './VariationsModal';

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


const ChainVariationsManager = ({ productId, onVariationsChange }: ChainVariationsManagerProps) => {
  const [variations, setVariations] = useState<ChainVariation[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
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

  const handleSaveVariations = async (updatedVariations: ChainVariation[]) => {
    setVariations(updatedVariations);
    onVariationsChange?.(updatedVariations);
    await saveVariations(updatedVariations);
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

  return (
    <div className="space-y-4">
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
        <div className="mb-3">
          <h3 className="text-sm font-semibold text-black mb-1">Variaciones de Cadena</h3>
          <p className="text-xs text-gray-600 flex items-center gap-2">
            {variations.length > 0 
              ? `${variations.length} variación${variations.length !== 1 ? 'es' : ''} configurada${variations.length !== 1 ? 's' : ''}`
              : 'No hay variaciones configuradas'}
            {variations.length > 0 && (
              <span className="px-2 py-0.5 bg-green-100 text-green-800 rounded text-[11px] font-normal">
                Guardado
              </span>
            )}
          </p>
        </div>
        <div className="flex justify-end">
          <button
            onClick={() => setIsModalOpen(true)}
            className="px-4 py-2 bg-black text-white text-sm font-medium hover:bg-gray-800 rounded"
          >
            {variations.length > 0 ? 'Ver / Editar' : 'Añadir Variaciones'}
          </button>
        </div>

        {variations.length > 0 && (
          <div className="mt-3 space-y-2">
            {variations.slice(0, 3).map((variation, index) => (
              <div key={index} className="text-xs text-gray-700 bg-white p-2 rounded border border-gray-200">
                <span className="font-medium">{variation.brand}</span> • {variation.thickness} × {variation.length} 
                {' '}(Stock: {variation.stock})
              </div>
            ))}
            {variations.length > 3 && (
              <p className="text-xs text-gray-500">+ {variations.length - 3} más...</p>
            )}
          </div>
        )}
      </div>

      <VariationsModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        variations={variations}
        onSave={handleSaveVariations}
        productId={productId}
      />
    </div>
  );
};

export default ChainVariationsManager;

