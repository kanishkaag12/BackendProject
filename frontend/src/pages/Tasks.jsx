import React, { useState, useEffect, useCallback } from 'react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import Modal from '../components/Modal';
import { 
  Plus, 
  Search, 
  SlidersHorizontal, 
  Edit3, 
  Trash2, 
  ChevronLeft, 
  ChevronRight, 
  AlertCircle, 
  CheckCircle,
  FileText,
  Calendar,
  User as UserIcon
} from 'lucide-react';

const Tasks = () => {
  const { user } = useAuth();
  
  // State variables
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [successMsg, setSuccessMsg] = useState('');
  
  // Filter & Search states
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalTasks, setTotalTasks] = useState(0);
  const limit = 6;

  // Modal States
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalType, setModalType] = useState('create'); // 'create' or 'edit'
  const [currentTask, setCurrentTask] = useState(null);
  
  // Form States
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [status, setStatus] = useState('pending');
  const [isSaving, setIsSaving] = useState(false);

  // Fetch Tasks with query filters
  const fetchTasks = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const statusParam = statusFilter ? `&status=${statusFilter}` : '';
      const searchParam = search ? `&search=${search}` : '';
      
      const response = await api.get(`/tasks?page=${page}&limit=${limit}${statusParam}${searchParam}`);
      const { tasks: fetchedTasks, pagination } = response.data.data;
      
      setTasks(fetchedTasks);
      setTotalPages(pagination.totalPages);
      setTotalTasks(pagination.total);
    } catch (err) {
      setError('Failed to fetch tasks. Please reload.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [page, statusFilter, search]);

  useEffect(() => {
    // Fetch tasks whenever filters change
    fetchTasks();
  }, [fetchTasks]);

  // Handle auto fade-out for success messages
  useEffect(() => {
    if (successMsg) {
      const timer = setTimeout(() => setSuccessMsg(''), 4000);
      return () => clearTimeout(timer);
    }
  }, [successMsg]);

  // Open modal for task creation
  const handleOpenCreateModal = () => {
    setModalType('create');
    setCurrentTask(null);
    setTitle('');
    setDescription('');
    setStatus('pending');
    setIsModalOpen(true);
  };

  // Open modal for task editing
  const handleOpenEditModal = (task) => {
    setModalType('edit');
    setCurrentTask(task);
    setTitle(task.title);
    setDescription(task.description || '');
    setStatus(task.status);
    setIsModalOpen(true);
  };

  // Handle Form Submission
  const handleFormSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim()) {
      setError('Task title is required');
      return;
    }

    setIsSaving(true);
    setError(null);

    try {
      if (modalType === 'create') {
        await api.post('/tasks', { title, description, status });
        setSuccessMsg('Task created successfully!');
      } else if (modalType === 'edit') {
        await api.put(`/tasks/${currentTask.id}`, { title, description, status });
        setSuccessMsg('Task updated successfully!');
      }
      setIsModalOpen(false);
      fetchTasks();
    } catch (err) {
      setError(err.response?.data?.message || 'Error saving task details.');
    } finally {
      setIsSaving(false);
    }
  };

  // Handle Task Deletion
  const handleDeleteTask = async (taskId) => {
    if (!window.confirm('Are you sure you want to delete this task?')) return;
    
    setError(null);
    try {
      await api.delete(`/tasks/${taskId}`);
      setSuccessMsg('Task deleted successfully!');
      fetchTasks();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to delete task.');
    }
  };

  // Quick inline status change handler
  const handleStatusChange = async (task, newStatus) => {
    setError(null);
    try {
      await api.put(`/tasks/${task.id}`, { status: newStatus });
      setSuccessMsg(`Status updated to ${newStatus}`);
      fetchTasks();
    } catch (err) {
      setError('Failed to update task status.');
    }
  };

  return (
    <div className="container fade-in">
      {/* Title Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h1 style={{ fontSize: '2.2rem', margin: 0, textAlign: 'left' }}>Task Workspace</h1>
          <p style={{ margin: '4px 0 0', fontSize: '1rem', color: 'var(--text-secondary)' }}>
            {user.role === 'admin' 
              ? `System Administrator view - Showing all database records (${totalTasks} tasks)` 
              : `Create, track, and complete your checklist (${totalTasks} tasks)`}
          </p>
        </div>
        <button onClick={handleOpenCreateModal} className="btn btn-primary">
          <Plus size={18} />
          <span>New Task</span>
        </button>
      </div>

      {/* Messages */}
      {successMsg && (
        <div className="alert alert-success">
          <CheckCircle size={18} />
          <span>{successMsg}</span>
        </div>
      )}

      {error && (
        <div className="alert alert-error">
          <AlertCircle size={18} />
          <span>{error}</span>
        </div>
      )}

      {/* Filtering and Search Controls */}
      <div className="glass-panel" style={{ padding: '20px', marginBottom: '32px', display: 'flex', gap: '16px', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between' }}>
        {/* Search */}
        <div style={{ position: 'relative', flex: 1, minWidth: '250px' }}>
          <Search size={18} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
          <input
            type="text"
            className="form-input"
            style={{ paddingLeft: '44px' }}
            placeholder="Search tasks..."
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
          />
        </div>

        {/* Filters */}
        <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', alignItems: 'center' }}>
          <SlidersHorizontal size={16} style={{ color: 'var(--text-secondary)' }} />
          <select
            className="form-select"
            style={{ width: '160px', padding: '10px 16px' }}
            value={statusFilter}
            onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
          >
            <option value="">All Statuses</option>
            <option value="pending">Pending</option>
            <option value="in-progress">In Progress</option>
            <option value="completed">Completed</option>
          </select>
        </div>
      </div>

      {/* Loading Indicator */}
      {loading ? (
        <div className="spinner-container">
          <div className="spinner"></div>
          <span>Syncing workspace data...</span>
        </div>
      ) : tasks.length === 0 ? (
        <div className="glass-panel" style={{ padding: '60px 20px', textAlign: 'center' }}>
          <FileText size={48} style={{ color: 'var(--text-muted)', marginBottom: '16px' }} />
          <h3 style={{ fontSize: '1.2rem', marginBottom: '8px' }}>No tasks found</h3>
          <p style={{ margin: 0, fontSize: '0.95rem' }}>Try refining your search terms or create a new task above.</p>
        </div>
      ) : (
        /* Tasks Cards Grid */
        <div>
          <div className="grid-3" style={{ marginBottom: '32px' }}>
            {tasks.map((task) => (
              <div 
                key={task.id} 
                className="glass-panel glass-card" 
                style={{ 
                  padding: '24px', 
                  textAlign: 'left', 
                  display: 'flex', 
                  flexDirection: 'column', 
                  justifyContent: 'space-between',
                  minHeight: '220px'
                }}
              >
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '12px', marginBottom: '12px' }}>
                    <span className={`badge badge-${task.status}`}>
                      {task.status}
                    </span>
                    
                    {/* Action buttons */}
                    <div style={{ display: 'flex', gap: '6px' }}>
                      <button 
                        onClick={() => handleOpenEditModal(task)} 
                        style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-secondary)' }}
                        title="Edit Task"
                      >
                        <Edit3 size={16} />
                      </button>
                      <button 
                        onClick={() => handleDeleteTask(task.id)} 
                        style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#fca5a5' }}
                        title="Delete Task"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>

                  <h3 style={{ fontSize: '1.2rem', color: '#fff', marginBottom: '8px', fontWeight: 600 }}>{task.title}</h3>
                  <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', margin: '0 0 16px', display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                    {task.description || <i>No description provided.</i>}
                  </p>
                </div>

                {/* Footer details */}
                <div style={{ borderTop: '1px solid rgba(255, 255, 255, 0.05)', paddingTop: '12px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {/* Status inline modifier */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Change Status:</span>
                    <select
                      className="form-select"
                      style={{ width: '120px', padding: '4px 8px', fontSize: '0.8rem', background: 'rgba(255, 255, 255, 0.02)' }}
                      value={task.status}
                      onChange={(e) => handleStatusChange(task, e.target.value)}
                    >
                      <option value="pending">Pending</option>
                      <option value="in-progress">In Progress</option>
                      <option value="completed">Completed</option>
                    </select>
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <Calendar size={12} />
                      <span>{new Date(task.createdAt).toLocaleDateString()}</span>
                    </div>

                    {/* Show Task Owner for Admins */}
                    {user.role === 'admin' && task.user && (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '4px', maxWidth: '120px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        <UserIcon size={12} />
                        <span title={task.user.name}>{task.user.name}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Pagination Controls */}
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

      {/* Task form Modal (Create / Edit) */}
      <Modal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        title={modalType === 'create' ? 'Create New Task' : 'Edit Task'}
      >
        <form onSubmit={handleFormSubmit}>
          <div className="form-group">
            <label className="form-label" htmlFor="task-title">Title</label>
            <input
              id="task-title"
              type="text"
              className="form-input"
              placeholder="e.g. Code database layer"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              disabled={isSaving}
              autoFocus
            />
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="task-description">Description</label>
            <textarea
              id="task-description"
              className="form-textarea"
              placeholder="Describe the task instructions..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              disabled={isSaving}
            />
          </div>

          <div className="form-group" style={{ marginBottom: '32px' }}>
            <label className="form-label" htmlFor="task-status">Status</label>
            <select
              id="task-status"
              className="form-select"
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              disabled={isSaving}
            >
              <option value="pending">Pending</option>
              <option value="in-progress">In Progress</option>
              <option value="completed">Completed</option>
            </select>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
            <button 
              type="button" 
              className="btn btn-secondary" 
              onClick={() => setIsModalOpen(false)}
              disabled={isSaving}
            >
              Cancel
            </button>
            <button 
              type="submit" 
              className="btn btn-primary"
              disabled={isSaving}
            >
              {isSaving ? (
                <>
                  <div className="spinner" style={{ width: '16px', height: '16px', borderLeftColor: '#fff' }}></div>
                  <span>Saving...</span>
                </>
              ) : 'Save Task'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default Tasks;
