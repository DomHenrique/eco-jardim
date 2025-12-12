/**
 * 🎨 CENTRAL CONFIGURATION FILE - Ecojardim & Pedras
 * 
 * This file centralizes all brand, theme, color, and content configurations
 * making it easy to update the entire application with a single file change.
 * 
 * Categories:
 * - Brand Information
 * - Colors & Theme
 * - Typography
 * - Company Contact Information
 * - Email Configuration
 * - Currency & Locale
 * - Messages & Texts
 * - Product Categories
 * - Error Messages
 * - Feature Flags
 */

// ============================================================================
// 🏢 BRAND INFORMATION
// ============================================================================

export const BRAND = {
  // Company name and variations
  companyName: 'Ecojardim & Pedras',
  companyNameShort: 'EcoJardim',
  companyNameFull: 'Ecojardim & Pedras - Materiais e Serviços',
  
  // Company tagline/mission
  tagline: 'Transformando espaços com a beleza natural das pedras e o frescor das plantas.',
  taglineSubtitle: 'Qualidade e confiança em cada m².',
  
  // Company description
  description: 'Pedras (São Tomé, Miracema, Seixo), Pavers, Serviços de Jardinagem',
  
  // Assistant name
  assistantName: 'EcoJardim Assistente',
  
  // Copyright
  copyright: `© ${new Date().getFullYear()} Ecojardim & Pedras. Todos os direitos reservados.`,
  
  // Logo text/emoji
  logo: '🌿',
  logoBrand: '🌿 Ecojardim & Pedras',
} as const;

// ============================================================================
// 🎨 COLORS & THEME CONFIGURATION
// ============================================================================

export const COLORS = {
  // Primary colors (Emerald - nature/eco-friendly)
  primary: {
    50: '#ecfdf5',
    100: '#d1fae5',
    200: '#a7f3d0',
    300: '#6ee7b7',
    400: '#34d399',
    500: '#10b981',
    600: '#059669',
    700: '#047857',
    800: '#065f46',
    900: '#064e3b',
  },
  
  // Secondary colors (Stone - neutral)
  secondary: {
    50: '#fafaf9',
    100: '#f5f5f4',
    200: '#e7e5e4',
    300: '#d6d3d1',
    400: '#a8a29e',
    500: '#78716c',
    600: '#57534e',
    700: '#44403c',
    800: '#292524',
    900: '#1c1917',
  },
  
  // Accent colors (Amber - highlights/CTAs)
  accent: {
    500: '#f59e0b',
    600: '#d97706',
  },
  
  // Status colors
  status: {
    success: '#10b981',    // emerald-500
    error: '#ef4444',      // red-500
    warning: '#f59e0b',    // amber-500
    info: '#3b82f6',       // blue-500
  },
  
  // Neutral colors
  neutral: {
    white: '#ffffff',
    black: '#000000',
    gray: '#6b7280',
    lightGray: '#f3f4f6',
    darkGray: '#374151',
  },
} as const;

// ============================================================================
// 🔤 TYPOGRAPHY CONFIGURATION
// ============================================================================

export const TYPOGRAPHY = {
  // Font families
  fonts: {
    sans: "'Inter', sans-serif",
    serif: "'Merriweather', serif",
  },
  
  // Font sizes for consistency
  sizes: {
    xs: '0.75rem',      // 12px
    sm: '0.875rem',     // 14px
    base: '1rem',       // 16px
    lg: '1.125rem',     // 18px
    xl: '1.25rem',      // 20px
    '2xl': '1.5rem',    // 24px
    '3xl': '1.875rem',  // 30px
    '4xl': '2.25rem',   // 36px
    '5xl': '3rem',      // 48px
  },
  
  // Line heights
  lineHeights: {
    tight: '1.25',
    normal: '1.5',
    relaxed: '1.75',
  },
  
  // Letter spacing
  letterSpacing: {
    tight: '-0.02em',
    normal: '0',
    wide: '0.025em',
    wider: '0.05em',
    widest: '0.1em',
  },
} as const;

// ============================================================================
// 📞 CONTACT INFORMATION
// ============================================================================

