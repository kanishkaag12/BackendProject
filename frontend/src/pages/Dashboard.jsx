import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import { 
  CheckSquare, 
  Clock, 
  TrendingUp, 
  Users, 
  Plus, 
  ShieldAlert, 
  ListTodo, 
  CheckCircle,
  AlertCircle
} from 'lucide-react';

const Dashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    inProgress: 0,
    completed: 0,
  });
  const [adminStats, setAdminStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchDashboardData = async () => {
      setLoading(true);
      setError(null);
      try {
        // Fetch user tasks stats (filtered by status)
        const tasksRes = await api.get('/tasks?limit=100');
        const tasks = tasksRes.data.data.tasks;
        
        const counts = {
          total: tasks.length,
          pending: tasks.filter(t => t.status === 'pending').length,
          inProgress: tasks.filter(t => t.status === 'in-progress').length,
          completed: tasks.filter(t => t.status === 'completed').length,
        };
        setStats(counts);

        // Fetch admin metrics if role is admin
        if (user.role === 'admin') {
          const adminRes = await api.get('/admin/dashboard');
          const data = adminRes.data.data;
          
          let pendingAdmin = 0, progressAdmin = 0, completedAdmin = 0;
          data.tasksByStatus.forEach(statusCount => {
            if (statusCount.status === 'pending') pendingAdmin = parseInt(statusCount.count);
            if (statusCount.status === 'in-progress') progressAdmin = parseInt(statusCount.count);
            if (statusCount.status === 'completed') completedAdmin = parseInt(statusCount.count);
          });

          setAdminStats({
            totalUsers: data.totalUsers,
            totalTasks: data.totalTasks,
            pending: pendingAdmin,
            inProgress: progressAdmin,
            completed: completedAdmin,
          });
        }
      } catch (err) {
        setError('Failed to fetch dashboard data. Please try again later.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [user.role]);

  if (loading) {
    return (
      <div className="container">
        <div className="spinner-container">
          <div className="spinner"></div>
          <span>Loading Dashboard metrics...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="container fade-in">
      {/* Welcome Banner */}
      <div 
        className="glass-panel" 
        style={{ 
          padding: '36px', 
          marginBottom: '32px', 
          textAlign: 'left',
          position: 'relative',
          overflow: 'hidden',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '20px'
        }}
      >
        <div style={{ zIndex: 1 }}>
          <h1 style={{ fontSize: '2.2rem', marginBottom: '8px', textAlign: 'left' }}>
            Hello, {user.name}!
          </h1>
          <p style={{ margin: 0, fontSize: '1.1rem' }}>
            {user.role === 'admin' 
              ? 'Administrator account active. System statistics are available below.' 
              : 'Keep track of your tasks and boost your productivity today.'}
          </p>
        </div>
        <div style={{ display: 'flex', gap: '12px', zIndex: 1 }}>
          <Link to="/tasks" className="btn btn-primary">
            <Plus size={18} />
            <span>Manage Tasks</span>
          </Link>
          {user.role === 'admin' && (
            <Link to="/admin" className="btn btn-secondary">
              <Users size={18} />
              <span>Manage Users</span>
            </Link>
          )}
        </div>
        {/* Subtle decorative glow */}
        <div style={{
          position: 'absolute',
          right: '-50px',
          top: '-50px',
          width: '200px',
          height: '200px',
          background: 'rgba(99, 102, 241, 0.15)',
          borderRadius: '50%',
          filter: 'blur(50px)',
          zIndex: 0
        }}></div>
      </div>

      {error && (
        <div className="alert alert-error">
          <AlertCircle size={18} />
          <span>{error}</span>
        </div>
      )}

      {/* Admin Panel Metrics */}
      {user.role === 'admin' && adminStats && (
        <div style={{ marginBottom: '40px' }}>
          <h2 style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '1.4rem', color: '#fff', marginBottom: '20px' }}>
            <ShieldAlert size={20} style={{ color: '#818cf8' }} />
            <span>System Analytics (Admin Overview)</span>
          </h2>
          <div className="grid-3">
            <div className="glass-panel glass-card" style={{ padding: '24px', textAlign: 'left' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                <span style={{ color: 'var(--text-secondary)', fontWeight: 500, fontSize: '0.9rem', textTransform: 'uppercase' }}>Total Users</span>
                <Users size={20} style={{ color: '#818cf8' }} />
              </div>
              <div style={{ fontSize: '2.5rem', fontWeight: 700, color: '#fff' }}>{adminStats.totalUsers}</div>
            </div>
            
            <div className="glass-panel glass-card" style={{ padding: '24px', textAlign: 'left' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                <span style={{ color: 'var(--text-secondary)', fontWeight: 500, fontSize: '0.9rem', textTransform: 'uppercase' }}>System Tasks</span>
                <ListTodo size={20} style={{ color: '#10b981' }} />
              </div>
              <div style={{ fontSize: '2.5rem', fontWeight: 700, color: '#fff' }}>{adminStats.totalTasks}</div>
            </div>

            <div className="glass-panel glass-card" style={{ padding: '24px', textAlign: 'left' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                <span style={{ color: 'var(--text-secondary)', fontWeight: 500, fontSize: '0.9rem', textTransform: 'uppercase' }}>Completion Rate</span>
                <CheckCircle size={20} style={{ color: '#f59e0b' }} />
              </div>
              <div style={{ fontSize: '2.5rem', fontWeight: 700, color: '#fff' }}>
                {adminStats.totalTasks > 0 
                  ? `${Math.round((adminStats.completed / adminStats.totalTasks) * 100)}%` 
                  : '0%'}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* User Task Management Overview */}
      <h2 style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '1.4rem', color: '#fff', marginBottom: '20px' }}>
        <ListTodo size={20} style={{ color: '#818cf8' }} />
        <span>{user.role === 'admin' ? 'Your Personal Tasks Overview' : 'Tasks Summary'}</span>
      </h2>
      
      <div className="grid-3" style={{ marginBottom: '40px' }}>
        {/* Total Tasks Card */}
        <div className="glass-panel glass-card" style={{ padding: '24px', textAlign: 'left', borderLeft: '4px solid #6366f1' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
            <span style={{ color: 'var(--text-secondary)', fontWeight: 500, fontSize: '0.85rem', textTransform: 'uppercase' }}>Total Tasks</span>
            <CheckSquare size={20} style={{ color: '#6366f1' }} />
          </div>
          <div style={{ fontSize: '2rem', fontWeight: 700, color: '#fff', marginBottom: '8px' }}>{stats.total}</div>
          <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Created in the platform</div>
        </div>

        {/* Pending Card */}
        <div className="glass-panel glass-card" style={{ padding: '24px', textAlign: 'left', borderLeft: '4px solid #f59e0b' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
            <span style={{ color: 'var(--text-secondary)', fontWeight: 500, fontSize: '0.85rem', textTransform: 'uppercase' }}>Pending</span>
            <Clock size={20} style={{ color: '#f59e0b' }} />
          </div>
          <div style={{ fontSize: '2rem', fontWeight: 700, color: '#fff', marginBottom: '8px' }}>{stats.pending}</div>
          <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Awaiting action</div>
        </div>

        {/* In Progress Card */}
        <div className="glass-panel glass-card" style={{ padding: '24px', textAlign: 'left', borderLeft: '4px solid #3b82f6' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
            <span style={{ color: 'var(--text-secondary)', fontWeight: 500, fontSize: '0.85rem', textTransform: 'uppercase' }}>In Progress</span>
            <TrendingUp size={20} style={{ color: '#3b82f6' }} />
          </div>
          <div style={{ fontSize: '2rem', fontWeight: 700, color: '#fff', marginBottom: '8px' }}>{stats.inProgress}</div>
          <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Currently working on</div>
        </div>

        {/* Completed Card */}
        <div className="glass-panel glass-card" style={{ padding: '24px', textAlign: 'left', borderLeft: '4px solid #10b981' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
            <span style={{ color: 'var(--text-secondary)', fontWeight: 500, fontSize: '0.85rem', textTransform: 'uppercase' }}>Completed</span>
            <CheckCircle size={20} style={{ color: '#10b981' }} />
          </div>
          <div style={{ fontSize: '2rem', fontWeight: 700, color: '#fff', marginBottom: '8px' }}>{stats.completed}</div>
          <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Successfully resolved</div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
