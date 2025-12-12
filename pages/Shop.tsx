
import React, { useState, useMemo } from 'react';
import { useStore } from '../context/StoreContext';
import ProductCard from '../components/ProductCard';
import { ProductCategory } from '../types';
import { Filter, Tag, X } from 'lucide-react';
import { MESSAGES, COLORS } from '../config';

const Shop: React.FC = () => {
  const { products } = useStore();
  const [selectedCategory, setSelectedCategory] = useState<string>('Todos');
  const [selectedTag, setSelectedTag] = useState<string | null>(null);

  const categories = ['Todos', ...Object.values(ProductCategory)];

  // 1. Filter by Category first
  const categoryFilteredProducts = useMemo(() => {
    if (selectedCategory === 'Todos') return products;
    return products.filter(p => p.category === selectedCategory);
  }, [products, selectedCategory]);

  // 2. Extract available tags from the products currently shown in the category
  const availableTags = useMemo(() => {
    const tags = new Set<string>();
    categoryFilteredProducts.forEach(p => {
      p.tags?.forEach(tag => tags.add(tag));
    });
    return Array.from(tags).sort();
  }, [categoryFilteredProducts]);

  // 3. Filter by Tag (Color/Type)
  const finalProducts = useMemo(() => {
    if (!selectedTag) return categoryFilteredProducts;
    return categoryFilteredProducts.filter(p => p.tags?.includes(selectedTag));
  }, [categoryFilteredProducts, selectedTag]);

  const handleCategoryChange = (cat: string) => {
    setSelectedCategory(cat);
    setSelectedTag(null); // Reset tag filter when changing category
  };

  return (
    <div className="min-h-screen bg-stone-50 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-serif font-bold text-stone-800 mb-4">{MESSAGES.shop.title}</h1>
          <p className="text-stone-600 max-w-2xl mx-auto">
            {MESSAGES.shop.description}
          </p>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-stone-100 mb-10">
          <div className="flex flex-col space-y-6">
            
            {/* Primary Filter: Categories */}
            <div>
              <h3 className="text-xs font-bold text-stone-400 uppercase tracking-wider mb-3 flex items-center">
                <Filter className="w-4 h-4 mr-2" /> {MESSAGES.shop.categories}
              </h3>
              <div className="flex flex-wrap gap-2">
                {categories.map(cat => (
                  <button
                    key={cat}
                    onClick={() => handleCategoryChange(cat)}
                    className="px-4 py-2 rounded-lg text-sm font-semibold transition-all"
                    style={{
                      backgroundColor: selectedCategory === cat ? COLORS.primary[600] : COLORS.secondary[100],
                      color: selectedCategory === cat ? 'white' : COLORS.secondary[600],
                      boxShadow: selectedCategory === cat ? '0 4px 6px rgba(0, 0, 0, 0.1)' : 'none'
                    }}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            {/* Secondary Filter: Tags (Colors/Types) */}
            {availableTags.length > 0 && (
              <div className="border-t border-stone-100 pt-4">
                <div className="flex justify-between items-center mb-3">
                   <h3 className="text-xs font-bold text-stone-400 uppercase tracking-wider flex items-center">
                    <Tag className="w-4 h-4 mr-2" /> {MESSAGES.shop.filterByFeature}
                  </h3>
                  {selectedTag && (
                    <button 
                      onClick={() => setSelectedTag(null)}
                      className="text-xs font-semibold flex items-center hover:opacity-80"
                      style={{ color: COLORS.status.error }}
                    >
                      <X className="w-3 h-3 mr-1" /> {MESSAGES.buttons.clearFilter}
                    </button>
                  )}
                </div>
               
                <div className="flex flex-wrap gap-2">
                  {availableTags.map(tag => (
                    <button
                      key={tag}
                      onClick={() => setSelectedTag(selectedTag === tag ? null : tag)}
                      className="px-3 py-1.5 rounded-full text-xs font-medium border transition-all"
                      style={{
                        backgroundColor: selectedTag === tag ? COLORS.primary[100] : 'white',
                        borderColor: selectedTag === tag ? COLORS.primary[300] : COLORS.secondary[200],
                        color: selectedTag === tag ? COLORS.primary[700] : COLORS.secondary[600]
                      }}
                    >
                      {tag}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Results Info */}
        <div className="mb-6 text-stone-500 text-sm">
          {MESSAGES.shop.showing} {finalProducts.length} {MESSAGES.shop.products}
          {selectedCategory !== 'Todos' && <span> em <strong>{selectedCategory}</strong></span>}
          {selectedTag && <span> com filtro <strong>"{selectedTag}"</strong></span>}
        </div>

        {/* Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {finalProducts.length > 0 ? (
            finalProducts.map(product => (
              <ProductCard key={product.id} product={product} />
            ))
          ) : (
            <div className="col-span-full py-20 text-center">
              <div className="w-16 h-16 bg-stone-100 rounded-full flex items-center justify-center mx-auto mb-4 text-stone-400">
                <Filter className="w-8 h-8" />
              </div>
              <p className="text-stone-500 text-lg font-medium">{MESSAGES.shop.noProducts}</p>
              <button 
                onClick={() => { setSelectedCategory('Todos'); setSelectedTag(null); }}
                className="mt-4 font-semibold hover:opacity-80 transition-opacity"
                style={{ color: COLORS.primary[600] }}
              >
                {MESSAGES.buttons.clearAllFilters}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Shop;
