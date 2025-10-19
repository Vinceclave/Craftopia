  // apps/web/src/pages/admin/Dashboard.tsx
  import React from 'react';
  import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
  import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
  import { Badge } from '@/components/ui/badge';
  import { Button } from '@/components/ui/button';
  import { 
    Users, FileText, Trophy, AlertCircle, TrendingUp, Loader2, ChevronRight,
    Shield, BarChart3, Clock, MessageCircle, Heart, Zap
  } from 'lucide-react';
  import { useDashboardStats } from '@/hooks/useDashboard';
  import { DashboardStats } from '@/lib/api';

  // StatCard Component
  interface StatCardProps {
    icon: React.ComponentType<{ className?: string }>;
    label: string;
    value: number | undefined;
    trend?: string;
    trendType?: 'positive' | 'negative' | 'neutral';
    loading?: boolean;
  }

  const StatCard: React.FC<StatCardProps> = ({
    icon: Icon,
    label,
    value,
    trend,
    trendType = 'positive',
    loading = false
  }) => {
    const trendColors = {
      positive: 'text-emerald-600',
      negative: 'text-rose-600',
      neutral: 'text-gray-600',
    };

    return (
      <Card className="border border-gray-100 bg-white shadow-sm hover:shadow-md transition-shadow duration-200">
        <CardContent className="p-4 sm:p-5 flex justify-between items-center gap-4">
          <div className="flex-1 space-y-1">
            <p className="text-sm font-medium text-gray-500 uppercase tracking-wide">{label}</p>
            <div className="flex items-center gap-2">
              <p className="text-2xl font-semibold text-gray-900">{value?.toLocaleString() || '0'}</p>
              {loading && <Loader2 className="w-4 h-4 animate-spin text-gray-400" />}
            </div>
            {trend && (
              <div className={`flex items-center text-sm font-medium ${trendColors[trendType]}`}>
                <TrendingUp className={`w-4 h-4 mr-1 ${trendType === 'negative' ? 'rotate-180' : ''}`} />
                {trend}
              </div>
            )}
          </div>
          <div className="w-12 h-12 bg-gray-50 rounded-xl flex items-center justify-center">
            <Icon className="w-6 h-6 text-gray-600" />
          </div>
        </CardContent>
      </Card>
    );
  };

  // MetricRow Component
  interface MetricRowProps {
    label: string;
    value: number | undefined;
    suffix?: string;
    icon?: React.ComponentType<{ className?: string }>;
    trend?: number;
  }

  const MetricRow: React.FC<MetricRowProps> = ({ label, value, suffix, icon: Icon, trend }) => (
    <div className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0">
      <div className="flex items-center gap-3">
        {Icon && (
          <div className="w-7 h-7 sm:w-8 sm:h-8 bg-gray-50 rounded-lg flex items-center justify-center">
            <Icon className="w-4 h-4 text-gray-500" />
          </div>
        )}
        <span className="text-sm font-medium text-gray-700">{label}</span>
      </div>
      <div className="flex items-center gap-3">
        {trend !== undefined && (
          <div className={`flex items-center text-xs font-medium ${trend >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
            <TrendingUp className={`w-3 h-3 mr-1 ${trend < 0 ? 'rotate-180' : ''}`} />
            {Math.abs(trend)}%
          </div>
        )}
        <span className="font-semibold text-gray-900 text-sm">{value?.toLocaleString()}{suffix}</span>
      </div>
    </div>
  );

  export default function AdminDashboard() {
    const { data, isLoading, error } = useDashboardStats();
    const stats: DashboardStats | undefined = data?.data;

    if (isLoading) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-white p-4">
          <div className="flex items-center gap-3 text-gray-600">
            <Loader2 className="animate-spin w-5 h-5" />
            <span>Loading dashboard...</span>
          </div>
        </div>
      );
    }

    if (error) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-white p-4">
          <Card className="max-w-md border border-gray-100">
            <CardContent className="p-6 text-center">
              <AlertCircle className="w-8 h-8 text-rose-500 mx-auto mb-3" />
              <CardTitle className="text-lg font-semibold text-gray-900 mb-2">Unable to Load Dashboard</CardTitle>
              <p className="text-gray-500 text-sm mb-4">{(error as Error).message || 'Please try again.'}</p>
              <Button className="bg-gray-900 text-white">Retry</Button>
            </CardContent>
          </Card>
        </div>
      );
    }

    return (
      <main className="min-h-screen bg-white p-4 sm:p-6 lg:p-8 flex flex-col gap-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gray-900 rounded-xl flex items-center justify-center">
              <Shield className="w-5 h-5 text-white" />
            </div>
            <div className="flex flex-col gap-1">
              <h1 className="text-2xl sm:text-3xl font-semibold text-gray-900">Dashboard</h1>
              <p className="text-gray-500 text-sm sm:text-base">Platform overview and analytics</p>
            </div>
          </div>
          <div className="flex items-center gap-2 sm:gap-3">
            <Badge className="bg-gray-100 text-gray-700 text-xs sm:text-sm">Live</Badge>
            <span className="text-gray-500 text-sm sm:text-base">Updated just now</span>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          <StatCard 
            icon={Users}
            label="Total Users"
            value={stats?.users?.total}
            trend={`+${stats?.users?.newToday || 0} today`}
          />
          <StatCard 
            icon={FileText}
            label="Content Posts"
            value={stats?.content?.totalPosts}
            trend={`+${stats?.content?.postsToday || 0} today`}
          />
          <StatCard 
            icon={Trophy}
            label="Active Challenges"
            value={stats?.challenges?.active}
            trend={`${stats?.challenges?.completed || 0} completed`}
            trendType="neutral"
          />
          <StatCard 
            icon={AlertCircle}
            label="Pending Actions"
            value={stats?.reports?.pending}
            trend={`${stats?.reports?.resolved || 0} resolved`}
            trendType="negative"
          />
        </div>

        {/* Tabs Section */}
        <Tabs defaultValue="overview" className="flex flex-col gap-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <TabsList className="flex gap-2 bg-gray-50 p-1 rounded-lg flex-wrap sm:flex-nowrap">
              {[ 
                { id: 'overview', label: 'Overview', icon: BarChart3 },
                { id: 'engagement', label: 'Engagement', icon: Heart },
                { id: 'content', label: 'Content', icon: FileText },
                { id: 'moderation', label: 'Moderation', icon: Shield }
              ].map(tab => (
                <TabsTrigger 
                  key={tab.id} 
                  value={tab.id}
                  className="flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-md transition-all duration-200 data-[state=active]:bg-white data-[state=active]:shadow-sm data-[state=active]:text-gray-900 text-gray-500 hover:text-gray-700"
                >
                  <tab.icon className="w-4 h-4" />
                  {tab.label}
                </TabsTrigger>
              ))}
            </TabsList>

            <div className="flex items-center gap-2 sm:gap-3">
              <select className="text-sm sm:text-base border border-gray-200 rounded-lg px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent">
                <option>Last 7 days</option>
                <option>Last 30 days</option>
                <option>Last 90 days</option>
              </select>
            </div>
          </div>

          {/* Overview Tab */}
          <TabsContent value="overview" className="flex flex-col gap-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* User Metrics */}
              <Card className="border border-gray-100">
                <CardHeader className="flex justify-between items-center p-4">
                  <CardTitle className="text-lg font-semibold text-gray-900">User Metrics</CardTitle>
                  <Users className="w-5 h-5 text-gray-400" />
                </CardHeader>
                <CardContent className="flex flex-col gap-4 p-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="text-center p-4 bg-gray-50 rounded-lg">
                      <p className="text-2xl font-semibold text-gray-900">{stats?.users?.active || 0}</p>
                      <p className="text-sm text-gray-500 mt-1">Active</p>
                    </div>
                    <div className="text-center p-4 bg-gray-50 rounded-lg">
                      <p className="text-2xl font-semibold text-gray-900">{stats?.users?.newThisWeek || 0}</p>
                      <p className="text-sm text-gray-500 mt-1">New This Week</p>
                    </div>
                  </div>
                  <MetricRow label="Total Users" value={stats?.users?.total} trend={12} />
                  <MetricRow label="Verified Users" value={stats?.users?.verified} trend={8} />
                </CardContent>
              </Card>

              {/* Content Metrics */}
              <Card className="border border-gray-100">
                <CardHeader className="flex justify-between items-center p-4">
                  <CardTitle className="text-lg font-semibold text-gray-900">Content Metrics</CardTitle>
                  <FileText className="w-5 h-5 text-gray-400" />
                </CardHeader>
                <CardContent className="flex flex-col gap-4 p-4">
                  <div className="grid grid-cols-3 gap-3">
                    <div className="text-center p-3 bg-gray-50 rounded-lg">
                      <p className="text-lg font-semibold text-gray-900">{stats?.content?.postsToday || 0}</p>
                      <p className="text-xs text-gray-500 mt-1">Today</p>
                    </div>
                    <div className="text-center p-3 bg-gray-50 rounded-lg">
                      <p className="text-lg font-semibold text-gray-900">{stats?.content?.totalPosts || 0}</p>
                      <p className="text-xs text-gray-500 mt-1">Total</p>
                    </div>
                    <div className="text-center p-3 bg-gray-50 rounded-lg">
                      <p className="text-lg font-semibold text-gray-900">{stats?.engagement?.average || 0}</p>
                      <p className="text-xs text-gray-500 mt-1">Avg/Post</p>
                    </div>
                  </div>
                  <MetricRow label="Total Comments" value={stats?.content?.totalComments} trend={18} />
                  <MetricRow label="Total Crafts" value={stats?.content?.totalCrafts} trend={25} />
                </CardContent>
              </Card>
            </div>

            {/* Quick Actions */}
            <Card className="border border-gray-100">
              <CardHeader className="p-4">
                <CardTitle className="text-lg font-semibold text-gray-900">Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="grid grid-cols-1 sm:grid-cols-3 gap-4 p-4">
                <Button variant="outline" className="flex items-center gap-3 p-4 h-auto justify-start">
                  <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center">
                    <Users className="w-5 h-5 text-blue-600" />
                  </div>
                  <div className="text-left">
                    <p className="font-medium text-gray-900 text-sm">Manage Users</p>
                    <p className="text-gray-500 text-xs">User management</p>
                  </div>
                </Button>

                <Button variant="outline" className="flex items-center gap-3 p-4 h-auto justify-start">
                  <div className="w-10 h-10 bg-green-50 rounded-lg flex items-center justify-center">
                    <FileText className="w-5 h-5 text-green-600" />
                  </div>
                  <div className="text-left">
                    <p className="font-medium text-gray-900 text-sm">Content Review</p>
                    <p className="text-gray-500 text-xs">Moderate posts</p>
                  </div>
                </Button>

                <Button variant="outline" className="flex items-center gap-3 p-4 h-auto justify-start">
                  <div className="w-10 h-10 bg-purple-50 rounded-lg flex items-center justify-center">
                    <Trophy className="w-5 h-5 text-purple-600" />
                  </div>
                  <div className="text-left">
                    <p className="font-medium text-gray-900 text-sm">Challenges</p>
                    <p className="text-gray-500 text-xs">Manage events</p>
                  </div>
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Engagement Tab */}
          <TabsContent value="engagement" className="flex flex-col gap-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card className="border border-gray-100">
                <CardHeader className="flex justify-between items-center p-4">
                  <CardTitle className="text-lg font-semibold text-gray-900">Engagement Overview</CardTitle>
                  <Heart className="w-5 h-5 text-gray-400" />
                </CardHeader>
                <CardContent className="flex flex-col gap-3 p-4">
                  <MetricRow label="Total Likes" value={stats?.engagement?.totalLikes} icon={Heart} trend={22} />
                  <MetricRow label="Total Comments" value={stats?.content?.totalComments} icon={MessageCircle} trend={18} />
                  <MetricRow label="Average Engagement" value={stats?.engagement?.average} suffix="/post" icon={BarChart3} trend={5} />
                  <MetricRow label="Active Sessions" value={stats?.engagement?.sessions} icon={Zap} trend={15} />
                </CardContent>
              </Card>

              <Card className="border border-gray-100">
                <CardHeader className="flex justify-between items-center p-4">
                  <CardTitle className="text-lg font-semibold text-gray-900">Top Performers</CardTitle>
                  <Trophy className="w-5 h-5 text-gray-400" />
                </CardHeader>
                <CardContent className="flex flex-col gap-3 p-4">
                  {['Creative Crafts', 'Artisan Hub', 'DIY Masters'].map((item, index) => (
                    <div key={item} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-gray-200 rounded-lg flex items-center justify-center text-sm font-medium text-gray-600">
                          {index + 1}
                        </div>
                        <span className="text-sm font-medium text-gray-900">{item}</span>
                      </div>
                      <Badge variant="secondary" className="bg-white text-gray-700">
                        +{Math.floor(Math.random() * 45) + 5}%
                      </Badge>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Moderation Tab */}
          <TabsContent value="moderation" className="flex flex-col gap-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card className="border border-gray-100">
                <CardHeader className="flex justify-between items-center p-4">
                  <CardTitle className="text-lg font-semibold text-gray-900">Reports</CardTitle>
                  <AlertCircle className="w-5 h-5 text-gray-400" />
                </CardHeader>
                <CardContent className="flex flex-col gap-3 p-4">
                  <MetricRow label="Pending Reports" value={stats?.reports?.pending} trend={-12} />
                  <MetricRow label="Resolved Reports" value={stats?.reports?.resolved} trend={8} />
                  <MetricRow label="Total Reports" value={stats?.reports?.total} trend={0} />
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </main>
    );
  }
