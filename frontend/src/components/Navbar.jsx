import React from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { CheckSquare, LayoutDashboard, ListTodo, ShieldAlert, LogOut, User as UserIcon } from 'lucide-react';

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  if (!user) return null;

  return (
    <nav className="navbar glass-panel">
      <Link to="/dashboard" className="nav-logo">
        <CheckSquare size={24} className="text-accent-primary" style={{ stroke: '#6366f1' }} />
        <span>SyncTask</span>
      </Link>

      <div className="nav-links">
        <NavLink 
          to="/dashboard" 
          className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
          style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
        >
          <LayoutDashboard size={16} />
          <span>Dashboard</span>
        </NavLink>
        <NavLink 
          to="/tasks" 
          className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
          style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
        >
          <ListTodo size={16} />
          <span>Tasks</span>
        </NavLink>
        {user.role === 'admin' && (
          <NavLink 
            to="/admin" 
            className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
            style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
          >
            <ShieldAlert size={16} />
            <span>Admin Panel</span>
          </NavLink>
        )}
      </div>

      <div className="nav-user">
        <div className="nav-user-info" style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: 'rgba(99, 102, 241, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid rgba(99, 102, 241, 0.3)' }}>
            <UserIcon size={18} style={{ color: '#818cf8' }} />
          </div>
          <div className="nav-user-info-text">
            <div className="nav-user-name">{user.name}</div>
            <span className={`badge ${user.role === 'admin' ? 'badge-admin' : 'badge-user'}`}>
              {user.role}
            </span>
          </div>
        </div>
        <button onClick={handleLogout} className="btn btn-secondary" style={{ padding: '8px 12px' }} title="Log Out">
          <LogOut size={16} />
        </button>
      </div>
    </nav>
  );
};

export default Navbar;
