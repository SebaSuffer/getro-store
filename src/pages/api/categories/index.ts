import type { APIRoute } from 'astro';
import { getTursoClient } from '../../../utils/turso';

export const GET: APIRoute = async () => {
  try {
    const client = getTursoClient();
    if (!client) {
      return new Response(JSON.stringify({ error: 'Database not configured' }), { status: 500, headers: { 'Content-Type': 'application/json' } });
    }
    const result = await client.execute(`SELECT * FROM categories WHERE is_active = 1 ORDER BY display_order ASC, name ASC`);
    const categories = result.rows.map((row: any) => ({
      id: row.id,
      name: row.name,
      image_url: row.image_url,
      image_alt: row.image_alt || row.name,
      display_order: row.display_order,
      is_active: Boolean(row.is_active),
    }));
    return new Response(JSON.stringify(categories), { status: 200, headers: { 'Content-Type': 'application/json' } });
  } catch (error: any) {
    return new Response(JSON.stringify({ error: error.message || 'Error fetching categories' }), { status: 500, headers: { 'Content-Type': 'application/json' } });
  }
};

export const PUT: APIRoute = async ({ request }) => {
  try {
    const body = await request.json();
    const { id, image_url, image_alt, name } = body;
    if (!id || !image_url) {
      return new Response(JSON.stringify({ error: 'ID e image_url son requeridos' }), { status: 400, headers: { 'Content-Type': 'application/json' } });
    }
    const client = getTursoClient();
    if (!client) {
      return new Response(JSON.stringify({ error: 'Database not configured' }), { status: 500, headers: { 'Content-Type': 'application/json' } });
    }
    await client.execute({
      sql: `UPDATE categories SET image_url = ?, image_alt = ?, ${name ? 'name = ?, ' : ''}updated_at = datetime('now') WHERE id = ?`,
      args: name ? [image_url, image_alt || null, name, id] : [image_url, image_alt || null, id],
    });
    return new Response(JSON.stringify({ success: true }), { status: 200, headers: { 'Content-Type': 'application/json' } });
  } catch (error: any) {
    return new Response(JSON.stringify({ error: error.message || 'Error updating category' }), { status: 500, headers: { 'Content-Type': 'application/json' } });
  }
};

export const POST: APIRoute = async ({ request }) => {
  try {
    const body = await request.json();
    const { name, image_url, image_alt } = body;
    if (!name || !image_url) {
      return new Response(JSON.stringify({ error: 'Nombre e image_url son requeridos' }), { status: 400, headers: { 'Content-Type': 'application/json' } });
    }
    const client = getTursoClient();
    if (!client) {
      return new Response(JSON.stringify({ error: 'Database not configured' }), { status: 500, headers: { 'Content-Type': 'application/json' } });
    }
    const id = `cat_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const maxOrderResult = await client.execute(`SELECT MAX(display_order) as max_order FROM categories`);
    const maxOrder = maxOrderResult.rows[0]?.max_order || 0;
    await client.execute({
      sql: `INSERT INTO categories (id, name, image_url, image_alt, display_order, is_active, created_at, updated_at) VALUES (?, ?, ?, ?, ?, 1, datetime('now'), datetime('now'))`,
      args: [id, name, image_url, image_alt || name, maxOrder + 1],
    });
    return new Response(JSON.stringify({ success: true, id }), { status: 200, headers: { 'Content-Type': 'application/json' } });
  } catch (error: any) {
    return new Response(JSON.stringify({ error: error.message || 'Error creating category' }), { status: 500, headers: { 'Content-Type': 'application/json' } });
  }
};

export const DELETE: APIRoute = async ({ request }) => {
  try {
    const body = await request.json();
    const { id } = body;
    if (!id) {
      return new Response(JSON.stringify({ error: 'ID es requerido' }), { status: 400, headers: { 'Content-Type': 'application/json' } });
    }
    const client = getTursoClient();
    if (!client) {
      return new Response(JSON.stringify({ error: 'Database not configured' }), { status: 500, headers: { 'Content-Type': 'application/json' } });
    }
    await client.execute({
      sql: `UPDATE categories SET is_active = 0, updated_at = datetime('now') WHERE id = ?`,
      args: [id],
    });
    return new Response(JSON.stringify({ success: true }), { status: 200, headers: { 'Content-Type': 'application/json' } });
  } catch (error: any) {
    return new Response(JSON.stringify({ error: error.message || 'Error deleting category' }), { status: 500, headers: { 'Content-Type': 'application/json' } });
  }
};
