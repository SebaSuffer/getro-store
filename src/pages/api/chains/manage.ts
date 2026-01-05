import type { APIRoute } from 'astro';
import { getTursoClient } from '../../../utils/turso';

// GET /api/chains/manage - Obtener todas las cadenas para admin
export const GET: APIRoute = async () => {
  try {
    const client = getTursoClient();
    
    if (!client) {
      return new Response(
        JSON.stringify({ error: 'Database not configured' }),
        { status: 500, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Verificar si la tabla existe antes de consultar
    try {
      const result = await client.execute(`
        SELECT * FROM chains
        ORDER BY brand
      `);

      const chains = result.rows.map((row: any) => ({
        id: row.id,
        brand: row.brand,
        name: row.name,
        thickness: row.thickness,
        length: row.length,
        price: row.price || 0,
        stock: row.stock || 0,
        image_url: row.image_url,
        image_alt: row.image_alt,
        description: row.description,
        is_active: Boolean(row.is_active),
        created_at: row.created_at,
        updated_at: row.updated_at,
      }));

      return new Response(JSON.stringify(chains), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      });
    } catch (tableError: any) {
      // Si la tabla no existe, retornar array vacío
      if (tableError.message?.includes('no such table') || tableError.message?.includes('does not exist')) {
        console.warn('Chains table does not exist yet. Returning empty array.');
        return new Response(JSON.stringify([]), {
          status: 200,
          headers: { 'Content-Type': 'application/json' },
        });
      }
      throw tableError;
    }
  } catch (error: any) {
    console.error('Error fetching chains:', error);
    return new Response(
      JSON.stringify({ error: error.message || 'Error fetching chains' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
};

// POST /api/chains/manage - Crear o actualizar cadena
export const POST: APIRoute = async ({ request }) => {
  try {
    const client = getTursoClient();
    
    if (!client) {
      return new Response(
        JSON.stringify({ error: 'Database not configured' }),
        { status: 500, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const body = await request.json();
    const { id, brand, name, thickness, length, price, stock, image_url, image_alt, description, is_active } = body;

    if (!brand || !brand.trim()) {
      return new Response(
        JSON.stringify({ error: 'Brand is required' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Usar la marca como nombre si no se proporciona nombre
    const chainName = (name && name.trim()) || brand.trim();
    // Generar ID seguro: convertir a minúsculas, reemplazar espacios y caracteres especiales
    const chainId = id || `chain-${brand.trim().toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '')}`;

    // Convertir cadenas vacías a null para campos opcionales
    const cleanImageUrl = (image_url && image_url.trim()) || null;
    const cleanImageAlt = (image_alt && image_alt.trim()) || null;
    const cleanDescription = (description && description.trim()) || null;

    // Si es actualización, obtener el brand antiguo y actualizar referencias PRIMERO
    if (id) {
      const oldChain = await client.execute({
        sql: 'SELECT brand FROM chains WHERE id = ?',
        args: [id],
      });
      if (oldChain.rows.length > 0) {
        const oldBrand = oldChain.rows[0].brand;
        // Actualizar referencias ANTES de cambiar el brand en chains
        if (oldBrand && oldBrand !== brand.trim()) {
          await client.execute({
            sql: `UPDATE pendant_chain_options SET chain_brand = ?, updated_at = datetime('now') WHERE chain_brand = ?`,
            args: [brand.trim(), oldBrand],
          });
        }
      }
    }

    await client.execute({
      sql: `INSERT INTO chains (id, brand, name, thickness, length, price, stock, image_url, image_alt, description, is_active, updated_at)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, datetime('now'))
            ON CONFLICT(id) DO UPDATE SET
              brand = excluded.brand,
              name = excluded.name,
              thickness = excluded.thickness,
              length = excluded.length,
              price = excluded.price,
              stock = excluded.stock,
              image_url = excluded.image_url,
              image_alt = excluded.image_alt,
              description = excluded.description,
              is_active = excluded.is_active,
              updated_at = datetime('now')`,
      args: [
        chainId,
        brand.trim(),
        chainName,
        null, // thickness siempre null
        null, // length siempre null
        price || 0,
        stock || 0,
        cleanImageUrl,
        cleanImageAlt,
        cleanDescription,
        is_active !== false ? 1 : 0,
      ],
    });

    return new Response(
      JSON.stringify({ success: true, id: chainId }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
  } catch (error: any) {
    console.error('Error saving chain:', error);
    return new Response(
      JSON.stringify({ error: error.message || 'Error saving chain' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
};

// DELETE /api/chains/manage - Eliminar cadena
export const DELETE: APIRoute = async ({ request }) => {
  try {
    const client = getTursoClient();
    
    if (!client) {
      return new Response(
        JSON.stringify({ error: 'Database not configured' }),
        { status: 500, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const body = await request.json();
    const { id } = body;

    if (!id) {
      return new Response(
        JSON.stringify({ error: 'Chain ID is required' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    await client.execute({
      sql: 'DELETE FROM chains WHERE id = ?',
      args: [id],
    });

    return new Response(
      JSON.stringify({ success: true }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
  } catch (error: any) {
    console.error('Error deleting chain:', error);
    return new Response(
      JSON.stringify({ error: error.message || 'Error deleting chain' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
};

