import React, { useState } from 'react';
import { FaEnvelope, FaLock, FaEye, FaEyeSlash, FaSignInAlt, FaSpinner } from 'react-icons/fa';
import { useAuth } from '../../context/AuthContext';

const LoginForm = () => {
  const { login, loading, setAuthTab } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) return;
    await login(email, password);
  };

  return (
    <form className="auth-form" onSubmit={handleSubmit}>
      <div className="auth-form-header">
        <h3 className="auth-form-title">Welcome Back</h3>
        <p className="auth-form-subtitle">Log in to access the Anugraha Admin Portal</p>
      </div>

      <div className="auth-input-group">
        <label className="auth-input-label" htmlFor="admin-login-email">
          Email Address
        </label>
        <div className="auth-input-wrapper">
          <FaEnvelope className="auth-input-icon" />
          <input
            id="admin-login-email"
            type="email"
            className="auth-input"
            placeholder="admin@anugraha.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            autoComplete="email"
          />
        </div>
      </div>

      <div className="auth-input-group">
        <div className="auth-label-row">
          <label className="auth-input-label" htmlFor="admin-login-password">
            Password
          </label>
        </div>
        <div className="auth-input-wrapper">
          <FaLock className="auth-input-icon" />
          <input
            id="admin-login-password"
            type={showPassword ? 'text' : 'password'}
            className="auth-input"
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            autoComplete="current-password"
          />
          <button
            type="button"
            className="password-toggle-btn"
            onClick={() => setShowPassword(!showPassword)}
            aria-label={showPassword ? 'Hide password' : 'Show password'}
          >
            {showPassword ? <FaEyeSlash /> : <FaEye />}
          </button>
        </div>
      </div>

      <div className="auth-options-row">
        <label className="remember-checkbox-label">
          <input
            type="checkbox"
            checked={rememberMe}
            onChange={(e) => setRememberMe(e.target.checked)}
          />
          <span>Remember session</span>
        </label>
      </div>

      <button type="submit" className="auth-submit-btn" disabled={loading}>
        {loading ? (
          <>
            <FaSpinner className="spinner-icon" />
            <span>Authenticating...</span>
          </>
        ) : (
          <>
            <FaSignInAlt />
            <span>Log In to Admin Portal</span>
          </>
        )}
      </button>

      {/* <div className="auth-switch-footer">
        <span>Don't have an admin account?</span>{' '}
        <button
          type="button"
          className="auth-switch-link"
          onClick={() => setAuthTab('register')}
        >
          Create Account
        </button>
      </div> */}
    </form>
  );
};

export default LoginForm;
