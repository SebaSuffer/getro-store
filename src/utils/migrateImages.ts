/**
 * Utilidad para migrar URLs de imágenes antiguas a Cloudinary
 * Se ejecuta una vez al cargar la aplicación para limpiar datos antiguos
 */

const CLOUDINARY_BASE = 'https://res.cloudinary.com/ddzoh72zv/image/upload/f_auto,q_auto';

// Mapeo de imágenes antiguas a nuevas URLs de Cloudinary
const IMAGE_MIGRATION_MAP: Record<string, string> = {
  '/images/dsc05016.jpg': `${CLOUDINARY_BASE}/v1766458847/DSC05016_dwuz7c.jpg`,
  '/images/dsc05015.jpg': `${CLOUDINARY_BASE}/v1766458847/DSC05015_kiamyb.jpg`,
  '/images/dsc05014.jpg': `${CLOUDINARY_BASE}/v1766458847/DSC05014_tpyofl.jpg`,
  '/images/dsc05013.jpg': `${CLOUDINARY_BASE}/v1766458846/DSC05013_ls4kjv.jpg`,
  '/images/dsc05012.jpg': `${CLOUDINARY_BASE}/v1766458846/DSC05012_bbchhj.jpg`,
  '/images/dsc05010.jpg': `${CLOUDINARY_BASE}/v1766458846/DSC05010_zfxyxv.jpg`,
  '/images/dsc05008.jpg': `${CLOUDINARY_BASE}/v1766458846/DSC05008_clyhgx.jpg`,
  '/images/dsc05007.jpg': `${CLOUDINARY_BASE}/v1766458845/DSC05007_pbianr.jpg`,
  '/images/dsc05006.jpg': `${CLOUDINARY_BASE}/v1766458845/DSC05006_r56buj.jpg`,
  '/images/dsc05005.jpg': `${CLOUDINARY_BASE}/v1766458845/DSC05005_vz2ss2.jpg`,
  '/images/dsc05004.jpg': `${CLOUDINARY_BASE}/v1766458845/DSC05004_awkvea.jpg`,
  '/images/dsc05003.jpg': `${CLOUDINARY_BASE}/v1766458845/DSC05003_n0s54y.jpg`,
  '/images/Mercado-Pago-Logo.png': `${CLOUDINARY_BASE}/v1766458849/Mercado-Pago-Logo_kvhgin.png`,
  '/images/Transbank-1200px-logo.png': `${CLOUDINARY_BASE}/v1766458837/Transbank-1200px-logo_ljg48x.png`,
  '/images/transferencia-logo.png': `${CLOUDINARY_BASE}/v1766458838/transferencia-logo_fzj0gc.png`,
};

/**
 * Migra una URL de imagen antigua a Cloudinary
 */
export const migrateImageUrl = (oldUrl: string): string => {
  if (!oldUrl) return oldUrl;
  
  // Si ya es una URL de Cloudinary, no hacer nada
  if (oldUrl.includes('cloudinary.com')) return oldUrl;
  
  // Si es una ruta local antigua, migrarla
  const normalizedUrl = oldUrl.toLowerCase();
  for (const [oldPath, newUrl] of Object.entries(IMAGE_MIGRATION_MAP)) {
    if (normalizedUrl.includes(oldPath.toLowerCase())) {
      return newUrl;
    }
  }
  
  // Si no se encuentra en el mapa, devolver la original
  return oldUrl;
};

/**
 * Migra todos los productos editados en localStorage
 * Se ejecuta una vez al iniciar la aplicación
 */
export const migrateEditedProducts = (): void => {
  if (typeof window === 'undefined') return;
  
  try {
    const editedProducts = JSON.parse(localStorage.getItem('gotra_edited_products') || '{}');
    let hasChanges = false;
    
    for (const productId in editedProducts) {
      const product = editedProducts[productId];
      if (product && product.image_url) {
        const migratedUrl = migrateImageUrl(product.image_url);
        if (migratedUrl !== product.image_url) {
          product.image_url = migratedUrl;
          hasChanges = true;
        }
      }
    }
    
    if (hasChanges) {
      localStorage.setItem('gotra_edited_products', JSON.stringify(editedProducts));
      console.log('✅ Productos editados migrados a Cloudinary');
    }
  } catch (error) {
    console.error('Error migrando productos editados:', error);
  }
};

/**
 * Limpia productos editados con URLs antiguas
 * Útil para forzar una limpieza completa
 */
export const clearOldEditedProducts = (): void => {
  if (typeof window === 'undefined') return;
  localStorage.removeItem('gotra_edited_products');
  console.log('✅ Productos editados antiguos eliminados');
};

