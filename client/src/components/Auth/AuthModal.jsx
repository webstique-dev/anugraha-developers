import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaTimes, FaUserShield, FaSignInAlt, FaUserPlus } from 'react-icons/fa';
import { useAuth } from '../../context/AuthContext';
import LoginForm from './LoginForm';
import RegisterForm from './RegisterForm';
import logoPng from '../../assets/logo/logo.png';
import './AuthModal.css';

const AuthModal = () => {
  const { isAuthModalOpen, closeAuthModal, authTab, setAuthTab } = useAuth();

  if (!isAuthModalOpen) return null;

  return (
    <AnimatePresence>
      <div className="auth-modal-root">
        {/* Glassmorphism Backdrop Overlay */}
        <motion.div
          className="auth-modal-backdrop"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={closeAuthModal}
        />

        {/* Auth Modal Container */}
        <motion.div
          className="auth-modal-card"
          initial={{ opacity: 0, scale: 0.94, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.94, y: 20 }}
          transition={{ type: 'spring', damping: 25, stiffness: 300 }}
        >
          {/* Top Brand Header */}
          <div className="auth-modal-brand-header">
            <div className="auth-brand-info">
              <img src={logoPng} alt="Anugraha Developers Logo" className="auth-logo-img" />
              <div>
                <div className="auth-brand-title">ANUGRAHA</div>
                <div className="auth-brand-subtitle">ADMIN PORTAL</div>
              </div>
            </div>
            <button
              className="auth-modal-close-btn"
              onClick={closeAuthModal}
              aria-label="Close authentication modal"
            >
              <FaTimes />
            </button>
          </div>

          {/* Tab Navigation Header */}
          <div className="auth-tabs-nav">
            <button
              className={`auth-tab-btn ${authTab === 'login' ? 'active' : ''}`}
              onClick={() => setAuthTab('login')}
            >
              <FaSignInAlt />
              <span>Log In</span>
            </button>
            <button
              className={`auth-tab-btn ${authTab === 'register' ? 'active' : ''}`}
              onClick={() => setAuthTab('register')}
            >
              <FaUserPlus />
              <span>Create Account</span>
            </button>
          </div>

          {/* Tab Form Content */}
          <div className="auth-modal-body">
            <AnimatePresence mode="wait">
              <motion.div
                key={authTab}
                initial={{ opacity: 0, x: authTab === 'login' ? -15 : 15 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: authTab === 'login' ? 15 : -15 }}
                transition={{ duration: 0.2 }}
              >
                {authTab === 'login' ? <LoginForm /> : <RegisterForm />}
              </motion.div>
            </AnimatePresence>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default AuthModal;
