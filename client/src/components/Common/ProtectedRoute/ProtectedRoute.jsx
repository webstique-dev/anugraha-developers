import React, { useEffect } from 'react';
import { toast } from '../Notification/NotificationProvider';
import { useAuth } from '../../../context/AuthContext';

/**
 * ProtectedRoute component for guarding admin-only routes and views.
 * Unauthenticated users are shown a toast notification and prompted to log in,
 * while the page gracefully falls back to View-Only Mode.
 */
const ProtectedRoute = ({ children, fallback = null }) => {
  const { isAuthenticated, openAuthModal } = useAuth();

  useEffect(() => {
    if (!isAuthenticated) {
      toast('View-Only Mode: Please log in as an Admin to access controls.', {
        icon: '🔒',
        duration: 4000
      });
      openAuthModal('login');
    }
  }, [isAuthenticated, openAuthModal]);

  if (!isAuthenticated) {
    return fallback;
  }

  return children;
};

export default ProtectedRoute;
