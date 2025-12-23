export interface Product {
  id: string;
  name: string;
  description?: string;
  price: number;
  stock: number;
  image_url: string;
  image_alt: string;
  category: string;
  is_new: boolean;
  is_featured: boolean;
}

export interface CartItem {
  product: Product;
  quantity: number;
}

// Productos con imágenes reales de la carpeta images/
export const initialProducts: Product[] = [
  {
    id: '550e8400-e29b-41d4-a716-446655440001',
    name: 'Colgante Ala de Plata',
    description: 'Colgante elegante de plata sólida 925 con diseño de ala estilizada',
    price: 45990,
    stock: 15,
    image_url: 'https://res.cloudinary.com/ddzoh72zv/image/upload/f_auto,q_auto/v1766458847/DSC05016_dwuz7c.jpg',
    image_alt: 'Colgante Ala de Plata',
    category: 'Colgantes',
    is_new: true,
    is_featured: true,
  },
  {
    id: '550e8400-e29b-41d4-a716-446655440002',
    name: 'Colgante Corona de Plata',
    description: 'Colgante de plata sólida 925 con diseño de corona elegante',
    price: 35990,
    stock: 12,
    image_url: 'https://res.cloudinary.com/ddzoh72zv/image/upload/f_auto,q_auto/v1766458847/DSC05015_kiamyb.jpg',
    image_alt: 'Colgante Corona de Plata',
    category: 'Colgantes',
    is_new: false,
    is_featured: true,
  },
  {
    id: '550e8400-e29b-41d4-a716-446655440003',
    name: 'Colgante Cruz de Plata - Estilo Clásico',
    description: 'Colgante de plata sólida 925 con diseño de cruz clásica y elegante, perfecto para uso diario',
    price: 28990,
    stock: 20,
    image_url: 'https://res.cloudinary.com/ddzoh72zv/image/upload/f_auto,q_auto/v1766458847/DSC05014_tpyofl.jpg',
    image_alt: 'Colgante Cruz de Plata - Estilo Clásico',
    category: 'Colgantes',
    is_new: true,
    is_featured: true,
  },
  {
    id: '550e8400-e29b-41d4-a716-446655440004',
    name: 'Colgante Cuadrado con Círculo de Plata',
    description: 'Colgante de plata sólida 925 con diseño geométrico cuadrado y círculo central',
    price: 52990,
    stock: 8,
    image_url: 'https://res.cloudinary.com/ddzoh72zv/image/upload/f_auto,q_auto/v1766458846/DSC05013_ls4kjv.jpg',
    image_alt: 'Colgante Cuadrado con Círculo de Plata',
    category: 'Colgantes',
    is_new: false,
    is_featured: true,
  },
  {
    id: '550e8400-e29b-41d4-a716-446655440005',
    name: 'Colgante Ancla de Plata',
    description: 'Colgante de plata sólida 925 con diseño de ancla náutica, símbolo de estabilidad y esperanza',
    price: 37990,
    stock: 10,
    image_url: 'https://res.cloudinary.com/ddzoh72zv/image/upload/f_auto,q_auto/v1766458846/DSC05012_bbchhj.jpg',
    image_alt: 'Colgante Ancla de Plata',
    category: 'Colgantes',
    is_new: false,
    is_featured: false,
  },
  {
    id: '550e8400-e29b-41d4-a716-446655440006',
    name: 'Colgante Cruz Estilizada de Plata',
    description: 'Colgante de plata sólida 925 con diseño de cruz estilizada y efecto contrastante',
    price: 32990,
    stock: 15,
    image_url: 'https://res.cloudinary.com/ddzoh72zv/image/upload/f_auto,q_auto/v1766458846/DSC05010_zfxyxv.jpg',
    image_alt: 'Colgante Cruz Estilizada de Plata',
    category: 'Colgantes',
    is_new: true,
    is_featured: false,
  },
  {
    id: '550e8400-e29b-41d4-a716-446655440007',
    name: 'Colgante Cruz de Plata - Clásico',
    description: 'Colgante de plata sólida 925 con diseño de cruz clásica y elegante',
    price: 39990,
    stock: 18,
    image_url: 'https://res.cloudinary.com/ddzoh72zv/image/upload/f_auto,q_auto/v1766458846/DSC05008_clyhgx.jpg',
    image_alt: 'Colgante Cruz de Plata - Clásico',
    category: 'Colgantes',
    is_new: true,
    is_featured: false,
  },
  {
    id: '550e8400-e29b-41d4-a716-446655440008',
    name: 'Colgante Diamante de Plata',
    description: 'Colgante de plata sólida 925 con diseño de diamante facetado',
    price: 33990,
    stock: 22,
    image_url: 'https://res.cloudinary.com/ddzoh72zv/image/upload/f_auto,q_auto/v1766458845/DSC05007_pbianr.jpg',
    image_alt: 'Colgante Diamante de Plata',
    category: 'Colgantes',
    is_new: false,
    is_featured: false,
  },
  {
    id: '550e8400-e29b-41d4-a716-446655440009',
    name: 'Colgante Diamante de Plata - Estilo Moderno',
    description: 'Colgante de plata sólida 925 con diseño de diamante facetado en estilo moderno y brillante',
    price: 27990,
    stock: 16,
    image_url: 'https://res.cloudinary.com/ddzoh72zv/image/upload/f_auto,q_auto/v1766458845/DSC05006_r56buj.jpg',
    image_alt: 'Colgante Diamante de Plata - Estilo Moderno',
    category: 'Colgantes',
    is_new: false,
    is_featured: false,
  },
  {
    id: '550e8400-e29b-41d4-a716-446655440010',
    name: 'Colgante Árbol de la Vida de Plata',
    description: 'Colgante de plata sólida 925 con diseño del árbol de la vida, símbolo de crecimiento y conexión',
    price: 42990,
    stock: 14,
    image_url: 'https://res.cloudinary.com/ddzoh72zv/image/upload/f_auto,q_auto/v1766458845/DSC05005_vz2ss2.jpg',
    image_alt: 'Colgante Árbol de la Vida de Plata',
    category: 'Colgantes',
    is_new: false,
    is_featured: false,
  },
  {
    id: '550e8400-e29b-41d4-a716-446655440011',
    name: 'Colgante Cruz de Plata - Estilo Contemporáneo',
    description: 'Colgante de plata sólida 925 con diseño de cruz contemporánea y líneas estilizadas',
    price: 44990,
    stock: 11,
    image_url: 'https://res.cloudinary.com/ddzoh72zv/image/upload/f_auto,q_auto/v1766458845/DSC05004_awkvea.jpg',
    image_alt: 'Colgante Cruz de Plata - Estilo Contemporáneo',
    category: 'Colgantes',
    is_new: true,
    is_featured: false,
  },
  {
    id: '550e8400-e29b-41d4-a716-446655440012',
    name: 'Colgante Corazón de Plata',
    description: 'Colgante de plata sólida 925 con diseño de corazón elegante, perfecto como regalo de amor',
    price: 31990,
    stock: 13,
    image_url: 'https://res.cloudinary.com/ddzoh72zv/image/upload/f_auto,q_auto/v1766458845/DSC05003_n0s54y.jpg',
    image_alt: 'Colgante Corazón de Plata',
    category: 'Colgantes',
    is_new: false,
    is_featured: false,
  },
];

