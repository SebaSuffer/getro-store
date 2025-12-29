import { useEffect, useState } from 'react';

interface CatalogTitleProps {
  initialCategory: string | null;
}

const CatalogTitle = ({ initialCategory }: CatalogTitleProps) => {
  const [category, setCategory] = useState<string | null>(initialCategory);

  useEffect(() => {
    // Leer categoría de la URL
    const getCategoryFromURL = (): string | null => {
      if (typeof window === 'undefined') return null;
      const params = new URLSearchParams(window.location.search);
      const cat = params.get('categoria');
      return cat ? decodeURIComponent(cat).trim() : null;
    };

    const updateCategory = () => {
      const urlCategory = getCategoryFromURL();
      setCategory(urlCategory);
      
      // Actualizar título de la página
      if (urlCategory) {
        document.title = `${urlCategory} - GOTRA`;
      } else {
        document.title = 'Catálogo Completo - GOTRA';
      }
    };

    // Escuchar cambios de categoría
    const handleCategoryChange = (event: CustomEvent) => {
      setCategory(event.detail.category);
      updateCategory();
    };

    // Escuchar cambios en el historial del navegador
    const handlePopState = () => {
      updateCategory();
    };

    updateCategory();
    window.addEventListener('categoryChanged', handleCategoryChange as EventListener);
    window.addEventListener('popstate', handlePopState);

    return () => {
      window.removeEventListener('categoryChanged', handleCategoryChange as EventListener);
      window.removeEventListener('popstate', handlePopState);
    };
  }, []);

  return (
    <div className="mb-16">
      <span className="text-xs font-normal uppercase tracking-[0.4em] text-black/60 mb-4 block">Tienda</span>
      <h1 className="text-4xl sm:text-5xl font-medium text-black tracking-[0.05em] uppercase mb-6 font-display">
        {category ? category : 'Catálogo Completo'}
      </h1>
      <p className="text-black/70 font-normal text-sm tracking-wide max-w-2xl">
        Explora nuestra colección completa de joyería fina
      </p>
    </div>
  );
};

export default CatalogTitle;




