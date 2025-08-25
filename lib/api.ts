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

// Global variable to track if we're currently refreshing tokens
let isRefreshing = false;
let failedQueue: Array<{
  resolve: (value: Response | PromiseLike<Response>) => void;
  reject: (reason?: any) => void;
}> = [];

const processQueue = (error: any, token: string | null = null) => {
  failedQueue.forEach(({ resolve, reject }) => {
    if (error) {
      reject(error);
    } else {
      resolve(new Response(JSON.stringify({ success: true }), { 
        status: 200, 
        headers: { 'Content-Type': 'application/json' }
      }));
    }
  });
  
  failedQueue = [];
};

// Helper function to handle API responses
async function handleResponse<T>(response: Response): Promise<T> {
  const data = await response.json();
  if (!response.ok) {
    console.error('API Error:', data.error || 'API request failed', 'Status:', response.status, 'Headers:', Object.fromEntries(response.headers.entries()));
    throw new Error(data.error || 'API request failed');
  }
  return data;
}

// Enhanced fetch wrapper with automatic token refresh
async function apiFetch(input: RequestInfo | URL, init?: RequestInit): Promise<Response> {
  const url = input.toString();
  const options = {
    credentials: 'include' as const,
    ...init,
    headers: {
      'Content-Type': 'application/json',
      ...init?.headers,
    },
  };

  let response = await fetch(url, options);

  // If we get a 401, try to refresh the token
  if (response.status === 401) {
    if (isRefreshing) {
      // If we're already refreshing, queue this request
      return new Promise((resolve, reject) => {
        failedQueue.push({ resolve, reject });
      });
    }

    isRefreshing = true;

    try {
      // Determine if this is an admin endpoint or store endpoint
      const isAdminEndpoint = url.includes('/auth/admin-login');
      const refreshEndpoint = isAdminEndpoint 
        ? `${API_BASE_URL}/auth/admin-login/refresh`
        : `${API_BASE_URL}/auth/refresh`;

      const refreshResponse = await fetch(refreshEndpoint, {
        method: 'POST',
        credentials: 'include',
      });

      if (refreshResponse.ok) {
        // Retry the original request
        response = await fetch(url, options);
        processQueue(null, 'refreshed');
      } else {
        // Refresh failed, clear the queue with error
        processQueue(new Error('Token refresh failed'));
        // Redirect to login
        if (typeof window !== 'undefined') {
          window.location.href = isAdminEndpoint ? '/admin-login' : '/login';
        }
      }
    } catch (error) {
      processQueue(error);
      if (typeof window !== 'undefined') {
        window.location.href = url.includes('/auth/admin-login') ? '/admin-login' : '/login';
      }
    } finally {
      isRefreshing = false;
    }
  }

  return response;
}

// Type guard for API responses
function isApiResponse<T>(data: any): data is ApiResponse<T> {
  return typeof data === 'object' && data !== null && 'success' in data;
}

// Auth API
export const authApi = {
  login: async (email: string, password: string) => {
    const response = await apiFetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, password }),
    });
    return handleResponse<ApiResponse<AuthResponse>>(response);
  },

  logout: async () => {
    const response = await apiFetch(`${API_BASE_URL}/auth/logout`, {
      method: 'POST',
    });
    return handleResponse<ApiResponse>(response);
  },

  getMe: async () => {
    const response = await apiFetch(`${API_BASE_URL}/auth/me`);
    return handleResponse<ApiResponse<User>>(response);
  },

  refresh: async () => {
    const response = await apiFetch(`${API_BASE_URL}/auth/refresh`, {
      method: 'POST',
    });
    return handleResponse<ApiResponse>(response);
  },
};

