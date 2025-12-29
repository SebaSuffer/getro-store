# Instrucciones para Añadir Variaciones de Productos

Este documento explica cómo ejecutar las queries SQL necesarias para añadir el sistema de variaciones de productos a la base de datos.

## Pasos a Seguir

### 1. Añadir la Tabla de Variaciones

Si tu base de datos ya tiene datos, ejecuta primero:

```bash
# Ejecutar en Turso CLI o en tu herramienta de gestión de BD
turso db shell <nombre-de-tu-db> < turso/add-variations-schema.sql
```

O si prefieres copiar y pegar el contenido de `add-variations-schema.sql` directamente en el shell de Turso.

### 2. Añadir Variaciones por Defecto a Cadenas Existentes

Si ya tienes productos de categoría "Cadenas" en tu base de datos, ejecuta:

```bash
turso db shell <nombre-de-tu-db> < turso/add-default-variations.sql
```

Esto creará una variación por defecto (plata 925) para cada cadena existente.

### 3. Añadir Productos del Inventario

Para añadir todos los productos del inventario con sus precios:

```bash
turso db shell <nombre-de-tu-db> < turso/migrate-inventory-products.sql
```

**IMPORTANTE:** 
- Los precios están basados en "VENTA UND" del inventario
- El stock está basado en "Cantidad en existencias"
- Las URLs de imágenes son placeholders - debes actualizarlas con las URLs reales de Cloudinary
- Verifica los precios y stocks antes de ejecutar en producción

### 4. Verificar

Puedes verificar que todo se haya creado correctamente ejecutando:

```sql
-- Ver todas las variaciones
SELECT * FROM product_variations;

-- Ver productos con sus variaciones
SELECT p.id, p.name, p.category, pv.chain_type, pv.is_active
FROM products p
LEFT JOIN product_variations pv ON p.id = pv.product_id
WHERE p.category = 'Cadenas';
```

## Notas Importantes

- **Variaciones de Oro**: Por ahora, las variaciones de oro están configuradas con `is_active = 0`, por lo que no se mostrarán en la tienda. Cuando estés listo para mostrarlas, cambia `is_active = 1` en la tabla `product_variations`.

- **Largos y Grosores**: Los campos `length` y `thickness` están configurados como `NULL` por ahora, ya que el cliente aún no ha proporcionado estos datos. Cuando los tengas, puedes actualizarlos desde el panel de administración o directamente en la base de datos.

- **Panel de Administración**: Al crear o editar un producto de categoría "Cadenas", ahora verás un campo "Tipo de Cadena" donde puedes seleccionar entre "Plata 925" (visible) u "Oro" (no visible aún).

## Estructura de la Tabla de Variaciones

```sql
product_variations
├── id (TEXT PRIMARY KEY) - ID único de la variación
├── product_id (TEXT) - ID del producto relacionado
├── chain_type (TEXT) - Tipo: 'plata_925' o 'oro'
├── length (TEXT) - Largo de la cadena (pendiente)
├── thickness (TEXT) - Grosor de la cadena (pendiente)
├── price_modifier (INTEGER) - Modificador de precio (+/-)
├── stock (INTEGER) - Stock específico de esta variación
├── is_active (INTEGER) - 1 = visible, 0 = oculto
├── created_at (DATETIME)
└── updated_at (DATETIME)
```

