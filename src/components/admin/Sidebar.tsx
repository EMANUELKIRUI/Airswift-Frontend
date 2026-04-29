import Link from "next/link";
import { useRouter } from "next/router";
import {
  LayoutDashboard,
  Users,
  FileText,
  MessageSquare,
  BarChart3,
  Shield,
  Settings,
  Trophy
} from 'lucide-react';

const navigation = [
  { name: 'Dashboard', href: '/admin/dashboard', icon: LayoutDashboard },
  { name: 'Top Candidates', href: '/admin/top-candidates', icon: Trophy },
  { name: 'Users', href: '/admin/users', icon: Users },
  { name: 'Documents', href: '/admin/documents', icon: FileText },
  { name: 'Messages', href: '/admin/messages', icon: MessageSquare },
  { name: 'Analytics', href: '/admin/analytics', icon: BarChart3 },
  { name: 'Audit Logs', href: '/admin/audit', icon: Shield },
  { name: 'Settings', href: '/admin/settings', icon: Settings },
];

export default function Sidebar() {
  const router = useRouter();

  return (
    <div className="w-64 bg-gray-900 text-white p-5">
      <div className="mb-8">
        <h1 className="text-xl font-bold tracking-wide">AIRSWIFT ADMIN</h1>
        <p className="text-gray-400 text-sm mt-1">Management Panel</p>
      </div>

      <nav className="space-y-2">
        {navigation.map((item) => {
          const isActive = router.pathname === item.href;
          return (
            <Link
              key={item.name}
              href={item.href}
              className={`flex items-center px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                isActive
                  ? 'bg-gray-800 text-white'
                  : 'text-gray-300 hover:bg-gray-800 hover:text-white'
              }`}
            >
              <item.icon className="mr-3 h-5 w-5" />
              {item.name}
            </Link>
          );
        })}
      </nav>

      <div className="mt-8 pt-4 border-t border-gray-700">
        <div className="text-xs text-gray-400">
          Admin Panel v1.0
        </div>
      </div>
    </div>
  );
}