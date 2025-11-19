// apps/web/src/pages/admin/Dashboard.tsx - REVISED WITH REAL DATA
import { useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Users, FileText, Trophy, TrendingUp, Loader2, ChevronRight,
  BarChart3, Recycle, Package, Leaf, Calendar, MoreHorizontal, Heart, Wifi, Bell,
  AlertCircle, CheckCircle, Clock, MessageSquare, Star
} from 'lucide-react';
import { 
  useDashboardStats, 
  useActivityLogs, 
  useTopUsers, 
  useRecentActivity 
} from '@/hooks/useDashboard';
import { useWebSocket, useWebSocketChallenges, useWebSocketPosts, useWebSocketAdminAlerts } from '@/hooks/useWebSocket';
import { useToast } from '@/hooks/useToast';
import { DashboardStats } from '@/lib/api';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid,
  LineChart, Line, Legend
} from 'recharts';

// ===============================
// Reusable Components
// ===============================

// StatCard with real data
const StatCard: React.FC<{
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: number | undefined;
  trend?: number;
  subtitle?: string;
}> = ({ icon: Icon, label, value, trend, subtitle }) => (
  <Card className="border border-[#6CAC73]/20 bg-white/80 backdrop-blur-sm shadow-lg hover:shadow-xl transition-all duration-300">
    <CardContent className="p-6">
      <div className="flex items-center justify-between">
        <div className="flex flex-col gap-2">
          <p className="text-sm text-gray-600 font-nunito font-medium">{label}</p>
          <p className="text-3xl font-bold text-[#2B4A2F] font-poppins">
            {value !== undefined ? value.toLocaleString() : '-'}
          </p>
          {subtitle && (
            <p className="text-xs text-gray-500 font-nunito">{subtitle}</p>
          )}
          {trend !== undefined && (
            <div
              className={`flex items-center text-sm font-poppins ${
                trend >= 0 ? 'text-[#6CAC73]' : 'text-rose-600'
              }`}
            >
              <TrendingUp
                className={`w-4 h-4 mr-1 ${trend < 0 ? 'rotate-180' : ''}`}
              />
              {Math.abs(trend)}% vs last period
            </div>
          )}
        </div>
        <div className="w-12 h-12 bg-gradient-to-br from-[#FFF9F0] to-white rounded-xl flex items-center justify-center border border-[#6CAC73]/10 shadow-sm">
          <Icon className="w-6 h-6 text-[#6CAC73]" />
        </div>
      </div>
    </CardContent>
  </Card>
);

// MetricRow with real data
const MetricRow: React.FC<{
  label: string;
  value: number | undefined;
  trend?: number;
}> = ({ label, value, trend }) => (
  <div className="flex items-center justify-between py-3 border-b border-[#6CAC73]/10 last:border-0">
    <span className="text-sm font-medium text-[#2B4A2F] font-poppins">{label}</span>
    <div className="flex items-center gap-2">
      {trend !== undefined && (
        <div
          className={`flex items-center text-xs font-poppins ${
            trend >= 0 ? 'text-[#6CAC73]' : 'text-rose-600'
          }`}
        >
          <TrendingUp
            className={`w-3 h-3 mr-1 ${trend < 0 ? 'rotate-180' : ''}`}
          />
          {Math.abs(trend)}%
        </div>
      )}
      <span className="font-semibold text-[#2B4A2F] font-poppins">
        {value !== undefined ? value.toLocaleString() : '-'}
      </span>
    </div>
  </div>
);

