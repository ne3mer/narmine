'use client';

import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import { API_BASE_URL } from '@/lib/api';

type CartItem = {
  _id: string;
  gameId: {
    id: string;
    title: string;
    slug: string;
    coverUrl?: string;
    basePrice: number;
    shipping?: {
      requiresShipping: boolean;
      shippingCost?: number;
      freeShipping?: boolean;
    };
  };
  quantity: number;
  priceAtAdd: number;
  addedAt: string;
  variantId?: string;
  selectedOptions?: Record<string, string>;
};

type Cart = {
  id?: string;
  userId: string;
  items: CartItem[];
  createdAt?: string;
  updatedAt?: string;
};

type CartContextType = {
  cart: Cart | null;
  loading: boolean;
  error: string;
  itemCount: number;
  totalPrice: number;
  shippingCost: number;
  finalTotal: number;
  addToCart: (gameId: string, quantity?: number, variantId?: string, selectedOptions?: Record<string, string>) => Promise<void>;
  updateQuantity: (itemId: string, quantity: number) => Promise<void>;
  removeFromCart: (itemId: string) => Promise<void>;
  clearCart: () => Promise<void>;
  refreshCart: () => Promise<void>;
};

const CartContext = createContext<CartContextType | undefined>(undefined);

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within CartProvider');
  }
  return context;
};

export const CartProvider = ({ children }: { children: ReactNode }) => {
  const [cart, setCart] = useState<Cart | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const getAuthToken = () => {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem('gc_token');
  };

  const getAuthHeaders = () => {
    const token = getAuthToken();
    return {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` })
    };
  };

  const refreshCart = async () => {
    const token = getAuthToken();
    if (!token) {
      setCart(null);
      setError('');
      return;
    }

    try {
      setLoading(true);
      setError('');
      
      const response = await fetch(`${API_BASE_URL}/api/cart`, {
        headers: getAuthHeaders(),
        credentials: 'include'
      });

      if (response.ok) {
        const data = await response.json();
        setCart(data.data);
        setError('');
      } else if (response.status === 401) {
        // Unauthorized - token might be invalid
        setCart(null);
        setError('');
        // Clear invalid token
        if (typeof window !== 'undefined') {
          localStorage.removeItem('gc_token');
          localStorage.removeItem('gc_user');
        }
      } else {
        const errorData = await response.json().catch(() => ({}));
        setError(errorData.message || 'خطا در دریافت سبد خرید');
        setCart(null);
      }
    } catch (err) {
      // Network error or CORS issue
      const errorMessage = err instanceof Error ? err.message : 'خطا در اتصال به سرور';
      console.error('Failed to fetch cart:', err);
      
      // Only show error if it's not a network issue (user might be offline)
      if (errorMessage.includes('Failed to fetch') || errorMessage.includes('NetworkError')) {
        // Silently fail for network errors - user might be offline
        setCart(null);
        setError('');
      } else {
        setError(errorMessage);
        setCart(null);
      }
    } finally {
      setLoading(false);
    }
  };

  const addToCart = async (gameId: string, quantity: number = 1, variantId?: string, selectedOptions?: Record<string, string>) => {
    const token = getAuthToken();
    if (!token) {
      setError('لطفاً ابتدا وارد حساب کاربری خود شوید');
      return;
    }

    try {
      setLoading(true);
      setError('');
      
      const response = await fetch(`${API_BASE_URL}/api/cart/add`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({ gameId, quantity, variantId, selectedOptions })
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || 'خطا در افزودن به سبد خرید');
      }

      const data = await response.json();
      setCart(data.data);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'خطا در افزودن به سبد خرید';
      setError(message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const updateQuantity = async (itemId: string, quantity: number) => {
    const token = getAuthToken();
    if (!token) return;

    try {
      setLoading(true);
      setError('');

      const response = await fetch(`${API_BASE_URL}/api/cart/${itemId}`, {
        method: 'PATCH',
        headers: getAuthHeaders(),
        body: JSON.stringify({ quantity })
      });

      if (!response.ok) {
        throw new Error('خطا در بروزرسانی سبد خرید');
      }

      const data = await response.json();
      setCart(data.data);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'خطا در بروزرسانی';
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  const removeFromCart = async (itemId: string) => {
    const token = getAuthToken();
    if (!token) return;

    try {
      setLoading(true);
      setError('');

      const response = await fetch(`${API_BASE_URL}/api/cart/${itemId}`, {
        method: 'DELETE',
        headers: getAuthHeaders()
      });

      if (!response.ok) {
        throw new Error('خطا در حذف از سبد خرید');
      }

      const data = await response.json();
      setCart(data.data);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'خطا در حذف';
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  const clearCart = async () => {
    const token = getAuthToken();
    if (!token) return;

    try {
      setLoading(true);
      setError('');

      const response = await fetch(`${API_BASE_URL}/api/cart`, {
        method: 'DELETE',
        headers: getAuthHeaders()
      });

      if (!response.ok) {
        throw new Error('خطا در پاک کردن سبد خرید');
      }

      const data = await response.json();
      setCart(data.data);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'خطا در پاک کردن سبد';
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  // Load cart on mount only if user is authenticated
  useEffect(() => {
    const token = getAuthToken();
    if (token) {
      refreshCart();
    } else {
      setCart(null);
      setError('');
    }
  }, []);

  // Listen for auth changes
  useEffect(() => {
    const handleAuthChange = () => {
      const token = getAuthToken();
      if (token) {
        refreshCart();
      } else {
        setCart(null);
        setError('');
      }
    };

    if (typeof window !== 'undefined') {
      window.addEventListener('gc-auth-change', handleAuthChange);
      return () => window.removeEventListener('gc-auth-change', handleAuthChange);
    }
  }, []);

  const itemCount = cart?.items.reduce((sum, item) => sum + item.quantity, 0) || 0;
  const totalPrice = cart?.items.reduce((sum, item) => sum + item.priceAtAdd * item.quantity, 0) || 0;
  
  const shippingCost = cart?.items.reduce((sum, item) => {
    if (!item.gameId) return sum;
    if (item.gameId.shipping?.requiresShipping && !item.gameId.shipping.freeShipping) {
      return sum + (item.gameId.shipping.shippingCost || 0) * item.quantity;
    }
    return sum;
  }, 0) || 0;

  const finalTotal = totalPrice + shippingCost;

  const value: CartContextType = {
    cart,
    loading,
    error,
    itemCount,
    totalPrice,
    shippingCost,
    finalTotal,
    addToCart,
    updateQuantity,
    removeFromCart,
    clearCart,
    refreshCart
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};
