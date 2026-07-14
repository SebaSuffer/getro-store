import type { APIRoute } from 'astro';
import {
  changeUserPassword,
  getMinPasswordLength,
} from '../../../utils/auth-server';

export const POST: APIRoute = async ({ request }) => {
  try {
    const body = await request.json();
    const username = typeof body.username === 'string' ? body.username.trim() : '';
    const currentPassword =
      typeof body.currentPassword === 'string' ? body.currentPassword : '';
    const newPassword = typeof body.newPassword === 'string' ? body.newPassword : '';
    const confirmPassword =
      typeof body.confirmPassword === 'string' ? body.confirmPassword : '';

    if (!username || !currentPassword || !newPassword || !confirmPassword) {
      return new Response(
        JSON.stringify({ error: 'Todos los campos son requeridos' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    if (newPassword !== confirmPassword) {
      return new Response(
        JSON.stringify({ error: 'La confirmación no coincide con la nueva contraseña' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const minLength = getMinPasswordLength();
    if (newPassword.length < minLength) {
      return new Response(
        JSON.stringify({
          error: `La nueva contraseña debe tener al menos ${minLength} caracteres`,
        }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const result = await changeUserPassword(username, currentPassword, newPassword);
    if (!result.success) {
      return new Response(JSON.stringify({ error: result.error }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    return new Response(
      JSON.stringify({
        success: true,
        message: 'Contraseña actualizada correctamente',
      }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
  } catch (error: any) {
    console.error('Error changing password:', error);
    return new Response(
      JSON.stringify({ error: error.message || 'Error al cambiar la contraseña' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
};
