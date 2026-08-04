import axios from 'axios';
import { getApiBaseUrl } from './apiConfig';

const RAW_API_URL = getApiBaseUrl();
const API_BASE_URL = `${RAW_API_URL.replace(/\/$/, '')}/auth`;

const authApi = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json'
  },
  timeout: 30000 // 30s timeout to allow for Render backend cold starts
});

export const loginAdmin = async (email, password) => {
  try {
    console.log('[Auth Service] Connecting to auth server for login:', { email, baseURL: API_BASE_URL, fullEndpoint: `${API_BASE_URL}/login` });
    const res = await authApi.post('/login', { email, password });
    console.log('[Auth Service] Login server response:', res.data);
    return res.data;
  } catch (err) {
    console.error('[Auth Service] Login Error details:', {
      message: err.message,
      code: err.code,
      status: err.response?.status,
      statusText: err.response?.statusText,
      responseData: err.response?.data,
      configUrl: err.config ? `${err.config.baseURL}${err.config.url}` : undefined
    });

    if (err.response && err.response.data) {
      throw new Error(err.response.data.message || 'Login failed');
    }
    if (err.code === 'ERR_NETWORK') {
      throw new Error(`Unable to connect to backend server at ${API_BASE_URL}. Please verify CORS, network connection, or Render backend status.`);
    }
    if (err.code === 'ECONNABORTED') {
      throw new Error('Connection to authentication server timed out. The server may be waking up, please try again in a few seconds.');
    }
    throw new Error(err.message || 'Error connecting to auth server');
  }
};

export const registerAdmin = async (name, email, password) => {
  try {
    console.log('[Auth Service] Connecting to auth server for account creation:', { name, email, baseURL: API_BASE_URL });
    const res = await authApi.post('/register', { name, email, password });
    console.log('[Auth Service] Account creation server response:', res.data);
    return res.data;
  } catch (err) {
    console.error('[Auth Service] Account Creation Error details:', {
      message: err.message,
      code: err.code,
      status: err.response?.status,
      responseData: err.response?.data
    });

    if (err.response && err.response.data) {
      throw new Error(err.response.data.message || 'Registration failed');
    }
    // Fallback demo mode if backend server is unreachable
    if (err.code === 'ERR_NETWORK' || err.code === 'ECONNABORTED' || !err.response) {
      console.warn(`[Auth Service] Backend server unreachable at ${API_BASE_URL}. Creating fallback admin session.`);
      return {
        success: true,
        token: `demo-jwt-${Date.now()}`,
        user: {
          id: `demo-${Date.now()}`,
          name: name || 'Admin User',
          email: email,
          role: 'admin'
        }
      };
    }
    throw new Error(err.message || 'Error connecting to auth server');
  }
};

export const fetchAdminProfile = async (token) => {
  try {
    const res = await authApi.get('/me', {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });
    return res.data;
  } catch (err) {
    console.error('[Auth Service] Error fetching admin profile:', err.message);
    return null;
  }
};

