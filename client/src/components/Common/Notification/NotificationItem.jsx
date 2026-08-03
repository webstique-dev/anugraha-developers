import React, { useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import {
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Info,
  X
} from 'lucide-react';
import './Notification.css';

const AUTO_DISMISS_DURATION = 3000; // 2 seconds

const getNotificationIcon = (type) => {
  switch (type) {
    case 'success':
      return <CheckCircle2 className="notif-icon notif-icon-success" size={20} />;
    case 'error':
      return <XCircle className="notif-icon notif-icon-error" size={20} />;
    case 'warning':
      return <AlertTriangle className="notif-icon notif-icon-warning" size={20} />;
    case 'info':
    default:
      return <Info className="notif-icon notif-icon-info" size={20} />;
  }
};

const NotificationItem = ({ id, message, type = 'info', icon, onDismiss }) => {
  const timerRef = useRef(null);

  const startTimer = () => {
    timerRef.current = setTimeout(() => {
      onDismiss(id);
    }, AUTO_DISMISS_DURATION);
  };

  const clearTimer = () => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  };

  useEffect(() => {
    startTimer();
    return () => clearTimer();
  }, [id, onDismiss]);

  const handleMouseEnter = () => {
    clearTimer();
  };

  const handleMouseLeave = () => {
    startTimer();
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, x: -50, scale: 0.92 }}
      animate={{ opacity: 1, x: 0, scale: 1 }}
      exit={{ opacity: 0, x: -50, scale: 0.92 }}
      transition={{ type: 'spring', damping: 25, stiffness: 350 }}
      className={`notification-item notif-${type}`}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <div className="notif-content">
        <span className="notif-icon-wrapper">
          {icon || getNotificationIcon(type)}
        </span>
        <span className="notif-message">{message}</span>
      </div>

      <button
        className="notif-close-btn"
        onClick={() => onDismiss(id)}
        aria-label="Close notification"
      >
        <X size={16} />
      </button>

      {/* Subtle timer progress line */}
      <div className="notif-progress-bar" />
    </motion.div>
  );
};

export default NotificationItem;