export const CONTACT = {
  // Email addresses
  email: 'contato@ecojardim.com',
  emailSupport: 'suporte@ecojardim.com',
  emailNoreply: 'naoresponda@hnperformancedigital.com.br', // SMTP fallback
  
  // Phone numbers
  phone: '(11) 99999-9999',
  phoneFormatted: '+55 11 99999-9999',
  
  // Address
  address: 'Rodovia das Pedras, Km 45',
  city: 'São Paulo',
  state: 'SP',
  zipCode: '01234-567',
  
  // Full address string
  fullAddress: 'Rodovia das Pedras, Km 45, São Paulo - SP, 01234-567',
  
  // Social media (if needed)
  social: {
    instagram: '@ecojardim',
    facebook: 'ecojardim-pedras',
    whatsapp: '5511999999999',
  },
  
  // Support hours
  supportHours: {
    weekday: '08:00 - 18:00',
    saturday: '08:00 - 14:00',
    sunday: 'Fechado',
  },
} as const;

// ============================================================================
// 💰 CURRENCY & LOCALE CONFIGURATION
// ============================================================================

export const LOCALE = {
  // Language locale
  language: 'pt-BR',
  country: 'BR',
  
  // Currency
  currency: 'BRL',
  currencySymbol: 'R$',
  currencyPlacement: 'prefix', // 'prefix' or 'suffix'
  
  // Number formatting
  decimalSeparator: ',',
  thousandsSeparator: '.',
  currencyDecimals: 2,
  
  // Utilities for formatting
  formatCurrency: (value: number): string => {
    return `R$ ${value.toFixed(2).replace('.', ',')}`;
  },
  
  formatPrice: (value: number): string => {
    return `R$ ${value.toFixed(2).replace('.', ',')}`;
  },
  
  // Date formatting
  dateFormat: 'DD/MM/YYYY',
  timeFormat: 'HH:mm:ss',
  dateTimeFormat: 'DD/MM/YYYY HH:mm:ss',
  
  // Locale for date functions
  localeCode: 'pt-BR',
} as const;

// ============================================================================
// 📧 EMAIL CONFIGURATION
// ============================================================================

export const EMAIL = {
  // SMTP Configuration
  smtpHost: process.env.VITE_SMTP_HOST || 'smtp.example.com',
  smtpPort: parseInt(process.env.VITE_SMTP_PORT || '587'),
  smtpSecure: process.env.VITE_SMTP_SECURE === 'true',
  smtpUser: process.env.VITE_SMTP_USER || CONTACT.emailNoreply,
  
  // From name for emails
  fromName: process.env.VITE_EMAIL_FROM_NAME || BRAND.companyName,
  
  // Email templates configuration
  templates: {
    welcome: {
      subject: `Bem-vindo à ${BRAND.companyName}!`,
      fromName: BRAND.companyName,
    },
    orderConfirmation: {
      subject: 'Confirmação do Pedido',
      fromName: BRAND.companyName,
    },
    orderStatusUpdate: {
      subject: 'Atualização do Status do Pedido',
      fromName: BRAND.companyName,
    },
    budgetNotification: {
      subject: 'Orçamento Disponível',
      fromName: BRAND.companyName,
    },
    abandonedCart: {
      subject: 'Você esqueceu itens no seu carrinho!',
      fromName: BRAND.companyName,
    },
  },
} as const;

// ============================================================================
// 📝 MESSAGES & UI TEXTS
// ============================================================================

