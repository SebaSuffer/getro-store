import type { APIRoute } from 'astro';
import { updateLastLogin, verifyUserPassword } from '../../../utils/auth-server';

export const POST: APIRoute = async ({ request }) => {
  try {
    const body = await request.json();
    const username = typeof body.username === 'string' ? body.username.trim() : '';
    const password = typeof body.password === 'string' ? body.password : '';

    if (!username || !password) {
      return new Response(
        JSON.stringify({ error: 'Usuario y contraseña son requeridos' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const user = await verifyUserPassword(username, password);
    if (!user) {
      return new Response(
        JSON.stringify({ error: 'Usuario o contraseña incorrectos' }),
        { status: 401, headers: { 'Content-Type': 'application/json' } }
      );
    }

    await updateLastLogin(user.id);

    return new Response(
      JSON.stringify({
        success: true,
        username: user.username,
        role: user.role,
      }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
  } catch (error: any) {
    console.error('Error in login:', error);
    return new Response(
      JSON.stringify({ error: error.message || 'Error al iniciar sesión' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
};
