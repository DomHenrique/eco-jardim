import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, CheckCircle, Truck, Wrench, Shield } from 'lucide-react';
import { useStore } from '../context/StoreContext';
import ProductCard from '../components/ProductCard';
import { BRAND, COLORS, MESSAGES } from '../config';

const Home: React.FC = () => {
  const { products } = useStore();
  const featuredProducts = products.slice(0, 4);

  return (
    <div className="flex flex-col min-h-screen">
      {/* Hero Section */}
      <div 
        className="relative h-[500px] flex items-center"
        style={{ backgroundColor: COLORS.primary[900] }}
      >
        <div className="absolute inset-0 z-0">
          <img 
            src="https://images.unsplash.com/photo-1596525737604-d2780e90632b?q=80&w=1920&auto=format&fit=crop" 
            alt="Jardim com pedras" 
            className="w-full h-full object-cover opacity-30"
          />
        </div>
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-white">
          <h1 className="font-serif text-5xl md:text-6xl font-bold mb-6 leading-tight">
            {MESSAGES.home.heroTitle}
          </h1>
          <p 
            className="text-xl md:text-2xl mb-8 max-w-2xl font-light"
            style={{ color: COLORS.primary[100] }}
          >
            {MESSAGES.home.heroSubtitle}
          </p>
          <div className="flex flex-col sm:flex-row gap-4">
            <Link 
              to="/shop" 
              className="text-white text-lg font-bold py-3 px-8 rounded-full transition-all flex items-center justify-center"
              style={{ backgroundColor: COLORS.accent[500] }}
              onMouseEnter={(e) => e.currentTarget.style.backgroundColor = COLORS.accent[600]}
              onMouseLeave={(e) => e.currentTarget.style.backgroundColor = COLORS.accent[500]}
            >
              {MESSAGES.buttons.viewCatalog} <ArrowRight className="ml-2 w-5 h-5" />
            </Link>
          </div>
        </div>
      </div>

      {/* Benefits */}
      <div className="py-16" style={{ backgroundColor: COLORS.secondary[50] }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
            <div className="bg-white p-8 rounded-xl shadow-sm border border-stone-100">
              <div 
                className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4"
                style={{ backgroundColor: COLORS.primary[100], color: COLORS.primary[600] }}
              >
                <Truck className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-bold text-stone-800 mb-2">{MESSAGES.benefits.fastDelivery}</h3>
              <p className="text-stone-600">{MESSAGES.benefits.fastDeliveryDesc}</p>
            </div>
            <div className="bg-white p-8 rounded-xl shadow-sm border border-stone-100">
              <div 
                className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4"
                style={{ backgroundColor: COLORS.primary[100], color: COLORS.primary[600] }}
              >
                <Wrench className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-bold text-stone-800 mb-2">{MESSAGES.benefits.installation}</h3>
              <p className="text-stone-600">{MESSAGES.benefits.installationDesc}</p>
            </div>
            <div className="bg-white p-8 rounded-xl shadow-sm border border-stone-100">
              <div 
                className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4"
                style={{ backgroundColor: COLORS.primary[100], color: COLORS.primary[600] }}
              >
                <Shield className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-bold text-stone-800 mb-2">{MESSAGES.benefits.quality}</h3>
              <p className="text-stone-600">{MESSAGES.benefits.qualityDesc}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Featured Products */}
      <div className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-end mb-10">
            <div>
              <h2 className="text-3xl font-serif font-bold text-stone-800">{MESSAGES.home.featuredProducts}</h2>
              <p className="text-stone-500 mt-2">{MESSAGES.home.featuredProductsDesc}</p>
            </div>
            <Link 
              to="/shop" 
              className="hidden sm:flex font-semibold items-center"
              style={{ color: COLORS.primary[600] }}
              onMouseEnter={(e) => (e.currentTarget.style.color = COLORS.primary[700])}
              onMouseLeave={(e) => (e.currentTarget.style.color = COLORS.primary[600])}
            >
              {MESSAGES.buttons.viewAll} <ArrowRight className="ml-1 w-4 h-4" />
            </Link>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {featuredProducts.map(product => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>

          <div className="mt-10 sm:hidden text-center">
             <Link 
              to="/shop" 
              className="font-semibold inline-flex items-center"
              style={{ color: COLORS.primary[600] }}
              onMouseEnter={(e) => (e.currentTarget.style.color = COLORS.primary[700])}
              onMouseLeave={(e) => (e.currentTarget.style.color = COLORS.primary[600])}
            >
              {MESSAGES.buttons.viewAll} <ArrowRight className="ml-1 w-4 h-4" />
            </Link>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="bg-emerald-800 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between">
          <div className="mb-8 md:mb-0 md:pr-8">
             <h2 className="text-3xl font-serif font-bold text-white mb-4">Precisa de um jardineiro ou pedreiro?</h2>
             <p className="text-emerald-200 text-lg">Não vendemos apenas o material. Temos a equipe certa para executar seu projeto do início ao fim.</p>
          </div>
          <Link to="/shop?category=Services" className="bg-white text-emerald-900 font-bold py-3 px-8 rounded-full hover:bg-stone-100 transition-colors shadow-lg whitespace-nowrap">
            Contratar Serviços
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Home;