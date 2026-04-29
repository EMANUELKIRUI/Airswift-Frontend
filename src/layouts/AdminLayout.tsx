"use client";

import { useRequireAuth } from '@/hooks/useProtectedRoute'
import Sidebar from '@/components/admin/Sidebar'
import Navbar from '@/components/admin/Navbar'

interface AdminLayoutProps {
  children: React.ReactNode
}

export default function AdminLayout({ children }: AdminLayoutProps) {
  const { isLoading, isAuthorized } = useRequireAuth({ role: 'admin' })

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-gray-600">Loading admin panel...</div>
      </div>
    )
  }

  if (!isAuthorized) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-red-600">Access denied. Admin privileges required.</div>
      </div>
    )
  }

  return (
    <div className="flex h-screen bg-gray-100">
      <Sidebar />

      <div className="flex-1 flex flex-col">
        <Navbar />

        <main className="p-6 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
