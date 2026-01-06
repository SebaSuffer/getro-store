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
  const [visibilityFilter, setVisibilityFilter] = useState<'all' | 'active' | 'inactive'>('all');
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [subscribers, setSubscribers] = useState<any[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [activeTab, setActiveTab] = useState<'products' | 'chains' | 'newsletter' | 'categories' | 'payments' | 'orders'>('products');
  const [orders, setOrders] = useState<any[]>([]);
  const [filteredOrders, setFilteredOrders] = useState<any[]>([]);
  const [orderSearchQuery, setOrderSearchQuery] = useState('');
  const [selectedOrder, setSelectedOrder] = useState<any | null>(null);
  const [editingOrder, setEditingOrder] = useState<any | null>(null);
  const [bankTransferSettings, setBankTransferSettings] = useState<any>({
    bank_name: '',
    account_type: '',
    account_number: '',
    rut: '',
    account_holder: '',
    email: '',
    is_enabled: false,
  });
  const [chains, setChains] = useState<any[]>([]);
  const [editingChain, setEditingChain] = useState<any>(null);
  const [isChainsModalOpen, setIsChainsModalOpen] = useState(false);
  const [selectedPendantChains, setSelectedPendantChains] = useState<Set<string>>(new Set()); // Cadenas ya guardadas en BD
  const [temporarySelectedChain, setTemporarySelectedChain] = useState<string | null>(null); // Cadena seleccionada temporalmente para cálculo
  const [editingVariation, setEditingVariation] = useState<string | null>(null); // Cadena que se está editando
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
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isImageSectionExpanded, setIsImageSectionExpanded] = useState(false);
  const [productVariationsCount, setProductVariationsCount] = useState<Record<string, number>>({});

  useEffect(() => {
    const checkAuth = () => {
      const auth = isAuthenticated();
      setAuthenticated(auth);
      if (auth) {
        setUser(getCurrentUser());
        loadProducts();
        loadSubscribers();
        loadCategories();
        loadChains();
        loadBankTransferSettings();
        loadOrders();
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

  // Cargar cadenas cuando se cambia a la pestaña de cadenas
  useEffect(() => {
    if (activeTab === 'chains') {
      loadChains();
    }
  }, [activeTab]);

  // Cargar órdenes cuando se cambia a la pestaña de órdenes
  useEffect(() => {
    if (activeTab === 'orders') {
      loadOrders();
    }
  }, [activeTab]);

  const loadOrders = async () => {
    try {
      // Primero cancelar órdenes pendientes con más de 3 días
      await fetch('/api/orders', { method: 'PUT' });
      
      // Luego cargar todas las órdenes
      const response = await fetch('/api/orders');
      if (response.ok) {
        const data = await response.json();
        setOrders(data || []);
        setFilteredOrders(data || []);
      }
    } catch (error) {
      console.error('Error loading orders:', error);
      setOrders([]);
      setFilteredOrders([]);
    }
  };

  // Filtrar órdenes por búsqueda
  useEffect(() => {
    if (!orderSearchQuery.trim()) {
      setFilteredOrders(orders);
      return;
    }

    const query = orderSearchQuery.toLowerCase().trim();
    const filtered = orders.filter((order) => {
      const idMatch = order.id?.toLowerCase().includes(query);
      const nameMatch = order.customer_name?.toLowerCase().includes(query);
      const emailMatch = order.customer_email?.toLowerCase().includes(query);
      const phoneMatch = order.customer_phone?.toLowerCase().includes(query);
      const rutMatch = order.customer_rut?.toLowerCase().includes(query);
      
      return idMatch || nameMatch || emailMatch || phoneMatch || rutMatch;
    });
    
    setFilteredOrders(filtered);
  }, [orderSearchQuery, orders]);

  const handleUpdateOrderStatus = async (orderId: string, field: 'payment_status' | 'shipping_status', value: string) => {
    try {
      const updateData: any = { id: orderId };
      updateData[field] = value;
      
      const response = await fetch('/api/orders', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updateData),
      });

      if (response.ok) {
        await loadOrders();
        setToastMessage('Estado actualizado');
        setShowToast(true);
        // Si se está editando esta orden, actualizar el estado local
        if (editingOrder?.id === orderId) {
          setEditingOrder({ ...editingOrder, [field]: value });
        }
        if (selectedOrder?.id === orderId) {
          setSelectedOrder({ ...selectedOrder, [field]: value });
        }
      } else {
        throw new Error('Error al actualizar');
      }
    } catch (error) {
      setToastMessage('Error al actualizar el estado');
      setShowToast(true);
    }
  };

  const handleEditOrder = (order: any) => {
    setEditingOrder(order);
    setSelectedOrder(null);
  };

  const handleSaveOrder = async () => {
    if (!editingOrder) return;
    
    try {
      const updateData: any = { id: editingOrder.id };
      
      if (editingOrder.customer_name) updateData.customer_name = editingOrder.customer_name;
      if (editingOrder.customer_email) updateData.customer_email = editingOrder.customer_email;
      if (editingOrder.customer_phone !== undefined) updateData.customer_phone = editingOrder.customer_phone;
      if (editingOrder.customer_address) updateData.customer_address = editingOrder.customer_address;
      if (editingOrder.customer_rut !== undefined) updateData.customer_rut = editingOrder.customer_rut;
      if (editingOrder.total_amount) updateData.total_amount = editingOrder.total_amount;
      if (editingOrder.payment_status) updateData.payment_status = editingOrder.payment_status;
      if (editingOrder.shipping_status) updateData.shipping_status = editingOrder.shipping_status;
      if (editingOrder.status) updateData.status = editingOrder.status;
      
      const response = await fetch('/api/orders', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updateData),
      });

      if (response.ok) {
        await loadOrders();
        setEditingOrder(null);
        setToastMessage('Orden actualizada');
        setShowToast(true);
      } else {
        throw new Error('Error al actualizar');
      }
    } catch (error) {
      setToastMessage('Error al actualizar la orden');
      setShowToast(true);
    }
  };

  const handleDeleteOrder = async (orderId: string) => {
    if (!confirm('¿Estás seguro de que deseas eliminar esta orden? Esta acción no se puede deshacer.')) {
      return;
    }

    try {
      const response = await fetch(`/api/orders?id=${orderId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        await loadOrders();
        if (selectedOrder?.id === orderId) {
          setSelectedOrder(null);
        }
        if (editingOrder?.id === orderId) {
          setEditingOrder(null);
        }
        setToastMessage('Orden eliminada');
        setShowToast(true);
      } else {
        throw new Error('Error al eliminar');
      }
    } catch (error) {
      setToastMessage('Error al eliminar la orden');
      setShowToast(true);
    }
  };

  const handleMarkAsCompleted = async (orderId: string) => {
    if (!confirm('¿Marcar esta orden como concretada?')) {
      return;
    }

    try {
      const response = await fetch('/api/orders', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: orderId,
          status: 'completed',
          payment_status: 'approved',
        }),
      });

      if (response.ok) {
        await loadOrders();
        if (selectedOrder?.id === orderId) {
          setSelectedOrder({ ...selectedOrder, status: 'completed', payment_status: 'approved' });
        }
        if (editingOrder?.id === orderId) {
          setEditingOrder({ ...editingOrder, status: 'completed', payment_status: 'approved' });
        }
        setToastMessage('Orden marcada como concretada');
        setShowToast(true);
      } else {
        throw new Error('Error al actualizar');
      }
    } catch (error) {
      setToastMessage('Error al marcar como concretada');
      setShowToast(true);
    }
  };

  const loadProducts = async () => {
    try {
      // En el admin, cargar todos los productos (incluyendo inactivos)
      const response = await fetch('/api/products?admin=true');
      if (!response.ok) throw new Error('Error al cargar productos');
      const allProducts = await response.json();
      setProducts(allProducts);
      setFilteredProducts(allProducts);
      
      // Cargar número de variaciones para cada colgante
      const variationsCount: Record<string, number> = {};
      for (const product of allProducts) {
        if (product.category === 'Colgantes') {
          try {
            const response = await fetch(`/api/pendants/${product.id}/chains`);
            if (response.ok) {
              const chains = await response.json();
              variationsCount[product.id] = chains.length || 1; // Default 1 si no hay cadenas
            } else {
              variationsCount[product.id] = 1; // Default 1
            }
          } catch (error) {
            variationsCount[product.id] = 1; // Default 1 en caso de error
          }
        } else {
          variationsCount[product.id] = 0; // No aplica para otros productos
        }
      }
      setProductVariationsCount(variationsCount);
    } catch (error) {
      console.error('Error loading products:', error);
      setProducts([]);
      setFilteredProducts([]);
    }
  };

  const loadChains = async () => {
    try {
      const response = await fetch('/api/chains/manage');
      if (response.ok) {
        const data = await response.json();
        setChains(data || []);
      }
    } catch (error) {
      console.error('Error loading chains:', error);
      setChains([]);
    }
  };

  // Filtrar productos por búsqueda y visibilidad
  useEffect(() => {
    let filtered = products;

    // Filtrar por visibilidad
    if (visibilityFilter === 'active') {
      filtered = filtered.filter(p => p.is_active !== false);
    } else if (visibilityFilter === 'inactive') {
      filtered = filtered.filter(p => p.is_active === false);
    }

    // Filtrar por búsqueda
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase().trim();
      filtered = filtered.filter((product) => {
        return (
          product.name.toLowerCase().includes(query) ||
          product.category.toLowerCase().includes(query) ||
          (product.description && product.description.toLowerCase().includes(query)) ||
          product.id.toLowerCase().includes(query)
        );
      });
    }

    setFilteredProducts(filtered);
  }, [searchQuery, products, visibilityFilter]);

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

  const loadBankTransferSettings = async () => {
    try {
      const response = await fetch('/api/bank-transfer-settings');
      if (response.ok) {
        const data = await response.json();
        setBankTransferSettings(data);
      }
    } catch (error) {
      console.error('Error loading bank transfer settings:', error);
    }
  };

  const handleEditCategory = (category: Category) => {
    setEditingCategory({ ...category });
  };

  const handleSaveCategory = async () => {
    if (!editingCategory) return;
    if (!editingCategory.name && !editingCategory.id) {
      setToastMessage('El nombre es requerido');
      setShowToast(true);
      return;
    }
    if (!editingCategory.image_url || (!editingCategory.image_url.startsWith('http://') && !editingCategory.image_url.startsWith('https://'))) {
      setToastMessage('URL válida requerida (http:// o https://)');
      setShowToast(true);
      return;
    }
    try {
      const method = editingCategory.id ? 'PUT' : 'POST';
      const response = await fetch('/api/categories', {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editingCategory),
      });
      if (response.ok) {
        await loadCategories();
        setEditingCategory(null);
        setToastMessage(editingCategory.id ? 'Categoría actualizada' : 'Categoría creada');
        setShowToast(true);
      } else {
        throw new Error('Error al guardar');
      }
    } catch (error: any) {
      setToastMessage('Error al guardar la categoría');
      setShowToast(true);
    }
  };

  const handleLogout = () => {
    logout();
    window.location.href = '/login';
  };

  const handleEditProduct = async (product: Product, fromTab: 'products' = 'products') => {
    try {
      console.log(`[ADMIN] ✏️ Editing product: ${product.id} - ${product.name} from ${fromTab}`);
    setSelectedProduct(product);
    setEditingProduct({ ...product });
    setIsCreating(false);
      setIsEditModalOpen(true);
      
      // Inicializar customDisplayPrice con display_price si existe
      if ((product as any).display_price) {
        setCustomDisplayPrice((product as any).display_price);
      } else {
        setCustomDisplayPrice(null);
      }
      
      // Cargar imágenes del producto (no bloquear si falla)
      if (product.id && !product.id.startsWith('new-')) {
        loadProductImages(product.id).catch((err) => {
          console.warn(`[ADMIN] ⚠️ Could not load images for ${product.id}, continuing anyway:`, err);
        });
        
        // Si es un colgante, cargar cadenas disponibles y calcular precio
        if (product.category === 'Colgantes') {
          try {
            const chainsResponse = await fetch(`/api/pendants/${product.id}/chains`);
            if (chainsResponse.ok) {
              const chains = await chainsResponse.json();
              
              // Si no hay cadenas, agregar PLATA 925 automáticamente
              if (chains.length === 0) {
                try {
                  await fetch(`/api/pendants/${product.id}/chains`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ chainBrands: ['PLATA 925'] }),
                  });
                  // Recargar después de agregar
                  const reloadResponse = await fetch(`/api/pendants/${product.id}/chains`);
                  if (reloadResponse.ok) {
                    const reloadedChains = await reloadResponse.json();
                    const selectedBrands = new Set<string>(reloadedChains.map((c: any) => c.brand as string));
                    setSelectedPendantChains(selectedBrands);
                    // No seleccionar automáticamente, el usuario puede elegir
                  }
                } catch (error) {
                  console.error('Error adding default chain:', error);
                }
              } else {
                // Ya hay cadenas, cargarlas normalmente
                const selectedBrands = new Set<string>(chains.map((c: any) => c.brand as string));
                setSelectedPendantChains(selectedBrands);
                
                // Las cadenas ya están guardadas, solo mostrarlas
                // No seleccionar automáticamente ninguna para cálculo
                // El usuario puede seleccionar una nueva si quiere
              }
            }
          } catch (error) {
            console.error('Error loading pendant chains:', error);
          }
        } else {
          // Limpiar selección si no es colgante
          setSelectedPendantChains(new Set());
        }
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
      is_active: true,
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
    const nonChainProducts = filteredProducts.filter(p => p.category !== 'Cadenas');
    if (selectedProducts.size === nonChainProducts.length && nonChainProducts.length > 0) {
      setSelectedProducts(new Set());
    } else {
      setSelectedProducts(new Set(nonChainProducts.map(p => p.id)));
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
            is_active: editingProduct.is_active !== false,
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
            is_active: editingProduct.is_active !== false,
            chain_type: (editingProduct.category === 'Cadenas' || editingProduct.category === 'Colgantes') ? chainType : undefined,
          }),
        });
      }

      if (!response.ok) {
        throw new Error(isCreating ? 'Error al crear el producto' : 'Error al actualizar el producto');
      }

      const result = await response.json();
      const savedProductId = result.id || editingProduct.id;

      // Si es un colgante, guardar las cadenas disponibles
      if (editingProduct.category === 'Colgantes' && savedProductId && selectedPendantChains.size > 0) {
        try {
          await fetch(`/api/pendants/${savedProductId}/chains`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              chainBrands: Array.from(selectedPendantChains),
            }),
          });
        } catch (error) {
          console.error('Error saving pendant chains:', error);
        }
      }

      // Actualizar lista
      await loadProducts();
      
      // Si estamos en Stock, actualizar selectedProductForView y cerrar modal si está abierto
      if (activeTab === 'products' && selectedProductForView && selectedProductForView.id === savedProductId) {
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
            onClick={() => setActiveTab('chains')}
            className={`px-6 py-3 text-sm font-medium transition-colors border-b-2 ${
              activeTab === 'chains'
                ? 'border-black text-black'
                : 'border-transparent text-black/40 hover:text-black/60'
            }`}
          >
            Cadenas
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
          <button
            onClick={() => setActiveTab('payments')}
            className={`px-6 py-3 text-sm font-medium transition-colors border-b-2 ${
              activeTab === 'payments'
                ? 'border-black text-black'
                : 'border-transparent text-black/40 hover:text-black/60'
            }`}
          >
            Pagos
          </button>
          <button
            onClick={() => setActiveTab('orders')}
            className={`px-6 py-3 text-sm font-medium transition-colors border-b-2 ${
              activeTab === 'orders'
                ? 'border-black text-black'
                : 'border-transparent text-black/40 hover:text-black/60'
            }`}
          >
            Órdenes
          </button>
        </div>

        {activeTab === 'products' && (
          <div className="space-y-6">
            {/* Filtros y búsqueda */}
            <div className="flex flex-col sm:flex-row gap-4 mb-6">
              <div className="flex-1">
                <input
                  type="text"
                  placeholder="Buscar productos..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-white border border-black/20 px-4 py-2.5 text-black text-base font-normal focus:outline-none focus:border-black/40"
                />
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => setVisibilityFilter('all')}
                  className={`px-4 py-2.5 text-sm font-medium transition-colors ${
                    visibilityFilter === 'all'
                      ? 'bg-black text-white'
                      : 'bg-white border border-black/20 text-black hover:border-black/40'
                  }`}
                >
                  Todos
                </button>
                <button
                  onClick={() => setVisibilityFilter('active')}
                  className={`px-4 py-2.5 text-sm font-medium transition-colors ${
                    visibilityFilter === 'active'
                      ? 'bg-black text-white'
                      : 'bg-white border border-black/20 text-black hover:border-black/40'
                  }`}
                >
                  Visibles
                </button>
                <button
                  onClick={() => setVisibilityFilter('inactive')}
                  className={`px-4 py-2.5 text-sm font-medium transition-colors ${
                    visibilityFilter === 'inactive'
                      ? 'bg-black text-white'
                      : 'bg-white border border-black/20 text-black hover:border-black/40'
                  }`}
                >
                  Ocultos
                </button>
              </div>
            </div>

            {/* Tabla de productos (fusionada de Stock) */}
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-2xl font-bold text-black">Gestión de Productos</h2>
                <p className="text-base text-black/60 mt-1">
                  {products.filter(p => p.is_featured && p.category !== 'Cadenas').length} de 8 productos destacados
                  {visibilityFilter !== 'all' && (
                    <span className="ml-2">
                      ({filteredProducts.filter(p => p.category !== 'Cadenas').length} {visibilityFilter === 'active' ? 'visibles' : 'ocultos'})
                    </span>
                  )}
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
                          checked={selectedProducts.size === products.filter(p => p.category !== 'Cadenas').length && products.filter(p => p.category !== 'Cadenas').length > 0}
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
                      <th className="px-6 py-4 text-left text-base font-semibold text-black">Variaciones</th>
                      <th className="px-6 py-4 text-left text-base font-semibold text-black">Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredProducts.filter(p => p.category !== 'Cadenas').length === 0 ? (
                      <tr>
                        <td colSpan={9} className="px-6 py-12 text-center text-black/50 font-normal text-base">
                          No hay productos disponibles
                        </td>
                      </tr>
                    ) : (
                      filteredProducts.filter(p => p.category !== 'Cadenas').map((product) => (
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
                          <td className="px-6 py-4 text-black/90 font-normal text-base">
                            {product.category === 'Colgantes' ? (
                              <span className="font-semibold">{productVariationsCount[product.id] ?? 1}</span>
                            ) : (
                              <span className="text-black/40">-</span>
                            )}
                          </td>
                          <td className="px-6 py-4">
                            <button
                              onClick={() => handleEditProduct(product, 'products')}
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

        {/* Pestaña de Cadenas */}
        {activeTab === 'chains' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-black">Gestión de Cadenas</h2>
              <button
                onClick={() => {
                  setEditingChain({ brand: '', name: '', price: 0, stock: 0, image_url: '', image_alt: '', description: '', is_active: true });
                  setIsChainsModalOpen(true);
                }}
                className="px-6 py-3 bg-black text-white text-base font-medium hover:bg-black/90 transition-colors flex items-center gap-2"
              >
                <span className="material-symbols-outlined" style={{ fontSize: '20px', fontWeight: 300 }}>add</span>
                Añadir Cadena
              </button>
            </div>
            
            <div className="border border-black/10">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-black/5 sticky top-0">
                    <tr>
                      <th className="px-6 py-4 text-left text-base font-semibold text-black">Imagen</th>
                      <th className="px-6 py-4 text-left text-base font-semibold text-black">Marca</th>
                      <th className="px-6 py-4 text-left text-base font-semibold text-black">Precio</th>
                      <th className="px-6 py-4 text-left text-base font-semibold text-black">Stock</th>
                      <th className="px-6 py-4 text-left text-base font-semibold text-black">Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {chains.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="px-6 py-12 text-center text-black/50 font-normal text-base">
                          No hay cadenas disponibles
                        </td>
                      </tr>
                    ) : (
                      chains.map((chain: any) => (
                        <tr 
                          key={chain.id} 
                          className="border-t border-black/5 hover:bg-black/2 transition-colors"
                        >
                          <td className="px-6 py-4">
                            <div className="w-48 h-48 overflow-hidden bg-gray-50 border border-black/10 hover:border-black/30 transition-colors relative flex items-center justify-center">
                              {!chain.image_url || chain.image_url.trim() === '' ? (
                                <span className="text-xs text-gray-400 font-normal">Sin imagen</span>
                              ) : (
                                <img
                                  src={chain.image_url}
                                  alt={chain.image_alt || chain.brand}
                                  className="w-full h-full object-contain"
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
                              )}
                            </div>
                          </td>
                          <td className="px-6 py-4 text-black/90 font-semibold text-base">{chain.brand}</td>
                          <td className="px-6 py-4 text-black/90 font-normal text-base">${chain.price.toLocaleString('es-CL')} CLP</td>
                          <td className="px-6 py-4">
                            <span className={`font-semibold text-base ${chain.stock > 0 ? 'text-green-600' : 'text-red-600'}`}>
                              {chain.stock}
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            <button
                              onClick={() => {
                                setEditingChain(chain);
                                setIsChainsModalOpen(true);
                              }}
                              className="px-4 py-2 bg-black text-white text-sm font-medium hover:bg-black/90 transition-colors mr-2"
                            >
                              Editar
                            </button>
                            <button
                              onClick={async () => {
                                if (confirm(`¿Eliminar cadena ${chain.brand}?`)) {
                                  try {
                                    const response = await fetch('/api/chains/manage', {
                                      method: 'DELETE',
                                      headers: { 'Content-Type': 'application/json' },
                                      body: JSON.stringify({ id: chain.id }),
                                    });
                                    if (response.ok) {
                                      await loadChains();
                                      setToastMessage('Cadena eliminada');
                                      setShowToast(true);
                                    }
                                  } catch (error) {
                                    setToastMessage('Error al eliminar cadena');
                                    setShowToast(true);
                                  }
                                }
                              }}
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

        {/* Modal de Edición de Cadena */}
        {isChainsModalOpen && editingChain && (
          <div 
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
            onClick={() => {
              setIsChainsModalOpen(false);
              setEditingChain(null);
            }}
          >
            <div 
              className="w-full max-w-2xl max-h-[90vh] bg-white shadow-xl overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="sticky top-0 bg-white border-b border-black/10 px-6 py-4 flex items-center justify-between z-10">
                <h3 className="text-xl font-semibold text-black">
                  {editingChain.id ? 'Editar Cadena' : 'Nueva Cadena'}
                </h3>
                <button
                  onClick={() => {
                    setIsChainsModalOpen(false);
                    setEditingChain(null);
                  }}
                  className="text-black/60 hover:text-black transition-colors"
                  aria-label="Cerrar"
                >
                  <span className="material-symbols-outlined" style={{ fontSize: '28px', fontWeight: 300 }}>close</span>
                </button>
              </div>
              
              <div className="p-6 space-y-6">
                <div>
                  <label className="block text-sm font-semibold text-black mb-2">
                    Marca <span className="text-red-600">*</span>
                  </label>
                  <input
                    type="text"
                    value={editingChain.brand || ''}
                    onChange={(e) => setEditingChain({ ...editingChain, brand: e.target.value, name: e.target.value })}
                    placeholder="Ej: CARTIER, GUCCI, TRADICIONAL"
                    className="w-full bg-white border border-black/20 px-4 py-2.5 text-black text-base font-normal focus:outline-none focus:border-black/40 focus:ring-1 focus:ring-black/10 transition-all"
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-black mb-2">
                      Precio (CLP)
                    </label>
                    <input
                      type="number"
                      value={editingChain.price || 0}
                      onChange={(e) => setEditingChain({ ...editingChain, price: parseInt(e.target.value) || 0 })}
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
                      value={editingChain.stock || 0}
                      onChange={(e) => setEditingChain({ ...editingChain, stock: parseInt(e.target.value) || 0 })}
                      min="0"
                      className="w-full bg-white border border-black/20 px-4 py-2.5 text-black text-base font-normal focus:outline-none focus:border-black/40 focus:ring-1 focus:ring-black/10 transition-all"
                    />
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-semibold text-black mb-2">
                    URL de Imagen
                  </label>
                  <input
                    type="url"
                    value={editingChain.image_url || ''}
                    onChange={(e) => setEditingChain({ ...editingChain, image_url: e.target.value })}
                    placeholder="https://..."
                    className="w-full bg-white border border-black/20 px-4 py-2.5 text-black text-base font-normal focus:outline-none focus:border-black/40 focus:ring-1 focus:ring-black/10 transition-all"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-semibold text-black mb-2">
                    Descripción
                  </label>
                  <textarea
                    value={editingChain.description || ''}
                    onChange={(e) => setEditingChain({ ...editingChain, description: e.target.value })}
                    rows={3}
                    className="w-full bg-white border border-black/20 px-4 py-2.5 text-black text-base font-normal focus:outline-none focus:border-black/40 focus:ring-1 focus:ring-black/10 transition-all"
                  />
                </div>
                
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={editingChain.is_active !== false}
                    onChange={(e) => setEditingChain({ ...editingChain, is_active: e.target.checked })}
                    className="w-4 h-4 text-black focus:ring-black cursor-pointer"
                  />
                  <label className="text-sm font-normal text-black">Cadena activa</label>
                </div>
                
                <div className="flex gap-3 pt-4 border-t border-black/10">
                  <button
                    onClick={async () => {
                      if (!editingChain.brand) {
                        setToastMessage('La marca es requerida');
                        setShowToast(true);
                        return;
                      }
                      
                      try {
                        // Usar la marca como nombre si no hay nombre
                        const chainData = {
                          ...editingChain,
                          name: editingChain.brand || editingChain.name,
                          thickness: null,
                          length: null,
                          // Convertir cadenas vacías a null o undefined
                          image_url: editingChain.image_url?.trim() || null,
                          image_alt: editingChain.image_alt?.trim() || null,
                          description: editingChain.description?.trim() || null,
                        };
                        
                        const response = await fetch('/api/chains/manage', {
                          method: 'POST',
                          headers: { 'Content-Type': 'application/json' },
                          body: JSON.stringify(chainData),
                        });
                        
                        if (response.ok) {
                          await loadChains();
                          setIsChainsModalOpen(false);
                          setEditingChain(null);
                          setToastMessage('Cadena guardada correctamente');
                          setShowToast(true);
                        } else {
                          const errorData = await response.json().catch(() => ({ error: 'Error desconocido' }));
                          throw new Error(errorData.error || 'Error al guardar');
                        }
                      } catch (error: any) {
                        console.error('Error saving chain:', error);
                        setToastMessage(error.message || 'Error al guardar cadena');
                        setShowToast(true);
                      }
                    }}
                    className="flex-1 px-6 py-3 bg-black text-white text-base font-medium hover:bg-black/90 transition-colors"
                  >
                    Guardar
                  </button>
                  <button
                    onClick={() => {
                      setIsChainsModalOpen(false);
                      setEditingChain(null);
                    }}
                    className="px-6 py-3 bg-white border border-black/20 text-black text-base font-medium hover:border-black/40 transition-colors"
                  >
                    Cancelar
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Contenido antiguo de products (lista simple) - se puede eliminar o mantener como alternativa */}
        {false && activeTab === 'products' && (
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
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={editingProduct.is_active !== false}
                        onChange={(e) => setEditingProduct({ ...editingProduct, is_active: e.target.checked })}
                        className="w-4 h-4 text-black focus:ring-black cursor-pointer"
                      />
                      <span className="text-sm font-normal text-black">Mostrar en Landing Page</span>
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
              className="w-full max-w-7xl max-h-[95vh] bg-white shadow-xl overflow-hidden flex flex-col"
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
              
              <div className="flex-1 overflow-y-auto">
                <div className="p-6">
                  {/* Layout 2x2: Foto | Detalles | Variaciones | Cálculos */}
                  <div className="grid grid-cols-2 grid-rows-2 gap-x-6 gap-y-4 items-start h-full min-h-[700px]">
                    {/* Cuadrante 1: Foto (arriba izquierda) */}
                    <div className="space-y-4 max-h-full overflow-y-auto">
                      <h3 className="text-lg font-semibold text-black">Foto</h3>
                      
                      {/* Carousel de imágenes */}
                      <div className="w-full aspect-square overflow-hidden bg-gray-50 border-2 border-black/10 rounded-lg relative group">
                        {/* Imagen principal o carousel */}
                        {(() => {
                          const allImages = [
                            { id: 'main', image_url: editingProduct.image_url, image_alt: editingProduct.image_alt || editingProduct.name },
                            ...productImages
                          ].filter(img => img.image_url && img.image_url.trim() !== '');
                          
                          if (allImages.length === 0) {
                            return (
                              <div className="w-full h-full flex items-center justify-center text-black/40">
                                Sin imagen
                              </div>
                            );
                          }
                          
                          const currentImage = allImages[currentImageIndex] || allImages[0];
                          
                          return (
                            <>
                              <img
                                key={currentImage.id}
                                src={currentImage.image_url}
                                alt={currentImage.image_alt || editingProduct.name}
                                className="w-full h-full object-cover transition-opacity duration-300"
                                onError={(e) => {
                                  const target = e.target as HTMLImageElement;
                                  target.src = 'https://via.placeholder.com/400?text=Imagen+no+disponible';
                                }}
                              />
                              
                              {/* Navegación del carousel */}
                              {allImages.length > 1 && (
                                <>
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      setCurrentImageIndex((prev) => (prev - 1 + allImages.length) % allImages.length);
                                    }}
                                    className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/60 hover:bg-black/80 text-white p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                                    aria-label="Imagen anterior"
                                  >
                                    <span className="material-symbols-outlined" style={{ fontSize: '20px', fontWeight: 300 }}>
                                      chevron_left
                                    </span>
                                  </button>
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      setCurrentImageIndex((prev) => (prev + 1) % allImages.length);
                                    }}
                                    className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/60 hover:bg-black/80 text-white p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                                    aria-label="Imagen siguiente"
                                  >
                                    <span className="material-symbols-outlined" style={{ fontSize: '20px', fontWeight: 300 }}>
                                      chevron_right
                                    </span>
                                  </button>
                                  
                                  {/* Indicadores de posición */}
                                  <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1">
                                    {allImages.map((_, idx) => (
                                      <button
                                        key={idx}
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          setCurrentImageIndex(idx);
                                        }}
                                        className={`w-2 h-2 rounded-full transition-all ${
                                          idx === currentImageIndex ? 'bg-white' : 'bg-white/40'
                                        }`}
                                        aria-label={`Ir a imagen ${idx + 1}`}
                                      />
                                    ))}
                                  </div>
                                </>
                              )}
                            </>
                          );
                        })()}
                      </div>
                      
                      {/* URL de imagen principal */}
                      <div>
                        <label className="block text-sm font-semibold text-black mb-2">URL de la Imagen Principal</label>
                        <input
                          type="url"
                          value={editingProduct.image_url}
                          onChange={(e) => setEditingProduct({ ...editingProduct, image_url: e.target.value })}
                          placeholder="https://ejemplo.com/imagen.jpg"
                          className="w-full bg-white border border-black/20 px-3 py-2 text-sm text-black font-normal focus:outline-none focus:border-black/40 rounded"
                        />
                      </div>
                      
                      {/* Sección desplegable para agregar más fotos */}
                      {editingProduct.id && !editingProduct.id.startsWith('new-') && (
                        <div className="border border-black/10 rounded-lg overflow-hidden">
                          <button
                            onClick={() => setIsImageSectionExpanded(!isImageSectionExpanded)}
                            className="w-full px-3 py-2 bg-gray-50 hover:bg-gray-100 flex items-center justify-between text-sm font-semibold text-black transition-colors"
                          >
                            <span>Imágenes Adicionales ({productImages.length})</span>
                            <span className={`material-symbols-outlined transition-transform ${isImageSectionExpanded ? 'rotate-180' : ''}`} style={{ fontSize: '20px', fontWeight: 300 }}>
                              expand_more
                            </span>
                          </button>
                          
                          {isImageSectionExpanded && (
                            <div className="p-3 space-y-3 bg-white">
                              {/* Miniaturas de imágenes adicionales */}
                              {productImages.length > 0 && (
                                <div className="grid grid-cols-3 gap-2">
                                  {productImages.map((img, idx) => (
                                    <div key={img.id} className="relative group">
                                      <img 
                                        src={img.image_url} 
                                        alt={img.image_alt} 
                                        className="w-full aspect-square object-cover border border-black/10 rounded cursor-pointer"
                                        onClick={() => setCurrentImageIndex(idx + 1)}
                                      />
                                      <button
                                        onClick={() => handleDeleteImage(img.id)}
                                        className="absolute top-1 right-1 bg-red-600 text-white p-1 rounded opacity-0 group-hover:opacity-100 transition-opacity"
                                        aria-label="Eliminar imagen"
                                      >
                                        <span className="material-symbols-outlined" style={{ fontSize: '14px', fontWeight: 300 }}>delete</span>
                                      </button>
                                    </div>
                                  ))}
                                </div>
                              )}
                              
                              {/* Formulario para agregar nueva imagen */}
                              <div className="flex gap-2">
                                <input
                                  type="url"
                                  value={newImageUrl}
                                  onChange={(e) => setNewImageUrl(e.target.value)}
                                  placeholder="URL de nueva imagen"
                                  className="flex-1 bg-white border border-black/20 px-3 py-2 text-sm text-black font-normal focus:outline-none focus:border-black/40 rounded"
                                />
                                <button
                                  onClick={handleAddImage}
                                  className="px-4 py-2 bg-black text-white text-sm font-medium hover:bg-black/90 transition-colors flex items-center gap-2 rounded"
                                >
                                  <span className="material-symbols-outlined" style={{ fontSize: '18px', fontWeight: 300 }}>add</span>
                                  Agregar
                                </button>
                              </div>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                    
                    {/* Cuadrante 2: Detalles (arriba derecha) */}
                    <div className="space-y-4 max-h-full overflow-y-auto">
                      <h3 className="text-lg font-semibold text-black">Detalles</h3>
                      <div className="space-y-4">
                        <div>
                          <label className="block text-sm font-semibold text-black mb-2">Nombre del Producto</label>
                          <input
                            type="text"
                            value={editingProduct.name}
                            onChange={(e) => setEditingProduct({ ...editingProduct, name: e.target.value })}
                            className="w-full bg-white border border-black/20 px-3 py-2 text-sm text-black font-normal focus:outline-none focus:border-black/40 rounded"
                          />
                        </div>
                        
                        <div>
                          <label className="block text-sm font-semibold text-black mb-2">Categoría</label>
                          <select
                            value={editingProduct.category}
                            onChange={(e) => setEditingProduct({ ...editingProduct, category: e.target.value })}
                            className="w-full bg-white border border-black/20 px-3 py-2 text-sm text-black font-normal focus:outline-none focus:border-black/40 rounded"
                          >
                            {CATEGORIES.map((category) => (
                              <option key={category} value={category}>{category}</option>
                            ))}
                          </select>
                        </div>
                        
                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <label className="block text-sm font-semibold text-black mb-2">Precio (CLP)</label>
                            <input
                              type="number"
                              value={editingProduct.price}
                              onChange={(e) => setEditingProduct({ ...editingProduct, price: parseInt(e.target.value) || 0 })}
                              min="0"
                              className="w-full bg-white border border-black/20 px-3 py-2 text-sm text-black font-normal focus:outline-none focus:border-black/40 rounded"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-semibold text-black mb-2">Stock</label>
                            <input
                              type="number"
                              value={editingProduct.stock}
                              onChange={(e) => setEditingProduct({ ...editingProduct, stock: parseInt(e.target.value) || 0 })}
                              min="0"
                              className="w-full bg-white border border-black/20 px-3 py-2 text-sm text-black font-normal focus:outline-none focus:border-black/40 rounded"
                            />
                          </div>
                        </div>
                        
                        <div>
                          <label className="block text-sm font-semibold text-black mb-2">Descripción</label>
                          <textarea
                            value={editingProduct.description || ''}
                            onChange={(e) => setEditingProduct({ ...editingProduct, description: e.target.value })}
                            rows={4}
                            className="w-full bg-white border border-black/20 px-3 py-2 text-sm text-black font-normal focus:outline-none focus:border-black/40 resize-none rounded"
                          />
                        </div>
                        
                        <div className="flex gap-4">
                          <label className="flex items-center gap-2 cursor-pointer">
                            <input
                              type="checkbox"
                              checked={editingProduct.is_new || false}
                              onChange={(e) => setEditingProduct({ ...editingProduct, is_new: e.target.checked })}
                              className="w-4 h-4 text-black focus:ring-black cursor-pointer"
                            />
                            <span className="text-sm font-normal text-black">Producto Nuevo</span>
                          </label>
                          <label className="flex items-center gap-2 cursor-pointer group">
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
                            }`} style={{ fontSize: '24px', fontWeight: 300 }}>
                              star
                            </span>
                            <span className="text-sm font-normal text-black">Destacado</span>
                          </label>
                        </div>
                      </div>
                    </div>

                    {/* Cuadrante 3: Variaciones/Nombres (abajo izquierda) - Solo para Colgantes */}
                    {editingProduct.category === 'Colgantes' && editingProduct.id && !editingProduct.id.startsWith('new-') ? (
                      <div className="space-y-4 max-h-full overflow-y-auto">
                        <h3 className="text-lg font-semibold text-black">Variaciones</h3>
                        
                        {/* Cadenas ya guardadas */}
                        {selectedPendantChains.size > 0 && (
                          <div className="space-y-2">
                            <p className="text-sm font-semibold text-black">Cadenas guardadas:</p>
                            <div className="space-y-2">
                              {Array.from(selectedPendantChains).map((brand) => {
                                const chain = chains.find((c: any) => c.brand === brand);
                                if (!chain) return null;
                                const isEditing = editingVariation === brand;
                                
                                return (
                                  <div
                                    key={chain.id}
                                    className="flex items-center justify-between p-3 border-2 border-gray-300 bg-gray-100 rounded-lg"
                                  >
                                    <div>
                                      <span className="text-base font-semibold text-black block">{chain.brand}</span>
                                      <span className="text-sm text-black/70">
                                        ${chain.price.toLocaleString('es-CL')} CLP
                                      </span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                      <button
                                        onClick={async () => {
                                          if (isEditing) {
                                            // Cancelar edición
                                            setEditingVariation(null);
                                            setTemporarySelectedChain(null);
                                            setSelectedVariationForPrice(null);
                                            setCalculatedSumPrice(null);
                                            setCalculatedDisplayPrice(null);
                                            setCustomDisplayPrice(null);
                                          } else {
                                            // Iniciar edición: seleccionar esta cadena para cálculo
                                            setEditingVariation(brand);
                                            setTemporarySelectedChain(brand);
                                            
                                            // Calcular precio
                                            const sumPrice = editingProduct.price + chain.price;
                                            const { roundToProfessionalPrice } = await import('../utils/priceRounding');
                                            const roundedPrice = roundToProfessionalPrice(sumPrice);
                                            setCalculatedSumPrice(sumPrice);
                                            setCalculatedDisplayPrice(roundedPrice);
                                            setCustomDisplayPrice((editingProduct as any).display_price || roundedPrice);
                                            setSelectedVariationForPrice(chain);
                                          }
                                        }}
                                        className={`px-3 py-1 text-xs font-medium transition-colors rounded ${
                                          isEditing
                                            ? 'bg-blue-600 text-white hover:bg-blue-700'
                                            : 'bg-black text-white hover:bg-black/90'
                                        }`}
                                      >
                                        {isEditing ? 'Cancelar' : 'Editar'}
                                      </button>
                                      <button
                                        onClick={async () => {
                                          try {
                                            // Eliminar esta cadena de las guardadas
                                            const newSaved = new Set(selectedPendantChains);
                                            newSaved.delete(brand);
                                            
                                            // Actualizar en BD
                                            const response = await fetch(`/api/pendants/${editingProduct.id}/chains`, {
                                              method: 'POST',
                                              headers: { 'Content-Type': 'application/json' },
                                              body: JSON.stringify({
                                                chainBrands: Array.from(newSaved),
                                              }),
                                            });
                                            
                                            if (response.ok) {
                                              setSelectedPendantChains(newSaved);
                                              // Si era la cadena seleccionada para cálculo, limpiar
                                              if (selectedVariationForPrice?.brand === brand || editingVariation === brand) {
                                                setSelectedVariationForPrice(null);
                                                setEditingVariation(null);
                                                setTemporarySelectedChain(null);
                                                setCalculatedSumPrice(null);
                                                setCalculatedDisplayPrice(null);
                                                setCustomDisplayPrice(null);
                                              }
                                              setToastMessage('Cadena eliminada correctamente');
                                              setShowToast(true);
                                              // Recargar productos para actualizar contador
                                              await loadProducts();
                                            } else {
                                              throw new Error('Error al eliminar');
                                            }
                                          } catch (error) {
                                            setToastMessage('Error al eliminar la cadena');
                                            setShowToast(true);
                                          }
                                        }}
                                        className="px-3 py-1 bg-red-600 text-white text-xs font-medium hover:bg-red-700 transition-colors rounded"
                                      >
                                        Eliminar
                                      </button>
                                    </div>
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        )}
                        
                        {/* Seleccionar nueva cadena */}
                        <div className="space-y-2">
                          <p className="text-sm font-semibold text-black">Agregar nueva cadena:</p>
                          <div className="space-y-2 max-h-[300px] overflow-y-auto pr-2">
                            {chains
                              .filter((c: any) => c.is_active && !selectedPendantChains.has(c.brand))
                              .map((chain: any) => {
                                const isSelected = temporarySelectedChain === chain.brand;
                                
                                return (
                                  <label
                                    key={chain.id}
                                    className={`flex items-center gap-3 p-3 border-2 transition-colors cursor-pointer rounded-lg ${
                                      isSelected
                                        ? 'border-blue-500 bg-blue-50'
                                        : 'border-black/10 hover:border-black/20 bg-white'
                                    }`}
                                  >
                                    <input
                                      type="radio"
                                      name="chain-selection"
                                      checked={isSelected}
                                      onClick={async (e) => {
                                        // Permitir deseleccionar si ya está seleccionado
                                        if (isSelected) {
                                          e.preventDefault();
                                          setTemporarySelectedChain(null);
                                          setSelectedVariationForPrice(null);
                                          setEditingVariation(null);
                                          setCalculatedSumPrice(null);
                                          setCalculatedDisplayPrice(null);
                                          setCustomDisplayPrice(null);
                                        } else {
                                          setTemporarySelectedChain(chain.brand);
                                          setEditingVariation(null); // Asegurar que no hay otra en edición
                                          
                                          // Calcular precio
                                          const sumPrice = editingProduct.price + chain.price;
                                          const { roundToProfessionalPrice } = await import('../utils/priceRounding');
                                          const roundedPrice = roundToProfessionalPrice(sumPrice);
                                          setCalculatedSumPrice(sumPrice);
                                          setCalculatedDisplayPrice(roundedPrice);
                                          // Usar display_price existente si existe, sino el precio redondeado calculado
                                          const existingDisplayPrice = (editingProduct as any).display_price;
                                          setCustomDisplayPrice(existingDisplayPrice || roundedPrice);
                                          setSelectedVariationForPrice(chain);
                                        }
                                      }}
                                      onChange={() => {}} // Manejar todo en onClick
                                      className="w-5 h-5 text-blue-600 focus:ring-blue-500 cursor-pointer"
                                    />
                                    <div className="flex-1">
                                      <span className="text-base font-semibold text-black block">
                                        {chain.brand}
                                      </span>
                                      <span className="text-sm text-black/70">
                                        ${chain.price.toLocaleString('es-CL')} CLP
                                      </span>
                                    </div>
                                  </label>
                                );
                              })}
                          </div>
                        </div>
                        
                        {temporarySelectedChain && selectedVariationForPrice && (
                          <div className="mt-2 p-2 bg-blue-50 border border-blue-200 rounded text-sm">
                            <p className="font-semibold text-blue-900 mb-1">
                              {editingVariation ? 'Variación en edición:' : 'Cadena a guardar:'}
                            </p>
                            <p className="text-blue-700">
                              {selectedVariationForPrice.brand} - ${selectedVariationForPrice.price.toLocaleString('es-CL')} CLP
                            </p>
                            <p className="text-blue-600 mt-1 text-xs">
                              {editingVariation 
                                ? 'Presiona "Actualizar Variación y Precio" para guardar los cambios'
                                : 'Presiona "Guardar Cadenas y Precio" para guardar esta cadena'}
                            </p>
                          </div>
                        )}
                        
                        <button
                          onClick={async () => {
                            if (!temporarySelectedChain || !selectedVariationForPrice) {
                              setToastMessage('Debe seleccionar una cadena para guardar');
                              setShowToast(true);
                              return;
                            }
                            try {
                              // Si está editando una existente, solo actualizar precio
                              // Si es nueva, agregarla a las guardadas
                              const newSaved = new Set(selectedPendantChains);
                              if (!newSaved.has(temporarySelectedChain)) {
                                newSaved.add(temporarySelectedChain);
                              }
                              
                              const response = await fetch(`/api/pendants/${editingProduct.id}/chains`, {
                                method: 'POST',
                                headers: { 'Content-Type': 'application/json' },
                                body: JSON.stringify({
                                  chainBrands: Array.from(newSaved),
                                }),
                              });
                              if (response.ok) {
                                // Si hay un precio de exhibición calculado, guardarlo en display_price
                                if (customDisplayPrice && selectedVariationForPrice) {
                                  try {
                                    await fetch(`/api/products/${editingProduct.id}`, {
                                      method: 'PUT',
                                      headers: { 'Content-Type': 'application/json' },
                                      body: JSON.stringify({
                                        ...editingProduct,
                                        display_price: customDisplayPrice,
                                      }),
                                    });
                                  } catch (error) {
                                    console.error('Error saving display price:', error);
                                  }
                                }
                                
                                // Actualizar estado
                                setSelectedPendantChains(newSaved);
                                setTemporarySelectedChain(null);
                                setEditingVariation(null);
                                setSelectedVariationForPrice(null);
                                setCalculatedSumPrice(null);
                                setCalculatedDisplayPrice(null);
                                setCustomDisplayPrice(null);
                                
                                setToastMessage(editingVariation ? 'Variación actualizada correctamente' : 'Cadena guardada correctamente');
                                setShowToast(true);
                                
                                // Recargar productos para actualizar contador
                                await loadProducts();
                              } else {
                                throw new Error('Error al actualizar');
                              }
                            } catch (error: any) {
                              setToastMessage('Error al guardar la cadena');
                              setShowToast(true);
                            }
                          }}
                          className="w-full px-4 py-2 bg-black text-white text-sm font-medium hover:bg-black/90 transition-colors rounded"
                        >
                          {editingVariation ? 'Actualizar Variación y Precio' : 'Guardar Cadenas y Precio'}
                        </button>
              </div>
            ) : (
                      <div className="space-y-4">
                        <h3 className="text-lg font-semibold text-black">Variaciones</h3>
                        <div className="bg-gray-50 border-2 border-gray-200 rounded-lg p-6 h-full flex items-center justify-center">
                          <p className="text-sm text-black/60 text-center">
                            Las variaciones solo están disponibles para productos de categoría "Colgantes"
                          </p>
                        </div>
              </div>
            )}

                    {/* Cuadrante 4: Cálculos (abajo derecha) - Solo para Colgantes */}
                    {editingProduct.category === 'Colgantes' && editingProduct.id && !editingProduct.id.startsWith('new-') ? (
                      <div className="space-y-4 max-h-full overflow-y-auto">
                        <h3 className="text-lg font-semibold text-black">Cálculo</h3>
                        {selectedVariationForPrice ? (
                          <div className="bg-gradient-to-br from-blue-50 to-blue-100 border-2 border-blue-300 rounded-lg p-5 space-y-5 h-full flex flex-col">
                            <div className="flex items-center gap-3">
                              <span className="material-symbols-outlined text-blue-700" style={{ fontSize: '24px', fontWeight: 300 }}>
                                calculate
                              </span>
                              <h4 className="text-lg font-bold text-black">Cálculo de Precio</h4>
          </div>
                            
                            <div className="bg-white rounded-lg p-4 space-y-3 border border-blue-200">
                              <div className="flex justify-between items-center pb-2 border-b border-blue-200">
                                <span className="text-sm font-medium text-black/80">Cadena {selectedVariationForPrice.brand}:</span>
                                <span className="text-sm font-bold text-black">${selectedVariationForPrice.price.toLocaleString('es-CL')} CLP</span>
                              </div>
                              <div className="flex justify-between items-center pb-2 border-b border-blue-200">
                                <span className="text-sm font-medium text-black/80">Dije:</span>
                                <span className="text-sm font-bold text-black">${editingProduct.price.toLocaleString('es-CL')} CLP</span>
                              </div>
                              <div className="flex justify-between items-center pt-2">
                                <span className="text-base font-bold text-black">Total (Suma):</span>
                                <span className="text-lg font-bold text-blue-700">
                                  ${calculatedSumPrice ? calculatedSumPrice.toLocaleString('es-CL') : '0'} CLP
                                </span>
                              </div>
                            </div>

                            <div className="bg-blue-200 rounded-lg p-3 border border-blue-300">
                              <label className="block text-xs font-bold text-blue-900 mb-2">
                                Precio Sugerido (Redondeado):
                              </label>
                              <div className="text-center py-2 bg-white rounded border-2 border-blue-400">
                                <span className="text-xl font-bold text-blue-700">
                                  ${calculatedDisplayPrice ? calculatedDisplayPrice.toLocaleString('es-CL') : '0'} CLP
                                </span>
                              </div>
                            </div>

                            <div className="space-y-2 flex-1">
                              <label className="block text-xs font-bold text-black mb-1">
                                Precio de Exhibición (Editable):
                              </label>
                              <input
                                type="number"
                                value={customDisplayPrice || calculatedDisplayPrice || 0}
                                onChange={(e) => {
                                  const value = parseInt(e.target.value) || 0;
                                  setCustomDisplayPrice(value);
                                }}
                                className="w-full bg-white border-2 border-blue-300 px-3 py-2 text-base font-semibold text-black focus:outline-none focus:border-blue-500 rounded-lg [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                                placeholder="Precio editable"
                              />
                            </div>

                            <div className="bg-blue-600 rounded-lg p-3 border-2 border-blue-700 mt-auto">
                              <div className="flex justify-between items-center">
                                <span className="text-sm font-bold text-white">Precio Final:</span>
                                <span className="text-xl font-bold text-white">
                                  ${(customDisplayPrice || calculatedDisplayPrice || 0).toLocaleString('es-CL')} CLP
                                </span>
                              </div>
                            </div>
                          </div>
                        ) : (
                          <div className="bg-gray-50 border-2 border-gray-200 rounded-lg p-6 h-full flex items-center justify-center">
                            <p className="text-sm text-black/60 text-center">
                              Selecciona una cadena para ver el cálculo de precio
                            </p>
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="space-y-4">
                        <h3 className="text-lg font-semibold text-black">Cálculo</h3>
                        <div className="bg-gray-50 border-2 border-gray-200 rounded-lg p-6 h-full flex items-center justify-center">
                          <p className="text-sm text-black/60 text-center">
                            Los cálculos solo están disponibles para productos de categoría "Colgantes"
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
              
              {/* Footer con botones */}
              <div className="sticky bottom-0 bg-white border-t border-black/10 px-6 py-4 flex gap-4">
                  <button
                    onClick={async () => {
                      await handleSaveProduct();
                      // Guardar cadenas si es un colgante
                      if (editingProduct.category === 'Colgantes' && editingProduct.id && !editingProduct.id.startsWith('new-')) {
                        try {
                          await fetch(`/api/pendants/${editingProduct.id}/chains`, {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({
                              chainBrands: Array.from(selectedPendantChains),
                            }),
                          });
                        } catch (error) {
                          console.error('Error saving chains:', error);
                        }
                      }
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
                </div>
              </div>
            </div>
        )}

        {/* Tab de Pagos */}
        {activeTab === 'payments' && (
          <div className="space-y-6">
            <h2 className="text-xl font-bold text-black">Configuración de Métodos de Pago</h2>
            <div className="border border-black/10 bg-white p-6">
              <h3 className="text-lg font-semibold text-black mb-6">Transferencia Bancaria</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-black mb-2">Banco</label>
                  <input
                    type="text"
                    value={bankTransferSettings.bank_name || ''}
                    onChange={(e) => setBankTransferSettings({ ...bankTransferSettings, bank_name: e.target.value })}
                    placeholder="Ej: Banco de Chile"
                    className="w-full bg-white border border-black/20 px-4 py-2.5 text-black text-base font-normal focus:outline-none focus:border-black/40"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-black mb-2">Tipo de Cuenta</label>
                  <input
                    type="text"
                    value={bankTransferSettings.account_type || ''}
                    onChange={(e) => setBankTransferSettings({ ...bankTransferSettings, account_type: e.target.value })}
                    placeholder="Ej: Cuenta Corriente"
                    className="w-full bg-white border border-black/20 px-4 py-2.5 text-black text-base font-normal focus:outline-none focus:border-black/40"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-black mb-2">Número de Cuenta</label>
                  <input
                    type="text"
                    value={bankTransferSettings.account_number || ''}
                    onChange={(e) => setBankTransferSettings({ ...bankTransferSettings, account_number: e.target.value })}
                    placeholder="Ej: 1234567890"
                    className="w-full bg-white border border-black/20 px-4 py-2.5 text-black text-base font-normal focus:outline-none focus:border-black/40"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-black mb-2">RUT</label>
                  <input
                    type="text"
                    value={bankTransferSettings.rut || ''}
                    onChange={(e) => setBankTransferSettings({ ...bankTransferSettings, rut: e.target.value })}
                    placeholder="Ej: 12.345.678-9"
                    className="w-full bg-white border border-black/20 px-4 py-2.5 text-black text-base font-normal focus:outline-none focus:border-black/40"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-black mb-2">Titular</label>
                  <input
                    type="text"
                    value={bankTransferSettings.account_holder || ''}
                    onChange={(e) => setBankTransferSettings({ ...bankTransferSettings, account_holder: e.target.value })}
                    placeholder="Ej: GOTRA Joyería"
                    className="w-full bg-white border border-black/20 px-4 py-2.5 text-black text-base font-normal focus:outline-none focus:border-black/40"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-black mb-2">Email para Comprobantes</label>
                  <input
                    type="email"
                    value={bankTransferSettings.email || ''}
                    onChange={(e) => setBankTransferSettings({ ...bankTransferSettings, email: e.target.value })}
                    placeholder="Ej: contacto@gotrachile.com"
                    className="w-full bg-white border border-black/20 px-4 py-2.5 text-black text-base font-normal focus:outline-none focus:border-black/40"
                  />
                </div>
                <div className="flex items-center gap-3 pt-4 border-t border-black/10">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={bankTransferSettings.is_enabled || false}
                      onChange={(e) => setBankTransferSettings({ ...bankTransferSettings, is_enabled: e.target.checked })}
                      className="w-4 h-4 text-black focus:ring-black cursor-pointer"
                    />
                    <span className="text-sm font-normal text-black">Habilitar Transferencia Bancaria</span>
                  </label>
                </div>
                <div className="flex gap-3 pt-4">
                  <button
                    onClick={async () => {
                      try {
                        const response = await fetch('/api/bank-transfer-settings', {
                          method: 'PUT',
                          headers: { 'Content-Type': 'application/json' },
                          body: JSON.stringify(bankTransferSettings),
                        });
                        if (response.ok) {
                          setToastMessage('Configuración guardada');
                          setShowToast(true);
                        } else {
                          throw new Error('Error al guardar');
                        }
                      } catch (error) {
                        setToastMessage('Error al guardar la configuración');
                        setShowToast(true);
                      }
                    }}
                    className="px-6 py-3 bg-black text-white text-base font-medium hover:bg-black/90 transition-colors"
                  >
                    Guardar
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tab de Categorías */}
        {activeTab === 'categories' && (
          <div className="space-y-6">
            <h2 className="text-xl font-bold text-black">Gestión de Imágenes de Categorías</h2>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-black">Categorías</h3>
                  <button
                    onClick={() => {
                      setEditingCategory({ id: '', name: '', image_url: '', image_alt: '', display_order: 0, is_active: true });
                    }}
                    className="px-4 py-2 bg-black text-white text-sm font-medium hover:bg-black/90"
                  >
                    + Nueva
                  </button>
                </div>
                <div className="space-y-3 max-h-[600px] overflow-y-auto">
                  {categories.length === 0 ? (
                    <p className="text-black/70">No hay categorías</p>
                  ) : (
                    categories.map((category) => (
                      <div key={category.id} className="border border-black/10 p-4 flex items-center gap-4 hover:border-black/20 transition-colors">
                        <div className="flex-shrink-0 w-20 h-20 overflow-hidden bg-gray-50 border border-black/5 cursor-pointer" onClick={() => handleEditCategory(category)}>
                          <img src={category.image_url} alt={category.image_alt} className="w-full h-full object-cover" />
                        </div>
                        <div className="flex-1 cursor-pointer" onClick={() => handleEditCategory(category)}>
                          <h4 className="text-base font-semibold text-black mb-1">{category.name}</h4>
                          <p className="text-xs text-black/60 truncate">{category.image_url}</p>
                        </div>
                        <div className="flex gap-2">
                          <button onClick={(e) => { e.stopPropagation(); handleEditCategory(category); }} className="px-3 py-1 bg-black text-white text-xs font-medium hover:bg-black/90">Editar</button>
                          <button onClick={async (e) => { 
                            e.stopPropagation(); 
                            if (confirm(`¿Eliminar categoría "${category.name}"?`)) {
                              try {
                                const response = await fetch('/api/categories', {
                                  method: 'DELETE',
                                  headers: { 'Content-Type': 'application/json' },
                                  body: JSON.stringify({ id: category.id }),
                                });
                                if (response.ok) {
                                  await loadCategories();
                                  setToastMessage('Categoría eliminada');
                                  setShowToast(true);
                                  if (editingCategory?.id === category.id) setEditingCategory(null);
                                }
                              } catch (error) {
                                setToastMessage('Error al eliminar');
                                setShowToast(true);
                              }
                            }
                          }} className="px-3 py-1 bg-red-600 text-white text-xs font-medium hover:bg-red-700">Eliminar</button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
              <div>
                {editingCategory ? (
                  <div className="border border-black/10 p-6">
                    <h3 className="text-lg font-semibold text-black mb-6">{editingCategory.id ? 'Editar Categoría' : 'Nueva Categoría'}</h3>
                    <div className="mb-6">
                      <div className="w-full aspect-square overflow-hidden bg-gray-50 border border-black/5 mb-3">
                        <img src={editingCategory.image_url} alt={editingCategory.image_alt} className="w-full h-full object-cover" onError={(e) => { (e.target as HTMLImageElement).src = 'https://via.placeholder.com/400?text=Imagen+no+disponible'; }} />
                      </div>
                      {editingCategory.id ? (
                        <p className="text-sm text-black/70 text-center mb-4">{editingCategory.name}</p>
                      ) : (
                        <div className="mb-4">
                          <label className="block text-sm font-semibold text-black mb-2">Nombre</label>
                          <input type="text" value={editingCategory.name} onChange={(e) => setEditingCategory({ ...editingCategory, name: e.target.value })} placeholder="Ej: Pulseras" className="w-full bg-white border border-black/20 px-4 py-2 text-black text-base font-normal focus:outline-none focus:border-black/40" />
                        </div>
                      )}
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

        {/* Tab de Órdenes */}
        {activeTab === 'orders' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-black">
                Órdenes ({filteredOrders.length}{orderSearchQuery ? ` de ${orders.length}` : ''})
              </h2>
              <button
                onClick={loadOrders}
                className="px-4 py-2 bg-black text-white text-sm font-medium hover:bg-black/90 transition-colors"
              >
                Actualizar
              </button>
            </div>

            {/* Campo de búsqueda */}
            <div className="mb-4">
              <input
                type="text"
                value={orderSearchQuery}
                onChange={(e) => setOrderSearchQuery(e.target.value)}
                placeholder="Buscar por ID, nombre, email, teléfono o RUT..."
                className="w-full bg-white border border-black/20 px-4 py-2.5 text-black text-base font-normal focus:outline-none focus:border-black/40 font-sans"
              />
            </div>
            
            <div className="border border-black/10 bg-white">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-black/5 sticky top-0">
                    <tr>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-black">ID Orden</th>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-black">Cliente</th>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-black">RUT</th>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-black">Detalle</th>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-black">Total</th>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-black">Estado Pago</th>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-black">Estado Envío</th>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-black">Fecha</th>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-black">Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredOrders.length === 0 ? (
                      <tr>
                        <td colSpan={9} className="px-4 py-8 text-center text-black/50 font-normal">
                          {orderSearchQuery ? 'No se encontraron órdenes' : 'No hay órdenes aún'}
                        </td>
                      </tr>
                    ) : (
                      filteredOrders.map((order) => (
                        <tr key={order.id} className={`border-t border-black/5 hover:bg-black/2 transition-colors ${
                          order.status === 'completed' ? 'bg-green-50/50' : ''
                        }`}>
                          <td className="px-4 py-3 text-black font-medium font-mono text-xs">
                            {order.id}
                            {order.status === 'completed' && (
                              <span className="ml-2 px-2 py-0.5 bg-green-600 text-white text-xs font-semibold rounded">Concretada</span>
                            )}
                          </td>
                          <td className="px-4 py-3">
                            <div>
                              <p className="text-black font-medium">{order.customer_name}</p>
                              <p className="text-black/60 text-xs">{order.customer_email}</p>
                              <p className="text-black/50 text-xs">{order.customer_phone}</p>
                            </div>
                          </td>
                          <td className="px-4 py-3 text-black/70 font-mono text-xs">{order.customer_rut || '-'}</td>
                          <td className="px-4 py-3">
                            <div className="max-w-xs">
                              {Array.isArray(order.items) && order.items.map((item: any, idx: number) => {
                                const itemPrice = item.product.price + (item.variation?.price_modifier || 0);
                                return (
                                  <div key={idx} className="mb-2 last:mb-0">
                                    <p className="text-black text-xs font-medium">{item.product.name}</p>
                                    {item.variation && (
                                      <p className="text-black/60 text-xs">
                                        {[item.variation.brand, item.variation.thickness, item.variation.length].filter(Boolean).join(', ')}
                                      </p>
                                    )}
                                    <p className="text-black/50 text-xs">Cant: {item.quantity} - ${itemPrice.toLocaleString('es-CL')} CLP</p>
                                  </div>
                                );
                              })}
                            </div>
                          </td>
                          <td className="px-4 py-3 text-black font-semibold">${order.total_amount.toLocaleString('es-CL')} CLP</td>
                          <td className="px-4 py-3">
                            <select
                              value={order.payment_status || 'pending'}
                              onChange={(e) => handleUpdateOrderStatus(order.id, 'payment_status', e.target.value)}
                              className={`text-xs px-2 py-1 border rounded ${
                                order.payment_status === 'approved'
                                  ? 'bg-green-50 border-green-200 text-green-800'
                                  : order.payment_status === 'rejected' || order.payment_status === 'cancelled'
                                  ? 'bg-red-50 border-red-200 text-red-800'
                                  : 'bg-yellow-50 border-yellow-200 text-yellow-800'
                              }`}
                            >
                              <option value="pending">Pendiente</option>
                              <option value="approved">Aprobado</option>
                              <option value="rejected">Rechazado</option>
                              <option value="cancelled">Cancelada</option>
                            </select>
                          </td>
                          <td className="px-4 py-3">
                            <select
                              value={order.shipping_status || 'not_shipped'}
                              onChange={(e) => handleUpdateOrderStatus(order.id, 'shipping_status', e.target.value)}
                              className="text-xs px-2 py-1 border border-black/20 rounded bg-white text-black"
                            >
                              <option value="not_shipped">No enviado</option>
                              <option value="in_transit">En camino</option>
                              <option value="delivered">Entregado</option>
                            </select>
                          </td>
                          <td className="px-4 py-3 text-black/70 text-xs">
                            {order.created_at ? new Date(order.created_at).toLocaleDateString('es-CL', {
                              year: 'numeric',
                              month: 'short',
                              day: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit'
                            }) : '-'}
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex flex-col gap-2">
                              <div className="flex gap-2">
                                <button
                                  onClick={() => {
                                    if (selectedOrder?.id === order.id) {
                                      setSelectedOrder(null);
                                    } else {
                                      setSelectedOrder(order);
                                      setEditingOrder(null);
                                    }
                                  }}
                                  className="text-xs px-2 py-1 bg-black text-white hover:bg-black/90 transition-colors"
                                >
                                  {selectedOrder?.id === order.id ? 'Ocultar' : 'Ver'}
                                </button>
                                <button
                                  onClick={() => {
                                    handleEditOrder(order);
                                  }}
                                  className="text-xs px-2 py-1 bg-blue-600 text-white hover:bg-blue-700 transition-colors"
                                >
                                  Editar
                                </button>
                                <button
                                  onClick={() => {
                                    handleDeleteOrder(order.id);
                                  }}
                                  className="text-xs px-2 py-1 bg-red-600 text-white hover:bg-red-700 transition-colors"
                                >
                                  Borrar
                                </button>
                              </div>
                              {order.status !== 'completed' && (
                                <button
                                  onClick={() => {
                                    handleMarkAsCompleted(order.id);
                                  }}
                                  className="text-xs px-2 py-1 bg-green-600 text-white hover:bg-green-700 transition-colors w-full"
                                  title="Marcar como concretada (pago realizado por WhatsApp u otro medio)"
                                >
                                  Marcar Concretado
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Panel de edición de orden */}
            {editingOrder && (
              <div className="border border-black/10 bg-white p-6">
                <h3 className="text-lg font-semibold text-black mb-4">Editar Orden #{editingOrder.id}</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                  <div>
                    <h4 className="text-sm font-semibold text-black mb-3">Información del Cliente</h4>
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-black mb-1">Nombre</label>
                        <input
                          type="text"
                          value={editingOrder.customer_name || ''}
                          onChange={(e) => setEditingOrder({ ...editingOrder, customer_name: e.target.value })}
                          className="w-full bg-white border border-black/20 px-4 py-2 text-black text-base font-normal focus:outline-none focus:border-black/40"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-black mb-1">Email</label>
                        <input
                          type="email"
                          value={editingOrder.customer_email || ''}
                          onChange={(e) => setEditingOrder({ ...editingOrder, customer_email: e.target.value })}
                          className="w-full bg-white border border-black/20 px-4 py-2 text-black text-base font-normal focus:outline-none focus:border-black/40"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-black mb-1">Teléfono</label>
                        <input
                          type="tel"
                          value={editingOrder.customer_phone || ''}
                          onChange={(e) => setEditingOrder({ ...editingOrder, customer_phone: e.target.value })}
                          className="w-full bg-white border border-black/20 px-4 py-2 text-black text-base font-normal focus:outline-none focus:border-black/40"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-black mb-1">RUT</label>
                        <input
                          type="text"
                          value={editingOrder.customer_rut || ''}
                          onChange={(e) => setEditingOrder({ ...editingOrder, customer_rut: e.target.value })}
                          className="w-full bg-white border border-black/20 px-4 py-2 text-black text-base font-normal focus:outline-none focus:border-black/40"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-black mb-1">Dirección</label>
                        <textarea
                          value={editingOrder.customer_address || ''}
                          onChange={(e) => setEditingOrder({ ...editingOrder, customer_address: e.target.value })}
                          rows={3}
                          className="w-full bg-white border border-black/20 px-4 py-2 text-black text-base font-normal focus:outline-none focus:border-black/40 resize-none"
                        />
                      </div>
                    </div>
                  </div>
                  
                  <div>
                    <h4 className="text-sm font-semibold text-black mb-3">Información de Pago y Envío</h4>
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-black mb-1">Total</label>
                        <input
                          type="number"
                          value={editingOrder.total_amount || 0}
                          onChange={(e) => setEditingOrder({ ...editingOrder, total_amount: parseFloat(e.target.value) || 0 })}
                          className="w-full bg-white border border-black/20 px-4 py-2 text-black text-base font-normal focus:outline-none focus:border-black/40"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-black mb-1">Estado de Pago</label>
                        <select
                          value={editingOrder.payment_status || 'pending'}
                          onChange={(e) => setEditingOrder({ ...editingOrder, payment_status: e.target.value })}
                          className="w-full bg-white border border-black/20 px-4 py-2 text-black text-base font-normal focus:outline-none focus:border-black/40"
                        >
                          <option value="pending">Pendiente</option>
                          <option value="approved">Aprobado</option>
                          <option value="rejected">Rechazado</option>
                          <option value="cancelled">Cancelada</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-black mb-1">Estado de Envío</label>
                        <select
                          value={editingOrder.shipping_status || 'not_shipped'}
                          onChange={(e) => setEditingOrder({ ...editingOrder, shipping_status: e.target.value })}
                          className="w-full bg-white border border-black/20 px-4 py-2 text-black text-base font-normal focus:outline-none focus:border-black/40"
                        >
                          <option value="not_shipped">No enviado</option>
                          <option value="in_transit">En camino</option>
                          <option value="delivered">Entregado</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-black mb-1">Estado General</label>
                        <select
                          value={editingOrder.status || 'pending'}
                          onChange={(e) => setEditingOrder({ ...editingOrder, status: e.target.value })}
                          className="w-full bg-white border border-black/20 px-4 py-2 text-black text-base font-normal focus:outline-none focus:border-black/40"
                        >
                          <option value="pending">Pendiente</option>
                          <option value="processing">Procesando</option>
                          <option value="completed">Concretada</option>
                          <option value="cancelled">Cancelada</option>
                        </select>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex gap-3 pt-4 border-t border-black/10">
                  <button
                    onClick={handleSaveOrder}
                    className="px-6 py-2 bg-black text-white text-base font-medium hover:bg-black/90 transition-colors"
                  >
                    Guardar Cambios
                  </button>
                  <button
                    onClick={() => {
                      setEditingOrder(null);
                    }}
                    className="px-6 py-2 border border-black/20 text-black text-base font-medium hover:border-black/40 transition-colors"
                  >
                    Cancelar
                  </button>
                </div>
              </div>
            )}

            {/* Panel de detalles de orden seleccionada */}
            {selectedOrder && !editingOrder && (
              <div className="border border-black/10 bg-white p-6">
                <h3 className="text-lg font-semibold text-black mb-4">Detalles de Orden #{selectedOrder.id}</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                  <div>
                    <h4 className="text-sm font-semibold text-black mb-3">Información del Cliente</h4>
                    <div className="space-y-2 text-sm">
                      <p><span className="font-medium text-black/70">Nombre:</span> <span className="text-black">{selectedOrder.customer_name}</span></p>
                      <p><span className="font-medium text-black/70">Email:</span> <span className="text-black">{selectedOrder.customer_email}</span></p>
                      <p><span className="font-medium text-black/70">Teléfono:</span> <span className="text-black">{selectedOrder.customer_phone || '-'}</span></p>
                      <p><span className="font-medium text-black/70">RUT:</span> <span className="text-black font-mono">{selectedOrder.customer_rut || '-'}</span></p>
                      <p><span className="font-medium text-black/70">Dirección:</span> <span className="text-black">{selectedOrder.customer_address}</span></p>
                    </div>
                  </div>
                  
                  <div>
                    <h4 className="text-sm font-semibold text-black mb-3">Información de Pago</h4>
                    <div className="space-y-2 text-sm">
                      <p><span className="font-medium text-black/70">Método:</span> <span className="text-black capitalize">{selectedOrder.payment_method}</span></p>
                      <p><span className="font-medium text-black/70">Estado Pago:</span> 
                        <span className={`ml-2 px-2 py-1 rounded text-xs ${
                          selectedOrder.payment_status === 'approved'
                            ? 'bg-green-100 text-green-800'
                            : selectedOrder.payment_status === 'rejected' || selectedOrder.payment_status === 'cancelled'
                            ? 'bg-red-100 text-red-800'
                            : 'bg-yellow-100 text-yellow-800'
                        }`}>
                          {selectedOrder.payment_status === 'approved' ? 'Aprobado' : 
                           selectedOrder.payment_status === 'rejected' ? 'Rechazado' :
                           selectedOrder.payment_status === 'cancelled' ? 'Cancelada' : 'Pendiente'}
                        </span>
                      </p>
                      <p><span className="font-medium text-black/70">Estado Envío:</span> 
                        <span className="ml-2 px-2 py-1 rounded text-xs bg-gray-100 text-gray-800">
                          {selectedOrder.shipping_status === 'not_shipped' ? 'No enviado' :
                           selectedOrder.shipping_status === 'in_transit' ? 'En camino' : 'Entregado'}
                        </span>
                      </p>
                      {selectedOrder.mercado_pago_preference_id && (
                        <p><span className="font-medium text-black/70">MP Preference ID:</span> <span className="text-black font-mono text-xs">{selectedOrder.mercado_pago_preference_id}</span></p>
                      )}
                      {selectedOrder.mercado_pago_payment_id && (
                        <p><span className="font-medium text-black/70">MP Payment ID:</span> <span className="text-black font-mono text-xs">{selectedOrder.mercado_pago_payment_id}</span></p>
                      )}
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="text-sm font-semibold text-black mb-3">Items de la Orden</h4>
                  <div className="border border-black/10">
                    <table className="w-full text-sm">
                      <thead className="bg-black/5">
                        <tr>
                          <th className="px-4 py-2 text-left text-xs font-semibold text-black">Producto</th>
                          <th className="px-4 py-2 text-left text-xs font-semibold text-black">Variación</th>
                          <th className="px-4 py-2 text-right text-xs font-semibold text-black">Cantidad</th>
                          <th className="px-4 py-2 text-right text-xs font-semibold text-black">Precio Unit.</th>
                          <th className="px-4 py-2 text-right text-xs font-semibold text-black">Total</th>
                        </tr>
                      </thead>
                      <tbody>
                        {Array.isArray(selectedOrder.items) && selectedOrder.items.map((item: any, idx: number) => {
                          const itemPrice = item.product.price + (item.variation?.price_modifier || 0);
                          const totalItemPrice = itemPrice * item.quantity;
                          return (
                            <tr key={idx} className="border-t border-black/5">
                              <td className="px-4 py-2 text-black">{item.product.name}</td>
                              <td className="px-4 py-2 text-black/70 text-xs">
                                {item.variation ? [item.variation.brand, item.variation.thickness, item.variation.length].filter(Boolean).join(', ') : '-'}
                              </td>
                              <td className="px-4 py-2 text-right text-black">{item.quantity}</td>
                              <td className="px-4 py-2 text-right text-black">${itemPrice.toLocaleString('es-CL')} CLP</td>
                              <td className="px-4 py-2 text-right text-black font-semibold">${totalItemPrice.toLocaleString('es-CL')} CLP</td>
                            </tr>
                          );
                        })}
                        <tr className="border-t-2 border-black/20">
                          <td colSpan={4} className="px-4 py-2 text-right text-sm font-semibold text-black">Total</td>
                          <td className="px-4 py-2 text-right text-lg font-bold text-black">${selectedOrder.total_amount.toLocaleString('es-CL')} CLP</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}
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

