// apps/web/src/pages/admin/Dashboard.tsx - ENHANCED WITH MATERIALS AND WASTE_KG TRACKING
import React, { useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Users, FileText, Trophy, TrendingUp, Loader2, ChevronRight,
  BarChart3, Recycle, Package, Leaf, Calendar, MoreHorizontal, Heart, Wifi, Bell,
} from 'lucide-react';
import { useDashboardStats } from '@/hooks/useDashboard';
import { useWebSocket, useWebSocketChallenges, useWebSocketPosts, useWebSocketAdminAlerts } from '@/hooks/useWebSocket';
import { useToast } from '@/hooks/useToast';
import { DashboardStats } from '@/lib/api';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Legend,
  PieChart, Pie, Cell
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
  suffix?: string;
}> = ({ icon: Icon, label, value, trend, suffix = '' }) => (
  <Card className="border border-[#6CAC73]/20 bg-white/80 backdrop-blur-sm shadow-lg hover:shadow-xl transition-all duration-300">
    <CardContent className="p-6">
      <div className="flex items-center justify-between">
        <div className="flex flex-col gap-2">
          <p className="text-sm text-gray-600 font-nunito font-medium">{label}</p>
          <p className="text-3xl font-bold text-[#2B4A2F] font-poppins">
            {value?.toLocaleString() || '0'}{suffix}
          </p>
          {trend !== undefined && (
            <div
              className={`flex items-center text-sm font-poppins ${
                trend >= 0 ? 'text-[#6CAC73]' : 'text-rose-600'
              }`}
            >
              <TrendingUp
                className={`w-4 h-4 mr-1 ${trend < 0 ? 'rotate-180' : ''}`}
              />
              {Math.abs(trend)}%
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

// MetricCard
const MetricCard: React.FC<{
  title: string;
  icon: React.ComponentType<{ className?: string }>;
  children: React.ReactNode;
}> = ({ title, icon: Icon, children }) => (
  <Card className="border border-[#6CAC73]/20 bg-white/80 backdrop-blur-sm shadow-lg">
    <CardHeader className="pb-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-gradient-to-br from-[#6CAC73] to-[#2B4A2F] rounded-lg flex items-center justify-center">
            <Icon className="w-4 h-4 text-white" />
          </div>
          <CardTitle className="text-lg font-semibold text-[#2B4A2F] font-poppins">{title}</CardTitle>
        </div>
        <Button variant="ghost" size="icon" className="w-8 h-8 border border-[#6CAC73]/20 hover:bg-[#6CAC73]/10">
          <MoreHorizontal className="w-4 h-4 text-[#2B4A2F]" />
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
  suffix?: string;
}> = ({ label, value, trend, suffix = '' }) => (
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
        {value?.toLocaleString()}{suffix}
      </span>
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
    className="flex items-center gap-4 p-4 h-auto justify-start hover:bg-[#6CAC73]/10 w-full border border-[#6CAC73]/20 bg-white/60 backdrop-blur-sm"
    onClick={onClick}
  >
    <div className="w-10 h-10 bg-gradient-to-br from-[#6CAC73] to-[#2B4A2F] rounded-xl flex items-center justify-center shadow-sm">
      <Icon className="w-5 h-5 text-white" />
    </div>
    <div className="text-left flex-1">
      <p className="font-medium text-sm text-[#2B4A2F] font-poppins">{title}</p>
      <p className="text-gray-600 text-xs font-nunito">{description}</p>
    </div>
    <ChevronRight className="w-4 h-4 text-[#6CAC73]" />
  </Button>
);

// RecyclablesGraph - ENHANCED WITH MATERIALS AND WASTE_KG
const RecyclablesGraph: React.FC<{ stats?: DashboardStats }> = ({ stats }) => {
  const data = [
    { category: 'Plastic', amount: 1250, wasteKg: 45.5, color: '#3B82F6' },
    { category: 'Paper', amount: 890, wasteKg: 78.2, color: '#F59E0B' },
    { category: 'Glass', amount: 450, wasteKg: 120.5, color: '#10B981' },
    { category: 'Metal', amount: 320, wasteKg: 28.8, color: '#8B5CF6' },
    { category: 'Electronics', amount: 180, wasteKg: 52.3, color: '#EF4444' },
    { category: 'Textile', amount: 240, wasteKg: 36.5, color: '#EC4899' },
    { category: 'Organic', amount: 520, wasteKg: 95.7, color: '#14B8A6' },
  ];

  // Calculate totals
  const totalItems = data.reduce((sum, item) => sum + item.amount, 0);
  const totalWasteKg = data.reduce((sum, item) => sum + item.wasteKg, 0);
  const co2Saved = (totalWasteKg * 0.0035).toFixed(2); // Rough estimate: 3.5kg CO₂ per kg recycled

  return (
    <Card className="border border-[#6CAC73]/20 bg-white/80 backdrop-blur-sm shadow-lg">
      <CardHeader className="pb-4 flex flex-col gap-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-gradient-to-br from-[#6CAC73] to-[#2B4A2F] rounded-lg flex items-center justify-center">
              <Recycle className="w-4 h-4 text-white" />
            </div>
            <CardTitle className="text-lg font-semibold text-[#2B4A2F] font-poppins">
              Recyclables by Material
            </CardTitle>
          </div>
          <Badge className="bg-gradient-to-r from-[#6CAC73]/20 to-[#2B4A2F]/10 text-[#2B4A2F] border-0 font-poppins">
            +15%
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="flex flex-col gap-6">
        {/* Bar Chart - Items by Material */}
        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data}>
              <CartesianGrid strokeDasharray="3 3" className="opacity-20" stroke="#6CAC73" />
              <XAxis
                dataKey="category"
                tick={{ fontSize: 10, fill: '#2B4A2F' }}
                axisLine={false}
                tickLine={false}
                angle={-30}
                textAnchor="end"
                height={60}
              />
              <YAxis
                tick={{ fontSize: 12, fill: '#2B4A2F' }}
                axisLine={false}
                tickLine={false}
              />
              <Tooltip 
                cursor={{ fill: 'transparent' }}
                contentStyle={{ 
                  backgroundColor: 'rgba(255, 255, 255, 0.95)',
                  border: '1px solid #6CAC73',
                  borderRadius: '8px',
                  backdropFilter: 'blur(8px)',
                  fontSize: '12px',
                  padding: '12px'
                }}
                formatter={(value: number, name: string) => {
                  if (name === 'amount') return [`${value.toLocaleString()} items`, 'Items Recycled'];
                  return [value, name];
                }}
                labelFormatter={(label) => `Material: ${label}`}
              />
              <Legend 
                wrapperStyle={{ fontSize: '12px' }}
                formatter={() => 'Items Recycled'}
              />
              <Bar dataKey="amount" fill="#6CAC73" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Material breakdown cards with waste_kg */}
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3">
          {data.map((material) => (
            <div 
              key={material.category}
              className="bg-gradient-to-br from-[#FFF9F0] to-white rounded-lg p-3 border border-[#6CAC73]/10 hover:shadow-md transition-shadow"
            >
              <div className="flex items-center gap-2 mb-2">
                <div 
                  className="w-3 h-3 rounded-full" 
                  style={{ backgroundColor: material.color }}
                />
                <p className="text-xs text-gray-600 font-nunito font-semibold">
                  {material.category}
                </p>
              </div>
              <p className="text-lg font-bold text-[#2B4A2F] font-poppins">
                {material.wasteKg}kg
              </p>
              <p className="text-xs text-[#6CAC73] font-nunito">
                {material.amount.toLocaleString()} items
              </p>
            </div>
          ))}
        </div>

        {/* Summary stats */}
        <div className="grid grid-cols-3 gap-4 pt-4 border-t border-[#6CAC73]/10 text-center">
          <div className="bg-gradient-to-br from-[#FFF9F0] to-white rounded-lg p-4">
            <p className="text-2xl font-bold text-[#2B4A2F] font-poppins">
              {totalWasteKg.toFixed(1)}kg
            </p>
            <p className="text-xs text-gray-600 font-nunito mt-1">Total Waste Saved</p>
          </div>
          <div className="bg-gradient-to-br from-[#FFF9F0] to-white rounded-lg p-4">
            <p className="text-2xl font-bold text-[#6CAC73] font-poppins">
              {totalItems.toLocaleString()}
            </p>
            <p className="text-xs text-gray-600 font-nunito mt-1">Total Items</p>
          </div>
          <div className="bg-gradient-to-br from-[#FFF9F0] to-white rounded-lg p-4">
            <p className="text-2xl font-bold text-[#2B4A2F] font-poppins">
              {co2Saved}t
            </p>
            <p className="text-xs text-gray-600 font-nunito mt-1">CO₂ Saved</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

// Material Distribution Pie Chart
const MaterialDistributionChart: React.FC = () => {
  const COLORS = ['#3B82F6', '#F59E0B', '#10B981', '#8B5CF6', '#EF4444', '#EC4899', '#14B8A6'];
  
  const data = [
    { name: 'Plastic', value: 45.5 },
    { name: 'Paper', value: 78.2 },
    { name: 'Glass', value: 120.5 },
    { name: 'Metal', value: 28.8 },
    { name: 'Electronics', value: 52.3 },
    { name: 'Textile', value: 36.5 },
    { name: 'Organic', value: 95.7 },
  ];

  return (
    <Card className="border border-[#6CAC73]/20 bg-white/80 backdrop-blur-sm shadow-lg">
      <CardHeader className="pb-4">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-gradient-to-br from-[#6CAC73] to-[#2B4A2F] rounded-lg flex items-center justify-center">
            <Package className="w-4 h-4 text-white" />
          </div>
          <CardTitle className="text-lg font-semibold text-[#2B4A2F] font-poppins">
            Waste Distribution (kg)
          </CardTitle>
        </div>
      </CardHeader>
      <CardContent>
        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: 'rgba(255, 255, 255, 0.95)',
                  border: '1px solid #6CAC73',
                  borderRadius: '8px',
                  backdropFilter: 'blur(8px)',
                  fontSize: '12px'
                }}
                formatter={(value: number) => `${value}kg`}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
};

// TopPerformers
const TopPerformers: React.FC = () => (
  <Card className="border border-[#6CAC73]/20 bg-white/80 backdrop-blur-sm shadow-lg">
    <CardHeader className="pb-4 flex flex-col gap-2">
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 bg-gradient-to-br from-[#6CAC73] to-[#2B4A2F] rounded-lg flex items-center justify-center">
          <Trophy className="w-4 h-4 text-white" />
        </div>
        <CardTitle className="text-lg font-semibold text-[#2B4A2F] font-poppins">Top Performers</CardTitle>
      </div>
    </CardHeader>
    <CardContent className="flex flex-col gap-3">
      {[
        { name: 'Eco Warrior', points: 1250, wasteKg: 45.3 },
        { name: 'Green Thumb', points: 1180, wasteKg: 38.7 },
        { name: 'Planet Saver', points: 1050, wasteKg: 32.5 }
      ].map(({ name, points, wasteKg }, index) => (
        <div
          key={name}
          className="flex items-center justify-between p-3 bg-gradient-to-br from-[#FFF9F0] to-white rounded-xl border border-[#6CAC73]/10"
        >
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-gradient-to-br from-[#6CAC73] to-[#2B4A2F] rounded-lg flex items-center justify-center text-sm font-medium text-white font-poppins">
              {index + 1}
            </div>
            <div>
              <span className="text-sm font-medium text-[#2B4A2F] font-poppins block">{name}</span>
              <span className="text-xs text-gray-600 font-nunito">{wasteKg}kg recycled</span>
            </div>
          </div>
          <Badge className="bg-gradient-to-r from-[#6CAC73]/20 to-[#2B4A2F]/10 text-[#2B4A2F] border-0 font-poppins">
            {points} pts
          </Badge>
        </div>
      ))}
    </CardContent>
  </Card>
);

// ===============================
// MAIN DASHBOARD WITH WEBSOCKET
// ===============================
export default function AdminDashboard() {
  const { data, isLoading, error, refetch } = useDashboardStats();
  const stats: DashboardStats | undefined = data?.data;
  const { isConnected } = useWebSocket();
  const { info, warning, success } = useToast();

  // WebSocket real-time event handlers
  useWebSocketChallenges({
    onCreated: useCallback(() => {
      info('New challenge created!');
      refetch();
    }, [info, refetch]),

    onCompleted: useCallback(() => {
      success('A user completed a challenge!');
      refetch();
    }, [success, refetch]),

    onVerified: useCallback((data: { points_awarded?: number; waste_kg_saved?: number } | unknown) => {
      const d = data as { points_awarded?: number; waste_kg_saved?: number };
      success(`Challenge verified! ${d.points_awarded ?? 0} points awarded, ${d.waste_kg_saved ?? 0}kg waste saved`);
      refetch();
    }, [success, refetch]),
  });

  useWebSocketPosts({
    onCreated: useCallback(() => {
      info('New post created on the platform');
      refetch();
    }, [info, refetch]),
  });

  useWebSocketAdminAlerts(
    useCallback((data: { type?: string; message?: string } | unknown) => {
      const d = data as { type?: string; message?: string };
      if (d.type === 'challenge_pending') {
        warning('New challenge pending verification');
        refetch();
      } else {
        info(d.message || 'Admin alert received');
      }
    }, [warning, info, refetch])
  );

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

  if (error) {
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
                {(error as Error).message || 'Please try again.'}
              </p>
            </div>
            <Button 
              onClick={() => refetch()}
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
              Platform overview and real-time analytics with material tracking
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Badge className="bg-gradient-to-r from-blue-500/20 to-blue-600/20 text-blue-700 border-0 font-poppins">
              <Bell className="w-3 h-3 mr-1" />
              Real-time
            </Badge>
            <Button className="gap-2 border border-[#6CAC73]/20 bg-white/80 backdrop-blur-sm hover:bg-[#6CAC73]/10 text-[#2B4A2F]">
              <Calendar className="w-4 h-4" />
              Last 7 days
            </Button>
          </div>
        </div>

        {/* Stats - Updated with waste_kg */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard icon={Users} label="Total Users" value={stats?.users?.total} trend={12} />
          <StatCard icon={FileText} label="Content Posts" value={stats?.content?.totalPosts} trend={8} />
          <StatCard icon={Trophy} label="Active Challenges" value={stats?.challenges?.active} trend={15} />
          <StatCard icon={Recycle} label="Waste Saved" value={457} suffix="kg" trend={15} />
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left */}
          <div className="lg:col-span-2 flex flex-col gap-8">
            <Tabs defaultValue="overview" className="flex flex-col gap-6">
              <TabsList className="grid grid-cols-3 w-full max-w-md bg-white/80 backdrop-blur-sm p-1 rounded-xl border border-[#6CAC73]/20">
                <TabsTrigger 
                  value="overview" 
                  className="font-poppins data-[state=active]:bg-gradient-to-r data-[state=active]:from-[#6CAC73] data-[state=active]:to-[#2B4A2F] data-[state=active]:text-white"
                >
                  Overview
                </TabsTrigger>
                <TabsTrigger 
                  value="recycling" 
                  className="font-poppins data-[state=active]:bg-gradient-to-r data-[state=active]:from-[#6CAC73] data-[state=active]:to-[#2B4A2F] data-[state=active]:text-white"
                >
                  Recycling
                </TabsTrigger>
                <TabsTrigger 
                  value="engagement" 
                  className="font-poppins data-[state=active]:bg-gradient-to-r data-[state=active]:from-[#6CAC73] data-[state=active]:to-[#2B4A2F] data-[state=active]:text-white"
                >
                  Engagement
                </TabsTrigger>
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
                      <MetricRow label="Total Crafts" value={stats?.content?.totalCrafts} trend={6} />
                    </div>
                  </MetricCard>
                </div>
                <RecyclablesGraph stats={stats} />
              </TabsContent>

              {/* Recycling */}
              <TabsContent value="recycling" className="flex flex-col gap-6">
                <RecyclablesGraph stats={stats} />
                <MaterialDistributionChart />
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <MetricCard title="Recycling Progress" icon={Package}>
                    <div className="flex flex-col gap-1">
                      <MetricRow label="Monthly Target" value={500} suffix="kg" trend={15} />
                      <MetricRow label="Current Progress" value={457} suffix="kg" trend={18} />
                      <MetricRow label="Recycling Rate" value={91} suffix="%" trend={8} />
                      <MetricRow label="Active Participants" value={1240} trend={12} />
                    </div>
                  </MetricCard>
                  <MetricCard title="Environmental Impact" icon={Leaf}>
                    <div className="flex flex-col gap-1">
                      <MetricRow label="Trees Saved" value={42} trend={15} />
                      <MetricRow label="CO₂ Reduction" value={1.6} suffix="t" trend={10} />
                      <MetricRow label="Energy Saved" value={3.2} suffix="MWh" trend={8} />
                      <MetricRow label="Water Saved" value={18} suffix="kL" trend={12} />
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
                    <MetricRow label="Avg Posts/User" value={stats?.engagement?.avgPostsPerUser} trend={15} />
                    <MetricRow label="Avg Challenges/User" value={stats?.engagement?.avgChallengesPerUser} trend={10} />
                  </div>
                </MetricCard>
              </TabsContent>
            </Tabs>
          </div>

          {/* Right */}
          <div className="flex flex-col gap-8">
            <Card className="border border-[#6CAC73]/20 bg-white/80 backdrop-blur-sm shadow-lg">
              <CardHeader className="pb-4">
                <CardTitle className="text-lg font-semibold text-[#2B4A2F] font-poppins">Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="flex flex-col gap-2">
                <QuickAction icon={Users} title="Manage Users" description="User management and permissions" />
                <QuickAction icon={Recycle} title="Recycling Stats" description="View detailed recycling analytics" />
                <QuickAction icon={FileText} title="Content Review" description="Moderate posts and comments" />
              </CardContent>
            </Card>

            <TopPerformers />

            <Card className="border border-[#6CAC73]/20 bg-white/80 backdrop-blur-sm shadow-lg">
              <CardContent className="p-6 flex flex-col gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-gradient-to-br from-[#6CAC73] to-[#2B4A2F] rounded-lg flex items-center justify-center">
                    <Leaf className="w-4 h-4 text-white" />
                  </div>
                  <h3 className="font-semibold text-[#2B4A2F] font-poppins">Environmental Impact</h3>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-gradient-to-br from-[#FFF9F0] to-white rounded-lg p-4 border border-[#6CAC73]/10">
                    <p className="text-2xl font-bold text-[#2B4A2F] font-poppins">42</p>
                    <p className="text-xs text-gray-600 font-nunito mt-1">Trees Saved</p>
                  </div>
                  <div className="bg-gradient-to-br from-[#FFF9F0] to-white rounded-lg p-4 border border-[#6CAC73]/10">
                    <p className="text-2xl font-bold text-[#2B4A2F] font-poppins">18kL</p>
                    <p className="text-xs text-gray-600 font-nunito mt-1">Water Saved</p>
                  </div>
                  <div className="bg-gradient-to-br from-[#FFF9F0] to-white rounded-lg p-4 border border-[#6CAC73]/10">
                    <p className="text-2xl font-bold text-[#2B4A2F] font-poppins">3.2</p>
                    <p className="text-xs text-gray-600 font-nunito mt-1">Energy (MWh)</p>
                  </div>
                  <div className="bg-gradient-to-br from-[#FFF9F0] to-white rounded-lg p-4 border border-[#6CAC73]/10">
                    <p className="text-2xl font-bold text-[#2B4A2F] font-poppins">1.6t</p>
                    <p className="text-xs text-gray-600 font-nunito mt-1">CO₂ Saved</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Real-time Activity Feed */}
            <Card className="border border-[#6CAC73]/20 bg-white/80 backdrop-blur-sm shadow-lg">
              <CardHeader className="pb-4">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg font-semibold text-[#2B4A2F] font-poppins">Live Activity</CardTitle>
                  <Badge className="bg-gradient-to-r from-[#6CAC73]/20 to-[#2B4A2F]/10 text-[#2B4A2F] border-0 font-poppins">
                    <Wifi className="w-3 h-3 mr-1 animate-pulse" />
                    Live
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="flex flex-col gap-3">
                <div className="text-sm text-gray-600 font-nunito text-center py-4">
                  Real-time updates will appear here
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}git