// Obtener todos los productos (incluyendo productos editados desde localStorage, excluyendo eliminados)
export const getAllProducts = (): Product[] => {
  if (typeof window === 'undefined') {
    return initialProducts;
  }
  
  // Cargar productos editados y eliminados desde localStorage
  const editedProducts = JSON.parse(localStorage.getItem('gotra_edited_products') || '{}');
  const deletedProducts = JSON.parse(localStorage.getItem('gotra_deleted_products') || '[]');
  
  // Filtrar productos eliminados y combinar con productos editados
  return initialProducts
    .filter(product => !deletedProducts.includes(product.id))
    .map(product => {
      const edited = editedProducts[product.id];
      if (edited) {
        return {
          ...product,
          ...edited,
          // Asegurar que image_url editada se use si existe
          image_url: edited.image_url || product.image_url,
          image_alt: edited.image_alt || edited.name || product.image_alt,
        };
      }
      return product;
    });
};

// Obtener productos destacados (excluyendo eliminados)
export const getFeaturedProducts = (): Product[] => {
  const allProducts = getAllProducts();
  return allProducts.filter(p => p.is_featured).slice(0, 4);
};

// Obtener productos por categoría (excluyendo eliminados)
export const getProductsByCategory = (category: string): Product[] => {
  const allProducts = getAllProducts();
  return allProducts.filter(p => p.category === category);
};

// Obtener categorías únicas
export const getCategories = (): string[] => {
  return Array.from(new Set(initialProducts.map(p => p.category)));
};

// Obtener producto por ID (incluyendo productos editados desde localStorage, excluyendo eliminados)
export const getProductById = (id: string): Product | null => {
  const product = initialProducts.find(p => p.id === id);
  if (!product) return null;
  
  if (typeof window === 'undefined') {
    return product;
  }
  
  // Verificar si el producto fue eliminado
  const deletedProducts = JSON.parse(localStorage.getItem('gotra_deleted_products') || '[]');
  if (deletedProducts.includes(id)) {
    return null;
  }
  
  // Cargar producto editado desde localStorage si existe
  const editedProducts = JSON.parse(localStorage.getItem('gotra_edited_products') || '{}');
  const edited = editedProducts[id];
  
  if (edited) {
    return {
      ...product,
      ...edited,
      // Asegurar que image_url editada se use si existe
      image_url: edited.image_url || product.image_url,
      image_alt: edited.image_alt || edited.name || product.image_alt,
    };
  }
  
  return product;
};

// Obtener productos relacionados
export const getRelatedProducts = (productId: string, limit: number = 4): Product[] => {
  const currentProduct = getProductById(productId);
  if (!currentProduct) return [];

  // Primero, obtener productos de la misma categoría (excluyendo el actual)
  const sameCategory = initialProducts.filter(
    p => p.category === currentProduct.category && p.id !== productId
  );

  // Si hay suficientes productos de la misma categoría, devolverlos
  if (sameCategory.length >= limit) {
    return sameCategory.slice(0, limit);
  }

  // Si no hay suficientes, completar con productos destacados
  const featured = initialProducts.filter(
    p => p.is_featured && p.id !== productId && !sameCategory.some(sp => sp.id === p.id)
  );

  // Combinar y limitar
  const related = [...sameCategory, ...featured].slice(0, limit);

  // Si aún no hay suficientes, agregar cualquier otro producto
  if (related.length < limit) {
    const others = initialProducts.filter(
      p => p.id !== productId && !related.some(r => r.id === p.id)
    );
    related.push(...others.slice(0, limit - related.length));
  }

  return related;
};
