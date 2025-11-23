'use client';

export type UserRole = 'user' | 'admin';

export interface StoredUser {
  id?: string;
  name?: string;
  fullName?: string;
  email?: string;
  phone?: string;
  telegram?: string;
  role?: UserRole;
}

export const getUserFromStorage = (): StoredUser | null => {
  if (typeof window === 'undefined') return null;
  
  try {
    const stored = localStorage.getItem('gc_user');
    if (!stored) return null;
    
    const user = JSON.parse(stored) as StoredUser;
    return user;
  } catch {
    return null;
  }
};

export const getAuthToken = (): string | null => {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('gc_token');
};

export const isAuthenticated = (): boolean => {
  return getAuthToken() !== null;
};

export const isAdmin = (): boolean => {
  const user = getUserFromStorage();
  return user?.role === 'admin';
};

export const getUserRole = (): UserRole | null => {
  const user = getUserFromStorage();
  return user?.role || null;
};

