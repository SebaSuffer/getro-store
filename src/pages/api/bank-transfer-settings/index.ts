import type { APIRoute } from 'astro';
import { getTursoClient } from '../../../utils/turso';

// GET /api/bank-transfer-settings - Obtener configuración
export const GET: APIRoute = async () => {
  try {
    const client = getTursoClient();
    if (!client) {
      return new Response(
        JSON.stringify({ error: 'Database not configured' }),
        { status: 500, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const result = await client.execute('SELECT * FROM bank_transfer_settings WHERE id = ?', ['bank_transfer_001']);
    
    if (result.rows.length === 0) {
      // Retornar valores por defecto
      return new Response(
        JSON.stringify({
          bank_name: '',
          account_type: '',
          account_number: '',
          rut: '',
          account_holder: '',
          email: '',
          is_enabled: false,
        }),
        { status: 200, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const row = result.rows[0] as any;
    return new Response(
      JSON.stringify({
        bank_name: row.bank_name || '',
        account_type: row.account_type || '',
        account_number: row.account_number || '',
        rut: row.rut || '',
        account_holder: row.account_holder || '',
        email: row.email || '',
        is_enabled: Boolean(row.is_enabled),
      }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
  } catch (error: any) {
    console.error('Error fetching bank transfer settings:', error);
    return new Response(
      JSON.stringify({ error: error.message || 'Error fetching settings' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
};

// PUT /api/bank-transfer-settings - Actualizar configuración
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
    const { bank_name, account_type, account_number, rut, account_holder, email, is_enabled } = body;

    // Verificar si existe el registro
    const existing = await client.execute('SELECT id FROM bank_transfer_settings WHERE id = ?', ['bank_transfer_001']);
    
    if (existing.rows.length === 0) {
      // Crear registro
      await client.execute({
        sql: `INSERT INTO bank_transfer_settings (id, bank_name, account_type, account_number, rut, account_holder, email, is_enabled, created_at, updated_at)
              VALUES (?, ?, ?, ?, ?, ?, ?, ?, datetime('now'), datetime('now'))`,
        args: ['bank_transfer_001', bank_name || null, account_type || null, account_number || null, rut || null, account_holder || null, email || null, is_enabled ? 1 : 0],
      });
    } else {
      // Actualizar registro
      await client.execute({
        sql: `UPDATE bank_transfer_settings 
              SET bank_name = ?, account_type = ?, account_number = ?, rut = ?, account_holder = ?, email = ?, is_enabled = ?, updated_at = datetime('now')
              WHERE id = ?`,
        args: [bank_name || null, account_type || null, account_number || null, rut || null, account_holder || null, email || null, is_enabled ? 1 : 0, 'bank_transfer_001'],
      });
    }

    return new Response(
      JSON.stringify({ success: true }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
  } catch (error: any) {
    console.error('Error updating bank transfer settings:', error);
    return new Response(
      JSON.stringify({ error: error.message || 'Error updating settings' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
};

