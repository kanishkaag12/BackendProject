import React, { useState, useEffect } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { LogIn, Mail, Lock, AlertCircle, CheckCircle2 } from 'lucide-react';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [formError, setFormError] = useState('');
  const [sessionExpired, setSessionExpired] = useState(false);
  
  const { login, error, loading, setError } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    // Reset global auth error when component mounts
    setError(null);
    
    // Check if redirect was due to token expiry
    if (location.search.includes('expired=true')) {
      setSessionExpired(true);
    }
  }, [location.search, setError]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError('');
    setSessionExpired(false);

    if (!email || !password) {
      setFormError('Please fill in all fields');
      return;
    }

    try {
      await login(email, password);
      // Navigate to dashboard or original page user tried to visit
      const from = location.state?.from?.pathname || '/dashboard';
      navigate(from, { replace: true });
    } catch (err) {
      // Handled by context
    }
  };

  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: '85vh',
      padding: '20px'
    }}>
      <div 
        className="glass-panel fade-in"
        style={{
          width: '100%',
          maxWidth: '420px',
          padding: '40px',
          textAlign: 'center',
        }}
      >
        <div style={{ display: 'inline-flex', padding: '12px', borderRadius: '50%', background: 'rgba(99, 102, 241, 0.1)', marginBottom: '20px', border: '1px solid rgba(99, 102, 241, 0.2)' }}>
          <LogIn size={32} style={{ color: '#818cf8' }} />
        </div>
        
        <h1 style={{ fontSize: '2rem', marginBottom: '8px' }}>Welcome Back</h1>
        <p style={{ marginBottom: '28px', fontSize: '0.95rem' }}>Sign in to manage your tasks efficiently</p>

        {sessionExpired && (
          <div className="alert alert-success" style={{ backgroundColor: 'rgba(245, 158, 11, 0.1)', borderColor: 'rgba(245, 158, 11, 0.2)', color: '#fcd34d' }}>
            <AlertCircle size={18} />
            <span>Session expired. Please log in again.</span>
          </div>
        )}

        {(formError || error) && (
          <div className="alert alert-error">
            <AlertCircle size={18} />
            <span>{formError || error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label" htmlFor="email">Email Address</label>
            <div style={{ position: 'relative' }}>
              <Mail size={18} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
              <input
                id="email"
                type="email"
                className="form-input"
                style={{ paddingLeft: '44px' }}
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={loading}
              />
            </div>
          </div>

          <div className="form-group" style={{ marginBottom: '28px' }}>
            <label className="form-label" htmlFor="password">Password</label>
            <div style={{ position: 'relative' }}>
              <Lock size={18} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
              <input
                id="password"
                type="password"
                className="form-input"
                style={{ paddingLeft: '44px' }}
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={loading}
              />
            </div>
          </div>

          <button 
            type="submit" 
            className="btn btn-primary"
            style={{ width: '100%', padding: '12px', fontSize: '1rem', marginBottom: '24px' }}
            disabled={loading}
          >
            {loading ? (
              <>
                <div className="spinner" style={{ width: '16px', height: '16px', borderLeftColor: '#fff' }}></div>
                <span>Signing In...</span>
              </>
            ) : 'Sign In'}
          </button>
        </form>

        <div style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
          Don't have an account?{' '}
          <Link to="/register" style={{ color: 'var(--accent-primary)', textDecoration: 'none', fontWeight: 600 }}>
            Create Account
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Login;
