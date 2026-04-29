import { useEffect, useState } from 'react';
import AdminLayout from '@/layouts/AdminLayout';
import Chart from '@/components/admin/Chart';
import StatCard from '@/components/admin/StatCard';
import { TrendingUp, Users, FileText, MessageSquare } from 'lucide-react';
import api from '@/services/api';

export default function Analytics() {
  const [analytics, setAnalytics] = useState<any>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    try {
      const response = await api.get('/admin/analytics');
      setAnalytics(response.data);
    } catch (error) {
      console.error('Failed to fetch analytics:', error);
      // Mock data for demonstration
      setAnalytics({
        userGrowth: [
          { name: 'Jan', users: 65 },
          { name: 'Feb', users: 78 },
          { name: 'Mar', users: 90 },
          { name: 'Apr', users: 81 },
          { name: 'May', users: 95 },
          { name: 'Jun', users: 110 }
        ],
        documentStats: [
          { name: 'Approved', value: 45 },
          { name: 'Pending', value: 23 },
          { name: 'Rejected', value: 12 }
        ],
        topMetrics: {
          totalUsers: 1247,
          totalDocuments: 892,
          totalMessages: 234,
          conversionRate: 68.5
        }
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Analytics</h1>
          <p className="text-gray-600">Track platform performance and user engagement</p>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard
            title="Total Users"
            value={loading ? '...' : analytics.topMetrics?.totalUsers || 0}
            icon={<Users className="w-6 h-6 text-blue-600" />}
            trend={{ value: 12.5, isPositive: true }}
          />
          <StatCard
            title="Total Documents"
            value={loading ? '...' : analytics.topMetrics?.totalDocuments || 0}
            icon={<FileText className="w-6 h-6 text-green-600" />}
            trend={{ value: 8.2, isPositive: true }}
          />
          <StatCard
            title="Messages Sent"
            value={loading ? '...' : analytics.topMetrics?.totalMessages || 0}
            icon={<MessageSquare className="w-6 h-6 text-purple-600" />}
            trend={{ value: -2.1, isPositive: false }}
          />
          <StatCard
            title="Conversion Rate"
            value={loading ? '...' : `${analytics.topMetrics?.conversionRate || 0}%`}
            icon={<TrendingUp className="w-6 h-6 text-orange-600" />}
            trend={{ value: 5.7, isPositive: true }}
          />
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Chart
            type="line"
            data={analytics.userGrowth || []}
            dataKey="users"
            xAxisKey="name"
            title="User Growth Over Time"
            height={350}
          />

          <Chart
            type="pie"
            data={analytics.documentStats || []}
            dataKey="value"
            title="Document Status Distribution"
            height={350}
          />
        </div>

        {/* Additional Analytics */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Chart
            type="bar"
            data={analytics.userGrowth || []}
            dataKey="users"
            xAxisKey="name"
            title="Monthly User Registrations"
            height={300}
          />

          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Activity</h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">New user registrations</span>
                <span className="text-sm font-medium text-green-600">+23</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Documents uploaded</span>
                <span className="text-sm font-medium text-blue-600">+45</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Messages sent</span>
                <span className="text-sm font-medium text-purple-600">+12</span>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">System Health</h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Server uptime</span>
                <span className="text-sm font-medium text-green-600">99.9%</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Response time</span>
                <span className="text-sm font-medium text-blue-600">120ms</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Error rate</span>
                <span className="text-sm font-medium text-red-600">0.1%</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}