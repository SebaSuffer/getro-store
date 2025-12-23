/**
 * Helper function to get the correct image URL
 * Ensures images work correctly in both development and production (Vercel)
 */
export const getImageUrl = (imagePath: string): string => {
  // Si la ruta ya empieza con /, usarla directamente
  if (imagePath.startsWith('/')) {
    return imagePath;
  }
  
  // Si no, agregar /images/ al inicio
  if (!imagePath.startsWith('/images/')) {
    return `/images/${imagePath}`;
  }
  
  return imagePath;
};

/**
 * Get image URL with fallback
 */
export const getImageUrlWithFallback = (imagePath: string, fallback: string = '/images/DSC05016.jpg'): string => {
  const url = getImageUrl(imagePath);
  // En producción, si la imagen no existe, usar fallback
  return url || fallback;
};

