import type { APIRoute } from 'astro';
import { getTursoClient } from '../../../utils/turso';

// GET /api/chains - Obtener todas las cadenas agrupadas por marca
export const GET: APIRoute = async () => {
  try {
    const client = getTursoClient();
    
    if (!client) {
      return new Response(
        JSON.stringify({ error: 'Database not configured' }),
        { status: 500, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Obtener todas las cadenas activas de la tabla chains
    const chainsResult = await client.execute(`
      SELECT * FROM chains
      WHERE is_active = 1
      ORDER BY brand
    `);

    const chains = chainsResult.rows.map((row: any) => ({
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

    // Agrupar por marca (ahora solo hay una cadena por marca)
    const groupedByBrand: Record<string, typeof chains> = {};
    
    chains.forEach((chain) => {
      const brand = chain.brand || 'Sin marca';
      if (!groupedByBrand[brand]) {
        groupedByBrand[brand] = [];
      }
      groupedByBrand[brand].push(chain);
    });

    return new Response(
      JSON.stringify({
        chains,
        groupedByBrand,
      }),
      {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  } catch (error: any) {
    console.error('Error fetching chains:', error);
    return new Response(
      JSON.stringify({ error: error.message || 'Error fetching chains' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
};

