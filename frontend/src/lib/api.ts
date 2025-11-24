const normalizeUrl = (value?: string | null, fallback: string = '') => {
  if (!value) return fallback;
  return value.endsWith('/') ? value.slice(0, -1) : value;
};

export const API_BASE_URL = normalizeUrl(
  process.env.NEXT_PUBLIC_API_URL || (typeof window !== 'undefined' ? 'https://narmine-backend.onrender.com' : 'http://localhost:5050'),
  'http://localhost:5050'
);

const uploadBaseFromEnv = normalizeUrl(process.env.NEXT_PUBLIC_UPLOAD_BASE_URL);
// If API_BASE_URL ends with /api, remove it to get the root URL for uploads
const derivedUploadBase = API_BASE_URL.endsWith('/api') ? API_BASE_URL.slice(0, -4) : API_BASE_URL;

// On production, always use the backend URL for uploads if not explicitly set
export const UPLOAD_BASE_URL = uploadBaseFromEnv || (
  process.env.NODE_ENV === 'production' 
    ? 'https://narmine-backend.onrender.com' 
    : derivedUploadBase
);

export const resolveImageUrl = (path?: string) => {
  if (!path) return '';
  if (/^https?:\/\//i.test(path)) return path;
  
  // Remove any leading slash to avoid double slashes when joining
  const cleanPath = path.startsWith('/') ? path.slice(1) : path;
  
  // If path already starts with uploads/, just append to base
  // If not, assume it's inside uploads/
  const finalPath = cleanPath.startsWith('uploads/') ? cleanPath : `uploads/${cleanPath}`;
  
  return `${UPLOAD_BASE_URL}/${finalPath}`;
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
