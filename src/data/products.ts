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
    name: 'Colgante Corona de Plata - Estilo Clásico',
    description: 'Colgante de plata sólida 925 con diseño de corona clásica',
    price: 28990,
    stock: 20,
    image_url: 'https://res.cloudinary.com/ddzoh72zv/image/upload/f_auto,q_auto/v1766458847/DSC05014_tpyofl.jpg',
    image_alt: 'Colgante Corona de Plata - Estilo Clásico',
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
    name: 'Colgante Cuadrado con Círculo de Plata - Grande',
    description: 'Colgante de plata sólida 950 con diseño geométrico cuadrado y círculo central, tamaño grande',
    price: 67990,
    stock: 10,
    image_url: 'https://res.cloudinary.com/ddzoh72zv/image/upload/f_auto,q_auto/v1766458846/DSC05012_bbchhj.jpg',
    image_alt: 'Colgante Cuadrado con Círculo de Plata - Grande',
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
    name: 'Colgante Cruz de Plata',
    description: 'Colgante de plata sólida 925 con diseño de cruz elegante',
    price: 27990,
    stock: 16,
    image_url: 'https://res.cloudinary.com/ddzoh72zv/image/upload/f_auto,q_auto/v1766458845/DSC05006_r56buj.jpg',
    image_alt: 'Colgante Cruz de Plata',
    category: 'Colgantes',
    is_new: false,
    is_featured: false,
  },
  {
    id: '550e8400-e29b-41d4-a716-446655440010',
    name: 'Colgante Cruz de Plata - Minimalista',
    description: 'Colgante de plata sólida 925 con diseño de cruz minimalista y delicada',
    price: 24990,
    stock: 14,
    image_url: 'https://res.cloudinary.com/ddzoh72zv/image/upload/f_auto,q_auto/v1766458845/DSC05005_vz2ss2.jpg',
    image_alt: 'Colgante Cruz de Plata - Minimalista',
    category: 'Colgantes',
    is_new: false,
    is_featured: false,
  },
  {
    id: '550e8400-e29b-41d4-a716-446655440011',
    name: 'Colgante Símbolo de Plata',
    description: 'Colgante de plata sólida 925 con diseño de símbolo estilizado único',
    price: 44990,
    stock: 11,
    image_url: 'https://res.cloudinary.com/ddzoh72zv/image/upload/f_auto,q_auto/v1766458845/DSC05004_awkvea.jpg',
    image_alt: 'Colgante Símbolo de Plata',
    category: 'Colgantes',
    is_new: true,
    is_featured: false,
  },
  {
    id: '550e8400-e29b-41d4-a716-446655440012',
    name: 'Colgante Cruz de Plata - Tradicional',
    description: 'Colgante de plata sólida 925 con diseño de cruz tradicional y elegante',
    price: 36990,
    stock: 13,
    image_url: 'https://res.cloudinary.com/ddzoh72zv/image/upload/f_auto,q_auto/v1766458845/DSC05003_n0s54y.jpg',
    image_alt: 'Colgante Cruz de Plata - Tradicional',
    category: 'Colgantes',
    is_new: false,
    is_featured: false,
  },
];

// Obtener todos los productos
export const getAllProducts = (): Product[] => {
  return initialProducts;
};

// Obtener productos destacados
export const getFeaturedProducts = (): Product[] => {
  return initialProducts.filter(p => p.is_featured).slice(0, 4);
};

// Obtener productos por categoría
export const getProductsByCategory = (category: string): Product[] => {
  return initialProducts.filter(p => p.category === category);
};

// Obtener categorías únicas
export const getCategories = (): string[] => {
  return Array.from(new Set(initialProducts.map(p => p.category)));
};

// Obtener producto por ID
export const getProductById = (id: string): Product | null => {
  return initialProducts.find(p => p.id === id) || null;
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
