import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ShoppingCart, Leaf, ShieldCheck, Menu, X, LogOut, User, LogIn } from 'lucide-react';
import { useStore } from '../context/StoreContext';
import { BRAND, COLORS, MESSAGES } from '../config';

const Navbar: React.FC = () => {
  const { cartCount, isAuthenticated, isEmployee, logout, currentUser } = useStore();
  const [isOpen, setIsOpen] = React.useState(false);
  const location = useLocation();

  const navClass = (path: string) => 
    `hover:opacity-80 transition-opacity ${location.pathname === path ? 'font-bold' : ''}`;

  return (
    <nav 
      className="text-white shadow-lg sticky top-0 z-50"
      style={{ backgroundColor: COLORS.primary[900] }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-20 items-center">
          
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2">
            <Leaf 
              className="h-8 w-8"
              style={{ color: COLORS.primary[400] }}
            />
            <div className="flex flex-col">
              <span className="font-serif text-2xl font-bold tracking-wide">
                {BRAND.companyNameShort}
              </span>
              <span 
                className="text-xs uppercase tracking-widest"
                style={{ color: COLORS.primary[300] }}
              >
                & Pedras
              </span>
            </div>
          </Link>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center space-x-8">
            <Link to="/" className={navClass('/')} style={{ color: COLORS.primary[100] }}>
              {MESSAGES.navigation.home}
            </Link>
            <Link 
              to="/shop" 
              className={navClass('/shop')} 
              style={{ color: COLORS.primary[100] }}
            >
              {MESSAGES.navigation.shop}
            </Link>
            
            {isAuthenticated && isEmployee && (
              <Link 
                to="/admin" 
                className="font-bold flex items-center"
                style={{ color: COLORS.accent[400] }}
              >
                <ShieldCheck className="h-4 w-4 mr-1" />
                {MESSAGES.navigation.adminArea}
              </Link>
            )}

            {isAuthenticated ? (
              <div className="flex items-center space-x-4">
                <Link 
                  to="/perfil" 
                  className="flex items-center space-x-1 font-medium transition-opacity hover:opacity-80"
                  style={{ color: COLORS.primary[100] }}
                >
                  <User className="h-4 w-4" />
                  <span>{MESSAGES.navigation.profile}</span>
                </Link>
                <span className="text-sm" style={{ color: COLORS.primary[200] }}>
                  {MESSAGES.navigation.greeting} {currentUser?.name?.split(' ')[0] || 'Cliente'}
                </span>
                <button
                  onClick={logout}
                  className="flex items-center space-x-1 font-medium transition-opacity hover:opacity-80"
                  style={{ color: COLORS.primary[100] }}
                >
                  <LogOut className="h-4 w-4" />
                  <span>{MESSAGES.navigation.logout}</span>
                </button>
              </div>
            ) : (
              <Link 
                to="/entrar" 
                className="flex items-center space-x-1 font-medium transition-opacity hover:opacity-80"
                style={{ color: COLORS.primary[100] }}
              >
                <LogIn className="h-4 w-4" />
                <span>{MESSAGES.navigation.login}</span>
              </Link>
            )}
            
            <Link 
              to="/cart" 
              className="relative p-2 rounded-full transition-opacity hover:opacity-80"
              style={{ backgroundColor: COLORS.primary[800] }}
            >
              <ShoppingCart className="h-6 w-6" />
              {cartCount > 0 && (
                <span 
                  className="absolute -top-1 -right-1 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center"
                  style={{ backgroundColor: COLORS.accent[500] }}
                >
                  {cartCount}
                </span>
              )}
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden flex items-center">
            <button 
              onClick={() => setIsOpen(!isOpen)} 
              className="p-2 transition-opacity hover:opacity-80"
              style={{ color: COLORS.primary[100] }}
            >
              {isOpen ? <X className="h-7 w-7" /> : <Menu className="h-7 w-7" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isOpen && (
        <div style={{ backgroundColor: COLORS.primary[800] }}>
          <div className="px-4 pt-2 pb-6 space-y-2">
            <Link 
              to="/" 
              onClick={() => setIsOpen(false)} 
              className="block px-3 py-2 rounded-md text-white transition-colors"
              style={{ '--hover-color': COLORS.primary[700] } as React.CSSProperties}
              onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = COLORS.primary[700])}
              onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
            >
              {MESSAGES.navigation.home}
            </Link>
            <Link 
              to="/shop" 
              onClick={() => setIsOpen(false)} 
              className="block px-3 py-2 rounded-md text-white transition-colors"
              onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = COLORS.primary[700])}
              onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
            >
              {MESSAGES.navigation.shop}
            </Link>
            
             {isAuthenticated && isEmployee && (
                <Link to="/admin" onClick={() => setIsOpen(false)} className="block px-3 py-2 rounded-md text-amber-400 font-bold flex items-center">
                  <ShieldCheck className="h-4 w-4 mr-2" />
                  Área do Funcionário
                </Link>
             )}

             {isAuthenticated ? (
                <>
                  <Link to="/perfil" onClick={() => setIsOpen(false)} className="block px-3 py-2 rounded-md text-emerald-100 hover:bg-emerald-700 flex items-center">
                    <User className="h-4 w-4 mr-2" /> Perfil
                  </Link>
                  <div className="px-3 py-2 text-emerald-200 text-sm">
                    Logado como: {currentUser?.name || currentUser?.email}
                  </div>
                  <button
                    onClick={() => { logout(); setIsOpen(false); }}
                    className="w-full text-left px-3 py-2 rounded-md text-emerald-100 hover:bg-emerald-700 flex items-center"
                  >
                    <LogOut className="h-4 w-4 mr-2" /> Sair
                  </button>
                </>
             ) : (
                <Link to="/entrar" onClick={() => setIsOpen(false)} className="block px-3 py-2 rounded-md text-emerald-100 hover:bg-emerald-700 flex items-center">
                  <LogIn className="h-4 w-4 mr-2" /> Entrar
                </Link>
             )}
             
            <Link to="/cart" onClick={() => setIsOpen(false)} className="block px-3 py-2 rounded-md hover:bg-emerald-700 flex items-center">
              <ShoppingCart className="h-5 w-5 mr-2" /> Carrinho ({cartCount})
            </Link>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;