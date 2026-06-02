import React, { useState, useEffect, useCallback } from 'react';
import api from '../services/api';
import { 
  Users, 
  Calendar, 
  Eye, 
  ShieldCheck, 
  User, 
  AlertCircle,
  ChevronLeft,
  ChevronRight,
  ListTodo
} from 'lucide-react';
import Modal from '../components/Modal';

const Admin = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Pagination
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalUsers, setTotalUsers] = useState(0);
  const limit = 8;

  // Selected User Detail Modal
  const [selectedUser, setSelectedUser] = useState(null);
  const [userDetailLoading, setUserDetailLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.get(`/admin/users?page=${page}&limit=${limit}`);
      const { users: fetchedUsers, pagination } = response.data.data;
      
      setUsers(fetchedUsers);
      setTotalPages(pagination.totalPages);
      setTotalUsers(pagination.total);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch registered user list.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [page]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  // Fetch full details of a specific user (including their tasks)
  const handleInspectUser = async (userId) => {
    setUserDetailLoading(true);
    setIsModalOpen(true);
    setError(null);
    try {
      const response = await api.get(`/admin/users/${userId}`);
      setSelectedUser(response.data.data.user);
    } catch (err) {
      setError('Could not fetch specific user data.');
      setIsModalOpen(false);
    } finally {
      setUserDetailLoading(false);
    }
  };

  return (
    <div className="container fade-in">
      {/* Title Header */}
      <div style={{ textAlign: 'left', marginBottom: '32px' }}>
        <h1 style={{ fontSize: '2.2rem', margin: 0, textAlign: 'left' }}>Admin Panel</h1>
        <p style={{ margin: '4px 0 0', fontSize: '1rem', color: 'var(--text-secondary)' }}>
          Manage global application users and monitor user activity. Total users: {totalUsers}
        </p>
      </div>

      {error && (
        <div className="alert alert-error">
          <AlertCircle size={18} />
          <span>{error}</span>
        </div>
      )}

      {/* Loading Indicator */}
      {loading ? (
        <div className="spinner-container">
          <div className="spinner"></div>
          <span>Syncing global user records...</span>
        </div>
      ) : (
        /* Users Table */
        <div className="glass-panel" style={{ padding: '24px' }}>
          <div className="table-container">
            <table className="custom-table">
              <thead>
                <tr>
                  <th>User Details</th>
                  <th>Role</th>
                  <th>Registration Date</th>
                  <th style={{ textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map((u) => (
                  <tr key={u.id}>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: 'rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          <User size={14} style={{ color: 'var(--text-secondary)' }} />
                        </div>
                        <div>
                          <div style={{ fontWeight: 600, color: '#fff' }}>{u.name}</div>
                          <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{u.email}</div>
                        </div>
                      </div>
                    </td>
                    <td>
                      <span className={`badge ${u.role === 'admin' ? 'badge-admin' : 'badge-user'}`}>
                        {u.role}
                      </span>
                    </td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--text-secondary)' }}>
                        <Calendar size={14} />
                        <span>{new Date(u.createdAt).toLocaleDateString()}</span>
                      </div>
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <button 
                        onClick={() => handleInspectUser(u.id)}
                        className="btn btn-secondary" 
                        style={{ padding: '6px 12px', fontSize: '0.85rem' }}
                      >
                        <Eye size={14} />
                        <span>Inspect Tasks</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '16px', marginTop: '24px' }}>
              <button 
                className="btn btn-secondary" 
                style={{ padding: '8px 12px' }}
                onClick={() => setPage(p => Math.max(p - 1, 1))}
                disabled={page === 1}
              >
                <ChevronLeft size={16} />
                <span>Prev</span>
              </button>
              <span style={{ color: 'var(--text-secondary)', fontSize: '0.95rem' }}>
                Page <b>{page}</b> of <b>{totalPages}</b>
              </span>
              <button 
                className="btn btn-secondary" 
                style={{ padding: '8px 12px' }}
                onClick={() => setPage(p => Math.min(p + 1, totalPages))}
                disabled={page === totalPages}
              >
                <span>Next</span>
                <ChevronRight size={16} />
              </button>
            </div>
          )}
        </div>
      )}

      {/* User Task Inspector Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => { setIsModalOpen(false); setSelectedUser(null); }}
        title="Inspect User Workspace"
      >
        {userDetailLoading || !selectedUser ? (
          <div className="spinner-container">
            <div className="spinner"></div>
            <span>Fetching user workspace details...</span>
          </div>
        ) : (
          <div>
            {/* User Meta */}
            <div style={{ display: 'flex', gap: '16px', alignItems: 'center', paddingBottom: '20px', borderBottom: '1px solid rgba(255,255,255,0.05)', marginBottom: '20px' }}>
              <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: 'rgba(99, 102, 241, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid rgba(99, 102, 241, 0.2)' }}>
                <ShieldCheck size={24} style={{ color: '#818cf8' }} />
              </div>
              <div style={{ textAlign: 'left' }}>
                <h3 style={{ margin: 0, fontSize: '1.15rem', color: '#fff' }}>{selectedUser.name}</h3>
                <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>{selectedUser.email}</div>
                <span className={`badge ${selectedUser.role === 'admin' ? 'badge-admin' : 'badge-user'}`} style={{ marginTop: '6px' }}>
                  {selectedUser.role}
                </span>
              </div>
            </div>

            {/* Task list summary */}
            <h4 style={{ color: '#fff', fontSize: '1rem', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <ListTodo size={16} />
              <span>Workspace Checklist ({selectedUser.tasks?.length || 0} Tasks)</span>
            </h4>

            {selectedUser.tasks?.length === 0 ? (
              <p style={{ fontStyle: 'italic', color: 'var(--text-muted)', fontSize: '0.9rem', textAlign: 'center', margin: '20px 0' }}>
                This user has not created any tasks yet.
              </p>
            ) : (
              <div style={{ maxHeight: '250px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '10px', paddingRight: '4px' }}>
                {selectedUser.tasks?.map(task => (
                  <div 
                    key={task.id} 
                    style={{ 
                      padding: '12px 16px', 
                      background: 'rgba(255,255,255,0.02)', 
                      border: '1px solid rgba(255,255,255,0.05)', 
                      borderRadius: '8px',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center'
                    }}
                  >
                    <div style={{ textAlign: 'left' }}>
                      <div style={{ fontWeight: 500, fontSize: '0.9rem', color: '#fff' }}>{task.title}</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                        Created {new Date(task.createdAt).toLocaleDateString()}
                      </div>
                    </div>
                    <span className={`badge badge-${task.status}`}>
                      {task.status}
                    </span>
                  </div>
                ))}
              </div>
            )}

            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '28px' }}>
              <button 
                className="btn btn-secondary" 
                onClick={() => { setIsModalOpen(false); setSelectedUser(null); }}
              >
                Close Inspector
              </button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default Admin;
