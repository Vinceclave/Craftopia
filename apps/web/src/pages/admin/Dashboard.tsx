// apps/web/src/pages/admin/Dashboard.tsx - MINIMALIST SHADCN + RECHARTS DESIGN
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Users, FileText, Trophy, TrendingUp, Loader2, ChevronRight,
  BarChart3, Recycle, Package, Leaf, Calendar, MoreHorizontal, Heart,
} from 'lucide-react';
import { useDashboardStats } from '@/hooks/useDashboard';
import { DashboardStats } from '@/lib/api';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid,
} from 'recharts';

// ===============================
// Reusable Components
// ===============================

// StatCard
const StatCard: React.FC<{
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: number | undefined;
  trend?: number;
}> = ({ icon: Icon, label, value, trend }) => (
  <Card className="border-border/50">
    <CardContent className="p-6">
      <div className="flex items-center justify-between">
        <div className="flex flex-col gap-2">
          <p className="text-sm text-muted-foreground font-medium">{label}</p>
          <p className="text-3xl font-light">{value?.toLocaleString() || '0'}</p>
          {trend !== undefined && (
            <div
              className={`flex items-center text-sm ${
                trend >= 0 ? 'text-emerald-600' : 'text-rose-600'
              }`}
            >
              <TrendingUp
                className={`w-4 h-4 mr-1 ${trend < 0 ? 'rotate-180' : ''}`}
              />
              {Math.abs(trend)}%
            </div>
          )}
        </div>
        <div className="w-12 h-12 bg-muted rounded-lg flex items-center justify-center">
          <Icon className="w-6 h-6 text-muted-foreground" />
        </div>
      </div>
    </CardContent>
  </Card>
);

// MetricCard
const MetricCard: React.FC<{
  title: string;
  icon: React.ComponentType<{ className?: string }>;
  children: React.ReactNode;
}> = ({ title, icon: Icon, children }) => (
  <Card className="border-border/50">
    <CardHeader className="pb-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Icon className="w-5 h-5 text-muted-foreground" />
          <CardTitle className="text-lg font-semibold">{title}</CardTitle>
        </div>
        <Button variant="ghost" size="icon" className="w-8 h-8">
          <MoreHorizontal className="w-4 h-4" />
        </Button>
      </div>
    </CardHeader>
    <CardContent>{children}</CardContent>
  </Card>
);

// MetricRow
const MetricRow: React.FC<{
  label: string;
  value: number | undefined;
  trend?: number;
}> = ({ label, value, trend }) => (
  <div className="flex items-center justify-between py-3 border-b border-border/50 last:border-0">
    <span className="text-sm font-medium">{label}</span>
    <div className="flex items-center gap-2">
      {trend !== undefined && (
        <div
          className={`flex items-center text-xs ${
            trend >= 0 ? 'text-emerald-600' : 'text-rose-600'
          }`}
        >
          <TrendingUp
            className={`w-3 h-3 mr-1 ${trend < 0 ? 'rotate-180' : ''}`}
          />
          {Math.abs(trend)}%
        </div>
      )}
      <span className="font-semibold">{value?.toLocaleString()}</span>
    </div>
  </div>
);

// QuickAction
const QuickAction: React.FC<{
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  description: string;
  onClick?: () => void;
}> = ({ icon: Icon, title, description, onClick }) => (
  <Button
    variant="ghost"
    className="flex items-center gap-4 p-4 h-auto justify-start hover:bg-accent w-full"
    onClick={onClick}
  >
    <div className="w-10 h-10 bg-muted rounded-lg flex items-center justify-center">
      <Icon className="w-5 h-5" />
    </div>
    <div className="text-left flex-1">
      <p className="font-medium text-sm">{title}</p>
      <p className="text-muted-foreground text-xs">{description}</p>
    </div>
    <ChevronRight className="w-4 h-4 text-muted-foreground" />
  </Button>
);

