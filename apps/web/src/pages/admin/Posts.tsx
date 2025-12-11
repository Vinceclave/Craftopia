// apps/web/src/pages/admin/Posts.tsx - REFACTORED WITH SHARED COMPONENTS AND EXPORT
import { useState, useCallback, useMemo } from 'react';
import { ColumnDef } from '@tanstack/react-table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import {
  FileText, Trash2, Star, Loader2,
  MessageCircle, AlertCircle, CheckSquare,
  Calendar, Wifi, Eye, User, ThumbsUp,
  Clock, CheckCircle, Flag, Image as ImageIcon,
} from 'lucide-react';
import { usePosts } from '@/hooks/usePosts';
import { useReports } from '@/hooks/useReports';
import { useWebSocketPosts, useWebSocket, useWebSocketReports } from '@/hooks/useWebSocket';
import { useToast } from '@/components/ui/use-toast';
import { Post, Comment } from '@/lib/api';
import type { ExtendedReport } from '@/hooks/useReports';

// Import shared components
import {
  DataTable,
  ConfirmDialog,
  StatsGrid,
  PageHeader,
  LoadingState,
  ErrorState,
  PageContainer,
  DetailModal,
  DetailStatGrid,
  type DetailSection,
  type FilterOption,
  ExportButtons
} from '@/components/shared';
import { generateGenericPDF, type ExportConfig } from '@/utils/exportToPDF';
import { generateGenericExcel, type ExcelSheetConfig } from '@/utils/exportToExcel';

