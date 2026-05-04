'use client';

import { useRouter } from 'next/router';
import { useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import Loader from '@/components/Loader';

export default function Dashboard() {
  const router = useRouter();
  const { isAuthenticated, user } = useAuth();

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login');
      return;
    }

    // Redirect based on role
    if (user?.role === 'admin') {
      router.push('/admin/jobs');
    } else {
      router.push('/jobs');
    }
  }, [isAuthenticated, user, router]);

  return <Loader />;
}
