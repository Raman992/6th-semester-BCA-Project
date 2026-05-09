import React, { useState, useEffect } from 'react';
import { useAdmin } from '../../context/AdminContext';
import { useNavigate } from 'react-router-dom';
import './admin.css';

const AdminLogin = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { loginAsAdmin, isAdmin, checking } = useAdmin();
  const navigate = useNavigate();

  useEffect(() => {
    if (isAdmin) {
      navigate('/admin/dashboard', { replace: true });
    }
  }, [isAdmin, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    const result = await loginAsAdmin(email, password);

    if (!result.success) {
      setError(result.error || 'Invalid admin credentials');
    } else {
      navigate('/admin/dashboard', { replace: true });
    }
  };

  return (
    <div className="login-container">
      <div className="login-panel">
        <div className="login-header">
          <div className="login-logo">Admin Panel</div>
          <p className="login-subtitle">[+] Admin access only</p>
        </div>

        <form onSubmit={handleSubmit} className="login-form">
          <div>
            <label className="input-label">Email Address</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="login-input"
              placeholder="admin@example.com"
              required
            />
          </div>

          <div>
            <label className="input-label">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="login-input"
              placeholder="••••••••"
              required
            />
          </div>

          {error && (
            <div className="login-error">
              [x] {error}
            </div>
          )}

          <button
            type="submit"
            disabled={checking}
            className="login-btn"
          >
            {checking ? 'Verifying...' : 'Sign In as Admin'}
          </button>
        </form>

        <a href="/" className="login-back">
          ← Back to main site
        </a>
      </div>
    </div>
  );
};

export default AdminLogin;