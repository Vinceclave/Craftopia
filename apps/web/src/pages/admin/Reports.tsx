import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { dashboardAPI } from '../../lib/api';
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ResponsiveContainer,
    PieChart,
    Pie,
    Cell,
    AreaChart,
    Area
} from 'recharts';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Download, Loader2, FileText, TrendingUp, Users, AlertTriangle } from 'lucide-react';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { format } from 'date-fns';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d'];

const Reports = () => {
    const [days] = useState(7);

    // Fetch Data
    const { data: statsData, isLoading: statsLoading } = useQuery({
        queryKey: ['admin', 'dashboard', 'stats'],
        queryFn: dashboardAPI.getStats,
    });

    const { data: activityData, isLoading: activityLoading } = useQuery({
        queryKey: ['admin', 'dashboard', 'activity', days],
        queryFn: () => dashboardAPI.getActivityLogs(days),
    });

    const { data: topUsersData, isLoading: topUsersLoading } = useQuery({
        queryKey: ['admin', 'dashboard', 'top-users'],
        queryFn: () => dashboardAPI.getTopUsers(10),
    });

    const isLoading = statsLoading || activityLoading || topUsersLoading;

    const handleDownloadPDF = () => {
        const doc = new jsPDF();
        const today = format(new Date(), 'yyyy-MM-dd');

        // Title
        doc.setFontSize(20);
        doc.setTextColor(43, 74, 47); // #2B4A2F
        doc.text('Craftopia Analytics Report', 14, 22);

        doc.setFontSize(10);
        doc.setTextColor(100);
        doc.text(`Generated on: ${today}`, 14, 28);

        // Summary Section
        if (statsData?.data) {
            doc.setFontSize(14);
            doc.setTextColor(0);
            doc.text('Executive Summary', 14, 40);

            const summaryData = [
                ['Metric', 'Value'],
                ['Total Users', statsData.data.users.total],
                ['Active Users', statsData.data.users.active],
                ['Total Posts', statsData.data.content.totalPosts],
                ['Total Challenges', statsData.data.challenges.total],
                ['Completed Challenges', statsData.data.challenges.completed],
                ['Total Reports', statsData.data.reports.total],
                ['Pending Reports', statsData.data.reports.pending],
            ];

            autoTable(doc, {
                startY: 45,
                head: [summaryData[0]],
                body: summaryData.slice(1),
                theme: 'striped',
                headStyles: { fillColor: [108, 172, 115] }, // #6CAC73
            });
        }

        // Top Users Section
        if (topUsersData?.data) {
            const finalY = (doc as any).lastAutoTable.finalY || 100;

            doc.setFontSize(14);
            doc.text('Top Users by Points', 14, finalY + 15);

            const usersTableData = topUsersData.data.map((user: any) => [
                user.user.username,
                user.user.email,
                user.points,
                user.counts.completedChallenges,
                user.counts.posts
            ]);

            autoTable(doc, {
                startY: finalY + 20,
                head: [['Username', 'Email', 'Points', 'Challenges', 'Posts']],
                body: usersTableData,
                theme: 'grid',
                headStyles: { fillColor: [43, 74, 47] },
            });
        }

        // Materials Section
        if (statsData?.data?.materials) {
            const finalY = (doc as any).lastAutoTable.finalY || 150;

            doc.setFontSize(14);
            doc.text('Top Recycled Materials', 14, finalY + 15);

            const materialsData = statsData.data.materials.map((m: any) => [
                m.name,
                m.count
            ]);

            autoTable(doc, {
                startY: finalY + 20,
                head: [['Material', 'Usage Count']],
                body: materialsData,
                theme: 'striped',
                headStyles: { fillColor: [136, 132, 216] }, // #8884d8
            });
        }

        // Activity Log Section
        if (activityData?.data) {
            const finalY = (doc as any).lastAutoTable.finalY || 150;

            // Check if we need a new page
            if (finalY > 250) {
                doc.addPage();
                doc.text('Activity Logs (Last 7 Days)', 14, 20);
                autoTable(doc, {
                    startY: 25,
                    head: [['Date', 'New Users', 'Posts', 'Challenges']],
                    body: activityData.data.map((log: any) => [
                        log.date,
                        log.users,
                        log.posts,
                        log.challenges
                    ]),
                    theme: 'striped',
                });
            } else {
                doc.text('Activity Logs (Last 7 Days)', 14, finalY + 15);
                autoTable(doc, {
                    startY: finalY + 20,
                    head: [['Date', 'New Users', 'Posts', 'Challenges']],
                    body: activityData.data.map((log: any) => [
                        log.date,
                        log.users,
                        log.posts,
                        log.challenges
                    ]),
                    theme: 'striped',
                });
            }
        }

        doc.save(`craftopia-report-${today}.pdf`);
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-full min-h-[500px]">
                <Loader2 className="w-8 h-8 animate-spin text-[#6CAC73]" />
            </div>
        );
    }

    // Prepare Chart Data
    const challengeStatusData = statsData?.data ? [
        { name: 'Active', value: statsData.data.challenges.active },
        { name: 'Completed', value: statsData.data.challenges.completed },
        { name: 'Pending', value: statsData.data.challenges.pendingVerification },
    ] : [];

    const reportStatusData = statsData?.data ? [
        { name: 'Pending', value: statsData.data.reports.pending },
        { name: 'In Review', value: statsData.data.reports.in_review },
        { name: 'Resolved', value: statsData.data.reports.resolved },
    ] : [];

    return (
        <div className="p-6 flex flex-col gap-6 max-w-[1600px] mx-auto">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-[#2B4A2F] font-poppins">Reports & Analytics</h1>
                    <p className="text-gray-600 font-nunito">Comprehensive insights into platform performance</p>
                </div>
                <Button
                    onClick={handleDownloadPDF}
                    className="bg-[#6CAC73] hover:bg-[#5a9160] text-white gap-2"
                >
                    <Download className="w-4 h-4" />
                    Download Report
                </Button>
            </div>

            {/* Key Metrics Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <Card className="border-[#6CAC73]/20 shadow-sm hover:shadow-md transition-all">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-gray-600">Total Users</CardTitle>
                        <Users className="h-4 w-4 text-[#6CAC73]" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-[#2B4A2F]">{statsData?.data?.users.total}</div>
                        <p className="text-xs text-gray-500">
                            +{statsData?.data?.users.newThisWeek} this week
                        </p>
                    </CardContent>
                </Card>
                <Card className="border-[#6CAC73]/20 shadow-sm hover:shadow-md transition-all">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-gray-600">Active Challenges</CardTitle>
                        <TrendingUp className="h-4 w-4 text-[#6CAC73]" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-[#2B4A2F]">{statsData?.data?.challenges.active}</div>
                        <p className="text-xs text-gray-500">
                            {statsData?.data?.challenges.completed} completed total
                        </p>
                    </CardContent>
                </Card>
                <Card className="border-[#6CAC73]/20 shadow-sm hover:shadow-md transition-all">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-gray-600">Total Posts</CardTitle>
                        <FileText className="h-4 w-4 text-[#6CAC73]" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-[#2B4A2F]">{statsData?.data?.content.totalPosts}</div>
                        <p className="text-xs text-gray-500">
                            +{statsData?.data?.content.postsToday} today
                        </p>
                    </CardContent>
                </Card>
                <Card className="border-[#6CAC73]/20 shadow-sm hover:shadow-md transition-all">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-gray-600">Pending Reports</CardTitle>
                        <AlertTriangle className="h-4 w-4 text-amber-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-[#2B4A2F]">{statsData?.data?.reports.pending}</div>
                        <p className="text-xs text-gray-500">
                            Requires attention
                        </p>
                    </CardContent>
                </Card>
            </div>

            {/* Charts Section */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Activity Trend */}
                <Card className="col-span-1 lg:col-span-2 border-[#6CAC73]/20 shadow-sm">
                    <CardHeader>
                        <CardTitle className="text-[#2B4A2F]">Platform Activity (Last 7 Days)</CardTitle>
                        <CardDescription>User registrations, posts, and challenge participation</CardDescription>
                    </CardHeader>
                    <CardContent className="h-[300px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={activityData?.data || []}>
                                <defs>
                                    <linearGradient id="colorUsers" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#8884d8" stopOpacity={0.8} />
                                        <stop offset="95%" stopColor="#8884d8" stopOpacity={0} />
                                    </linearGradient>
                                    <linearGradient id="colorPosts" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#82ca9d" stopOpacity={0.8} />
                                        <stop offset="95%" stopColor="#82ca9d" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <XAxis dataKey="date" />
                                <YAxis />
                                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                <Tooltip />
                                <Legend />
                                <Area type="monotone" dataKey="users" stroke="#8884d8" fillOpacity={1} fill="url(#colorUsers)" name="New Users" />
                                <Area type="monotone" dataKey="posts" stroke="#82ca9d" fillOpacity={1} fill="url(#colorPosts)" name="New Posts" />
                                <Area type="monotone" dataKey="challenges" stroke="#ffc658" fillOpacity={1} fill="#ffc658" name="Challenges Joined" />
                            </AreaChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>

                {/* Challenge Status */}
                <Card className="border-[#6CAC73]/20 shadow-sm">
                    <CardHeader>
                        <CardTitle className="text-[#2B4A2F]">Challenge Status Distribution</CardTitle>
                    </CardHeader>
                    <CardContent className="h-[300px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={challengeStatusData}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={60}
                                    outerRadius={80}
                                    fill="#8884d8"
                                    paddingAngle={5}
                                    dataKey="value"
                                    label
                                >
                                    {challengeStatusData.map((_, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Pie>
                                <Tooltip />
                                <Legend />
                            </PieChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>

                {/* Report Status */}
                <Card className="border-[#6CAC73]/20 shadow-sm">
                    <CardHeader>
                        <CardTitle className="text-[#2B4A2F]">Report Status Distribution</CardTitle>
                    </CardHeader>
                    <CardContent className="h-[300px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={reportStatusData}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={60}
                                    outerRadius={80}
                                    fill="#8884d8"
                                    paddingAngle={5}
                                    dataKey="value"
                                    label
                                >
                                    {reportStatusData.map((_, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[(index + 2) % COLORS.length]} />
                                    ))}
                                </Pie>
                                <Tooltip />
                                <Legend />
                            </PieChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>

                {/* Top Users */}
                <Card className="col-span-1 lg:col-span-2 border-[#6CAC73]/20 shadow-sm">
                    <CardHeader>
                        <CardTitle className="text-[#2B4A2F]">Top Users by Points</CardTitle>
                    </CardHeader>
                    <CardContent className="h-[300px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={topUsersData?.data || []}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                <XAxis dataKey="user.username" />
                                <YAxis />
                                <Tooltip />
                                <Legend />
                                <Bar dataKey="points" fill="#6CAC73" name="Points" radius={[4, 4, 0, 0]} />
                                <Bar dataKey="counts.completedChallenges" fill="#82ca9d" name="Completed Challenges" radius={[4, 4, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>

                {/* Top Materials */}
                <Card className="col-span-1 lg:col-span-2 border-[#6CAC73]/20 shadow-sm">
                    <CardHeader>
                        <CardTitle className="text-[#2B4A2F]">Top Recycled Materials</CardTitle>
                        <CardDescription>Most frequently used materials in crafts</CardDescription>
                    </CardHeader>
                    <CardContent className="h-[300px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={statsData?.data?.materials || []} layout="vertical">
                                <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                                <XAxis type="number" />
                                <YAxis dataKey="name" type="category" width={100} />
                                <Tooltip />
                                <Legend />
                                <Bar dataKey="count" fill="#8884d8" name="Usage Count" radius={[0, 4, 4, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
};

export default Reports;
