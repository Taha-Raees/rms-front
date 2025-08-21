// Centralized API utility functions for the retail management system
// All API calls to the separate Fastify backend running on port 3001

import { 
  Product, 
  ProductVariant, 
  Order, 
  OrderItem, 
  Store, 
  User, 
  AdminUser, 
  ApiResponse,
  AuthResponse 
} from './types';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3001';

// Helper function to handle API responses
async function handleResponse<T>(response: Response): Promise<T> {
  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.error || 'API request failed');
  }
  return data;
}

// Type guard for API responses
function isApiResponse<T>(data: any): data is ApiResponse<T> {
  return typeof data === 'object' && data !== null && 'success' in data;
}

// Auth API
export const authApi = {
  login: async (email: string, password: string) => {
    const response = await fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify({ email, password }),
    });
    return handleResponse<ApiResponse<AuthResponse>>(response);
  },

  logout: async () => {
    const response = await fetch(`${API_BASE_URL}/auth/logout`, {
      method: 'POST',
      credentials: 'include',
    });
    return handleResponse<ApiResponse>(response);
  },

  getMe: async () => {
    const response = await fetch(`${API_BASE_URL}/auth/me`, {
      credentials: 'include',
    });
    return handleResponse<ApiResponse<User>>(response);
  },
};

// Products API
export const productsApi = {
  getAll: async () => {
    const response = await fetch(`${API_BASE_URL}/products`, {
      credentials: 'include',
    });
    return handleResponse<ApiResponse<Product[]>>(response);
  },

  getById: async (id: string) => {
    const response = await fetch(`${API_BASE_URL}/products/${id}`, {
      credentials: 'include',
    });
    return handleResponse<ApiResponse<Product>>(response);
  },

  create: async (product: Omit<Product, 'id' | 'createdAt' | 'updatedAt'>) => {
    const response = await fetch(`${API_BASE_URL}/products`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify(product),
    });
    return handleResponse<ApiResponse<Product>>(response);
  },

  update: async (id: string, product: Partial<Product>) => {
    const response = await fetch(`${API_BASE_URL}/products/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify(product),
    });
    return handleResponse<ApiResponse<Product>>(response);
  },

  delete: async (id: string) => {
    const response = await fetch(`${API_BASE_URL}/products/${id}`, {
      method: 'DELETE',
      credentials: 'include',
    });
    return handleResponse<ApiResponse>(response);
  },
};

// Orders API
export const ordersApi = {
  getAll: async (storeId?: string) => {
    const url = new URL(`${API_BASE_URL}/orders`);
    if (storeId) {
      url.searchParams.append('storeId', storeId);
    }
    const response = await fetch(url.toString(), {
      credentials: 'include',
    });
    return handleResponse<ApiResponse<Order[]>>(response);
  },

  getById: async (id: string) => {
    const response = await fetch(`${API_BASE_URL}/orders/${id}`, {
      credentials: 'include',
    });
    return handleResponse<ApiResponse<Order>>(response);
  },

  create: async (order: Omit<Order, 'id' | 'orderNumber' | 'createdAt' | 'updatedAt'>) => {
    const response = await fetch(`${API_BASE_URL}/orders`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify(order),
    });
    return handleResponse<ApiResponse<Order>>(response);
  },
};

// Inventory API
export const inventoryApi = {
  getStock: async () => {
    const response = await fetch(`${API_BASE_URL}/inventory/stock`, {
      credentials: 'include',
    });
    return handleResponse<ApiResponse<Product[]>>(response);
  },

  getAlerts: async () => {
    const response = await fetch(`${API_BASE_URL}/inventory/alerts`, {
      credentials: 'include',
    });
    return handleResponse<ApiResponse<Product[]>>(response);
  },

  updateStock: async (productId: string, newStock: number) => {
    const response = await fetch(`${API_BASE_URL}/inventory/stock/${productId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify({ stock: newStock }),
    });
    return handleResponse<ApiResponse<Product>>(response);
  },
};

// Analytics API
export const analyticsApi = {
  getDashboardData: async (storeId?: string) => {
    const url = new URL(`${API_BASE_URL}/analytics/dashboard`);
    if (storeId) {
      url.searchParams.append('storeId', storeId);
    }
    const response = await fetch(url.toString(), {
      credentials: 'include',
    });
    return handleResponse<ApiResponse<any>>(response);
  },
};

// Admin API
export const adminApi = {
  createStore: async (storeData: any) => {
    const response = await fetch(`${API_BASE_URL}/admin/create-store`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify(storeData),
    });
    return handleResponse<ApiResponse<any>>(response);
  },
  
  getDashboardData: async () => {
    const response = await fetch(`${API_BASE_URL}/admin/analytics/dashboard`, {
      credentials: 'include',
    });
    return handleResponse<ApiResponse<any>>(response);
  },
  
  getUsers: async () => {
    const response = await fetch(`${API_BASE_URL}/admin/users`, {
      credentials: 'include',
    });
    return handleResponse<ApiResponse<any>>(response);
  },
  
  getStores: async () => {
    const response = await fetch(`${API_BASE_URL}/admin/create-store`, {
      credentials: 'include',
    });
    return handleResponse<ApiResponse<any>>(response);
  },
  
  getSubscriptionPackages: async () => {
    const response = await fetch(`${API_BASE_URL}/admin/subscription-packages`, {
      credentials: 'include',
    });
    return handleResponse<ApiResponse<any>>(response);
  },
};

// Type exports for convenience
export type { 
  Product, 
  ProductVariant, 
  Order, 
  OrderItem, 
  Store, 
  User, 
  AdminUser, 
  ApiResponse,
  AuthResponse 
};
