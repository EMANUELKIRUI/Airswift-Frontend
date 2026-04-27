import React, { useState, useEffect, useRef } from 'react';
import apiClient from '../services/apiClient';

function AuditLogs() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [message, setMessage] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [actionFilter, setActionFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [logsPerPage] = useState(15);
  const [totalLogs, setTotalLogs] = useState(0);
  const [sortOrder, setSortOrder] = useState('desc');
  const [sortBy, setSortBy] = useState('createdAt');
  const [dateRange, setDateRange] = useState({ startDate: '', endDate: '' });
  const [autoRefresh, setAutoRefresh] = useState(false);
  const [autoRefreshInterval, setAutoRefreshInterval] = useState(30);
  const [selectedLog, setSelectedLog] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const autoRefreshTimer = useRef(null);

  useEffect(() => {
    fetchAuditLogs();
  }, []);

  useEffect(() => {
    fetchAuditLogs();
  }, [currentPage, actionFilter, sortOrder, sortBy, dateRange]);

  // Auto-refresh effect
  useEffect(() => {
    if (!autoRefresh) {
      if (autoRefreshTimer.current) {
        clearInterval(autoRefreshTimer.current);
      }
      return;
    }

    autoRefreshTimer.current = setInterval(() => {
      setCurrentPage(1); // Reset to first page on refresh
      fetchAuditLogs();
    }, autoRefreshInterval * 1000);

    return () => {
      if (autoRefreshTimer.current) {
        clearInterval(autoRefreshTimer.current);
      }
    };
  }, [autoRefresh, autoRefreshInterval]);

  const fetchAuditLogs = async () => {
    try {
      setLoading(true);
      setError(null);
      setMessage(null);
      console.log('📥 Fetching audit logs...');

      // Determine the page number for API
      const pageNum = currentPage;
      const limit = logsPerPage;

      const params: any = {
        page: pageNum,
        limit: limit,
        sortBy: sortBy,
        sortOrder: sortOrder,
      };

      if (actionFilter && actionFilter !== 'all') {
        params.action = actionFilter;
      }

      if (searchTerm) {
        params.search = searchTerm;
      }

      // Add date range filtering
      if (dateRange.startDate) {
        params.startDate = dateRange.startDate;
      }
      if (dateRange.endDate) {
        params.endDate = dateRange.endDate;
      }

      // Try multiple endpoints in order of priority
      const endpoints = ['/admin/audit', '/admin/audit-logs', '/audit-logs', '/auditLogs'];
      let response;
      
      for (const endpoint of endpoints) {
        try {
          response = await apiClient.get(endpoint, { params });
          console.log(`✅ Successfully fetched from ${endpoint}`);
          break;
        } catch (err) {
          console.warn(`⚠️ ${endpoint} failed (${err.response?.status}), trying next endpoint...`);
        }
      }

      if (!response) {
        throw new Error('Unable to fetch audit logs from any configured endpoint');
      }

      console.log('✅ Audit logs fetched:', response.data);

      const data = response.data;
      
      // Display message if provided by API
      if (data.message) {
        setMessage(data.message);
        console.log('ℹ️ API Message:', data.message);
      }
      
      // Handle different response formats
      let logsData = [];
      let pagination = { total: 0, pages: 1 };

      if (data.data) {
        logsData = Array.isArray(data.data) ? data.data : [];
        pagination = data.pagination || { total: logsData.length, pages: 1 };
      } else if (Array.isArray(data)) {
        logsData = data;
        pagination = { total: data.length, pages: 1 };
      } else if (data.logs) {
        logsData = data.logs;
        pagination = data.pagination || { total: data.logs.length, pages: 1 };
      }

      setLogs(logsData);
      setTotalLogs(pagination.total);
    } catch (err) {
      console.error('❌ Error fetching audit logs:', err);
      const errorMessage = err.response?.data?.message || err.message || 'Unable to load audit logs. Please try again.';
      setError(errorMessage);

      if (err.response?.status === 401) {
        setError('Unauthorized - Please login again');
      } else if (err.response?.status === 403) {
        setError('Forbidden - You do not have permission to view audit logs');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = () => {
    setCurrentPage(1);
    fetchAuditLogs();
  };

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1);
  };

  const handleActionFilterChange = (e) => {
    setActionFilter(e.target.value);
    setCurrentPage(1);
  };

  const handleDateRangeChange = (field: 'startDate' | 'endDate', value: string) => {
    setDateRange(prev => ({ ...prev, [field]: value }));
    setCurrentPage(1);
  };

  const handleClearDateRange = () => {
    setDateRange({ startDate: '', endDate: '' });
    setCurrentPage(1);
  };

  const handleSortByColumn = (column: string) => {
    if (sortBy === column) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(column);
      setSortOrder('desc');
    }
    setCurrentPage(1);
  };

  const handleAutoRefreshChange = (e) => {
    setAutoRefresh(e.target.checked);
  };

  const handleAutoRefreshIntervalChange = (e) => {
    const value = parseInt(e.target.value, 10);
    setAutoRefreshInterval(Math.max(5, value)); // Minimum 5 seconds
  };

  const openDetailModal = (log) => {
    setSelectedLog(log);
    setShowDetailModal(true);
  };

  const closeDetailModal = () => {
    setShowDetailModal(false);
    setSelectedLog(null);
  };

  const handleExportCSV = () => {
    const csvContent = [
      ['Timestamp', 'Action', 'User', 'Resource', 'Description'],
      ...logs.map(log => [
        new Date(log.createdAt).toLocaleString(),
        log.action || 'N/A',
        log.user_id?.name || 'Unknown User',
        log.resource || 'N/A',
        log.description || 'N/A'
      ])
    ];

    const csvString = csvContent.map(row => row.map(cell => `"${cell}"`).join(',')).join('\n');
    const blob = new Blob([csvString], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `audit_logs_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
  };

  // Pagination
  const indexOfLastLog = currentPage * logsPerPage;
  const indexOfFirstLog = indexOfLastLog - logsPerPage;
  const currentLogs = logs.slice(indexOfFirstLog, indexOfLastLog);
  const totalPages = Math.ceil(totalLogs / logsPerPage);

  if (loading && logs.length === 0) {
    return (
      <div className="audit-logs-container loading">
        <div className="spinner"></div>
        <p>Loading audit logs...</p>
      </div>
    );
  }

  if (error && logs.length === 0) {
    return (
      <div className="audit-logs-container error">
        <div className="error-message">
          <h3>⚠️ Error Loading Audit Logs</h3>
          <p>{error}</p>
          <button onClick={handleRefresh} className="btn-retry">
            🔄 Retry
          </button>
        </div>
      </div>
    );
  }

  const getActionBadgeClass = (action) => {
    if (action.includes('CREATE')) return 'badge-create';
    if (action.includes('UPDATE')) return 'badge-update';
    if (action.includes('DELETE')) return 'badge-delete';
    if (action.includes('VIEW')) return 'badge-view';
    return 'badge-default';
  };

  const getActionIcon = (action) => {
    if (action.includes('CREATE')) return '➕';
    if (action.includes('UPDATE')) return '✏️';
    if (action.includes('DELETE')) return '🗑️';
    if (action.includes('VIEW')) return '👁️';
    return '•';
  };

  return (
    <div className="audit-logs-container">
      <div className="audit-logs-header">
        <h2>📋 Audit Logs</h2>
        <p>Track all system activities and changes</p>
      </div>

      {/* Success/Info Message Banner */}
      {message && (
        <div className="message-banner success-banner">
          <span>ℹ️ {message}</span>
          <button onClick={() => setMessage(null)} className="btn-dismiss">✕</button>
        </div>
      )}

      {/* Error Banner */}
      {error && (
        <div className="error-banner">
          <span>⚠️ {error}</span>
          <button onClick={() => setError(null)} className="btn-dismiss">✕</button>
        </div>
      )}

      {/* Auto-Refresh Panel */}
      <div className="auto-refresh-panel">
        <label className="auto-refresh-toggle">
          <input
            type="checkbox"
            checked={autoRefresh}
            onChange={handleAutoRefreshChange}
          />
          <span>Auto-Refresh</span>
        </label>
        {autoRefresh && (
          <div className="auto-refresh-interval">
            <label>Interval (seconds):</label>
            <input
              type="number"
              min="5"
              value={autoRefreshInterval}
              onChange={handleAutoRefreshIntervalChange}
              className="interval-input"
            />
            <span className="refresh-status">🔄 Auto-refreshing every {autoRefreshInterval}s</span>
          </div>
        )}
      </div>

      <div className="audit-logs-controls">
        {/* Search Section */}
        <div className="search-section">
          <input
            type="text"
            placeholder="🔍 Search audit logs..."
            value={searchTerm}
            onChange={handleSearchChange}
            className="search-input"
          />
        </div>

        {/* Filter Section */}
        <div className="filter-section">
          <select
            value={actionFilter}
            onChange={handleActionFilterChange}
            className="filter-select"
          >
            <option value="all">All Actions</option>
            <option value="CREATE_USER">Create User</option>
            <option value="UPDATE_USER">Update User</option>
            <option value="DELETE_USER">Delete User</option>
            <option value="CREATE_APPLICATION">Create Application</option>
            <option value="UPDATE_APPLICATION">Update Application</option>
            <option value="DELETE_APPLICATION">Delete Application</option>
            <option value="LOGIN">Login</option>
            <option value="LOGOUT">Logout</option>
          </select>
        </div>

        {/* Date Range Filter */}
        <div className="date-range-section">
          <input
            type="date"
            value={dateRange.startDate}
            onChange={(e) => handleDateRangeChange('startDate', e.target.value)}
            className="date-input"
            title="Start Date"
          />
          <span className="date-separator">→</span>
          <input
            type="date"
            value={dateRange.endDate}
            onChange={(e) => handleDateRangeChange('endDate', e.target.value)}
            className="date-input"
            title="End Date"
          />
          {(dateRange.startDate || dateRange.endDate) && (
            <button onClick={handleClearDateRange} className="btn-clear-date" title="Clear date range">
              ✕
            </button>
          )}
        </div>

        {/* Action Buttons */}
        <div className="action-buttons">
          <button onClick={handleRefresh} className="btn-refresh" title="Refresh audit logs">
            🔄 Refresh
          </button>
          <button onClick={handleExportCSV} className="btn-export" title="Export to CSV">
            📥 Export
          </button>
        </div>
      </div>

      {logs.length === 0 ? (
        <div className="empty-state">
          <p>📭 No audit logs found</p>
        </div>
      ) : (
        <>
          <div className="audit-logs-table-wrapper">
            <table className="audit-logs-table">
              <thead>
                <tr>
                  <th 
                    onClick={() => handleSortByColumn('createdAt')}
                    className={`sortable ${sortBy === 'createdAt' ? `sorted-${sortOrder}` : ''}`}
                    title="Click to sort by timestamp"
                  >
                    Timestamp {sortBy === 'createdAt' && (sortOrder === 'asc' ? '↑' : '↓')}
                  </th>
                  <th 
                    onClick={() => handleSortByColumn('action')}
                    className={`sortable ${sortBy === 'action' ? `sorted-${sortOrder}` : ''}`}
                    title="Click to sort by action"
                  >
                    Action {sortBy === 'action' && (sortOrder === 'asc' ? '↑' : '↓')}
                  </th>
                  <th 
                    onClick={() => handleSortByColumn('user_id')}
                    className={`sortable ${sortBy === 'user_id' ? `sorted-${sortOrder}` : ''}`}
                    title="Click to sort by user"
                  >
                    User {sortBy === 'user_id' && (sortOrder === 'asc' ? '↑' : '↓')}
                  </th>
                  <th 
                    onClick={() => handleSortByColumn('resource')}
                    className={`sortable ${sortBy === 'resource' ? `sorted-${sortOrder}` : ''}`}
                    title="Click to sort by resource"
                  >
                    Resource {sortBy === 'resource' && (sortOrder === 'asc' ? '↑' : '↓')}
                  </th>
                  <th>Description</th>
                  <th style={{ width: '80px' }}>Details</th>
                </tr>
              </thead>
              <tbody>
                {currentLogs.map((log, index) => (
                  <tr key={log._id || index} className={`log-row ${getActionBadgeClass(log.action)}`}>
                    <td className="timestamp">
                      {new Date(log.createdAt).toLocaleString()}
                    </td>
                    <td className="action">
                      <span className={`badge ${getActionBadgeClass(log.action)}`}>
                        {getActionIcon(log.action)} {log.action}
                      </span>
                    </td>
                    <td className="user">
                      <strong>{log.user_id?.name || 'Unknown'}</strong>
                      <small>{log.user_id?.email || ''}</small>
                    </td>
                    <td className="resource">
                      {log.resource || 'N/A'}
                    </td>
                    <td className="description">
                      {log.description || 'No description'}
                    </td>
                    <td className="details">
                      <button
                        onClick={() => openDetailModal(log)}
                        className="btn-view-details"
                        title="View full details"
                      >
                        👁️ View
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {totalPages > 1 && (
            <div className="pagination">
              <button
                onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                disabled={currentPage === 1}
                className="pagination-btn"
              >
                ← Previous
              </button>

              <div className="page-info">
                Page <strong>{currentPage}</strong> of <strong>{totalPages}</strong>
                ({totalLogs} total logs)
              </div>

              <button
                onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                disabled={currentPage === totalPages}
                className="pagination-btn"
              >
                Next →
              </button>
            </div>
          )}
        </>
      )}

      {/* Detail Modal */}
      {showDetailModal && selectedLog && (
        <div className="modal-overlay" onClick={closeDetailModal}>
          <div className="modal-content detail-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>📋 Log Details</h3>
              <button onClick={closeDetailModal} className="modal-close">✕</button>
            </div>
            <div className="modal-body">
              <div className="detail-row">
                <label>Timestamp:</label>
                <span>{new Date(selectedLog.createdAt).toLocaleString()}</span>
              </div>
              <div className="detail-row">
                <label>Action:</label>
                <span>
                  <span className={`badge ${getActionBadgeClass(selectedLog.action)}`}>
                    {getActionIcon(selectedLog.action)} {selectedLog.action}
                  </span>
                </span>
              </div>
              <div className="detail-row">
                <label>User Name:</label>
                <span>{selectedLog.user_id?.name || 'Unknown'}</span>
              </div>
              <div className="detail-row">
                <label>User Email:</label>
                <span>{selectedLog.user_id?.email || 'N/A'}</span>
              </div>
              <div className="detail-row">
                <label>User ID:</label>
                <span className="monospace">{selectedLog.user_id?._id || 'N/A'}</span>
              </div>
              <div className="detail-row">
                <label>Resource:</label>
                <span>{selectedLog.resource || 'N/A'}</span>
              </div>
              <div className="detail-row">
                <label>Description:</label>
                <span>{selectedLog.description || 'No description'}</span>
              </div>
              {selectedLog.changes && Object.keys(selectedLog.changes).length > 0 && (
                <div className="detail-row">
                  <label>Changes:</label>
                  <pre className="changes-log">{JSON.stringify(selectedLog.changes, null, 2)}</pre>
                </div>
              )}
              {selectedLog.metadata && Object.keys(selectedLog.metadata).length > 0 && (
                <div className="detail-row">
                  <label>Metadata:</label>
                  <pre className="metadata-log">{JSON.stringify(selectedLog.metadata, null, 2)}</pre>
                </div>
              )}
              <div className="detail-row">
                <label>Log ID:</label>
                <span className="monospace">{selectedLog._id || 'N/A'}</span>
              </div>
            </div>
            <div className="modal-footer">
              <button onClick={closeDetailModal} className="btn-close">Close</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default AuditLogs;