// Products API
export const productsApi = {
  getAll: async () => {
    const response = await apiFetch(`${API_BASE_URL}/products`);
    return handleResponse<ApiResponse<Product[]>>(response);
  },

  getById: async (id: string) => {
    const response = await apiFetch(`${API_BASE_URL}/products/${id}`);
    return handleResponse<ApiResponse<Product>>(response);
  },

  create: async (product: Omit<Product, 'id' | 'createdAt' | 'updatedAt'>) => {
    const response = await apiFetch(`${API_BASE_URL}/products`, {
      method: 'POST',
      body: JSON.stringify(product),
    });
    return handleResponse<ApiResponse<Product>>(response);
  },

  update: async (id: string, product: Partial<Product>) => {
    const response = await apiFetch(`${API_BASE_URL}/products/${id}`, {
      method: 'PUT',
      body: JSON.stringify(product),
    });
    return handleResponse<ApiResponse<Product>>(response);
  },

  delete: async (id: string) => {
    const response = await apiFetch(`${API_BASE_URL}/products/${id}`, {
      method: 'DELETE',
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
    const response = await apiFetch(url.toString());
    return handleResponse<ApiResponse<Order[]>>(response);
  },

  getById: async (id: string) => {
    const response = await apiFetch(`${API_BASE_URL}/orders/${id}`);
    return handleResponse<ApiResponse<Order>>(response);
  },

  create: async (order: Omit<Order, 'id' | 'orderNumber' | 'createdAt' | 'updatedAt'>) => {
    const response = await apiFetch(`${API_BASE_URL}/orders`, {
      method: 'POST',
      body: JSON.stringify(order),
    });
    return handleResponse<ApiResponse<Order>>(response);
  },
};

// Inventory API
export const inventoryApi = {
  getStock: async () => {
    const response = await apiFetch(`${API_BASE_URL}/inventory/stock`);
    return handleResponse<ApiResponse<Product[]>>(response);
  },

  getAlerts: async () => {
    const response = await apiFetch(`${API_BASE_URL}/inventory/alerts`);
    return handleResponse<ApiResponse<Product[]>>(response);
  },

  updateStock: async (productId: string, newStock: number) => {
    const response = await apiFetch(`${API_BASE_URL}/inventory/stock/${productId}`, {
      method: 'PUT',
      body: JSON.stringify({ stock: newStock }),
    });
    return handleResponse<ApiResponse<Product>>(response);
  },

  // Stock adjustment APIs
  getStockMovements: async (productId?: string, variantId?: string, limit: number = 50) => {
    const url = new URL(`${API_BASE_URL}/inventory/stock/adjustments`);
    if (productId) url.searchParams.append('productId', productId);
    if (variantId) url.searchParams.append('variantId', variantId);
    url.searchParams.append('limit', limit.toString());
    
    const response = await apiFetch(url.toString());
    return handleResponse<ApiResponse<any[]>>(response);
  },

  createStockAdjustment: async (adjustment: {
    productId: string;
    variantId?: string;
    quantityChange: number;
    reason: string;
    notes?: string;
  }) => {
    const response = await apiFetch(`${API_BASE_URL}/inventory/stock/adjustments`, {
      method: 'POST',
      body: JSON.stringify(adjustment),
    });
    return handleResponse<ApiResponse>(response);
  },

  getStockReservations: async (status?: string, orderId?: string) => {
    const url = new URL(`${API_BASE_URL}/inventory/stock/reservations`);
    if (status) url.searchParams.append('status', status);
    if (orderId) url.searchParams.append('orderId', orderId);
    
    const response = await apiFetch(url.toString());
    return handleResponse<ApiResponse<any[]>>(response);
  },

  cleanupExpiredReservations: async () => {
    const response = await apiFetch(`${API_BASE_URL}/inventory/stock/reservations/cleanup`, {
      method: 'POST',
    });
    return handleResponse<ApiResponse>(response);
  },

  // Stock transfer API
  transferStock: async (transfer: {
    fromProductId: string;
    fromVariantId?: string;
    toProductId: string;
    toVariantId?: string;
    quantity: number;
    notes?: string;
  }) => {
    const response = await apiFetch(`${API_BASE_URL}/inventory/stock/transfer`, {
      method: 'POST',
      body: JSON.stringify(transfer),
    });
    return handleResponse<ApiResponse>(response);
  },
};

// Audit API
export const auditApi = {
  getLogs: async (params?: {
    limit?: number;
    offset?: number;
    entityType?: string;
    action?: string;
    userId?: string;
  }) => {
    const url = new URL(`${API_BASE_URL}/audit/logs`);
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined) {
          url.searchParams.append(key, value.toString());
        }
      });
    }
    
    const response = await apiFetch(url.toString());
    return handleResponse<ApiResponse<any[]>>(response);
  },

  getEntityLogs: async (entityType: string, entityId: string, limit?: number) => {
    const url = new URL(`${API_BASE_URL}/audit/logs/${entityType}/${entityId}`);
    if (limit) url.searchParams.append('limit', limit.toString());
    
    const response = await apiFetch(url.toString());
    return handleResponse<ApiResponse<any[]>>(response);
  },

  getUsers: async () => {
    const response = await apiFetch(`${API_BASE_URL}/audit/users`);
    return handleResponse<ApiResponse<any[]>>(response);
  },

  getEntityTypes: async () => {
    const response = await apiFetch(`${API_BASE_URL}/audit/entity-types`);
    return handleResponse<ApiResponse<any[]>>(response);
  },

  getActions: async () => {
    const response = await apiFetch(`${API_BASE_URL}/audit/actions`);
    return handleResponse<ApiResponse<any[]>>(response);
  },

  exportLogs: async (params: {
    format?: 'csv' | 'json';
    entityType?: string;
    action?: string;
    userId?: string;
    startDate?: string;
    endDate?: string;
  }) => {
    const response = await apiFetch(`${API_BASE_URL}/audit/export`, {
      method: 'POST',
      body: JSON.stringify(params),
    });
    return response;
  },
};

