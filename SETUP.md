# 🚀 Setup GOTRA - Vercel + Turso

## Configuración Inicial

### 1. Vercel
- Proyecto conectado a GitHub
- Deployments manuales (configurar webhook después si es necesario)

### 2. Turso
- Base de datos: `joystore`
- Tablas creadas: `products`, `stock_history`, `orders`, `newsletter_subscribers`

## Variables de Entorno en Vercel

Configurar en Vercel → Settings → Environment Variables:

```
TURSO_DATABASE_URL=libsql://tu-url.turso.io
TURSO_AUTH_TOKEN=tu-token
```

## Próximos Pasos

1. ✅ Base de datos creada en Turso
2. ⏳ Ejecutar schema SQL
3. ⏳ Insertar productos iniciales
4. ⏳ Configurar código para usar Turso

