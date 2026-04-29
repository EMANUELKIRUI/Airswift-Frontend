import { useEffect, useState } from 'react';
import AdminLayout from '@/layouts/AdminLayout';
import StatCard from '@/components/admin/StatCard';
import Chart from '@/components/admin/Chart';
import OnlineBadge from '@/components/admin/OnlineBadge';
import { Users, FileText, CheckCircle, Clock } from 'lucide-react';
import api from '@/services/api';

export default function Dashboard() {
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalDocs: 0,
    pendingDocs: 0,
    approvedDocs: 0
  });
  const [loading, setLoading] = useState(true);
  const [onlineUsers, setOnlineUsers] = useState([]);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const response = await api.get('/admin/dashboard');
      const data = response.data;

      setStats({
        totalUsers: data.totalUsers || 0,
        totalDocs: data.totalDocuments || 0,
        pendingDocs: data.pendingDocuments || 0,
        approvedDocs: data.approvedDocuments || 0
      });

      // Mock online users data - replace with real socket data
      setOnlineUsers([
        { id: 1, name: 'John Doe', isOnline: true },
        { id: 2, name: 'Jane Smith', isOnline: false },
        { id: 3, name: 'Bob Johnson', isOnline: true }
      ]);
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const chartData = [
    { name: 'Jan', users: 65 },
    { name: 'Feb', users: 78 },
    { name: 'Mar', users: 90 },
    { name: 'Apr', users: 81 },
    { name: 'May', users: 95 },
    { name: 'Jun', users: 110 }
  ];

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-600">Welcome to the admin panel</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard
            title="Total Users"
            value={loading ? '...' : stats.totalUsers}
            icon={<Users className="w-6 h-6 text-blue-600" />}
            trend={{ value: 12, isPositive: true }}
          />
          <StatCard
            title="Total Documents"
            value={loading ? '...' : stats.totalDocs}
            icon={<FileText className="w-6 h-6 text-green-600" />}
            trend={{ value: 8, isPositive: true }}
          />
          <StatCard
            title="Pending Reviews"
            value={loading ? '...' : stats.pendingDocs}
            icon={<Clock className="w-6 h-6 text-yellow-600" />}
            trend={{ value: -5, isPositive: false }}
          />
          <StatCard
            title="Approved"
            value={loading ? '...' : stats.approvedDocs}
            icon={<CheckCircle className="w-6 h-6 text-green-600" />}
            trend={{ value: 15, isPositive: true }}
          />
        </div>

        {/* Charts Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Chart
            type="line"
            data={chartData}
            dataKey="users"
            xAxisKey="name"
            title="User Growth"
            height={300}
          />

          <Chart
            type="bar"
            data={chartData}
            dataKey="users"
            xAxisKey="name"
            title="Monthly Users"
            height={300}
          />
        </div>

        {/* Online Users */}
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Online Users</h3>
          <div className="space-y-3">
            {onlineUsers.map((user) => (
              <div key={user.id} className="flex items-center justify-between">
                <span className="text-gray-900">{user.name}</span>
                <OnlineBadge isOnline={user.isOnline} showText />
              </div>
            ))}
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}