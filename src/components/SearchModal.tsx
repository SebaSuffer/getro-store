import { useState, useEffect, useRef } from 'react';
import { getAllProducts } from '../data/products';
import type { Product } from '../data/products';

interface SearchModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const SearchModal = ({ isOpen, onClose }: SearchModalProps) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [results, setResults] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) {
      setSearchQuery('');
      setResults([]);
    }
  }, [isOpen]);

  useEffect(() => {
    if (!searchQuery.trim()) {
      setResults([]);
      return;
    }

    setIsLoading(true);
    
    // Simular un pequeño delay para mejor UX
    const timeoutId = setTimeout(() => {
      const allProducts = getAllProducts();
      const query = searchQuery.toLowerCase().trim();
      
      const filtered = allProducts.filter((product) => {
        const nameMatch = product.name.toLowerCase().includes(query);
        const descMatch = product.description?.toLowerCase().includes(query);
        const categoryMatch = product.category.toLowerCase().includes(query);
        
        return nameMatch || descMatch || categoryMatch;
      });
      
      setResults(filtered);
      setIsLoading(false);
    }, 150);

    return () => clearTimeout(timeoutId);
  }, [searchQuery]);

  const handleResultClick = (product: Product) => {
    window.location.href = `/producto/${product.id}`;
    onClose();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 z-50 flex items-start justify-center bg-black/60 backdrop-blur-sm pt-20 px-4"
      onClick={onClose}
      onKeyDown={handleKeyDown}
    >
      <div 
        className="w-full max-w-2xl bg-white shadow-lg"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Search Input */}
        <div className="relative border-b border-black/10">
          <div className="flex items-center px-6 py-4">
            <span className="material-symbols-outlined text-black/60 mr-3" style={{ fontSize: '24px', fontWeight: 300 }}>
              search
            </span>
            <input
              ref={inputRef}
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Buscar productos..."
              className="flex-1 bg-transparent text-black text-sm font-normal focus:outline-none placeholder:text-black/40"
              onKeyDown={handleKeyDown}
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="ml-3 text-black/40 hover:text-black/60 transition-colors"
                aria-label="Limpiar búsqueda"
              >
                <span className="material-symbols-outlined" style={{ fontSize: '20px', fontWeight: 300 }}>
                  close
                </span>
              </button>
            )}
            <button
              onClick={onClose}
              className="ml-4 text-black/60 hover:text-black transition-colors"
              aria-label="Cerrar búsqueda"
            >
              <span className="material-symbols-outlined" style={{ fontSize: '20px', fontWeight: 300 }}>
                close
              </span>
            </button>
          </div>
        </div>

        {/* Results */}
        <div className="max-h-[60vh] overflow-y-auto">
          {isLoading ? (
            <div className="px-6 py-12 text-center">
              <p className="text-sm text-black/60 font-normal">Buscando...</p>
            </div>
          ) : searchQuery.trim() && results.length === 0 ? (
            <div className="px-6 py-12 text-center">
              <p className="text-sm text-black/60 font-normal mb-2">No se encontraron productos</p>
              <p className="text-xs text-black/40 font-normal">Intenta con otros términos de búsqueda</p>
            </div>
          ) : searchQuery.trim() && results.length > 0 ? (
            <div className="py-2">
              <div className="px-6 py-2 text-xs font-normal uppercase tracking-[0.2em] text-black/60">
                {results.length} resultado{results.length !== 1 ? 's' : ''} encontrado{results.length !== 1 ? 's' : ''}
              </div>
              {results.map((product) => (
                <button
                  key={product.id}
                  onClick={() => handleResultClick(product)}
                  className="w-full px-6 py-4 flex items-center gap-4 hover:bg-black/5 transition-colors text-left border-b border-black/5 last:border-b-0"
                >
                  <div className="flex-shrink-0 w-16 h-16 overflow-hidden bg-gray-50 border border-black/5">
                    <img
                      src={product.image_url}
                      alt={product.image_alt || product.name}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.src = 'https://via.placeholder.com/64?text=No+Image';
                      }}
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-normal uppercase tracking-[0.1em] text-black/50 mb-1">
                      {product.category}
                    </p>
                    <h3 className="text-sm font-medium text-black uppercase tracking-wide mb-1 truncate">
                      {product.name}
                    </h3>
                    <p className="text-xs font-normal text-black/60">
                      ${product.price.toLocaleString('es-CL')} CLP
                    </p>
                  </div>
                  <span className="material-symbols-outlined text-black/40 flex-shrink-0" style={{ fontSize: '20px', fontWeight: 300 }}>
                    chevron_right
                  </span>
                </button>
              ))}
            </div>
          ) : (
            <div className="px-6 py-12 text-center">
              <p className="text-sm text-black/60 font-normal">Escribe para buscar productos</p>
            </div>
          )}
        </div>

        {/* Footer */}
        {searchQuery.trim() && results.length > 0 && (
          <div className="border-t border-black/10 px-6 py-3">
            <a
              href={`/catalogo?busqueda=${encodeURIComponent(searchQuery)}`}
              className="text-xs font-normal uppercase tracking-[0.2em] text-black/60 hover:text-black transition-colors inline-flex items-center gap-2"
              onClick={onClose}
            >
              Ver todos los resultados
              <span className="material-symbols-outlined" style={{ fontSize: '16px', fontWeight: 300 }}>
                arrow_forward
              </span>
            </a>
          </div>
        )}
      </div>
    </div>
  );
};

export default SearchModal;




