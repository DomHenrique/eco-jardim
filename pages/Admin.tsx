
import React, { useState, useEffect } from 'react';
import { useStore } from '../context/StoreContext';
import { ProductCategory, Product, UploadProgress, ImageStorageType, Order, OrderStatus, Budget, BudgetStatus } from '../types';
import { PlusCircle, Image as ImageIcon, Tag, Upload, X, Edit, Trash2, List, Download, Filter, Search, ShoppingCart, DollarSign, FileText } from 'lucide-react';
import { Navigate } from 'react-router-dom';
import { validateImageFile } from '../services/storageService';
import { createProduct, updateProduct, deleteProduct, listProducts, bulkCreateProducts } from '../services/productService';
import { exportProductsToCSV, applyProductFilters } from '../utils/exportUtils';
import { listOrders, getOrdersByStatus, updateOrderStatus } from '../services/orderService';
import { listBudgets, getBudgetsByStatus, updateBudgetStatus } from '../services/budgetService';
import OrderDetails from '../components/OrderDetails';
import Papa from 'papaparse';

const Admin: React.FC = () => {
  const { addProduct, isAuthenticated, isEmployee, isLoadingAuth, currentUser, products: contextProducts } = useStore();
  const [activeTab, setActiveTab] = useState<'add' | 'list' | 'import' | 'orders' | 'budgets'>('add');
  const [products, setProducts] = useState<Product[]>([]);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [formData, setFormData] = useState<Partial<Product>>({
    name: '',
    description: '',
    usage: '',
    measurements: '',
    price: 0,
    category: ProductCategory.STONES,
    imageUrl: '',
    unit: 'm²'
  });
  const [tagsInput, setTagsInput] = useState('');
  const [message, setMessage] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>('');
  const [uploadProgress, setUploadProgress] = useState<UploadProgress>({
    status: 'idle',
    progress: 0
  });
  const [filters, setFilters] = useState({
    category: 'all',
    minPrice: undefined as number | undefined,
    maxPrice: undefined as number | undefined,
    searchTerm: ''
  });
  const [showFilters, setShowFilters] = useState(false);

  // Order and budget management state
  const [orders, setOrders] = useState<Order[]>([]);
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [selectedBudget, setSelectedBudget] = useState<Budget | null>(null);
  const [loadingOrders, setLoadingOrders] = useState(false);
  const [loadingBudgets, setLoadingBudgets] = useState(false);
  const [orderFilters, setOrderFilters] = useState<OrderStatus | 'all'>('all');
  const [budgetFilters, setBudgetFilters] = useState<BudgetStatus | 'all'>('all');

  if (isLoadingAuth) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-stone-50">
        <div className="text-center">
          <svg className="animate-spin mx-auto h-12 w-12 text-emerald-700" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <p className="mt-4 text-lg font-medium text-stone-600">Verificando autenticação...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" />;
  }

  if (!isEmployee) {
    return <Navigate to="/" />;
  }

  // Load products when switching to list tab
  useEffect(() => {
    if (activeTab === 'list') {
      loadProducts();
    }
  }, [activeTab]);

  // Load orders when switching to orders tab
  useEffect(() => {
    if (activeTab === 'orders') {
      loadOrders();
    }
  }, [activeTab, orderFilters]);

  // Load budgets when switching to budgets tab
  useEffect(() => {
    if (activeTab === 'budgets') {
      loadBudgets();
    }
  }, [activeTab, budgetFilters]);

  const loadOrders = async () => {
    setLoadingOrders(true);
    try {
      let result;
      if (orderFilters !== 'all') {
        result = await getOrdersByStatus(orderFilters);
      } else {
        result = await listOrders();
      }

      if (result.success && result.data) {
        setOrders(result.data);
      } else {
        setMessage(result.error || 'Failed to load orders');
      }
    } catch (err) {
      setMessage('An error occurred while loading orders');
    } finally {
      setLoadingOrders(false);
    }
  };

  const loadBudgets = async () => {
    setLoadingBudgets(true);
    try {
      let result;
      if (budgetFilters !== 'all') {
        result = await getBudgetsByStatus(budgetFilters);
      } else {
        // Import listBudgets function and use it
        result = await listBudgets();
      }

      if (result.success && result.data) {
        setBudgets(result.data);
      } else {
        setMessage(result.error || 'Failed to load budgets');
      }
    } catch (err) {
      setMessage('An error occurred while loading budgets');
    } finally {
      setLoadingBudgets(false);
    }
  };

  const loadProducts = async () => {
    const result = await listProducts();
    if (result.success && result.data) {
      setProducts(result.data);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'price' ? parseFloat(value) : value
    }));
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const validation = validateImageFile(file);
    if (!validation.valid) {
      setMessage(validation.error || 'Arquivo inválido');
      setTimeout(() => setMessage(''), 3000);
      return;
    }

    setSelectedFile(file);
    
    const reader = new FileReader();
    reader.onloadend = () => {
      setPreviewUrl(reader.result as string);
    };
    reader.readAsDataURL(file);

    setFormData(prev => ({ ...prev, imageUrl: '' }));
  };

  const handleRemoveFile = () => {
    setSelectedFile(null);
    setPreviewUrl('');
    setUploadProgress({ status: 'idle', progress: 0 });
  };

  const handleEdit = (product: Product) => {
    setEditingProduct(product);
    setFormData({
      name: product.name,
      description: product.description,
      usage: product.usage,
      measurements: product.measurements,
      price: product.price,
      category: product.category,
      imageUrl: product.imageUrl,
      unit: product.unit
    });
    setTagsInput(product.tags?.join(', ') || '');
    setPreviewUrl(product.imageUrl);
    setActiveTab('add');
  };

  const handleDelete = async (productId: string) => {
    if (!confirm('Tem certeza que deseja deletar este produto?')) return;

    const result = await deleteProduct(productId);
    if (result.success) {
      setMessage('Produto deletado com sucesso!');
      loadProducts();
      setTimeout(() => setMessage(''), 3000);
    } else {
      setMessage(`Erro ao deletar: ${result.error}`);
      setTimeout(() => setMessage(''), 3000);
    }
  };

  const resetForm = () => {
    setFormData({
      name: '', description: '', usage: '', measurements: '', price: 0, 
      category: ProductCategory.STONES, imageUrl: '', unit: 'm²'
    });
    setTagsInput('');
    setSelectedFile(null);
    setPreviewUrl('');
    setEditingProduct(null);
    setUploadProgress({ status: 'idle', progress: 0 });
  };

  const handleExportCSV = () => {
    const filtered = applyProductFilters(products, filters);
    const timestamp = new Date().toISOString().split('T')[0];
    exportProductsToCSV(filtered, `produtos_${timestamp}.csv`);
    setMessage(`${filtered.length} produtos exportados com sucesso!`);
    setTimeout(() => setMessage(''), 3000);
  };

  const handleCSVSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.type !== 'text/csv' && !file.name.endsWith('.csv')) {
      setMessage('Por favor, selecione um arquivo CSV válido.');
      setTimeout(() => setMessage(''), 3000);
      return;
    }

    setSelectedFile(file);
  };

  const handleCSVImport = async () => {
    if (!selectedFile) {
      setMessage('Por favor, selecione um arquivo CSV.');
      setTimeout(() => setMessage(''), 3000);
      return;
    }

    setUploadProgress({ status: 'uploading', progress: 0 });

    Papa.parse(selectedFile, {
      header: true,
      skipEmptyLines: true,
      complete: async (results) => {
        try {
          const parsedProducts: Omit<Product, 'id' | 'created_at' | 'updated_at'>[] = results.data.map((row: any) => ({
            name: row.name,
            description: row.description || '',
            usage: row.usage || '',
            measurements: row.measurements || '',
            price: parseFloat(row.price) || 0,
            category: (Object.values(ProductCategory).includes(row.category) ? row.category : ProductCategory.STONES) as ProductCategory,
            imageUrl: row.imageUrl || '',
            unit: row.unit || 'm²',
            tags: row.tags ? row.tags.split(',').map((t: string) => t.trim()) : undefined,
            imageStorageType: row.imageUrl ? ImageStorageType.EXTERNAL : ImageStorageType.PLACEHOLDER
          }));

          // Validate required fields
          const invalidProducts = parsedProducts.filter(p => !p.name || p.price === undefined);
          if (invalidProducts.length > 0) {
            setUploadProgress({ status: 'error', progress: 0, error: `Encontrados ${invalidProducts.length} produtos com dados inválidos (nome ou preço faltando).` });
            return;
          }

          const result = await bulkCreateProducts(parsedProducts);

          if (result.success) {
            setUploadProgress({ status: 'success', progress: 100 });
            setMessage(`${result.data?.length} produtos importados com sucesso!`);
            setSelectedFile(null);
            // Refresh products list if needed
            if (activeTab === 'list') loadProducts();
          } else {
            setUploadProgress({ status: 'error', progress: 0, error: result.error });
            setMessage(`Erro na importação: ${result.error}`);
          }
        } catch (error) {
          setUploadProgress({ status: 'error', progress: 0, error: 'Erro ao processar o arquivo CSV.' });
          console.error(error);
        }
      },
      error: (error) => {
        setUploadProgress({ status: 'error', progress: 0, error: `Erro ao ler CSV: ${error.message}` });
      }
    });
  };

  // Apply filters to products
  const filteredProducts = applyProductFilters(products, filters);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name || formData.price === undefined) {
      setMessage('Por favor, preencha os campos obrigatórios.');
      setTimeout(() => setMessage(''), 3000);
      return;
    }

    // Validar se é um serviço
    const isService = formData.category === ProductCategory.SERVICES;
    
    if (isService && !formData.unit) {
      setMessage('Para serviços, a unidade é obrigatória (ex: hora, visita, m²)');
      setTimeout(() => setMessage(''), 3000);
      return;
    }

    try {
      setUploadProgress({ status: 'uploading', progress: 0 });

      const tags = tagsInput.split(',').map(t => t.trim()).filter(t => t.length > 0);

      // Para produtos: usar imagem fornecida ou placeholder
      // Para serviços: não é obrigatório ter imagem
      const defaultImageUrl = isService 
        ? `https://picsum.photos/seed/service-${Date.now()}/400/400`
        : `https://picsum.photos/seed/product-${Date.now()}/400/400`;

      const productData: Omit<Product, 'id' | 'created_at' | 'updated_at'> = {
        name: formData.name!,
        description: formData.description || '',
        usage: formData.usage || '',
        measurements: formData.measurements || '',
        price: formData.price!,
        category: formData.category || ProductCategory.STONES,
        imageUrl: formData.imageUrl || defaultImageUrl,
        unit: formData.unit || (isService ? 'serviço' : 'm²'),
        tags: tags.length > 0 ? tags : undefined
      };

      if (editingProduct) {
        // Update existing product
        const result = await updateProduct(editingProduct.id, productData);
        
        if (!result.success) {
          setUploadProgress({ status: 'error', progress: 0, error: result.error });
          setMessage(`Erro: ${result.error}`);
          setTimeout(() => setMessage(''), 5000);
          return;
        }

        setUploadProgress({ status: 'success', progress: 100 });
        setMessage(`${isService ? 'Serviço' : 'Produto'} atualizado com sucesso!`);
        loadProducts();
      } else {
        // Create new product
        // Se não houver arquivo selecionado, criar sem upload de imagem
        const result = await createProduct(productData, selectedFile || undefined);

        if (!result.success) {
          setUploadProgress({ status: 'error', progress: 0, error: result.error });
          setMessage(`Erro: ${result.error}`);
          setTimeout(() => setMessage(''), 5000);
          return;
        }

        if (result.data) {
          addProduct(result.data);
        }

        setUploadProgress({ status: 'success', progress: 100 });
        setMessage(`${isService ? 'Serviço' : 'Produto'} adicionado com sucesso!`);
      }
      
      resetForm();
      
      setTimeout(() => {
        setMessage('');
        setUploadProgress({ status: 'idle', progress: 0 });
      }, 3000);
    } catch (error) {
      setUploadProgress({ 
        status: 'error', 
        progress: 0, 
        error: error instanceof Error ? error.message : 'Erro desconhecido' 
      });
      setMessage('Erro ao processar produto.');
      setTimeout(() => setMessage(''), 3000);
    }
  };

  return (
    <div className="min-h-screen bg-stone-50 py-12">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Tabs */}
        <div className="mb-6 border-b border-stone-200">
          <nav className="-mb-px flex space-x-8">
            <button
              onClick={() => { setActiveTab('add'); resetForm(); }}
              className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                activeTab === 'add'
                  ? 'border-emerald-700 text-emerald-700'
                  : 'border-transparent text-stone-500 hover:text-stone-700 hover:border-stone-300'
              }`}
            >
              <PlusCircle className="inline-block mr-2 h-5 w-5" />
              {editingProduct ? 'Editar Produto' : 'Adicionar Produto'}
            </button>
            <button
              onClick={() => setActiveTab('list')}
              className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                activeTab === 'list'
                  ? 'border-emerald-700 text-emerald-700'
                  : 'border-transparent text-stone-500 hover:text-stone-700 hover:border-stone-300'
              }`}
            >
              <List className="inline-block mr-2 h-5 w-5" />
              Listar Produtos
            </button>
            <button
              onClick={() => { setActiveTab('import'); resetForm(); }}
              className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                activeTab === 'import'
                  ? 'border-emerald-700 text-emerald-700'
                  : 'border-transparent text-stone-500 hover:text-stone-700 hover:border-stone-300'
              }`}
            >
              <Upload className="inline-block mr-2 h-5 w-5" />
              Importar CSV
            </button>
            <button
              onClick={() => setActiveTab('orders')}
              className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                activeTab === 'orders'
                  ? 'border-emerald-700 text-emerald-700'
                  : 'border-transparent text-stone-500 hover:text-stone-700 hover:border-stone-300'
              }`}
            >
              <ShoppingCart className="inline-block mr-2 h-5 w-5" />
              Gerenciar Pedidos
            </button>
            <button
              onClick={() => setActiveTab('budgets')}
              className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                activeTab === 'budgets'
                  ? 'border-emerald-700 text-emerald-700'
                  : 'border-transparent text-stone-500 hover:text-stone-700 hover:border-stone-300'
              }`}
            >
              <DollarSign className="inline-block mr-2 h-5 w-5" />
              Gerenciar Orçamentos
            </button>
          </nav>
        </div>

        {/* Add/Edit Product Form */}
        {activeTab === 'add' && (
          <div className="bg-white rounded-xl shadow-lg border border-stone-200 overflow-hidden">
            <div className="bg-emerald-800 p-6 flex justify-between items-center">
              <h1 className="text-2xl font-bold text-white flex items-center">
                {editingProduct ? (
                  <><Edit className="mr-3" /> Editar Produto</>
                ) : (
                  <><PlusCircle className="mr-3" /> Adicionar Produto</>
                )}
              </h1>
              {editingProduct && (
                <button
                  onClick={resetForm}
                  className="text-white hover:text-emerald-200 transition-colors"
                >
                  <X className="h-6 w-6" />
                </button>
              )}
            </div>
            
            <form onSubmit={handleSubmit} className="p-8 space-y-6">
              {message && (
                <div className={`${message.includes('Erro') ? 'bg-red-100 border-red-400 text-red-700' : 'bg-green-100 border-green-400 text-green-700'} border px-4 py-3 rounded relative`}>
                  {message}
                </div>
              )}

              {/* Aviso para serviços */}
              {formData.category === ProductCategory.SERVICES && (
                <div className="bg-blue-50 border border-blue-400 rounded-lg p-4">
                  <p className="text-sm text-blue-800">
                    <span className="font-semibold">📌 Modo Serviço:</span> Você está adicionando um serviço. A unidade pode ser "hora", "visita", "m²", etc.
                  </p>
                </div>
              )}

              {/* Aviso para produtos */}
              {formData.category !== ProductCategory.SERVICES && (
                <div className="bg-amber-50 border border-amber-400 rounded-lg p-4">
                  <p className="text-sm text-amber-800">
                    <span className="font-semibold">📦 Modo Produto:</span> Você está adicionando um produto. Informe medidas e unidades apropriadas.
                  </p>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="col-span-2">
                  <label className="block text-sm font-medium text-stone-700 mb-1">
                    Nome do {formData.category === ProductCategory.SERVICES ? 'Serviço' : 'Produto'}
                  </label>
                  <input required name="name" value={formData.name} onChange={handleChange} aria-label="Nome do Produto" className="w-full p-2 border rounded-md focus:ring-emerald-500 focus:border-emerald-500" />
                </div>

                <div>
                  <label className="block text-sm font-medium text-stone-700 mb-1">Categoria</label>
                  <select name="category" value={formData.category} onChange={handleChange} aria-label="Categoria do Produto" className="w-full p-2 border rounded-md focus:ring-emerald-500 focus:border-emerald-500">
                    {Object.values(ProductCategory).map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-stone-700 mb-1">Preço</label>
                  <div className="relative">
                    <span className="absolute left-3 top-2 text-stone-500">R$</span>
                    <input required type="number" step="0.01" name="price" value={formData.price} onChange={handleChange} aria-label="Preço do Produto" className="w-full pl-8 p-2 border rounded-md focus:ring-emerald-500 focus:border-emerald-500" />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-stone-700 mb-1">
                    Unidade {formData.category === ProductCategory.SERVICES ? '(obrigatório para serviços)' : ''}
                  </label>
                  <input 
                    required 
                    name="unit" 
                    value={formData.unit} 
                    onChange={handleChange} 
                    placeholder={formData.category === ProductCategory.SERVICES ? 'ex: hora, visita, m², dia' : 'ex: m², kg, unidade, saco'} 
                    className="w-full p-2 border rounded-md focus:ring-emerald-500 focus:border-emerald-500" 
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-stone-700 mb-1">
                    {formData.category === ProductCategory.SERVICES ? 'Descrição do Serviço' : 'Medidas'}
                  </label>
                  <input 
                    required 
                    name="measurements" 
                    value={formData.measurements} 
                    onChange={handleChange} 
                    placeholder={formData.category === ProductCategory.SERVICES ? 'ex: 4 horas, 1 dia, até 10m²' : 'ex: 10x20cm, 5 litros, 1kg'} 
                    className="w-full p-2 border rounded-md focus:ring-emerald-500 focus:border-emerald-500" 
                  />
                </div>
                
                <div className="col-span-2">
                  <label className="block text-sm font-medium text-stone-700 mb-1">
                    Descrição {formData.category === ProductCategory.SERVICES ? 'do Serviço' : 'do Produto'}
                  </label>
                  <textarea 
                    name="description" 
                    value={formData.description} 
                    onChange={handleChange} 
                    placeholder={formData.category === ProductCategory.SERVICES ? 'Descreva o que o serviço inclui, tempo estimado, materiais, etc.' : 'Descreva as características, vantagens, composição do produto, etc.'} 
                    className="w-full p-2 border rounded-md focus:ring-emerald-500 focus:border-emerald-500 h-24" 
                  />
                </div>

                <div className="col-span-2">
                  <label className="block text-sm font-medium text-stone-700 mb-1">
                    {formData.category === ProductCategory.SERVICES ? 'O que o Serviço Inclui' : 'Usos e Aplicações'}
                  </label>
                  <textarea 
                    name="usage" 
                    value={formData.usage} 
                    onChange={handleChange} 
                    placeholder={formData.category === ProductCategory.SERVICES ? 'Escopo do serviço: limpeza, instalação, manutenção, etc.' : 'Ideal para: calçadas, piscinas, jardins, paredes, etc.'} 
                    className="w-full p-2 border rounded-md focus:ring-emerald-500 focus:border-emerald-500 h-24" 
                  />
                </div>
                
                <div className="col-span-2">
                  <label className="block text-sm font-medium text-stone-700 mb-1">Tags (Cores, Tipos, Características)</label>
                  <div className="relative">
                    <Tag className="absolute left-3 top-2.5 text-stone-400 w-4 h-4" />
                    <input 
                      value={tagsInput} 
                      onChange={(e) => setTagsInput(e.target.value)} 
                      placeholder={formData.category === ProductCategory.SERVICES ? 'ex: Jardinagem, Limpeza, Urgente, Profissional' : 'Separe por vírgulas: Amarela, Rústica, Serrada...'} 
                      className="w-full pl-10 p-2 border rounded-md focus:ring-emerald-500 focus:border-emerald-500" 
                    />
                  </div>
                  <p className="text-xs text-stone-500 mt-1">Estas tags serão usadas nos filtros da loja.</p>
                </div>

                <div className="col-span-2">
                  <label className="block text-sm font-medium text-stone-700 mb-1">
                    Imagem {formData.category === ProductCategory.SERVICES ? 'do Serviço' : 'do Produto'}
                  </label>
                  <p className="text-xs text-stone-500 mb-2">
                    {formData.category === ProductCategory.SERVICES 
                      ? 'Opcional: imagem representativa do serviço (ex: equipe, resultado de trabalho)' 
                      : 'Upload de imagem para o produto. Se não fizer upload, será usada uma imagem aleatória.'}
                  </p>
                  
                  <div className="space-y-3">
                    {!selectedFile && !previewUrl && (
                      <div className="border-2 border-dashed border-stone-300 rounded-lg p-6 text-center hover:border-emerald-500 transition-colors">
                        <input
                          type="file"
                          id="imageFile"
                          accept="image/jpeg,image/jpg,image/png,image/webp,image/gif"
                          onChange={handleFileSelect}
                          className="hidden"
                        />
                        <label htmlFor="imageFile" className="cursor-pointer">
                          <Upload className="mx-auto h-12 w-12 text-stone-400 mb-2" />
                          <p className="text-sm text-stone-600 mb-1">
                            <span className="text-emerald-600 font-medium">Clique para fazer upload</span> ou arraste uma imagem
                          </p>
                          <p className="text-xs text-stone-500">PNG, JPG, WebP ou GIF (máx. 5MB)</p>
                        </label>
                      </div>
                    )}

                    {previewUrl && (
                      <div className="relative border border-stone-300 rounded-lg p-4">
                        <button
                          type="button"
                          onClick={handleRemoveFile}
                          aria-label="Remover imagem"
                          className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition-colors"
                        >
                          <X className="w-4 h-4" />
                        </button>
                        <img src={previewUrl} alt="Preview" className="w-full h-48 object-cover rounded-md" />
                        {selectedFile && (
                          <p className="text-sm text-stone-600 mt-2">
                            {selectedFile.name} ({(selectedFile.size / 1024).toFixed(1)} KB)
                          </p>
                        )}
                      </div>
                    )}

                    {uploadProgress.status === 'uploading' && (
                      <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm text-blue-700">Enviando imagem...</span>
                          <span className="text-sm font-medium text-blue-700">{uploadProgress.progress}%</span>
                        </div>
                        <div className="w-full bg-blue-200 rounded-full h-2">
                          <div 
                            className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                            style={{ width: `${uploadProgress.progress}%` }}
                          />
                        </div>
                      </div>
                    )}

                    {uploadProgress.status === 'error' && uploadProgress.error && (
                      <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                        <p className="text-sm text-red-700">{uploadProgress.error}</p>
                      </div>
                    )}

                    <div className="relative">
                      <div className="absolute inset-0 flex items-center">
                        <div className="w-full border-t border-stone-300"></div>
                      </div>
                      <div className="relative flex justify-center text-sm">
                        <span className="px-2 bg-white text-stone-500">ou</span>
                      </div>
                    </div>

                    <div className="relative">
                      <ImageIcon className="absolute left-3 top-2.5 text-stone-400 w-5 h-5" />
                      <input 
                        name="imageUrl" 
                        value={formData.imageUrl} 
                        onChange={handleChange}
                        disabled={!!selectedFile}
                        placeholder="Cole a URL de uma imagem externa" 
                        className="w-full pl-10 p-2 border rounded-md focus:ring-emerald-500 focus:border-emerald-500 disabled:bg-stone-100 disabled:cursor-not-allowed" 
                      />
                    </div>
                    <p className="text-xs text-stone-500">
                      {selectedFile 
                        ? 'Arquivo selecionado. Remova para usar URL externa.' 
                        : 'Deixe em branco para gerar uma imagem aleatória.'}
                    </p>
                  </div>
                </div>

                <div className="col-span-2">
                  <label className="block text-sm font-medium text-stone-700 mb-1">Descrição de Usos</label>
                  <input required name="usage" value={formData.usage} onChange={handleChange} placeholder="Onde este produto deve ser aplicado?" aria-label="Descrição de Usos" className="w-full p-2 border rounded-md focus:ring-emerald-500 focus:border-emerald-500" />
                </div>

                <div className="col-span-2">
                  <label className="block text-sm font-medium text-stone-700 mb-1">Descrição Detalhada</label>
                  <textarea required name="description" value={formData.description} onChange={handleChange} rows={3} className="w-full p-2 border rounded-md focus:ring-emerald-500 focus:border-emerald-500" />
                </div>
              </div>

              <div className="pt-4 flex gap-3">
                <button type="submit" className="flex-1 bg-emerald-700 hover:bg-emerald-800 text-white font-bold py-3 rounded-lg shadow-md transition-colors">
                  {editingProduct 
                    ? `Atualizar ${formData.category === ProductCategory.SERVICES ? 'Serviço' : 'Produto'}`
                    : `Adicionar ${formData.category === ProductCategory.SERVICES ? 'Serviço' : 'Produto'} ao Catálogo`
                  }
                </button>
                {editingProduct && (
                  <button type="button" onClick={resetForm} className="px-6 bg-stone-500 hover:bg-stone-600 text-white font-bold py-3 rounded-lg shadow-md transition-colors">
                    Cancelar
                  </button>
                )}
              </div>
            </form>
          </div>
        )}

        {/* Product List */}
        {activeTab === 'list' && (
          <div className="bg-white rounded-xl shadow-lg border border-stone-200 overflow-hidden">
            <div className="bg-emerald-800 p-6 flex justify-between items-center">
              <h1 className="text-2xl font-bold text-white flex items-center">
                <List className="mr-3" /> Produtos Cadastrados ({filteredProducts.length})
              </h1>
              <div className="flex gap-2">
                <button
                  onClick={() => setShowFilters(!showFilters)}
                  className="flex items-center gap-2 bg-emerald-700 hover:bg-emerald-600 text-white px-4 py-2 rounded-md transition-colors"
                >
                  <Filter className="h-4 w-4" />
                  {showFilters ? 'Ocultar Filtros' : 'Filtros'}
                </button>
                <button
                  onClick={handleExportCSV}
                  className="flex items-center gap-2 bg-white text-emerald-800 hover:bg-emerald-50 px-4 py-2 rounded-md transition-colors font-medium"
                >
                  <Download className="h-4 w-4" />
                  Exportar CSV
                </button>
              </div>
            </div>

            {/* Filters Panel */}
            {showFilters && (
              <div className="bg-stone-50 border-b border-stone-200 p-6">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  {/* Search */}
                  <div>
                    <label className="block text-sm font-medium text-stone-700 mb-2">
                      Buscar
                    </label>
                    <div className="relative">
                      <Search className="absolute left-3 top-2.5 h-5 w-5 text-stone-400" />
                      <input
                        type="text"
                        placeholder="Nome, descrição, tags..."
                        value={filters.searchTerm}
                        onChange={(e) => setFilters({ ...filters, searchTerm: e.target.value })}
                        className="w-full pl-10 pr-4 py-2 border border-stone-300 rounded-md focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                      />
                    </div>
                  </div>

                  {/* Category Filter */}
                  <div>
                    <label className="block text-sm font-medium text-stone-700 mb-2">
                      Categoria
                    </label>
                    <select
                      value={filters.category}
                      onChange={(e) => setFilters({ ...filters, category: e.target.value })}
                      className="w-full px-4 py-2 border border-stone-300 rounded-md focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                    >
                      <option value="all">Todas as Categorias</option>
                      {Object.values(ProductCategory).map(cat => (
                        <option key={cat} value={cat}>{cat}</option>
                      ))}
                    </select>
                  </div>

                  {/* Min Price */}
                  <div>
                    <label className="block text-sm font-medium text-stone-700 mb-2">
                      Preço Mínimo
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      placeholder="R$ 0,00"
                      value={filters.minPrice || ''}
                      onChange={(e) => setFilters({ ...filters, minPrice: e.target.value ? parseFloat(e.target.value) : undefined })}
                      className="w-full px-4 py-2 border border-stone-300 rounded-md focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                    />
                  </div>

                  {/* Max Price */}
                  <div>
                    <label className="block text-sm font-medium text-stone-700 mb-2">
                      Preço Máximo
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      placeholder="R$ 999,99"
                      value={filters.maxPrice || ''}
                      onChange={(e) => setFilters({ ...filters, maxPrice: e.target.value ? parseFloat(e.target.value) : undefined })}
                      className="w-full px-4 py-2 border border-stone-300 rounded-md focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                    />
                  </div>
                </div>

                {/* Clear Filters */}
                <div className="mt-4 flex justify-end">
                  <button
                    onClick={() => setFilters({ category: 'all', minPrice: undefined, maxPrice: undefined, searchTerm: '' })}
                    className="text-sm text-stone-600 hover:text-stone-800 underline"
                  >
                    Limpar Filtros
                  </button>
                </div>
              </div>
            )}

            <div className="p-6">
              {filteredProducts.length === 0 ? (
                <p className="text-center text-stone-500 py-8">
                  {products.length === 0 
                    ? 'Nenhum produto cadastrado ainda.' 
                    : 'Nenhum produto encontrado com os filtros aplicados.'}
                </p>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {filteredProducts.map((product) => (
                    <div key={product.id} className="border border-stone-200 rounded-lg overflow-hidden hover:shadow-md transition-shadow">
                      <img 
                        src={product.imageUrl} 
                        alt={product.name}
                        className="w-full h-48 object-cover"
                      />
                      <div className="p-4">
                        <h3 className="font-bold text-lg text-stone-800 mb-1">{product.name}</h3>
                        <p className="text-sm text-stone-600 mb-2">{product.category}</p>
                        <p className="text-emerald-700 font-bold text-xl mb-3">
                          R$ {product.price.toFixed(2)} / {product.unit}
                        </p>
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleEdit(product)}
                            className="flex-1 flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-md transition-colors"
                          >
                            <Edit className="h-4 w-4" />
                            Editar
                          </button>
                          <button
                            onClick={() => handleDelete(product.id)}
                            className="flex items-center justify-center gap-2 bg-red-600 hover:bg-red-700 text-white py-2 px-4 rounded-md transition-colors"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}


        {/* Import CSV Tab */}
        {activeTab === 'import' && (
          <div className="bg-white rounded-xl shadow-lg border border-stone-200 overflow-hidden">
            <div className="bg-emerald-800 p-6">
              <h1 className="text-2xl font-bold text-white flex items-center">
                <Upload className="mr-3" /> Importar Produtos via CSV
              </h1>
            </div>
            
            <div className="p-8 space-y-6">
              {message && (
                <div className={`${message.includes('Erro') ? 'bg-red-100 border-red-400 text-red-700' : 'bg-green-100 border-green-400 text-green-700'} border px-4 py-3 rounded relative`}>
                  {message}
                </div>
              )}

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
                <h3 className="text-lg font-bold text-blue-800 mb-3">Instruções para Importação</h3>
                <p className="text-blue-700 mb-4">
                  O arquivo CSV deve conter um cabeçalho com os seguintes campos exatos:
                </p>
                <div className="bg-white p-4 rounded border border-blue-200 overflow-x-auto">
                  <code className="text-sm text-stone-800 whitespace-nowrap">
                    name,description,usage,measurements,price,category,imageUrl,unit,tags
                  </code>
                </div>
                <ul className="list-disc list-inside mt-4 text-sm text-blue-700 space-y-1">
                  <li><strong>name</strong>: Nome do produto (Obrigatório)</li>
                  <li><strong>price</strong>: Preço numérico, use ponto para decimais (Obrigatório)</li>
                  <li><strong>category</strong>: Categoria exata (ex: "Pedras Ornamentais", "Bloquetes e Pavers")</li>
                  <li><strong>tags</strong>: Separe múltiplas tags por vírgula</li>
                  <li><strong>imageUrl</strong>: URL pública da imagem (opcional)</li>
                </ul>
              </div>

              <div className="border-2 border-dashed border-stone-300 rounded-lg p-10 text-center hover:border-emerald-500 transition-colors">
                <input
                  type="file"
                  id="csvFile"
                  accept=".csv"
                  onChange={handleCSVSelect}
                  className="hidden"
                />
                <label htmlFor="csvFile" className="cursor-pointer block">
                  <Upload className="mx-auto h-16 w-16 text-stone-400 mb-4" />
                  <p className="text-lg text-stone-700 mb-2">
                    {selectedFile ? selectedFile.name : 'Clique para selecionar o arquivo CSV'}
                  </p>
                  <p className="text-sm text-stone-500">
                    {selectedFile ? `${(selectedFile.size / 1024).toFixed(1)} KB` : 'ou arraste o arquivo aqui'}
                  </p>
                </label>
              </div>

              {uploadProgress.status === 'uploading' && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-blue-700">Processando arquivo...</span>
                  </div>
                  <div className="w-full bg-blue-200 rounded-full h-2">
                    <div 
                      className="bg-blue-600 h-2 rounded-full animate-pulse"
                      style={{ width: '100%' }}
                    />
                  </div>
                </div>
              )}

              {uploadProgress.status === 'error' && uploadProgress.error && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                  <p className="text-sm text-red-700">{uploadProgress.error}</p>
                </div>
              )}

              <div className="flex justify-end">
                <button
                  onClick={handleCSVImport}
                  disabled={!selectedFile || uploadProgress.status === 'uploading'}
                  className="bg-emerald-700 hover:bg-emerald-800 text-white font-bold py-3 px-8 rounded-lg shadow-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Importar Produtos
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Orders Management Tab */}
        {activeTab === 'orders' && (
          <div className="bg-white rounded-xl shadow-lg border border-stone-200 overflow-hidden">
            <div className="bg-emerald-800 p-6">
              <div className="flex justify-between items-center">
                <h1 className="text-2xl font-bold text-white flex items-center">
                  <ShoppingCart className="mr-3" /> Gerenciar Pedidos
                </h1>
                <div className="flex gap-2">
                  <select
                    value={orderFilters}
                    onChange={(e) => setOrderFilters(e.target.value as OrderStatus | 'all')}
                    className="px-4 py-2 border border-stone-300 rounded-md focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                  >
                    <option value="all">Todos os Status</option>
                    {Object.values(OrderStatus).map(status => (
                      <option key={status} value={status}>
                        {status.charAt(0).toUpperCase() + status.slice(1)}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            <div className="p-6">
              {loadingOrders ? (
                <p className="text-center text-stone-500 py-8">Carregando pedidos...</p>
              ) : orders.length === 0 ? (
                <p className="text-center text-stone-500 py-8">
                  Nenhum pedido encontrado.
                </p>
              ) : (
                <div className="space-y-4">
                  {orders.map(order => (
                    <div
                      key={order.id}
                      className={`border rounded-lg p-4 cursor-pointer transition-colors ${
                        selectedOrder?.id === order.id ? 'border-emerald-500 bg-emerald-50' : 'border-stone-200 hover:bg-stone-50'
                      }`}
                      onClick={() => setSelectedOrder(order)}
                    >
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="font-bold text-lg">Pedido #{order.id.substring(0, 8)}</h3>
                          <p className="text-stone-600">
                            Cliente: {order.userInfo.name} |
                            Total: R$ {order.total.toFixed(2)} |
                            Status: {order.status}
                          </p>
                        </div>
                        <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                          order.status === 'delivered' ? 'bg-green-100 text-green-800' :
                          order.status === 'cancelled' ? 'bg-red-100 text-red-800' :
                          order.status === 'pending' || order.status === 'quotation' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-blue-100 text-blue-800'
                        }`}>
                          {order.status}
                        </span>
                      </div>

                      {selectedOrder?.id === order.id && (
                        <div className="mt-4 pt-4 border-t border-stone-200">
                          <OrderDetails
                            order={order}
                            currentUserId={currentUser?.id || ''}
                            onOrderUpdate={(updatedOrder) => {
                              setOrders(prev =>
                                prev.map(o => o.id === updatedOrder.id ? updatedOrder : o)
                              );
                              setSelectedOrder(updatedOrder);
                            }}
                            onError={setMessage}
                          />
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Budgets Management Tab */}
        {activeTab === 'budgets' && (
          <div className="bg-white rounded-xl shadow-lg border border-stone-200 overflow-hidden">
            <div className="bg-emerald-800 p-6">
              <div className="flex justify-between items-center">
                <h1 className="text-2xl font-bold text-white flex items-center">
                  <DollarSign className="mr-3" /> Gerenciar Orçamentos
                </h1>
                <div className="flex gap-2">
                  <select
                    value={budgetFilters}
                    onChange={(e) => setBudgetFilters(e.target.value as BudgetStatus | 'all')}
                    className="px-4 py-2 border border-stone-300 rounded-md focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                  >
                    <option value="all">Todos os Status</option>
                    {Object.values(BudgetStatus).map(status => (
                      <option key={status} value={status}>
                        {status.charAt(0).toUpperCase() + status.slice(1)}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            <div className="p-6">
              {loadingBudgets ? (
                <p className="text-center text-stone-500 py-8">Carregando orçamentos...</p>
              ) : budgets.length === 0 ? (
                <p className="text-center text-stone-500 py-8">
                  Nenhum orçamento encontrado.
                </p>
              ) : (
                <div className="space-y-4">
                  {budgets.map(budget => (
                    <div
                      key={budget.id}
                      className={`border rounded-lg p-4 cursor-pointer transition-colors ${
                        selectedBudget?.id === budget.id ? 'border-emerald-500 bg-emerald-50' : 'border-stone-200 hover:bg-stone-50'
                      }`}
                      onClick={() => setSelectedBudget(budget)}
                    >
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="font-bold text-lg">Orçamento #{budget.id.substring(0, 8)}</h3>
                          <p className="text-stone-600">
                            Cliente ID: {budget.customer_id.substring(0, 8)} |
                            Total: R$ {budget.total.toFixed(2)} |
                            Status: {budget.status}
                          </p>
                        </div>
                        <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                          budget.status === 'accepted' ? 'bg-green-100 text-green-800' :
                          budget.status === 'rejected' ? 'bg-red-100 text-red-800' :
                          budget.status === 'draft' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-blue-100 text-blue-800'
                        }`}>
                          {budget.status}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Admin;
