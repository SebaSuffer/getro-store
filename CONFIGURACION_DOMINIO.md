# Configuración de Dominio en Vercel

## Pasos para conectar tu dominio personalizado

### 1. En el Dashboard de Vercel

1. Ve a tu proyecto en [Vercel Dashboard](https://vercel.com/dashboard)
2. Haz clic en **Settings** (Configuración)
3. Ve a la sección **Domains** (Dominios)
4. Ingresa tu dominio (ej: `gotra.cl` o `www.gotra.cl`)
5. Haz clic en **Add** (Agregar)

### 2. Configurar DNS en tu proveedor de dominio

Vercel te mostrará los registros DNS que debes agregar. Típicamente necesitarás:

#### Opción A: Dominio raíz (ej: gotra.cl)
```
Tipo: A
Nombre: @
Valor: 76.76.21.21
```

#### Opción B: Subdominio www (ej: www.gotra.cl)
```
Tipo: CNAME
Nombre: www
Valor: cname.vercel-dns.com
```

### 3. Verificar la configuración

- Vercel verificará automáticamente los registros DNS
- Esto puede tomar entre unos minutos hasta 48 horas
- Una vez verificado, verás un check verde en el dashboard

### 4. SSL Automático

- Vercel proporciona certificados SSL automáticamente
- No necesitas configurar nada adicional
- El sitio estará disponible en HTTPS automáticamente

## Notas importantes

- **No elimines** los registros DNS existentes hasta que Vercel confirme la conexión
- Si tienes problemas, verifica que los registros DNS estén correctamente configurados
- Puedes usar herramientas como [whatsmydns.net](https://www.whatsmydns.net) para verificar la propagación DNS

