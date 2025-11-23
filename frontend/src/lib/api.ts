const normalizeUrl = (value?: string | null, fallback: string = '') => {
  if (!value) return fallback;
  return value.endsWith('/') ? value.slice(0, -1) : value;
};

export const API_BASE_URL = normalizeUrl(process.env.NEXT_PUBLIC_API_URL, 'http://localhost:5050');
const uploadBaseFromEnv = normalizeUrl(process.env.NEXT_PUBLIC_UPLOAD_BASE_URL);
const derivedUploadBase = API_BASE_URL.endsWith('/api') ? API_BASE_URL.slice(0, -4) : API_BASE_URL;
export const UPLOAD_BASE_URL = uploadBaseFromEnv || derivedUploadBase;

export const resolveImageUrl = (path?: string) => {
  if (!path) return '';
  if (/^https?:\/\//i.test(path)) return path;
  const normalizedPath = path.startsWith('/') ? path : `/${path}`;
  return `${UPLOAD_BASE_URL}${normalizedPath}`;
};
export const ADMIN_API_KEY = process.env.NEXT_PUBLIC_ADMIN_API_KEY || '912A3060859n';

export const adminHeaders = (includeContentType: boolean = true, additional?: HeadersInit): HeadersInit => {
  const headers: Record<string, string> = {};

  if (includeContentType) {
    headers['Content-Type'] = 'application/json';
  }

  if (ADMIN_API_KEY) {
    headers['x-admin-key'] = ADMIN_API_KEY;
  }

  return { ...headers, ...(additional ?? {}) };
};

export const persistAuthSession = (token?: string, user?: unknown) => {
  if (typeof window === 'undefined' || !token || !user) return;
  localStorage.setItem('gc_token', token);
  localStorage.setItem('gc_user', JSON.stringify(user));
  window.dispatchEvent(new Event('gc-auth-change'));
};

export const clearAuthSession = () => {
  if (typeof window === 'undefined') return;
  localStorage.removeItem('gc_token');
  localStorage.removeItem('gc_user');
  window.dispatchEvent(new Event('gc-auth-change'));
};
