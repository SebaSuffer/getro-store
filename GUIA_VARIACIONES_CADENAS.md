# Guía: Cómo Añadir Variaciones de Cadena

## Pasos para ver el selector de variaciones:

### 1. Crear o Editar un Producto tipo "Cadenas"

1. Ve al **Panel de Administración**
2. Haz clic en **"+ Crear Producto"** (o edita uno existente)
3. En el campo **"Categoría"**, selecciona **"Cadenas"** (no "Colgantes")

### 2. Guardar el Producto Primero

1. Completa los campos básicos:
   - Nombre del Producto
   - Descripción
   - Precio
   - Stock
   - URL de la Imagen
2. Haz clic en **"Guardar"**

### 3. Añadir Variaciones

**Después de guardar**, verás:
- Una sección **"Tipo de Material"** (Plata 925 u Oro)
- Una sección **"Gestionar Variaciones de Cadena"** con:
  - Selector de **Marca** (BARBADA, TRADICIONAL, GUCCI, CARTIER, TURBILLON)
  - Selector de **Grosor** (depende de la marca)
  - Selector de **Largo** (depende del grosor)
  - Campos de **Stock** y **Modificador de Precio**

### 4. Añadir Variaciones

1. Selecciona **Marca** → **Grosor** → **Largo**
2. Ingresa el **Stock** y **Modificador de Precio** (opcional)
3. Haz clic en **"Añadir"**
4. La variación se guarda automáticamente

## ⚠️ Importante

- El selector **SOLO aparece** para productos tipo **"Cadenas"**
- El producto debe estar **guardado primero** (no puede tener ID temporal)
- Si estás editando un "Colgante", no verás el selector (es normal)

## Verificar Productos tipo "Cadenas"

Ejecuta esta query en Turso para ver si tienes productos tipo "Cadenas":

```sql
SELECT id, name, category FROM products WHERE category = 'Cadenas';
```

Si no hay productos tipo "Cadenas", créalos desde el admin panel seleccionando "Cadenas" en la categoría.

