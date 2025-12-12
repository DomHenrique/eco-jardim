
import React from 'react';
import { Product } from '../types';
import { useStore } from '../context/StoreContext';
import { ShoppingBag, Ruler, Info } from 'lucide-react';
import { COLORS, LOCALE } from '../config';

interface ProductCardProps {
  product: Product;
}

const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  const { addToCart } = useStore();

  return (
    <div className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-xl transition-shadow duration-300 flex flex-col h-full border border-stone-100">
      <div className="relative h-56 overflow-hidden group">
        <img 
          src={product.imageUrl} 
          alt={product.name} 
          className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-500"
        />
        <div 
          className="absolute top-2 right-2 text-white text-xs font-bold px-2 py-1 rounded-full uppercase tracking-wide shadow-md"
          style={{ backgroundColor: COLORS.primary[600] }}
        >
          {product.category}
        </div>
      </div>

      <div className="p-5 flex-1 flex flex-col">
        {/* Tags Row */}
        {product.tags && product.tags.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-2">
            {product.tags.slice(0, 3).map((tag, i) => (
              <span key={i} className="text-[10px] bg-stone-100 text-stone-600 px-2 py-0.5 rounded-full font-medium border border-stone-200">
                {tag}
              </span>
            ))}
            {product.tags.length > 3 && (
               <span className="text-[10px] text-stone-400 px-1">+{product.tags.length - 3}</span>
            )}
          </div>
        )}

        <h3 className="text-lg font-bold text-stone-800 mb-1 leading-tight">{product.name}</h3>
        <p className="text-stone-500 text-sm mb-3 line-clamp-2 flex-1">{product.description}</p>
        
        <div className="space-y-1 mb-4 text-xs text-stone-600">
          <div className="flex items-center">
            <Ruler className="w-3 h-3 mr-1" style={{ color: COLORS.primary[500] }} />
            <span className="font-semibold mr-1">Medidas:</span> {product.measurements}
          </div>
          <div className="flex items-center">
            <Info className="w-3 h-3 mr-1" style={{ color: COLORS.primary[500] }} />
            <span className="font-semibold mr-1">Uso:</span> <span className="truncate">{product.usage}</span>
          </div>
        </div>

        <div className="flex items-end justify-between mt-auto">
          <div>
            <span className="text-xs text-stone-400">Preço por {product.unit}</span>
            <div 
              className="text-2xl font-bold"
              style={{ color: COLORS.primary[700] }}
            >
              {LOCALE.formatCurrency(product.price)}
            </div>
          </div>
          <button 
            onClick={() => addToCart(product, 1)}
            className="text-white p-2 rounded-full shadow-lg transform active:scale-95 transition-all"
            style={{ backgroundColor: COLORS.primary[600] }}
            onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = COLORS.primary[700])}
            onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = COLORS.primary[600])}
            title="Adicionar ao carrinho"
          >
            <ShoppingBag className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;
