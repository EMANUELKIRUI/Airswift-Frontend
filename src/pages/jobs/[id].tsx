'use client';

import { useState, useEffect, FormEvent } from 'react';
import { useRouter } from 'next/router';
import axios from 'axios';
import Button from '@/components/Button';
import Navbar from '@/components/Navbar';
import Loader from '@/components/Loader';
import { useAuth } from '@/context/AuthContext';

interface Job {
  _id: string;
  title: string;
  description: string;
  location: string;
}

export default function JobDetailPage() {
  const router = useRouter();
  const { isAuthenticated, user } = useAuth();
  const { id } = router.query;
  const [job, setJob] = useState<Job | null>(null);
  const [loading, setLoading] = useState(true);
  const [applying, setApplying] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login');
      return;
    }

    if (!id) return;

    const fetchJob = async () => {
      try {
        const response = await axios.get(`/api/jobs/${id}`);
        setJob(response.data.job);
        setLoading(false);
      } catch (err: any) {
        setError(err.response?.data?.message || 'Failed to load job');
        setLoading(false);
      }
    };

    fetchJob();
  }, [id, isAuthenticated, router]);

  const handleApply = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setApplying(true);

    try {
      await axios.post('/api/applications/apply', {
        jobId: id,
      });
      setSuccess('Applied successfully!');
      setTimeout(() => router.push('/jobs'), 2000);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to apply');
    } finally {
      setApplying(false);
    }
  };

  if (!isAuthenticated) {
    return <Loader />;
  }

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-2xl mx-auto">
          {loading ? (
            <Loader />
          ) : job ? (
            <div className="bg-white p-6 rounded-lg shadow">
              <h1 className="text-3xl font-bold text-gray-900 mb-2">{job.title}</h1>
              <p className="text-gray-600 mb-4">{job.location}</p>
              <div className="mb-6 p-4 bg-gray-50 rounded">
                <p className="text-gray-700">{job.description}</p>
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

              <form onSubmit={handleApply} className="space-y-4">
                <Button
                  type="submit"
                  disabled={applying}
                  className="w-full"
                >
                  {applying ? 'Applying...' : 'Apply Now'}
                </Button>
              </form>
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-gray-600">Job not found</p>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