export const MESSAGES = {
  // Success messages
  success: {
    login: 'Login realizado com sucesso!',
    logout: 'Logout realizado com sucesso!',
    signup: 'Cadastro realizado com sucesso!',
    cartSaved: 'Carrinho salvo com sucesso!',
    orderCreated: 'Pedido criado com sucesso!',
    profileUpdated: 'Perfil atualizado com sucesso!',
  },
  
  // Error messages
  error: {
    generic: 'Ocorreu um erro. Por favor, tente novamente.',
    invalidEmail: 'Email inválido',
    userNotFound: 'Usuário não encontrado',
    wrongPassword: 'Senha incorreta',
    emailInUse: 'Este email já está em uso',
    networkError: 'Erro de conexão. Verifique sua internet.',
    timeout: 'A operação demorou muito. Tente novamente.',
    permissionDenied: 'Você não tem permissão para esta ação',
    cartEmpty: 'Seu carrinho está vazio',
    invalidPayment: 'Dados de pagamento inválidos',
  },
  
  // Order status labels
  orderStatus: {
    pending: 'Pendente',
    confirmed: 'Confirmado',
    processing: 'Em Processamento',
    shipped: 'Enviado',
    delivered: 'Entregue',
    cancelled: 'Cancelado',
  },
  
  // Navigation labels
  navigation: {
    home: 'Início',
    shop: 'Loja & Serviços',
    cart: 'Carrinho',
    account: 'Minha Conta',
    login: 'Login',
    signup: 'Cadastrar',
    logout: 'Sair',
    admin: 'Área Administrativa',
  },
  
  // Footer links
  footer: {
    deliveryPolicy: 'Política de Entrega',
    calculator: 'Calculadora de Materiais',
    careers: 'Trabalhe Conosco',
    about: 'Sobre',
    privacy: 'Privacidade',
    terms: 'Termos de Uso',
  },
  
  // Form labels
  form: {
    fullName: 'Nome Completo',
    email: 'Email',
    password: 'Senha',
    confirmPassword: 'Confirmar Senha',
    phone: 'Telefone',
    address: 'Endereço',
    city: 'Cidade',
    zipCode: 'CEP',
    state: 'Estado',
    country: 'País',
    cpfCnpj: 'CPF/CNPJ',
    paymentMethod: 'Método de Pagamento',
  },
  
  // Button labels
  buttons: {
    submit: 'Enviar',
    cancel: 'Cancelar',
    save: 'Salvar',
    edit: 'Editar',
    delete: 'Deletar',
    confirm: 'Confirmar',
    close: 'Fechar',
    next: 'Próximo',
    back: 'Voltar',
    checkout: 'Ir para Pagamento',
    continue: 'Continuar',
    login: 'Login',
    signup: 'Cadastrar',
    logout: 'Sair',
    addToCart: 'Adicionar ao Carrinho',
    viewCatalog: 'Ver Catálogo',
    viewDetails: 'Ver Detalhes',
    continueShopping: 'Continuar Comprando',
    proceedToPayment: 'Ir para Pagamento',
    clearFilter: 'Limpar filtro',
    clearAllFilters: 'Limpar todos os filtros',
    viewAll: 'Ver Todos',
    saveCart: 'Salvar Carrinho',
    startShopping: 'Começar a Comprar',
    loginToCheckout: 'Fazer Login para Finalizar Compra',
  },
  
  // Cart messages
  cart: {
    empty: 'Seu carrinho está vazio',
    emptySuggestion: 'Parece que você ainda não escolheu nenhum item. Visite nosso catálogo para começar!',
    summary: 'Resumo do Pedido',
    subtotal: 'Subtotal',
    shipping: 'Frete (Estimado)',
    shippingCost: 'R$ 50,00',
    total: 'Total',
    estimatedTotal: 'Total Estimado',
    reviewItems: 'Revisar Itens',
    saveCart: 'Salvar Carrinho',
    steps: {
      cart: 'Carrinho',
      checkout: 'Identificação & Pagamento',
      confirmation: 'Conclusão',
    },
  },
  
  // Product related
  products: {
    price: 'Preço',
    quantity: 'Quantidade',
    description: 'Descrição',
    features: 'Características',
    inStock: 'Em Estoque',
    outOfStock: 'Fora de Estoque',
    meterSquare: '/m²',
    visit: '/visita',
  },
  
  // Benefits/Features
  benefits: {
    fastDelivery: 'Entrega Rápida',
    fastDeliveryDesc: 'Levamos os materiais até você com rapidez e segurança, garantindo entrega no prazo combinado.',
    installation: 'Instalação Profissional',
    installationDesc: 'Contrate nossos pedreiros especializados para realizar a instalação profissional de seus materiais.',
    quality: 'Qualidade Garantida',
    qualityDesc: 'Pedras cuidadosamente selecionadas, garantindo durabilidade e beleza para seu projeto.',
    professionalInstallation: 'Instalação Profissional',
    qualityGuarantee: 'Qualidade Garantida',
  },
  
  // Home page messages
  home: {
    heroTitle: 'Transforme seu Jardim em um Paraíso',
    heroSubtitle: 'Encontre as melhores pedras ornamentais, pavers e serviços de jardinagem para transformar seu espaço em um ambiente único e aconchegante.',
    featuredProducts: 'Destaques da Semana',
    featuredProductsDesc: 'Os itens mais procurados para renovar seu espaço.',
  },
  
  // Shop page messages
  shop: {
    title: 'Catálogo Completo',
    description: 'Encontre tudo o que você precisa para transformar seu espaço em um ambiente único e aconchegante.',
    categories: 'Categorias',
    filterByFeature: 'Filtrar por característica',
    showing: 'Mostrando',
    products: 'produtos',
    noProducts: 'Nenhum produto encontrado com esses filtros.',
  },
  
  // Login page messages
  login: {
    employeeArea: 'Área de Funcionários',
    employeeAccessText: 'Faça login para acessar o painel administrativo',
    customerLogin: 'Entrar como Cliente',
    customerLoginText: 'Acesse sua conta para ver pedidos e gerenciar carrinho',
    authError: 'Erro de Autenticação',
    authFailedText: 'Falha no login. Verifique suas credenciais.',
    confirmedEmailError: 'Confirme seu email para continuar. Caso precise reenviar o email de confirmação, entre em contato conosco.',
    entering: 'Entrando...',
    submit: 'Entrar',
    backHome: '← Voltar para a página inicial',
    onlyEmployees: 'Apenas funcionários autorizados podem acessar esta área.',
    accountsCreatedByAdmin: 'Contas são criadas por administradores.',
  },
  
  // Register page messages
  register: {
    createAccount: 'Criar Conta',
    joinUs: 'Junte-se a nós e comece a comprar',
    fullName: 'Nome Completo',
    creating: 'Criando conta...',
    alreadyHaveAccount: 'Já tem uma conta?',
    loginHere: 'Faça login aqui',
  },
  
  // Profile page messages
  profile: {
    myProfile: 'Meu Perfil',
    myOrders: 'Meus Pedidos',
    noOrders: 'Você ainda não fez nenhum pedido',
    startShopping: 'Começar a Comprar',
    userData: 'Dados do Usuário',
    editProfile: 'Editar Perfil',
  },
  
  // Assistant/Chat
  assistant: {
    initialMessage: 'Olá! Sou seu assistente de jardinagem virtual. Posso ajudar a calcular a quantidade de pedras ou sugerir o melhor material para seu projeto?',
    thinking: 'Pensando...',
    sendMessage: 'Enviar mensagem',
    clearHistory: 'Limpar histórico',
  },
  
  // CSV Export headers
  csvHeaders: {
    orderId: 'ID do Pedido',
    date: 'Data',
    customerName: 'Cliente',
    email: 'Email',
    phone: 'Telefone',
    total: 'Total',
    status: 'Status',
    itemCount: 'Quantidade de Itens',
  },
} as const;

