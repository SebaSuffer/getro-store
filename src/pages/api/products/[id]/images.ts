import type { APIRoute } from 'astro';
import { getTursoClient } from '../../../../utils/turso';

export const GET: APIRoute = async ({ params }) => {
  try {
    const { id } = params;
    if (!id) {
      console.error('[API-IMAGES] ❌ GET: Product ID missing');
      return new Response(JSON.stringify({ error: 'Product ID required' }), { status: 400, headers: { 'Content-Type': 'application/json' } });
    }
    
    const client = getTursoClient();
    if (!client) {
      console.error('[API-IMAGES] ❌ GET: Database not configured');
      return new Response(JSON.stringify({ error: 'Database not configured' }), { status: 500, headers: { 'Content-Type': 'application/json' } });
    }
    
    try {
      const result = await client.execute({
        sql: 'SELECT * FROM product_images WHERE product_id = ? ORDER BY display_order ASC, is_primary DESC',
        args: [id],
      });
      const images = result.rows.map((row: any) => ({
        id: row.id,
        product_id: row.product_id,
        image_url: row.image_url,
        image_alt: row.image_alt || '',
        display_order: row.display_order,
        is_primary: Boolean(row.is_primary),
      }));
      console.log(`[API-IMAGES] ✅ GET: Loaded ${images.length} images for product ${id}`);
      return new Response(JSON.stringify(images), { status: 200, headers: { 'Content-Type': 'application/json' } });
    } catch (dbError: any) {
      // Si la tabla no existe, devolver array vacío en lugar de error
      if (dbError.message?.includes('no such table') || dbError.message?.includes('does not exist')) {
        console.warn(`[API-IMAGES] ⚠️ GET: Table product_images does not exist yet for product ${id}, returning empty array`);
        return new Response(JSON.stringify([]), { status: 200, headers: { 'Content-Type': 'application/json' } });
      }
      throw dbError;
    }
  } catch (error: any) {
    console.error(`[API-IMAGES] ❌ GET: Error fetching images:`, error.message || error);
    return new Response(JSON.stringify({ error: error.message || 'Error fetching images' }), { status: 500, headers: { 'Content-Type': 'application/json' } });
  }
};

export const POST: APIRoute = async ({ params, request }) => {
  try {
    const { id } = params;
    if (!id) {
      console.error('[API-IMAGES] ❌ POST: Product ID missing');
      return new Response(JSON.stringify({ error: 'Product ID required' }), { status: 400, headers: { 'Content-Type': 'application/json' } });
    }
    const body = await request.json();
    const { image_url, image_alt, display_order } = body;
    if (!image_url || (!image_url.startsWith('http://') && !image_url.startsWith('https://'))) {
      console.error('[API-IMAGES] ❌ POST: Invalid image URL');
      return new Response(JSON.stringify({ error: 'Valid image_url (http/https) is required' }), { status: 400, headers: { 'Content-Type': 'application/json' } });
    }
    const client = getTursoClient();
    if (!client) {
      console.error('[API-IMAGES] ❌ POST: Database not configured');
      return new Response(JSON.stringify({ error: 'Database not configured' }), { status: 500, headers: { 'Content-Type': 'application/json' } });
    }
    const imageId = `img-${id}-${Date.now()}`;
    try {
      await client.execute({
        sql: 'INSERT INTO product_images (id, product_id, image_url, image_alt, display_order, is_primary) VALUES (?, ?, ?, ?, ?, 0)',
        args: [imageId, id, image_url, image_alt || null, display_order || 0],
      });
      console.log(`[API-IMAGES] ✅ POST: Added image ${imageId} for product ${id}`);
      return new Response(JSON.stringify({ success: true, id: imageId }), { status: 200, headers: { 'Content-Type': 'application/json' } });
    } catch (dbError: any) {
      if (dbError.message?.includes('no such table') || dbError.message?.includes('does not exist')) {
        console.error(`[API-IMAGES] ❌ POST: Table product_images does not exist. Run create_product_images_table.sql first.`);
        return new Response(JSON.stringify({ error: 'Table product_images does not exist. Please run the migration script first.' }), { status: 500, headers: { 'Content-Type': 'application/json' } });
      }
      throw dbError;
    }
  } catch (error: any) {
    console.error(`[API-IMAGES] ❌ POST: Error adding image:`, error.message || error);
    return new Response(JSON.stringify({ error: error.message || 'Error adding image' }), { status: 500, headers: { 'Content-Type': 'application/json' } });
  }
};

export const DELETE: APIRoute = async ({ params, request }) => {
  try {
    const { id } = params;
    const url = new URL(request.url);
    const imageId = url.searchParams.get('imageId');
    if (!id || !imageId) {
      console.error('[API-IMAGES] ❌ DELETE: Product ID or image ID missing');
      return new Response(JSON.stringify({ error: 'Product ID and image ID required' }), { status: 400, headers: { 'Content-Type': 'application/json' } });
    }
    const client = getTursoClient();
    if (!client) {
      console.error('[API-IMAGES] ❌ DELETE: Database not configured');
      return new Response(JSON.stringify({ error: 'Database not configured' }), { status: 500, headers: { 'Content-Type': 'application/json' } });
    }
    try {
      await client.execute({
        sql: 'DELETE FROM product_images WHERE id = ? AND product_id = ?',
        args: [imageId, id],
      });
      console.log(`[API-IMAGES] ✅ DELETE: Deleted image ${imageId} for product ${id}`);
      return new Response(JSON.stringify({ success: true }), { status: 200, headers: { 'Content-Type': 'application/json' } });
    } catch (dbError: any) {
      if (dbError.message?.includes('no such table') || dbError.message?.includes('does not exist')) {
        console.warn(`[API-IMAGES] ⚠️ DELETE: Table product_images does not exist for product ${id}`);
        return new Response(JSON.stringify({ success: true }), { status: 200, headers: { 'Content-Type': 'application/json' } });
      }
      throw dbError;
    }
  } catch (error: any) {
    console.error(`[API-IMAGES] ❌ DELETE: Error deleting image:`, error.message || error);
    return new Response(JSON.stringify({ error: error.message || 'Error deleting image' }), { status: 500, headers: { 'Content-Type': 'application/json' } });
  }
};

