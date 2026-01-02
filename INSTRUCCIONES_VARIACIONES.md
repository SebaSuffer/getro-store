# Instrucciones para Configurar Variaciones

## ⚠️ IMPORTANTE: Ejecutar Script SQL

Para que todos los colgantes tengan la variación PLATA 925 por defecto, debes ejecutar el siguiente script SQL en tu base de datos Turso:

### Archivo: `turso/ensure_all_pendants_have_plata925.sql`

Este script:
1. Crea la cadena "PLATA 925" si no existe
2. Agrega "PLATA 925" a TODOS los colgantes que no la tengan
3. Muestra un resumen de las variaciones por producto

### Cómo ejecutarlo:

1. Abre tu consola de Turso o tu herramienta de gestión de base de datos
2. Copia y pega el contenido completo del archivo `turso/ensure_all_pendants_have_plata925.sql`
3. Ejecuta el script completo

### Verificación:

Después de ejecutar el script, deberías ver una tabla con todos los colgantes y sus variaciones. Cada colgante debe tener al menos "PLATA 925" en la columna "cadenas".

## ✅ Cambios Implementados

### 1. Auto-carga de Variaciones Existentes
- Al editar un colgante, se cargan automáticamente las cadenas ya seleccionadas
- Si un colgante no tiene variaciones, se agrega automáticamente "PLATA 925"

### 2. Prevención de Duplicados
- No se puede seleccionar la misma cadena dos veces
- Se muestra un mensaje si intentas agregar una cadena duplicada

### 3. Visualización de Variaciones Actuales
- Se muestra un recuadro azul con las variaciones actuales del producto
- Indica cuántas variaciones tiene el producto

### 4. Validación Mínima
- No se puede guardar sin al menos una cadena seleccionada
- No se puede deseleccionar la última cadena

### 5. Columna de Variaciones en Admin
- La tabla de productos ahora muestra una columna "Variaciones"
- Muestra el número de variaciones por colgante (default: 1)

## 🔄 Después de Ejecutar el Script

1. Recarga la página del admin
2. Edita cualquier colgante
3. Deberías ver "PLATA 925" ya seleccionada en la sección de Variaciones
4. En la landing, las variaciones deberían aparecer y auto-seleccionarse automáticamente

## ❓ Si Algo No Funciona

1. Verifica que ejecutaste el script SQL completo
2. Verifica que la cadena "PLATA 925" existe en la tabla `chains`
3. Verifica que los colgantes tienen entradas en `pendant_chain_options`
4. Revisa la consola del navegador para errores
5. Limpia la caché del navegador (Ctrl+Shift+R)

