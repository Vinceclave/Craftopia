// apps/web/src/pages/admin/Posts.tsx - COMPLETE FIXED VERSION
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  FileText, Trash2, Star, Loader2, RefreshCw, Undo2, 
  MessageCircle, AlertCircle, Eye, CheckSquare, Image as ImageIcon,
  Calendar
} from 'lucide-react';
import { usePosts } from '@/hooks/usePosts';
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

  const [selectedPosts, setSelectedPosts] = useState<number[]>([]);
  const [activeTab, setActiveTab] = useState<string>('posts');

  // Calculate stats
  const totalPosts = posts.length;
  const totalComments = comments.length;
  const featuredPosts = posts.filter(p => p.featured).length;
  const flaggedPosts = posts.filter(p => p._count && p._count.reports > 0).length;
  const flaggedComments = comments.filter(c => 
    posts.find(p => p.post_id === c.post_id)?._count?.reports ?? 0 > 0
  ).length;

  const handleDeletePost = async (postId: number) => {
    if (!window.confirm('Are you sure you want to delete this post? This action cannot be undone.')) {
      return;
    }
    
    try {
      await deletePost({ postId, reason: 'Deleted by admin via content moderation' });
      alert('Post deleted successfully!');
    } catch (error: any) {
      alert('Error deleting post: ' + error.message);
    }
  };

  const handleDeleteComment = async (commentId: number) => {
    if (!window.confirm('Are you sure you want to delete this comment?')) {
      return;
    }
    
    try {
      await deleteComment({ commentId, reason: 'Deleted by admin via content moderation' });
      alert('Comment deleted successfully!');
    } catch (error: any) {
      alert('Error deleting comment: ' + error.message);
    }
  };

  const handleFeaturePost = async (postId: number) => {
    try {
      await featurePost(postId);
      alert('Post feature status updated successfully!');
    } catch (error: any) {
      alert('Error updating feature status: ' + error.message);
    }
  };

  const handleRestorePost = async (postId: number) => {
    try {
      await restorePost(postId);
      alert('Post restored successfully!');
    } catch (error: any) {
      alert('Error restoring post: ' + error.message);
    }
  };

  const handleBulkDelete = async () => {
    if (selectedPosts.length === 0) {
      alert('Please select posts to delete');
      return;
    }
    
    if (!window.confirm(`Delete ${selectedPosts.length} selected posts?`)) {
      return;
    }
    
    try {
      await bulkDeletePosts({ 
        postIds: selectedPosts, 
        reason: 'Bulk deletion by admin' 
      });
      alert('Posts deleted successfully!');
      setSelectedPosts([]);
    } catch (error: any) {
      alert('Error deleting posts: ' + error.message);
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
    if (selectedPosts.length === posts.length) {
      setSelectedPosts([]);
    } else {
      setSelectedPosts(posts.map(p => p.post_id));
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin text-gray-600 mx-auto mb-4" />
          <p className="text-gray-600">Loading content...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-white p-6">
        <div className="max-w-7xl mx-auto">
          <Alert variant="destructive" className="border-rose-200 bg-rose-50">
            <AlertCircle className="h-4 w-4 text-rose-600" />
            <AlertDescription className="text-rose-700">
              <div className="flex items-center justify-between">
                <span>Error loading content: {(error as Error).message}</span>
                <Button size="sm" variant="outline" onClick={() => refetch()}>
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Retry
                </Button>
              </div>
            </AlertDescription>
          </Alert>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-3">
              <FileText className="w-8 h-8 text-gray-600" />
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Content Moderation</h1>
                <p className="text-gray-500 text-sm">Manage and moderate platform content</p>
              </div>
            </div>
            <div className="flex gap-2">
              {selectedPosts.length > 0 && (
                <Button 
                  size="sm" 
                  variant="destructive"
                  onClick={handleBulkDelete}
                  disabled={isBulkDeleting}
                >
                  {isBulkDeleting ? (
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  ) : (
                    <Trash2 className="w-4 h-4 mr-2" />
                  )}
                  Delete {selectedPosts.length} Selected
                </Button>
              )}
              <Button size="sm" variant="outline" onClick={() => refetch()}>
                <RefreshCw className="w-4 h-4 mr-2" />
                Refresh
              </Button>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <Card className="border border-gray-100">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500 mb-1">Total Posts</p>
                  <p className="text-3xl font-bold text-gray-900">{totalPosts}</p>
                </div>
                <FileText className="w-8 h-8 text-gray-400" />
              </div>
            </CardContent>
          </Card>

          <Card className="border border-gray-100">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500 mb-1">Total Comments</p>
                  <p className="text-3xl font-bold text-gray-900">{totalComments}</p>
                </div>
                <MessageCircle className="w-8 h-8 text-gray-400" />
              </div>
            </CardContent>
          </Card>

          <Card className="border border-gray-100">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500 mb-1">Featured Posts</p>
                  <p className="text-3xl font-bold text-yellow-600">{featuredPosts}</p>
                </div>
                <Star className="w-8 h-8 text-yellow-400" />
              </div>
            </CardContent>
          </Card>

          <Card className="border border-gray-100">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500 mb-1">Flagged Content</p>
                  <p className="text-3xl font-bold text-rose-600">{flaggedPosts + flaggedComments}</p>
                </div>
                <AlertCircle className="w-8 h-8 text-rose-400" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="mb-4">
            <TabsTrigger value="posts" className="flex items-center gap-2">
              <FileText className="w-4 h-4" />
              Posts ({totalPosts})
            </TabsTrigger>
            <TabsTrigger value="comments" className="flex items-center gap-2">
              <MessageCircle className="w-4 h-4" />
              Comments ({totalComments})
            </TabsTrigger>
            <TabsTrigger value="flagged" className="flex items-center gap-2">
              <AlertCircle className="w-4 h-4" />
              Flagged ({flaggedPosts})
            </TabsTrigger>
          </TabsList>

          {/* Posts Tab */}
          <TabsContent value="posts">
            <Card className="border border-gray-100">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>All Posts</CardTitle>
                    <CardDescription>Manage all platform posts</CardDescription>
                  </div>
                  {posts.length > 0 && (
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={selectAllPosts}
                    >
                      <CheckSquare className="w-4 h-4 mr-2" />
                      {selectedPosts.length === posts.length ? 'Deselect All' : 'Select All'}
                    </Button>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                {posts.length === 0 ? (
                  <div className="text-center py-12">
                    <FileText className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-500 font-medium mb-2">No posts found</p>
                    <p className="text-gray-400 text-sm">Posts will appear here once created</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {posts.map((post: Post) => (
                      <div 
                        key={post.post_id} 
                        className={`p-4 border rounded-lg transition-all ${
                          selectedPosts.includes(post.post_id) 
                            ? 'border-blue-200 bg-blue-50' 
                            : 'border-gray-100 hover:bg-gray-50'
                        }`}
                      >
                        <div className="flex gap-4">
                          {/* Checkbox */}
                          <div className="flex items-start pt-1">
                            <input
                              type="checkbox"
                              checked={selectedPosts.includes(post.post_id)}
                              onChange={() => togglePostSelection(post.post_id)}
                              className="w-4 h-4 rounded border-gray-300"
                            />
                          </div>

                          {/* Content */}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between gap-4 mb-2">
                              <div className="flex-1">
                                <div className="flex items-center gap-2 mb-1">
                                  <h3 className="font-semibold text-gray-900">{post.title}</h3>
                                  {post.featured && (
                                    <Badge variant="secondary" className="bg-yellow-50 text-yellow-700 border-yellow-200">
                                      <Star className="w-3 h-3 mr-1 fill-yellow-500 text-yellow-500" />
                                      Featured
                                    </Badge>
                                  )}
                                </div>
                                <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                                  {post.content}
                                </p>
                              </div>
                            </div>

                            {/* Post Info */}
                            <div className="flex flex-wrap gap-2 mb-3">
                              <Badge variant="outline" className="capitalize">
                                {post.category}
                              </Badge>
                              <Badge variant="secondary" className="bg-gray-50">
                                {post._count?.likes || 0} likes
                              </Badge>
                              <Badge variant="secondary" className="bg-gray-50">
                                {post._count?.comments || 0} comments
                              </Badge>
                              {post._count && post._count.reports > 0 && (
                                <Badge variant="destructive">
                                  <AlertCircle className="w-3 h-3 mr-1" />
                                  {post._count.reports} reports
                                </Badge>
                              )}
                              {post.image_url && (
                                <Badge variant="secondary" className="bg-gray-50">
                                  <ImageIcon className="w-3 h-3 mr-1" />
                                  Has image
                                </Badge>
                              )}
                            </div>

                            {/* Tags */}
                            {post.tags && post.tags.length > 0 && (
                              <div className="flex flex-wrap gap-1 mb-3">
                                {post.tags.slice(0, 5).map((tag, idx) => (
                                  <Badge 
                                    key={idx} 
                                    variant="outline" 
                                    className="text-xs bg-white"
                                  >
                                    #{tag}
                                  </Badge>
                                ))}
                                {post.tags.length > 5 && (
                                  <Badge variant="outline" className="text-xs bg-white">
                                    +{post.tags.length - 5} more
                                  </Badge>
                                )}
                              </div>
                            )}

                            {/* Meta */}
                            <div className="flex items-center gap-4 text-xs text-gray-500">
                              <span>By {post.user.username}</span>
                              <span>•</span>
                              <span className="flex items-center gap-1">
                                <Calendar className="w-3 h-3" />
                                {new Date(post.created_at).toLocaleDateString()}
                              </span>
                            </div>
                          </div>

                          {/* Actions */}
                          <div className="flex gap-2">
                            <Button 
                              size="sm" 
                              variant="outline"
                              onClick={() => handleFeaturePost(post.post_id)}
                              disabled={isFeaturing}
                              title={post.featured ? "Remove from featured" : "Add to featured"}
                              className="border-gray-200"
                            >
                              <Star className={`w-4 h-4 ${post.featured ? 'fill-yellow-500 text-yellow-500' : 'text-gray-400'}`} />
                            </Button>
                            <Button 
                              size="sm" 
                              variant="outline"
                              onClick={() => handleDeletePost(post.post_id)}
                              disabled={isDeleting}
                              className="border-gray-200 text-rose-600 hover:text-rose-700 hover:bg-rose-50"
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
            <Card className="border border-gray-100">
              <CardHeader>
                <CardTitle>All Comments</CardTitle>
                <CardDescription>Manage platform comments</CardDescription>
              </CardHeader>
              <CardContent>
                {comments.length === 0 ? (
                  <div className="text-center py-12">
                    <MessageCircle className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-500 font-medium mb-2">No comments found</p>
                    <p className="text-gray-400 text-sm">Comments will appear here</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {comments.map((comment: Comment) => (
                      <div 
                        key={comment.comment_id} 
                        className="p-4 border border-gray-100 rounded-lg hover:bg-gray-50"
                      >
                        <div className="flex justify-between items-start gap-4">
                          <div className="flex-1">
                            <p className="text-sm text-gray-900 mb-2">{comment.content}</p>
                            <div className="flex items-center gap-3 text-xs text-gray-500">
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
                            variant="outline"
                            onClick={() => handleDeleteComment(comment.comment_id)}
                            disabled={isDeleting}
                            className="border-gray-200 text-rose-600 hover:bg-rose-50"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Flagged Tab */}
          <TabsContent value="flagged">
            <Card className="border border-gray-100">
              <CardHeader>
                <CardTitle>Flagged Content</CardTitle>
                <CardDescription>Posts with reports requiring attention</CardDescription>
              </CardHeader>
              <CardContent>
                {flaggedPosts === 0 ? (
                  <div className="text-center py-12">
                    <CheckSquare className="w-12 h-12 text-green-300 mx-auto mb-4" />
                    <p className="text-gray-500 font-medium mb-2">No flagged content</p>
                    <p className="text-gray-400 text-sm">All clear! 🎉</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {posts
                      .filter(p => p._count && p._count.reports > 0)
                      .map((post: Post) => (
                        <div 
                          key={post.post_id} 
                          className="p-4 border border-rose-100 bg-rose-50/50 rounded-lg"
                        >
                          <div className="flex gap-4">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-2">
                                <AlertCircle className="w-4 h-4 text-rose-600" />
                                <h3 className="font-semibold text-gray-900">{post.title}</h3>
                                <Badge variant="destructive">
                                  {post._count?.reports} reports
                                </Badge>
                              </div>
                              <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                                {post.content}
                              </p>
                              <div className="text-xs text-gray-500">
                                By {post.user.username} • {new Date(post.created_at).toLocaleDateString()}
                              </div>
                            </div>
                            <div className="flex gap-2">
                              <Button 
                                size="sm" 
                                variant="outline"
                                onClick={() => handleFeaturePost(post.post_id)}
                                disabled={isFeaturing}
                                className="border-gray-200"
                              >
                                <Eye className="w-4 h-4" />
                              </Button>
                              <Button 
                                size="sm" 
                                variant="destructive"
                                onClick={() => handleDeletePost(post.post_id)}
                                disabled={isDeleting}
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
        </Tabs>

        {/* Pagination */}
        {meta && meta.totalPosts > 20 && (
          <Card className="mt-6 border border-gray-100">
            <CardContent className="py-4">
              <div className="flex items-center justify-between">
                <div className="text-sm text-gray-600">
                  Showing page {page}
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={page === 1}
                    onClick={() => setPage(page - 1)}
                    className="border-gray-200"
                  >
                    Previous
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setPage(page + 1)}
                    className="border-gray-200"
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