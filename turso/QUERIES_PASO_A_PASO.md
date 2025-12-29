# Queries SQL para Ejecutar Paso a Paso

## Paso 1: Verificar si la tabla product_variations existe

```sql
SELECT name FROM sqlite_master WHERE type='table' AND name='product_variations';
```

**Si retorna la tabla:** Continúa al Paso 2
**Si NO retorna nada:** Ejecuta primero el schema completo (Paso 0)

---

## Paso 0 (Solo si la tabla NO existe): Crear la tabla completa

```sql
CREATE TABLE IF NOT EXISTS product_variations (
  id TEXT PRIMARY KEY,
  product_id TEXT NOT NULL,
  chain_type TEXT NOT NULL DEFAULT 'plata_925',
  brand TEXT,
  thickness TEXT,
  length TEXT,
  price_modifier INTEGER DEFAULT 0,
  stock INTEGER NOT NULL DEFAULT 0,
  is_active INTEGER NOT NULL DEFAULT 1,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
);
```

Luego ejecuta:

```sql
CREATE INDEX IF NOT EXISTS idx_product_variations_product ON product_variations(product_id);
CREATE INDEX IF NOT EXISTS idx_product_variations_active ON product_variations(is_active);
CREATE INDEX IF NOT EXISTS idx_product_variations_brand ON product_variations(brand);
```

---

## Paso 2: Verificar si el campo 'brand' ya existe

```sql
PRAGMA table_info(product_variations);
```

**Busca en los resultados si hay una columna llamada 'brand'**

**Si NO existe 'brand':** Continúa al Paso 3
**Si YA existe 'brand':** Ya está listo, puedes saltar al Paso 4

---

## Paso 3: Añadir el campo 'brand' (Solo si no existe)

SQLite no soporta `ALTER TABLE ADD COLUMN IF NOT EXISTS`, así que primero verifica con el Paso 2.

Si el campo NO existe, ejecuta:

```sql
ALTER TABLE product_variations ADD COLUMN brand TEXT;
```

---

## Paso 4: Verificar que todo esté correcto

```sql
PRAGMA table_info(product_variations);
```

Deberías ver todas las columnas incluyendo `brand`.

---

## Paso 5: Verificar productos de tipo Cadenas

```sql
SELECT id, name, category FROM products WHERE category = 'Cadenas';
```

---

## Paso 6: Ver variaciones existentes (si hay)

```sql
SELECT * FROM product_variations;
```

---

## ✅ Listo!

Una vez completados estos pasos, podrás:
- Crear productos de tipo "Cadenas" desde el admin
- Añadir variaciones con marca, grosor y largo desde el gestor de variaciones
- Ver las variaciones en la página de producto

