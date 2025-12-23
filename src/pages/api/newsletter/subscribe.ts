import type { APIRoute } from 'astro';
import { getTursoClient } from '../../../utils/turso';

// POST /api/newsletter/subscribe - Suscribir email al newsletter
export const POST: APIRoute = async ({ request }) => {
  try {
    const body = await request.json();
    const { email, name } = body;

    if (!email || !email.includes('@')) {
      return new Response(
        JSON.stringify({ error: 'Valid email required' }),
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

    // Verificar si ya está suscrito
    const existing = await client.execute({
      sql: 'SELECT id FROM newsletter_subscribers WHERE email = ? AND is_active = 1',
      args: [email.toLowerCase().trim()],
    });

    if (existing.rows.length > 0) {
      return new Response(
        JSON.stringify({ error: 'Email already subscribed' }),
        { status: 409, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Insertar nuevo suscriptor
    await client.execute({
      sql: 'INSERT INTO newsletter_subscribers (email, name) VALUES (?, ?)',
      args: [email.toLowerCase().trim(), name || null],
    });

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error: any) {
    console.error('Error subscribing:', error);
    return new Response(
      JSON.stringify({ error: error.message || 'Error subscribing' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
};

