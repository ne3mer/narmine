import { API_BASE_URL, adminHeaders } from '@/lib/api';

export interface ShippingMethod {
  _id: string;
  name: string;
  price: number;
  priceLabel?: string;
  eta?: string;
  badge?: string;
  icon?: string;
  perks?: string[];
  freeThreshold?: number;
  isActive: boolean;
  order: number;
}

export const getAllShippingMethods = async (activeOnly = false): Promise<ShippingMethod[]> => {
  const query = activeOnly ? '?active=true' : '';
  const response = await fetch(`${API_BASE_URL}/api/shipping-methods${query}`, {
    headers: {
      'Content-Type': 'application/json'
    }
  });

  if (!response.ok) {
    throw new Error('Failed to fetch shipping methods');
  }

  const data = await response.json();
  return data.data;
};

export const createShippingMethod = async (data: Partial<ShippingMethod>): Promise<ShippingMethod> => {
  const response = await fetch(`${API_BASE_URL}/api/shipping-methods`, {
    method: 'POST',
    headers: adminHeaders(),
    body: JSON.stringify(data)
  });

  if (!response.ok) {
    throw new Error('Failed to create shipping method');
  }

  const result = await response.json();
  return result.data;
};

export const updateShippingMethod = async (id: string, data: Partial<ShippingMethod>): Promise<ShippingMethod> => {
  const response = await fetch(`${API_BASE_URL}/api/shipping-methods/${id}`, {
    method: 'PATCH',
    headers: adminHeaders(),
    body: JSON.stringify(data)
  });

  if (!response.ok) {
    throw new Error('Failed to update shipping method');
  }

  const result = await response.json();
  return result.data;
};

export const deleteShippingMethod = async (id: string): Promise<void> => {
  const response = await fetch(`${API_BASE_URL}/api/shipping-methods/${id}`, {
    method: 'DELETE',
    headers: adminHeaders()
  });

  if (!response.ok) {
    throw new Error('Failed to delete shipping method');
  }
};

export const reorderShippingMethods = async (methods: { id: string; order: number }[]): Promise<void> => {
  const response = await fetch(`${API_BASE_URL}/api/shipping-methods/reorder`, {
    method: 'PUT',
    headers: adminHeaders(),
    body: JSON.stringify({ methods })
  });

  if (!response.ok) {
    throw new Error('Failed to reorder shipping methods');
  }
};
