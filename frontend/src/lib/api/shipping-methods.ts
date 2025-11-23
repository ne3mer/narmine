import { API_BASE_URL } from '@/lib/api';
import { getAuthToken } from '@/lib/auth';

export interface ShippingMethod {
  _id: string;
  name: string;
  price: number;
  priceLabel?: string;
  eta?: string;
  badge?: string;
  icon?: string;
  perks: string[];
  freeThreshold?: number;
  isActive: boolean;
  order: number;
}

export const getAllShippingMethods = async (activeOnly = false): Promise<ShippingMethod[]> => {
  const res = await fetch(`${API_BASE_URL}/api/shipping-methods${activeOnly ? '?active=true' : ''}`);
  const data = await res.json();
  if (data.success) {
    return data.data;
  }
  throw new Error(data.message || 'Failed to fetch shipping methods');
};

export const getShippingMethodById = async (id: string): Promise<ShippingMethod> => {
  const res = await fetch(`${API_BASE_URL}/api/shipping-methods/${id}`);
  const data = await res.json();
  if (data.success) {
    return data.data;
  }
  throw new Error(data.message || 'Failed to fetch shipping method');
};

export const createShippingMethod = async (data: Partial<ShippingMethod>): Promise<ShippingMethod> => {
  const token = getAuthToken();
  const res = await fetch(`${API_BASE_URL}/api/shipping-methods`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
      'x-admin-key': process.env.NEXT_PUBLIC_ADMIN_API_KEY || ''
    },
    body: JSON.stringify(data)
  });
  const result = await res.json();
  if (result.success) {
    return result.data;
  }
  throw new Error(result.message || 'Failed to create shipping method');
};

export const updateShippingMethod = async (id: string, data: Partial<ShippingMethod>): Promise<ShippingMethod> => {
  const token = getAuthToken();
  const res = await fetch(`${API_BASE_URL}/api/shipping-methods/${id}`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
      'x-admin-key': process.env.NEXT_PUBLIC_ADMIN_API_KEY || ''
    },
    body: JSON.stringify(data)
  });
  const result = await res.json();
  if (result.success) {
    return result.data;
  }
  throw new Error(result.message || 'Failed to update shipping method');
};

export const deleteShippingMethod = async (id: string): Promise<void> => {
  const token = getAuthToken();
  const res = await fetch(`${API_BASE_URL}/api/shipping-methods/${id}`, {
    method: 'DELETE',
    headers: {
      'Authorization': `Bearer ${token}`,
      'x-admin-key': process.env.NEXT_PUBLIC_ADMIN_API_KEY || ''
    }
  });
  const result = await res.json();
  if (!result.success) {
    throw new Error(result.message || 'Failed to delete shipping method');
  }
};

export const reorderShippingMethods = async (methods: { id: string; order: number }[]): Promise<void> => {
  const token = getAuthToken();
  const res = await fetch(`${API_BASE_URL}/api/shipping-methods/reorder`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
      'x-admin-key': process.env.NEXT_PUBLIC_ADMIN_API_KEY || ''
    },
    body: JSON.stringify({ methods })
  });
  const result = await res.json();
  if (!result.success) {
    throw new Error(result.message || 'Failed to reorder shipping methods');
  }
};
