# 📋 ORDEN DE EJECUCIÓN DE SCRIPTS SQL EN TURSO

Ejecuta estos scripts **en este orden exacto** en el dashboard de Turso:

---

## ✅ **PASO 1: Schema Base (Tablas Principales)**
**Archivo:** `schema.sql`

Este script crea todas las tablas principales:
- `products` (productos)
- `product_variations` (variaciones de productos)
- `stock_history` (historial de stock)
- `orders` (órdenes)
- `newsletter_subscribers` (suscriptores)

**⚠️ IMPORTANTE:** Si ya tienes estas tablas, puedes saltarte este paso o ejecutarlo de todas formas (usa `CREATE TABLE IF NOT EXISTS`).

---

## ✅ **PASO 2: Configurar Tabla de Variaciones**
**Archivo:** `SETUP_COMPLETO_FINAL.sql`

Este script:
- Verifica si existe la tabla `product_variations`
- Añade la columna `brand` si no existe
- Crea los índices necesarios

**💡 Nota:** Si ves un error "duplicate column name: brand", es normal, significa que ya existe.

---

## ✅ **PASO 3: Tabla de Categorías**
**Archivo:** `create_categories_table.sql`

Crea la tabla `categories` e inserta las categorías iniciales:
- Cadenas, Pulseras, Anillos, Colgantes, Aros, Esclavas

---

## ✅ **PASO 4: Tabla de Imágenes de Productos**
**Archivo:** `create_product_images_table.sql`

Crea la tabla `product_images` para múltiples imágenes por producto.
También migra las imágenes principales existentes.

---

## ✅ **PASO 5: Columna de Precio de Exhibición**
**Archivo:** `add_display_price_column.sql`

Añade la columna `display_price` a la tabla `products` para almacenar precios redondeados.

---

## ✅ **PASO 6: Variaciones por Defecto para Colgantes**
**Archivo:** `add_default_chain_variation.sql`

Añade una variación por defecto "Plata 925" a todos los colgantes que no tengan variaciones.

**💡 Nota:** El precio de la cadena base es $20.250 CLP. Si necesitas cambiarlo, edita el valor `20250` en el script antes de ejecutarlo.

---

## ✅ **PASO 7: Insertar Cadenas del Excel**
**Archivo:** `insert_chains_from_excel.sql`

Inserta las cadenas pre-hechas en el stock:
- Cadena Cartier 3mm × 60cm
- Cadena Tradicional 3.6mm × 50cm
- Cadena Grumet 3mm × 60cm
- Cadena Marina

**💡 Nota:** Todas se insertan con precio 0 para que las agregues después desde el admin panel.

---

## 🎯 **RESUMEN RÁPIDO:**

```
1. schema.sql
2. SETUP_COMPLETO_FINAL.sql
3. create_categories_table.sql
4. create_product_images_table.sql
5. add_display_price_column.sql
6. add_default_chain_variation.sql
7. insert_chains_from_excel.sql
```

---

## ⚠️ **IMPORTANTE:**

- Ejecuta los scripts **uno por uno** en el orden indicado
- Si algún script da error de "ya existe", es normal, continúa con el siguiente
- Después de ejecutar todos, verifica que las tablas se crearon correctamente
- Los scripts usan `IF NOT EXISTS` y `INSERT OR IGNORE`, así que son seguros de ejecutar múltiples veces

---

## 🔍 **VERIFICACIÓN FINAL:**

Después de ejecutar todos los scripts, verifica que tienes estas tablas:
- ✅ `products`
- ✅ `product_variations`
- ✅ `categories`
- ✅ `product_images`
- ✅ `stock_history`
- ✅ `orders`
- ✅ `newsletter_subscribers`

