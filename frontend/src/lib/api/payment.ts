import { API_BASE_URL, adminHeaders } from '@/lib/api';

export interface PaymentMethod {
  _id: string;
  name: string;
  label: string;
  description?: string;
  icon?: string;
  isActive: boolean;
  order: number;
}

export const getAllPaymentMethods = async (activeOnly = false): Promise<PaymentMethod[]> => {
  const query = activeOnly ? '?active=true' : '';
  const response = await fetch(`${API_BASE_URL}/api/payment-methods${query}`, {
    headers: {
      'Content-Type': 'application/json'
    }
  });

  if (!response.ok) {
    throw new Error('Failed to fetch payment methods');
  }

  const data = await response.json();
  return data.data;
};

export const createPaymentMethod = async (data: Partial<PaymentMethod>): Promise<PaymentMethod> => {
  const response = await fetch(`${API_BASE_URL}/api/payment-methods`, {
    method: 'POST',
    headers: adminHeaders(),
    body: JSON.stringify(data)
  });

  if (!response.ok) {
    throw new Error('Failed to create payment method');
  }

  const result = await response.json();
  return result.data;
};

export const updatePaymentMethod = async (id: string, data: Partial<PaymentMethod>): Promise<PaymentMethod> => {
  const response = await fetch(`${API_BASE_URL}/api/payment-methods/${id}`, {
    method: 'PATCH',
    headers: adminHeaders(),
    body: JSON.stringify(data)
  });

  if (!response.ok) {
    throw new Error('Failed to update payment method');
  }

  const result = await response.json();
  return result.data;
};

export const deletePaymentMethod = async (id: string): Promise<void> => {
  const response = await fetch(`${API_BASE_URL}/api/payment-methods/${id}`, {
    method: 'DELETE',
    headers: adminHeaders()
  });

  if (!response.ok) {
    throw new Error('Failed to delete payment method');
  }
};

export const reorderPaymentMethods = async (methods: { id: string; order: number }[]): Promise<void> => {
  const response = await fetch(`${API_BASE_URL}/api/payment-methods/reorder`, {
    method: 'PUT',
    headers: adminHeaders(),
    body: JSON.stringify({ methods })
  });

  if (!response.ok) {
    throw new Error('Failed to reorder payment methods');
  }
};
