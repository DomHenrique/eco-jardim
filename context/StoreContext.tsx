


import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Product, CartItem, ProductCategory, ApiResponse } from '../types';
import { getCurrentUser, loginWithEmail, logout as authLogout, onAuthStateChange, AuthUser, isEmployee as checkIsEmployee, signUp as authSignUp } from '../services/authService';
import { cartService } from '../services/cartService';

interface StoreContextType {
  products: Product[];
  cart: CartItem[];
  addToCart: (product: Product, quantity: number) => void;
  removeFromCart: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  addProduct: (product: Product) => void;
  cartTotal: number;
  cartCount: number;
  currentUser: AuthUser | null;
  isAuthenticated: boolean;
  isEmployee: boolean;
  login: (email: string, password: string) => Promise<ApiResponse<AuthUser>>;
  signUp: (name: string, email: string, password: string, role?: string, adminToken?: string) => Promise<ApiResponse<AuthUser>>;
  logout: () => Promise<void>;
}

const StoreContext = createContext<StoreContextType | undefined>(undefined);

// Initial Mock Data
const INITIAL_PRODUCTS: Product[] = [
  {
    id: '1',
    name: 'Pedra São Tomé Amarela (Cacos)',
    category: ProductCategory.STONES,
    price: 45.00,
    unit: 'm²',
    measurements: 'Irregular (Cacos)',
    usage: 'Ideal para calçadas, áreas de piscina e caminhos de jardim. Antiderrapante e térmica.',
    description: 'Pedra natural de alta durabilidade e beleza rústica.',
    imageUrl: 'https://picsum.photos/seed/stone1/400/400',
    tags: ['Amarela', 'Rústica', 'Térmica', 'Cacos']
  },
  {
    id: '2',
    name: 'Paver de Concreto Intertravado',
    category: ProductCategory.PAVERS,
    price: 65.00,
    unit: 'm²',
    measurements: '10x20x6cm',
    usage: 'Pavimentação de calçadas, praças e estacionamentos leves.',
    description: 'Bloco de concreto de alta resistência, fácil manutenção e permeável.',
    imageUrl: 'https://picsum.photos/seed/paver1/400/400',
    tags: ['Cinza', 'Concreto', 'Permeável', 'Retangular']
  },
  {
    id: '3',
    name: 'Pedra Miracema Serrada',
    category: ProductCategory.STONES,
    price: 58.90,
    unit: 'm²',
    measurements: '11.5x23cm',
    usage: 'Rampas de garagem, calçadas e revestimentos de parede.',
    description: 'Pedra granítica cinza de alta resistência ao tráfego de veículos.',
    imageUrl: 'https://picsum.photos/seed/stone2/400/400',
    tags: ['Cinza', 'Serrada', 'Antiderrapante', 'Granito']
  },
  {
    id: '4',
    name: 'Serviço de Jardinagem Completa',
    category: ProductCategory.SERVICES,
    price: 150.00,
    unit: 'visita',
    measurements: 'Até 4 horas',
    usage: 'Poda, adubação e limpeza geral de jardins residenciais.',
    description: 'Equipe especializada para revitalizar seu jardim com todo cuidado.',
    imageUrl: 'https://picsum.photos/seed/garden1/400/400',
    tags: ['Manutenção', 'Poda', 'Limpeza']
  },
  {
    id: '5',
    name: 'Assentamento de Pedras (Mão de Obra)',
    category: ProductCategory.SERVICES,
    price: 80.00,
    unit: 'm²',
    measurements: 'Mínimo 10m²',
    usage: 'Instalação profissional de pedras ornamentais e pavers.',
    description: 'Pedreiros experientes em acabamentos finos e rústicos.',
    imageUrl: 'https://picsum.photos/seed/worker1/400/400',
    tags: ['Instalação', 'Obra', 'Pedreiro']
  },
  {
    id: '6',
    name: 'Limpa Pedras Super Concentrado',
    category: ProductCategory.GARDEN_CARE,
    price: 35.50,
    unit: 'Galão 5L',
    measurements: '5 Litros',
    usage: 'Remoção de sujeiras incrustadas, limo e fungos em pedras rústicas.',
    description: 'Produto ácido de alta performance para limpeza pesada.',
    imageUrl: 'https://picsum.photos/seed/cleaner1/400/400',
    tags: ['Químico', 'Limpeza Pesada', 'Ácido']
  },
  {
    id: '7',
    name: 'Seixo de Rio Branco',
    category: ProductCategory.STONES,
    price: 22.00,
    unit: 'Saco 20kg',
    measurements: 'Granulometria 2 ou 3',
    usage: 'Decoração de jardins, vasos e acabamentos.',
    description: 'Pedras roladas naturais brancas para paisagismo.',
    imageUrl: 'https://picsum.photos/seed/pebble/400/400',
    tags: ['Branca', 'Seixo', 'Decorativa', 'Jardim']
  },
  {
    id: '8',
    name: 'Fertilizante NPK 10-10-10',
    category: ProductCategory.GARDEN_CARE,
    price: 18.90,
    unit: 'kg',
    measurements: '1kg',
    usage: 'Manutenção geral de plantas, flores e gramados.',
    description: 'Adubo balanceado para crescimento saudável.',
    imageUrl: 'https://picsum.photos/seed/fert/400/400',
    tags: ['Adubo', 'Nutrição', 'Químico']
  }
];

