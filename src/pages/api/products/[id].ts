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
      sql: `SELECT p.*, COUNT(pv.id) AS variation_count
            FROM products p
            LEFT JOIN product_variations pv ON p.id = pv.product_id
            WHERE p.id = ?
            GROUP BY p.id`,
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
      has_variations: Boolean(row.variation_count),
      variation_count: row.variation_count,
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
    const { name, description, price, stock, image_url, image_alt, category, is_new, is_featured, is_active, chain_type, display_price } = body;

    const client = getTursoClient();
    
    if (!client) {
      return new Response(
        JSON.stringify({ error: 'Database not configured' }),
        { status: 500, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Verificar si existe la columna display_price
    const tableInfo = await client.execute({
      sql: "PRAGMA table_info(products)",
      args: [],
    });
    
    const hasDisplayPrice = tableInfo.rows.some((row: any) => row.name === 'display_price');
    
    // Verificar si existe is_active
    const hasIsActive = tableInfo.rows.some((row: any) => row.name === 'is_active');
    
    if (hasDisplayPrice && hasIsActive) {
      await client.execute({
        sql: `UPDATE products 
              SET name = ?, description = ?, price = ?, stock = ?, 
                  image_url = ?, image_alt = ?, category = ?, 
                  is_new = ?, is_featured = ?, is_active = ?, display_price = ?, updated_at = CURRENT_TIMESTAMP
              WHERE id = ?`,
        args: [name, description, price, stock, image_url, image_alt, category, is_new ? 1 : 0, is_featured ? 1 : 0, is_active !== undefined ? (is_active ? 1 : 0) : 1, display_price || null, id],
      });
    } else if (hasDisplayPrice) {
      await client.execute({
        sql: `UPDATE products 
              SET name = ?, description = ?, price = ?, stock = ?, 
                  image_url = ?, image_alt = ?, category = ?, 
                  is_new = ?, is_featured = ?, display_price = ?, updated_at = CURRENT_TIMESTAMP
              WHERE id = ?`,
        args: [name, description, price, stock, image_url, image_alt, category, is_new ? 1 : 0, is_featured ? 1 : 0, display_price || null, id],
      });
    } else if (hasIsActive) {
      await client.execute({
        sql: `UPDATE products 
              SET name = ?, description = ?, price = ?, stock = ?, 
                  image_url = ?, image_alt = ?, category = ?, 
                  is_new = ?, is_featured = ?, is_active = ?, updated_at = CURRENT_TIMESTAMP
              WHERE id = ?`,
        args: [name, description, price, stock, image_url, image_alt, category, is_new ? 1 : 0, is_featured ? 1 : 0, is_active !== undefined ? (is_active ? 1 : 0) : 1, id],
      });
    } else {
      await client.execute({
        sql: `UPDATE products 
              SET name = ?, description = ?, price = ?, stock = ?, 
                  image_url = ?, image_alt = ?, category = ?, 
                  is_new = ?, is_featured = ?, updated_at = CURRENT_TIMESTAMP
              WHERE id = ?`,
        args: [name, description, price, stock, image_url, image_alt, category, is_new ? 1 : 0, is_featured ? 1 : 0, id],
      });
    }

    // Las variaciones ahora se gestionan manualmente desde el panel de administración
    // No se actualizan automáticamente al editar el producto

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