// ============================================================================
// 📦 PRODUCT CATEGORIES
// ============================================================================

export const PRODUCT_CATEGORIES = {
  STONES: 'Pedras',
  PAVERS: 'Pavers',
  SERVICES: 'Serviços de Jardinagem',
  TOOLS: 'Ferramentas',
  LANDSCAPING: 'Paisagismo',
} as const;

// ============================================================================
// 🏷️ PRODUCT TAGS
// ============================================================================

export const PRODUCT_TAGS = {
  YELLOW: 'Amarela',
  RUSTIC: 'Rústica',
  THERMAL: 'Térmica',
  SCRAPS: 'Cacos',
  INTERLOCKING: 'Intertravado',
  SERRATED: 'Serrada',
  COMPLETE: 'Completa',
} as const;

// ============================================================================
// 💳 PAYMENT METHODS
// ============================================================================

export const PAYMENT_METHODS = {
  CREDIT_CARD: 'Cartão de Crédito',
  DEBIT_CARD: 'Cartão de Débito',
  PIX: 'PIX',
  TRANSFER: 'Transferência Bancária',
  CASH_ON_DELIVERY: 'Débito na Entrega',
} as const;

// ============================================================================
// 🚚 SHIPPING CONFIGURATION
// ============================================================================

export const SHIPPING = {
  // Base shipping cost
  baseCost: 50.00,
  baseCurrency: 'BRL',
  
  // Shipping zones (if needed for future expansion)
  freeShippingThreshold: 500.00, // Free shipping for orders above this amount
  
  // Estimated delivery times
  deliveryTimes: {
    standard: '5-7 dias úteis',
    express: '2-3 dias úteis',
    sameDay: 'Mesmo dia (São Paulo)',
  },
} as const;

// ============================================================================
// 📋 DELIVERY ADDRESS LABELS
// ============================================================================

export const ADDRESS_LABELS = {
  HOME: 'Casa',
  WORK: 'Trabalho',
  PROPERTY: 'Sítio',
  COMMERCIAL: 'Comercial',
  OTHER: 'Outro',
} as const;

// ============================================================================
// 🎯 FEATURE FLAGS
// ============================================================================

export const FEATURES = {
  // Enable/disable features
  ENABLE_CART: true,
  ENABLE_CHECKOUT: true,
  ENABLE_ORDERS: true,
  ENABLE_BUDGETS: true,
  ENABLE_CHAT_ASSISTANT: true,
  ENABLE_PRODUCT_CALCULATOR: true,
  ENABLE_USER_REVIEWS: false,
  ENABLE_WISHLIST: false,
  ENABLE_REFERRAL: false,
  
  // Authentication
  REQUIRE_EMAIL_CONFIRMATION: true,
  ENABLE_SOCIAL_LOGIN: false,
  ENABLE_TWO_FACTOR: false,
  
  // Admin/Employee features
  ENABLE_BUDGET_MANAGEMENT: true,
  ENABLE_INVENTORY: true,
  ENABLE_EMPLOYEE_DASHBOARD: true,
  
  // Storage/Upload
  ENABLE_IMAGE_UPLOAD: true,
  MAX_IMAGE_SIZE_MB: 5,
  ALLOWED_IMAGE_TYPES: ['jpg', 'jpeg', 'png', 'webp'],
} as const;

