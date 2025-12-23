import type { APIRoute } from 'astro';
import { getTursoClient } from '../../../utils/turso';

// GET /api/products - Obtener todos los productos
export const GET: APIRoute = async () => {
  try {
    const client = getTursoClient();
    
    if (!client) {
      return new Response(
        JSON.stringify({ error: 'Database not configured' }),
        { status: 500, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const result = await client.execute('SELECT * FROM products ORDER BY created_at DESC');
    
    const products = result.rows.map((row: any) => ({
      id: row.id,
      name: row.name,
      description: row.description,
      price: row.price,
      stock: row.stock,
      image_url: row.image_url,
      image_alt: row.image_alt,
      category: row.category,
      is_new: Boolean(row.is_new),
      is_featured: Boolean(row.is_featured),
    }));

    return new Response(JSON.stringify(products), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error: any) {
    console.error('Error fetching products:', error);
    return new Response(
      JSON.stringify({ error: error.message || 'Error fetching products' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
};

