# GOTRA - Tienda de Joyería

Tienda online de joyería fina desarrollada con Astro, React y TailwindCSS.

## 🚀 Características

- **Catálogo de productos** con filtros por categoría
- **Carrito de compras** con gestión de stock
- **Panel de administración** para gestión de productos
- **Sistema de newsletter** para suscriptores
- **Diseño elegante y responsive**
- **Optimizado para Vercel**

## 🛠️ Tecnologías

- [Astro](https://astro.build/) - Framework web
- [React](https://react.dev/) - Librería UI
- [TailwindCSS](https://tailwindcss.com/) - Estilos
- [TypeScript](https://www.typescriptlang.org/) - Tipado estático
- [Vercel](https://vercel.com/) - Hosting y deployment

## 📦 Instalación

```bash
# Instalar dependencias
npm install

# Ejecutar en desarrollo
npm run dev

# Construir para producción
npm run build

# Preview de producción
npm run preview
```

## 📁 Estructura del Proyecto

```
├── public/          # Archivos estáticos (imágenes, robots.txt)
├── src/
│   ├── components/ # Componentes React y Astro
│   ├── data/       # Datos de productos
│   ├── layouts/    # Layouts base
│   ├── pages/      # Páginas de la aplicación
│   ├── styles/     # Estilos globales
│   └── utils/      # Utilidades (carrito, stock, auth, newsletter)
├── astro.config.mjs
├── tailwind.config.mjs
└── package.json
```

## 🌐 Deployment

El proyecto está configurado para desplegarse en Vercel. Simplemente conecta tu repositorio de GitHub a Vercel.

## 📝 Notas

- Los productos se gestionan desde el panel de administración
- El stock se actualiza automáticamente al realizar compras
- Los suscriptores del newsletter se pueden exportar como JSON
