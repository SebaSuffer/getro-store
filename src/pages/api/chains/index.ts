import type { APIRoute } from 'astro';
import { getTursoClient } from '../../../utils/turso';

// GET /api/chains - Obtener todas las cadenas con sus variaciones agrupadas por marca
export const GET: APIRoute = async () => {
  try {
    const client = getTursoClient();
    
    if (!client) {
      return new Response(
        JSON.stringify({ error: 'Database not configured' }),
        { status: 500, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Obtener todas las cadenas (productos de categoría "Cadenas")
    const chainsResult = await client.execute(`
      SELECT * FROM products 
      WHERE category = 'Cadenas'
      ORDER BY name
    `);

    const chains = chainsResult.rows.map((row: any) => ({
      id: row.id,
      name: row.name,
      description: row.description,
      price: row.price,
      stock: row.stock,
      image_url: row.image_url,
      image_alt: row.image_alt,
    }));

    // Obtener todas las variaciones de cadenas
    const variationsResult = await client.execute(`
      SELECT pv.*, p.name as product_name, p.image_url as product_image_url
      FROM product_variations pv
      INNER JOIN products p ON pv.product_id = p.id
      WHERE p.category = 'Cadenas' AND pv.is_active = 1
      ORDER BY pv.brand, pv.thickness, pv.length
    `);

    const variations = variationsResult.rows.map((row: any) => ({
      id: row.id,
      product_id: row.product_id,
      product_name: row.product_name,
      product_image_url: row.product_image_url,
      chain_type: row.chain_type,
      brand: row.brand,
      thickness: row.thickness,
      length: row.length,
      price_modifier: row.price_modifier ?? 0,
      stock: row.stock ?? 0,
      is_active: Boolean(row.is_active),
    }));

    // Agrupar variaciones por marca
    const groupedByBrand: Record<string, typeof variations> = {};
    
    variations.forEach((variation) => {
      const brand = variation.brand || 'Sin marca';
      if (!groupedByBrand[brand]) {
        groupedByBrand[brand] = [];
      }
      groupedByBrand[brand].push(variation);
    });

    return new Response(
      JSON.stringify({
        chains,
        variations,
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

