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
    name: 'Cadena Pancer de Plata - 3mm',
    description: 'Cadena elegante de plata sólida 925 con diseño Pancer',
    price: 45990,
    stock: 15,
    image_url: '/images/DSC05016.jpg',
    image_alt: 'Cadena Pancer de Plata 3mm',
    category: 'Colgantes',
    is_new: true,
    is_featured: true,
  },
  {
    id: '550e8400-e29b-41d4-a716-446655440002',
    name: 'Pulsera Capri de Plata - 4mm',
    description: 'Pulsera de plata sólida 925 con diseño Capri elegante',
    price: 35990,
    stock: 12,
    image_url: '/images/DSC05015.jpg',
    image_alt: 'Pulsera Capri de Plata 4mm',
    category: 'Colgantes',
    is_new: false,
    is_featured: true,
  },
  {
    id: '550e8400-e29b-41d4-a716-446655440003',
    name: 'Anillo Black 2 Line V',
    description: 'Anillo de plata con diseño moderno y elegante',
    price: 28990,
    stock: 20,
    image_url: '/images/DSC05014.jpg',
    image_alt: 'Anillo Black 2 Line V',
    category: 'Colgantes',
    is_new: true,
    is_featured: true,
  },
  {
    id: '550e8400-e29b-41d4-a716-446655440004',
    name: 'Cadena Franco de Plata - 3.7mm',
    description: 'Cadena de plata sólida 925 estilo Franco',
    price: 52990,
    stock: 8,
    image_url: '/images/DSC05013.jpg',
    image_alt: 'Cadena Franco de Plata 3.7mm',
    category: 'Colgantes',
    is_new: false,
    is_featured: true,
  },
  {
    id: '550e8400-e29b-41d4-a716-446655440005',
    name: 'Esclava de Plata - 5mm',
    description: 'Esclava de plata sólida 950 con diseño robusto',
    price: 67990,
    stock: 10,
    image_url: '/images/DSC05012.jpg',
    image_alt: 'Esclava de Plata 5mm',
    category: 'Colgantes',
    is_new: false,
    is_featured: false,
  },
  {
    id: '550e8400-e29b-41d4-a716-446655440006',
    name: 'Colgante Placa de Plata',
    description: 'Colgante elegante de plata con placa personalizable',
    price: 32990,
    stock: 15,
    image_url: '/images/DSC05010.jpg',
    image_alt: 'Colgante Placa de Plata',
    category: 'Colgantes',
    is_new: true,
    is_featured: false,
  },
  {
    id: '550e8400-e29b-41d4-a716-446655440007',
    name: 'Aro Argolla Lumiere de Plata - 12mm',
    description: 'Aro de plata sólida 925 con diseño Lumiere',
    price: 39990,
    stock: 18,
    image_url: '/images/DSC05008.jpg',
    image_alt: 'Aro Argolla Lumiere de Plata 12mm',
    category: 'Colgantes',
    is_new: true,
    is_featured: false,
  },
  {
    id: '550e8400-e29b-41d4-a716-446655440008',
    name: 'Cadena Rope de Plata - 1.4mm',
    description: 'Cadena fina de plata estilo Rope',
    price: 33990,
    stock: 22,
    image_url: '/images/DSC05007.jpg',
    image_alt: 'Cadena Rope de Plata 1.4mm',
    category: 'Colgantes',
    is_new: false,
    is_featured: false,
  },
  {
    id: '550e8400-e29b-41d4-a716-446655440009',
    name: 'Pulsera Franco de Plata - 2.5mm',
    description: 'Pulsera delgada de plata estilo Franco',
    price: 27990,
    stock: 16,
    image_url: '/images/DSC05006.jpg',
    image_alt: 'Pulsera Franco de Plata 2.5mm',
    category: 'Colgantes',
    is_new: false,
    is_featured: false,
  },
  {
    id: '550e8400-e29b-41d4-a716-446655440010',
    name: 'Anillo de Plata Sólida',
    description: 'Anillo elegante de plata sólida 925',
    price: 24990,
    stock: 14,
    image_url: '/images/DSC05005.jpg',
    image_alt: 'Anillo de Plata Sólida',
    category: 'Colgantes',
    is_new: false,
    is_featured: false,
  },
  {
    id: '550e8400-e29b-41d4-a716-446655440011',
    name: 'Cadena Prisma de Plata - 2.8mm',
    description: 'Cadena de plata con diseño Prisma único',
    price: 44990,
    stock: 11,
    image_url: '/images/DSC05004.jpg',
    image_alt: 'Cadena Prisma de Plata 2.8mm',
    category: 'Colgantes',
    is_new: true,
    is_featured: false,
  },
  {
    id: '550e8400-e29b-41d4-a716-446655440012',
    name: 'Colgante Cruz de Plata',
    description: 'Colgante cruz elegante de plata sólida',
    price: 36990,
    stock: 13,
    image_url: '/images/DSC05003.jpg',
    image_alt: 'Colgante Cruz de Plata',
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
