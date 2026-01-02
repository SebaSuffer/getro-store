## Orden de ejecución de scripts SQL

Ejecuta estos scripts en Turso en este orden:

### 1. `schema.sql`
Crea las tablas principales (products, product_variations, etc.)

### 2. `SETUP_COMPLETO_FINAL.sql`
Configura la tabla `product_variations` y añade la columna `brand` si falta

### 3. `create_categories_table.sql`
Crea la tabla `categories` e inserta las categorías iniciales

### 4. `create_product_images_table.sql`
Crea la tabla `product_images` para múltiples imágenes por producto

### 5. `add_display_price_column.sql`
Añade la columna `display_price` a la tabla `products`

### 6. `create_chains_table.sql`
Crea las tablas `chains` y `pendant_chain_options` para el nuevo sistema de cadenas

### 7. `migrate_chains_to_new_system.sql`
**IMPORTANTE**: Este script:
- Elimina todas las cadenas antiguas de la tabla `products`
- Elimina todas las variaciones relacionadas con cadenas
- Elimina imágenes de cadenas
- Inserta las cadenas en la nueva tabla `chains` por marca

### 8. `add_default_plata925_chain_to_pendants.sql`
Este script:
- Agrega la cadena "PLATA 925" por defecto a todos los colgantes que no tienen variaciones
- Crea la relación en `pendant_chain_options`
- Calcula el precio total (colgante + cadena) y lo guarda como variación

---

## Resumen rápido

```
1. schema.sql
2. SETUP_COMPLETO_FINAL.sql
3. create_categories_table.sql
4. create_product_images_table.sql
5. add_display_price_column.sql
6. create_chains_table.sql
7. migrate_chains_to_new_system.sql (elimina cadenas antiguas y crea nuevas)
8. add_default_plata925_chain_to_pendants.sql (agrega cadena por defecto a colgantes)
```

---

## Notas importantes

- ⚠️ **El script `migrate_chains_to_new_system.sql` elimina todas las cadenas existentes**. Asegúrate de tener una copia de seguridad si necesitas los datos antiguos.
- Ejecuta uno por uno en el orden indicado
- Si aparece "duplicate column" o "already exists", es normal; continúa
- Los scripts usan `IF NOT EXISTS`, así que son seguros de ejecutar varias veces
- Después de ejecutar `migrate_chains_to_new_system.sql`, las cadenas estarán en la nueva tabla `chains` y podrás gestionarlas desde la pestaña "Cadenas" en el admin

