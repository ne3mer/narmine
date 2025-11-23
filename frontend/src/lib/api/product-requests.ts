import { API_BASE_URL } from '@/lib/api';

export interface ProductRequest {
  id: string;
  productName: string;
  category: string;
  brand: string;
  description?: string;
  status: 'pending' | 'approved' | 'rejected' | 'completed';
  userId: string;
  createdAt: string;
  updatedAt: string;
  adminNote?: string;
}

export interface ProductRequestStats {
  total: number;
  pending: number;
  approved: number;
  rejected: number;
  completed: number;
}

export const createProductRequest = async (data: {
  productName: string;
  category: string;
  brand: string;
  description?: string;
}): Promise<ProductRequest> => {
  const response = await fetch(`${API_BASE_URL}/api/game-requests`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${localStorage.getItem('token')}`
    },
    body: JSON.stringify(data)
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to create product request');
  }

  return response.json();
};

export const getUserProductRequests = async (): Promise<ProductRequest[]> => {
  const response = await fetch(`${API_BASE_URL}/api/game-requests`, {
    headers: {
      'Authorization': `Bearer ${localStorage.getItem('token')}`
    }
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to fetch product requests');
  }

  return response.json();
};

export const getAllProductRequests = async (status?: string): Promise<{ data: ProductRequest[]; statistics: ProductRequestStats }> => {
  const url = status 
    ? `${API_BASE_URL}/api/game-requests/all?status=${status}`
    : `${API_BASE_URL}/api/game-requests/all`;

  const response = await fetch(url, {
    headers: {
      'Authorization': `Bearer ${localStorage.getItem('token')}`
    }
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to fetch all product requests');
  }

  return response.json();
};

export const updateProductRequestStatus = async (
  id: string, 
  status: string,
  adminNote?: string
): Promise<ProductRequest> => {
  const response = await fetch(`${API_BASE_URL}/api/game-requests/${id}`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${localStorage.getItem('token')}`
    },
    body: JSON.stringify({ status, adminNote })
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to update product request status');
  }

  return response.json();
};

export const deleteProductRequest = async (id: string): Promise<void> => {
  const response = await fetch(`${API_BASE_URL}/api/game-requests/${id}`, {
    method: 'DELETE',
    headers: {
      'Authorization': `Bearer ${localStorage.getItem('token')}`
    }
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to delete product request');
  }
};
