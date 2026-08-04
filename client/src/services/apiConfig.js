/**
 * API Base URL Resolver Utility
 * 
 * Standardizes API base URLs for local development and cloud production (Vercel + Render).
 * Resolves VITE_API_URL environment variable, prevents mixed-content issues (HTTPS calling HTTP),
 * enforces proper '/api' path suffixes, and strips trailing slashes.
 */

export const getApiBaseUrl = () => {
  const envUrl = (import.meta.env.VITE_API_URL || '').trim();

  let baseUrl = '';

  if (envUrl) {
    baseUrl = envUrl.replace(/\/+$/, '');
    
    // Ensure '/api' suffix is present if not already appended
    if (!baseUrl.toLowerCase().endsWith('/api')) {
      baseUrl = `${baseUrl}/api`;
    }
  } else {
    // Fallback: If running locally on localhost/127.0.0.1 use localhost:5000
    const isLocalhost = 
      typeof window !== 'undefined' && 
      (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1');

    if (isLocalhost || import.meta.env.DEV) {
      baseUrl = 'http://localhost:5000/api';
    } else {
      console.warn(
        '[API Config Warning] VITE_API_URL environment variable is not defined in production build! Falling back to relative "/api". Please configure VITE_API_URL in your Vercel project settings.'
      );
      baseUrl = '/api';
    }
  }

  // Automatic Mixed Content Protection:
  // If frontend is loaded via HTTPS, force the API URL protocol to HTTPS if it targets a remote host
  if (typeof window !== 'undefined' && window.location.protocol === 'https:') {
    if (baseUrl.startsWith('http://') && !baseUrl.includes('localhost') && !baseUrl.includes('127.0.0.1')) {
      console.warn('[API Config Warning] Upgrading HTTP backend URL to HTTPS to prevent browser mixed-content block:', baseUrl);
      baseUrl = baseUrl.replace(/^http:\/\//i, 'https://');
    }
  }

  return baseUrl;
};
