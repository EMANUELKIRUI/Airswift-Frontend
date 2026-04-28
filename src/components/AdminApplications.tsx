import React, { useState, useEffect, useCallback } from 'react';
import api from '@/lib/api';
import { getSocket } from '@/lib/socket';
import { ensureArray } from '@/utils/fetchData';

interface Application {
  _id: string;
  status: string;
  score?: number;
  skills?: string[];
  notes?: string;
  lastModifiedAt?: string;
  createdAt: string;
  phoneNumber?: string;
  userId?: {
    _id: string;
    name: string;
    email: string;
  };
  jobId?: {
    _id: string;
    title: string;
    description?: string;
  };
}

interface EditModalProps {
  isOpen: boolean;
  title: string;
  fields: any[];
  onClose: () => void;
  onSave: (data: any) => Promise<void>;
  loading: boolean;
  lastSaved?: Date | null;
}

const EditModal: React.FC<EditModalProps> = ({
  isOpen,
  title,
  fields,
  onClose,
  onSave,
  loading,
  lastSaved
}) => {
  const [formData, setFormData] = useState<any>({});

  useEffect(() => {
    const initialData: any = {};
    fields.forEach(field => {
      initialData[field.name] = field.value || '';
    });
    setFormData(initialData);
  }, [fields]);

  const handleChange = (e: any) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSave(formData);
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h2>{title}</h2>
          <button className="modal-close" onClick={onClose}>✕</button>
        </div>

        <form onSubmit={handleSubmit} className="modal-form">
          {fields.map(field => (
            <div key={field.name} className="form-group">
              <label>{field.label}</label>
              {field.type === 'select' ? (
                <select
                  name={field.name}
                  value={formData[field.name] || ''}
                  onChange={handleChange}
                  required={field.required}
                  className="form-input"
                >
                  <option value="">Select {field.label}</option>
                  {field.options?.map((opt: any) => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                  ))}
                </select>
              ) : field.type === 'textarea' ? (
                <textarea
                  name={field.name}
                  value={formData[field.name] || ''}
                  onChange={handleChange}
                  rows={field.rows || 4}
                  className="form-input"
                />
              ) : field.type === 'checkbox' ? (
                <input
                  type="checkbox"
                  name={field.name}
                  checked={formData[field.name] || false}
                  onChange={handleChange}
                  className="form-checkbox"
                />
              ) : (
                <input
                  type={field.type || 'text'}
                  name={field.name}
                  value={formData[field.name] || ''}
                  onChange={handleChange}
                  required={field.required}
                  className="form-input"
                />
              )}
            </div>
          ))}

          <div className="modal-footer">
            {lastSaved && (
              <span className="last-saved">💾 Last saved: {new Date(lastSaved).toLocaleTimeString()}</span>
            )}
            <div className="button-group">
              <button type="button" onClick={onClose} className="btn btn-secondary">
                Cancel
              </button>
              <button type="submit" disabled={loading} className="btn btn-primary">
                {loading ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

const AdminApplications: React.FC = () => {
  const [applications, setApplications] = useState<Application[]>([]);
  const [filteredApplications, setFilteredApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [sortBy, setSortBy] = useState('createdAt');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [currentPage, setCurrentPage] = useState(1);
  const [applicationsPerPage] = useState(10);

  // Edit modal states
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingApp, setEditingApp] = useState<Application | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState<{ [key: string]: Date }>({});

  const fetchApplications = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      console.log('📥 Fetching all applications from admin endpoint...');

      let response;
      let applicationsData: Application[] = [];

      try {
        console.log('🔄 Trying /applications/admin endpoint...');
        response = await api.get('/admin/applications');
        console.log("ADMIN APPLICATIONS:", response.data);
        applicationsData = response.data.data || [];
      } catch (err1) {
        console.warn('⚠️ /admin/applications failed, trying fallback...');
        try {
          response = await api.get('/applications');
          applicationsData = response.data.data || [];
        } catch (err2) {
          throw err1;
        }
      }

      console.log('✅ Applications fetched:', applicationsData.length);
      setApplications(ensureArray(applicationsData, []));
    } catch (err: any) {
      console.error('❌ Error fetching applications:', err);
      const errorMessage = err.response?.data?.message || err.message || 'Failed to fetch applications';
      setError(errorMessage);

      if (err.response?.status === 401) {
        setError('Unauthorized - Please login again');
      } else if (err.response?.status === 403) {
        setError('Forbidden - You do not have permission to view applications');
      }
    } finally {
      setLoading(false);
    }
  }, []);

  // Real-time Socket.IO updates
  useEffect(() => {
    fetchApplications();

    const socket = getSocket();
    if (!socket) {
      console.warn('Socket.IO is not connected');
      return;
    }

    const handleNewApplication = (data: any) => {
      console.log('📡 New application received:', data);
      if (data.application) {
        setApplications(prevApps => [data.application, ...prevApps]);
      }
    };

    const handleApplicationUpdate = (data: any) => {
      console.log('📡 Application updated:', data);
      if (data.app && data.appId) {
        setApplications(prevApps =>
          prevApps.map(app => app._id === data.appId ? data.app : app)
        );
      }
    };

    const handleApplicationDelete = (data: any) => {
      console.log('📡 Application deleted:', data);
      if (data.appId) {
        setApplications(prevApps => prevApps.filter(app => app._id !== data.appId));
      }
    };

    socket.on('newApplicationSubmitted', handleNewApplication);
    socket.on('applicationUpdated', handleApplicationUpdate);
    socket.on('applicationDeleted', handleApplicationDelete);

    return () => {
      socket.off('newApplicationSubmitted', handleNewApplication);
      socket.off('applicationUpdated', handleApplicationUpdate);
      socket.off('applicationDeleted', handleApplicationDelete);
    };
  }, [fetchApplications]);

  // Filter and sort applications
  useEffect(() => {
    let filtered = applications.filter((app) => {
      const matchesSearch = !searchTerm ||
        app.userId?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        app.userId?.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        app.jobId?.title?.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesStatus = statusFilter === 'all' || app.status?.toLowerCase() === statusFilter.toLowerCase();

      return matchesSearch && matchesStatus;
    });

    // Sort
    filtered.sort((a, b) => {
      let aVal: any = a[sortBy as keyof Application];
      let bVal: any = b[sortBy as keyof Application];

      if (sortBy === 'createdAt' || sortBy === 'lastModifiedAt') {
        aVal = new Date(aVal).getTime();
        bVal = new Date(bVal).getTime();
      }

      if (sortOrder === 'asc') {
        return aVal > bVal ? 1 : -1;
      } else {
        return aVal < bVal ? 1 : -1;
      }
    });

    setFilteredApplications(filtered);
    setCurrentPage(1);
  }, [applications, searchTerm, statusFilter, sortBy, sortOrder]);

  const handleRefresh = () => {
    fetchApplications();
  };

  const handleEditApp = (app: Application) => {
    setEditingApp(app);
    setIsEditModalOpen(true);
  };

  const handleSaveApp = async (updatedData: any) => {
    if (!editingApp) return;

    try {
      setIsSaving(true);
      console.log('💾 Saving application changes:', updatedData);

      await api.put(`/admin/applications/${editingApp._id}`, updatedData);

      setApplications(applications.map(app =>
        app._id === editingApp._id ? { ...app, ...updatedData, lastModifiedAt: new Date().toISOString() } : app
      ));

      setSaveStatus(prev => ({
        ...prev,
        [editingApp._id]: new Date()
      }));

      setIsEditModalOpen(false);
      alert('✅ Application updated successfully!');
    } catch (err: any) {
      console.error('❌ Error saving application:', err);
      alert('❌ Error: ' + (err.response?.data?.message || err.message));
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteApp = async (appId: string) => {
    if (!window.confirm('Are you sure you want to delete this application? This action cannot be undone.')) {
      return;
    }

    try {
      console.log('🗑️ Deleting application:', appId);
      await api.delete(`/admin/applications/${appId}`);

      setApplications(applications.filter(app => app._id !== appId));
      alert('✅ Application deleted successfully!');
    } catch (err: any) {
      console.error('❌ Error deleting application:', err);
      alert('❌ Error: ' + (err.response?.data?.message || err.message));
    }
  };

  const getEditFields = () => {
    if (!editingApp) return [];

    return [
      {
        name: 'status',
        label: 'Status',
        type: 'select',
        value: editingApp.status || 'pending',
        options: [
          { label: 'Pending', value: 'pending' },
          { label: 'Shortlisted', value: 'shortlisted' },
          { label: 'Interview', value: 'interview' },
          { label: 'Hired', value: 'hired' },
          { label: 'Rejected', value: 'rejected' }
        ],
        required: true
      },
      { name: 'score', label: 'Score', type: 'number', value: editingApp.score || 0 },
      {
        name: 'skills',
        label: 'Skills (comma separated)',
        type: 'text',
        value: Array.isArray(editingApp.skills) ? editingApp.skills.join(', ') : ''
      },
      {
        name: 'notes',
        label: 'Notes',
        type: 'textarea',
        value: editingApp.notes || '',
        rows: 4
      }
    ];
  };

  const handleExportCSV = () => {
    const csvContent = [
      ['Applicant Name', 'Email', 'Job Title', 'Status', 'Applied Date', 'Phone'],
      ...filteredApplications.map(app => [
        app.userId?.name || 'N/A',
        app.userId?.email || 'N/A',
        app.jobId?.title || 'N/A',
        app.status || 'pending',
        new Date(app.createdAt).toLocaleDateString(),
        app.phoneNumber || 'N/A'
      ])
    ];

    const csvString = csvContent.map(row => row.map(cell => `"${cell}"`).join(',')).join('\n');
    const blob = new Blob([csvString], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `applications_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
  };

  const getStatusColor = (status: string) => {
    const statusMap: { [key: string]: string } = {
      'pending': '#ffc107',
      'shortlisted': '#17a2b8',
      'interview': '#007bff',
      'hired': '#28a745',
      'rejected': '#dc3545',
    };
    return statusMap[status?.toLowerCase()] || '#6c757d';
  };

  // Pagination
  const indexOfLastApp = currentPage * applicationsPerPage;
  const indexOfFirstApp = indexOfLastApp - applicationsPerPage;
  const currentApplications = filteredApplications.slice(indexOfFirstApp, indexOfLastApp);
  const totalPages = Math.ceil(filteredApplications.length / applicationsPerPage);

  if (loading) {
    return (
      <div className="admin-container loading">
        <div className="spinner"></div>
        <p>Loading applications...</p>
      </div>
    );
  }

  if (error && applications.length === 0) {
    return (
      <div className="admin-container error">
        <div className="error-card">
          <h2>⚠️ Error</h2>
          <p>{error}</p>
          <button onClick={handleRefresh} className="btn btn-primary">
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-container">
      <div className="admin-header">
        <div className="header-content">
          <h1>📋 Applications & Applicants</h1>
          <p className="header-desc">Review and manage job applications</p>
        </div>
        <button onClick={handleRefresh} className="btn btn-primary" title="Refresh applications">
          🔄 Refresh
        </button>
      </div>

      {error && (
        <div className="error-banner">
          <span>{error}</span>
          <button onClick={() => setError(null)} className="btn-dismiss">✕</button>
        </div>
      )}

      {/* Stats Section */}
      <div className="stats-section">
        <div className="stat-card">
          <span className="stat-label">Total Applications</span>
          <span className="stat-value">{applications.length}</span>
        </div>
        <div className="stat-card">
          <span className="stat-label">Pending</span>
          <span className="stat-value">
            {applications.filter(a => a.status?.toLowerCase() === 'pending').length}
          </span>
        </div>
        <div className="stat-card">
          <span className="stat-label">Shortlisted</span>
          <span className="stat-value">
            {applications.filter(a => a.status?.toLowerCase() === 'shortlisted').length}
          </span>
        </div>
        <div className="stat-card">
          <span className="stat-label">Interview</span>
          <span className="stat-value">
            {applications.filter(a => a.status?.toLowerCase() === 'interview').length}
          </span>
        </div>
        <div className="stat-card">
          <span className="stat-label">Hired</span>
          <span className="stat-value">
            {applications.filter(a => a.status?.toLowerCase() === 'hired').length}
          </span>
        </div>
        <div className="stat-card">
          <span className="stat-label">Rejected</span>
          <span className="stat-value">
            {applications.filter(a => a.status?.toLowerCase() === 'rejected').length}
          </span>
        </div>
      </div>

      {/* Controls Section */}
      <div className="controls-section">
        <div className="search-section">
          <input
            type="text"
            placeholder="🔍 Search by applicant name, email, or job title..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
        </div>

        <div className="filter-section">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="filter-select"
          >
            <option value="all">All Statuses</option>
            <option value="pending">Pending</option>
            <option value="shortlisted">Shortlisted</option>
            <option value="interview">Interview</option>
            <option value="hired">Hired</option>
            <option value="rejected">Rejected</option>
          </select>

          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="filter-select"
          >
            <option value="createdAt">Sort by Applied Date</option>
            <option value="status">Sort by Status</option>
            <option value="score">Sort by Score</option>
            <option value="lastModifiedAt">Sort by Last Modified</option>
          </select>

          <button
            onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
            className="btn btn-secondary"
            title="Toggle sort order"
          >
            {sortOrder === 'desc' ? '↓ Descending' : '↑ Ascending'}
          </button>
        </div>

        <div className="action-buttons">
          <button onClick={handleRefresh} className="btn btn-secondary" title="Refresh applications">
            🔄 Refresh
          </button>
          <button onClick={handleExportCSV} className="btn btn-success" title="Export to CSV">
            📥 Export CSV
          </button>
        </div>
      </div>

      {/* Applications Table */}
      <div className="applications-section">
        {currentApplications.length === 0 ? (
          <div className="empty-state">
            <p>📭 No applications found matching your criteria.</p>
          </div>
        ) : (
          <>
            <div className="table-wrapper">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Applicant Name</th>
                    <th>Email</th>
                    <th>Job Title</th>
                    <th>Status</th>
                    <th>Applied Date</th>
                    <th>Phone</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {ensureArray(currentApplications, []).map((app) => (
                    <tr key={app._id} className={`status-${app.status?.toLowerCase()}`}>
                      <td className="name-cell">
                        <span className="applicant-name">{app.userId?.name || 'N/A'}</span>
                      </td>
                      <td className="email-cell">{app.userId?.email || 'N/A'}</td>
                      <td className="job-cell">{app.jobId?.title || 'N/A'}</td>
                      <td className="status-cell">
                        <span className="status-badge" style={{ background: getStatusColor(app.status) }}>
                          {app.status || 'pending'}
                        </span>
                      </td>
                      <td className="date-cell">
                        <div>
                          <span>{new Date(app.createdAt).toLocaleDateString()}</span>
                          {saveStatus[app._id] && (
                            <span className="last-saved">💾 {new Date(saveStatus[app._id]).toLocaleTimeString()}</span>
                          )}
                        </div>
                      </td>
                      <td className="phone-cell">{app.phoneNumber || 'N/A'}</td>
                      <td className="actions-cell">
                        <div className="action-buttons-inline">
                          <button
                            className="btn btn-sm btn-primary"
                            onClick={() => handleEditApp(app)}
                            title="Edit application"
                          >
                            ✏️ Edit
                          </button>
                          <button
                            className="btn btn-sm btn-danger"
                            onClick={() => handleDeleteApp(app._id)}
                            title="Delete application"
                          >
                            🗑️ Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="pagination">
                <button
                  onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                  disabled={currentPage === 1}
                  className="btn btn-secondary"
                >
                  ← Previous
                </button>
                <div className="page-info">
                  Page <strong>{currentPage}</strong> of <strong>{totalPages}</strong>
                </div>
                <button
                  onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                  disabled={currentPage === totalPages}
                  className="btn btn-secondary"
                >
                  Next →
                </button>
              </div>
            )}
          </>
        )}
      </div>

      {/* Edit Modal */}
      <EditModal
        isOpen={isEditModalOpen}
        title="Edit Application"
        fields={getEditFields()}
        onClose={() => {
          setIsEditModalOpen(false);
          setEditingApp(null);
        }}
        onSave={handleSaveApp}
        loading={isSaving}
        lastSaved={editingApp?._id ? saveStatus[editingApp._id] : null}
      />
    </div>
  );
};

export default AdminApplications;
