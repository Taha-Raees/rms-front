'use client';

import React, { createContext, useContext, useReducer, useEffect, ReactNode } from 'react';
import { usePathname } from 'next/navigation';
import { authApi } from '@/lib/api';
import { Store, User } from '@/lib/types';

interface AuthUser {
  id: string;
  email: string;
  role: string;
  storeId: string;
}

interface AuthState {
  user: AuthUser | null;
  store: Store | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  error?: string;
}

type AuthAction =
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_AUTH_DATA'; payload: { user: AuthUser; store: Store } }
  | { type: 'CLEAR_AUTH' }
  | { type: 'SET_ERROR'; payload: string };

const initialState: AuthState = {
  user: null,
  store: null,
  isLoading: true,
  isAuthenticated: false,
};

function authReducer(state: AuthState, action: AuthAction): AuthState {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, isLoading: action.payload };
    case 'SET_AUTH_DATA':
      return {
        ...state,
        user: action.payload.user,
        store: action.payload.store,
        isLoading: false,
        isAuthenticated: true,
      };
    case 'CLEAR_AUTH':
      return {
        ...state,
        user: null,
        store: null,
        isLoading: false,
        isAuthenticated: false,
      };
    case 'SET_ERROR':
      return {
        ...state,
        isLoading: false,
        error: action.payload,
      };
    default:
      return state;
  }
}

interface AuthContextType {
  state: AuthState;
  dispatch: React.Dispatch<AuthAction>;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(authReducer, initialState);
  const pathname = usePathname();

  useEffect(() => {
    // Don't check auth on public pages
    const publicPages = ['/login', '/admin-login', '/admin-dashboard'];
    if (publicPages.includes(pathname) || pathname.startsWith('/admin-dashboard')) {
      dispatch({ type: 'SET_LOADING', payload: false });
      return;
    }
    
    checkAuth();
  }, [pathname]);

  const checkAuth = async () => {
    try {
      const result = await authApi.getMe();
      
      if (result.success && result.data) {
        const userData = result.data;
        // Fetch store data separately
        let storeData = null;
        if (userData.storeId) {
          try {
            const storeResponse = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3001'}/store`, {
              credentials: 'include',
            });
            if (storeResponse.ok) {
              const storeResult = await storeResponse.json();
              if (storeResult.success && storeResult.data) {
                storeData = storeResult.data;
              }
            }
          } catch (storeError) {
            console.error('Failed to fetch store data:', storeError);
          }
        }
        
        dispatch({
          type: 'SET_AUTH_DATA',
          payload: {
            user: {
              id: userData.id,
              email: userData.email,
              role: userData.role,
              storeId: userData.storeId,
            },
            store: storeData
          }
        });
      } else {
        dispatch({ type: 'CLEAR_AUTH' });
      }
    } catch (error) {
      console.error('Auth check failed:', error);
      dispatch({ type: 'CLEAR_AUTH' });
    }
  };

  const login = async (email: string, password: string) => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      const result = await authApi.login(email, password);
      
      if (result.success) {
        dispatch({
          type: 'SET_AUTH_DATA',
          payload: {
            user: {
              id: result.data.user.id,
              email: result.data.user.email,
              role: result.data.user.role,
              storeId: result.data.user.storeId,
            },
            store: result.data.store
          }
        });
        return { success: true };
      } else {
        return { success: false, error: result.error };
      }
    } catch (error: any) {
      console.error('Login failed:', error);
      const errorMessage = error.message || 'Login failed';
      dispatch({ type: 'SET_ERROR', payload: errorMessage });
      return { success: false, error: errorMessage };
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  };

  const logout = async () => {
    try {
      await authApi.logout();
      dispatch({ type: 'CLEAR_AUTH' });
      window.location.href = '/login';
    } catch (error) {
      console.error('Logout failed:', error);
      // Still clear auth state even if API call fails
      dispatch({ type: 'CLEAR_AUTH' });
      window.location.href = '/login';
    }
  };

  return (
    <AuthContext.Provider value={{ state, dispatch, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
