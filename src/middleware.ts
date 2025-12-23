import type { MiddlewareHandler } from 'astro';

// Middleware para proteger rutas de administración
export const onRequest: MiddlewareHandler = async (context, next) => {
  const url = new URL(context.request.url);
  
  // Proteger rutas de admin
  if (url.pathname.startsWith('/admin')) {
    // Verificar headers de seguridad
    const userAgent = context.request.headers.get('user-agent');
    const referer = context.request.headers.get('referer');
    
    // Bloquear bots y crawlers conocidos
    if (userAgent) {
      const botPatterns = [
        /bot/i,
        /crawler/i,
        /spider/i,
        /scraper/i,
        /facebookexternalhit/i,
        /twitterbot/i,
        /linkedinbot/i,
      ];
      
      if (botPatterns.some(pattern => pattern.test(userAgent))) {
        return new Response('Access Denied', { status: 403 });
      }
    }
    
    // Permitir continuar (la autenticación real se hace en el cliente)
    return next();
  }
  
  return next();
};





