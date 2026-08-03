import React, { useState } from 'react';
import { FaUser, FaEnvelope, FaLock, FaEye, FaEyeSlash, FaUserPlus, FaSpinner } from 'react-icons/fa';
import { toast } from '../Common/Notification/NotificationProvider';
import { useAuth } from '../../context/AuthContext';

const RegisterForm = () => {
  const { register, loading, setAuthTab } = useAuth();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log('Submitting Admin Account Creation Form:', { name, email, passwordLength: password?.length });

    if (!name || !email || !password || !confirmPassword) {
      const errMsg = 'Please fill in all required fields';
      console.error('Form Validation Error:', errMsg);
      toast.error(errMsg);
      return;
    }

    if (password !== confirmPassword) {
      const errMsg = 'Passwords do not match';
      console.error('Form Validation Error:', errMsg);
      toast.error(errMsg);
      return;
    }

    if (password.length < 6) {
      const errMsg = 'Password must be at least 6 characters long';
      console.error('Form Validation Error:', errMsg);
      toast.error(errMsg);
      return;
    }

    try {
      const success = await register(name, email, password);
      if (success) {
        console.log('Admin account created successfully for:', email);
      } else {
        console.error('Account creation failed for:', email);
      }
    } catch (err) {
      console.error('Registration exception caught:', err);
    }
  };

  return (
    <form className="auth-form" onSubmit={handleSubmit}>
      <div className="auth-form-header">
        <h3 className="auth-form-title">Create Admin Account</h3>
        <p className="auth-form-subtitle">Register a new administrator for Anugraha Developers</p>
      </div>

      <div className="auth-input-group">
        <label className="auth-input-label" htmlFor="admin-reg-name">
          Full Name
        </label>
        <div className="auth-input-wrapper">
          <FaUser className="auth-input-icon" />
          <input
            id="admin-reg-name"
            type="text"
            className="auth-input"
            placeholder="e.g. Anand Kumar"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            autoComplete="name"
          />
        </div>
      </div>

      <div className="auth-input-group">
        <label className="auth-input-label" htmlFor="admin-reg-email">
          Email Address
        </label>
        <div className="auth-input-wrapper">
          <FaEnvelope className="auth-input-icon" />
          <input
            id="admin-reg-email"
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
        <label className="auth-input-label" htmlFor="admin-reg-password">
          Password
        </label>
        <div className="auth-input-wrapper">
          <FaLock className="auth-input-icon" />
          <input
            id="admin-reg-password"
            type={showPassword ? 'text' : 'password'}
            className="auth-input"
            placeholder="Min. 6 characters"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            autoComplete="new-password"
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

      <div className="auth-input-group">
        <label className="auth-input-label" htmlFor="admin-reg-confirm">
          Confirm Password
        </label>
        <div className="auth-input-wrapper">
          <FaLock className="auth-input-icon" />
          <input
            id="admin-reg-confirm"
            type={showPassword ? 'text' : 'password'}
            className="auth-input"
            placeholder="Re-enter password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
            autoComplete="new-password"
          />
        </div>
      </div>

      <button type="submit" className="auth-submit-btn" disabled={loading}>
        {loading ? (
          <>
            <FaSpinner className="spinner-icon" />
            <span>Creating Account...</span>
          </>
        ) : (
          <>
            <FaUserPlus />
            <span>Create Admin Account</span>
          </>
        )}
      </button>

      <div className="auth-switch-footer">
        <span>Already have an admin account?</span>{' '}
        <button
          type="button"
          className="auth-switch-link"
          onClick={() => setAuthTab('login')}
        >
          Log In
        </button>
      </div>
    </form>
  );
};

export default RegisterForm;
