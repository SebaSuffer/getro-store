import { useState, useEffect } from 'react';
import { getAllProducts } from '../data/products';
import type { Product } from '../data/products';
import ProductCard from './ProductCard';

interface ProductLoaderProps {
  initialProducts?: Product[];
  category?: string | null;
}

const ProductLoader = ({ initialProducts = [], category = null }: ProductLoaderProps) => {
  const [products, setProducts] = useState<Product[]>(initialProducts);
  const [loading, setLoading] = useState(initialProducts.length === 0);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Si ya hay productos iniciales, no recargar
    if (initialProducts.length > 0) {
      setLoading(false);
      return;
    }

    // Cargar productos desde la API en el cliente
    const loadProducts = async () => {
      try {
        console.log('[PRODUCT-LOADER] Loading products from API...');
        setLoading(true);
        setError(null);

        let allProducts = await getAllProducts();
        
        // Filtrar por categoría si se especifica
        if (category) {
          allProducts = allProducts.filter(p => p.category === category);
        }

        console.log(`[PRODUCT-LOADER] ✅ Loaded ${allProducts.length} products`);
        setProducts(allProducts);
        setLoading(false);
      } catch (err: any) {
        console.error('[PRODUCT-LOADER] ❌ Error loading products:', err);
        setError('Error al cargar productos. Por favor, recarga la página.');
        setLoading(false);
      }
    };

    loadProducts();
  }, [category, initialProducts.length]);

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

