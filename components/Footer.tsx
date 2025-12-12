import React from 'react';
import { Link } from 'react-router-dom';
import { useStore } from '../context/StoreContext';
import { Leaf, Phone, MapPin, Mail, LogIn, LogOut } from 'lucide-react';
import { BRAND, CONTACT, COLORS } from '../config';

const Footer: React.FC = () => {
  const { isAuthenticated, logout } = useStore();

  return (
    <footer 
      className="py-12 text-stone-300"
      style={{ backgroundColor: COLORS.secondary[900] }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
          <div>
            <div className="flex items-center space-x-2 mb-4">
              <Leaf 
                className="h-6 w-6"
                style={{ color: COLORS.primary[500] }}
              />
              <span className="font-serif text-xl font-bold text-white">
                {BRAND.companyName}
              </span>
            </div>
            <p className="text-sm" style={{ color: COLORS.secondary[400] }}>
              {BRAND.tagline}
            </p>
          </div>
          
          <div>
            <h3 className="font-bold text-white mb-4">Contato</h3>
            <ul className="space-y-2 text-sm">
              <li className="flex items-center">
                <Phone className="w-4 h-4 mr-2" /> {CONTACT.phone}
              </li>
              <li className="flex items-center">
                <Mail className="w-4 h-4 mr-2" /> {CONTACT.email}
              </li>
              <li className="flex items-center">
                <MapPin className="w-4 h-4 mr-2" /> {CONTACT.address}
              </li>
            </ul>
          </div>

          <div>
             <h3 className="font-bold text-white mb-4">Links Rápidos</h3>
             <ul className="space-y-2 text-sm">
               <li>
                 <a 
                   href="#" 
                   className="transition-colors"
                   style={{ color: COLORS.secondary[400] }}
                   onMouseEnter={(e) => e.currentTarget.style.color = COLORS.primary[400]}
                   onMouseLeave={(e) => e.currentTarget.style.color = COLORS.secondary[400]}
                 >
                   Política de Entrega
                 </a>
               </li>
               <li>
                 <a 
                   href="#" 
                   className="transition-colors"
                   style={{ color: COLORS.secondary[400] }}
                   onMouseEnter={(e) => e.currentTarget.style.color = COLORS.primary[400]}
                   onMouseLeave={(e) => e.currentTarget.style.color = COLORS.secondary[400]}
                 >
                   Calculadora de Materiais
                 </a>
               </li>
               <li>
                 <a 
                   href="#" 
                   className="transition-colors"
                   style={{ color: COLORS.secondary[400] }}
                   onMouseEnter={(e) => e.currentTarget.style.color = COLORS.primary[400]}
                   onMouseLeave={(e) => e.currentTarget.style.color = COLORS.secondary[400]}
                 >
                   Trabalhe Conosco
                 </a>
               </li>
             </ul>
          </div>
        </div>
        
        <div 
          className="pt-8 flex flex-col md:flex-row justify-between items-center text-xs"
          style={{ borderTopColor: COLORS.secondary[800], borderTopWidth: '1px', color: COLORS.secondary[500] }}
        >
          <p>{BRAND.copyright}</p>
          {isAuthenticated ? (
            <button 
              onClick={logout} 
              style={{
                marginTop: '1rem',
                marginRight: 0,
                paddingLeft: '0.75rem',
                paddingRight: '0.75rem',
                paddingTop: '0.25rem',
                paddingBottom: '0.25rem',
                borderRadius: '0.375rem',
                borderWidth: '1px',
                borderColor: COLORS.accent[600],
                backgroundColor: COLORS.accent[600],
                color: COLORS.neutral.white,
                transition: 'background-color 300ms'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = COLORS.accent[700];
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = COLORS.accent[600];
              }}
              className="md:mt-0 flex items-center space-x-1"
            >
              <LogOut className="w-3 h-3" />
              <span>Sair do Sistema</span>
            </button>
          ) : (
            <Link 
              to="/login" 
              className="mt-4 md:mt-0 px-3 py-1 rounded border border-stone-700 hover:text-white hover:border-stone-500 transition-colors flex items-center space-x-1"
            >
              <LogIn className="w-3 h-3" />
              <span>Acesso Funcionários</span>
            </Link>
          )}
        </div>
      </div>
    </footer>
  );
};

export default Footer;