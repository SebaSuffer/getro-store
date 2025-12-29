import type { APIRoute } from 'astro';
import { getTursoClient } from '../../../utils/turso';

// GET /api/products/[id] - Obtener un producto por ID
export const GET: APIRoute = async ({ params }) => {
  try {
    const { id } = params;
    
    if (!id) {
      return new Response(
        JSON.stringify({ error: 'Product ID required' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const client = getTursoClient();
    
    if (!client) {
      return new Response(
        JSON.stringify({ error: 'Database not configured' }),
        { status: 500, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const result = await client.execute({
      sql: 'SELECT * FROM products WHERE id = ?',
      args: [id],
    });

    if (result.rows.length === 0) {
      return new Response(
        JSON.stringify({ error: 'Product not found' }),
        { status: 404, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const row = result.rows[0] as any;
    const product = {
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
    };

    return new Response(JSON.stringify(product), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error: any) {
    console.error('Error fetching product:', error);
    return new Response(
      JSON.stringify({ error: error.message || 'Error fetching product' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
};

// PUT /api/products/[id] - Actualizar un producto
export const PUT: APIRoute = async ({ params, request }) => {
  try {
    const { id } = params;
    
    if (!id) {
      return new Response(
        JSON.stringify({ error: 'Product ID required' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const body = await request.json();
    const { name, description, price, stock, image_url, image_alt, category, is_new, is_featured, chain_type } = body;

    const client = getTursoClient();
    
    if (!client) {
      return new Response(
        JSON.stringify({ error: 'Database not configured' }),
        { status: 500, headers: { 'Content-Type': 'application/json' } }
      );
    }

    await client.execute({
      sql: `UPDATE products 
            SET name = ?, description = ?, price = ?, stock = ?, 
                image_url = ?, image_alt = ?, category = ?, 
                is_new = ?, is_featured = ?, updated_at = CURRENT_TIMESTAMP
            WHERE id = ?`,
      args: [name, description, price, stock, image_url, image_alt, category, is_new ? 1 : 0, is_featured ? 1 : 0, id],
    });

    // Si es una cadena, actualizar o crear variación
    if (category === 'Cadenas' && chain_type) {
      const variationId = `var-${id}-${chain_type}`;
      const isActive = chain_type === 'plata_925' ? 1 : 0; // Solo plata 925 visible por ahora
      
      await client.execute({
        sql: `INSERT OR REPLACE INTO product_variations 
              (id, product_id, chain_type, length, thickness, price_modifier, stock, is_active, created_at, updated_at)
              VALUES (?, ?, ?, ?, ?, ?, ?, ?, datetime('now'), datetime('now'))`,
        args: [
          variationId,
          id,
          chain_type,
          null, // Largo pendiente
          null, // Grosor pendiente
          0, // Sin modificador de precio
          stock,
          isActive,
        ],
      });
    }

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error: any) {
    console.error('Error updating product:', error);
    return new Response(
      JSON.stringify({ error: error.message || 'Error updating product' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
};

// DELETE /api/products/[id] - Eliminar un producto (soft delete)
export const DELETE: APIRoute = async ({ params }) => {
  try {
    const { id } = params;
    
    if (!id) {
      return new Response(
        JSON.stringify({ error: 'Product ID required' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const client = getTursoClient();
    
    if (!client) {
      return new Response(
        JSON.stringify({ error: 'Database not configured' }),
        { status: 500, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Por ahora, eliminamos físicamente. Podrías agregar un campo "deleted" para soft delete
    await client.execute({
      sql: 'DELETE FROM products WHERE id = ?',
      args: [id],
    });

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error: any) {
    console.error('Error deleting product:', error);
    return new Response(
      JSON.stringify({ error: error.message || 'Error deleting product' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
};



