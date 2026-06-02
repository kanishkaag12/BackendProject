import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { UserPlus, Mail, Lock, User as UserIcon, Shield, AlertCircle } from 'lucide-react';

const Register = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [role, setRole] = useState('user');
  const [formError, setFormError] = useState('');

  const { register, error, loading, setError } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    setError(null);
  }, [setError]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError('');

    if (!name || !email || !password || !confirmPassword) {
      setFormError('Please fill in all fields');
      return;
    }

    if (password !== confirmPassword) {
      setFormError('Passwords do not match');
      return;
    }

    // Password validation pattern matches the Joi schema in backend
    const passwordPattern = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/;
    if (password.length < 8) {
      setFormError('Password must be at least 8 characters');
      return;
    }
    if (!passwordPattern.test(password)) {
      setFormError('Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character');
      return;
    }

    try {
      await register(name, email, password, role);
      navigate('/dashboard');
    } catch (err) {
      // Handled by context
    }
  };

  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: '90vh',
      padding: '20px'
    }}>
      <div 
        className="glass-panel fade-in"
        style={{
          width: '100%',
          maxWidth: '460px',
          padding: '40px',
          textAlign: 'center',
        }}
      >
        <div style={{ display: 'inline-flex', padding: '12px', borderRadius: '50%', background: 'rgba(99, 102, 241, 0.1)', marginBottom: '20px', border: '1px solid rgba(99, 102, 241, 0.2)' }}>
          <UserPlus size={32} style={{ color: '#818cf8' }} />
        </div>
        
        <h1 style={{ fontSize: '2rem', marginBottom: '8px' }}>Create Account</h1>
        <p style={{ marginBottom: '28px', fontSize: '0.95rem' }}>Join SyncTask to start organizing your tasks</p>

        {(formError || error) && (
          <div className="alert alert-error">
            <AlertCircle size={18} />
            <span>{formError || error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label" htmlFor="name">Full Name</label>
            <div style={{ position: 'relative' }}>
              <UserIcon size={18} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
              <input
                id="name"
                type="text"
                className="form-input"
                style={{ paddingLeft: '44px' }}
                placeholder="John Doe"
                value={name}
                onChange={(e) => setName(e.target.value)}
                disabled={loading}
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="email">Email Address</label>
            <div style={{ position: 'relative' }}>
              <Mail size={18} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
              <input
                id="email"
                type="email"
                className="form-input"
                style={{ paddingLeft: '44px' }}
                placeholder="john@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={loading}
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="role">Role (for demonstration)</label>
            <div style={{ position: 'relative' }}>
              <Shield size={18} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
              <select
                id="role"
                className="form-select"
                style={{ paddingLeft: '44px', WebkitAppearance: 'none' }}
                value={role}
                onChange={(e) => setRole(e.target.value)}
                disabled={loading}
              >
                <option value="user">User (Own Task Management)</option>
                <option value="admin">Admin (All Tasks + Users)</option>
              </select>
            </div>
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="password">Password</label>
            <div style={{ position: 'relative' }}>
              <Lock size={18} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
              <input
                id="password"
                type="password"
                className="form-input"
                style={{ paddingLeft: '44px' }}
                placeholder="Min 8 characters w/ mixed symbols"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={loading}
              />
            </div>
          </div>

          <div className="form-group" style={{ marginBottom: '28px' }}>
            <label className="form-label" htmlFor="confirmPassword">Confirm Password</label>
            <div style={{ position: 'relative' }}>
              <Lock size={18} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
              <input
                id="confirmPassword"
                type="password"
                className="form-input"
                style={{ paddingLeft: '44px' }}
                placeholder="Repeat password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
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
                <span>Creating Account...</span>
              </>
            ) : 'Sign Up'}
          </button>
        </form>

        <div style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
          Already have an account?{' '}
          <Link to="/login" style={{ color: 'var(--accent-primary)', textDecoration: 'none', fontWeight: 600 }}>
            Sign In
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Register;
