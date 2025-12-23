# 🗄️ Migración a Turso - GOTRA Joyería

## ¿Qué es Turso?

Turso es una base de datos SQLite distribuida, perfecta para aplicaciones web. Es:
- ✅ Gratis hasta cierto límite
- ✅ Rápida y confiable
- ✅ Fácil de usar
- ✅ Compatible con SQLite (mismo SQL)

## Plan de Migración

### Fase 1: Configuración (TÚ)
1. Crear cuenta en Turso
2. Crear base de datos
3. Ejecutar schema SQL
4. Configurar variables de entorno en Vercel

### Fase 2: Código (YO)
1. Instalar dependencias (`@libsql/client`)
2. Crear utilidades para conectar a Turso
3. Reemplazar funciones de localStorage con queries a Turso
4. Crear API routes para operaciones CRUD
5. Actualizar componentes para usar las nuevas funciones

### Fase 3: Migración de Datos
1. Script para migrar productos desde `src/data/products.ts`
2. Migrar datos existentes de localStorage (si los hay)

## Estructura de Archivos

```
turso/
├── schema.sql              # Schema de la base de datos
├── migrate-products.sql    # Script para insertar productos iniciales
├── setup.md               # Instrucciones de configuración
└── README.md             # Este archivo
```

## Próximos Pasos

1. **TÚ**: Sigue las instrucciones en `setup.md`
2. **YO**: Una vez que tengas la BD configurada, te daré el código para:
   - Conectar a Turso
   - Reemplazar todas las funciones de localStorage
   - Crear API routes
   - Actualizar componentes

## Ventajas de Turso vs localStorage

| localStorage | Turso |
|-------------|-------|
| ❌ Solo en el navegador | ✅ Persistente en servidor |
| ❌ No sincroniza entre dispositivos | ✅ Sincroniza automáticamente |
| ❌ Límite de tamaño | ✅ Sin límites prácticos |
| ❌ No hay queries | ✅ SQL completo |
| ❌ No hay relaciones | ✅ Relaciones y joins |
| ❌ No hay transacciones | ✅ Transacciones ACID |

## Soporte

Si tienes problemas durante la configuración, comparte:
- El error que ves
- En qué paso estás
- Capturas de pantalla si es necesario