// ============================================================================
// 📱 UI/UX CONFIGURATION
// ============================================================================

export const UI = {
  // Animation speeds
  transitionSpeed: '300ms',
  
  // Default pagination
  itemsPerPage: 12,
  itemsPerPageSmall: 6,
  
  // Modal/Dialog
  modalBackdropBlur: 'medium',
  
  // Toast/Notification
  notificationDuration: 3000, // milliseconds
  
  // Sidebar
  sidebarWidth: '240px',
  sidebarCollapsedWidth: '60px',
  
  // Navigation
  navbarHeight: '64px',
  footerHeight: 'auto',
} as const;

// ============================================================================
// 🔐 SECURITY & VALIDATION
// ============================================================================

export const VALIDATION = {
  // Password requirements
  password: {
    minLength: 8,
    requireUppercase: true,
    requireLowercase: true,
    requireNumbers: true,
    requireSpecialChars: true,
    pattern: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/,
  },
  
  // Email validation
  email: {
    pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  },
  
  // Phone validation (Brazilian format)
  phone: {
    pattern: /^(\d{2})\s(\d{4,5})-(\d{4})$/,
    length: 11, // without formatting
  },
  
  // CPF/CNPJ validation
  cpfCnpj: {
    cpfLength: 11,
    cnpjLength: 14,
  },
  
  // Name validation
  name: {
    minLength: 3,
    maxLength: 100,
  },
} as const;

// ============================================================================
// 🌐 API & EXTERNAL SERVICES CONFIGURATION
// ============================================================================

export const EXTERNAL_SERVICES = {
  // Supabase
  supabase: {
    url: process.env.VITE_SUPABASE_URL || '',
    anonKey: process.env.VITE_SUPABASE_ANON_KEY || '',
  },
  
  // MinIO (File storage)
  minio: {
    endpoint: process.env.VITE_MINIO_ENDPOINT || 'localhost:9000',
    accessKey: process.env.VITE_MINIO_ACCESS_KEY || '',
    secretKey: process.env.VITE_MINIO_SECRET_KEY || '',
    useSSL: process.env.VITE_MINIO_USE_SSL === 'true',
    bucket: process.env.VITE_MINIO_BUCKET || 'ecojardim-products',
  },
  
  // Gemini AI
  gemini: {
    apiKey: process.env.VITE_GEMINI_API_KEY || '',
  },
} as const;

// ============================================================================
// 📊 ANALYTICS & LOGGING CONFIGURATION
// ============================================================================

export const ANALYTICS = {
  // Enable/disable analytics
  enabled: true,
  
  // Log levels
  logLevel: 'info', // 'debug', 'info', 'warn', 'error'
  
  // Events to track
  trackingEvents: {
    pageView: true,
    userLogin: true,
    cartUpdate: true,
    checkout: true,
    error: true,
  },
} as const;

// ============================================================================
// 🔄 DEFAULT VALUES & CONSTANTS
// ============================================================================

export const DEFAULTS = {
  // Default user role
  defaultUserRole: 'customer',
  
  // Default product quantity
  defaultQuantity: 1,
  
  // Default delivery address
  defaultDeliveryAddress: ADDRESS_LABELS.HOME,
  
  // Default payment method
  defaultPaymentMethod: PAYMENT_METHODS.CREDIT_CARD,
  
  // Pagination
  defaultPage: 1,
  defaultLimit: 20,
  
  // Sort
  defaultSortBy: 'name',
  defaultSortOrder: 'asc',
} as const;

// ============================================================================
// 📌 EXPORT ALL CONFIGURATIONS
// ============================================================================

export const CONFIG = {
  BRAND,
  COLORS,
  TYPOGRAPHY,
  CONTACT,
  LOCALE,
  EMAIL,
  MESSAGES,
  PRODUCT_CATEGORIES,
  PRODUCT_TAGS,
  PAYMENT_METHODS,
  SHIPPING,
  ADDRESS_LABELS,
  FEATURES,
  UI,
  VALIDATION,
  EXTERNAL_SERVICES,
  ANALYTICS,
  DEFAULTS,
} as const;

export default CONFIG;
