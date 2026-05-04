'use client';

import { useState, useEffect } from 'react';
import axios from 'axios';
import JobCard from '@/components/JobCard';
import Navbar from '@/components/Navbar';
import Loader from '@/components/Loader';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/router';

export default function JobsPage() {
  const router = useRouter();
  const { isAuthenticated, user } = useAuth();
  const [jobs, setJobs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login');
      return;
    }

    const fetchJobs = async () => {
      try {
        const response = await axios.get('/api/jobs');
        setJobs(response.data.jobs || []);
      } catch (err: any) {
        setError(err.response?.data?.message || 'Failed to load jobs');
      } finally {
        setLoading(false);
      }
    };

    fetchJobs();
  }, [isAuthenticated, router]);

  if (!isAuthenticated) {
    return <Loader />;
  }

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl font-bold text-gray-900 mb-8">Job Opportunities</h1>

          {error && (
            <div className="rounded-md bg-red-50 p-4 mb-6">
              <p className="text-sm text-red-800">{error}</p>
            </div>
          )}

          {loading ? (
            <Loader />
          ) : jobs.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-600">No jobs available at the moment</p>
            </div>
          ) : (
            <div className="space-y-6">
              {jobs.map((job) => (
                <JobCard
                  key={job._id}
                  job={job}
                  onApply={() => router.push(`/jobs/${job._id}`)}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  );
}
