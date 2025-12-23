// Funciones para manejar stock usando Turso

// Obtener stock de un producto
export const getProductStock = async (productId: string): Promise<number> => {
  try {
    const response = await fetch(`/api/stock/${productId}`);
    if (!response.ok) {
      return 0;
    }
    const data = await response.json();
    return data.stock || 0;
  } catch (error) {
    console.error('Error fetching stock:', error);
    return 0;
  }
};

// Versión síncrona (devuelve 0 si no hay cache)
export const getProductStockSync = (productId: string): number => {
  // Esta función se mantiene para compatibilidad pero devuelve 0
  // Los componentes deberían usar la versión async
  return 0;
};

// Actualizar stock de un producto
export const updateProductStock = async (
  productId: string, 
  quantity: number, 
  changeType: 'sale' | 'restock' | 'adjustment' = 'adjustment'
): Promise<boolean> => {
  try {
    const response = await fetch(`/api/stock/${productId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ quantity, change_type: changeType }),
    });
    return response.ok;
  } catch (error) {
    console.error('Error updating stock:', error);
    return false;
  }
};

// Validar si hay stock suficiente
export const hasStock = async (productId: string, quantity: number): Promise<boolean> => {
  const stock = await getProductStock(productId);
  return stock >= quantity;
};

// Obtener productos con stock actualizado
export const getProductsWithStock = async (products: any[]): Promise<any[]> => {
  // Los productos ya vienen con stock desde la API
  return products;
};

// Resetear stock (no aplica con BD, pero mantenemos la función para compatibilidad)
export const resetStock = async (): Promise<void> => {
  // No hacer nada, el stock se maneja en la BD
  console.warn('resetStock() no aplica con base de datos');
};
