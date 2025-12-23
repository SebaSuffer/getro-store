import { useEffect, useState } from 'react';
import { getCategories, getProductsByCategory } from '../data/products';

interface CategoryFiltersProps {
  currentCategory: string | null;
}

// Todas las categorías posibles - Colgantes primero porque es la que tiene productos
const ALL_CATEGORIES = ['Colgantes', 'Cadenas', 'Pulseras', 'Anillos', 'Esclavas', 'Aros'];

const CategoryFilters = ({ currentCategory: initialCategory }: CategoryFiltersProps) => {
  const [availableCategories, setAvailableCategories] = useState<string[]>([]);
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [categoryProductCounts, setCategoryProductCounts] = useState<Record<string, number>>({});

  // Función para leer la categoría de la URL
  const getCategoryFromURL = (): string | null => {
    if (typeof window === 'undefined') return null;
    const params = new URLSearchParams(window.location.search);
    const cat = params.get('categoria');
    return cat ? decodeURIComponent(cat).trim() : null;
  };

  useEffect(() => {
    // Cargar categorías disponibles de forma async
    const loadCategories = async () => {
      try {
        const cats = await getCategories();
        setAvailableCategories(cats);
        console.log('[CATEGORY-FILTERS] Available categories:', cats);
      } catch (error) {
        console.error('[CATEGORY-FILTERS] Error loading categories:', error);
      }
    };
    
    loadCategories();
    
    // Leer categoría de la URL al montar
    const urlCategory = getCategoryFromURL();
    setActiveCategory(urlCategory || initialCategory);
  }, [initialCategory]);

  // Actualizar cuando cambie la URL (después de navegación)
  useEffect(() => {
    const checkURL = () => {
      const urlCategory = getCategoryFromURL();
      setActiveCategory(urlCategory);
    };
    
    // Verificar inmediatamente
    checkURL();
    
    // Verificar periódicamente (para cuando se recarga la página)
    const interval = setInterval(checkURL, 100);
    
    return () => clearInterval(interval);
  }, []);

  const handleFilterClick = async (category: string | null, e?: React.MouseEvent) => {
    if (e) {
      e.preventDefault();
    }
    
    if (category) {
      // Verificar si la categoría tiene productos (async)
      try {
        const products = await getProductsByCategory(category);
        if (products.length === 0) {
          return; // No hacer nada si no hay productos
        }
        
        // Actualizar estado inmediatamente para feedback visual
        setActiveCategory(category);
        
        // Actualizar URL sin recargar la página
        const newUrl = `/catalogo?categoria=${encodeURIComponent(category)}`;
        window.history.pushState({ category }, '', newUrl);
        
        // Disparar evento personalizado para que ProductLoader se actualice
        window.dispatchEvent(new CustomEvent('categoryChanged', {
          detail: { category },
          bubbles: true
        }));
        
        console.log('[CATEGORY-FILTERS] ✅ Category changed to:', category);
      } catch (error) {
        console.error('[CATEGORY-FILTERS] Error checking products:', error);
      }
    } else {
      setActiveCategory(null);
      
      // Actualizar URL sin recargar
      window.history.pushState({ category: null }, '', '/catalogo');
      
      // Disparar evento para limpiar filtro
      window.dispatchEvent(new CustomEvent('categoryChanged', {
        detail: { category: null },
        bubbles: true
      }));
      
      console.log('[CATEGORY-FILTERS] ✅ Category cleared');
    }
  };

  // Cargar conteo de productos por categoría
  useEffect(() => {
    const loadProductCounts = async () => {
      const counts: Record<string, number> = {};
      for (const cat of ALL_CATEGORIES) {
        try {
          const products = await getProductsByCategory(cat);
          counts[cat] = products.length;
        } catch (error) {
          counts[cat] = 0;
        }
      }
      setCategoryProductCounts(counts);
      console.log('[CATEGORY-FILTERS] Product counts:', counts);
    };
    
    loadProductCounts();
  }, []);

  const hasProducts = (category: string): boolean => {
    // Usar el conteo cacheado si está disponible
    return (categoryProductCounts[category] || 0) > 0;
  };

  const isActive = (category: string | null): boolean => {
    if (category === null) {
      return !activeCategory || activeCategory === null || activeCategory === '';
    }
    // Comparación exacta (case-sensitive)
    return activeCategory === category;
  };

  return (
    <div className="mb-12 flex flex-wrap gap-3">
      <button
        onClick={(e) => handleFilterClick(null, e)}
        className={`px-6 py-2.5 text-xs font-light uppercase tracking-[0.2em] transition-all ${
          isActive(null)
            ? 'bg-black text-white'
            : 'bg-white border border-black/20 text-black hover:border-black/40'
        }`}
      >
        Todas
      </button>
      {ALL_CATEGORIES.map((cat) => {
        const isAvailable = hasProducts(cat);
        const active = isActive(cat);
        
        // Solo mostrar "Próximamente" si realmente no hay productos
        const showProximamente = !isAvailable;
        
        return (
          <button
            key={cat}
            onClick={(e) => handleFilterClick(cat, e)}
            disabled={!isAvailable}
            className={`px-6 py-2.5 text-xs font-light uppercase tracking-[0.2em] transition-all ${
              showProximamente
                ? 'flex flex-col items-center gap-1 bg-white/50 border border-black/10 text-black/40 cursor-not-allowed opacity-60'
                : active
                ? 'bg-black text-white'
                : 'bg-white border border-black/20 text-black hover:border-black/40'
            }`}
            title={showProximamente ? 'Próximamente' : ''}
          >
            <span>{cat}</span>
            {showProximamente && (
              <span className="text-[9px] text-black/50 font-light normal-case tracking-normal">
                Próximamente
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
};

export default CategoryFilters;
