import { useState, useEffect } from 'react';
import { getAllProducts } from '../data/products';
import type { Product } from '../data/products';
import ProductCard from './ProductCard';
import Pagination from './Pagination';

interface ProductLoaderProps {
  initialProducts?: Product[];
  category?: string | null;
  featuredOnly?: boolean;
}

const PRODUCTS_PER_PAGE = 12;

const ProductLoader = ({ initialProducts = [], category = null, featuredOnly = false }: ProductLoaderProps) => {
  const [allProducts, setAllProducts] = useState<Product[]>(initialProducts);
  const [loading, setLoading] = useState(initialProducts.length === 0);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);

  // Cargar productos
  useEffect(() => {
    const loadProducts = async () => {
      try {
        console.log('[PRODUCT-LOADER] 📡 Loading products...');
        setLoading(true);
        setError(null);

        const startTime = Date.now();
        let products = await getAllProducts();
        const loadTime = Date.now() - startTime;
        
        console.log(`[PRODUCT-LOADER] ⏱️ Loaded ${products.length} products in ${loadTime}ms`);
        
        // Filtrar por categoría si se especifica
        if (category) {
          const beforeFilter = products.length;
          products = products.filter(p => p.category === category);
          console.log(`[PRODUCT-LOADER] 🔍 Filtered by category "${category}": ${beforeFilter} → ${products.length}`);
        }

        // Filtrar solo productos destacados si featuredOnly está activado
        if (featuredOnly) {
          const beforeFilter = products.length;
          products = products.filter(p => p.is_featured);
          console.log(`[PRODUCT-LOADER] ⭐ Filtered featured: ${beforeFilter} → ${products.length}`);
        }

        setAllProducts(products);
        setCurrentPage(1); // Resetear a página 1 cuando cambia el filtro
        setLoading(false);
      } catch (err: any) {
        console.error('[PRODUCT-LOADER] ❌ Error:', err);
        setError('Error al cargar productos.');
        setLoading(false);
        if (initialProducts.length > 0) {
          setAllProducts(initialProducts);
        }
      }
    };

    loadProducts();
  }, [category, featuredOnly]);

  // Escuchar cambios de categoría desde CategoryFilters (sin recargar página)
  useEffect(() => {
    const handleCategoryChange = async (event: CustomEvent) => {
      const newCategory = event.detail.category;
      console.log('[PRODUCT-LOADER] 📢 Category changed event:', newCategory);
      
      // Recargar productos con la nueva categoría
      try {
        setLoading(true);
        let products = await getAllProducts();
        
        if (newCategory) {
          products = products.filter(p => p.category === newCategory);
        }
        
        if (featuredOnly) {
          products = products.filter(p => p.is_featured);
        }
        
        setAllProducts(products);
        setCurrentPage(1); // Resetear a página 1
        setLoading(false);
      } catch (error) {
        console.error('[PRODUCT-LOADER] Error reloading products:', error);
        setLoading(false);
      }
    };

    window.addEventListener('categoryChanged', handleCategoryChange as EventListener);
    return () => {
      window.removeEventListener('categoryChanged', handleCategoryChange as EventListener);
    };
  }, [featuredOnly]);

  // Calcular productos paginados
  const totalPages = Math.ceil(allProducts.length / PRODUCTS_PER_PAGE);
  const startIndex = (currentPage - 1) * PRODUCTS_PER_PAGE;
  const endIndex = startIndex + PRODUCTS_PER_PAGE;
  const paginatedProducts = allProducts.slice(startIndex, endIndex);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    // Scroll suave hacia arriba
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  if (loading) {
    return (
      <div className="text-center py-20">
        <p className="text-lg text-black/60 font-light">Cargando productos...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-20">
        <p className="text-lg text-red-600 font-light">{error}</p>
        <button
          onClick={() => window.location.reload()}
          className="mt-4 px-6 py-2 bg-black text-white text-sm uppercase tracking-wide hover:bg-black/90"
        >
          Recargar
        </button>
      </div>
    );
  }

  if (allProducts.length === 0 && !loading) {
    return (
      <div className="text-center py-20">
        <p className="text-lg text-black/60 font-light">No hay productos disponibles en esta categoría.</p>
        <a href="/catalogo" className="mt-4 inline-block text-sm text-black/80 hover:text-black underline">
          Ver todos los productos
        </a>
      </div>
    );
  }

  return (
    <>
      <div className="grid grid-cols-1 gap-12 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {paginatedProducts.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
      
      {totalPages > 1 && (
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={handlePageChange}
        />
      )}
    </>
  );
};

export default ProductLoader;

