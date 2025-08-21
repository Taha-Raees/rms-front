'use client';

import React, { createContext, useContext, useReducer, ReactNode, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';

// Interfaces matching the backend Prisma schema
interface Product {
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
  variants?: ProductVariant[];
  createdAt: Date;
  updatedAt: Date;
}

interface ProductVariant {
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

interface Order {
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

interface OrderItem {
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

interface Store {
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

interface AppState {
  store: Store | null;
  products: Product[];
  orders: Order[];
  currentOrder: Order | null;
  isLoading: boolean;
  error: string | null;
  sidebarCollapsed: boolean;
}

type AppAction =
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string | null }
  | { type: 'SET_PRODUCTS'; payload: Product[] }
  | { type: 'ADD_PRODUCT'; payload: Product }
  | { type: 'UPDATE_PRODUCT'; payload: Product }
  | { type: 'DELETE_PRODUCT'; payload: string }
  | { type: 'SET_ORDERS'; payload: Order[] }
  | { type: 'ADD_ORDER'; payload: Order }
  | { type: 'UPDATE_ORDER'; payload: Order }
  | { type: 'SET_CURRENT_ORDER'; payload: Order | null }
  | { type: 'TOGGLE_SIDEBAR' }
  | { type: 'UPDATE_STOCK'; payload: { productId: string; newStock: number } }
  | { type: 'UPDATE_STORE'; payload: Store };

const initialState: AppState = {
  store: null,
  products: [],
  orders: [],
  currentOrder: null,
  isLoading: false,
  error: null,
  sidebarCollapsed: false,
};

function appReducer(state: AppState, action: AppAction): AppState {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, isLoading: action.payload };
    case 'SET_ERROR':
      return { ...state, error: action.payload };
    case 'SET_PRODUCTS':
      return { ...state, products: action.payload };
    case 'ADD_PRODUCT':
      return { ...state, products: [...state.products, action.payload] };
    case 'UPDATE_PRODUCT':
      return {
        ...state,
        products: state.products.map(p => 
          p.id === action.payload.id ? action.payload : p
        ),
      };
    case 'DELETE_PRODUCT':
      return {
        ...state,
        products: state.products.filter(p => p.id !== action.payload),
      };
    case 'SET_ORDERS':
      return { ...state, orders: action.payload };
    case 'ADD_ORDER':
      return { ...state, orders: [...state.orders, action.payload] };
    case 'UPDATE_ORDER':
      return {
        ...state,
        orders: state.orders.map(o => 
          o.id === action.payload.id ? action.payload : o
        ),
      };
    case 'SET_CURRENT_ORDER':
      return { ...state, currentOrder: action.payload };
    case 'TOGGLE_SIDEBAR':
      return { ...state, sidebarCollapsed: !state.sidebarCollapsed };
    case 'UPDATE_STOCK':
      return {
        ...state,
        products: state.products.map(p =>
          p.id === action.payload.productId
            ? { ...p, stock: action.payload.newStock }
            : p
        ),
      };
    case 'UPDATE_STORE':
      return { ...state, store: action.payload };
    default:
      return state;
  }
}

interface AppContextType {
  state: AppState;
  dispatch: React.Dispatch<AppAction>;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: ReactNode }) {
  const { state: authState } = useAuth();
  const [state, dispatch] = useReducer(appReducer, initialState);

  // Update store when auth state changes
  useEffect(() => {
    if (authState.store) {
      // Assuming authState.store is of type Store
      dispatch({ type: 'UPDATE_STORE', payload: authState.store });
    }
  }, [authState.store]);

  return (
    <AppContext.Provider value={{ state, dispatch }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
}
