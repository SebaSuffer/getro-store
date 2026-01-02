export interface Category {
  id: string;
  name: string;
  image_url: string;
  image_alt: string;
  display_order: number;
  is_active: boolean;
}

let categoriesCache: Category[] | null = null;
let cacheTimestamp: number = 0;
const CACHE_DURATION = 300000;

export const getAllCategories = async (): Promise<Category[]> => {
  if (typeof window === 'undefined') {
    try {
      const { getTursoClient } = await import('./turso');
      const client = getTursoClient();
      if (!client) return [];
      const result = await client.execute(`SELECT * FROM categories WHERE is_active = 1 ORDER BY display_order ASC, name ASC`);
      return result.rows.map((row: any) => ({
        id: row.id,
        name: row.name,
        image_url: row.image_url,
        image_alt: row.image_alt || row.name,
        display_order: row.display_order,
        is_active: Boolean(row.is_active),
      }));
    } catch (error: any) {
      console.error('[CATEGORIES-SERVER] Error:', error);
      return [];
    }
  }
  try {
    if (categoriesCache && Date.now() - cacheTimestamp < CACHE_DURATION) return categoriesCache;
    const response = await fetch('/api/categories');
    if (!response.ok) throw new Error(`Failed: ${response.status}`);
    const categories = await response.json();
    categoriesCache = categories;
    cacheTimestamp = Date.now();
    return categories;
  } catch (error: any) {
    console.error('[CATEGORIES-CLIENT] Error:', error);
    return categoriesCache || [];
  }
};

export const updateCategoryImage = async (id: string, imageUrl: string, imageAlt?: string): Promise<boolean> => {
  try {
    const response = await fetch('/api/categories', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, image_url: imageUrl, image_alt: imageAlt }),
    });
    if (!response.ok) throw new Error(`Failed: ${response.status}`);
    categoriesCache = null;
    cacheTimestamp = 0;
    return true;
  } catch (error: any) {
    console.error('[CATEGORIES] Error:', error);
    return false;
  }
};