// Analytics API
export const analyticsApi = {
  getDashboardData: async () => {
    const response = await apiFetch(`${API_BASE_URL}/analytics/dashboard`);
    return handleResponse<ApiResponse<any>>(response);
  },
};

// Admin API
export const adminApi = {
  createStore: async (storeData: any) => {
    const response = await apiFetch(`${API_BASE_URL}/admin/create-store`, {
      method: 'POST',
      body: JSON.stringify(storeData),
    });
    return handleResponse<ApiResponse<any>>(response);
  },
  
  getDashboardData: async () => {
    const response = await apiFetch(`${API_BASE_URL}/admin/analytics/dashboard`);
    return handleResponse<ApiResponse<any>>(response);
  },
  
  getUsers: async () => {
    const response = await apiFetch(`${API_BASE_URL}/admin/users`);
    return handleResponse<ApiResponse<any>>(response);
  },
  
  getStores: async () => {
    const response = await apiFetch(`${API_BASE_URL}/admin/create-store`);
    return handleResponse<ApiResponse<any>>(response);
  },
  
  getSubscriptionPackages: async () => {
    const response = await apiFetch(`${API_BASE_URL}/admin/subscription-packages`);
    return handleResponse<ApiResponse<any>>(response);
  },

  // Constraint visualization APIs
  getConstraints: async () => {
    const response = await apiFetch(`${API_BASE_URL}/admin/constraints`);
    return handleResponse<ApiResponse<any>>(response);
  },

  // Recycle bin APIs
  getDeletedItems: async () => {
    const response = await apiFetch(`${API_BASE_URL}/admin/recycle-bin`);
    return handleResponse<ApiResponse<any>>(response);
  },

  restoreItem: async (type: string, id: string) => {
    const response = await apiFetch(`${API_BASE_URL}/admin/recycle-bin/restore`, {
      method: 'POST',
      body: JSON.stringify({ type, id }),
    });
    return handleResponse<ApiResponse>(response);
  },

  permanentlyDeleteItem: async (type: string, id: string) => {
    const response = await apiFetch(`${API_BASE_URL}/admin/recycle-bin/permanent-delete`, {
      method: 'POST',
      body: JSON.stringify({ type, id }),
    });
    return handleResponse<ApiResponse>(response);
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
