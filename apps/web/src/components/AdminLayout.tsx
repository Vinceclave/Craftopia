// apps/web/src/components/AdminLayout.tsx - WITH WEBSOCKET STATUS
import { useState } from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { useWebSocket } from '@/hooks/useWebSocket';
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
  Wifi,
  WifiOff,
} from 'lucide-react';

const AdminLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuthStore();
  const { isConnected } = useWebSocket();

  const navigation = [
    { name: 'Dashboard', href: '/admin/dashboard', icon: BarChart3, badge: null },
    { name: 'Users', href: '/admin/users', icon: Users, badge: null },
    { name: 'Content', href: '/admin/posts', icon: FileText, badge: null },
    { name: 'Challenges', href: '/admin/challenges', icon: Trophy, badge: null },
    { name: 'Reports', href: '/admin/reports', icon: AlertCircle, badge: null },
  ];

  const handleLogout = () => {
    logout();
    navigate('/admin/login');
  };

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-[#FFF9F0] to-white relative">
      {/* Background Floating Elements */}
      <div className="absolute inset-0 pointer-events-none">
        {[...Array(3)].map((_, i) => (
          <div
            key={i}
            className="absolute w-2 h-2 bg-[#6CAC73] rounded-full opacity-20 animate-float"
            style={{
              left: `${10 + i * 30}%`,
              top: `${15 + (i % 2) * 30}%`,
              animationDelay: `${i * 1.5}s`,
              animationDuration: '4s'
            }}
          />
        ))}
      </div>

      {/* Mobile Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/20 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed top-0 left-0 z-50 h-full bg-white/80 backdrop-blur-sm border-r border-[#6CAC73]/20 transition-all duration-300
        ${sidebarOpen ? 'translate-x-0 w-64' : '-translate-x-full lg:translate-x-0 lg:w-20'}`}
      >
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-[#6CAC73]/10">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-gradient-to-br from-[#6CAC73] to-[#2B4A2F] rounded-xl flex items-center justify-center shadow-lg">
                <Shield className="w-4 h-4 text-white" />
              </div>
              {sidebarOpen && (
                <div>
                  <h1 className="font-semibold text-[#2B4A2F] text-sm font-poppins">Craftopia</h1>
                  <p className="text-xs text-gray-600 font-nunito">Admin</p>
                </div>
              )}
            </div>

            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7 lg:hidden hover:bg-[#6CAC73]/10"
              onClick={() => setSidebarOpen(false)}
            >
              <X className="w-4 h-4 text-[#2B4A2F]" />
            </Button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-3 py-6 space-y-1">
            {navigation.map((item) => {
              const isActive = location.pathname === item.href;
              return (
                <Link key={item.name} to={item.href} onClick={() => setSidebarOpen(false)}>
                  <div
                    className={`flex items-center w-full relative group rounded-xl transition-all duration-200
                    ${sidebarOpen ? 'px-3 py-2.5' : 'px-2 py-2.5 justify-center'}
                    ${isActive 
                      ? 'bg-gradient-to-r from-[#6CAC73]/10 to-[#2B4A2F]/5 text-[#2B4A2F] border border-[#6CAC73]/20' 
                      : 'text-gray-600 hover:text-[#2B4A2F] hover:bg-white/50 border border-transparent'
                    }`}
                  >
                    <item.icon className={`w-4 h-4 ${sidebarOpen ? 'mr-3' : ''}`} />
                    {sidebarOpen && (
                      <>
                        <span className="flex-1 text-sm font-medium font-poppins">{item.name}</span>
                        {item.badge && (
                          <Badge className="ml-2 bg-gradient-to-br from-[#2B4A2F] to-[#6CAC73] text-white text-xs min-w-[20px] border-0">
                            {item.badge}
                          </Badge>
                        )}
                      </>
                    )}
                    {!sidebarOpen && item.badge && (
                      <div className="absolute top-1.5 right-1.5 w-2 h-2 bg-[#6CAC73] rounded-full" />
                    )}
                  </div>
                </Link>
              );
            })}
          </nav>
          {/* User Section */}
          <div className="p-4 border-t border-[#6CAC73]/10">
            {sidebarOpen ? (
              <div className="space-y-3">
                <div className="flex items-center gap-3 p-2">
                  <div className="w-8 h-8 bg-gradient-to-br from-[#6CAC73] to-[#2B4A2F] rounded-full flex items-center justify-center text-white text-sm font-medium shadow-lg">
                    {user?.username?.charAt(0).toUpperCase() || 'A'}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-[#2B4A2F] font-poppins truncate">{user?.username || 'Admin'}</p>
                    <p className="text-xs text-gray-600 font-nunito truncate">{user?.email || 'admin@craftopia.com'}</p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="flex-1 text-xs h-8 border border-[#6CAC73]/20 hover:bg-[#6CAC73]/10 hover:text-[#2B4A2F]"
                  >
                    <Settings className="w-3 h-3 mr-2" />
                    Settings
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="flex-1 text-xs h-8 border border-[#6CAC73]/20 hover:bg-[#6CAC73]/10 hover:text-[#2B4A2F]" 
                    onClick={handleLogout}
                  >
                    <LogOut className="w-3 h-3 mr-2" />
                    Logout
                  </Button>
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center gap-2">
                <div className="w-8 h-8 bg-gradient-to-br from-[#6CAC73] to-[#2B4A2F] rounded-full flex items-center justify-center text-white text-sm shadow-lg">
                  {user?.username?.charAt(0).toUpperCase() || 'A'}
                </div>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="h-7 w-7 hover:bg-[#6CAC73]/10 border border-[#6CAC73]/20" 
                  onClick={handleLogout}
                >
                  <LogOut className="w-3 h-3 text-[#2B4A2F]" />
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
        <header className="sticky top-0 z-30 bg-white/80 backdrop-blur-sm border-b border-[#6CAC73]/20">
          <div className="flex items-center justify-between px-6 py-4">
            <div className="flex items-center gap-3">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="lg:hidden h-8 w-8 hover:bg-[#6CAC73]/10 border border-[#6CAC73]/20"
              >
                <Menu className="w-4 h-4 text-[#2B4A2F]" />
              </Button>

              <div className="flex items-center gap-2 text-sm text-gray-600 font-nunito">
                <span className="font-medium text-[#2B4A2F] font-poppins">Admin</span>
                <ChevronRight className="w-4 h-4 text-[#6CAC73]" />
                <span className="capitalize text-gray-600">
                  {location.pathname.split('/').pop() || 'Dashboard'}
                </span>
              </div>
            </div>

            {/* WebSocket Status Badge (Desktop) */}
            <div className="hidden lg:flex items-center gap-2">
              {isConnected ? (
                <Badge className="bg-gradient-to-r from-[#6CAC73]/20 to-[#2B4A2F]/10 text-[#2B4A2F] border border-[#6CAC73]/30 font-poppins">
                  <Wifi className="w-3 h-3 mr-1" />
                  Live
                </Badge>
              ) : (
                <Badge variant="secondary" className="bg-rose-50 text-rose-700 border-rose-200">
                  <WifiOff className="w-3 h-3 mr-1" />
                  Offline
                </Badge>
              )}
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