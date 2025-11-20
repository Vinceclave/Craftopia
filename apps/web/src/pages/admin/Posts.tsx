// apps/web/src/pages/admin/Posts.tsx - Enhanced with Reports Integration and Post View Modal
import { useState, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import {
  FileText, Trash2, Star, Loader2, RefreshCw,
  MessageCircle, AlertCircle, CheckSquare, Image as ImageIcon,
  Calendar, MoreHorizontal, Wifi, Eye, X, User, ThumbsUp,
  Clock, CheckCircle, Flag
} from 'lucide-react';
import { usePosts } from '@/hooks/usePosts';
import { useReports } from '@/hooks/useReports';
import { useWebSocketPosts, useWebSocket, useWebSocketReports } from '@/hooks/useWebSocket';
import { useToast } from '@/hooks/useToast';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Post, Comment } from '@/lib/api';
import type { ExtendedReport } from '@/hooks/useReports';

export default function AdminPosts() {
  const {
    posts,
    comments,
    meta,
    isLoading,
    error,
    page,
    setPage,
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
    isLoading: isLoadingReports,
    params: reportParams,
    setParams: setReportParams,
    updateStatus: updateReportStatus,
    isUpdating: isUpdatingReport,
    refetch: refetchReports
  } = useReports();

  const { isConnected } = useWebSocket();
  const { success, info, error: showError } = useToast();

  const [selectedPosts, setSelectedPosts] = useState<number[]>([]);
  const [activeTab, setActiveTab] = useState<string>('posts');
  const [viewPostModal, setViewPostModal] = useState(false);
  const [selectedPost, setSelectedPost] = useState<Post | null>(null);
  const [resolveReportModal, setResolveReportModal] = useState(false);
  const [selectedReport, setSelectedReport] = useState<ExtendedReport | null>(null);
  const [moderatorNotes, setModeratorNotes] = useState('');

  // WebSocket real-time updates for posts
  useWebSocketPosts({
    onCreated: useCallback(() => {
      info('New post created');
      refetch();
    }, [info, refetch]),
    
    onUpdated: useCallback(() => {
      info('Post updated');
      refetch();
    }, [info, refetch]),
    
    onDeleted: useCallback(() => {
      info('Post removed');
      refetch();
    }, [info, refetch]),
  });

  // WebSocket real-time updates for reports
  useWebSocketReports({
    onCreated: useCallback((data: any) => {
      success(data.message || 'New report filed');
      refetchReports();
      refetch(); // Refresh posts to update report counts
    }, [success, refetchReports, refetch]),
    
    onUpdated: useCallback((data: any) => {
      info(data.message || 'Report status updated');
      refetchReports();
    }, [info, refetchReports]),
    
    onResolved: useCallback((data: any) => {
      success(data.message || 'Report resolved');
      refetchReports();
      refetch();
    }, [success, refetchReports, refetch]),
  });

  // Stats
  const totalPosts = posts.length;
  const totalComments = comments.length;
  const featuredPosts = posts.filter(p => p.featured).length;
  const reportedPosts = posts.filter(p => p._count && p._count.reports > 0).length;

  // Handlers
  const handleDeletePost = async (postId: number) => {
    if (!window.confirm('Are you sure you want to delete this post?')) return;
    try {
      await deletePost({ postId, reason: 'Deleted by admin via moderation' });
      success('Post deleted successfully!');
      setViewPostModal(false);
    } catch (err: any) {
      showError(err.message || 'Error deleting post');
    }
  };

  const handleDeleteComment = async (commentId: number) => {
    if (!window.confirm('Are you sure you want to delete this comment?')) return;
    try {
      await deleteComment({ commentId, reason: 'Deleted by admin via moderation' });
      success('Comment deleted successfully!');
    } catch (err: any) {
      showError(err.message || 'Error deleting comment');
    }
  };

  const handleFeaturePost = async (postId: number) => {
    try {
      await featurePost(postId);
      success('Feature status updated!');
    } catch (err: any) {
      showError(err.message || 'Error updating feature status');
    }
  };

  const handleBulkDelete = async () => {
    if (selectedPosts.length === 0) return showError('Select posts to delete');
    if (!window.confirm(`Delete ${selectedPosts.length} selected posts?`)) return;
    try {
      await bulkDeletePosts({ postIds: selectedPosts, reason: 'Bulk deletion by admin' });
      success('Posts deleted!');
      setSelectedPosts([]);
    } catch (err: any) {
      showError(err.message || 'Error deleting posts');
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

  const handleResolveReport = async () => {
    if (!selectedReport) return;
    try {
      await updateReportStatus({
        reportId: selectedReport.report_id,
        status: 'resolved',
        notes: moderatorNotes
      });
      success('Report resolved successfully');
      setResolveReportModal(false);
      setSelectedReport(null);
      setModeratorNotes('');
      refetchReports();
    } catch (err: any) {
      showError(err.message || 'Failed to resolve report');
    }
  };

  const openResolveDialog = (report: ExtendedReport) => {
    setSelectedReport(report);
    setModeratorNotes('');
    setResolveReportModal(true);
  };

  const handleUpdateReportStatus = async (reportId: number, status: string) => {
    try {
      await updateReportStatus({ reportId, status });
      success('Report status updated');
      refetchReports();
    } catch (err: any) {
      showError(err.message || 'Failed to update report');
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#FFF9F0] to-white">
        <div className="text-center flex flex-col gap-3">
          <Loader2 className="w-8 h-8 animate-spin text-[#6CAC73] mx-auto" />
          <p className="text-[#2B4A2F] font-poppins">Loading content...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#FFF9F0] to-white p-6 lg:p-8 relative">
        <div className="absolute inset-0 pointer-events-none">
          {[...Array(3)].map((_, i) => (
            <div
              key={i}
              className="absolute w-2 h-2 bg-[#6CAC73] rounded-full opacity-20 animate-float"
              style={{
                left: `${15 + i * 30}%`,
                top: `${20 + (i % 2) * 25}%`,
                animationDelay: `${i * 1.5}s`,
                animationDuration: '4s'
              }}
            />
          ))}
        </div>
        
        <div className="max-w-7xl mx-auto relative z-10">
          <Alert className="border-[#6CAC73]/20 bg-white/80 backdrop-blur-sm">
            <AlertCircle className="h-4 w-4 text-[#6CAC73]" />
            <AlertDescription className="flex items-center justify-between gap-4">
              <span className="text-[#2B4A2F] font-nunito">Error loading content: {(error as Error).message}</span>
              <Button 
                size="sm" 
                onClick={() => refetch()} 
                className="bg-gradient-to-br from-[#2B4A2F] to-[#6CAC73] hover:from-[#2B4A2F]/90 hover:to-[#6CAC73]/90 text-white border-0"
              >
                <RefreshCw className="w-4 h-4 mr-2" /> Retry
              </Button>
            </AlertDescription>
          </Alert>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#FFF9F0] to-white p-6 lg:p-8 flex flex-col gap-8 relative">
      {/* Background Floating Elements */}
      <div className="absolute inset-0 pointer-events-none">
        {[...Array(4)].map((_, i) => (
          <div
            key={i}
            className="absolute w-2 h-2 bg-[#6CAC73] rounded-full opacity-20 animate-float"
            style={{
              left: `${10 + i * 25}%`,
              top: `${15 + (i % 3) * 20}%`,
              animationDelay: `${i * 1.2}s`,
              animationDuration: '4s'
            }}
          />
        ))}
      </div>

      <div className="w-full max-w-7xl mx-auto flex flex-col gap-6 relative z-10">

        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 bg-gradient-to-br from-[#6CAC73] to-[#2B4A2F] rounded-xl flex items-center justify-center shadow-lg">
                <FileText className="w-5 h-5 text-white" />
              </div>
              <h1 className="text-3xl font-bold text-[#2B4A2F] font-poppins">
                Content Moderation
              </h1>
              {isConnected && (
                <Badge className="bg-gradient-to-r from-[#6CAC73]/20 to-[#2B4A2F]/10 text-[#2B4A2F] border border-[#6CAC73]/30 font-poppins animate-pulse">
                  <Wifi className="w-3 h-3 mr-1" />
                  Live
                </Badge>
              )}
            </div>
            <p className="text-gray-600 text-sm font-nunito">Manage and moderate platform content in real-time</p>
          </div>

          <div className="flex items-center gap-3">
            {selectedPosts.length > 0 && (
              <Button
                size="sm"
                onClick={handleBulkDelete}
                disabled={isBulkDeleting}
                className="flex items-center gap-2 bg-gradient-to-r from-rose-600 to-rose-700 hover:from-rose-700 hover:to-rose-800 text-white border-0"
              >
                {isBulkDeleting ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Trash2 className="w-4 h-4" />
                )}
                Delete {selectedPosts.length}
              </Button>
            )}
            <Button 
              size="sm" 
              onClick={() => {
                refetch();
                refetchReports();
              }} 
              className="border-[#6CAC73]/20 bg-white/80 backdrop-blur-sm hover:bg-[#6CAC73]/10 text-[#2B4A2F]"
            >
              <RefreshCw className="w-4 h-4" />
            </Button>
            <Button 
              size="sm" 
              className="w-9 h-9 p-0 border-[#6CAC73]/20 bg-white/80 backdrop-blur-sm hover:bg-[#6CAC73]/10 text-[#2B4A2F]"
            >
              <MoreHorizontal className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-5">
          {[
            { label: 'Total Posts', value: totalPosts, icon: FileText, color: 'text-[#2B4A2F]' },
            { label: 'Total Comments', value: totalComments, icon: MessageCircle, color: 'text-[#2B4A2F]' },
            { label: 'Featured', value: featuredPosts, icon: Star, color: 'text-yellow-600' },
            { label: 'Reported', value: reportedPosts, icon: AlertCircle, color: 'text-rose-600' },
            { label: 'Pending Reports', value: reportStats?.pending || 0, icon: Flag, color: 'text-orange-600' },
          ].map((stat, i) => (
            <Card key={i} className="border border-[#6CAC73]/20 bg-white/80 backdrop-blur-sm shadow-lg hover:shadow-xl transition-all duration-300">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex flex-col gap-1">
                    <p className="text-sm text-gray-600 font-nunito">{stat.label}</p>
                    <p className={`text-2xl font-bold font-poppins ${stat.color}`}>{stat.value}</p>
                  </div>
                  <div className="w-10 h-10 bg-gradient-to-br from-[#FFF9F0] to-white rounded-xl flex items-center justify-center border border-[#6CAC73]/10 shadow-sm">
                    <stat.icon className="w-5 h-5 text-[#6CAC73]" />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="flex flex-col gap-6">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <TabsList className="bg-white/80 backdrop-blur-sm p-1 rounded-xl border border-[#6CAC73]/20 flex gap-2">
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
            <Card className="border border-[#6CAC73]/20 bg-white/80 backdrop-blur-sm shadow-lg">
              <CardHeader className="p-6 pb-4 flex flex-col gap-1">
                <CardTitle className="text-lg font-semibold text-[#2B4A2F] font-poppins">All Posts</CardTitle>
                <CardDescription className="text-gray-600 font-nunito">Manage all platform posts with real-time updates</CardDescription>
              </CardHeader>
              <CardContent className="p-6 pt-0">
                {posts.length === 0 ? (
                  <div className="text-center py-12 flex flex-col items-center gap-2">
                    <FileText className="w-12 h-12 text-gray-300" />
                    <p className="text-gray-500 font-medium font-poppins">No posts found</p>
                    <p className="text-gray-400 text-sm font-nunito">Posts will appear here once created</p>
                  </div>
                ) : (
                  <div className="flex flex-col gap-3">
                    {posts.map((post: Post) => (
                      <div
                        key={post.post_id}
                        className={`p-4 rounded-xl border transition-all duration-200 bg-white/60 backdrop-blur-sm ${
                          selectedPosts.includes(post.post_id)
                            ? 'border-blue-300 bg-blue-50/70 shadow-md'
                            : 'border-[#6CAC73]/20 hover:bg-white/80 hover:shadow-md'
                        }`}
                      >
                        <div className="flex gap-4">
                          {/* Checkbox */}
                          <div className="flex items-start pt-1">
                            <input
                              type="checkbox"
                              checked={selectedPosts.includes(post.post_id)}
                              onChange={() => togglePostSelection(post.post_id)}
                              className="w-4 h-4 rounded border-[#6CAC73]/30 text-[#6CAC73] focus:ring-[#6CAC73]/20"
                            />
                          </div>

                          {/* Thumbnail */}
                          {post.image_url && (
                            <div className="w-20 h-20 rounded-lg overflow-hidden border border-[#6CAC73]/20 flex-shrink-0">
                              <img 
                                src={post.image_url} 
                                alt={post.title}
                                className="w-full h-full object-cover"
                              />
                            </div>
                          )}

                          {/* Post Content */}
                          <div className="flex-1 flex flex-col gap-3">
                            <div className="flex flex-col gap-2">
                              <div className="flex items-center gap-2 flex-wrap">
                                <h3 className="font-semibold text-[#2B4A2F] font-poppins text-sm">{post.title}</h3>
                                {post.featured && (
                                  <Badge className="bg-gradient-to-r from-yellow-500/20 to-yellow-600/20 text-yellow-700 border-0 font-poppins">
                                    <Star className="w-3 h-3 mr-1 fill-yellow-500 text-yellow-500" /> Featured
                                  </Badge>
                                )}
                                {post._count && post._count.reports > 0 && (
                                  <Badge className="bg-gradient-to-r from-rose-500/20 to-rose-600/20 text-rose-700 border-0 font-poppins animate-pulse">
                                    <AlertCircle className="w-3 h-3 mr-1" /> {post._count.reports} Reports
                                  </Badge>
                                )}
                              </div>
                              <p className="text-sm text-gray-600 font-nunito line-clamp-2">{post.content}</p>
                            </div>

                            <div className="flex flex-wrap gap-2">
                              <Badge className="capitalize text-xs border-0 bg-gradient-to-r from-[#6CAC73]/20 to-[#2B4A2F]/10 text-[#2B4A2F] font-poppins">
                                {post.category}
                              </Badge>
                              <Badge className="text-xs border-0 bg-gradient-to-r from-[#6CAC73]/20 to-[#2B4A2F]/10 text-[#2B4A2F] font-poppins">
                                <ThumbsUp className="w-3 h-3 mr-1" />
                                {post._count?.likes || 0} likes
                              </Badge>
                              <Badge className="text-xs border-0 bg-gradient-to-r from-[#6CAC73]/20 to-[#2B4A2F]/10 text-[#2B4A2F] font-poppins">
                                <MessageCircle className="w-3 h-3 mr-1" />
                                {post._count?.comments || 0} comments
                              </Badge>
                              {post.image_url && (
                                <Badge className="text-xs border-0 bg-gradient-to-r from-[#6CAC73]/20 to-[#2B4A2F]/10 text-[#2B4A2F] font-poppins">
                                  <ImageIcon className="w-3 h-3 mr-1" /> Has image
                                </Badge>
                              )}
                            </div>

                            {post.tags?.length > 0 && (
                              <div className="flex flex-wrap gap-1">
                                {post.tags.slice(0, 5).map((tag, i) => (
                                  <Badge key={i} className="text-xs bg-white/80 border border-[#6CAC73]/20 text-[#2B4A2F] font-nunito">
                                    #{tag}
                                  </Badge>
                                ))}
                                {post.tags.length > 5 && (
                                  <Badge className="text-xs bg-white/80 border border-[#6CAC73]/20 text-[#2B4A2F] font-nunito">
                                    +{post.tags.length - 5} more
                                  </Badge>
                                )}
                              </div>
                            )}

                            <div className="flex items-center gap-3 text-xs text-gray-500 font-nunito">
                              <span className="flex items-center gap-1">
                                <User className="w-3 h-3" />
                                {post.user.username}
                              </span>
                              <span className="flex items-center gap-1">
                                <Calendar className="w-3 h-3" />
                                {new Date(post.created_at).toLocaleDateString()}
                              </span>
                            </div>
                          </div>

                          {/* Actions */}
                          <div className="flex flex-col gap-1">
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
                              onClick={() => handleDeletePost(post.post_id)}
                              disabled={isDeleting}
                              className="h-8 w-8 p-0 border-[#6CAC73]/20 bg-white/80 hover:bg-rose-50 text-rose-600 hover:text-rose-700"
                              title="Delete Post"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Comments Tab */}
          <TabsContent value="comments">
            <Card className="border border-[#6CAC73]/20 bg-white/80 backdrop-blur-sm shadow-lg">
              <CardHeader className="p-6 pb-4 flex flex-col gap-1">
                <CardTitle className="text-lg font-semibold text-[#2B4A2F] font-poppins">All Comments</CardTitle>
                <CardDescription className="text-gray-600 font-nunito">Manage platform comments</CardDescription>
              </CardHeader>
              <CardContent className="p-6 pt-0">
                {comments.length === 0 ? (
                  <div className="text-center py-12 flex flex-col items-center gap-2">
                    <MessageCircle className="w-12 h-12 text-gray-300" />
                    <p className="text-gray-500 font-medium font-poppins">No comments found</p>
                    <p className="text-gray-400 text-sm font-nunito">Comments will appear here</p>
                  </div>
                ) : (
                  <div className="flex flex-col gap-3">
                    {comments.map((comment: Comment) => (
                      <div key={comment.comment_id} className="p-4 border border-[#6CAC73]/20 rounded-xl bg-white/60 backdrop-blur-sm hover:bg-white/80 transition-colors flex flex-col lg:flex-row lg:items-start lg:justify-between gap-3">
                        <div className="flex-1 flex flex-col gap-2">
                          <p className="text-sm text-[#2B4A2F] font-nunito">{comment.content}</p>
                          <div className="flex flex-wrap items-center gap-2 text-xs text-gray-500 font-nunito">
                            <span className="flex items-center gap-1">
                              <User className="w-3 h-3" />
                              {comment.user.username}
                            </span>
                            <span>•</span>
                            <span className="flex items-center gap-1">
                              <Calendar className="w-3 h-3" />
                              {new Date(comment.created_at).toLocaleDateString()}
                            </span>
                            {comment.post && (
                              <>
                                <span>•</span>
                                <span className="text-blue-600">On: {comment.post.title}</span>
                              </>
                            )}
                          </div>
                        </div>
                        <Button
                          size="sm"
                          onClick={() => handleDeleteComment(comment.comment_id)}
                          disabled={isDeleting}
                          className="h-8 w-8 p-0 border-[#6CAC73]/20 bg-white/80 hover:bg-rose-50 text-rose-600 hover:text-rose-700 flex-shrink-0"
                          title="Delete Comment"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Reports Tab */}
          <TabsContent value="reports">
            <Card className="border border-[#6CAC73]/20 bg-white/80 backdrop-blur-sm shadow-lg">
              <CardHeader className="p-6 pb-4">
                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                  <div>
                    <CardTitle className="text-lg font-semibold text-[#2B4A2F] font-poppins">
                      All Reports ({reports?.length || 0})
                    </CardTitle>
                    <CardDescription className="text-gray-600 font-nunito">
                      Review and manage content reports
                    </CardDescription>
                  </div>
                  <Select 
                    value={reportParams.status || 'all'}
                    onValueChange={(status) =>
                      setReportParams({ ...reportParams, status: status === 'all' ? undefined : status, page: 1 })
                    }
                  >
                    <SelectTrigger className="w-full lg:w-48 border-[#6CAC73]/20 focus:border-[#6CAC73] focus:ring-[#6CAC73]/10 bg-white/50">
                      <SelectValue placeholder="Filter by status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Status</SelectItem>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="in_review">In Review</SelectItem>
                      <SelectItem value="resolved">Resolved</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardHeader>
              <CardContent className="p-6 pt-0">
                {isLoadingReports ? (
                  <div className="text-center py-12">
                    <Loader2 className="w-8 h-8 animate-spin text-[#6CAC73] mx-auto mb-4" />
                    <p className="text-gray-500 font-poppins">Loading reports...</p>
                  </div>
                ) : !reports || reports.length === 0 ? (
                  <div className="text-center py-12 flex flex-col items-center gap-2">
                    <Flag className="w-12 h-12 text-gray-300" />
                    <p className="text-gray-500 font-medium font-poppins">No reports found</p>
                    <p className="text-gray-400 text-sm font-nunito">
                      {reportParams.status ? 'Try changing the filter' : 'No reports have been filed yet'}
                    </p>
                  </div>
                ) : (
                  <div className="flex flex-col gap-3">
                    {reports.map((report) => (
                      <div 
                        key={report.report_id} 
                        className="p-4 border border-[#6CAC73]/20 rounded-xl bg-white/60 backdrop-blur-sm hover:bg-white/80 hover:shadow-md transition-all duration-300"
                      >
                        <div className="flex flex-col gap-3">
                          {/* Report Header */}
                          <div className="flex items-start justify-between">
                            <div className="flex items-center gap-2">
                              <p className="font-semibold text-[#2B4A2F] font-poppins">Report #{report.report_id}</p>
                              <Badge
                                className={`font-poppins border-0 ${
                                  report.status === 'pending' 
                                    ? 'bg-gradient-to-r from-rose-500/20 to-rose-600/20 text-rose-700' 
                                    : report.status === 'in_review' 
                                    ? 'bg-gradient-to-r from-orange-500/20 to-orange-600/20 text-orange-700'
                                    : 'bg-gradient-to-r from-[#6CAC73]/20 to-[#2B4A2F]/10 text-[#2B4A2F]'
                                }`}
                              >
                                {report.status === 'pending' && <Clock className="w-3 h-3 mr-1" />}
                                {report.status === 'in_review' && <Eye className="w-3 h-3 mr-1" />}
                                {report.status === 'resolved' && <CheckCircle className="w-3 h-3 mr-1" />}
                                {report.status.replace('_', ' ')}
                              </Badge>
                            </div>
                          </div>

                          {/* Report Details */}
                          <div className="flex flex-col gap-2">
                            <p className="text-sm text-gray-600 font-nunito">
                              <span className="font-medium text-[#2B4A2F]">Reason:</span> {report.reason}
                            </p>
                            
                            <div className="text-xs text-gray-500 font-nunito">
                              <span className="flex items-center gap-1">
                                <User className="w-3 h-3" />
                                Reported by: {report.reporter?.username || 'Unknown'}
                              </span>
                              <span className="flex items-center gap-1 mt-1">
                                <Calendar className="w-3 h-3" />
                                {new Date(report.created_at).toLocaleString()}
                              </span>
                            </div>
                          </div>

                          {/* Reported Content */}
                          {report.reported_post && (
                            <div className="p-3 bg-gradient-to-br from-[#FFF9F0] to-white rounded-lg border border-[#6CAC73]/10">
                              <div className="flex items-start gap-3">
                                {report.reported_post.post_id && posts.find(p => p.post_id === report.reported_post?.post_id)?.image_url && (
                                  <div className="w-16 h-16 rounded-lg overflow-hidden border border-[#6CAC73]/20 flex-shrink-0">
                                    <img 
                                      src={posts.find(p => p.post_id === report.reported_post?.post_id)?.image_url} 
                                      alt="Post"
                                      className="w-full h-full object-cover"
                                    />
                                  </div>
                                )}
                                <div className="flex-1">
                                  <span className="font-medium text-[#2B4A2F] font-poppins text-sm">Reported Post</span>
                                  <p className="text-gray-600 mt-1 line-clamp-2 text-sm font-nunito">
                                    {report.reported_post.title || report.reported_post.content}
                                  </p>
                                  {report.reported_post.post_id && (
                                    <Button
                                      size="sm"
                                      onClick={() => {
                                        const post = posts.find(p => p.post_id === report.reported_post?.post_id);
                                        if (post) handleViewPost(post);
                                      }}
                                      className="mt-2 h-7 text-xs border-[#6CAC73]/20 bg-white/80 hover:bg-[#6CAC73]/10 text-[#2B4A2F]"
                                    >
                                      <Eye className="w-3 h-3 mr-1" />
                                      View Full Post
                                    </Button>
                                  )}
                                </div>
                              </div>
                            </div>
                          )}

                          {report.reported_comment && (
                            <div className="p-3 bg-gradient-to-br from-[#FFF9F0] to-white rounded-lg border border-[#6CAC73]/10">
                              <span className="font-medium text-[#2B4A2F] font-poppins text-sm">Reported Comment</span>
                              <p className="text-gray-600 mt-1 text-sm font-nunito">
                                {report.reported_comment.content}
                              </p>
                            </div>
                          )}

                          {report.moderator_notes && (
                            <div className="p-3 bg-gradient-to-br from-blue-50 to-blue-100/50 rounded-lg border border-blue-200">
                              <span className="font-medium text-blue-900 font-poppins text-sm">Moderator Notes</span>
                              <p className="text-blue-700 mt-1 text-sm font-nunito">
                                {report.moderator_notes}
                              </p>
                            </div>
                          )}

                          {report.resolved_at && (
                            <div className="text-xs text-[#6CAC73] font-nunito flex items-center gap-1">
                              <CheckCircle className="w-3 h-3" />
                              Resolved on {new Date(report.resolved_at).toLocaleString()}
                            </div>
                          )}

                          {/* Actions */}
                          <div className="flex gap-2 pt-2">
                            <Button
                              size="sm"
                              onClick={() => handleUpdateReportStatus(report.report_id, 'in_review')}
                              disabled={isUpdatingReport || report.status === 'in_review' || report.status === 'resolved'}
                              className="border-[#6CAC73]/20 bg-white/80 hover:bg-[#6CAC73]/10 text-[#2B4A2F]"
                            >
                              {isUpdatingReport ? (
                                <Loader2 className="w-4 h-4 mr-1 animate-spin" />
                              ) : (
                                <Eye className="w-4 h-4 mr-1" />
                              )}
                              Review
                            </Button>
                            <Button
                              size="sm"
                              onClick={() => openResolveDialog(report)}
                              disabled={isUpdatingReport || report.status === 'resolved'}
                              className="bg-gradient-to-br from-[#2B4A2F] to-[#6CAC73] hover:from-[#2B4A2F]/90 hover:to-[#6CAC73]/90 text-white border-0"
                            >
                              {isUpdatingReport ? (
                                <Loader2 className="w-4 h-4 mr-1 animate-spin" />
                              ) : (
                                <CheckCircle className="w-4 h-4 mr-1" />
                              )}
                              Resolve
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Pagination */}
        {meta && meta.totalPages > 1 && activeTab === 'posts' && (
          <Card className="border border-[#6CAC73]/20 bg-white/80 backdrop-blur-sm shadow-lg">
            <CardContent className="p-4">
              <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3">
                <p className="text-sm text-gray-600 font-nunito">
                  Page {meta.page} of {meta.totalPages} ({meta.totalItems} items)
                </p>
                <div className="flex items-center gap-2">
                  <Button
                    size="sm"
                    onClick={() => setPage(prev => Math.max(1, prev - 1))}
                    disabled={page === 1}
                    className="border-[#6CAC73]/20 bg-white/80 hover:bg-[#6CAC73]/10 text-[#2B4A2F]"
                  >
                    Prev
                  </Button>
                  <Button
                    size="sm"
                    onClick={() => setPage(prev => Math.min(meta.totalPages, prev + 1))}
                    disabled={page === meta.totalPages}
                    className="border-[#6CAC73]/20 bg-white/80 hover:bg-[#6CAC73]/10 text-[#2B4A2F]"
                  >
                    Next
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* View Post Modal */}
      <Dialog open={viewPostModal} onOpenChange={setViewPostModal}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto border-[#6CAC73]/20 bg-white/95 backdrop-blur-sm">
          <DialogHeader>
            <DialogTitle className="text-[#2B4A2F] font-poppins flex items-center justify-between">
              <span>Post Details</span>
              <Button
                size="sm"
                onClick={() => setViewPostModal(false)}
                className="h-8 w-8 p-0 border-[#6CAC73]/20 bg-white/80 hover:bg-[#6CAC73]/10 text-[#2B4A2F]"
              >
                <X className="w-4 h-4" />
              </Button>
            </DialogTitle>
          </DialogHeader>
          
          {selectedPost && (
            <div className="space-y-4 py-4">
              {/* Post Header */}
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

                {/* Meta Info */}
                <div className="flex flex-wrap items-center gap-3 text-sm text-gray-600 font-nunito">
                  <span className="flex items-center gap-1">
                    <User className="w-4 h-4" />
                    {selectedPost.user.username}
                  </span>
                  <span className="flex items-center gap-1">
                    <Calendar className="w-4 h-4" />
                    {new Date(selectedPost.created_at).toLocaleString()}
                  </span>
                  <Badge className="capitalize text-xs border-0 bg-gradient-to-r from-[#6CAC73]/20 to-[#2B4A2F]/10 text-[#2B4A2F] font-poppins">
                    {selectedPost.category}
                  </Badge>
                </div>
              </div>

              {/* Post Image */}
              {selectedPost.image_url && (
                <div className="rounded-xl overflow-hidden border border-[#6CAC73]/20">
                  <img 
                    src={selectedPost.image_url} 
                    alt={selectedPost.title}
                    className="w-full h-auto"
                  />
                </div>
              )}

              {/* Post Content */}
              <div className="p-4 bg-gradient-to-br from-[#FFF9F0] to-white rounded-xl border border-[#6CAC73]/10">
                <p className="text-[#2B4A2F] font-nunito whitespace-pre-wrap">{selectedPost.content}</p>
              </div>

              {/* Tags */}
              {selectedPost.tags?.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {selectedPost.tags.map((tag, i) => (
                    <Badge key={i} className="text-xs bg-white border border-[#6CAC73]/20 text-[#2B4A2F] font-nunito">
                      #{tag}
                    </Badge>
                  ))}
                </div>
              )}

              {/* Stats */}
              <div className="grid grid-cols-3 gap-3">
                <div className="p-3 bg-gradient-to-br from-[#FFF9F0] to-white rounded-lg border border-[#6CAC73]/10 text-center">
                  <p className="text-2xl font-bold text-[#2B4A2F] font-poppins">{selectedPost._count?.likes || 0}</p>
                  <p className="text-xs text-gray-600 font-nunito">Likes</p>
                </div>
                <div className="p-3 bg-gradient-to-br from-[#FFF9F0] to-white rounded-lg border border-[#6CAC73]/10 text-center">
                  <p className="text-2xl font-bold text-[#2B4A2F] font-poppins">{selectedPost._count?.comments || 0}</p>
                  <p className="text-xs text-gray-600 font-nunito">Comments</p>
                </div>
                <div className="p-3 bg-gradient-to-br from-[#FFF9F0] to-white rounded-lg border border-[#6CAC73]/10 text-center">
                  <p className="text-2xl font-bold text-rose-600 font-poppins">{selectedPost._count?.reports || 0}</p>
                  <p className="text-xs text-gray-600 font-nunito">Reports</p>
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-2 pt-4 border-t border-[#6CAC73]/20">
                <Button
                  onClick={() => handleFeaturePost(selectedPost.post_id)}
                  disabled={isFeaturing}
                  className="flex-1 border-[#6CAC73]/20 bg-white/80 hover:bg-[#6CAC73]/10 text-[#2B4A2F]"
                >
                  <Star className={`w-4 h-4 mr-2 ${selectedPost.featured ? 'fill-yellow-500 text-yellow-500' : ''}`} />
                  {selectedPost.featured ? 'Unfeature' : 'Feature'} Post
                </Button>
                <Button
                  onClick={() => handleDeletePost(selectedPost.post_id)}
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
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Resolve Report Modal */}
      <Dialog open={resolveReportModal} onOpenChange={setResolveReportModal}>
        <DialogContent className="border-[#6CAC73]/20 bg-white/95 backdrop-blur-sm">
          <DialogHeader>
            <DialogTitle className="text-[#2B4A2F] font-poppins">Resolve Report</DialogTitle>
            <DialogDescription className="font-nunito">
              Add moderator notes and resolve this report
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            {selectedReport && (
              <div className="p-3 bg-gradient-to-br from-[#FFF9F0] to-white rounded-lg border border-[#6CAC73]/10">
                <p className="text-sm font-medium text-[#2B4A2F] font-poppins mb-1">Report #{selectedReport.report_id}</p>
                <p className="text-sm text-gray-600 font-nunito">{selectedReport.reason}</p>
              </div>
            )}
            <div className="space-y-2">
              <Label htmlFor="notes" className="text-[#2B4A2F] font-poppins">Moderator Notes</Label>
              <Textarea
                id="notes"
                value={moderatorNotes}
                onChange={(e) => setModeratorNotes(e.target.value)}
                placeholder="Add notes about the action taken..."
                rows={4}
                className="border-[#6CAC73]/20 focus:border-[#6CAC73] focus:ring-[#6CAC73]/10"
              />
            </div>
          </div>
          <div className="flex gap-2">
            <Button 
              onClick={() => setResolveReportModal(false)}
              disabled={isUpdatingReport}
              className="flex-1 border-[#6CAC73]/20 bg-white/80 hover:bg-[#6CAC73]/10 text-[#2B4A2F]"
            >
              Cancel
            </Button>
            <Button 
              onClick={handleResolveReport}
              disabled={isUpdatingReport}
              className="flex-1 bg-gradient-to-br from-[#2B4A2F] to-[#6CAC73] hover:from-[#2B4A2F]/90 hover:to-[#6CAC73]/90 text-white border-0"
            >
              {isUpdatingReport ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Resolving...
                </>
              ) : (
                <>
                  <CheckCircle className="w-4 h-4 mr-2" />
                  Resolve Report
                </>
              )}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}