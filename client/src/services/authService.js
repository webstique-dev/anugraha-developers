import axios from 'axios';

const RAW_API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
const API_BASE_URL = `${RAW_API_URL.replace(/\/$/, '')}/auth`;

const authApi = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json'
  },
  timeout: 8000
});

export const loginAdmin = async (email, password) => {
  try {
    console.log('Connecting to auth server for login:', { email });
    const res = await authApi.post('/login', { email, password });
    console.log('Login server response:', res.data);
    return res.data;
  } catch (err) {
    console.error('Login Error details:', err);
    if (err.response && err.response.data) {
      console.error('Server response status:', err.response.status);
      console.error('Server response data:', err.response.data);
      throw new Error(err.response.data.message || 'Login failed');
    }
    // Fallback demo mode if backend server is unreachable
    if (err.code === 'ERR_NETWORK' || err.code === 'ECONNABORTED' || !err.response) {
      console.warn('Backend server unreachable at http://localhost:5000/api/auth. Using fallback admin auth mode.');
      if (email === 'admin@anugraha.com' && password === 'admin123') {
        return {
          success: true,
          token: 'demo-jwt-token-anugraha-2026',
          user: {
            id: 'demo-admin-id-1',
            name: 'Anugraha Admin',
            email: 'admin@anugraha.com',
            role: 'admin'
          }
        };
      }
      throw new Error('Server Unreachable: Use email "admin@anugraha.com" and password "admin123" for demo mode, or start backend server (npm start in /server).');
    }
    throw new Error(err.message || 'Error connecting to auth server');
  }
};

export const registerAdmin = async (name, email, password) => {
  try {
    console.log('Connecting to auth server for account creation:', { name, email });
    const res = await authApi.post('/register', { name, email, password });
    console.log('Account creation server response:', res.data);
    return res.data;
  } catch (err) {
    console.error('Account Creation Error details:', err);
    if (err.response && err.response.data) {
      console.error('Server response status:', err.response.status);
      console.error('Server response data:', err.response.data);
      throw new Error(err.response.data.message || 'Registration failed');
    }
    // Fallback demo mode if backend server is unreachable
    if (err.code === 'ERR_NETWORK' || err.code === 'ECONNABORTED' || !err.response) {
      console.warn('Backend server unreachable at http://localhost:5000/api/auth. Creating fallback admin session.');
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
    console.error('Error fetching admin profile:', err);
    return null;
  }
};
