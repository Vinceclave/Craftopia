// apps/web/src/components/AdminLayout.tsx
import { useState } from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  BarChart3,
  Users,
  FileText,
  Trophy,
  AlertCircle,
  Menu,
  X,
  LogOut,
  Shield,
  Activity
} from 'lucide-react';

const AdminLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuthStore();

  const navigation = [
    { name: 'Dashboard', href: '/admin/dashboard', icon: BarChart3 },
    { name: 'Users', href: '/admin/users', icon: Users },
    { name: 'Posts', href: '/admin/posts', icon: FileText },
    { name: 'Challenges', href: '/admin/challenges', icon: Trophy },
    { name: 'Reports', href: '/admin/reports', icon: AlertCircle, badge: 15 },
  ];

  const handleLogout = () => {
    logout();
    navigate('/admin/login');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Sidebar */}
      <aside
        className={`fixed top-0 left-0 z-40 h-screen transition-transform ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        } w-64 bg-white border-r`}
      >
        <div className="h-full px-3 py-4 overflow-y-auto flex flex-col">
          {/* Logo */}
          <div className="flex items-center gap-2 px-3 py-4 mb-5 border-b">
            <Shield className="w-8 h-8 text-blue-600" />
            <div>
              <span className="text-xl font-bold">Craftopia</span>
              <p className="text-xs text-gray-500">Admin Panel</p>
            </div>
          </div>

          {/* Navigation */}
          <ul className="space-y-2 flex-1">
            {navigation.map((item) => {
              const isActive = location.pathname === item.href;
              return (
                <li key={item.name}>
                  <Link to={item.href}>
                    <Button
                      variant={isActive ? 'default' : 'ghost'}
                      className="w-full justify-start"
                    >
                      <item.icon className="w-5 h-5 mr-3" />
                      {item.name}
                      {item.badge && (
                        <Badge className="ml-auto" variant="destructive">
                          {item.badge}
                        </Badge>
                      )}
                    </Button>
                  </Link>
                </li>
              );
            })}
          </ul>

          {/* User Info & Logout */}
          <div className="border-t pt-4">
            <div className="px-3 py-2 mb-2">
              <p className="text-sm font-medium">{user?.username || 'Admin'}</p>
              <p className="text-xs text-gray-500">{user?.email}</p>
            </div>
            <Button
              variant="outline"
              className="w-full justify-start"
              onClick={handleLogout}
            >
              <LogOut className="w-5 h-5 mr-3" />
              Logout
            </Button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <div className={`${sidebarOpen ? 'ml-64' : 'ml-0'} transition-all duration-300`}>
        {/* Header */}
        <header className="bg-white border-b sticky top-0 z-30">
          <div className="flex items-center justify-between px-6 py-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setSidebarOpen(!sidebarOpen)}
            >
              {sidebarOpen ? (
                <X className="w-5 h-5" />
              ) : (
                <Menu className="w-5 h-5" />
              )}
            </Button>

            <div className="flex items-center gap-3">
              <Badge variant="outline" className="text-green-600 border-green-600">
                <Activity className="w-3 h-3 mr-1" />
                Online
              </Badge>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main>
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;