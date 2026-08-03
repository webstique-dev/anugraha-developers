import React, { createContext, useState, useEffect, useContext } from 'react';
import { toast } from '../components/Common/Notification/NotificationProvider';
import { loginAdmin, registerAdmin, fetchAdminProfile } from '../services/authService';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    try {
      const savedUser = localStorage.getItem('anugraha_admin_user');
      return savedUser ? JSON.parse(savedUser) : null;
    } catch {
      return null;
    }
  });

  const [token, setToken] = useState(() => localStorage.getItem('anugraha_admin_token') || null);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authTab, setAuthTab] = useState('login'); // 'login' | 'register'
  const [loading, setLoading] = useState(false);
  const [sessionChecking, setSessionChecking] = useState(true);

  const isAuthenticated = Boolean(user && token);
  const isViewOnly = !isAuthenticated;

  // Restore and validate session on initial mount
  useEffect(() => {
    async function restoreSession() {
      if (token) {
        if (!token.startsWith('demo-')) {
          try {
            const profileData = await fetchAdminProfile(token);
            if (profileData && profileData.user) {
              setUser(profileData.user);
              localStorage.setItem('anugraha_admin_user', JSON.stringify(profileData.user));
            } else {
              // Token invalid or expired: clear silently
              setUser(null);
              setToken(null);
              localStorage.removeItem('anugraha_admin_token');
              localStorage.removeItem('anugraha_admin_user');
            }
          } catch {
            // Unreachable or error: preserve local state for offline resilience
          }
        }
      }
      setSessionChecking(false);
    }
    restoreSession();
  }, [token]);

  const openAuthModal = (tab = 'login') => {
    setAuthTab(tab);
    setIsAuthModalOpen(true);
  };

  const closeAuthModal = () => {
    setIsAuthModalOpen(false);
  };

  const handleLogin = async (email, password) => {
    setLoading(true);
    try {
      const res = await loginAdmin(email, password);
      if (res.success && res.token && res.user) {
        setToken(res.token);
        setUser(res.user);
        localStorage.setItem('anugraha_admin_token', res.token);
        localStorage.setItem('anugraha_admin_user', JSON.stringify(res.user));
        toast.success(`Welcome back, ${res.user.name || 'Admin'}!`);
        closeAuthModal();
        return true;
      }
    } catch (err) {
      toast.error(err.message || 'Login failed');
      return false;
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (name, email, password) => {
    setLoading(true);
    try {
      const res = await registerAdmin(name, email, password);
      if (res.success && res.token && res.user) {
        setToken(res.token);
        setUser(res.user);
        localStorage.setItem('anugraha_admin_token', res.token);
        localStorage.setItem('anugraha_admin_user', JSON.stringify(res.user));
        toast.success(`Account created successfully! Welcome, ${res.user.name}.`);
        closeAuthModal();
        return true;
      }
    } catch (err) {
      toast.error(err.message || 'Account creation failed');
      return false;
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('anugraha_admin_token');
    localStorage.removeItem('anugraha_admin_user');
    toast.success('Logged out. Switched to View-Only Mode.');
  };

  /**
   * Helper function to execute admin actions or prompt authentication for view-only users
   */
  const requireAdmin = (actionCallback, noticeMessage = 'Log in as Admin to modify layout details') => {
    if (isAuthenticated) {
      if (typeof actionCallback === 'function') {
        actionCallback();
      }
      return true;
    } else {
      toast(noticeMessage, {
        icon: '🔒',
        duration: 4000
      });
      openAuthModal('login');
      return false;
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated,
        isViewOnly,
        isAuthModalOpen,
        authTab,
        loading,
        sessionChecking,
        openAuthModal,
        closeAuthModal,
        setAuthTab,
        login: handleLogin,
        register: handleRegister,
        logout,
        requireAdmin
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
