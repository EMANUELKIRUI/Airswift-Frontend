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
  };
}

const AdminApplications: React.FC = () => {
  const [applications, setApplications] = useState<Application[]>([]);
  const [filteredApplications, setFilteredApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [searchTerm, setSearchTerm] = useState<string>('');

  const fetchApplications = useCallback(async () => {
    try {
      setLoading(true);

      const res = await api.get('/admin/applications');

      const data = res?.data?.data || [];
      setApplications(ensureArray<Application>(data, []));

    } catch (err) {
      console.error('Error fetching applications:', err);
      setApplications([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchApplications();

    const socket = getSocket();
    if (!socket) return;

    const handleUpdate = (data: any) => {
      setApplications(prev =>
        prev.map(app =>
          app._id === data.appId ? data.app : app
        )
      );
    };

    socket.on('applicationUpdated', handleUpdate);

    return () => {
      socket.off('applicationUpdated', handleUpdate);
    };
  }, [fetchApplications]);

  useEffect(() => {
    const term = searchTerm.toLowerCase();

    const filtered = applications.filter(app =>
      app.userId?.name?.toLowerCase().includes(term) ||
      app.userId?.email?.toLowerCase().includes(term) ||
      app.jobId?.title?.toLowerCase().includes(term)
    );

    setFilteredApplications(filtered);
  }, [applications, searchTerm]);

  if (loading) {
    return <p>Loading applications...</p>;
  }

  return (
    <div className="admin-container">
      <h1>Applications</h1>

      <input
        type="text"
        placeholder="Search applications..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
      />

      <table>
        <thead>
          <tr>
            <th>Name</th>
            <th>Email</th>
            <th>Job</th>
            <th>Status</th>
          </tr>
        </thead>

        <tbody>
          {ensureArray<Application>(filteredApplications, []).map((app) => (
            <tr key={app._id}>
              <td>{app.userId?.name || 'N/A'}</td>
              <td>{app.userId?.email || 'N/A'}</td>
              <td>{app.jobId?.title || 'N/A'}</td>
              <td>{app.status || 'pending'}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};