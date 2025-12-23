import { createClient } from '@libsql/client';

// Cliente de Turso (solo en servidor)
let tursoClient: ReturnType<typeof createClient> | null = null;

export const getTursoClient = () => {
  if (typeof window !== 'undefined') {
    // En el cliente, no podemos usar Turso directamente
    // Usaremos API routes
    return null;
  }

  if (tursoClient) {
    return tursoClient;
  }

  const databaseUrl = import.meta.env.TURSO_DATABASE_URL;
  const authToken = import.meta.env.TURSO_AUTH_TOKEN;

  if (!databaseUrl || !authToken) {
    console.warn('Turso credentials not found, using fallback');
    return null;
  }

  try {
    tursoClient = createClient({
      url: databaseUrl,
      authToken: authToken,
    });
    return tursoClient;
  } catch (error) {
    console.error('Error creating Turso client:', error);
    return null;
  }
};

// Helper para ejecutar queries en el servidor
export const executeQuery = async (query: string, params: any[] = []) => {
  const client = getTursoClient();
  if (!client) {
    throw new Error('Turso client not available');
  }
  return await client.execute(query, params);
};

