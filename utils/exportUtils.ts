import { Product } from '../types';

/**
 * Convert products to CSV format
 */
export const exportProductsToCSV = (products: Product[], filename: string = 'produtos.csv'): void => {
  // CSV Headers
  const headers = [
    'ID',
    'Nome',
    'Categoria',
    'Preço',
    'Unidade',
    'Medidas',
    'Descrição',
    'Uso',
    'Tags',
    'URL da Imagem',
    'Tipo de Armazenamento',
    'Data de Criação'
  ];

  // Convert products to CSV rows
  const rows = products.map(product => [
    product.id,
    `"${product.name}"`,
    `"${product.category}"`,
    product.price.toFixed(2),
    `"${product.unit}"`,
    `"${product.measurements || ''}"`,
    `"${(product.description || '').replace(/"/g, '""')}"`, // Escape quotes
    `"${(product.usage || '').replace(/"/g, '""')}"`,
    `"${product.tags?.join(', ') || ''}"`,
    `"${product.imageUrl}"`,
    `"${product.imageStorageType || 'placeholder'}"`,
    product.created_at || ''
  ]);

  // Combine headers and rows
  const csvContent = [
    headers.join(','),
    ...rows.map(row => row.join(','))
  ].join('\n');

  // Create blob and download
  const blob = new Blob(['\ufeff' + csvContent], { type: 'text/csv;charset=utf-8;' }); // BOM for Excel
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  link.style.visibility = 'hidden';
  
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

/**
 * Filter products by category
 */
export const filterProductsByCategory = (products: Product[], category: string): Product[] => {
  if (!category || category === 'all') return products;
  return products.filter(p => p.category === category);
};

/**
 * Filter products by price range
 */
export const filterProductsByPriceRange = (
  products: Product[], 
  minPrice?: number, 
  maxPrice?: number
): Product[] => {
  let filtered = products;
  
  if (minPrice !== undefined) {
    filtered = filtered.filter(p => p.price >= minPrice);
  }
  
  if (maxPrice !== undefined) {
    filtered = filtered.filter(p => p.price <= maxPrice);
  }
  
  return filtered;
};

/**
 * Filter products by search term (name, description, tags)
 */
export const filterProductsBySearch = (products: Product[], searchTerm: string): Product[] => {
  if (!searchTerm) return products;
  
  const term = searchTerm.toLowerCase();
  
  return products.filter(p => 
    p.name.toLowerCase().includes(term) ||
    p.description?.toLowerCase().includes(term) ||
    p.tags?.some(tag => tag.toLowerCase().includes(term))
  );
};

/**
 * Apply all filters to products
 */
export const applyProductFilters = (
  products: Product[],
  filters: {
    category?: string;
    minPrice?: number;
    maxPrice?: number;
    searchTerm?: string;
  }
): Product[] => {
  let filtered = products;
  
  if (filters.category) {
    filtered = filterProductsByCategory(filtered, filters.category);
  }
  
  if (filters.minPrice !== undefined || filters.maxPrice !== undefined) {
    filtered = filterProductsByPriceRange(filtered, filters.minPrice, filters.maxPrice);
  }
  
  if (filters.searchTerm) {
    filtered = filterProductsBySearch(filtered, filters.searchTerm);
  }
  
  return filtered;
};
