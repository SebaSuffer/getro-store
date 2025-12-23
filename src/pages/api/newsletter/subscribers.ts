import type { APIRoute } from 'astro';
import { getTursoClient } from '../../../utils/turso';

// GET /api/newsletter/subscribers - Obtener todos los suscriptores
export const GET: APIRoute = async () => {
  try {
    const client = getTursoClient();
    
    if (!client) {
      return new Response(
        JSON.stringify({ error: 'Database not configured' }),
        { status: 500, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const result = await client.execute(
      'SELECT id, email, name, subscribed_at, is_active FROM newsletter_subscribers WHERE is_active = 1 ORDER BY subscribed_at DESC'
    );
    
    const subscribers = result.rows.map((row: any) => ({
      id: row.id,
      email: row.email,
      name: row.name,
      subscribedAt: row.subscribed_at,
      isActive: Boolean(row.is_active),
    }));

    return new Response(JSON.stringify(subscribers), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error: any) {
    console.error('Error fetching subscribers:', error);
    return new Response(
      JSON.stringify({ error: error.message || 'Error fetching subscribers' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
};



