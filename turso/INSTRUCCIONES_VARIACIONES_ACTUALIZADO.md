# Instrucciones para Sistema de Variaciones de Cadenas (Actualizado)

## 🎯 Sistema de Variaciones por Marca y Tamaño

El sistema ahora permite gestionar variaciones de cadenas con:
- **Marca**: BARBADA, TRADICIONAL, GUCCI, CARTIER, TURBILLON
- **Grosor**: Según la marca seleccionada (ej: 2.4MM, 3MM, 4MM, etc.)
- **Largo**: Según el grosor seleccionado (ej: 45CM, 50CM, 60CM, etc.)

## 📋 Pasos para Configurar

### 1. Actualizar Schema de Base de Datos

Si tu base de datos ya tiene la tabla `product_variations` sin el campo `brand`, ejecuta:

```bash
turso db shell <nombre-de-tu-db> < turso/add-brand-to-variations.sql
```

O si es una base de datos nueva, el schema ya incluye el campo `brand`.

### 2. Añadir Variaciones desde el Panel de Administración

1. **Crear o editar un producto de categoría "Cadenas"**
2. **Seleccionar tipo de material** (Plata 925 u Oro)
3. **Después de guardar el producto**, aparecerá el gestor de variaciones
4. **Añadir variaciones:**
   - Seleccionar **Marca** (BARBADA, TRADICIONAL, GUCCI, CARTIER, TURBILLON)
   - Seleccionar **Grosor** (se actualiza según la marca)
   - Seleccionar **Largo** (se actualiza según el grosor)
   - Añadir **Stock** y **Modificador de Precio** (opcional)
   - Click en **"Añadir"**

### 3. Opciones Disponibles por Marca

#### BARBADA
- 2.4MM: 45CM, 50CM, 60CM
- 3MM: 50CM, 60CM, 70CM
- 4MM: 55CM
- 7.1MM: 55CM

#### TRADICIONAL
- 1.5MM: 45CM, 50CM, 60CM
- 3.6MM: 50CM, 70CM
- 4.4MM: 60CM, 70CM

#### GUCCI
- 1.8MM: 45CM, 50CM
- 4MM: 50CM, 60CM

#### CARTIER
- 2MM: 45CM, 50CM, 60CM
- 4.6MM: 50CM, 60CM, 70CM
- 6MM: 55CM, 70CM

#### TURBILLON
- 1MM: 45CM, 50CM, 60CM
- 2MM: 50CM, 60CM, 70CM
- 2.8MM: 50CM, 60CM, 70CM

## 🎨 Experiencia del Cliente

En la página de producto de una cadena, el cliente verá:

1. **Selector de variaciones** similar a un selector de tallas
2. **Botones agrupados por marca** mostrando las opciones disponibles
3. **Indicadores visuales:**
   - Botones seleccionados en negro
   - Botones sin stock tachados y deshabilitados
   - Información de stock y precio actualizado

4. **Precio dinámico:** El precio se actualiza según la variación seleccionada (si tiene modificador)

## 🔧 Estructura de la Base de Datos

```sql
product_variations
├── id (TEXT PRIMARY KEY)
├── product_id (TEXT) - ID del producto
├── chain_type (TEXT) - 'plata_925' o 'oro'
├── brand (TEXT) - Marca: 'BARBADA', 'TRADICIONAL', 'GUCCI', 'CARTIER', 'TURBILLON'
├── thickness (TEXT) - Grosor: '2.4MM', '3MM', etc.
├── length (TEXT) - Largo: '45CM', '50CM', etc.
├── price_modifier (INTEGER) - Modificador de precio (+/-)
├── stock (INTEGER) - Stock específico de esta variación
├── is_active (INTEGER) - 1 = visible, 0 = oculto
├── created_at (DATETIME)
└── updated_at (DATETIME)
```

## 📝 Notas Importantes

- **Las variaciones solo se pueden añadir DESPUÉS de crear el producto**
- **Cada combinación de marca + grosor + largo es una variación única**
- **El stock se gestiona por variación, no por producto**
- **El precio base del producto + modificador de variación = precio final**
- **Las variaciones de oro están configuradas como `is_active = 0` por defecto**

## 🚀 Próximos Pasos

1. Ejecutar `add-brand-to-variations.sql` si la tabla ya existe
2. Crear productos de tipo "Cadenas" desde el admin
3. Añadir variaciones manualmente para cada cadena
4. Las variaciones aparecerán automáticamente en la página de producto