export default function AdminPosts() {
  const {
    posts,
    comments,
    isLoading,
    error,
    refetch,
    deletePost,
    deleteComment,
    featurePost,
    bulkDeletePosts,
    isDeleting,
    isFeaturing,
    isBulkDeleting
  } = usePosts();

  const {
    reports,
    stats: reportStats,
    params: reportParams,
    setParams: setReportParams,
    updateStatus: updateReportStatus,
    isUpdating: isUpdatingReport,
    refetch: refetchReports
  } = useReports();

  const { isConnected } = useWebSocket();
  const { toast } = useToast();

  const [selectedPosts, setSelectedPosts] = useState<number[]>([]);
  const [activeTab, setActiveTab] = useState<string>('posts');
  const [searchValue, setSearchValue] = useState('');

  // Dialog states
  const [viewPostModal, setViewPostModal] = useState(false);
  const [deletePostDialog, setDeletePostDialog] = useState(false);
  const [deleteCommentDialog, setDeleteCommentDialog] = useState(false);
  const [bulkDeleteDialog, setBulkDeleteDialog] = useState(false);
  const [resolveReportModal, setResolveReportModal] = useState(false);

  // Selected items
  const [selectedPost, setSelectedPost] = useState<Post | null>(null);
  const [selectedComment, setSelectedComment] = useState<Comment | null>(null);
  const [selectedReport, setSelectedReport] = useState<ExtendedReport | null>(null);
  const [moderatorNotes, setModeratorNotes] = useState('');

  // WebSocket real-time updates
  useWebSocketPosts({
    onCreated: useCallback(() => {
      toast({
        title: 'Info',
        description: 'New post created',
      });
      refetch();
    }, [toast, refetch]),

    onUpdated: useCallback(() => {
      toast({
        title: 'Info',
        description: 'Post updated',
      });
      refetch();
    }, [toast, refetch]),

    onDeleted: useCallback(() => {
      toast({
        title: 'Info',
        description: 'Post removed',
      });
      refetch();
    }, [toast, refetch]),
  });

  useWebSocketReports({
    onCreated: useCallback((data: any) => {
      toast({
        title: 'Success',
        description: data.message || 'New report filed',
      });
      refetchReports();
      refetch();
    }, [toast, refetchReports, refetch]),

    onUpdated: useCallback((data: any) => {
      toast({
        title: 'Info',
        description: data.message || 'Report status updated',
      });
      refetchReports();
    }, [toast, refetchReports]),

    onResolved: useCallback((data: any) => {
      toast({
        title: 'Success',
        description: data.message || 'Report resolved',
      });
      refetchReports();
      refetch();
    }, [toast, refetchReports, refetch]),
  });

  // Stats
  const totalPosts = posts.length;
  const totalComments = comments.length;
  const featuredPosts = posts.filter(p => p.featured).length;
  const reportedPosts = posts.filter(p => p._count && p._count.reports > 0).length;

  // Stats configuration
  const statsConfig = [
    { label: 'Total Posts', value: totalPosts, icon: <FileText className="w-5 h-5" />, color: 'text-[#2B4A2F]' },
    { label: 'Total Comments', value: totalComments, icon: <MessageCircle className="w-5 h-5" />, color: 'text-[#2B4A2F]' },
    { label: 'Featured', value: featuredPosts, icon: <Star className="w-5 h-5" />, color: 'text-yellow-600' },
    { label: 'Reported', value: reportedPosts, icon: <AlertCircle className="w-5 h-5" />, color: 'text-rose-600' },
    { label: 'Pending Reports', value: reportStats?.pending || 0, icon: <Flag className="w-5 h-5" />, color: 'text-orange-600' },
  ];

  // Define columns for Posts DataTable
  const postColumns = useMemo<ColumnDef<Post>[]>(
    () => [
      {
        id: 'select',
        header: () => (
          <input
            type="checkbox"
            checked={selectedPosts.length === posts.length && posts.length > 0}
            onChange={selectAllPosts}
            className="w-4 h-4 rounded border-[#6CAC73]/30 text-[#6CAC73] focus:ring-[#6CAC73]/20"
          />
        ),
        cell: ({ row }) => (
          <input
            type="checkbox"
            checked={selectedPosts.includes(row.original.post_id)}
            onChange={() => togglePostSelection(row.original.post_id)}
            className="w-4 h-4 rounded border-[#6CAC73]/30 text-[#6CAC73] focus:ring-[#6CAC73]/20"
          />
        ),
        size: 40,
      },
      {
        accessorKey: 'title',
        header: 'Post',
        cell: ({ row }) => {
          const post = row.original;
          return (
            <div className="flex items-start gap-3">
              {post.image_url && (
                <div className="w-12 h-12 rounded-lg overflow-hidden border border-[#6CAC73]/20 flex-shrink-0">
                  <img
                    src={post.image_url}
                    alt={post.title}
                    className="w-full h-full object-cover"
                  />
                </div>
              )}
              <div className="flex flex-col gap-1 min-w-0 flex-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <p className="font-semibold text-[#2B4A2F] font-poppins text-sm truncate">
                    {post.title}
                  </p>
                  {post.featured && (
                    <Badge className="bg-gradient-to-r from-yellow-500/20 to-yellow-600/20 text-yellow-700 border-0 font-poppins text-xs">
                      <Star className="w-3 h-3 mr-1 fill-yellow-500 text-yellow-500" />
                      Featured
                    </Badge>
                  )}
                  {post._count && post._count.reports > 0 && (
                    <Badge className="bg-gradient-to-r from-rose-500/20 to-rose-600/20 text-rose-700 border-0 font-poppins text-xs">
                      <AlertCircle className="w-3 h-3 mr-1" />
                      {post._count.reports}
                    </Badge>
                  )}
                </div>
                <p className="text-sm text-gray-600 font-nunito line-clamp-2">
                  {post.content}
                </p>
                <div className="flex flex-wrap gap-1 mt-1">
                  <Badge className="capitalize text-xs border-0 bg-gradient-to-r from-[#6CAC73]/20 to-[#2B4A2F]/10 text-[#2B4A2F] font-poppins">
                    {post.category}
                  </Badge>
                  {post.tags?.slice(0, 2).map((tag, i) => (
                    <Badge key={i} className="text-xs bg-white/80 border border-[#6CAC73]/20 text-[#2B4A2F] font-nunito">
                      #{tag}
                    </Badge>
                  ))}
                  {post.tags && post.tags.length > 2 && (
                    <Badge className="text-xs bg-white/80 border border-[#6CAC73]/20 text-[#2B4A2F] font-nunito">
                      +{post.tags.length - 2}
                    </Badge>
                  )}
                </div>
              </div>
            </div>
          );
        },
        size: 300,
      },
      {
        accessorKey: 'user',
        header: 'Author',
        cell: ({ row }) => (
          <div className="flex flex-col gap-1">
            <div className="flex items-center gap-2 text-sm text-[#2B4A2F] font-poppins">
              <User className="w-4 h-4" />
              {row.original.user.username}
            </div>
            <div className="flex items-center gap-2 text-xs text-gray-500 font-nunito">
              <Calendar className="w-3 h-3" />
              {new Date(row.original.created_at).toLocaleDateString()}
            </div>
          </div>
        ),
        size: 120,
      },
      {
        accessorKey: 'stats',
        header: 'Stats',
        cell: ({ row }) => {
          const post = row.original;
          return (
            <div className="flex flex-col gap-1 text-xs">
              <div className="flex items-center gap-1">
                <ThumbsUp className="w-3 h-3 text-[#6CAC73]" />
                <span className="font-nunito">{post._count?.likes || 0} likes</span>
              </div>
              <div className="flex items-center gap-1">
                <MessageCircle className="w-3 h-3 text-[#6CAC73]" />
                <span className="font-nunito">{post._count?.comments || 0} comments</span>
              </div>
              {post.image_url && (
                <div className="flex items-center gap-1">
                  <ImageIcon className="w-3 h-3 text-[#6CAC73]" />
                  <span className="font-nunito">Has image</span>
                </div>
              )}
            </div>
          );
        },
        size: 100,
      },
      {
        id: 'actions',
        header: 'Actions',
        cell: ({ row }) => {
          const post = row.original;
          return (
            <div className="flex gap-1">
              <Button
                size="sm"
                onClick={() => handleViewPost(post)}
                className="h-8 w-8 p-0 border-[#6CAC73]/20 bg-white/80 hover:bg-[#6CAC73]/10 text-[#2B4A2F]"
                title="View Post Details"
              >
                <Eye className="w-4 h-4" />
              </Button>
              <Button
                size="sm"
                onClick={() => handleFeaturePost(post.post_id)}
                disabled={isFeaturing}
                className="h-8 w-8 p-0 border-[#6CAC73]/20 bg-white/80 hover:bg-[#6CAC73]/10 text-[#2B4A2F]"
                title="Toggle Featured"
              >
                <Star className={`w-4 h-4 ${post.featured ? 'fill-yellow-500 text-yellow-500' : 'text-gray-400'}`} />
              </Button>
              <Button
                size="sm"
                onClick={() => handleOpenDeletePost(post)}
                disabled={isDeleting}
                className="h-8 w-8 p-0 border-rose-200 bg-white/80 hover:bg-rose-50 text-rose-600"
                title="Delete Post"
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
          );
        },
        size: 120,
      },
    ],
    [selectedPosts, posts, isFeaturing, isDeleting]
  );

  // Define columns for Comments DataTable
  const commentColumns = useMemo<ColumnDef<Comment>[]>(
    () => [
      {
        accessorKey: 'content',
        header: 'Comment',
        cell: ({ row }) => (
          <div className="flex flex-col gap-2">
            <p className="text-sm text-[#2B4A2F] font-nunito line-clamp-2">
              {row.original.content}
            </p>
            {row.original.post && (
              <p className="text-xs text-blue-600 font-nunito">
                On: {row.original.post.title}
              </p>
            )}
          </div>
        ),
        size: 300,
      },
      {
        accessorKey: 'user',
        header: 'Author',
        cell: ({ row }) => (
          <div className="flex flex-col gap-1">
            <div className="flex items-center gap-2 text-sm text-[#2B4A2F] font-poppins">
              <User className="w-4 h-4" />
              {row.original.user.username}
            </div>
            <div className="flex items-center gap-2 text-xs text-gray-500 font-nunito">
              <Calendar className="w-3 h-3" />
              {new Date(row.original.created_at).toLocaleDateString()}
            </div>
          </div>
        ),
        size: 150,
      },
      {
        id: 'actions',
        header: 'Actions',
        cell: ({ row }) => (
          <Button
            size="sm"
            onClick={() => handleOpenDeleteComment(row.original)}
            disabled={isDeleting}
            className="h-8 w-8 p-0 border-rose-200 bg-white/80 hover:bg-rose-50 text-rose-600"
            title="Delete Comment"
          >
            <Trash2 className="w-4 h-4" />
          </Button>
        ),
        size: 80,
      },
    ],
    [isDeleting]
  );

  // Define columns for Reports DataTable
  const reportColumns = useMemo<ColumnDef<ExtendedReport>[]>(
    () => [
      {
        accessorKey: 'report_id',
        header: 'ID',
        cell: ({ row }) => (
          <span className="font-semibold text-[#2B4A2F] font-poppins">
            #{row.original.report_id}
          </span>
        ),
        size: 60,
      },
      {
        accessorKey: 'status',
        header: 'Status',
        cell: ({ row }) => {
          const status = row.original.status;
          return (
            <Badge
              className={`font-poppins border-0 ${status === 'pending'
                ? 'bg-gradient-to-r from-rose-500/20 to-rose-600/20 text-rose-700'
                : status === 'in_review'
                  ? 'bg-gradient-to-r from-orange-500/20 to-orange-600/20 text-orange-700'
                  : 'bg-gradient-to-r from-[#6CAC73]/20 to-[#2B4A2F]/10 text-[#2B4A2F]'
                }`}
            >
              {status === 'pending' && <Clock className="w-3 h-3 mr-1" />}
              {status === 'in_review' && <Eye className="w-3 h-3 mr-1" />}
              {status === 'resolved' && <CheckCircle className="w-3 h-3 mr-1" />}
              {status.replace('_', ' ')}
            </Badge>
          );
        },
        size: 120,
      },
      {
        accessorKey: 'reason',
        header: 'Reason',
        cell: ({ row }) => (
          <p className="text-sm text-gray-600 font-nunito line-clamp-2">
            {row.original.reason}
          </p>
        ),
        size: 200,
      },
      {
        accessorKey: 'reporter',
        header: 'Reporter',
        cell: ({ row }) => (
          <div className="flex items-center gap-2 text-sm text-[#2B4A2F] font-poppins">
            <User className="w-4 h-4" />
            {row.original.reporter?.username || 'Unknown'}
          </div>
        ),
        size: 120,
      },
      {
        accessorKey: 'created_at',
        header: 'Date',
        cell: ({ row }) => (
          <div className="flex items-center gap-2 text-xs text-gray-500 font-nunito">
            <Calendar className="w-3 h-3" />
            {new Date(row.original.created_at).toLocaleDateString()}
          </div>
        ),
        size: 120,
      },
      {
        id: 'actions',
        header: 'Actions',
        cell: ({ row }) => {
          const report = row.original;
          return (
            <div className="flex gap-1">
              <Button
                size="sm"
                onClick={() => handleUpdateReportStatus(report.report_id, 'in_review')}
                disabled={isUpdatingReport || report.status === 'in_review' || report.status === 'resolved'}
                className="h-8 px-2 text-xs border-[#6CAC73]/20 bg-white/80 hover:bg-[#6CAC73]/10 text-[#2B4A2F]"
              >
                <Eye className="w-3 h-3 mr-1" />
                Review
              </Button>
              <Button
                size="sm"
                onClick={() => handleOpenResolveReport(report)}
                disabled={isUpdatingReport || report.status === 'resolved'}
                className="h-8 px-2 text-xs bg-gradient-to-br from-[#2B4A2F] to-[#6CAC73] hover:from-[#2B4A2F]/90 hover:to-[#6CAC73]/90 text-white border-0"
              >
                <CheckCircle className="w-3 h-3 mr-1" />
                Resolve
              </Button>
            </div>
          );
        },
        size: 180,
      },
    ],
    [isUpdatingReport]
  );

  // Export handlers
  const handleExportPDF = () => {
    let config: ExportConfig;

    if (activeTab === 'posts') {
      config = {
        title: 'Posts Report',
        subtitle: 'List of all platform posts',
        stats: [
          { label: 'Total Posts', value: totalPosts },
          { label: 'Featured Posts', value: featuredPosts },
          { label: 'Reported Posts', value: reportedPosts },
          { label: 'Total Comments', value: totalComments },
        ],
        columns: [
          { header: 'Title', dataKey: 'title' },
          { header: 'Content', dataKey: 'content', formatter: (val) => val?.substring(0, 100) + '...' },
          { header: 'Author', dataKey: 'user', formatter: (val) => val?.username || 'Unknown' },
          { header: 'Category', dataKey: 'category', formatter: (val) => val.charAt(0).toUpperCase() + val.slice(1) },
          { header: 'Featured', dataKey: 'featured', formatter: (val) => val ? 'Yes' : 'No' },
          { header: 'Likes', dataKey: '_count.likes', formatter: (val) => val || 0 },
          { header: 'Comments', dataKey: '_count.comments', formatter: (val) => val || 0 },
          { header: 'Reports', dataKey: '_count.reports', formatter: (val) => val || 0 },
          { header: 'Created', dataKey: 'created_at', formatter: (val) => new Date(val).toLocaleDateString() },
        ],
        data: posts,
        filename: 'posts-report',
      };
    } else if (activeTab === 'comments') {
      config = {
        title: 'Comments Report',
        subtitle: 'List of all platform comments',
        stats: [
          { label: 'Total Comments', value: totalComments },
          { label: 'Posts with Comments', value: new Set(comments.map(c => c.post_id)).size },
        ],
        columns: [
          { header: 'Content', dataKey: 'content', formatter: (val) => val?.substring(0, 100) + '...' },
          { header: 'Author', dataKey: 'user', formatter: (val) => val?.username || 'Unknown' },
          { header: 'Post Title', dataKey: 'post', formatter: (val) => val?.title || 'N/A' },
          { header: 'Created', dataKey: 'created_at', formatter: (val) => new Date(val).toLocaleDateString() },
        ],
        data: comments,
        filename: 'comments-report',
      };
    } else if (activeTab === 'reports') {
      config = {
        title: 'Reports Summary',
        subtitle: 'Platform content moderation reports',
        stats: [
          { label: 'Total Reports', value: reports?.length || 0 },
          { label: 'Pending Reports', value: reportStats?.pending || 0 },
          { label: 'In Review', value: reportStats?.in_review || 0 },
          { label: 'Resolved', value: reportStats?.resolved || 0 },
        ],
        columns: [
          { header: 'Report ID', dataKey: 'report_id' },
          { header: 'Reason', dataKey: 'reason' },
          { header: 'Status', dataKey: 'status', formatter: (val) => val.replace('_', ' ') },
          { header: 'Reporter', dataKey: 'reporter', formatter: (val) => val?.username || 'Unknown' },
          { header: 'Created', dataKey: 'created_at', formatter: (val) => new Date(val).toLocaleDateString() },
        ],
        data: reports || [],
        filename: 'reports-summary',
      };
    } else {
      // Default fallback - overview
      config = {
        title: 'Content Moderation Overview',
        subtitle: 'Complete platform content overview',
        stats: [
          { label: 'Total Posts', value: totalPosts },
          { label: 'Total Comments', value: totalComments },
          { label: 'Featured Posts', value: featuredPosts },
          { label: 'Reported Posts', value: reportedPosts },
          { label: 'Pending Reports', value: reportStats?.pending || 0 },
        ],
        columns: [
          { header: 'Metric', dataKey: 'metric' },
          { header: 'Value', dataKey: 'value' },
        ],
        data: [
          { metric: 'Total Posts', value: totalPosts },
          { metric: 'Total Comments', value: totalComments },
          { metric: 'Featured Posts', value: featuredPosts },
          { metric: 'Reported Posts', value: reportedPosts },
          { metric: 'Pending Reports', value: reportStats?.pending || 0 },
          { metric: 'In Review Reports', value: reportStats?.in_review || 0 },
          { metric: 'Resolved Reports', value: reportStats?.resolved || 0 },
        ],
        filename: 'content-moderation-overview',
      };
    }

    generateGenericPDF(config);
  };

  const handleExportExcel = () => {
    let sheets: ExcelSheetConfig[];

    if (activeTab === 'posts') {
      sheets = [
        {
          sheetName: 'Posts',
          columns: [
            { header: 'Title', dataKey: 'title', width: 30 },
            { header: 'Content', dataKey: 'content', width: 50, formatter: (val) => val?.substring(0, 100) + '...' },
            { header: 'Author', dataKey: 'user', formatter: (val) => val?.username || 'Unknown', width: 20 },
            { header: 'Category', dataKey: 'category', formatter: (val) => val.charAt(0).toUpperCase() + val.slice(1), width: 15 },
            { header: 'Featured', dataKey: 'featured', formatter: (val) => val ? 'Yes' : 'No', width: 10 },
            { header: 'Likes', dataKey: '_count.likes', formatter: (val) => val || 0, width: 10 },
            { header: 'Comments', dataKey: '_count.comments', formatter: (val) => val || 0, width: 10 },
            { header: 'Reports', dataKey: '_count.reports', formatter: (val) => val || 0, width: 10 },
            { header: 'Created', dataKey: 'created_at', formatter: (val) => new Date(val).toLocaleDateString(), width: 15 },
          ],
          data: posts,
        }
      ];
    } else if (activeTab === 'comments') {
      sheets = [
        {
          sheetName: 'Comments',
          columns: [
            { header: 'Content', dataKey: 'content', width: 50, formatter: (val) => val?.substring(0, 100) + '...' },
            { header: 'Author', dataKey: 'user', formatter: (val) => val?.username || 'Unknown', width: 20 },
            { header: 'Post Title', dataKey: 'post', formatter: (val) => val?.title || 'N/A', width: 30 },
            { header: 'Created', dataKey: 'created_at', formatter: (val) => new Date(val).toLocaleDateString(), width: 15 },
          ],
          data: comments,
        }
      ];
    } else if (activeTab === 'reports') {
      sheets = [
        {
          sheetName: 'Reports',
          columns: [
            { header: 'Report ID', dataKey: 'report_id', width: 15 },
            { header: 'Reason', dataKey: 'reason', width: 40 },
            { header: 'Status', dataKey: 'status', formatter: (val) => val.replace('_', ' '), width: 15 },
            { header: 'Reporter', dataKey: 'reporter', formatter: (val) => val?.username || 'Unknown', width: 20 },
            { header: 'Created', dataKey: 'created_at', formatter: (val) => new Date(val).toLocaleDateString(), width: 15 },
          ],
          data: reports || [],
        }
      ];
    } else {
      sheets = [
        {
          sheetName: 'Posts',
          columns: [
            { header: 'Title', dataKey: 'title', width: 30 },
            { header: 'Content', dataKey: 'content', width: 50, formatter: (val) => val?.substring(0, 100) + '...' },
            { header: 'Author', dataKey: 'user', formatter: (val) => val?.username || 'Unknown', width: 20 },
            { header: 'Category', dataKey: 'category', formatter: (val) => val.charAt(0).toUpperCase() + val.slice(1), width: 15 },
            { header: 'Featured', dataKey: 'featured', formatter: (val) => val ? 'Yes' : 'No', width: 10 },
            { header: 'Likes', dataKey: '_count.likes', formatter: (val) => val || 0, width: 10 },
            { header: 'Comments', dataKey: '_count.comments', formatter: (val) => val || 0, width: 10 },
            { header: 'Reports', dataKey: '_count.reports', formatter: (val) => val || 0, width: 10 },
            { header: 'Created', dataKey: 'created_at', formatter: (val) => new Date(val).toLocaleDateString(), width: 15 },
          ],
          data: posts,
        },
        {
          sheetName: 'Comments',
          columns: [
            { header: 'Content', dataKey: 'content', width: 50, formatter: (val) => val?.substring(0, 100) + '...' },
            { header: 'Author', dataKey: 'user', formatter: (val) => val?.username || 'Unknown', width: 20 },
            { header: 'Post Title', dataKey: 'post', formatter: (val) => val?.title || 'N/A', width: 30 },
            { header: 'Created', dataKey: 'created_at', formatter: (val) => new Date(val).toLocaleDateString(), width: 15 },
          ],
          data: comments,
        },
        {
          sheetName: 'Reports',
          columns: [
            { header: 'Report ID', dataKey: 'report_id', width: 15 },
            { header: 'Reason', dataKey: 'reason', width: 40 },
            { header: 'Status', dataKey: 'status', formatter: (val) => val.replace('_', ' '), width: 15 },
            { header: 'Reporter', dataKey: 'reporter', formatter: (val) => val?.username || 'Unknown', width: 20 },
            { header: 'Created', dataKey: 'created_at', formatter: (val) => new Date(val).toLocaleDateString(), width: 15 },
          ],
          data: reports || [],
        }
      ];
    }

    generateGenericExcel({
      sheets,
      filename: activeTab === 'posts' ? 'posts-report' :
        activeTab === 'comments' ? 'comments-report' :
          activeTab === 'reports' ? 'reports-summary' :
            'content-moderation-comprehensive'
    });
  };

  // Handlers
  const handleOpenDeletePost = (post: Post) => {
    setSelectedPost(post);
    setDeletePostDialog(true);
  };

  const handleConfirmDeletePost = async () => {
    if (!selectedPost) return;
    try {
      await deletePost({ postId: selectedPost.post_id, reason: 'Deleted by admin via moderation' });
      toast({
        title: 'Success',
        description: 'Post deleted successfully!',
      });
      setDeletePostDialog(false);
      setSelectedPost(null);
      setViewPostModal(false);
    } catch (err: any) {
      toast({
        title: 'Error',
        description: err.message || 'Error deleting post',
        variant: 'destructive',
      });
    }
  };

  const handleOpenDeleteComment = (comment: Comment) => {
    setSelectedComment(comment);
    setDeleteCommentDialog(true);
  };

  const handleConfirmDeleteComment = async () => {
    if (!selectedComment) return;
    try {
      await deleteComment({ commentId: selectedComment.comment_id, reason: 'Deleted by admin via moderation' });
      toast({
        title: 'Success',
        description: 'Comment deleted successfully!',
      });
      setDeleteCommentDialog(false);
      setSelectedComment(null);
    } catch (err: any) {
      toast({
        title: 'Error',
        description: err.message || 'Error deleting comment',
        variant: 'destructive',
      });
    }
  };

  const handleFeaturePost = async (postId: number) => {
    try {
      await featurePost(postId);
      toast({
        title: 'Success',
        description: 'Feature status updated!',
      });
    } catch (err: any) {
      toast({
        title: 'Error',
        description: err.message || 'Error updating feature status',
        variant: 'destructive',
      });
    }
  };

  const handleOpenBulkDelete = () => {
    if (selectedPosts.length === 0) {
      toast({
        title: 'Warning',
        description: 'Select posts to delete',
        variant: 'destructive',
      });
      return;
    }
    setBulkDeleteDialog(true);
  };

  const handleConfirmBulkDelete = async () => {
    try {
      await bulkDeletePosts({ postIds: selectedPosts, reason: 'Bulk deletion by admin' });
      toast({
        title: 'Success',
        description: 'Posts deleted!',
      });
      setSelectedPosts([]);
      setBulkDeleteDialog(false);
    } catch (err: any) {
      toast({
        title: 'Error',
        description: err.message || 'Error deleting posts',
        variant: 'destructive',
      });
    }
  };

  const togglePostSelection = (postId: number) => {
    setSelectedPosts(prev =>
      prev.includes(postId)
        ? prev.filter(id => id !== postId)
        : [...prev, postId]
    );
  };

  const selectAllPosts = () => {
    setSelectedPosts(selectedPosts.length === posts.length ? [] : posts.map(p => p.post_id));
  };

  const handleViewPost = (post: Post) => {
    setSelectedPost(post);
    setViewPostModal(true);
  };

  const handleOpenResolveReport = (report: ExtendedReport) => {
    setSelectedReport(report);
    setModeratorNotes('');
    setResolveReportModal(true);
  };

  const handleResolveReport = async () => {
    if (!selectedReport) return;
    try {
      await updateReportStatus({
        reportId: selectedReport.report_id,
        status: 'resolved',
        notes: moderatorNotes
      });
      toast({
        title: 'Success',
        description: 'Report resolved successfully',
      });
      setResolveReportModal(false);
      setSelectedReport(null);
      setModeratorNotes('');
      refetchReports();
    } catch (err: any) {
      toast({
        title: 'Error',
        description: err.message || 'Failed to resolve report',
        variant: 'destructive',
      });
    }
  };

  const handleUpdateReportStatus = async (reportId: number, status: string) => {
    try {
      await updateReportStatus({ reportId, status });
      toast({
        title: 'Success',
        description: 'Report status updated',
      });
      refetchReports();
    } catch (err: any) {
      toast({
        title: 'Error',
        description: err.message || 'Failed to update report',
        variant: 'destructive',
      });
    }
  };

  // Report filter options
  const reportFilters: FilterOption[] = [
    {
      label: 'Status',
      value: reportParams.status || 'all',
      options: [
        { label: 'All Status', value: 'all' },
        { label: 'Pending', value: 'pending' },
        { label: 'In Review', value: 'in_review' },
        { label: 'Resolved', value: 'resolved' },
      ],
      onChange: (value) => setReportParams({
        ...reportParams,
        status: value === 'all' ? undefined : value,
        page: 1
      }),
    },
  ];

  // Detail sections for post modal
  const getPostDetailSections = (post: Post): DetailSection[] => [
    {
      title: 'Post Information',
      items: [
        {
          label: 'Author',
          value: post.user.username,
          icon: <User className="w-4 h-4" />,
        },
        {
          label: 'Category',
          value: <Badge className="capitalize bg-gradient-to-r from-[#6CAC73]/20 to-[#2B4A2F]/10 text-[#2B4A2F] border-0">
            {post.category}
          </Badge>,
        },
        {
          label: 'Created',
          value: new Date(post.created_at).toLocaleString(),
          icon: <Calendar className="w-4 h-4" />,
        },
        {
          label: 'Updated',
          value: new Date(post.updated_at).toLocaleString(),
          icon: <Clock className="w-4 h-4" />,
        },
        {
          label: 'Content',
          value: <p className="whitespace-pre-wrap text-sm">{post.content}</p>,
          fullWidth: true,
        },
        ...(post.tags && post.tags.length > 0 ? [{
          label: 'Tags',
          value: (
            <div className="flex flex-wrap gap-1">
              {post.tags.map((tag, i) => (
                <Badge key={i} className="text-xs bg-white border border-[#6CAC73]/20 text-[#2B4A2F]">
                  #{tag}
                </Badge>
              ))}
            </div>
          ),
          fullWidth: true,
        }] : []),
      ],
    },
  ];

  if (isLoading) {
    return <LoadingState message="Loading content..." />;
  }

  if (error) {
    return (
      <PageContainer>
        <ErrorState
          error={error as Error}
          title="Error loading content"
          onRetry={refetch}
        />
      </PageContainer>
    );
  }

  return (
    <PageContainer>
      {/* Page Header */}
      <PageHeader
        title={
          <div className="flex items-center gap-2">
            Content Moderation
            {isConnected && (
              <Badge className="bg-gradient-to-r from-[#6CAC73]/20 to-[#2B4A2F]/10 text-[#2B4A2F] border border-[#6CAC73]/30 font-poppins animate-pulse">
                <Wifi className="w-3 h-3 mr-1" />
                Live
              </Badge>
            )}
          </div>
        }
        description="Manage and moderate platform content in real-time"
        icon={<FileText className="w-6 h-6 text-white" />}
        actions={
          <div className="flex gap-2">
            <ExportButtons onExportPDF={handleExportPDF} onExportExcel={handleExportExcel} />

            {selectedPosts.length > 0 && (
              <Button
                size="sm"
                onClick={handleOpenBulkDelete}
                disabled={isBulkDeleting}
                className="bg-gradient-to-r from-rose-600 to-rose-700 hover:from-rose-700 hover:to-rose-800 text-white border-0"
              >
                {isBulkDeleting ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Trash2 className="w-4 h-4" />
                )}
                <span className="ml-2">Delete {selectedPosts.length}</span>
              </Button>
            )}
          </div>
        }
      />

      {/* Stats Grid */}
      <StatsGrid stats={statsConfig} columns={{ base: 2, lg: 5 }} />

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="flex flex-col gap-6">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <TabsList className="bg-white/80 backdrop-blur-sm p-1 rounded-xl border border-[#6CAC73]/20 flex gap-2 w-full lg:w-auto">
            <TabsTrigger
              value="posts"
              className="flex items-center gap-2 text-sm font-poppins data-[state=active]:bg-gradient-to-r data-[state=active]:from-[#6CAC73] data-[state=active]:to-[#2B4A2F] data-[state=active]:text-white"
            >
              <FileText className="w-4 h-4" /> Posts ({totalPosts})
            </TabsTrigger>
            <TabsTrigger
              value="comments"
              className="flex items-center gap-2 text-sm font-poppins data-[state=active]:bg-gradient-to-r data-[state=active]:from-[#6CAC73] data-[state=active]:to-[#2B4A2F] data-[state=active]:text-white"
            >
              <MessageCircle className="w-4 h-4" /> Comments ({totalComments})
            </TabsTrigger>
            <TabsTrigger
              value="reports"
              className="flex items-center gap-2 text-sm font-poppins data-[state=active]:bg-gradient-to-r data-[state=active]:from-[#6CAC73] data-[state=active]:to-[#2B4A2F] data-[state=active]:text-white"
            >
              <Flag className="w-4 h-4" /> Reports ({reports?.length || 0})
            </TabsTrigger>
          </TabsList>

          {activeTab === 'posts' && posts.length > 0 && (
            <Button
              size="sm"
              onClick={selectAllPosts}
              className="border-[#6CAC73]/20 bg-white/80 backdrop-blur-sm hover:bg-[#6CAC73]/10 text-[#2B4A2F] text-sm font-poppins"
            >
              <CheckSquare className="w-4 h-4 mr-2" />
              {selectedPosts.length === posts.length ? 'Deselect All' : 'Select All'}
            </Button>
          )}
        </div>

        {/* Posts Tab */}
        <TabsContent value="posts">
          <DataTable
            data={posts}
            columns={postColumns}
            title="All Posts"
            searchPlaceholder="Search posts..."
            searchValue={searchValue}
            onSearchChange={setSearchValue}
            showPagination={true}
            defaultPageSize={10}
            pageSizeOptions={[5, 10, 20, 50]}
            emptyState={{
              icon: <FileText className="w-12 h-12 text-gray-300" />,
              title: 'No posts found',
              description: 'Posts will appear here once created',
            }}
          />
        </TabsContent>

        {/* Comments Tab */}
        <TabsContent value="comments">
          <DataTable
            data={comments}
            columns={commentColumns}
            title="All Comments"
            searchPlaceholder="Search comments..."
            showPagination={true}
            defaultPageSize={10}
            emptyState={{
              icon: <MessageCircle className="w-12 h-12 text-gray-300" />,
              title: 'No comments found',
              description: 'Comments will appear here',
            }}
          />
        </TabsContent>

        {/* Reports Tab */}
        <TabsContent value="reports">
          <DataTable
            data={reports || []}
            columns={reportColumns}
            title="All Reports"
            searchPlaceholder="Search reports..."
            filters={reportFilters}
            showPagination={true}
            defaultPageSize={10}
            emptyState={{
              icon: <Flag className="w-12 h-12 text-gray-300" />,
              title: 'No reports found',
              description: reportParams.status ? 'Try changing the filter' : 'No reports have been filed yet',
            }}
          />
        </TabsContent>
      </Tabs>

      {/* View Post Detail Modal */}
      {selectedPost && (
        <DetailModal
          open={viewPostModal}
          onOpenChange={setViewPostModal}
          title="Post Details"
          icon={<FileText className="w-5 h-5" />}
          header={
            <>
              <div className="flex flex-col gap-3">
                <div className="flex items-center gap-2 flex-wrap">
                  <h2 className="text-2xl font-bold text-[#2B4A2F] font-poppins">{selectedPost.title}</h2>
                  {selectedPost.featured && (
                    <Badge className="bg-gradient-to-r from-yellow-500/20 to-yellow-600/20 text-yellow-700 border-0 font-poppins">
                      <Star className="w-3 h-3 mr-1 fill-yellow-500 text-yellow-500" /> Featured
                    </Badge>
                  )}
                  {selectedPost._count && selectedPost._count.reports > 0 && (
                    <Badge className="bg-gradient-to-r from-rose-500/20 to-rose-600/20 text-rose-700 border-0 font-poppins">
                      <AlertCircle className="w-3 h-3 mr-1" /> {selectedPost._count.reports} Reports
                    </Badge>
                  )}
                </div>
              </div>

              {selectedPost.image_url && (
                <div className="rounded-xl overflow-hidden border border-[#6CAC73]/20">
                  <img
                    src={selectedPost.image_url}
                    alt={selectedPost.title}
                    className="w-full h-auto"
                  />
                </div>
              )}

              <DetailStatGrid
                stats={[
                  {
                    icon: <ThumbsUp className="w-5 h-5" />,
                    label: 'Likes',
                    value: selectedPost._count?.likes || 0,
                  },
                  {
                    icon: <MessageCircle className="w-5 h-5" />,
                    label: 'Comments',
                    value: selectedPost._count?.comments || 0,
                  },
                  {
                    icon: <AlertCircle className="w-5 h-5" />,
                    label: 'Reports',
                    value: selectedPost._count?.reports || 0,
                    color: 'text-rose-600',
                  },
                ]}
                columns={3}
              />
            </>
          }
          sections={getPostDetailSections(selectedPost)}
          footer={
            <div className="flex gap-2">
              <Button
                onClick={() => handleFeaturePost(selectedPost.post_id)}
                disabled={isFeaturing}
                className="flex-1 border-[#6CAC73]/20 bg-white/80 hover:bg-[#6CAC73]/10 text-[#2B4A2F]"
              >
                <Star className={`w-4 h-4 mr-2 ${selectedPost.featured ? 'fill-yellow-500 text-yellow-500' : ''}`} />
                {selectedPost.featured ? 'Unfeature' : 'Feature'} Post
              </Button>
              <Button
                onClick={() => handleOpenDeletePost(selectedPost)}
                disabled={isDeleting}
                className="flex-1 bg-gradient-to-r from-rose-600 to-rose-700 hover:from-rose-700 hover:to-rose-800 text-white border-0"
              >
                {isDeleting ? (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <Trash2 className="w-4 h-4 mr-2" />
                )}
                Delete Post
              </Button>
            </div>
          }
        />
      )}

      {/* Delete Post Confirmation Dialog */}
      <ConfirmDialog
        open={deletePostDialog}
        onOpenChange={setDeletePostDialog}
        onConfirm={handleConfirmDeletePost}
        title="Delete Post?"
        description="This action cannot be undone. This will permanently delete the post and all its comments."
        confirmText="Delete Post"
        cancelText="Cancel"
        loading={isDeleting}
        variant="danger"
        icon={<Trash2 className="w-5 h-5" />}
        alertMessage={
          selectedPost && (
            <>
              <p className="font-medium mb-2">You are about to delete:</p>
              <p className="font-bold">"{selectedPost.title}"</p>
            </>
          )
        }
      />

      {/* Delete Comment Confirmation Dialog */}
      <ConfirmDialog
        open={deleteCommentDialog}
        onOpenChange={setDeleteCommentDialog}
        onConfirm={handleConfirmDeleteComment}
        title="Delete Comment?"
        description="This action cannot be undone. This will permanently delete the comment."
        confirmText="Delete Comment"
        cancelText="Cancel"
        loading={isDeleting}
        variant="danger"
        icon={<Trash2 className="w-5 h-5" />}
        alertMessage={
          selectedComment && (
            <>
              <p className="font-medium mb-2">You are about to delete this comment:</p>
              <p className="italic">"{selectedComment.content}"</p>
            </>
          )
        }
      />

      {/* Bulk Delete Confirmation Dialog */}
      <ConfirmDialog
        open={bulkDeleteDialog}
        onOpenChange={setBulkDeleteDialog}
        onConfirm={handleConfirmBulkDelete}
        title={`Delete ${selectedPosts.length} Posts?`}
        description="This action cannot be undone. This will permanently delete all selected posts and their comments."
        confirmText={`Delete ${selectedPosts.length} Posts`}
        cancelText="Cancel"
        loading={isBulkDeleting}
        variant="danger"
        icon={<Trash2 className="w-5 h-5" />}
        alertMessage={
          <>
            <p className="font-medium mb-2">You are about to delete:</p>
            <p className="font-bold">{selectedPosts.length} posts and all their associated content</p>
          </>
        }
      />

      {/* Resolve Report Dialog */}
      <ConfirmDialog
        open={resolveReportModal}
        onOpenChange={setResolveReportModal}
        onConfirm={handleResolveReport}
        title="Resolve Report"
        description="Add moderator notes and resolve this report"
        confirmText="Resolve Report"
        cancelText="Cancel"
        loading={isUpdatingReport}
        variant="success"
        icon={<CheckCircle className="w-5 h-5" />}
      >
        {selectedReport && (
          <>
            <div className="p-3 bg-gradient-to-br from-[#FFF9F0] to-white rounded-lg border border-[#6CAC73]/10">
              <p className="text-sm font-medium text-[#2B4A2F] font-poppins mb-1">
                Report #{selectedReport.report_id}
              </p>
              <p className="text-sm text-gray-600 font-nunito">{selectedReport.reason}</p>
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="notes" className="text-[#2B4A2F] font-poppins">
                Moderator Notes
              </Label>
              <Textarea
                id="notes"
                value={moderatorNotes}
                onChange={(e) => setModeratorNotes(e.target.value)}
                placeholder="Add notes about the action taken..."
                rows={4}
                className="border-[#6CAC73]/20 focus:border-[#6CAC73] focus:ring-[#6CAC73]/10"
              />
            </div>
          </>
        )}
      </ConfirmDialog>
    </PageContainer>
  );
}