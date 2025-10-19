import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Users, FileText, Trophy, AlertCircle, TrendingUp, 
  Activity, Menu, LogOut, BarChart3, Shield 
} from 'lucide-react';
import { useDashboardStats } from '@/hooks/useDashboard';

// Stat Card Component
const StatCard = ({ icon: Icon, label, value, trend, bgColor }) => (
  <Card>
    <CardContent className="pt-6">
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <p className="text-sm font-medium text-muted-foreground">{label}</p>
          <p className="text-3xl font-bold">{value?.toLocaleString() || 0}</p>
          {trend && (
            <div className="flex items-center text-sm text-green-600">
              <TrendingUp className="w-4 h-4 mr-1" />
              <span>{trend}</span>
            </div>
          )}
        </div>
        <div className={`p-3 rounded-lg ${bgColor}`}>
          <Icon className="w-6 h-6 text-white" />
        </div>
      </div>
    </CardContent>
  </Card>
);

// Main Dashboard Component
export default function AdminDashboard() {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const { data, isLoading, error } = useDashboardStats();

  const stats = data?.data;

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="max-w-md">
          <CardHeader>
            <CardTitle className="text-red-600">Error</CardTitle>
            <CardDescription>{error.message}</CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Sidebar */}
      <aside className={`fixed top-0 left-0 z-40 h-screen transition-transform ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} w-64 bg-white border-r`}>
        <div className="h-full px-3 py-4 overflow-y-auto">
          <div className="flex items-center gap-2 px-3 py-4 mb-5">
            <Shield className="w-8 h-8 text-blue-600" />
            <span className="text-xl font-bold">Craftopia Admin</span>
          </div>

          <ul className="space-y-2">
            <li>
              <Button variant="ghost" className="w-full justify-start">
                <BarChart3 className="w-5 h-5 mr-3" />
                Dashboard
              </Button>
            </li>
            <li>
              <Button variant="ghost" className="w-full justify-start">
                <Users className="w-5 h-5 mr-3" />
                Users
              </Button>
            </li>
            <li>
              <Button variant="ghost" className="w-full justify-start">
                <FileText className="w-5 h-5 mr-3" />
                Posts
              </Button>
            </li>
            <li>
              <Button variant="ghost" className="w-full justify-start">
                <Trophy className="w-5 h-5 mr-3" />
                Challenges
              </Button>
            </li>
            <li>
              <Button variant="ghost" className="w-full justify-start">
                <AlertCircle className="w-5 h-5 mr-3" />
                Reports
                <Badge className="ml-auto" variant="destructive">
                  {stats?.reports?.pending || 0}
                </Badge>
              </Button>
            </li>
          </ul>

          <div className="absolute bottom-4 left-3 right-3">
            <Button variant="outline" className="w-full justify-start" onClick={() => {}}>
              <LogOut className="w-5 h-5 mr-3" />
              Logout
            </Button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <div className={`${sidebarOpen ? 'ml-64' : 'ml-0'} transition-margin duration-300`}>
        {/* Header */}
        <header className="bg-white border-b sticky top-0 z-30">
          <div className="flex items-center justify-between px-6 py-4">
            <div className="flex items-center gap-4">
              <Button 
                variant="ghost" 
                size="icon"
                onClick={() => setSidebarOpen(!sidebarOpen)}
              >
                <Menu className="w-5 h-5" />
              </Button>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
                <p className="text-sm text-gray-500">Welcome back, Admin</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Badge variant="outline" className="text-green-600 border-green-600">
                <Activity className="w-3 h-3 mr-1" />
                Online
              </Badge>
            </div>
          </div>
        </header>

        {/* Dashboard Content */}
        <main className="p-6">
          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
            <StatCard 
              icon={Users}
              label="Total Users"
              value={stats?.users?.total}
              trend={`+${stats?.users?.newToday || 0} today`}
              bgColor="bg-blue-600"
            />
            <StatCard 
              icon={FileText}
              label="Total Posts"
              value={stats?.content?.totalPosts}
              trend={`+${stats?.content?.postsToday || 0} today`}
              bgColor="bg-green-600"
            />
            <StatCard 
              icon={Trophy}
              label="Active Challenges"
              value={stats?.challenges?.active}
              bgColor="bg-purple-600"
            />
            <StatCard 
              icon={AlertCircle}
              label="Pending Reports"
              value={stats?.reports?.pending}
              bgColor="bg-red-600"
            />
          </div>

          {/* Tabs Section */}
          <Tabs defaultValue="overview" className="space-y-4">
            <TabsList>
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="activity">Activity</TabsTrigger>
              <TabsTrigger value="pending">Pending Actions</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-4">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle>User Statistics</CardTitle>
                    <CardDescription>Current user metrics</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">Active Users</span>
                      <span className="font-semibold">{stats?.users?.active?.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">Verified Users</span>
                      <span className="font-semibold">{stats?.users?.verified?.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">New This Week</span>
                      <span className="font-semibold">{stats?.users?.newThisWeek?.toLocaleString()}</span>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Content Overview</CardTitle>
                    <CardDescription>Platform content metrics</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">Total Comments</span>
                      <span className="font-semibold">{stats?.content?.totalComments?.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">Total Crafts</span>
                      <span className="font-semibold">{stats?.content?.totalCrafts?.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">Total Likes</span>
                      <span className="font-semibold">{stats?.engagement?.totalLikes?.toLocaleString()}</span>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="pending" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Pending Actions</CardTitle>
                  <CardDescription>Items requiring immediate attention</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between p-4 bg-orange-50 rounded-lg border border-orange-200">
                    <div className="flex items-center gap-3">
                      <Trophy className="w-5 h-5 text-orange-600" />
                      <div>
                        <p className="font-medium">Challenge Verifications</p>
                        <p className="text-sm text-muted-foreground">Pending review</p>
                      </div>
                    </div>
                    <Badge variant="secondary" className="bg-orange-600 text-white">
                      {stats?.challenges?.pendingVerification || 0}
                    </Badge>
                  </div>

                  <div className="flex items-center justify-between p-4 bg-red-50 rounded-lg border border-red-200">
                    <div className="flex items-center gap-3">
                      <AlertCircle className="w-5 h-5 text-red-600" />
                      <div>
                        <p className="font-medium">User Reports</p>
                        <p className="text-sm text-muted-foreground">Need moderation</p>
                      </div>
                    </div>
                    <Badge variant="secondary" className="bg-red-600 text-white">
                      {stats?.reports?.pending || 0}
                    </Badge>
                  </div>

                  <Button className="w-full">View All Pending Items</Button>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </main>
      </div>
    </div>
  );
}