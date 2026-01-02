import { useState, useEffect, useRef } from 'react';
import { getCategories } from '../data/products';

// Excluir "Cadenas" ya que se muestran en sección separada (/cadenas)
const ALL_CATEGORIES = ['Colgantes', 'Pulseras', 'Anillos', 'Esclavas', 'Aros'];

const JewelryDropdown = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [availableCategories, setAvailableCategories] = useState<string[]>([]);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const loadCategories = async () => {
      try {
        const cats = await getCategories();
        setAvailableCategories(cats);
      } catch (error) {
        console.error('[JEWELRY-DROPDOWN] Error loading categories:', error);
        // Fallback a categorías predefinidas
        setAvailableCategories(ALL_CATEGORIES);
      }
    };
    
    loadCategories();
  }, []);

  // Cerrar dropdown al hacer click fuera
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const handleCategoryClick = (category: string) => {
    setIsOpen(false);
    window.location.href = `/catalogo?categoria=${encodeURIComponent(category)}`;
  };

  const handleToggle = () => {
    setIsOpen(!isOpen);
  };

  // Mostrar categorías disponibles o todas si no hay disponibles aún
  const categoriesToShow = availableCategories.length > 0 ? availableCategories : ALL_CATEGORIES;

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={handleToggle}
        onMouseEnter={() => setIsOpen(true)}
        className="text-[11px] font-light text-white/80 hover:text-white transition-colors uppercase tracking-[0.25em] flex items-center gap-1.5 group"
        aria-expanded={isOpen}
        aria-haspopup="true"
        aria-label="Joyas - Ver categorías"
      >
        <span>Joyas</span>
        <span 
          className="material-symbols-outlined text-[14px] transition-transform duration-200"
          style={{ 
            fontSize: '14px', 
            fontWeight: 300,
            transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)'
          }}
        >
          expand_more
        </span>
      </button>

      {isOpen && (
        <div 
          className="absolute top-full left-0 mt-2 bg-white border border-black/10 shadow-lg min-w-[220px] z-50"
          onMouseLeave={() => setIsOpen(false)}
        >
          <div className="py-2">
            {categoriesToShow.map((category) => (
              <a
                key={category}
                href={`/catalogo?categoria=${encodeURIComponent(category)}`}
                onClick={(e) => {
                  e.preventDefault();
                  handleCategoryClick(category);
                }}
                className="block px-6 py-3 text-[11px] font-light text-black/80 hover:text-black hover:bg-black/5 transition-all uppercase tracking-[0.2em] border-l-2 border-transparent hover:border-black/20"
              >
                {category}
              </a>
            ))}
            <div className="border-t border-black/10 my-1"></div>
            <a
              href="/catalogo"
              onClick={(e) => {
                e.preventDefault();
                setIsOpen(false);
                window.location.href = '/catalogo';
              }}
              className="block px-6 py-3 text-[11px] font-light text-black/80 hover:text-black hover:bg-black/5 transition-all uppercase tracking-[0.2em] border-l-2 border-transparent hover:border-black/20"
            >
              Ver Todo
            </a>
          </div>
        </div>
      )}
    </div>
  );
};

export default JewelryDropdown;

