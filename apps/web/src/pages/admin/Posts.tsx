// apps/web/src/pages/admin/Posts.tsx - WITH WEBSOCKET
import { useState, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  FileText, Trash2, Star, Loader2, RefreshCw, Undo2,
  MessageCircle, AlertCircle, Eye, CheckSquare, Image as ImageIcon,
  Calendar, MoreHorizontal, Wifi
} from 'lucide-react';
import { usePosts } from '@/hooks/usePosts';
import { useWebSocketPosts, useWebSocket } from '@/hooks/useWebSocket';
import { useToast } from '@/hooks/useToast';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Post, Comment } from '@/lib/api';

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
    restorePost,
    bulkDeletePosts,
    isDeleting,
    isFeaturing,
    isRestoring,
    isBulkDeleting
  } = usePosts();

  const { isConnected } = useWebSocket();
  const { success, info } = useToast();

  const [selectedPosts, setSelectedPosts] = useState<number[]>([]);
  const [activeTab, setActiveTab] = useState<string>('posts');

  // WebSocket real-time updates
  useWebSocketPosts({
    onCreated: useCallback((data) => {
      info('New post created: ' + (data.title || 'Untitled'));
      refetch();
    }, [info, refetch]),
    
    onUpdated: useCallback((data) => {
      info('Post updated' + data);
      refetch();
    }, [info, refetch]),
    
    onDeleted: useCallback((data) => {
      info('Post removed' + data);
      refetch();
    }, [info, refetch]),
  });

  // Stats
  const totalPosts = posts.length;
  const totalComments = comments.length;
  const featuredPosts = posts.filter(p => p.featured).length;
  const flaggedPosts = posts.filter(p => p._count && p._count.reports > 0).length;
  const flaggedComments = comments.filter(c =>
    posts.find(p => p.post_id === c.post_id)?._count?.reports ?? 0 > 0
  ).length;

  // Handlers
  const handleDeletePost = async (postId: number) => {
    if (!window.confirm('Are you sure you want to delete this post?')) return;
    try {
      await deletePost({ postId, reason: 'Deleted by admin via moderation' });
      success('Post deleted successfully!');
    } catch (err: any) {
      alert('Error deleting post: ' + err.message);
    }
  };

  const handleDeleteComment = async (commentId: number) => {
    if (!window.confirm('Are you sure you want to delete this comment?')) return;
    try {
      await deleteComment({ commentId, reason: 'Deleted by admin via moderation' });
      success('Comment deleted successfully!');
    } catch (err: any) {
      alert('Error deleting comment: ' + err.message);
    }
  };

  const handleFeaturePost = async (postId: number) => {
    try {
      await featurePost(postId);
      success('Feature status updated!');
    } catch (err: any) {
      alert('Error updating feature status: ' + err.message);
    }
  };

  const handleRestorePost = async (postId: number) => {
    try {
      await restorePost(postId);
      success('Post restored!');
    } catch (err: any) {
      alert('Error restoring post: ' + err.message);
    }
  };

  const handleBulkDelete = async () => {
    if (selectedPosts.length === 0) return alert('Select posts to delete');
    if (!window.confirm(`Delete ${selectedPosts.length} selected posts?`)) return;
    try {
      await bulkDeletePosts({ postIds: selectedPosts, reason: 'Bulk deletion by admin' });
      success('Posts deleted!');
      setSelectedPosts([]);
    } catch (err: any) {
      alert('Error deleting posts: ' + err.message);
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

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center flex flex-col gap-3">
          <Loader2 className="w-8 h-8 animate-spin text-muted-foreground mx-auto" />
          <p className="text-muted-foreground text-sm">Loading content...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-background p-6 lg:p-8">
        <div className="max-w-7xl mx-auto">
          <Alert variant="destructive" className="border-destructive/20 bg-destructive/10">
            <AlertCircle className="h-4 w-4 text-destructive" />
            <AlertDescription className="flex items-center justify-between gap-4">
              <span>Error loading content: {(error as Error).message}</span>
              <Button size="sm" variant="outline" onClick={() => refetch()} className="border-border">
                <RefreshCw className="w-4 h-4 mr-2" /> Retry
              </Button>
            </AlertDescription>
          </Alert>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-6 lg:p-8 flex flex-col gap-8">
      <div className="w-full max-w-7xl mx-auto flex flex-col gap-6">

        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 bg-foreground rounded-lg flex items-center justify-center">
                <FileText className="w-5 h-5 text-background" />
              </div>
              <h1 className="text-3xl font-light tracking-tight text-foreground">
                Content Moderation
              </h1>
              {/* Real-time indicator */}
              {isConnected && (
                <Badge variant="secondary" className="bg-emerald-50 text-emerald-700 border-emerald-200 animate-pulse">
                  <Wifi className="w-3 h-3 mr-1" />
                  Live
                </Badge>
              )}
            </div>
            <p className="text-muted-foreground text-sm">Manage and moderate platform content in real-time</p>
          </div>

          <div className="flex items-center gap-3">
            {selectedPosts.length > 0 && (
              <Button
                size="sm"
                variant="destructive"
                onClick={handleBulkDelete}
                disabled={isBulkDeleting}
                className="flex items-center gap-2"
              >
                {isBulkDeleting ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Trash2 className="w-4 h-4" />
                )}
                Delete {selectedPosts.length}
              </Button>
            )}
            <Button size="sm" variant="outline" onClick={() => refetch()} className="border-border">
              <RefreshCw className="w-4 h-4" />
            </Button>
            <Button size="sm" variant="ghost" className="w-9 h-9 p-0">
              <MoreHorizontal className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-5">
          {[
            { label: 'Total Posts', value: totalPosts, icon: FileText, color: 'text-foreground' },
            { label: 'Total Comments', value: totalComments, icon: MessageCircle, color: 'text-foreground' },
            { label: 'Featured', value: featuredPosts, icon: Star, color: 'text-yellow-600' },
            { label: 'Flagged Posts', value: flaggedPosts, icon: AlertCircle, color: 'text-rose-600' },
            { label: 'Flagged Comments', value: flaggedComments, icon: AlertCircle, color: 'text-orange-600' }
          ].map((stat, i) => (
            <Card key={i} className="border-0 bg-background shadow-xs hover:shadow-sm transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex flex-col gap-1">
                    <p className="text-sm text-muted-foreground">{stat.label}</p>
                    <p className={`text-2xl font-light ${stat.color}`}>{stat.value}</p>
                  </div>
                  <div className="w-10 h-10 bg-muted/50 rounded-lg flex items-center justify-center">
                    <stat.icon className="w-5 h-5 text-muted-foreground" />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="flex flex-col gap-6">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <TabsList className="bg-muted/50 p-1 rounded-lg border border-border flex gap-2">
              <TabsTrigger value="posts" className="flex items-center gap-2 text-sm">
                <FileText className="w-4 h-4" /> Posts ({totalPosts})
              </TabsTrigger>
              <TabsTrigger value="comments" className="flex items-center gap-2 text-sm">
                <MessageCircle className="w-4 h-4" /> Comments ({totalComments})
              </TabsTrigger>
              <TabsTrigger value="flagged" className="flex items-center gap-2 text-sm">
                <AlertCircle className="w-4 h-4" /> Flagged ({flaggedPosts})
              </TabsTrigger>
            </TabsList>

            {activeTab === 'posts' && posts.length > 0 && (
              <Button
                size="sm"
                variant="ghost"
                onClick={selectAllPosts}
                className="border-border text-sm"
              >
                <CheckSquare className="w-4 h-4 mr-2" />
                {selectedPosts.length === posts.length ? 'Deselect All' : 'Select All'}
              </Button>
            )}
          </div>

          {/* Posts Tab */}
          <TabsContent value="posts">
            <Card className="border-0 shadow-xs">
              <CardHeader className="p-6 pb-4 flex flex-col gap-1">
                <CardTitle className="text-lg font-semibold">All Posts</CardTitle>
                <CardDescription className="text-muted-foreground">Manage all platform posts with real-time updates</CardDescription>
              </CardHeader>
              <CardContent className="p-6 pt-0">
                {posts.length === 0 ? (
                  <div className="text-center py-12 flex flex-col items-center gap-2">
                    <FileText className="w-12 h-12 text-muted-foreground/30" />
                    <p className="text-muted-foreground font-medium">No posts found</p>
                    <p className="text-muted-foreground/70 text-sm">Posts will appear here once created</p>
                  </div>
                ) : (
                  <div className="flex flex-col gap-3">
                    {posts.map((post: Post) => (
                      <div
                        key={post.post_id}
                        className={`p-4 rounded-lg border transition-all duration-200 ${
                          selectedPosts.includes(post.post_id)
                            ? 'border-blue-200 bg-blue-50/50'
                            : 'border-border hover:bg-accent'
                        }`}
                      >
                        <div className="flex gap-4">
                          {/* Checkbox */}
                          <div className="flex items-start pt-1">
                            <input
                              type="checkbox"
                              checked={selectedPosts.includes(post.post_id)}
                              onChange={() => togglePostSelection(post.post_id)}
                              className="w-4 h-4 rounded border-border text-foreground focus:ring-foreground"
                            />
                          </div>

                          {/* Post Content */}
                          <div className="flex-1 flex flex-col gap-3">
                            <div className="flex flex-col gap-2">
                              <div className="flex items-center gap-2">
                                <h3 className="font-semibold text-foreground text-sm">{post.title}</h3>
                                {post.featured && (
                                  <Badge variant="secondary" className="bg-yellow-50 text-yellow-700 border-0">
                                    <Star className="w-3 h-3 mr-1 fill-yellow-500 text-yellow-500" /> Featured
                                  </Badge>
                                )}
                              </div>
                              <p className="text-sm text-muted-foreground line-clamp-2">{post.content}</p>
                            </div>

                            <div className="flex flex-wrap gap-2">
                              <Badge variant="secondary" className="capitalize text-xs border-0 bg-muted">
                                {post.category}
                              </Badge>
                              <Badge variant="secondary" className="text-xs border-0 bg-muted">
                                {post._count?.likes || 0} likes
                              </Badge>
                              <Badge variant="secondary" className="text-xs border-0 bg-muted">
                                {post._count?.comments || 0} comments
                              </Badge>
                              {post._count && post._count.reports > 0 && (
                                <Badge variant="destructive" className="text-xs border-0">
                                  <AlertCircle className="w-3 h-3 mr-1" /> {post._count.reports} reports
                                </Badge>
                              )}
                              {post.image_url && (
                                <Badge variant="secondary" className="text-xs border-0 bg-muted">
                                  <ImageIcon className="w-3 h-3 mr-1" /> Has image
                                </Badge>
                              )}
                            </div>

                            {post.tags?.length > 0 && (
                              <div className="flex flex-wrap gap-1">
                                {post.tags.slice(0, 5).map((tag, i) => (
                                  <Badge key={i} variant="outline" className="text-xs bg-background border-border">
                                    #{tag}
                                  </Badge>
                                ))}
                                {post.tags.length > 5 && (
                                  <Badge variant="outline" className="text-xs bg-background border-border">
                                    +{post.tags.length - 5} more
                                  </Badge>
                                )}
                              </div>
                            )}

                            <div className="flex items-center gap-3 text-xs text-muted-foreground">
                              <span>By {post.user.username}</span>
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
                              variant="ghost"
                              onClick={() => handleFeaturePost(post.post_id)}
                              disabled={isFeaturing}
                              className="h-8 w-8 p-0"
                              title="Toggle Featured"
                            >
                              <Star className={`w-4 h-4 ${post.featured ? 'fill-yellow-500 text-yellow-500' : 'text-muted-foreground'}`} />
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => handleDeletePost(post.post_id)}
                              disabled={isDeleting}
                              className="h-8 w-8 p-0 text-destructive hover:bg-destructive/10"
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
            <Card className="border-0 shadow-xs">
              <CardHeader className="p-6 pb-4 flex flex-col gap-1">
                <CardTitle className="text-lg font-semibold">All Comments</CardTitle>
                <CardDescription className="text-muted-foreground">Manage platform comments</CardDescription>
              </CardHeader>
              <CardContent className="p-6 pt-0">
                {comments.length === 0 ? (
                  <div className="text-center py-12 flex flex-col items-center gap-2">
                    <MessageCircle className="w-12 h-12 text-muted-foreground/30" />
                    <p className="text-muted-foreground font-medium">No comments found</p>
                    <p className="text-muted-foreground/70 text-sm">Comments will appear here</p>
                  </div>
                ) : (
                  <div className="flex flex-col gap-3">
                    {comments.map((comment: Comment) => (
                      <div key={comment.comment_id} className="p-4 border border-border rounded-lg hover:bg-accent transition-colors flex flex-col lg:flex-row lg:items-start lg:justify-between gap-3">
                        <div className="flex-1 flex flex-col gap-2">
                          <p className="text-sm text-foreground">{comment.content}</p>
                          <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                            <span>By {comment.user.username}</span>
                            <span>•</span>
                            <span>{new Date(comment.created_at).toLocaleDateString()}</span>
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
                          variant="ghost"
                          onClick={() => handleDeleteComment(comment.comment_id)}
                          disabled={isDeleting}
                          className="h-8 w-8 p-0 text-destructive hover:bg-destructive/10 flex-shrink-0"
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

          {/* Flagged Tab */}
          <TabsContent value="flagged">
            <Card className="border-0 shadow-xs">
              <CardHeader className="p-6 pb-4 flex flex-col gap-1">
                <CardTitle className="text-lg font-semibold">Flagged Content</CardTitle>
                <CardDescription className="text-muted-foreground">Posts with reports requiring attention</CardDescription>
              </CardHeader>
              <CardContent className="p-6 pt-0">
                {flaggedPosts === 0 ? (
                  <div className="text-center py-12 flex flex-col items-center gap-2">
                    <CheckSquare className="w-12 h-12 text-muted-foreground/30" />
                    <p className="text-muted-foreground font-medium">No flagged posts</p>
                    <p className="text-muted-foreground/70 text-sm">Everything looks good</p>
                  </div>
                ) : (
                  <div className="flex flex-col gap-3">
                    {posts.filter(p => p._count && p._count.reports > 0).map((post: Post) => (
                      <div key={post.post_id} className="p-4 border border-destructive/30 bg-destructive/5 rounded-lg flex flex-col lg:flex-row lg:items-start lg:justify-between gap-3">
                        <div className="flex-1 flex flex-col gap-2">
                          <div className="flex items-center gap-2">
                            <AlertCircle className="w-4 h-4 text-destructive" />
                            <h3 className="font-semibold text-destructive text-sm">{post.title}</h3>
                          </div>
                          <p className="text-sm text-muted-foreground line-clamp-2">{post.content}</p>
                          <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                            <span>{post._count?.reports} reports</span>
                            <span>•</span>
                            <span>By {post.user.username}</span>
                            <span>•</span>
                            <span>{new Date(post.created_at).toLocaleDateString()}</span>
                          </div>
                        </div>
                        <div className="flex gap-2 flex-shrink-0">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleRestorePost(post.post_id)}
                            disabled={isRestoring}
                            className="flex items-center gap-2 border-border"
                          >
                            {isRestoring ? (
                              <Loader2 className="w-4 h-4 animate-spin" />
                            ) : (
                              <Undo2 className="w-4 h-4" />
                            )}
                            Restore
                          </Button>
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => handleDeletePost(post.post_id)}
                            disabled={isDeleting}
                            className="flex items-center gap-2"
                          >
                            <Trash2 className="w-4 h-4" /> Delete
                          </Button>
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
        {meta && meta.totalPages > 1 && (
          <Card className="border-0 shadow-xs">
            <CardContent className="p-4">
              <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3">
                <p className="text-sm text-muted-foreground">
                  Page {meta.page} of {meta.totalPages} ({meta.totalItems} items)
                </p>
                <div className="flex items-center gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setPage(prev => Math.max(1, prev - 1))}
                    disabled={page === 1}
                  >
                    Prev
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setPage(prev => Math.min(meta.totalPages, prev + 1))}
                    disabled={page === meta.totalPages}
                  >
                    Next
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}