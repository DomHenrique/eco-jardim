
export enum ProductCategory {
  STONES = 'Pedras Ornamentais',
  PAVERS = 'Bloquetes e Pavers',
  GARDEN_CARE = 'Cuidados e Limpeza',
  SERVICES = 'Serviços e Mão de Obra'
}

export enum ImageStorageType {
  MINIO = 'minio',
  EXTERNAL = 'external',
  PLACEHOLDER = 'placeholder'
}

export interface Product {
  id: string;
  name: string;
  description: string;
  usage: string; // "Descrição de usos"
  measurements: string; // "Medidas"
  price: number;
  category: ProductCategory;
  imageUrl: string;
  unit: string; // e.g., "m²", "kg", "unidade", "hora"
  tags?: string[]; // New field for colors and specific types
  imageStorageType?: ImageStorageType; // Track image source
  created_at?: string;
  updated_at?: string;
}

export interface CartItem extends Product {
  quantity: number;
}

export interface UserInfo {
  name: string;
  email: string;
  phone?: string;
  address: string;
  city: string;
  zip: string;
  paymentMethod: 'credit' | 'debit' | 'pix';
}

// Database User type
export interface User {
  id: string;
  name: string;
  email: string;
  phone?: string;
  address?: string;
  city?: string;
  zip?: string;
  created_at?: string;
  updated_at?: string;
}

// Service type for professional services
export interface Service {
  id: string;
  name: string;
  description: string;
  price: number;
  unit: string; // e.g., "hora", "m²", "projeto"
  category: string;
  imageUrl?: string;
  imageStorageType?: ImageStorageType; // Track image source
  created_at?: string;
  updated_at?: string;
}

export enum OrderStatus {
  PENDING = 'pending',           // Initial state - awaiting review
  QUOTATION = 'quotation',       // Requested quotation/estimate
  QUOTED = 'quoted',             // Quotation provided to customer
  CONFIRMED = 'confirmed',       // Order confirmed by customer
  PROCESSING = 'processing',     // Processing/production phase
  READY = 'ready',               // Ready for delivery/pickup
  SHIPPED = 'shipped',           // Shipped to customer
  DELIVERED = 'delivered',       // Delivered to customer
  CANCELLED = 'cancelled',       // Cancelled
  REJECTED = 'rejected'          // Quotation rejected
}

export enum BudgetStatus {
  DRAFT = 'draft',
  SENT = 'sent',
  ACCEPTED = 'accepted',
  REJECTED = 'rejected',
  EXPIRED = 'expired'
}

// Budget/Estimate type
export interface Budget {
  id: string;
  order_id?: string;             // Associated order if budget was converted
  customer_id: string;
  items: CartItem[];
  subtotal: number;
  tax?: number;
  total: number;
  status: BudgetStatus;
  valid_until: string;           // Expiration date
  notes?: string;
  created_at?: string;
  updated_at?: string;
  created_by: string;            // Employee ID who created the budget
}

// Enhanced order with budget reference
export interface Order {
  id: string;
  user_id: string;
  items: CartItem[];
  total: number;
  userInfo: UserInfo;
  status: OrderStatus;
  date: string;
  budget_id?: string;            // Reference to budget if order originated from budget
  payment_status?: 'pending' | 'paid' | 'failed' | 'refunded';
  payment_method?: 'credit' | 'debit' | 'pix' | 'boleto' | 'cash';
  delivery_address?: string;
  delivery_date?: string;
  notes?: string;
  created_at?: string;
  updated_at?: string;
}

// Upload Progress tracking
export interface UploadProgress {
  status: 'idle' | 'uploading' | 'success' | 'error';
  progress: number; // 0-100
  error?: string;
}

// API Response types
export interface ApiResponse<T> {
  data?: T;
  error?: string;
  success: boolean;
}