export const StoreProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [products, setProducts] = useState<Product[]>(INITIAL_PRODUCTS);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [currentUser, setCurrentUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  // Load initial state
  useEffect(() => {
    const loadState = async () => {
      // Load products from localStorage if available (mock persistence)
      const savedProducts = localStorage.getItem('ecoJardimProducts');
      if (savedProducts) {
        setProducts(JSON.parse(savedProducts));
      }

      // Load cart from localStorage
      const savedCart = localStorage.getItem('ecoJardimCart');
      if (savedCart) {
        setCart(JSON.parse(savedCart));
      }

      // Check current user
      const user = await getCurrentUser();
      if (user) {
        setCurrentUser(user);
      }
      
      setLoading(false);
    };

    loadState();

    // Subscribe to auth changes
    const { data: { subscription } } = onAuthStateChange((user) => {
      setCurrentUser(user);
    });

    return () => {
      subscription?.unsubscribe();
    };
  }, []);

  // Sync cart with DB when user changes
  useEffect(() => {
    const syncCart = async () => {
      if (currentUser && currentUser.dbId) {
        // Load cart from DB
        const dbCart = await cartService.loadCart(currentUser.dbId);
        if (dbCart) {
           // Merge or replace? For now, let's replace local cart with DB cart if DB cart is not empty
           // Or maybe merge? Let's keep it simple: if DB has items, use them.
           if (dbCart.length > 0) {
             setCart(dbCart);
           } else if (cart.length > 0) {
             // If DB is empty but local has items, save local to DB
             await cartService.saveCart(currentUser.dbId, cart);
           }
        } else if (cart.length > 0) {
           // No cart in DB, save local
           await cartService.saveCart(currentUser.dbId, cart);
        }
      }
    };
    // Only run if not loading initially to prevent race conditions with initial cart load
    if (!loading) {
      syncCart();
    }
  }, [currentUser?.dbId, loading]); // Run when user ID changes (login/logout) or after initial loading

  // Save cart to localStorage and DB whenever it changes
  useEffect(() => {
    localStorage.setItem('ecoJardimCart', JSON.stringify(cart));
    
    // Debounce DB save
    const timeoutId = setTimeout(() => {
      if (currentUser && currentUser.dbId) {
        cartService.saveCart(currentUser.dbId, cart);
      }
    }, 1000); // Save after 1 second of inactivity

    return () => clearTimeout(timeoutId);
  }, [cart, currentUser]);

  // Save products to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem('ecoJardimProducts', JSON.stringify(products));
  }, [products]);

  const addToCart = (product: Product, quantity: number) => {
    setCart(prevCart => {
      const existingItem = prevCart.find(item => item.id === product.id);
      if (existingItem) {
        return prevCart.map(item =>
          item.id === product.id
            ? { ...item, quantity: item.quantity + quantity }
            : item
        );
      }
      return [...prevCart, { ...product, quantity }];
    });
  };

  const removeFromCart = (productId: string) => {
    setCart(prevCart => prevCart.filter(item => item.id !== productId));
  };

  const updateQuantity = (productId: string, quantity: number) => {
    if (quantity < 1) return;
    setCart(prevCart =>
      prevCart.map(item =>
        item.id === productId ? { ...item, quantity } : item
      )
    );
  };

  const clearCart = () => {
    setCart([]);
  };

  const addProduct = (product: Product) => {
    setProducts(prev => [product, ...prev]);
  };

  const login = async (email: string, password: string): Promise<ApiResponse<AuthUser>> => {
    const result = await loginWithEmail(email, password);
    if (result.success && result.data) {
      setCurrentUser(result.data);
    }
    return result;
  };

  const signUp = async (name: string, email: string, password: string, role?: string, adminToken?: string): Promise<ApiResponse<AuthUser>> => {
    const result = await authSignUp(name, email, password, role, adminToken);
    if (result.success && result.data) {
      setCurrentUser(result.data);
    }
    return result;
  };

  const logout = async () => {
    await authLogout();
    setCurrentUser(null);
    setCart([]); // Clear cart on logout? Or keep it? Usually clear or keep local. Let's clear for security/privacy on shared devices.
    localStorage.removeItem('ecoJardimCart');
  };

  const cartTotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0);
  const isAuthenticated = currentUser !== null;
  const isEmployee = currentUser !== null && checkIsEmployee(currentUser);

  return (
    <StoreContext.Provider value={{
      products,
      cart,
      addToCart,
      removeFromCart,
      updateQuantity,
      clearCart,
      addProduct,
      cartTotal,
      cartCount,
      currentUser,
      isAuthenticated,
      isEmployee,
      login,
      signUp,
      logout
    }}>
      {children}
    </StoreContext.Provider>
  );
};

export const useStore = () => {
  const context = useContext(StoreContext);
  if (context === undefined) {
    throw new Error('useStore must be used within a StoreProvider');
  }
  return context;
};
