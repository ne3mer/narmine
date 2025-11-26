const normalizeUrl = (value?: string | null, fallback: string = '') => {
  if (!value) return fallback;
  return value.endsWith('/') ? value.slice(0, -1) : value;
};

const getApiBaseUrl = () => {
  let url = process.env.NEXT_PUBLIC_API_URL;

  if (typeof window !== 'undefined') {
    if (!url) return 'https://narmine-backend.onrender.com';
    
    // Replace localhost with actual hostname (e.g. for mobile testing on LAN)
    if (url.includes('localhost') && window.location.hostname !== 'localhost') {
      return url.replace('localhost', window.location.hostname);
    }
    return url;
  }

  return url || 'http://localhost:5050';
};

export const API_BASE_URL = normalizeUrl(
  getApiBaseUrl(),
  'http://localhost:5050'
);

const uploadBaseFromEnv = normalizeUrl(process.env.NEXT_PUBLIC_UPLOAD_BASE_URL);
// If API_BASE_URL ends with /api, remove it to get the root URL for uploads
const derivedUploadBase = API_BASE_URL.endsWith('/api') ? API_BASE_URL.slice(0, -4) : API_BASE_URL;

// Prefer the API host for serving uploads and only fall back to Render when the API
// still points to localhost in a production environment (e.g. missing env vars).
const isLocalDerivedBase = /^https?:\/\/(localhost|127\.0\.0\.1)/i.test(derivedUploadBase);
const fallbackUploadBase =
  isLocalDerivedBase && process.env.NODE_ENV === 'production'
    ? 'https://narmine-backend.onrender.com'
    : derivedUploadBase;

export const UPLOAD_BASE_URL = uploadBaseFromEnv || fallbackUploadBase;

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
