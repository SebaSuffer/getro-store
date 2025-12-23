import { useState, useEffect } from 'react';
import { isAuthenticated, logout, getCurrentUser } from '../utils/auth';
import { getAllProducts } from '../data/products';
import { getSubscribers, exportSubscribers } from '../utils/newsletter';
import type { Product } from '../data/products';
import Toast from './Toast';

const AdminPanel = () => {
  const [authenticated, setAuthenticated] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [subscribers, setSubscribers] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState<'products' | 'newsletter'>('products');
  const [toastMessage, setToastMessage] = useState('');
  const [showToast, setShowToast] = useState(false);
  const [selectedProducts, setSelectedProducts] = useState<Set<string>>(new Set());

  useEffect(() => {
    const checkAuth = () => {
      const auth = isAuthenticated();
      setAuthenticated(auth);
      if (auth) {
        setUser(getCurrentUser());
        loadProducts();
        loadSubscribers();
      } else {
        window.location.href = '/login';
      }
    };

    checkAuth();
  }, []);

  const loadProducts = () => {
    // getAllProducts() ya maneja productos editados y eliminados desde localStorage
    const allProducts = getAllProducts();
    setProducts(allProducts);
    setFilteredProducts(allProducts);
  };

  // Filtrar productos por búsqueda
  useEffect(() => {
    if (!searchQuery.trim()) {
      setFilteredProducts(products);
      return;
    }

    const query = searchQuery.toLowerCase().trim();
    const filtered = products.filter((product) => {
      return (
        product.name.toLowerCase().includes(query) ||
        product.category.toLowerCase().includes(query) ||
        (product.description && product.description.toLowerCase().includes(query)) ||
        product.id.toLowerCase().includes(query)
      );
    });
    setFilteredProducts(filtered);
  }, [searchQuery, products]);

  const loadSubscribers = () => {
    const subs = getSubscribers();
    setSubscribers(subs);
  };

  const handleLogout = () => {
    logout();
    window.location.href = '/login';
  };

  const handleEditProduct = (product: Product) => {
    setSelectedProduct(product);
    setEditingProduct({ ...product });
  };

  const handleDeleteProduct = (productId: string) => {
    if (!confirm('¿Estás seguro de que deseas eliminar este producto?')) {
      return;
    }

    // Marcar producto como eliminado en localStorage
    const deletedProducts = JSON.parse(localStorage.getItem('gotra_deleted_products') || '[]');
    if (!deletedProducts.includes(productId)) {
      deletedProducts.push(productId);
      localStorage.setItem('gotra_deleted_products', JSON.stringify(deletedProducts));
    }

    // Eliminar de productos editados si existe
    const editedProducts = JSON.parse(localStorage.getItem('gotra_edited_products') || '{}');
    delete editedProducts[productId];
    localStorage.setItem('gotra_edited_products', JSON.stringify(editedProducts));

    // Disparar evento para que otras páginas sepan que deben recargar
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('productDeleted', { detail: { productId } }));
    }

    // Actualizar lista
    loadProducts();
    setSelectedProducts(new Set());
    setToastMessage('Producto eliminado correctamente');
    setShowToast(true);
  };

  const handleDeleteSelected = () => {
    if (selectedProducts.size === 0) {
      setToastMessage('Selecciona al menos un producto para eliminar');
      setShowToast(true);
      return;
    }

    if (!confirm(`¿Estás seguro de que deseas eliminar ${selectedProducts.size} producto(s)?`)) {
      return;
    }

    // Marcar productos como eliminados
    const deletedProducts = JSON.parse(localStorage.getItem('gotra_deleted_products') || '[]');
    const editedProducts = JSON.parse(localStorage.getItem('gotra_edited_products') || '{}');

    selectedProducts.forEach((productId) => {
      if (!deletedProducts.includes(productId)) {
        deletedProducts.push(productId);
      }
      delete editedProducts[productId];
    });

    localStorage.setItem('gotra_deleted_products', JSON.stringify(deletedProducts));
    localStorage.setItem('gotra_edited_products', JSON.stringify(editedProducts));

    // Disparar eventos
    if (typeof window !== 'undefined') {
      selectedProducts.forEach((productId) => {
        window.dispatchEvent(new CustomEvent('productDeleted', { detail: { productId } }));
      });
    }

    // Actualizar lista
    loadProducts();
    setSelectedProducts(new Set());
    setToastMessage(`${selectedProducts.size} producto(s) eliminado(s) correctamente`);
    setShowToast(true);
  };

  const handleToggleSelect = (productId: string) => {
    const newSelected = new Set(selectedProducts);
    if (newSelected.has(productId)) {
      newSelected.delete(productId);
    } else {
      newSelected.add(productId);
    }
    setSelectedProducts(newSelected);
  };

  const handleSelectAll = () => {
    if (selectedProducts.size === filteredProducts.length) {
      setSelectedProducts(new Set());
    } else {
      setSelectedProducts(new Set(filteredProducts.map(p => p.id)));
    }
  };

  const handleSaveProduct = () => {
    if (!editingProduct) return;

    // Validar que la URL de la imagen sea válida
    if (editingProduct.image_url && !editingProduct.image_url.startsWith('http://') && !editingProduct.image_url.startsWith('https://')) {
      setToastMessage('Por favor, ingresa una URL válida que comience con http:// o https://');
      setShowToast(true);
      return;
    }

    // Guardar cambios en localStorage
    // Permitir cambiar la URL de la imagen con un link
    const editedProducts = JSON.parse(localStorage.getItem('gotra_edited_products') || '{}');
    const productToSave = {
      ...editingProduct,
      // Guardar la URL de la imagen editada
      image_url: editingProduct.image_url,
      image_alt: editingProduct.image_alt || editingProduct.name,
    };
    editedProducts[editingProduct.id] = productToSave;
    localStorage.setItem('gotra_edited_products', JSON.stringify(editedProducts));

    // Actualizar stock en el sistema de stock
    if (typeof window !== 'undefined') {
      const stockData = JSON.parse(localStorage.getItem('gotra_stock') || '{}');
      stockData[editingProduct.id] = editingProduct.stock;
      localStorage.setItem('gotra_stock', JSON.stringify(stockData));
    }

    // Disparar evento para que otras páginas sepan que deben recargar
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('productUpdated', { detail: { productId: editingProduct.id } }));
    }

    // Actualizar lista
    loadProducts();
    
    // Actualizar el producto seleccionado si es el mismo
    if (selectedProduct && selectedProduct.id === editingProduct.id) {
      setSelectedProduct({ ...editingProduct });
    }
    
    setEditingProduct(null);
    setToastMessage('Producto actualizado correctamente');
    setShowToast(true);
  };

  if (!authenticated) {
      return (
        <div className="py-20 text-center">
          <p className="text-black/60">Verificando autenticación...</p>
        </div>
      );
    }

    return (
      <>
        <Toast 
          message={toastMessage} 
          isVisible={showToast} 
          onClose={() => setShowToast(false)} 
        />
        <div className="py-20">
      <div className="mx-auto max-w-7xl px-6 lg:px-12">
        <div className="mb-12 flex items-center justify-between">
          <div>
            <h1 className="text-4xl sm:text-5xl font-light text-black tracking-[0.05em] uppercase mb-2 font-display">
              Panel de Administración
            </h1>
            <p className="text-black/60 font-light text-sm">
              Bienvenido, {user?.username}
            </p>
          </div>
          <button
            onClick={handleLogout}
            className="px-6 py-2 border border-black/20 text-black text-xs font-light uppercase tracking-[0.2em] hover:border-black/40 transition-colors"
          >
            Cerrar Sesión
          </button>
        </div>

        {/* Tabs */}
        <div className="mb-8 flex gap-4 border-b border-black/10">
          <button
            onClick={() => setActiveTab('products')}
            className={`px-6 py-3 text-xs font-light uppercase tracking-[0.2em] transition-colors border-b-2 ${
              activeTab === 'products'
                ? 'border-black text-black'
                : 'border-transparent text-black/40 hover:text-black/60'
            }`}
          >
            Productos
          </button>
          <button
            onClick={() => setActiveTab('newsletter')}
            className={`px-6 py-3 text-xs font-light uppercase tracking-[0.2em] transition-colors border-b-2 ${
              activeTab === 'newsletter'
                ? 'border-black text-black'
                : 'border-transparent text-black/40 hover:text-black/60'
            }`}
          >
            Newsletter ({subscribers.length})
          </button>
        </div>

        {activeTab === 'products' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Lista de Productos */}
          <div className="lg:col-span-2">
            <div className="mb-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-light text-black uppercase tracking-[0.1em] font-display">
                  Productos
                </h2>
                {selectedProducts.size > 0 && (
                  <button
                    onClick={handleDeleteSelected}
                    className="px-4 py-2 bg-red-600 text-white text-xs font-light uppercase tracking-[0.2em] hover:bg-red-700 transition-colors flex items-center gap-2"
                  >
                    <span className="material-symbols-outlined" style={{ fontSize: '16px', fontWeight: 300 }}>
                      delete
                    </span>
                    Eliminar Seleccionados ({selectedProducts.size})
                  </button>
                )}
              </div>
              {/* Buscador */}
              <div className="relative">
                <input
                  type="text"
                  placeholder="Buscar productos por nombre, categoría o descripción..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-white border border-black/20 px-4 py-3 pl-10 text-black text-sm font-light focus:outline-none focus:border-black/40 transition-colors"
                />
                <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-black/40" style={{ fontSize: '20px', fontWeight: 300 }}>
                  search
                </span>
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-black/40 hover:text-black/60"
                  >
                    <span className="material-symbols-outlined" style={{ fontSize: '20px', fontWeight: 300 }}>
                      close
                    </span>
                  </button>
                )}
              </div>
              {searchQuery && (
                <p className="mt-2 text-xs text-black/60 font-light">
                  {filteredProducts.length} producto{filteredProducts.length !== 1 ? 's' : ''} encontrado{filteredProducts.length !== 1 ? 's' : ''}
                </p>
              )}
            </div>
            <div className="space-y-4 max-h-[600px] overflow-y-auto">
              {filteredProducts.length === 0 ? (
                <div className="text-center py-12 border border-black/10">
                  <p className="text-black/60 font-light text-sm">
                    {searchQuery ? 'No se encontraron productos' : 'No hay productos disponibles'}
                  </p>
                </div>
              ) : (
                <>
                  {/* Checkbox para seleccionar todos */}
                  <div className="flex items-center gap-3 pb-2 border-b border-black/10">
                    <input
                      type="checkbox"
                      checked={selectedProducts.size === filteredProducts.length && filteredProducts.length > 0}
                      onChange={handleSelectAll}
                      className="size-4 text-black focus:ring-black cursor-pointer"
                    />
                    <label className="text-xs font-light uppercase tracking-[0.2em] text-black/60 cursor-pointer">
                      Seleccionar todos ({filteredProducts.length})
                    </label>
                  </div>
                  {filteredProducts.map((product) => (
                    <div
                      key={product.id}
                      className="border border-black/10 p-4 flex items-center gap-4 hover:border-black/20 transition-colors"
                    >
                      {/* Checkbox para selección múltiple */}
                      <input
                        type="checkbox"
                        checked={selectedProducts.has(product.id)}
                        onChange={() => handleToggleSelect(product.id)}
                        className="size-4 text-black focus:ring-black cursor-pointer flex-shrink-0"
                      />
                      {/* Imagen del producto */}
                      <div className="flex-shrink-0 w-20 h-20 overflow-hidden bg-gray-50 border border-black/5">
                        <img
                          src={product.image_url}
                          alt={product.image_alt || product.name}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      {/* Información del producto */}
                      <div className="flex-1 min-w-0">
                        <h3 className="text-sm font-light text-black uppercase tracking-wide mb-1 truncate">
                          {product.name}
                        </h3>
                        <p className="text-xs text-black/60 font-light mb-1">
                          {product.category} • ${product.price.toLocaleString('es-CL')} CLP
                        </p>
                        <p className="text-xs text-black/50 font-light">
                          Stock: {product.stock} unidades
                        </p>
                      </div>
                      <div className="flex items-center gap-2 flex-shrink-0">
                        <button
                          onClick={() => handleEditProduct(product)}
                          className="px-4 py-2 bg-black text-white text-xs font-light uppercase tracking-[0.2em] hover:bg-black/90 transition-colors"
                        >
                          Editar
                        </button>
                        <button
                          onClick={() => handleDeleteProduct(product.id)}
                          className="px-3 py-2 bg-red-600 text-white hover:bg-red-700 transition-colors flex items-center justify-center"
                          aria-label="Eliminar producto"
                        >
                          <span className="material-symbols-outlined" style={{ fontSize: '18px', fontWeight: 300 }}>
                            delete
                          </span>
                        </button>
                      </div>
                    </div>
                  ))}
                </>
              )}
            </div>
          </div>

          {/* Editor de Producto */}
          <div className="lg:col-span-1">
            {editingProduct ? (
              <div className="border border-black/10 p-6">
                <h2 className="text-xl font-light text-black uppercase tracking-[0.1em] mb-6 font-display">
                  Editar Producto
                </h2>
                {/* Imagen del producto */}
                <div className="mb-6">
                  <div className="w-full aspect-square overflow-hidden bg-gray-50 border border-black/5 mb-3">
                    <img
                      src={editingProduct.image_url}
                      alt={editingProduct.image_alt || editingProduct.name}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.src = 'https://via.placeholder.com/400?text=Imagen+no+disponible';
                      }}
                    />
                  </div>
                  <p className="text-xs text-black/60 font-light text-center mb-4">
                    {editingProduct.name}
                  </p>
                  <div>
                    <label className="block text-xs font-light uppercase tracking-[0.2em] text-black mb-2">
                      URL de la Imagen
                    </label>
                    <input
                      type="url"
                      value={editingProduct.image_url}
                      onChange={(e) => setEditingProduct({ ...editingProduct, image_url: e.target.value })}
                      placeholder="https://ejemplo.com/imagen.jpg"
                      className="w-full bg-white border border-black/20 px-4 py-2 text-black text-sm font-light focus:outline-none focus:border-black/40"
                    />
                    <p className="text-[10px] text-black/50 font-light mt-1">
                      Ingresa la URL completa de la imagen (ej: Cloudinary, Imgur, etc.)
                    </p>
                  </div>
                </div>
                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-light uppercase tracking-[0.2em] text-black mb-2">
                      Nombre
                    </label>
                    <input
                      type="text"
                      value={editingProduct.name}
                      onChange={(e) => setEditingProduct({ ...editingProduct, name: e.target.value })}
                      className="w-full bg-white border border-black/20 px-4 py-2 text-black text-sm font-light focus:outline-none focus:border-black/40"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-light uppercase tracking-[0.2em] text-black mb-2">
                      Descripción
                    </label>
                    <textarea
                      value={editingProduct.description || ''}
                      onChange={(e) => setEditingProduct({ ...editingProduct, description: e.target.value })}
                      rows={4}
                      className="w-full bg-white border border-black/20 px-4 py-2 text-black text-sm font-light focus:outline-none focus:border-black/40 resize-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-light uppercase tracking-[0.2em] text-black mb-2">
                      Precio (CLP)
                    </label>
                    <input
                      type="number"
                      value={editingProduct.price}
                      onChange={(e) => setEditingProduct({ ...editingProduct, price: parseInt(e.target.value) || 0 })}
                      className="w-full bg-white border border-black/20 px-4 py-2 text-black text-sm font-light focus:outline-none focus:border-black/40"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-light uppercase tracking-[0.2em] text-black mb-2">
                      Stock
                    </label>
                    <input
                      type="number"
                      value={editingProduct.stock}
                      onChange={(e) => setEditingProduct({ ...editingProduct, stock: parseInt(e.target.value) || 0 })}
                      className="w-full bg-white border border-black/20 px-4 py-2 text-black text-sm font-light focus:outline-none focus:border-black/40"
                    />
                  </div>
                  <div className="flex gap-3">
                    <button
                      onClick={handleSaveProduct}
                      className="flex-1 px-4 py-2 bg-black text-white text-xs font-light uppercase tracking-[0.2em] hover:bg-black/90 transition-colors"
                    >
                      Guardar
                    </button>
                    <button
                      onClick={() => {
                        setEditingProduct(null);
                        setSelectedProduct(null);
                      }}
                      className="flex-1 px-4 py-2 border border-black/20 text-black text-xs font-light uppercase tracking-[0.2em] hover:border-black/40 transition-colors"
                    >
                      Cancelar
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="border border-black/10 p-6 text-center">
                <p className="text-black/60 font-light text-sm">
                  Selecciona un producto para editar
                </p>
              </div>
            )}
          </div>
        </div>
        )}

        {activeTab === 'newsletter' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-light text-black uppercase tracking-[0.1em] font-display">
                Suscriptores ({subscribers.length})
              </h2>
              <button
                onClick={() => {
                  const data = exportSubscribers();
                  const blob = new Blob([data], { type: 'application/json' });
                  const url = URL.createObjectURL(blob);
                  const a = document.createElement('a');
                  a.href = url;
                  a.download = 'suscriptores.json';
                  a.click();
                  URL.revokeObjectURL(url);
                }}
                className="px-4 py-2 bg-black text-white text-xs font-light uppercase tracking-[0.2em] hover:bg-black/90 transition-colors"
              >
                Exportar JSON
              </button>
            </div>
            <div className="border border-black/10">
              <div className="max-h-96 overflow-y-auto">
                <table className="w-full text-sm">
                  <thead className="bg-black/5 sticky top-0">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-light uppercase tracking-[0.2em] text-black">Email</th>
                      <th className="px-4 py-3 text-left text-xs font-light uppercase tracking-[0.2em] text-black">Fecha de Suscripción</th>
                    </tr>
                  </thead>
                  <tbody>
                    {subscribers.length === 0 ? (
                      <tr>
                        <td colSpan={2} className="px-4 py-8 text-center text-black/40 font-light">
                          No hay suscriptores aún
                        </td>
                      </tr>
                    ) : (
                      subscribers.map((sub, index) => (
                        <tr key={index} className="border-t border-black/5">
                          <td className="px-4 py-3 text-black/80 font-light">{sub.email}</td>
                          <td className="px-4 py-3 text-black/60 font-light text-xs">
                            {new Date(sub.subscribedAt).toLocaleDateString('es-CL')}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
            <div className="bg-yellow-50 border border-yellow-200 p-4 text-sm text-yellow-800 font-light">
              <p className="mb-2"><strong>Nota:</strong> Los correos se guardan localmente en el navegador.</p>
              <p>Para enviar correos masivos, necesitarás:</p>
              <ul className="list-disc list-inside mt-2 space-y-1">
                <li>Un servicio de email marketing (Mailchimp, SendGrid, etc.)</li>
                <li>O un backend que procese los suscriptores y envíe los correos</li>
                <li>Exporta los suscriptores usando el botón "Exportar JSON" para importarlos a tu servicio</li>
              </ul>
            </div>
          </div>
        )}
      </div>
    </div>
      </>
  );
};

export default AdminPanel;

