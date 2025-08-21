// Centralized type definitions for the retail management system
// These types are shared between frontend and backend

export interface Product {
  id: string;
  name: string;
  description: string;
  brand: string;
  category: string;
  basePrice: number;
  unit: string;
  type: 'prepackaged' | 'loose_weight';
  stock: number;
  lowStockThreshold: number;
  isActive: boolean;
  imageUrl?: string;
  barcode?: string;
  variants?: ProductVariant[];
  createdAt: Date;
  updatedAt: Date;
}

export interface ProductVariant {
  id: string;
  productId: string;
  name: string;
  description?: string;
  price: number;
  stock: number;
  weight?: number;
  weightUnit?: string;
  sku: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface Order {
  id: string;
  orderNumber: string;
  customerId?: string;
  customerName?: string;
  items: OrderItem[];
  subtotal: number;
  tax: number;
  total: number;
  taxRate: number;
  status: 'pending' | 'confirmed' | 'processing' | 'completed' | 'cancelled';
  paymentMethod: 'cash' | 'card' | 'jazzcash' | 'easypaisa';
  paymentStatus: 'pending' | 'paid' | 'failed' | 'refunded';
  change?: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface OrderItem {
  id: string;
  orderId: string;
  productId: string;
  product: Product;
  variantId?: string;
  variant?: ProductVariant;
  quantity: number;
  weight?: number;
  unitPrice: number;
  totalPrice: number;
}

export interface Store {
  id: string;
  name: string;
  businessType: string;
  address: {
    street: string;
    city: string;
    state: string;
    postalCode: string;
    country: string;
  };
  contact: {
    phone: string;
    email: string;
    website?: string;
  };
  owner: {
    name: string;
    email: string;
    phone: string;
  };
  currency: string;
  currencySymbol: string;
  taxRate: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  settings: {
    lowStockAlerts: boolean;
    autoReorder: boolean;
    discountEnabled: boolean;
    multiplePaymentMethods: boolean;
    receiptPrinting: boolean;
    barcodeScanning: boolean;
  };
  subscription: {
    plan: string;
    status: string;
    expiresAt: Date;
  };
}

export interface User {
  id: string;
  email: string;
  password: string;
  storeId: string;
  role: 'owner' | 'manager' | 'cashier';
  isActive: boolean;
  createdAt: Date;
  lastLogin?: Date;
}

export interface AdminUser {
  id: string;
  email: string;
  password: string;
  role: 'admin';
  isActive: boolean;
  createdAt: Date;
  lastLogin?: Date;
}

// API Response Types
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface AuthResponse {
  user: {
    id: string;
    email: string;
    role: string;
    storeId: string;
  };
  store: Store;
  message: string;
}
