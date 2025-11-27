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

import { getAllShippingMethods, type ShippingMethod } from '@/lib/api/shipping';
import { getAllPaymentMethods, type PaymentMethod } from '@/lib/api/payment';

// ... (previous imports)

type CartContextType = {
  cart: Cart | null;
  loading: boolean;
  error: string;
  itemCount: number;
  totalPrice: number;
  shippingCost: number;
  finalTotal: number;
  shippingMethods: ShippingMethod[];
  selectedShippingMethodId: string;
  setSelectedShippingMethodId: (id: string) => void;
  paymentMethods: PaymentMethod[];
  selectedPaymentMethodId: string;
  setSelectedPaymentMethodId: (id: string) => void;
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
  const [shippingMethods, setShippingMethods] = useState<ShippingMethod[]>([]);
  const [selectedShippingMethodId, setSelectedShippingMethodId] = useState<string>('');

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

  // ... (saveGuestCart, getGuestCart helpers - unchanged)
  const saveGuestCart = (newCart: Cart) => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('guest_cart', JSON.stringify(newCart));
      setCart(newCart);
    }
  };

  const getGuestCart = (): Cart => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('guest_cart');
      if (stored) {
        return JSON.parse(stored);
      }
    }
    return {
      userId: 'guest',
      items: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
  };

  const refreshCart = async () => {
    const token = getAuthToken();
    
    // If guest, load from local storage
    if (!token) {
      setCart(getGuestCart());
      setError('');
      return;
    }

    // If authenticated, fetch from API
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
        setCart(getGuestCart());
        setError('');
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
      const errorMessage = err instanceof Error ? err.message : 'خطا در اتصال به سرور';
      console.error('Failed to fetch cart:', err);
      if (errorMessage.includes('Failed to fetch') || errorMessage.includes('NetworkError')) {
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

  // ... (addToCart, updateQuantity, removeFromCart, clearCart, syncLocalCart - unchanged)
  const addToCart = async (gameId: string, quantity: number = 1, variantId?: string, selectedOptions?: Record<string, string>) => {
    const token = getAuthToken();

    // Guest Logic
    if (!token) {
      try {
        setLoading(true);
        const productRes = await fetch(`${API_BASE_URL}/api/games/${gameId}`);
        if (!productRes.ok) throw new Error('Product not found');
        const productData = await productRes.json();
        const product = productData.data;

        const currentCart = getGuestCart();
        const existingItemIndex = currentCart.items.findIndex(item => 
          item.gameId.id === gameId && item.variantId === variantId
        );

        let price = product.basePrice;
        if (variantId && product.variants) {
           const variant = product.variants.find((v: { id: string; salePrice?: number; price: number }) => v.id === variantId);
           if (variant) {
             price = variant.salePrice || variant.price;
           }
        }

        if (existingItemIndex > -1) {
          currentCart.items[existingItemIndex].quantity += quantity;
        } else {
          currentCart.items.push({
            _id: `local_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            gameId: {
              id: product._id || product.id,
              title: product.title,
              slug: product.slug,
              coverUrl: product.coverUrl,
              basePrice: product.basePrice,
              shipping: product.shipping
            },
            quantity,
            priceAtAdd: price,
            addedAt: new Date().toISOString(),
            variantId,
            selectedOptions
          });
        }
        
        saveGuestCart(currentCart);
        setLoading(false);
        return;
      } catch (err) {
        console.error('Guest add to cart error:', err);
        setLoading(false);
        throw err;
      }
    }

    // Authenticated Logic
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

    // Guest Logic
    if (!token) {
      const currentCart = getGuestCart();
      const itemIndex = currentCart.items.findIndex(item => item._id === itemId);
      
      if (itemIndex > -1) {
        if (quantity <= 0) {
          currentCart.items.splice(itemIndex, 1);
        } else {
          currentCart.items[itemIndex].quantity = quantity;
        }
        saveGuestCart(currentCart);
      }
      return;
    }

    // Authenticated Logic
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

    // Guest Logic
    if (!token) {
      const currentCart = getGuestCart();
      const newItems = currentCart.items.filter(item => item._id !== itemId);
      currentCart.items = newItems;
      saveGuestCart(currentCart);
      return;
    }

    // Authenticated Logic
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

    // Guest Logic
    if (!token) {
      localStorage.removeItem('guest_cart');
      setCart(getGuestCart());
      return;
    }

    // Authenticated Logic
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

  const syncLocalCart = async () => {
    const token = getAuthToken();
    if (!token) return;

    const localCart = getGuestCart();
    if (localCart.items.length === 0) return;

    try {
      setLoading(true);
      for (const item of localCart.items) {
        await fetch(`${API_BASE_URL}/api/cart/add`, {
          method: 'POST',
          headers: getAuthHeaders(),
          body: JSON.stringify({
            gameId: item.gameId.id,
            quantity: item.quantity,
            variantId: item.variantId,
            selectedOptions: item.selectedOptions
          })
        });
      }
      localStorage.removeItem('guest_cart');
      await refreshCart();
    } catch (err) {
      console.error('Failed to sync cart:', err);
    } finally {
      setLoading(false);
    }
  };

  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
  const [selectedPaymentMethodId, setSelectedPaymentMethodId] = useState<string>('');

  // ... (existing code)

  // Fetch payment methods
  useEffect(() => {
    const fetchPaymentMethods = async () => {
      try {
        const methods = await getAllPaymentMethods(true);
        setPaymentMethods(methods);
        if (methods.length > 0) {
          setSelectedPaymentMethodId(methods[0]._id);
        }
      } catch (err) {
        console.error('Failed to fetch payment methods:', err);
      }
    };
    fetchPaymentMethods();
  }, []);

  // Fetch shipping methods
  useEffect(() => {
    const fetchShippingMethods = async () => {
      try {
        const methods = await getAllShippingMethods(true);
        setShippingMethods(methods);
        if (methods.length > 0) {
          setSelectedShippingMethodId(methods[0]._id);
        }
      } catch (err) {
        console.error('Failed to fetch shipping methods:', err);
      }
    };
    fetchShippingMethods();
  }, []);

  // Derived state
  const itemCount = cart?.items.reduce((total, item) => total + item.quantity, 0) || 0;
  
  const totalPrice = cart?.items.reduce((total, item) => {
    return total + (item.priceAtAdd * item.quantity);
  }, 0) || 0;

  const selectedShippingMethod = shippingMethods.find(m => m._id === selectedShippingMethodId);
  const shippingCost = selectedShippingMethod 
    ? (selectedShippingMethod.freeThreshold && totalPrice >= selectedShippingMethod.freeThreshold ? 0 : selectedShippingMethod.price)
    : 0;

  const finalTotal = totalPrice + shippingCost;

  const value: CartContextType = {
    cart,
    loading,
    error,
    itemCount,
    totalPrice,
    shippingCost,
    finalTotal,
    shippingMethods,
    selectedShippingMethodId,
    setSelectedShippingMethodId,
    paymentMethods,
    selectedPaymentMethodId,
    setSelectedPaymentMethodId,
    addToCart,
    updateQuantity,
    removeFromCart,
    clearCart,
    refreshCart
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};
