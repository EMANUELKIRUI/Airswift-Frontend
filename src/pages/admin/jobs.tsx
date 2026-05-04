'use client';

import { useState, useEffect, FormEvent } from 'react';
import axios from 'axios';
import Button from '@/components/Button';
import Input from '@/components/Input';
import Textarea from '@/components/Textarea';
import Navbar from '@/components/Navbar';
import Loader from '@/components/Loader';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/router';

interface Job {
  id?: number;
  title: string;
  description: string;
  location: string;
}

export default function AdminJobsPage() {
  const router = useRouter();
  const { isAuthenticated, user } = useAuth();
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState<Omit<Job, 'id'>>({
    title: '',
    description: '',
    location: '',
  });

  useEffect(() => {
    if (!isAuthenticated || user?.role !== 'admin') {
      router.push('/login');
      return;
    }

    fetchJobs();
  }, [isAuthenticated, user, router]);

  const fetchJobs = async () => {
    try {
      const response = await axios.get('/api/admin/jobs');
      setJobs(response.data);
      setLoading(false);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to load jobs');
      setLoading(false);
    }
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    try {
      await axios.post('/api/admin/jobs', formData);
      setSuccess('Job created successfully!');
      setFormData({ title: '', description: '', location: '' });
      setShowForm(false);
      fetchJobs();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to create job');
    }
  };

  if (!isAuthenticated || user?.role !== 'admin') {
    return <Loader />;
  }

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <div className="flex justify-between items-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900">Manage Jobs</h1>
            <Button onClick={() => setShowForm(!showForm)}>
              {showForm ? 'Cancel' : 'New Job'}
            </Button>
          </div>

          {error && (
            <div className="rounded-md bg-red-50 p-4 mb-6">
              <p className="text-sm text-red-800">{error}</p>
            </div>
          )}

          {success && (
            <div className="rounded-md bg-green-50 p-4 mb-6">
              <p className="text-sm text-green-800">{success}</p>
            </div>
          )}

          {showForm && (
            <div className="bg-white p-6 rounded-lg shadow mb-8">
              <h2 className="text-xl font-semibold mb-6">Create New Job</h2>
              <form onSubmit={handleSubmit} className="space-y-4">
                <Input
                  type="text"
                  placeholder="Job Title"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  required
                />
                <Input
                  type="text"
                  placeholder="Location"
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  required
                />
                <Textarea
                  placeholder="Job Description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  required
                />
                <Button type="submit" className="w-full">Create Job</Button>
              </form>
            </div>
          )}

          {loading ? (
            <Loader />
          ) : jobs.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-600">No jobs posted yet</p>
            </div>
          ) : (
            <div className="space-y-4">
              {jobs.map((job) => (
                <div key={job.id} className="bg-white p-6 rounded-lg shadow">
                  <h3 className="text-lg font-semibold text-gray-900">{job.title}</h3>
                  <p className="text-gray-600 mt-1">{job.location}</p>
                  <p className="text-gray-700 mt-2">{job.description}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  );
}
