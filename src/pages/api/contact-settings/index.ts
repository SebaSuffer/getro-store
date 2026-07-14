import type { APIRoute } from 'astro';
import {
  DEFAULT_CONTACT_SETTINGS,
  getContactSettings,
} from '../../../utils/contact';
import { getTursoClient } from '../../../utils/turso';

// GET /api/contact-settings
export const GET: APIRoute = async () => {
  try {
    const settings = await getContactSettings();
    return new Response(JSON.stringify(settings), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error: any) {
    console.error('Error fetching contact settings:', error);
    return new Response(
      JSON.stringify({ error: error.message || 'Error fetching contact settings' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
};

// PUT /api/contact-settings
export const PUT: APIRoute = async ({ request }) => {
  try {
    const client = getTursoClient();
    if (!client) {
      return new Response(
        JSON.stringify({ error: 'Database not configured' }),
        { status: 500, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const body = await request.json();
    const email = typeof body.email === 'string' ? body.email.trim() : '';
    const phone = typeof body.phone === 'string' ? body.phone.trim() : '';

    if (!email || !phone) {
      return new Response(
        JSON.stringify({ error: 'Email y teléfono son requeridos' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Asegurar tabla (vía GET helper que crea si falta)
    await getContactSettings();

    const existing = await client.execute({
      sql: 'SELECT id FROM contact_settings WHERE id = ?',
      args: ['contact_001'],
    });

    if (existing.rows.length === 0) {
      await client.execute({
        sql: `INSERT INTO contact_settings (id, email, phone, created_at, updated_at)
              VALUES (?, ?, ?, datetime('now'), datetime('now'))`,
        args: ['contact_001', email, phone],
      });
    } else {
      await client.execute({
        sql: `UPDATE contact_settings
              SET email = ?, phone = ?, updated_at = datetime('now')
              WHERE id = ?`,
        args: [email, phone, 'contact_001'],
      });
    }

    return new Response(
      JSON.stringify({
        success: true,
        email,
        phone,
      }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
  } catch (error: any) {
    console.error('Error updating contact settings:', error);
    return new Response(
      JSON.stringify({
        error: error.message || 'Error updating contact settings',
        email: DEFAULT_CONTACT_SETTINGS.email,
        phone: DEFAULT_CONTACT_SETTINGS.phone,
      }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
};
