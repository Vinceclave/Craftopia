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
  Settings,
  ChevronRight,
} from 'lucide-react';

const AdminLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuthStore();

  const navigation = [
    { name: 'Dashboard', href: '/admin/dashboard', icon: BarChart3, badge: null },
    { name: 'Users', href: '/admin/users', icon: Users, badge: 8 },
    { name: 'Content', href: '/admin/posts', icon: FileText, badge: 23 },
    { name: 'Challenges', href: '/admin/challenges', icon: Trophy, badge: null },
    { name: 'Reports', href: '/admin/reports', icon: AlertCircle, badge: 15 },
  ];

  const handleLogout = () => {
    logout();
    navigate('/admin/login');
  };

  return (
    <div className="flex min-h-screen bg-white">
      {/* Mobile Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/20 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed top-0 left-0 z-50 h-full bg-white border-r border-gray-100 transition-all duration-300
        ${sidebarOpen ? 'translate-x-0 w-64' : '-translate-x-full lg:translate-x-0 lg:w-20'}`}
      >
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-100">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-gray-900 rounded-lg flex items-center justify-center">
                <Shield className="w-4 h-4 text-white" />
              </div>
              {sidebarOpen && (
                <div>
                  <h1 className="font-semibold text-gray-900 text-sm">Craftopia</h1>
                  <p className="text-xs text-gray-400">Admin</p>
                </div>
              )}
            </div>

            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7 lg:hidden"
              onClick={() => setSidebarOpen(false)}
            >
              <X className="w-4 h-4" />
            </Button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-3 py-6 space-y-1">
            {navigation.map((item) => {
              const isActive = location.pathname === item.href;
              return (
                <Link key={item.name} to={item.href} onClick={() => setSidebarOpen(false)}>
                  <div
                    className={`flex items-center w-full relative group rounded-lg transition-all duration-200
                    ${sidebarOpen ? 'px-3 py-2.5' : 'px-2 py-2.5 justify-center'}
                    ${isActive ? 'bg-gray-50 text-gray-900' : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'}`}
                  >
                    <item.icon className={`w-4 h-4 ${sidebarOpen ? 'mr-3' : ''}`} />
                    {sidebarOpen && (
                      <>
                        <span className="flex-1 text-sm font-medium">{item.name}</span>
                        {item.badge && (
                          <Badge className="ml-2 bg-gray-900 text-white text-xs min-w-[20px]">
                            {item.badge}
                          </Badge>
                        )}
                      </>
                    )}
                    {!sidebarOpen && item.badge && (
                      <div className="absolute top-1.5 right-1.5 w-2 h-2 bg-gray-900 rounded-full" />
                    )}
                  </div>
                </Link>
              );
            })}
          </nav>

          {/* User Section */}
          <div className="p-4 border-t border-gray-100">
            {sidebarOpen ? (
              <div className="space-y-3">
                <div className="flex items-center gap-3 p-2">
                  <div className="w-8 h-8 bg-gray-900 rounded-full flex items-center justify-center text-white text-sm font-medium">
                    {user?.username?.charAt(0).toUpperCase() || 'A'}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">{user?.username || 'Admin'}</p>
                    <p className="text-xs text-gray-400 truncate">{user?.email || 'admin@craftopia.com'}</p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button variant="ghost" size="sm" className="flex-1 text-xs h-8">
                    <Settings className="w-3 h-3 mr-2" />
                    Settings
                  </Button>
                  <Button variant="ghost" size="sm" className="flex-1 text-xs h-8" onClick={handleLogout}>
                    <LogOut className="w-3 h-3 mr-2" />
                    Logout
                  </Button>
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center space-y-2">
                <div className="w-8 h-8 bg-gray-900 rounded-full flex items-center justify-center text-white text-sm">
                  {user?.username?.charAt(0).toUpperCase() || 'A'}
                </div>
                <Button variant="ghost" size="icon" className="h-7 w-7" onClick={handleLogout}>
                  <LogOut className="w-3 h-3" />
                </Button>
              </div>
            )}
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <div
        className={`flex-1 flex flex-col transition-all duration-300 ${
          sidebarOpen ? 'lg:ml-64' : 'lg:ml-20'
        }`}
      >
        {/* Header */}
        <header className="sticky top-0 z-30 bg-white border-b border-gray-100">
          <div className="flex items-center justify-between px-6 py-4">
            <div className="flex items-center gap-3">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="lg:hidden h-8 w-8"
              >
                <Menu className="w-4 h-4" />
              </Button>

              <div className="flex items-center gap-2 text-sm text-gray-500">
                <span className="font-medium text-gray-900">Admin</span>
                <ChevronRight className="w-4 h-4" />
                <span className="capitalize text-gray-600">
                  {location.pathname.split('/').pop() || 'Dashboard'}
                </span>
              </div>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;