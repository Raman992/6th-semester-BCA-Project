import React, { useState, useEffect } from 'react';
import { useAdmin } from '../../context/AdminContext';
import { useNavigate } from 'react-router-dom';
import { Lock } from 'lucide-react';
import './admin.css';

const AdminLogin = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { loginAsAdmin, isAdmin, loading, checking } = useAdmin();
  const navigate = useNavigate();

  // Redirect if already logged in as admin
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
    <div className="min-h-screen bg-slate-900 flex items-center justify-center" style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #0f172a 0%, #1e1b4b 50%, #312e81 100%)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '20px'
    }}>
      <div className="admin-panel" style={{
        maxWidth: '480px',
        width: '100%',
        margin: '0 auto'
      }}>
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center"
              style={{
                width: '64px',
                height: '64px',
                borderRadius: '16px',
                background: 'linear-gradient(135deg, #a855f7, #ec4899)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 8px 24px rgba(168, 85, 247, 0.4)'
              }}>
              <Lock size={32} color="white" />
            </div>
          </div>
          <h1 className="text-3xl font-bold text-white" style={{
            fontSize: '1.875rem',
            fontWeight: '700',
            color: '#f8fafc'
          }}>Admin Panel</h1>
          <p className="text-gray-400 mt-2" style={{
            color: '#94a3b8',
            marginTop: '8px'
          }}>Admin access only</p>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="mb-6">
            <label className="block text-gray-300 text-sm font-bold mb-2" style={{
              color: '#cbd5e1',
              fontSize: '0.875rem',
              fontWeight: '600',
              marginBottom: '8px'
            }}>
              Email Address
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="modal-input"
              style={{
                width: '100%',
                padding: '14px 18px',
                borderRadius: '12px',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                background: 'rgba(15, 23, 42, 0.8)',
                color: 'white',
                fontSize: '1rem',
                outline: 'none',
                transition: 'all 0.25s ease',
                boxSizing: 'border-box'
              }}
              onFocus={(e) => {
                e.target.style.borderColor = '#a855f7';
                e.target.style.boxShadow = '0 0 0 4px rgba(168, 85, 247, 0.15)';
              }}
              onBlur={(e) => {
                e.target.style.borderColor = 'rgba(255, 255, 255, 0.1)';
                e.target.style.boxShadow = 'none';
              }}
              required
            />
          </div>

          <div className="mb-6">
            <label className="block text-gray-300 text-sm font-bold mb-2" style={{
              color: '#cbd5e1',
              fontSize: '0.875rem',
              fontWeight: '600',
              marginBottom: '8px'
            }}>
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="modal-input"
              style={{
                width: '100%',
                padding: '14px 18px',
                borderRadius: '12px',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                background: 'rgba(15, 23, 42, 0.8)',
                color: 'white',
                fontSize: '1rem',
                outline: 'none',
                transition: 'all 0.25s ease',
                boxSizing: 'border-box'
              }}
              onFocus={(e) => {
                e.target.style.borderColor = '#a855f7';
                e.target.style.boxShadow = '0 0 0 4px rgba(168, 85, 247, 0.15)';
              }}
              onBlur={(e) => {
                e.target.style.borderColor = 'rgba(255, 255, 255, 0.1)';
                e.target.style.boxShadow = 'none';
              }}
              required
            />
          </div>

          {error && (
            <div className="mb-6 error-banner" style={{
              background: 'rgba(239, 68, 68, 0.15)',
              border: '1px solid rgba(239, 68, 68, 0.4)',
              borderRadius: '12px',
              padding: '14px 18px'
            }}>
              <p className="text-red-400 text-sm" style={{
                color: '#f87171',
                fontSize: '0.875rem'
              }}>{error}</p>
            </div>
          )}

          <button
            type="submit"
            disabled={checking}
            className="w-full"
            style={{
              width: '100%',
              padding: '14px 24px',
              background: checking
                ? 'rgba(168, 85, 247, 0.5)'
                : 'linear-gradient(135deg, #a855f7 0%, #c084fc 100%)',
              color: 'white',
              border: 'none',
              borderRadius: '12px',
              fontSize: '1rem',
              fontWeight: '600',
              cursor: checking ? 'not-allowed' : 'pointer',
              opacity: checking ? 0.6 : 1,
              transition: 'all 0.25s ease',
              boxShadow: checking ? 'none' : '0 4px 16px rgba(168, 85, 247, 0.3)'
            }}
            onMouseEnter={(e) => {
              if (!checking) {
                e.target.style.transform = 'translateY(-2px)';
                e.target.style.boxShadow = '0 8px 24px rgba(168, 85, 247, 0.4)';
              }
            }}
            onMouseLeave={(e) => {
              if (!checking) {
                e.target.style.transform = 'translateY(0)';
                e.target.style.boxShadow = '0 4px 16px rgba(168, 85, 247, 0.3)';
              }
            }}
          >
            {checking ? 'Verifying...' : 'Sign In as Admin'}
          </button>
        </form>

        <div className="mt-6 text-center">
          <a href="/" className="text-purple-400 hover:text-purple-300 text-sm" style={{
            color: '#c084fc',
            fontSize: '0.875rem',
            textDecoration: 'none',
            transition: 'color 0.2s ease'
          }}
          onMouseEnter={(e) => e.target.style.color = '#e9d5ff'}
          onMouseLeave={(e) => e.target.style.color = '#c084fc'}
          >
            ← Back to main site
          </a>
        </div>
      </div>
    </div>
  );
};

export default AdminLogin;