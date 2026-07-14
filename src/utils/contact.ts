import { getTursoClient } from './turso';

export type ContactSettings = {
  email: string;
  phone: string;
};

export const DEFAULT_CONTACT_SETTINGS: ContactSettings = {
  email: 'contacto.gotrachile@gmail.com',
  phone: '+56 9 3069 3754',
};

/** Digitos para wa.me (solo números) */
export const getWhatsAppNumber = (phone: string): string => {
  const digits = phone.replace(/\D/g, '');
  return digits || '56930693754';
};

export const getWhatsAppUrl = (
  phone: string,
  message = 'Hola, me interesa conocer más sobre sus productos'
): string => {
  const number = getWhatsAppNumber(phone);
  return `https://wa.me/${number}?text=${encodeURIComponent(message)}`;
};

const ensureContactSettingsTable = async (client: NonNullable<ReturnType<typeof getTursoClient>>) => {
  await client.execute(`
    CREATE TABLE IF NOT EXISTS contact_settings (
      id TEXT PRIMARY KEY DEFAULT 'contact_001',
      email TEXT,
      phone TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  await client.execute({
    sql: `INSERT OR IGNORE INTO contact_settings (id, email, phone, created_at, updated_at)
          VALUES (?, ?, ?, datetime('now'), datetime('now'))`,
    args: [
      'contact_001',
      DEFAULT_CONTACT_SETTINGS.email,
      DEFAULT_CONTACT_SETTINGS.phone,
    ],
  });
};

/** Obtener contacto desde Turso (solo servidor / Astro) */
export const getContactSettings = async (): Promise<ContactSettings> => {
  try {
    const client = getTursoClient();
    if (!client) {
      return DEFAULT_CONTACT_SETTINGS;
    }

    await ensureContactSettingsTable(client);

    const result = await client.execute({
      sql: 'SELECT email, phone FROM contact_settings WHERE id = ?',
      args: ['contact_001'],
    });

    if (result.rows.length === 0) {
      return DEFAULT_CONTACT_SETTINGS;
    }

    const row = result.rows[0] as any;
    return {
      email: row.email || DEFAULT_CONTACT_SETTINGS.email,
      phone: row.phone || DEFAULT_CONTACT_SETTINGS.phone,
    };
  } catch (error) {
    console.error('[CONTACT] Error loading contact settings:', error);
    return DEFAULT_CONTACT_SETTINGS;
  }
};
