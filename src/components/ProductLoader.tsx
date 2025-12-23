import { useState, useEffect } from 'react';
import { getAllProducts } from '../data/products';
import type { Product } from '../data/products';
import ProductCard from './ProductCard';

interface ProductLoaderProps {
  initialProducts?: Product[];
  category?: string | null;
  featuredOnly?: boolean;
}

const ProductLoader = ({ initialProducts = [], category = null, featuredOnly = false }: ProductLoaderProps) => {
  const [products, setProducts] = useState<Product[]>(initialProducts);
  const [loading, setLoading] = useState(initialProducts.length === 0);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    console.log('═══════════════════════════════════════════════════════════');
    console.log('[PRODUCT-LOADER] 🚀 Component mounted');
    console.log('[PRODUCT-LOADER] Props:', { 
      initialProductsCount: initialProducts.length, 
      category,
      featuredOnly,
      initialProducts: initialProducts.map(p => ({ id: p.id, name: p.name }))
    });
    console.log('═══════════════════════════════════════════════════════════');

    // Siempre intentar cargar productos en el cliente para asegurar que estén actualizados
    const loadProducts = async () => {
      try {
        console.log('[PRODUCT-LOADER] 📡 Starting to load products from API...');
        setLoading(true);
        setError(null);

        console.log('[PRODUCT-LOADER] 📞 Calling getAllProducts()...');
        const startTime = Date.now();
        let allProducts = await getAllProducts();
        const loadTime = Date.now() - startTime;
        
        console.log(`[PRODUCT-LOADER] ⏱️ API call completed in ${loadTime}ms`);
        console.log(`[PRODUCT-LOADER] 📦 Raw products from API: ${allProducts.length}`);
        
        if (allProducts.length > 0) {
          console.log('[PRODUCT-LOADER] 📋 First 3 products:', allProducts.slice(0, 3).map(p => ({
            id: p.id,
            name: p.name,
            featured: p.is_featured,
            category: p.category
          })));
        } else {
          console.warn('[PRODUCT-LOADER] ⚠️ WARNING: No products returned from API!');
        }
        
        // Filtrar por categoría si se especifica
        if (category) {
          const beforeFilter = allProducts.length;
          allProducts = allProducts.filter(p => p.category === category);
          console.log(`[PRODUCT-LOADER] 🔍 Filtered by category "${category}": ${beforeFilter} → ${allProducts.length}`);
        }

        // Filtrar solo productos destacados si featuredOnly está activado
        if (featuredOnly) {
          const beforeFilter = allProducts.length;
          allProducts = allProducts.filter(p => p.is_featured);
          console.log(`[PRODUCT-LOADER] ⭐ Filtered featured products: ${beforeFilter} → ${allProducts.length}`);
          
          if (allProducts.length > 0) {
            console.log('[PRODUCT-LOADER] ⭐ Featured products:', allProducts.map(p => ({
              id: p.id,
              name: p.name
            })));
          }
        }

        console.log(`[PRODUCT-LOADER] ✅ Successfully loaded ${allProducts.length} products`);
        console.log('[PRODUCT-LOADER] 📊 Final products:', allProducts.map(p => ({
          id: p.id,
          name: p.name,
          price: p.price,
          stock: p.stock
        })));
        
        setProducts(allProducts);
        setLoading(false);
        
        console.log('[PRODUCT-LOADER] ✅ State updated, component will re-render');
      } catch (err: any) {
        console.error('═══════════════════════════════════════════════════════════');
        console.error('[PRODUCT-LOADER] ❌ ERROR loading products');
        console.error('[PRODUCT-LOADER] Error type:', err?.constructor?.name || 'Unknown');
        console.error('[PRODUCT-LOADER] Error message:', err?.message);
        console.error('[PRODUCT-LOADER] Error stack:', err?.stack);
        console.error('[PRODUCT-LOADER] Full error object:', err);
        console.error('═══════════════════════════════════════════════════════════');
        
        setError('Error al cargar productos. Por favor, recarga la página.');
        setLoading(false);
        
        // Si hay productos iniciales, mantenerlos como fallback
        if (initialProducts.length > 0) {
          console.log(`[PRODUCT-LOADER] 🔄 Using ${initialProducts.length} initial products as fallback`);
          setProducts(initialProducts);
        } else {
          console.warn('[PRODUCT-LOADER] ⚠️ No initial products available as fallback');
        }
      }
    };

    // Si no hay productos iniciales, cargar inmediatamente
    // Si hay productos iniciales, también cargar para actualizar
    console.log('[PRODUCT-LOADER] 🎯 Starting product load process...');
    loadProducts();
  }, [category, featuredOnly]);

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

  if (products.length === 0) {
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
    <div className="grid grid-cols-1 gap-12 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {products.map((product) => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  );
};

export default ProductLoader;

