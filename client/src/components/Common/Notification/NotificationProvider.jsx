import React, { createContext, useState, useCallback, useContext } from 'react';
import { AnimatePresence } from 'framer-motion';
import NotificationItem from './NotificationItem';

const NotificationContext = createContext();

// Global dispatch helper to allow direct `toast.success()` calls
let globalNotify = null;

export const toast = (message, options = {}) => {
  if (globalNotify) {
    globalNotify(message, options.type || 'info', options);
  } else {
    console.log('[Notification]:', message);
  }
};

toast.success = (message, options = {}) => {
  toast(message, { ...options, type: 'success' });
};

toast.error = (message, options = {}) => {
  toast(message, { ...options, type: 'error' });
};

toast.warning = (message, options = {}) => {
  toast(message, { ...options, type: 'warning' });
};

toast.info = (message, options = {}) => {
  toast(message, { ...options, type: 'info' });
};

export const NotificationProvider = ({ children }) => {
  const [notifications, setNotifications] = useState([]);

  const removeNotification = useCallback((id) => {
    setNotifications((prev) => prev.filter((item) => item.id !== id));
  }, []);

  const addNotification = useCallback((message, type = 'info', options = {}) => {
    const id = `notif-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
    const newNotif = {
      id,
      message,
      type,
      icon: options.icon
    };
    setNotifications((prev) => [newNotif, ...prev.slice(0, 4)]); // Limit max 5 on screen
  }, []);

  // Register global notify handler
  globalNotify = addNotification;

  return (
    <NotificationContext.Provider value={{ addNotification, removeNotification, notifications }}>
      {children}

      {/* Top-Left Notification Container */}
      <div className="notification-container" aria-live="polite" aria-atomic="true">
        <AnimatePresence>
          {notifications.map((notif) => (
            <NotificationItem
              key={notif.id}
              id={notif.id}
              message={notif.message}
              type={notif.type}
              icon={notif.icon}
              onDismiss={removeNotification}
            />
          ))}
        </AnimatePresence>
      </div>
    </NotificationContext.Provider>
  );
};

export const useNotification = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotification must be used within a NotificationProvider');
  }
  return context;
};

export default NotificationProvider;
