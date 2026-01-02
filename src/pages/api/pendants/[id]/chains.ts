import type { APIRoute } from 'astro';
import { getTursoClient } from '../../../../utils/turso';

// GET /api/pendants/[id]/chains - Obtener cadenas disponibles para un colgante
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

    // Obtener cadenas disponibles para este colgante
    const result = await client.execute({
      sql: `SELECT c.*, pco.is_active as option_active
            FROM chains c
            INNER JOIN pendant_chain_options pco ON c.brand = pco.chain_brand
            WHERE pco.pendant_id = ? AND pco.is_active = 1 AND c.is_active = 1
            ORDER BY c.brand`,
      args: [id],
    });

    const chains = result.rows.map((row: any) => ({
      id: row.id,
      brand: row.brand,
      name: row.name,
      thickness: row.thickness,
      length: row.length,
      price: row.price,
      stock: row.stock,
      image_url: row.image_url,
      image_alt: row.image_alt,
      description: row.description,
      is_active: Boolean(row.is_active),
    }));

    return new Response(JSON.stringify(chains), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error: any) {
    console.error('Error fetching pendant chains:', error);
    return new Response(
      JSON.stringify({ error: error.message || 'Error fetching chains' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
};

// POST /api/pendants/[id]/chains - Actualizar cadenas disponibles para un colgante
export const POST: APIRoute = async ({ params, request }) => {
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

    const body = await request.json();
    const { chainBrands } = body; // Array de marcas de cadenas disponibles

    if (!Array.isArray(chainBrands)) {
      return new Response(
        JSON.stringify({ error: 'chainBrands must be an array' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Eliminar todas las opciones existentes
    await client.execute({
      sql: 'DELETE FROM pendant_chain_options WHERE pendant_id = ?',
      args: [id],
    });

    // Insertar nuevas opciones
    for (const brand of chainBrands) {
      const optionId = `pco-${id}-${brand.toLowerCase().replace(/\s+/g, '-')}`;
      await client.execute({
        sql: `INSERT INTO pendant_chain_options (id, pendant_id, chain_brand, is_active, updated_at)
              VALUES (?, ?, ?, 1, datetime('now'))`,
        args: [optionId, id, brand],
      });
    }

    return new Response(
      JSON.stringify({ success: true, count: chainBrands.length }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
  } catch (error: any) {
    console.error('Error updating pendant chains:', error);
    return new Response(
      JSON.stringify({ error: error.message || 'Error updating chains' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
};

