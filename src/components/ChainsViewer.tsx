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

const ChainsViewer = () => {
  const [chains, setChains] = useState<Chain[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedChain, setSelectedChain] = useState<Chain | null>(null);

  useEffect(() => {
    loadChains();
  }, []);

  const loadChains = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch('/api/chains/manage');
      if (!response.ok) {
        throw new Error('Error al cargar las cadenas');
      }
      
      const data = await response.json();
      // Filtrar solo cadenas activas y validar URLs de imagen
      const activeChains = (data || []).filter((chain: Chain) => chain.is_active !== false).map((chain: Chain) => {
        const imageUrl = chain.image_url?.trim() || '';
        // Validar que la URL sea válida (empiece con http:// o https:// y tenga al menos 20 caracteres)
        const isValidUrl = imageUrl && 
          (imageUrl.startsWith('http://') || imageUrl.startsWith('https://')) &&
          imageUrl.length > 20;
        
        return {
          ...chain,
          image_url: isValidUrl ? imageUrl : null,
        };
      });
      setChains(activeChains);
    } catch (err: any) {
      console.error('Error loading chains:', err);
      setError(err.message || 'Error al cargar las cadenas');
    } finally {
      setLoading(false);
    }
  };

  const handleChainClick = (chain: Chain) => {
    setSelectedChain(chain);
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

  if (chains.length === 0 && !loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <p className="text-sm text-black/60 font-light">No hay cadenas disponibles</p>
      </div>
    );
  }

  return (
    <div className="w-full">
      {/* Grid de cadenas similar al catálogo */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {chains.map((chain) => (
          <div
            key={chain.id}
            className="group relative flex flex-col overflow-hidden bg-white cursor-pointer"
            onClick={() => handleChainClick(chain)}
          >
            {/* Imagen clickeable */}
            <div className="relative aspect-square overflow-hidden bg-gray-50">
              {chain.image_url ? (
                <img
                  alt={chain.image_alt || chain.brand}
                  className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                  src={chain.image_url}
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
              ) : (
                <div className="h-full w-full flex items-center justify-center bg-gray-100 border border-gray-200">
                  <span className="text-sm text-gray-400 font-normal">Sin imagen</span>
                </div>
              )}
              {chain.stock <= 0 && (
                <div className="absolute inset-0 bg-black/70 flex items-center justify-center">
                  <span className="text-white font-normal uppercase tracking-[0.2em] text-sm">Agotado</span>
                </div>
              )}
            </div>
            
            {/* Información de la cadena - Solo nombre */}
            <div className="flex flex-1 flex-col p-6 bg-white">
              <h3 
                className="text-lg font-medium text-black uppercase tracking-[0.05em] leading-tight font-display cursor-pointer hover:text-black/70 transition-colors text-center"
                onClick={() => handleChainClick(chain)}
              >
                {chain.brand}
              </h3>
            </div>
          </div>
        ))}
      </div>

      {/* Modal de detalles de cadena seleccionada - Diseño grande con foto a la izquierda */}
      {selectedChain && (
        <div 
          className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4" 
          onClick={() => setSelectedChain(null)}
        >
          <div
            className="bg-white max-w-6xl w-full max-h-[95vh] overflow-hidden flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header con botón cerrar */}
            <div className="flex items-center justify-between px-8 py-6 border-b border-black/10">
              <h2 className="text-3xl font-light uppercase tracking-wider text-black font-display">
                {selectedChain.brand}
              </h2>
              <button
                onClick={() => setSelectedChain(null)}
                className="text-black/60 hover:text-black transition-colors"
                aria-label="Cerrar"
              >
                <span className="material-symbols-outlined" style={{ fontSize: '28px', fontWeight: 300 }}>
                  close
                </span>
              </button>
            </div>

            {/* Contenido principal: Foto a la izquierda, detalles a la derecha */}
            <div className="flex-1 overflow-y-auto">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-0">
                {/* Columna izquierda: Imagen */}
                <div className="bg-gray-50 flex items-center justify-center min-h-[500px] lg:min-h-[600px]">
                  {selectedChain.image_url ? (
                    <img
                      src={selectedChain.image_url}
                      alt={selectedChain.image_alt || selectedChain.name}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.style.display = 'none';
                        const parent = target.parentElement;
                        if (parent && !parent.querySelector('.no-image-placeholder')) {
                          const placeholder = document.createElement('div');
                          placeholder.className = 'h-full w-full flex items-center justify-center bg-gray-100 border border-gray-200 no-image-placeholder';
                          placeholder.innerHTML = '<span class="text-base text-gray-400 font-normal">Sin imagen</span>';
                          parent.appendChild(placeholder);
                        }
                      }}
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gray-100">
                      <span className="text-base text-gray-400 font-normal">Sin imagen</span>
                    </div>
                  )}
                </div>

                {/* Columna derecha: Detalles */}
                <div className="p-8 lg:p-12 flex flex-col">
                  {/* Nombre */}
                  <div className="mb-8">
                    <h3 className="text-sm font-light uppercase tracking-wider text-black/60 mb-3 font-sans">
                      Nombre
                    </h3>
                    <p className="text-2xl font-light text-black font-sans">
                      {selectedChain.name || selectedChain.brand}
                    </p>
                  </div>

                  {/* Descripción */}
                  {selectedChain.description && (
                    <div className="mb-8 border-t border-black/10 pt-8">
                      <h3 className="text-sm font-light uppercase tracking-wider text-black/60 mb-4 font-sans">
                        Descripción
                      </h3>
                      <p className="text-base font-normal text-black/80 leading-relaxed font-sans">
                        {selectedChain.description}
                      </p>
                    </div>
                  )}

                  {/* Cuidados y Mantenimiento */}
                  <div className="mb-8 border-t border-black/10 pt-8">
                    <h3 className="text-lg font-semibold text-black mb-4 font-sans">Cuidados y Mantenimiento</h3>
                    <div className="text-base font-normal text-black/80 leading-relaxed font-sans whitespace-pre-line">
                      {`Para mantener el brillo y la belleza de tu cadena de plata 925, te recomendamos seguir estos cuidados esenciales:

Almacenamiento: Guarda cada pieza por separado en un lugar seco y hermético. Esto evitará rayones y prevendrá la oxidación, manteniendo tu joya como nueva por más tiempo.

Protección: Evita el contacto directo con productos de limpieza, químicos, cosméticos, perfumes y agua clorada. Estos elementos pueden dañar el acabado y afectar el brillo natural de la plata.

Orden de uso: Ponte tus joyas siempre al final de tu rutina diaria, después de haber aplicado cremas, lociones o maquillaje. Esto minimiza el contacto con productos que puedan afectar su apariencia.

Limpieza: Para mantener el brillo, limpia periódicamente con un paño suave y seco. Si es necesario, puedes usar un paño especial para plata o una solución suave de agua tibia con jabón neutro, secando inmediatamente después.`}
                    </div>
                  </div>

                  {/* Información adicional */}
                  <div className="mt-auto border-t border-black/10 pt-8">
                    <div className="space-y-4">
                      <div>
                        <h4 className="text-sm font-semibold text-black mb-2 font-sans">Material</h4>
                        <p className="text-base font-normal text-black/80 font-sans">Plata Sólida 925</p>
                      </div>
                      <div>
                        <h4 className="text-sm font-semibold text-black mb-2 font-sans">Pureza</h4>
                        <p className="text-base font-normal text-black/80 font-sans">925/1000</p>
                      </div>
                      <div>
                        <h4 className="text-sm font-semibold text-black mb-2 font-sans">Garantía</h4>
                        <p className="text-base font-normal text-black/80 font-sans">2 años</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ChainsViewer;

