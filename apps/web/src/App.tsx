// apps/web/src/App.tsx - WITH CENTRALIZED TOAST
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ProtectedRoute } from './components/ProtectedRoute';
import AdminLayout from './components/AdminLayout';
import { WebSocketToastProvider } from './components/ToastNotification';
import { Toaster } from './components/ui/toaster';

// Pages
import AdminLogin from './pages/admin/Login';
import AdminDashboard from './pages/admin/Dashboard';
import AdminUsers from './pages/admin/Users';
import AdminPosts from './pages/admin/Posts';
import AdminChallenges from './pages/admin/Challenges';
import { Landing } from './pages/Landing';
import AdminAnnouncements from './pages/admin/Announcement';
import AdminSponsors from './pages/admin/Sponsors';
import AdminReports from './pages/admin/Reports';

// Create QueryClient
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
      staleTime: 5 * 60 * 1000, // 5 minutes
    },
  },
});

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        {/* Global Centralized Toast Container */}
        <Toaster />

        {/* WebSocket Toast Notifications */}
        <WebSocketToastProvider />

        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<Landing />} />
          <Route path="/admin/login" element={<AdminLogin />} />

          {/* Protected Admin Routes with Layout  */}
          <Route path="/admin" element={<ProtectedRoute />}>
            <Route element={<AdminLayout />}>
              <Route path="dashboard" element={<AdminDashboard />} />
              <Route path="users" element={<AdminUsers />} />
              <Route path="posts" element={<AdminPosts />} />
              <Route path="challenges" element={<AdminChallenges />} />
              <Route path="sponsors" element={<AdminSponsors />} />
              <Route path="reports" element={<AdminReports />} />
              <Route path="/admin/announcements" element={<AdminAnnouncements />} />
              <Route index element={<Navigate to="/admin/dashboard" replace />} />
            </Route>
          </Route>

          {/* 404 */}
          <Route path="*" element={
            <div className="min-h-screen flex items-center justify-center">
              <div className="text-center">
                <h1 className="text-4xl font-bold mb-2">404</h1>
                <p className="text-gray-600">Page Not Found</p>
              </div>
            </div>
          } />
        </Routes>
      </BrowserRouter>
    </QueryClientProvider>
  );
}

export default App;