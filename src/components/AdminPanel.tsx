import { useState, useEffect } from 'react';
import { isAuthenticated, logout, getCurrentUser } from '../utils/auth';
import { getAllProducts } from '../data/products';
import { getSubscribers, exportSubscribers } from '../utils/newsletter';
import { getAllCategories, updateCategoryImage, type Category } from '../utils/categories';
import type { Product } from '../data/products';
import Toast from './Toast';
import ChainVariationsManager from './ChainVariationsManager';

// Categorías disponibles
const CATEGORIES = ['Colgantes', 'Cadenas', 'Pulseras', 'Anillos', 'Esclavas', 'Aros'];

const AdminPanel = () => {
  const [authenticated, setAuthenticated] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [subscribers, setSubscribers] = useState<any[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [activeTab, setActiveTab] = useState<'products' | 'stock' | 'newsletter' | 'categories'>('products');
  const [toastMessage, setToastMessage] = useState('');
  const [showToast, setShowToast] = useState(false);
  const [selectedProducts, setSelectedProducts] = useState<Set<string>>(new Set());
  const [isCreating, setIsCreating] = useState(false);
  const [chainType, setChainType] = useState<'plata_925' | 'oro'>('plata_925');
  const [chainVariations, setChainVariations] = useState<any[]>([]);
  const [productImages, setProductImages] = useState<any[]>([]);
  const [newImageUrl, setNewImageUrl] = useState('');
  const [newImageAlt, setNewImageAlt] = useState('');
  const [selectedProductForView, setSelectedProductForView] = useState<Product | null>(null);
  const [selectedVariationForPrice, setSelectedVariationForPrice] = useState<any>(null);
  const [calculatedSumPrice, setCalculatedSumPrice] = useState<number | null>(null);
  const [calculatedDisplayPrice, setCalculatedDisplayPrice] = useState<number | null>(null);
  const [customDisplayPrice, setCustomDisplayPrice] = useState<number | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isProductsModalOpen, setIsProductsModalOpen] = useState(false);

  useEffect(() => {
    const checkAuth = () => {
      const auth = isAuthenticated();
      setAuthenticated(auth);
      if (auth) {
        setUser(getCurrentUser());
        loadProducts();
        loadSubscribers();
        loadCategories();
      } else {
        window.location.href = '/login';
      }
    };

    checkAuth();

    // Escuchar eventos de actualización de productos para recargar la lista
    const handleProductUpdate = () => {
      loadProducts();
    };

    window.addEventListener('productUpdated', handleProductUpdate as EventListener);
    window.addEventListener('productDeleted', handleProductUpdate as EventListener);

    return () => {
      window.removeEventListener('productUpdated', handleProductUpdate as EventListener);
      window.removeEventListener('productDeleted', handleProductUpdate as EventListener);
    };
  }, []);

  const loadProducts = async () => {
    try {
      const allProducts = await getAllProducts();
      setProducts(allProducts);
      setFilteredProducts(allProducts);
    } catch (error) {
      console.error('Error loading products:', error);
      setProducts([]);
      setFilteredProducts([]);
    }
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

  const loadSubscribers = async () => {
    try {
      const subs = await getSubscribers();
      setSubscribers(subs);
    } catch (error) {
      console.error('Error loading subscribers:', error);
      setSubscribers([]);
    }
  };

  const loadCategories = async () => {
    try {
      const cats = await getAllCategories();
      setCategories(cats);
    } catch (error) {
      console.error('Error loading categories:', error);
      setCategories([]);
    }
  };

  const handleEditCategory = (category: Category) => {
    setEditingCategory({ ...category });
  };

  const handleSaveCategory = async () => {
    if (!editingCategory) return;
    if (!editingCategory.image_url || (!editingCategory.image_url.startsWith('http://') && !editingCategory.image_url.startsWith('https://'))) {
      setToastMessage('URL válida requerida (http:// o https://)');
      setShowToast(true);
      return;
    }
    try {
      const success = await updateCategoryImage(editingCategory.id, editingCategory.image_url, editingCategory.image_alt);
      if (success) {
        await loadCategories();
        setEditingCategory(null);
        setToastMessage('Imagen actualizada');
        setShowToast(true);
      } else {
        throw new Error('Error al actualizar');
      }
    } catch (error: any) {
      setToastMessage('Error al actualizar');
      setShowToast(true);
    }
  };

  const handleLogout = () => {
    logout();
    window.location.href = '/login';
  };

  const handleEditProduct = async (product: Product, fromTab: 'products' | 'stock' = 'products') => {
    try {
      console.log(`[ADMIN] ✏️ Editing product: ${product.id} - ${product.name} from ${fromTab}`);
      setSelectedProduct(product);
      setEditingProduct({ ...product });
      setIsCreating(false);
      if (fromTab === 'stock') {
        setIsEditModalOpen(true);
      } else {
        setIsProductsModalOpen(true);
        setActiveTab(fromTab);
        // Cargar imágenes y variaciones cuando se abre desde productos
        if (product.id && !product.id.startsWith('new-')) {
          await loadProductImages(product.id);
          // Cargar variaciones también
          try {
            const variationsResponse = await fetch(`/api/products/${product.id}/variations`);
            if (variationsResponse.ok) {
              const variations = await variationsResponse.json();
              setChainVariations(variations || []);
            }
          } catch (error) {
            console.error('Error loading variations:', error);
          }
        }
      }
      
      // Cargar imágenes del producto (no bloquear si falla)
      loadProductImages(product.id).catch((err) => {
        console.warn(`[ADMIN] ⚠️ Could not load images for ${product.id}, continuing anyway:`, err);
      });
      
      // Si es una cadena o colgante, cargar sus variaciones
      if (product.category === 'Cadenas' || product.category === 'Colgantes') {
        try {
          const response = await fetch(`/api/products/${product.id}/variations`);
          if (response.ok) {
            const variations = await response.json();
            setChainVariations(variations || []);
            // Buscar el tipo de cadena de la primera variación
            if (variations.length > 0 && variations[0].chain_type) {
              setChainType(variations[0].chain_type as 'plata_925' | 'oro');
            } else {
              setChainType('plata_925'); // Por defecto
            }
          } else {
            setChainVariations([]);
            setChainType('plata_925'); // Por defecto si no hay variaciones
          }
        } catch (error) {
          console.error('Error loading product variations:', error);
          setChainVariations([]);
          setChainType('plata_925'); // Por defecto en caso de error
        }
      } else {
        setChainVariations([]);
        setChainType('plata_925');
      }
    } catch (error: any) {
      console.error(`[ADMIN] ❌ Error editing product ${product.id}:`, error.message || error);
      setToastMessage('Error al cargar el producto para editar');
      setShowToast(true);
    }
  };

  const loadProductImages = async (productId: string) => {
    try {
      console.log(`[ADMIN] 📸 Loading images for product ${productId}`);
      const response = await fetch(`/api/products/${productId}/images`);
      if (response.ok) {
        const images = await response.json();
        console.log(`[ADMIN] ✅ Loaded ${images?.length || 0} images for product ${productId}`);
        setProductImages(images || []);
      } else {
        console.warn(`[ADMIN] ⚠️ Failed to load images for product ${productId}: ${response.status}`);
        setProductImages([]);
      }
    } catch (error: any) {
      console.error(`[ADMIN] ❌ Error loading product images for ${productId}:`, error.message || error);
      setProductImages([]);
    }
  };

  const handleAddImage = async () => {
    if (!editingProduct || !editingProduct.id || editingProduct.id.startsWith('new-')) {
      console.warn('[ADMIN] ⚠️ Cannot add image: Product must be saved first');
      setToastMessage('Guarda el producto primero');
      setShowToast(true);
      return;
    }
    if (!newImageUrl || (!newImageUrl.startsWith('http://') && !newImageUrl.startsWith('https://'))) {
      console.warn('[ADMIN] ⚠️ Cannot add image: Invalid URL');
      setToastMessage('URL válida requerida (debe comenzar con http:// o https://)');
      setShowToast(true);
      return;
    }
    try {
      console.log(`[ADMIN] 📸 Adding image to product ${editingProduct.id}`);
      const response = await fetch(`/api/products/${editingProduct.id}/images`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ image_url: newImageUrl, image_alt: newImageAlt || '' }),
      });
      if (response.ok) {
        const result = await response.json();
        console.log(`[ADMIN] ✅ Image added successfully: ${result.id}`);
        await loadProductImages(editingProduct.id);
        setNewImageUrl('');
        setNewImageAlt('');
        setToastMessage('Imagen agregada correctamente');
        setShowToast(true);
      } else {
        const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
        console.error(`[ADMIN] ❌ Failed to add image: ${response.status} - ${errorData.error || 'Unknown error'}`);
        setToastMessage(`Error: ${errorData.error || 'No se pudo agregar la imagen'}`);
        setShowToast(true);
      }
    } catch (error: any) {
      console.error(`[ADMIN] ❌ Error adding image:`, error.message || error);
      setToastMessage(`Error: ${error.message || 'Error al agregar imagen'}`);
      setShowToast(true);
    }
  };

  const handleDeleteImage = async (imageId: string) => {
    if (!editingProduct || !editingProduct.id) return;
    try {
      const response = await fetch(`/api/products/${editingProduct.id}/images?imageId=${imageId}`, {
        method: 'DELETE',
      });
      if (response.ok) {
        await loadProductImages(editingProduct.id);
        setToastMessage('Imagen eliminada');
        setShowToast(true);
      } else {
        throw new Error('Error al eliminar imagen');
      }
    } catch (error: any) {
      setToastMessage('Error al eliminar imagen');
      setShowToast(true);
    }
  };

  const handleCreateProduct = () => {
    const newProduct: Product = {
      id: 'new-' + Date.now(),
      name: '',
      description: '',
      price: 0,
      stock: 0,
      category: 'Colgantes',
      image_url: '',
      image_alt: '',
      is_new: false,
      is_featured: false,
    };
    setEditingProduct(newProduct);
    setSelectedProduct(null);
    setIsCreating(true);
    setChainType('plata_925');
    setChainVariations([]);
  };

  const handleDeleteProduct = async (productId: string) => {
    if (!confirm('¿Estás seguro de que deseas eliminar este producto?')) {
      return;
    }

    try {
      const response = await fetch(`/api/products/${productId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Error al eliminar el producto');
      }

      // Disparar evento para que otras páginas sepan que deben recargar
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('productDeleted', { detail: { productId } }));
      }

      // Actualizar lista
      await loadProducts();
      setSelectedProducts(new Set());
      setToastMessage('Producto eliminado correctamente');
      setShowToast(true);
    } catch (error: any) {
      console.error('Error deleting product:', error);
      setToastMessage('Error al eliminar el producto. Por favor, intenta nuevamente.');
      setShowToast(true);
    }
  };

  const handleDeleteSelected = async () => {
    if (selectedProducts.size === 0) {
      setToastMessage('Selecciona al menos un producto para eliminar');
      setShowToast(true);
      return;
    }

    if (!confirm(`¿Estás seguro de que deseas eliminar ${selectedProducts.size} producto(s)?`)) {
      return;
    }

    try {
      const deletePromises = Array.from(selectedProducts).map(productId =>
        fetch(`/api/products/${productId}`, { method: 'DELETE' })
      );

      const results = await Promise.all(deletePromises);
      const failed = results.filter(r => !r.ok);

      if (failed.length > 0) {
        throw new Error('Algunos productos no se pudieron eliminar');
      }

      // Disparar eventos
      if (typeof window !== 'undefined') {
        selectedProducts.forEach((productId) => {
          window.dispatchEvent(new CustomEvent('productDeleted', { detail: { productId } }));
        });
      }

      // Actualizar lista
      await loadProducts();
      const count = selectedProducts.size;
      setSelectedProducts(new Set());
      setToastMessage(`${count} producto(s) eliminado(s) correctamente`);
      setShowToast(true);
    } catch (error: any) {
      console.error('Error deleting products:', error);
      setToastMessage('Error al eliminar los productos. Por favor, intenta nuevamente.');
      setShowToast(true);
    }
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

  const handleSaveProduct = async () => {
    if (!editingProduct) return;

    // Validaciones
    if (!editingProduct.name.trim()) {
      setToastMessage('El nombre del producto es requerido');
      setShowToast(true);
      return;
    }

    if (!editingProduct.category) {
      setToastMessage('Debes seleccionar una categoría');
      setShowToast(true);
      return;
    }

    if (editingProduct.price <= 0) {
      setToastMessage('El precio debe ser mayor a 0');
      setShowToast(true);
      return;
    }

    // Validar que la URL de la imagen sea válida
    if (editingProduct.image_url && !editingProduct.image_url.startsWith('http://') && !editingProduct.image_url.startsWith('https://')) {
      setToastMessage('Por favor, ingresa una URL válida que comience con http:// o https://');
      setShowToast(true);
      return;
    }

    try {
      let response;
      
      if (isCreating) {
        // Crear nuevo producto
        response = await fetch('/api/products', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: editingProduct.name,
            description: editingProduct.description || '',
            price: editingProduct.price,
            stock: editingProduct.stock,
            category: editingProduct.category,
            image_url: editingProduct.image_url,
            image_alt: editingProduct.image_alt || editingProduct.name,
            is_new: editingProduct.is_new || false,
            is_featured: editingProduct.is_featured || false,
            chain_type: (editingProduct.category === 'Cadenas' || editingProduct.category === 'Colgantes') ? chainType : undefined,
          }),
        });
      } else {
        // Actualizar producto existente
        response = await fetch(`/api/products/${editingProduct.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: editingProduct.name,
            description: editingProduct.description,
            price: editingProduct.price,
            stock: editingProduct.stock,
            category: editingProduct.category,
            image_url: editingProduct.image_url,
            image_alt: editingProduct.image_alt || editingProduct.name,
            is_new: editingProduct.is_new,
            is_featured: editingProduct.is_featured,
            chain_type: (editingProduct.category === 'Cadenas' || editingProduct.category === 'Colgantes') ? chainType : undefined,
          }),
        });
      }

      if (!response.ok) {
        throw new Error(isCreating ? 'Error al crear el producto' : 'Error al actualizar el producto');
      }

      const result = await response.json();
      const savedProductId = result.id || editingProduct.id;

      // Las variaciones ahora se guardan automáticamente desde ChainVariationsManager
      // No necesitamos guardarlas aquí

      // Actualizar lista
      await loadProducts();
      
      // Si estamos en Stock, actualizar selectedProductForView y cerrar modal si está abierto
      if (activeTab === 'stock' && selectedProductForView && selectedProductForView.id === savedProductId) {
        const updatedProducts = await getAllProducts();
        const updatedProduct = updatedProducts.find(p => p.id === savedProductId);
        if (updatedProduct) {
          setSelectedProductForView(updatedProduct);
        }
      }
      
      // Cerrar modal si está abierto
      if (isEditModalOpen) {
        setIsEditModalOpen(false);
      }
      
      // Disparar evento para que otras páginas sepan que deben recargar
      if (typeof window !== 'undefined') {
        const event = new CustomEvent('productUpdated', { 
          detail: { productId: savedProductId },
          bubbles: true 
        });
        window.dispatchEvent(event);
      }
      
      // Si es un producto nuevo, actualizar el editingProduct con el ID real
      if (isCreating && savedProductId) {
        const updatedProducts = await getAllProducts();
        const updatedProduct = updatedProducts.find(p => p.id === savedProductId);
        if (updatedProduct) {
          setEditingProduct(updatedProduct);
          setIsCreating(false);
          // Recargar variaciones si es una cadena o colgante (aunque probablemente no haya ninguna aún)
          if (updatedProduct.category === 'Cadenas' || updatedProduct.category === 'Colgantes') {
            try {
              const variationsResponse = await fetch(`/api/products/${savedProductId}/variations`);
              if (variationsResponse.ok) {
                const variations = await variationsResponse.json();
                setChainVariations(variations || []);
                if (variations.length > 0 && variations[0].chain_type) {
                  setChainType(variations[0].chain_type as 'plata_925' | 'oro');
                }
              }
            } catch (error) {
              console.error('Error loading variations after save:', error);
            }
          }
        }
      } else {
        // Actualizar el producto seleccionado si es el mismo
        if (selectedProduct && selectedProduct.id === savedProductId) {
          const updatedProducts = await getAllProducts();
          const updatedProduct = updatedProducts.find(p => p.id === savedProductId);
        if (updatedProduct) {
          setSelectedProduct(updatedProduct);
          }
        }
        setEditingProduct(null);
        setIsCreating(false);
      }
      
      setToastMessage(isCreating ? 'Producto creado correctamente' : 'Producto actualizado correctamente');
      setShowToast(true);
    } catch (error: any) {
      console.error('Error saving product:', error);
      setToastMessage(error.message || (isCreating ? 'Error al crear el producto' : 'Error al actualizar el producto'));
      setShowToast(true);
    }
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
        <div className="py-20 font-sans text-sm">
      <div className="mx-auto max-w-7xl px-6 lg:px-12">
        <div className="mb-12 flex items-center justify-between">
          <div>
            <h1 className="text-3xl sm:text-4xl font-bold text-black mb-2">
              PANEL DE ADMINISTRACIÓN
            </h1>
            <p className="text-black/80 font-normal text-base">
              Bienvenido, {user?.username || 'admin'}
            </p>
          </div>
          <button
            onClick={handleLogout}
            className="px-6 py-2 border border-black/20 text-black text-sm font-medium hover:border-black/40 transition-colors"
          >
            Cerrar Sesión
          </button>
        </div>

        {/* Tabs */}
        <div className="mb-8 flex gap-4 border-b border-black/10">
          <button
            onClick={() => setActiveTab('products')}
            className={`px-6 py-3 text-sm font-medium transition-colors border-b-2 ${
              activeTab === 'products'
                ? 'border-black text-black'
                : 'border-transparent text-black/40 hover:text-black/60'
            }`}
          >
            Productos
          </button>
          <button
            onClick={() => setActiveTab('stock')}
            className={`px-6 py-3 text-sm font-medium transition-colors border-b-2 ${
              activeTab === 'stock'
                ? 'border-black text-black'
                : 'border-transparent text-black/40 hover:text-black/60'
            }`}
          >
            Stock
          </button>
          <button
            onClick={() => setActiveTab('newsletter')}
            className={`px-6 py-3 text-sm font-medium transition-colors border-b-2 ${
              activeTab === 'newsletter'
                ? 'border-black text-black'
                : 'border-transparent text-black/40 hover:text-black/60'
            }`}
          >
            Newsletter ({subscribers.length})
          </button>
          <button
            onClick={() => setActiveTab('categories')}
            className={`px-6 py-3 text-sm font-medium transition-colors border-b-2 ${
              activeTab === 'categories'
                ? 'border-black text-black'
                : 'border-transparent text-black/40 hover:text-black/60'
            }`}
          >
            Categorías
          </button>
        </div>

        {activeTab === 'products' && (
        <div className="w-full">
          {/* Lista de Productos */}
          <div className="w-full">
            <div className="mb-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-black mb-4">
                  Productos
                </h2>
                <div className="flex items-center gap-3">
                  <button
                    onClick={handleCreateProduct}
                    className="px-4 py-2 bg-black text-white text-sm font-medium hover:bg-black/90 transition-colors flex items-center gap-2"
                  >
                    <span className="material-symbols-outlined" style={{ fontSize: '18px', fontWeight: 300 }}>
                      add
                    </span>
                    Crear Producto
                  </button>
                  {selectedProducts.size > 0 && (
                    <button
                      onClick={handleDeleteSelected}
                      className="px-4 py-2 bg-red-600 text-white text-sm font-medium hover:bg-red-700 transition-colors flex items-center gap-2"
                    >
                      <span className="material-symbols-outlined" style={{ fontSize: '16px', fontWeight: 300 }}>
                        delete
                      </span>
                      Eliminar Seleccionados ({selectedProducts.size})
                    </button>
                  )}
                </div>
              </div>
              {/* Buscador */}
              <div className="relative">
                <input
                  type="text"
                  placeholder="Buscar productos por nombre, categoría o descripción..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-white border border-black/20 px-4 py-3 pl-10 text-black text-base font-normal focus:outline-none focus:border-black/40 transition-colors"
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
                <p className="mt-2 text-sm text-black/70 font-normal">
                  {filteredProducts.length} producto{filteredProducts.length !== 1 ? 's' : ''} encontrado{filteredProducts.length !== 1 ? 's' : ''}
                </p>
              )}
            </div>
            <div className="space-y-4 max-h-[600px] overflow-y-auto">
              {filteredProducts.length === 0 ? (
                <div className="text-center py-12 border border-black/10">
                  <p className="text-black/70 font-normal text-base">
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
                    <label className="text-sm font-medium text-black/80 cursor-pointer">
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
                        <h3 className="text-base font-semibold text-black mb-1 truncate">
                          {product.name}
                        </h3>
                        <p className="text-sm text-black/70 font-normal mb-1">
                          {product.category} • ${product.price.toLocaleString('es-CL')} CLP
                        </p>
                        {product.has_variations && (
                          <p className="text-xs font-semibold text-black/60 uppercase tracking-[0.2em]">
                            Variaciones ({product.variation_count || 0})
                          </p>
                        )}
                        <p className="text-sm text-black/60 font-normal">
                          Stock: {product.stock} unidades
                        </p>
                      </div>
                      <div className="flex items-center gap-2 flex-shrink-0">
                        <button
                          onClick={() => handleEditProduct(product)}
                          className="px-4 py-2 bg-black text-white text-sm font-medium hover:bg-black/90 transition-colors"
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
        </div>
        )}

        {/* Modal de Edición Completa de Producto (Productos) */}
        {isProductsModalOpen && editingProduct && (
          <div 
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
            onClick={() => {
              setIsProductsModalOpen(false);
              setEditingProduct(null);
            }}
          >
            <div 
              className="w-full max-w-6xl max-h-[95vh] bg-white shadow-xl overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="sticky top-0 bg-white border-b border-black/10 px-6 py-4 flex items-center justify-between z-10">
                <h3 className="text-xl font-semibold text-black">Editar Producto Completo</h3>
                <button
                  onClick={() => {
                    setIsProductsModalOpen(false);
                    setEditingProduct(null);
                  }}
                  className="text-black/60 hover:text-black transition-colors"
                  aria-label="Cerrar"
                >
                  <span className="material-symbols-outlined" style={{ fontSize: '28px', fontWeight: 300 }}>close</span>
                </button>
              </div>
              
              <div className="p-6">
                <h2 className="text-xl font-semibold text-black mb-6">
                  {isCreating ? 'Crear Producto' : 'Editar Producto'}
                </h2>
                {/* Imagen del producto */}
                <div className="mb-6">
                  <div className="w-full aspect-square overflow-hidden bg-gray-50 border border-black/5 mb-3 relative">
                    <img
                      src={editingProduct.image_url}
                      alt={editingProduct.image_alt || editingProduct.name}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.src = 'https://via.placeholder.com/400?text=Imagen+no+disponible';
                      }}
                    />
                    <button
                      onClick={async () => {
                        const newFeatured = !editingProduct.is_featured;
                        const featuredCount = products.filter(p => p.is_featured && p.id !== editingProduct.id).length;
                        if (newFeatured && featuredCount >= 8) {
                          setToastMessage('Máximo 8 productos destacados permitidos (2 filas)');
                          setShowToast(true);
                          return;
                        }
                        setEditingProduct({ ...editingProduct, is_featured: newFeatured });
                      }}
                      className={`absolute top-3 right-3 p-2 rounded-full transition-all ${
                        editingProduct.is_featured
                          ? 'bg-yellow-500 text-white shadow-lg'
                          : 'bg-white/80 text-black/40 hover:bg-white hover:text-yellow-500'
                      }`}
                      title={editingProduct.is_featured ? 'Quitar de destacados' : 'Marcar como destacado'}
                    >
                      <span className="material-symbols-outlined" style={{ fontSize: '24px', fontWeight: 300 }}>
                        star
                      </span>
                    </button>
                  </div>
                  <p className="text-sm text-black/70 font-normal text-center mb-4">
                    {editingProduct.name}
                  </p>
                  <div>
                    <label className="block text-sm font-semibold text-black mb-2">
                      URL de la Imagen Principal
                    </label>
                    <input
                      type="url"
                      value={editingProduct.image_url}
                      onChange={(e) => setEditingProduct({ ...editingProduct, image_url: e.target.value })}
                      placeholder="https://ejemplo.com/imagen.jpg"
                      className="w-full bg-white border border-black/20 px-4 py-2 text-black text-base font-normal focus:outline-none focus:border-black/40"
                    />
                    <p className="text-xs text-black/60 font-normal mt-1">
                      Ingresa la URL completa de la imagen (ej: Cloudinary, Imgur, etc.)
                    </p>
                  </div>
                  {editingProduct.id && !editingProduct.id.startsWith('new-') && (
                    <div className="mt-4">
                      <label className="block text-sm font-semibold text-black mb-2">
                        Imágenes Adicionales
                      </label>
                      <div className="space-y-3 mb-3">
                        {productImages.length > 0 && (
                          <div className="grid grid-cols-2 gap-2">
                            {productImages.map((img) => (
                              <div key={img.id} className="relative group">
                                <img src={img.image_url} alt={img.image_alt} className="w-full aspect-square object-cover border border-black/10" />
                                <button
                                  onClick={() => handleDeleteImage(img.id)}
                                  className="absolute top-1 right-1 bg-red-600 text-white p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                                  aria-label="Eliminar imagen"
                                >
                                  <span className="material-symbols-outlined" style={{ fontSize: '16px', fontWeight: 300 }}>delete</span>
                                </button>
                              </div>
                            ))}
                          </div>
                        )}
                        <div className="flex gap-2">
                          <input
                            type="url"
                            value={newImageUrl}
                            onChange={(e) => setNewImageUrl(e.target.value)}
                            placeholder="URL de nueva imagen"
                            className="flex-1 bg-white border border-black/20 px-4 py-2 text-black text-sm font-normal focus:outline-none focus:border-black/40"
                          />
                          <button
                            onClick={handleAddImage}
                            className="px-4 py-2 bg-black text-white text-sm font-medium hover:bg-black/90 transition-colors flex items-center gap-2"
                          >
                            <span className="material-symbols-outlined" style={{ fontSize: '18px', fontWeight: 300 }}>add</span>
                            Agregar Foto
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
                <div className="space-y-5">
                  <div>
                    <label className="block text-sm font-semibold text-black mb-2">
                      Nombre del Producto
                    </label>
                    <input
                      type="text"
                      value={editingProduct.name}
                      onChange={(e) => setEditingProduct({ ...editingProduct, name: e.target.value })}
                      placeholder="Ej: Cadena Cartier 3mm x 60cm"
                      className="w-full bg-white border border-black/20 px-4 py-2.5 text-black text-base font-normal focus:outline-none focus:border-black/40 focus:ring-1 focus:ring-black/10 transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-black mb-2">
                      Descripción
                    </label>
                    <textarea
                      value={editingProduct.description || ''}
                      onChange={(e) => setEditingProduct({ ...editingProduct, description: e.target.value })}
                      rows={4}
                      placeholder="Describe las características del producto..."
                      className="w-full bg-white border border-black/20 px-4 py-2.5 text-black text-base font-normal focus:outline-none focus:border-black/40 focus:ring-1 focus:ring-black/10 resize-none transition-all"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-black mb-2">
                      Precio (CLP)
                    </label>
                    <input
                      type="number"
                      value={editingProduct.price}
                      onChange={(e) => setEditingProduct({ ...editingProduct, price: parseInt(e.target.value) || 0 })}
                        placeholder="0"
                        min="0"
                        className="w-full bg-white border border-black/20 px-4 py-2.5 text-black text-base font-normal focus:outline-none focus:border-black/40 focus:ring-1 focus:ring-black/10 transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-black mb-2">
                      Stock
                    </label>
                    <input
                      type="number"
                      value={editingProduct.stock}
                      onChange={(e) => setEditingProduct({ ...editingProduct, stock: parseInt(e.target.value) || 0 })}
                        placeholder="0"
                        min="0"
                        className="w-full bg-white border border-black/20 px-4 py-2.5 text-black text-base font-normal focus:outline-none focus:border-black/40 focus:ring-1 focus:ring-black/10 transition-all"
                    />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-black mb-2">
                      Categoría
                    </label>
                    <select
                      value={editingProduct.category}
                      onChange={(e) => {
                        setEditingProduct({ ...editingProduct, category: e.target.value });
                        // Resetear tipo de cadena si cambia de categoría
                        if (e.target.value !== 'Cadenas' && e.target.value !== 'Colgantes') {
                          setChainType('plata_925');
                        }
                      }}
                      className="w-full bg-white border border-black/20 px-4 py-2.5 text-black text-base font-normal focus:outline-none focus:border-black/40 focus:ring-1 focus:ring-black/10 transition-all"
                    >
                      {CATEGORIES.map((category) => (
                        <option key={category} value={category}>
                          {category}
                        </option>
                      ))}
                    </select>
                  </div>
                  {(editingProduct.category === 'Cadenas' || editingProduct.category === 'Colgantes') && (
                    <div className="space-y-4">
                      <div className="bg-gradient-to-br from-black/5 to-black/10 border border-black/20 rounded-lg p-5 space-y-3">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="material-symbols-outlined text-black/70" style={{ fontSize: '18px', fontWeight: 300 }}>
                            category
                          </span>
                          <label className="block text-sm font-semibold text-black">
                            Tipo de Material de la Cadena
                          </label>
                        </div>
                        <select
                          value={chainType}
                          onChange={(e) => setChainType(e.target.value as 'plata_925' | 'oro')}
                          className="w-full bg-white border border-black/20 px-4 py-2.5 text-black text-base font-normal focus:outline-none focus:border-black/40 focus:ring-2 focus:ring-black/20 transition-all shadow-sm"
                        >
                          <option value="plata_925">Plata 925 - Disponible en tienda</option>
                          <option value="oro">Oro - Guardado (no visible aún)</option>
                        </select>
                        <div className={`mt-3 p-3 rounded border ${
                          chainType === 'plata_925' 
                            ? 'bg-green-50 border-green-200' 
                            : 'bg-amber-50 border-amber-200'
                        }`}>
                          <div className="flex items-start gap-2">
                            <span className={`material-symbols-outlined text-sm flex-shrink-0 mt-0.5 ${
                              chainType === 'plata_925' ? 'text-green-600' : 'text-amber-600'
                            }`} style={{ fontSize: '18px', fontWeight: 300 }}>
                              {chainType === 'plata_925' ? 'check_circle' : 'info'}
                            </span>
                            <p className={`text-xs font-normal leading-relaxed ${
                              chainType === 'plata_925' ? 'text-green-800' : 'text-amber-800'
                            }`}>
                              {chainType === 'oro' 
                                ? 'Esta variación se guardará en la base de datos pero permanecerá oculta en la tienda hasta que se active manualmente desde la base de datos.' 
                                : 'Esta variación estará disponible y visible para los clientes en la tienda online.'}
                            </p>
                          </div>
                        </div>
                      </div>
                      
                      {/* Gestor de Variaciones */}
                      {editingProduct.id && !editingProduct.id.startsWith('new-') && (
                        <div className="space-y-4">
                          <ChainVariationsManager
                            productId={editingProduct.id}
                            baseProductPrice={editingProduct.price}
                            onVariationsChange={(variations) => {
                              setChainVariations(variations);
                              // Resetear cálculo de precio si cambian las variaciones
                              setSelectedVariationForPrice(null);
                              setCalculatedSumPrice(null);
                              setCalculatedDisplayPrice(null);
                              setCustomDisplayPrice(null);
                            }}
                          />
                          
                        </div>
                      )}
                      {(!editingProduct.id || editingProduct.id.startsWith('new-')) && (
                        <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                          <div className="flex items-start gap-2">
                            <span className="material-symbols-outlined text-amber-600 flex-shrink-0 mt-0.5" style={{ fontSize: '18px', fontWeight: 300 }}>
                              info
                            </span>
                            <p className="text-xs text-amber-800 font-normal">
                              Guarda el producto primero para poder añadir variaciones de marca, grosor y largo de la cadena.
                            </p>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                  <div className="flex gap-2">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={editingProduct.is_new || false}
                        onChange={(e) => setEditingProduct({ ...editingProduct, is_new: e.target.checked })}
                        className="w-4 h-4 text-black focus:ring-black cursor-pointer"
                      />
                      <span className="text-sm font-normal text-black">Producto Nuevo</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={editingProduct.is_featured || false}
                        onChange={(e) => {
                          const newFeatured = e.target.checked;
                          const featuredCount = products.filter(p => p.is_featured && p.id !== editingProduct.id).length;
                          if (newFeatured && featuredCount >= 8) {
                            setToastMessage('Máximo 8 productos destacados permitidos (2 filas)');
                            setShowToast(true);
                            return;
                          }
                          setEditingProduct({ ...editingProduct, is_featured: newFeatured });
                        }}
                        className="w-4 h-4 text-black focus:ring-black cursor-pointer"
                      />
                      <span className="text-sm font-normal text-black">Destacado</span>
                    </label>
                  </div>
                  <div className="flex gap-3">
                    <button
                      onClick={async () => {
                        await handleSaveProduct();
                        setIsProductsModalOpen(false);
                      }}
                      className="flex-1 px-4 py-2 bg-black text-white text-sm font-medium hover:bg-black/90 transition-colors"
                    >
                      Guardar
                    </button>
                    <button
                      onClick={() => {
                        setIsProductsModalOpen(false);
                        setEditingProduct(null);
                        setSelectedProduct(null);
                        setIsCreating(false);
                      }}
                      className="flex-1 px-4 py-2 border border-black/20 text-black text-sm font-medium hover:border-black/40 transition-colors"
                    >
                      Cancelar
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'stock' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-2xl font-bold text-black">Gestión de Stock</h2>
                <p className="text-base text-black/60 mt-1">
                  {products.filter(p => p.is_featured).length} de 8 productos destacados
                </p>
              </div>
              <div className="flex gap-3">
                {selectedProducts.size === 0 && (
                  <button
                    onClick={handleCreateProduct}
                    className="px-6 py-3 bg-black text-white text-base font-medium hover:bg-black/90 transition-colors flex items-center gap-2"
                  >
                    <span className="material-symbols-outlined" style={{ fontSize: '20px', fontWeight: 300 }}>add</span>
                    Añadir Producto
                  </button>
                )}
                {selectedProducts.size > 0 && (
                  <button
                    onClick={handleDeleteSelected}
                    className="px-6 py-3 bg-red-600 text-white text-base font-medium hover:bg-red-700 transition-colors flex items-center gap-2"
                  >
                    <span className="material-symbols-outlined" style={{ fontSize: '18px', fontWeight: 300 }}>delete</span>
                    Eliminar Seleccionados ({selectedProducts.size})
                  </button>
                )}
              </div>
            </div>
            <div className="border border-black/10">
              <div className="overflow-x-auto">
                <table className="w-full">
                      <thead className="bg-black/5 sticky top-0">
                        <tr>
                          <th className="px-6 py-4 text-left">
                            <input
                              type="checkbox"
                              checked={selectedProducts.size === products.length && products.length > 0}
                              onChange={handleSelectAll}
                              className="size-5 text-black focus:ring-black cursor-pointer"
                            />
                          </th>
                          <th className="px-6 py-4 text-left text-base font-semibold text-black">Imagen</th>
                          <th className="px-6 py-4 text-left text-base font-semibold text-black">ID</th>
                          <th className="px-6 py-4 text-left text-base font-semibold text-black">Nombre</th>
                          <th className="px-6 py-4 text-left text-base font-semibold text-black">Categoría</th>
                          <th className="px-6 py-4 text-left text-base font-semibold text-black">Stock</th>
                          <th className="px-6 py-4 text-left text-base font-semibold text-black">Precio</th>
                          <th className="px-6 py-4 text-left text-base font-semibold text-black">Acciones</th>
                        </tr>
                      </thead>
                  <tbody>
                        {products.length === 0 ? (
                          <tr>
                            <td colSpan={8} className="px-6 py-12 text-center text-black/50 font-normal text-base">
                              No hay productos disponibles
                            </td>
                          </tr>
                        ) : (
                          products.map((product) => (
                            <tr 
                              key={product.id} 
                              className="border-t border-black/5 hover:bg-black/2 transition-colors"
                            >
                              <td className="px-6 py-4">
                                <input
                                  type="checkbox"
                                  checked={selectedProducts.has(product.id)}
                                  onChange={() => handleToggleSelect(product.id)}
                                  className="size-5 text-black focus:ring-black cursor-pointer"
                                />
                              </td>
                              <td className="px-6 py-4">
                                <div className="w-24 h-24 overflow-hidden bg-gray-50 border border-black/10 hover:border-black/30 transition-colors relative flex items-center justify-center">
                                  {!product.image_url || product.image_url.trim() === '' ? (
                                    <span className="text-xs text-gray-400 font-normal">Sin imagen</span>
                                  ) : (
                                    <>
                                      <img
                                        src={product.image_url}
                                        alt={product.image_alt || product.name}
                                        className="w-full h-full object-cover"
                                        onError={(e) => {
                                          const target = e.target as HTMLImageElement;
                                          target.style.display = 'none';
                                          const parent = target.parentElement;
                                          if (parent && !parent.querySelector('.no-image-text')) {
                                            const placeholder = document.createElement('span');
                                            placeholder.className = 'text-xs text-gray-400 font-normal no-image-text';
                                            placeholder.textContent = 'Sin imagen';
                                            parent.appendChild(placeholder);
                                          }
                                        }}
                                      />
                                      {product.is_featured && (
                                        <div className="absolute top-2 right-2 bg-yellow-500 text-white p-1 rounded-full shadow-sm">
                                          <span className="material-symbols-outlined" style={{ fontSize: '16px', fontWeight: 300 }}>star</span>
                                        </div>
                                      )}
                                    </>
                                  )}
                                </div>
                              </td>
                              <td className="px-6 py-4 text-black/90 font-normal font-mono text-sm">{product.id}</td>
                              <td className="px-6 py-4 text-black/90 font-normal text-base">{product.name}</td>
                              <td className="px-6 py-4 text-black/70 font-normal text-base">{product.category}</td>
                              <td className="px-6 py-4">
                                <span className={`font-semibold text-base ${product.stock > 0 ? 'text-green-600' : 'text-red-600'}`}>
                                  {product.stock}
                                </span>
                              </td>
                              <td className="px-6 py-4 text-black/90 font-normal text-base">${product.price.toLocaleString('es-CL')} CLP</td>
                              <td className="px-6 py-4">
                                <button
                                  onClick={() => handleEditProduct(product, 'stock')}
                                  className="px-4 py-2 bg-black text-white text-sm font-medium hover:bg-black/90 transition-colors mr-2"
                                >
                                  Editar
                                </button>
                                <button
                                  onClick={() => handleDeleteProduct(product.id)}
                                  className="px-4 py-2 bg-red-600 text-white text-sm font-medium hover:bg-red-700 transition-colors"
                                >
                                  Eliminar
                                </button>
                              </td>
                            </tr>
                          ))
                        )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* Modal de Edición de Producto */}
        {isEditModalOpen && editingProduct && (
          <div 
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
            onClick={() => {
              setIsEditModalOpen(false);
              setEditingProduct(null);
            }}
          >
            <div 
              className="w-full max-w-4xl max-h-[90vh] bg-white shadow-xl overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="sticky top-0 bg-white border-b border-black/10 px-6 py-4 flex items-center justify-between z-10">
                <h3 className="text-xl font-semibold text-black">Editar Producto</h3>
                <button
                  onClick={() => {
                    setIsEditModalOpen(false);
                    setEditingProduct(null);
                  }}
                  className="text-black/60 hover:text-black transition-colors"
                  aria-label="Cerrar"
                >
                  <span className="material-symbols-outlined" style={{ fontSize: '28px', fontWeight: 300 }}>close</span>
                </button>
              </div>
              
              <div className="p-6 space-y-6">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div>
                    <div className="w-full aspect-square overflow-hidden bg-gray-50 border border-black/5 relative mb-4">
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
                    <div>
                      <label className="block text-base font-semibold text-black mb-2">URL de la Imagen</label>
                      <input
                        type="url"
                        value={editingProduct.image_url}
                        onChange={(e) => setEditingProduct({ ...editingProduct, image_url: e.target.value })}
                        placeholder="https://ejemplo.com/imagen.jpg"
                        className="w-full bg-white border border-black/20 px-4 py-3 text-black text-base font-normal focus:outline-none focus:border-black/40"
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-5">
                    <div>
                      <label className="block text-base font-semibold text-black mb-2">Nombre del Producto</label>
                      <input
                        type="text"
                        value={editingProduct.name}
                        onChange={(e) => setEditingProduct({ ...editingProduct, name: e.target.value })}
                        className="w-full bg-white border border-black/20 px-4 py-3 text-black text-base font-normal focus:outline-none focus:border-black/40"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-base font-semibold text-black mb-2">Categoría</label>
                      <select
                        value={editingProduct.category}
                        onChange={(e) => setEditingProduct({ ...editingProduct, category: e.target.value })}
                        className="w-full bg-white border border-black/20 px-4 py-3 text-black text-base font-normal focus:outline-none focus:border-black/40"
                      >
                        {CATEGORIES.map((category) => (
                          <option key={category} value={category}>{category}</option>
                        ))}
                      </select>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-base font-semibold text-black mb-2">Precio (CLP)</label>
                        <input
                          type="number"
                          value={editingProduct.price}
                          onChange={(e) => setEditingProduct({ ...editingProduct, price: parseInt(e.target.value) || 0 })}
                          min="0"
                          className="w-full bg-white border border-black/20 px-4 py-3 text-black text-base font-normal focus:outline-none focus:border-black/40"
                        />
                      </div>
                      <div>
                        <label className="block text-base font-semibold text-black mb-2">Stock</label>
                        <input
                          type="number"
                          value={editingProduct.stock}
                          onChange={(e) => setEditingProduct({ ...editingProduct, stock: parseInt(e.target.value) || 0 })}
                          min="0"
                          className="w-full bg-white border border-black/20 px-4 py-3 text-black text-base font-normal focus:outline-none focus:border-black/40"
                        />
                      </div>
                    </div>
                    
                    <div>
                      <label className="block text-base font-semibold text-black mb-2">Descripción</label>
                      <textarea
                        value={editingProduct.description || ''}
                        onChange={(e) => setEditingProduct({ ...editingProduct, description: e.target.value })}
                        rows={4}
                        className="w-full bg-white border border-black/20 px-4 py-3 text-black text-base font-normal focus:outline-none focus:border-black/40 resize-none"
                      />
                    </div>
                    
                    <div className="flex gap-6">
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={editingProduct.is_new || false}
                          onChange={(e) => setEditingProduct({ ...editingProduct, is_new: e.target.checked })}
                          className="w-5 h-5 text-black focus:ring-black cursor-pointer"
                        />
                        <span className="text-base font-normal text-black">Producto Nuevo</span>
                      </label>
                      <label className="flex items-center gap-3 cursor-pointer group">
                        <div className="relative">
                          <input
                            type="checkbox"
                            checked={editingProduct.is_featured || false}
                            onChange={(e) => {
                              const newFeatured = e.target.checked;
                              const featuredCount = products.filter(p => p.is_featured && p.id !== editingProduct.id).length;
                              if (newFeatured && featuredCount >= 8) {
                                setToastMessage('Máximo 8 productos destacados permitidos (2 filas)');
                                setShowToast(true);
                                return;
                              }
                              setEditingProduct({ ...editingProduct, is_featured: newFeatured });
                            }}
                            className="sr-only"
                          />
                          <span className={`material-symbols-outlined transition-all ${
                            editingProduct.is_featured 
                              ? 'text-yellow-500 scale-110' 
                              : 'text-black/40 group-hover:text-black/60'
                          }`} style={{ fontSize: '32px', fontWeight: 300 }}>
                            star
                          </span>
                        </div>
                        <span className="text-base font-normal text-black">Destacado</span>
                      </label>
                    </div>
                  </div>
                </div>
                
                <div className="flex gap-4 pt-6 border-t border-black/10">
                  <button
                    onClick={async () => {
                      await handleSaveProduct();
                      setIsEditModalOpen(false);
                    }}
                    className="flex-1 px-6 py-3 bg-black text-white text-base font-medium hover:bg-black/90 transition-colors"
                  >
                    Guardar Cambios
                  </button>
                  <button
                    onClick={() => {
                      setIsEditModalOpen(false);
                      setEditingProduct(null);
                    }}
                    className="flex-1 px-6 py-3 border border-black/20 text-black text-base font-medium hover:border-black/40 transition-colors"
                  >
                    Cancelar
                  </button>
                  <button
                    onClick={() => {
                      setIsEditModalOpen(false);
                      handleEditProduct(editingProduct, 'products');
                    }}
                    className="px-6 py-3 border border-black/20 text-black text-base font-medium hover:border-black/40 transition-colors"
                  >
                    Editar Completo
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'categories' && (
          <div className="space-y-6">
            <h2 className="text-xl font-bold text-black">Gestión de Imágenes de Categorías</h2>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div>
                <h3 className="text-lg font-semibold text-black mb-4">Categorías</h3>
                <div className="space-y-3 max-h-[600px] overflow-y-auto">
                  {categories.length === 0 ? (
                    <p className="text-black/70">No hay categorías</p>
                  ) : (
                    categories.map((category) => (
                      <div key={category.id} className="border border-black/10 p-4 flex items-center gap-4 hover:border-black/20 transition-colors cursor-pointer" onClick={() => handleEditCategory(category)}>
                        <div className="flex-shrink-0 w-20 h-20 overflow-hidden bg-gray-50 border border-black/5">
                          <img src={category.image_url} alt={category.image_alt} className="w-full h-full object-cover" />
                        </div>
                        <div className="flex-1">
                          <h4 className="text-base font-semibold text-black mb-1">{category.name}</h4>
                          <p className="text-xs text-black/60 truncate">{category.image_url}</p>
                        </div>
                        <button onClick={(e) => { e.stopPropagation(); handleEditCategory(category); }} className="px-4 py-2 bg-black text-white text-sm font-medium hover:bg-black/90">Editar</button>
                      </div>
                    ))
                  )}
                </div>
              </div>
              <div>
                {editingCategory ? (
                  <div className="border border-black/10 p-6">
                    <h3 className="text-lg font-semibold text-black mb-6">Editar Imagen</h3>
                    <div className="mb-6">
                      <div className="w-full aspect-square overflow-hidden bg-gray-50 border border-black/5 mb-3">
                        <img src={editingCategory.image_url} alt={editingCategory.image_alt} className="w-full h-full object-cover" onError={(e) => { (e.target as HTMLImageElement).src = 'https://via.placeholder.com/400?text=Imagen+no+disponible'; }} />
                      </div>
                      <p className="text-sm text-black/70 text-center mb-4">{editingCategory.name}</p>
                      <div>
                        <label className="block text-sm font-semibold text-black mb-2">URL de la Imagen</label>
                        <input type="url" value={editingCategory.image_url} onChange={(e) => setEditingCategory({ ...editingCategory, image_url: e.target.value })} placeholder="https://ejemplo.com/imagen.jpg" className="w-full bg-white border border-black/20 px-4 py-2 text-black text-base font-normal focus:outline-none focus:border-black/40" />
                        <p className="text-xs text-black/60 mt-1">URL completa (ej: Cloudinary)</p>
                      </div>
                      <div className="mt-4">
                        <label className="block text-sm font-semibold text-black mb-2">Texto Alternativo</label>
                        <input type="text" value={editingCategory.image_alt || ''} onChange={(e) => setEditingCategory({ ...editingCategory, image_alt: e.target.value })} placeholder={editingCategory.name} className="w-full bg-white border border-black/20 px-4 py-2 text-black text-base font-normal focus:outline-none focus:border-black/40" />
                      </div>
                    </div>
                    <div className="flex gap-3">
                      <button onClick={handleSaveCategory} className="flex-1 px-4 py-2 bg-black text-white text-sm font-medium hover:bg-black/90">Guardar</button>
                      <button onClick={() => setEditingCategory(null)} className="flex-1 px-4 py-2 border border-black/20 text-black text-sm font-medium hover:border-black/40">Cancelar</button>
                    </div>
                  </div>
                ) : (
                  <div className="border border-black/10 p-6 text-center">
                    <p className="text-black/60 text-sm">Selecciona una categoría</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'newsletter' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-black mb-4">
                Suscriptores ({subscribers.length})
              </h2>
              <button
                onClick={async () => {
                  try {
                    const data = await exportSubscribers();
                    const blob = new Blob([data], { type: 'application/json' });
                    const url = URL.createObjectURL(blob);
                    const a = document.createElement('a');
                    a.href = url;
                    a.download = 'suscriptores.json';
                    a.click();
                    URL.revokeObjectURL(url);
                  } catch (error) {
                    console.error('Error exporting subscribers:', error);
                    alert('Error al exportar suscriptores');
                  }
                }}
                className="px-4 py-2 bg-black text-white text-sm font-medium hover:bg-black/90 transition-colors"
              >
                Exportar JSON
              </button>
            </div>
            <div className="border border-black/10">
              <div className="max-h-96 overflow-y-auto">
                <table className="w-full text-sm">
                  <thead className="bg-black/5 sticky top-0">
                    <tr>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-black">Email</th>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-black">Fecha de Suscripción</th>
                    </tr>
                  </thead>
                  <tbody>
                    {subscribers.length === 0 ? (
                      <tr>
                        <td colSpan={2} className="px-4 py-8 text-center text-black/50 font-normal">
                          No hay suscriptores aún
                        </td>
                      </tr>
                    ) : (
                      subscribers.map((sub) => (
                        <tr key={sub.id || sub.email} className="border-t border-black/5">
                          <td className="px-4 py-3 text-black/90 font-normal">{sub.email}</td>
                          <td className="px-4 py-3 text-black/70 font-normal text-sm">
                            {sub.subscribedAt ? new Date(sub.subscribedAt).toLocaleDateString('es-CL') : '-'}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
            <div className="bg-yellow-50 border border-yellow-200 p-4 text-base text-yellow-800 font-normal">
              <p className="mb-2"><strong>Nota:</strong> Los correos se guardan en la base de datos Turso.</p>
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