// Activity Timeline Component
const ActivityTimeline: React.FC<{ activities: any[] }> = ({ activities }) => {
  if (!activities || activities.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500 font-nunito">
        No recent activity to display
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {activities.slice(0, 5).map((activity: any, index: number) => (
        <div
          key={index}
          className="flex items-start gap-3 p-3 bg-gradient-to-br from-[#FFF9F0] to-white rounded-lg border border-[#6CAC73]/10"
        >
          <div className="w-8 h-8 bg-gradient-to-br from-[#6CAC73] to-[#2B4A2F] rounded-lg flex items-center justify-center flex-shrink-0">
            {activity.type === 'post' && <FileText className="w-4 h-4 text-white" />}
            {activity.type === 'challenge' && <Trophy className="w-4 h-4 text-white" />}
            {activity.type === 'user' && <Users className="w-4 h-4 text-white" />}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-[#2B4A2F] font-poppins truncate">
              {activity.title || activity.challenge?.title || 'Activity'}
            </p>
            <p className="text-xs text-gray-500 font-nunito">
              {activity.user?.username || 'User'} • {new Date(activity.created_at).toLocaleDateString()}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
};

// Activity Chart Component
const ActivityChart: React.FC<{ data: any[] }> = ({ data }) => {
  if (!data || data.length === 0) {
    return (
      <div className="h-64 flex items-center justify-center text-gray-500 font-nunito">
        No activity data available
      </div>
    );
  }

  return (
    <div className="h-64 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" className="opacity-20" stroke="#6CAC73" />
          <XAxis
            dataKey="date"
            tick={{ fontSize: 12, fill: '#2B4A2F' }}
            axisLine={false}
            tickLine={false}
          />
          <YAxis
            tick={{ fontSize: 12, fill: '#2B4A2F' }}
            axisLine={false}
            tickLine={false}
          />
          <Tooltip
            cursor={{ fill: 'transparent' }}
            contentStyle={{
              backgroundColor: 'rgba(255, 255, 255, 0.9)',
              border: '1px solid #6CAC73',
              borderRadius: '8px',
              backdropFilter: 'blur(8px)'
            }}
          />
          <Legend />
          <Line type="monotone" dataKey="users" stroke="#6CAC73" strokeWidth={2} name="Users" />
          <Line type="monotone" dataKey="posts" stroke="#2B4A2F" strokeWidth={2} name="Posts" />
          <Line type="monotone" dataKey="challenges" stroke="#8884d8" strokeWidth={2} name="Challenges" />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

// Top Performers Component with real data
const TopPerformers: React.FC<{ users: any[] }> = ({ users }) => {
  if (!users || users.length === 0) {
    return (
      <Card className="border border-[#6CAC73]/20 bg-white/80 backdrop-blur-sm shadow-lg">
        <CardHeader className="pb-4">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-gradient-to-br from-[#6CAC73] to-[#2B4A2F] rounded-lg flex items-center justify-center">
              <Trophy className="w-4 h-4 text-white" />
            </div>
            <CardTitle className="text-lg font-semibold text-[#2B4A2F] font-poppins">Top Performers</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-gray-500 font-nunito">
            No user data available
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border border-[#6CAC73]/20 bg-white/80 backdrop-blur-sm shadow-lg">
      <CardHeader className="pb-4">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-gradient-to-br from-[#6CAC73] to-[#2B4A2F] rounded-lg flex items-center justify-center">
            <Trophy className="w-4 h-4 text-white" />
          </div>
          <CardTitle className="text-lg font-semibold text-[#2B4A2F] font-poppins">Top Performers</CardTitle>
        </div>
      </CardHeader>
      <CardContent className="flex flex-col gap-3">
        {users.slice(0, 5).map((userData: any, index: number) => (
          <div
            key={userData.user_id}
            className="flex items-center justify-between p-3 bg-gradient-to-br from-[#FFF9F0] to-white rounded-xl border border-[#6CAC73]/10"
          >
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-gradient-to-br from-[#6CAC73] to-[#2B4A2F] rounded-lg flex items-center justify-center text-sm font-medium text-white font-poppins">
                {index + 1}
              </div>
              <div>
                <span className="text-sm font-medium text-[#2B4A2F] font-poppins">
                  {userData.user?.username || 'Unknown'}
                </span>
                <p className="text-xs text-gray-500 font-nunito">
                  {userData.counts?.completedChallenges || 0} challenges
                </p>
              </div>
            </div>
            <Badge className="bg-gradient-to-r from-[#6CAC73]/20 to-[#2B4A2F]/10 text-[#2B4A2F] border-0 font-poppins">
              {userData.points || 0} pts
            </Badge>
          </div>
        ))}
      </CardContent>
    </Card>
  );
};

// Recent Activity Component
const RecentActivityCard: React.FC<{ activity: any }> = ({ activity }) => {
  if (!activity) {
    return (
      <Card className="border border-[#6CAC73]/20 bg-white/80 backdrop-blur-sm shadow-lg">
        <CardHeader>
          <CardTitle className="text-lg font-semibold text-[#2B4A2F] font-poppins">Recent Activity</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-gray-500 font-nunito">
            <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2" />
            Loading activity...
          </div>
        </CardContent>
      </Card>
    );
  }

  const { recentPosts = [], recentChallenges = [], recentReports = [] } = activity;
  const hasActivity = recentPosts.length > 0 || recentChallenges.length > 0 || recentReports.length > 0;

  return (
    <Card className="border border-[#6CAC73]/20 bg-white/80 backdrop-blur-sm shadow-lg">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-semibold text-[#2B4A2F] font-poppins">Recent Activity</CardTitle>
          <Badge className="bg-gradient-to-r from-[#6CAC73]/20 to-[#2B4A2F]/10 text-[#2B4A2F] border-0 font-poppins">
            <Wifi className="w-3 h-3 mr-1 animate-pulse" />
            Live
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        {!hasActivity ? (
          <div className="text-center py-8 text-gray-500 font-nunito">
            No recent activity
          </div>
        ) : (
          <div className="space-y-3">
            {recentPosts.slice(0, 3).map((post: any) => (
              <div
                key={`post-${post.post_id}`}
                className="flex items-start gap-3 p-3 bg-gradient-to-br from-[#FFF9F0] to-white rounded-lg border border-[#6CAC73]/10"
              >
                <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center flex-shrink-0">
                  <FileText className="w-4 h-4 text-white" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-[#2B4A2F] font-poppins truncate">
                    {post.title}
                  </p>
                  <p className="text-xs text-gray-500 font-nunito">
                    Posted by {post.user?.username} • {new Date(post.created_at).toLocaleDateString()}
                  </p>
                </div>
              </div>
            ))}
            
            {recentChallenges.slice(0, 3).map((challenge: any) => (
              <div
                key={`challenge-${challenge.user_challenge_id}`}
                className="flex items-start gap-3 p-3 bg-gradient-to-br from-[#FFF9F0] to-white rounded-lg border border-[#6CAC73]/10"
              >
                <div className="w-8 h-8 bg-gradient-to-br from-[#6CAC73] to-[#2B4A2F] rounded-lg flex items-center justify-center flex-shrink-0">
                  <Trophy className="w-4 h-4 text-white" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-[#2B4A2F] font-poppins truncate">
                    {challenge.challenge?.title || 'Challenge'}
                  </p>
                  <p className="text-xs text-gray-500 font-nunito">
                    {challenge.user?.username} • {challenge.status}
                  </p>
                </div>
              </div>
            ))}
            
            {recentReports.slice(0, 2).map((report: any) => (
              <div
                key={`report-${report.report_id}`}
                className="flex items-start gap-3 p-3 bg-gradient-to-br from-orange-50 to-white rounded-lg border border-orange-200/40"
              >
                <div className="w-8 h-8 bg-gradient-to-br from-orange-500 to-orange-600 rounded-lg flex items-center justify-center flex-shrink-0">
                  <AlertCircle className="w-4 h-4 text-white" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-[#2B4A2F] font-poppins truncate">
                    Report #{report.report_id}
                  </p>
                  <p className="text-xs text-gray-500 font-nunito">
                    {report.status} • {new Date(report.created_at).toLocaleDateString()}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

// ===============================
// MAIN DASHBOARD WITH REAL DATA
// ===============================
export default function AdminDashboard() {
  const { data: statsData, isLoading: statsLoading, error: statsError, refetch: refetchStats } = useDashboardStats();
  const { data: activityData, isLoading: activityLoading } = useActivityLogs(7);
  const { data: topUsersData, isLoading: topUsersLoading } = useTopUsers(10);
  const { data: recentActivityData, isLoading: recentActivityLoading } = useRecentActivity(20);
  
  const stats: DashboardStats | undefined = statsData?.data;
  const activityLogs = activityData?.data || [];
  const topUsers = topUsersData?.data || [];
  const recentActivity = recentActivityData?.data;
  
  const { isConnected } = useWebSocket();
  const { info, warning, success } = useToast();

  // WebSocket real-time event handlers
  useWebSocketChallenges({
    onCreated: useCallback(() => {
      info('New challenge created!');
      refetchStats();
    }, [info, refetchStats]),

    onCompleted: useCallback(() => {
      success('A user completed a challenge!');
      refetchStats();
    }, [success, refetchStats]),

    onVerified: useCallback((data: { points_awarded?: number } | unknown) => {
      const d = data as { points_awarded?: number };
      success(`Challenge verified! ${d.points_awarded ?? 0} points awarded`);
      refetchStats();
    }, [success, refetchStats]),
  });

  useWebSocketPosts({
    onCreated: useCallback(() => {
      info('New post created on the platform');
      refetchStats();
    }, [info, refetchStats]),
  });

  useWebSocketAdminAlerts(
    useCallback((data: { type?: string; message?: string } | unknown) => {
      const d = data as { type?: string; message?: string };
      if (d.type === 'challenge_pending') {
        warning('New challenge pending verification');
        refetchStats();
      } else {
        info(d.message || 'Admin alert received');
      }
    }, [warning, info, refetchStats])
  );

  const isLoading = statsLoading || activityLoading || topUsersLoading || recentActivityLoading;

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#FFF9F0] to-white">
        <div className="flex items-center gap-3 text-[#2B4A2F] font-poppins">
          <Loader2 className="animate-spin w-5 h-5 text-[#6CAC73]" />
          <span>Loading dashboard...</span>
        </div>
      </div>
    );
  }

  if (statsError) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6 bg-gradient-to-br from-[#FFF9F0] to-white">
        <Card className="max-w-md border border-[#6CAC73]/20 bg-white/80 backdrop-blur-sm">
          <CardContent className="p-8 text-center flex flex-col gap-4">
            <div className="w-12 h-12 bg-gradient-to-br from-[#FFF9F0] to-white rounded-xl flex items-center justify-center mx-auto border border-[#6CAC73]/10">
              <BarChart3 className="w-6 h-6 text-[#6CAC73]" />
            </div>
            <div className="flex flex-col gap-2">
              <CardTitle className="text-lg font-semibold text-[#2B4A2F] font-poppins">Unable to Load</CardTitle>
              <p className="text-gray-600 text-sm font-nunito">
                {(statsError as Error).message || 'Please try again.'}
              </p>
            </div>
            <Button 
              onClick={() => refetchStats()}
              className="bg-gradient-to-br from-[#2B4A2F] to-[#6CAC73] hover:from-[#2B4A2F]/90 hover:to-[#6CAC73]/90 text-white border-0"
            >
              Retry
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#FFF9F0] to-white p-6 relative">
      {/* Background Floating Elements */}
      <div className="absolute inset-0 pointer-events-none">
        {[...Array(5)].map((_, i) => (
          <div
            key={i}
            className="absolute w-2 h-2 bg-[#6CAC73] rounded-full opacity-20 animate-float"
            style={{
              left: `${15 + i * 20}%`,
              top: `${10 + (i % 4) * 25}%`,
              animationDelay: `${i * 1.2}s`,
              animationDuration: '4s'
            }}
          />
        ))}
      </div>

      <div className="max-w-7xl mx-auto flex flex-col gap-8 relative z-10">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex flex-col gap-1">
            <div className="flex items-center gap-3">
              <h1 className="text-3xl font-bold text-[#2B4A2F] font-poppins">Dashboard</h1>
              {isConnected && (
                <Badge className="bg-gradient-to-r from-[#6CAC73]/20 to-[#2B4A2F]/10 text-[#2B4A2F] border border-[#6CAC73]/30 font-poppins animate-pulse">
                  <Wifi className="w-3 h-3 mr-1" />
                  Live
                </Badge>
              )}
            </div>
            <p className="text-gray-600 font-nunito">
              Platform overview and real-time analytics
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Badge className="bg-gradient-to-r from-blue-500/20 to-blue-600/20 text-blue-700 border-0 font-poppins">
              <Bell className="w-3 h-3 mr-1" />
              Real-time
            </Badge>
            <Button 
              onClick={() => refetchStats()}
              className="gap-2 border border-[#6CAC73]/20 bg-white/80 backdrop-blur-sm hover:bg-[#6CAC73]/10 text-[#2B4A2F]"
            >
              <Calendar className="w-4 h-4" />
              Refresh
            </Button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard 
            icon={Users} 
            label="Total Users" 
            value={stats?.users?.total} 
            subtitle={`${stats?.users?.active || 0} active`}
          />
          <StatCard 
            icon={FileText} 
            label="Content Posts" 
            value={stats?.content?.totalPosts}
            subtitle={`${stats?.content?.postsToday || 0} today`}
          />
          <StatCard 
            icon={Trophy} 
            label="Active Challenges" 
            value={stats?.challenges?.active}
            subtitle={`${stats?.challenges?.pendingVerification || 0} pending`}
          />
          <StatCard 
            icon={Heart} 
            label="Total Engagement" 
            value={stats?.engagement?.totalLikes}
            subtitle={`${stats?.content?.totalComments || 0} comments`}
          />
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left - Charts and Analytics */}
          <div className="lg:col-span-2 flex flex-col gap-8">
            {/* Activity Chart */}
            <Card className="border border-[#6CAC73]/20 bg-white/80 backdrop-blur-sm shadow-lg">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-gradient-to-br from-[#6CAC73] to-[#2B4A2F] rounded-lg flex items-center justify-center">
                      <BarChart3 className="w-4 h-4 text-white" />
                    </div>
                    <CardTitle className="text-lg font-semibold text-[#2B4A2F] font-poppins">
                      Activity Trends (Last 7 Days)
                    </CardTitle>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <ActivityChart data={activityLogs} />
              </CardContent>
            </Card>

            {/* Detailed Stats Tabs */}
            <Tabs defaultValue="users" className="flex flex-col gap-6">
              <TabsList className="grid w-full grid-cols-3 bg-white/80 border border-[#6CAC73]/20">
                <TabsTrigger 
                  value="users" 
                  className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-[#6CAC73] data-[state=active]:to-[#2B4A2F] data-[state=active]:text-white font-poppins"
                >
                  Users
                </TabsTrigger>
                <TabsTrigger 
                  value="content" 
                  className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-[#6CAC73] data-[state=active]:to-[#2B4A2F] data-[state=active]:text-white font-poppins"
                >
                  Content
                </TabsTrigger>
                <TabsTrigger 
                  value="challenges" 
                  className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-[#6CAC73] data-[state=active]:to-[#2B4A2F] data-[state=active]:text-white font-poppins"
                >
                  Challenges
                </TabsTrigger>
              </TabsList>

              {/* Users Tab */}
              <TabsContent value="users">
                <Card className="border border-[#6CAC73]/20 bg-white/80 backdrop-blur-sm shadow-lg">
                  <CardHeader>
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-gradient-to-br from-[#6CAC73] to-[#2B4A2F] rounded-lg flex items-center justify-center">
                        <Users className="w-4 h-4 text-white" />
                      </div>
                      <CardTitle className="text-lg font-semibold text-[#2B4A2F] font-poppins">
                        User Analytics
                      </CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-col gap-1">
                      <MetricRow label="Total Users" value={stats?.users?.total} />
                      <MetricRow label="Active Users" value={stats?.users?.active} />
                      <MetricRow label="New This Week" value={stats?.users?.newThisWeek} />
                      <MetricRow label="New Today" value={stats?.users?.newToday} />
                      <MetricRow label="Verified Users" value={stats?.users?.verified} />
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Content Tab */}
              <TabsContent value="content">
                <Card className="border border-[#6CAC73]/20 bg-white/80 backdrop-blur-sm shadow-lg">
                  <CardHeader>
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-gradient-to-br from-[#6CAC73] to-[#2B4A2F] rounded-lg flex items-center justify-center">
                        <FileText className="w-4 h-4 text-white" />
                      </div>
                      <CardTitle className="text-lg font-semibold text-[#2B4A2F] font-poppins">
                        Content Metrics
                      </CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-col gap-1">
                      <MetricRow label="Total Posts" value={stats?.content?.totalPosts} />
                      <MetricRow label="Posts Today" value={stats?.content?.postsToday} />
                      <MetricRow label="Total Comments" value={stats?.content?.totalComments} />
                      <MetricRow label="Total Crafts" value={stats?.content?.totalCrafts} />
                      <MetricRow label="Total Likes" value={stats?.engagement?.totalLikes} />
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Challenges Tab */}
              <TabsContent value="challenges">
                <Card className="border border-[#6CAC73]/20 bg-white/80 backdrop-blur-sm shadow-lg">
                  <CardHeader>
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-gradient-to-br from-[#6CAC73] to-[#2B4A2F] rounded-lg flex items-center justify-center">
                        <Trophy className="w-4 h-4 text-white" />
                      </div>
                      <CardTitle className="text-lg font-semibold text-[#2B4A2F] font-poppins">
                        Challenge Statistics
                      </CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-col gap-1">
                      <MetricRow label="Total Challenges" value={stats?.challenges?.total} />
                      <MetricRow label="Active Challenges" value={stats?.challenges?.active} />
                      <MetricRow label="Completed" value={stats?.challenges?.completed} />
                      <MetricRow label="Pending Verification" value={stats?.challenges?.pendingVerification} />
                      <MetricRow label="Avg per User" value={stats?.engagement?.avgChallengesPerUser} />
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>

          {/* Right - Sidebar */}
          <div className="flex flex-col gap-8">
            {/* Top Performers */}
            <TopPerformers users={topUsers} />

            {/* Recent Activity */}
            <RecentActivityCard activity={recentActivity} />

            {/* Reports Summary */}
            <Card className="border border-[#6CAC73]/20 bg-white/80 backdrop-blur-sm shadow-lg">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-gradient-to-br from-orange-500 to-orange-600 rounded-lg flex items-center justify-center">
                    <AlertCircle className="w-4 h-4 text-white" />
                  </div>
                  <CardTitle className="text-lg font-semibold text-[#2B4A2F] font-poppins">
                    Reports Status
                  </CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 bg-gradient-to-br from-[#FFF9F0] to-white rounded-lg border border-[#6CAC73]/10">
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4 text-orange-600" />
                      <span className="text-sm font-medium text-[#2B4A2F] font-poppins">Pending</span>
                    </div>
                    <Badge className="bg-gradient-to-r from-orange-500/20 to-orange-600/20 text-orange-700 border-0 font-poppins">
                      {stats?.reports?.pending || 0}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-gradient-to-br from-[#FFF9F0] to-white rounded-lg border border-[#6CAC73]/10">
                    <div className="flex items-center gap-2">
                      <AlertCircle className="w-4 h-4 text-blue-600" />
                      <span className="text-sm font-medium text-[#2B4A2F] font-poppins">In Review</span>
                    </div>
                    <Badge className="bg-gradient-to-r from-blue-500/20 to-blue-600/20 text-blue-700 border-0 font-poppins">
                      {stats?.reports?.in_review || 0}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-gradient-to-br from-[#FFF9F0] to-white rounded-lg border border-[#6CAC73]/10">
                    <div className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-[#6CAC73]" />
                      <span className="text-sm font-medium text-[#2B4A2F] font-poppins">Resolved</span>
                    </div>
                    <Badge className="bg-gradient-to-r from-[#6CAC73]/20 to-[#2B4A2F]/10 text-[#2B4A2F] border-0 font-poppins">
                      {stats?.reports?.resolved || 0}
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Engagement Stats */}
            <Card className="border border-[#6CAC73]/20 bg-white/80 backdrop-blur-sm shadow-lg">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-gradient-to-br from-[#6CAC73] to-[#2B4A2F] rounded-lg flex items-center justify-center">
                    <Heart className="w-4 h-4 text-white" />
                  </div>
                  <CardTitle className="text-lg font-semibold text-[#2B4A2F] font-poppins">
                    Engagement
                  </CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="text-center p-3 bg-gradient-to-br from-[#FFF9F0] to-white rounded-lg border border-[#6CAC73]/10">
                    <p className="text-xs text-gray-500 mb-1 font-nunito">Avg Posts per User</p>
                    <p className="text-2xl font-bold text-[#2B4A2F] font-poppins">
                      {stats?.engagement?.avgPostsPerUser?.toFixed(2) || '0.00'}
                    </p>
                  </div>
                  <div className="text-center p-3 bg-gradient-to-br from-[#FFF9F0] to-white rounded-lg border border-[#6CAC73]/10">
                    <p className="text-xs text-gray-500 mb-1 font-nunito">Avg Challenges per User</p>
                    <p className="text-2xl font-bold text-[#2B4A2F] font-poppins">
                      {stats?.engagement?.avgChallengesPerUser?.toFixed(2) || '0.00'}
                    </p>
                  </div>
                  <div className="text-center p-3 bg-gradient-to-br from-[#FFF9F0] to-white rounded-lg border border-[#6CAC73]/10">
                    <p className="text-xs text-gray-500 mb-1 font-nunito">Active Sessions</p>
                    <p className="text-2xl font-bold text-[#2B4A2F] font-poppins">
                      {(stats?.engagement as any)?.sessions || 0}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}