// RecyclablesGraph (Recharts)
const RecyclablesGraph: React.FC = () => {
  const data = [
    { category: 'Plastic', amount: 1250 },
    { category: 'Paper', amount: 890 },
    { category: 'Glass', amount: 450 },
    { category: 'Metal', amount: 320 },
  ];

  return (
    <Card className="border-border/50">
      <CardHeader className="pb-4 flex flex-col gap-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Recycle className="w-5 h-5 text-muted-foreground" />
            <CardTitle className="text-lg font-semibold">Recyclables</CardTitle>
          </div>
          <Badge variant="secondary" className="bg-emerald-50 text-emerald-700">
            +15%
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="flex flex-col gap-6">
        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data}>
              <CartesianGrid strokeDasharray="3 3" className="opacity-20" />
              <XAxis
                dataKey="category"
                tick={{ fontSize: 12 }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                tick={{ fontSize: 12 }}
                axisLine={false}
                tickLine={false}
              />
              <Tooltip cursor={{ fill: 'transparent' }} />
              <Bar dataKey="amount" fill="#6CAC73" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="grid grid-cols-3 gap-4 pt-4 border-t border-border/50 text-center">
          <div>
            <p className="text-xl font-light">3,185</p>
            <p className="text-xs text-muted-foreground">Total kg</p>
          </div>
          <div>
            <p className="text-xl font-light">+425</p>
            <p className="text-xs text-muted-foreground">This month</p>
          </div>
          <div>
            <p className="text-xl font-light">1.2t</p>
            <p className="text-xs text-muted-foreground">CO₂ saved</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

// TopPerformers
const TopPerformers: React.FC = () => (
  <Card className="border-border/50">
    <CardHeader className="pb-4 flex flex-col gap-2">
      <div className="flex items-center gap-3">
        <Trophy className="w-5 h-5 text-muted-foreground" />
        <CardTitle className="text-lg font-semibold">Top Performers</CardTitle>
      </div>
    </CardHeader>
    <CardContent className="flex flex-col gap-3">
      {['Eco Warrior', 'Green Thumb', 'Planet Saver'].map((name, index) => (
        <div
          key={name}
          className="flex items-center justify-between p-3 bg-muted/50 rounded-lg"
        >
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-background border rounded-lg flex items-center justify-center text-sm font-medium">
              {index + 1}
            </div>
            <span className="text-sm font-medium">{name}</span>
          </div>
          <Badge variant="secondary">1,250 pts</Badge>
        </div>
      ))}
    </CardContent>
  </Card>
);

// ===============================
// MAIN DASHBOARD
// ===============================
export default function AdminDashboard() {
  const { data, isLoading, error } = useDashboardStats();
  const stats: DashboardStats | undefined = data?.data;

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex items-center gap-3 text-muted-foreground">
          <Loader2 className="animate-spin w-5 h-5" />
          <span>Loading dashboard...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6">
        <Card className="max-w-md">
          <CardContent className="p-8 text-center flex flex-col gap-4">
            <div className="w-12 h-12 bg-destructive/10 rounded-lg flex items-center justify-center mx-auto">
              <BarChart3 className="w-6 h-6 text-destructive" />
            </div>
            <div className="flex flex-col gap-2">
              <CardTitle className="text-lg font-semibold">Unable to Load</CardTitle>
              <p className="text-muted-foreground text-sm">
                {(error as Error).message || 'Please try again.'}
              </p>
            </div>
            <Button>Retry</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-7xl mx-auto flex flex-col gap-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex flex-col gap-1">
            <h1 className="text-3xl font-light">Dashboard</h1>
            <p className="text-muted-foreground">
              Platform overview and analytics
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Badge variant="secondary" className="bg-emerald-50 text-emerald-700">
              Live
            </Badge>
            <Button variant="outline" className="gap-2">
              <Calendar className="w-4 h-4" />
              Last 7 days
            </Button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard icon={Users} label="Total Users" value={stats?.users?.total} trend={12} />
          <StatCard icon={FileText} label="Content Posts" value={stats?.content?.totalPosts} trend={8} />
          <StatCard icon={Trophy} label="Active Challenges" value={stats?.challenges?.active} trend={15} />
          <StatCard icon={Recycle} label="Recycled Items" value={3185} trend={15} />
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left */}
          <div className="lg:col-span-2 flex flex-col gap-8">
            <Tabs defaultValue="overview" className="flex flex-col gap-6">
              <TabsList className="grid grid-cols-3 w-full max-w-md">
                <TabsTrigger value="overview">Overview</TabsTrigger>
                <TabsTrigger value="recycling">Recycling</TabsTrigger>
                <TabsTrigger value="engagement">Engagement</TabsTrigger>
              </TabsList>

              {/* Overview */}
              <TabsContent value="overview" className="flex flex-col gap-6">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <MetricCard title="User Analytics" icon={Users}>
                    <div className="flex flex-col gap-1">
                      <MetricRow label="Active Users" value={stats?.users?.active} trend={8} />
                      <MetricRow label="New This Week" value={stats?.users?.newThisWeek} trend={12} />
                      <MetricRow label="Verified Users" value={stats?.users?.verified} trend={5} />
                    </div>
                  </MetricCard>

                  <MetricCard title="Content Metrics" icon={FileText}>
                    <div className="flex flex-col gap-1">
                      <MetricRow label="Posts Today" value={stats?.content?.postsToday} trend={18} />
                      <MetricRow label="Total Comments" value={stats?.content?.totalComments} trend={22} />
                      <MetricRow label="Avg Engagement" value={stats?.engagement?.average} trend={6} />
                    </div>
                  </MetricCard>
                </div>
                <RecyclablesGraph />
              </TabsContent>

              {/* Recycling */}
              <TabsContent value="recycling" className="flex flex-col gap-6">
                <RecyclablesGraph />
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <MetricCard title="Recycling Progress" icon={Package}>
                    <div className="flex flex-col gap-1">
                      <MetricRow label="Monthly Target" value={4000} trend={15} />
                      <MetricRow label="Recycling Rate" value={79} trend={8} />
                      <MetricRow label="Active Participants" value={1240} trend={12} />
                    </div>
                  </MetricCard>
                  <MetricCard title="Environmental Impact" icon={Leaf}>
                    <div className="flex flex-col gap-1">
                      <MetricRow label="Trees Saved" value={42} trend={15} />
                      <MetricRow label="CO₂ Reduction" value={12} trend={10} />
                      <MetricRow label="Energy Saved" value={3.2} trend={8} />
                    </div>
                  </MetricCard>
                </div>
              </TabsContent>

              {/* Engagement */}
              <TabsContent value="engagement" className="flex flex-col gap-6">
                <MetricCard title="Engagement Overview" icon={Heart}>
                  <div className="flex flex-col gap-1">
                    <MetricRow label="Total Likes" value={stats?.engagement?.totalLikes} trend={22} />
                    <MetricRow label="Total Comments" value={stats?.content?.totalComments} trend={18} />
                    <MetricRow label="Active Sessions" value={stats?.engagement?.sessions} trend={15} />
                  </div>
                </MetricCard>
              </TabsContent>
            </Tabs>
          </div>

          {/* Right */}
          <div className="flex flex-col gap-8">
            <Card className="border-border/50">
              <CardHeader className="pb-4">
                <CardTitle className="text-lg font-semibold">Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="flex flex-col gap-2">
                <QuickAction icon={Users} title="Manage Users" description="User management and permissions" />
                <QuickAction icon={Recycle} title="Recycling Stats" description="View detailed recycling analytics" />
                <QuickAction icon={FileText} title="Content Review" description="Moderate posts and comments" />
              </CardContent>
            </Card>

            <TopPerformers />

            <Card className="border-border/50">
              <CardContent className="p-6 flex flex-col gap-4">
                <div className="flex items-center gap-3">
                  <Leaf className="w-5 h-5 text-emerald-600" />
                  <h3 className="font-semibold">Environmental Impact</h3>
                </div>
                <div className="grid grid-cols-3 gap-4 text-center">
                  <div>
                    <p className="text-xl font-light">42</p>
                    <p className="text-xs text-muted-foreground">Trees</p>
                  </div>
                  <div>
                    <p className="text-xl font-light">18k</p>
                    <p className="text-xs text-muted-foreground">Water</p>
                  </div>
                  <div>
                    <p className="text-xl font-light">3.2</p>
                    <p className="text-xs text-muted-foreground">Energy</p>
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
  