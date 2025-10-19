import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { FileText, Trash2, Star, Loader2, RefreshCw, Undo2 } from 'lucide-react';
import { usePosts } from '@/hooks/usePosts';
import { Alert, AlertDescription } from '@/components/ui/alert';

export default function AdminPosts() {
  const { posts, comments, meta, isLoading, error, page, setPage, refetch, deletePost, deleteComment, featurePost, restorePost, isDeleting, isFeaturing, isRestoring } = usePosts();
  const [selectedPosts, setSelectedPosts] = useState<number[]>([]);

  const handleDeletePost = async (postId: number) => {
    if (!window.confirm('Are you sure you want to delete this post?')) return;
    
    try {
      await deletePost({ postId, reason: 'Deleted by admin' });
      alert('Post deleted successfully!');
    } catch (error: any) {
      alert('Error: ' + error.message);
    }
  };

  const handleFeaturePost = async (postId: number) => {
    try {
      await featurePost(postId);
      alert('Post feature status updated!');
    } catch (error: any) {
      alert('Error: ' + error.message);
    }
  };

  const handleRestorePost = async (postId: number) => {
    try {
      await restorePost(postId);
      alert('Post restored successfully!');
    } catch (error: any) {
      alert('Error: ' + error.message);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-gray-600">Loading content...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-7xl mx-auto">
          <Alert variant="destructive" className="mb-4">
            <AlertDescription>
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
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3 mb-2">
              <FileText className="w-8 h-8 text-blue-600" />
              <h1 className="text-3xl font-bold text-gray-900">Content Moderation</h1>
            </div>
            <Button size="sm" variant="outline" onClick={() => refetch()}>
              <RefreshCw className="w-4 h-4 mr-2" />
              Refresh
            </Button>
          </div>
          <p className="text-gray-600">Moderate and manage platform content</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <p className="text-sm text-gray-600 mb-1">Total Posts</p>
                <p className="text-3xl font-bold">{posts.length}</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <p className="text-sm text-gray-600 mb-1">Total Comments</p>
                <p className="text-3xl font-bold">{comments.length}</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <p className="text-sm text-gray-600 mb-1">Flagged Content</p>
                <p className="text-3xl font-bold text-red-600">
                  {posts.filter(p => p._count && p._count.reports > 0).length}
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Posts */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Posts with Reports</CardTitle>
            <CardDescription>Posts that have been reported by users</CardDescription>
          </CardHeader>
          <CardContent>
            {posts.length === 0 ? (
              <div className="text-center py-12">
                <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">No posts to review</p>
              </div>
            ) : (
              <div className="space-y-4">
                {posts.map((post) => (
                  <div key={post.post_id} className="p-4 border rounded-lg hover:bg-gray-50">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h3 className="font-semibold">{post.title}</h3>
                          {post.featured && (
                            <Badge variant="default" className="bg-yellow-500">
                              <Star className="w-3 h-3 mr-1" />
                              Featured
                            </Badge>
                          )}
                        </div>
                        <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                          {post.content}
                        </p>
                        <div className="flex gap-2 flex-wrap">
                          <Badge variant="secondary">{post.category}</Badge>
                          <Badge variant="outline">
                            {post._count?.likes || 0} likes
                          </Badge>
                          <Badge variant="outline">
                            {post._count?.comments || 0} comments
                          </Badge>
                          {post._count && post._count.reports > 0 && (
                            <Badge variant="destructive">
                              {post._count.reports} reports
                            </Badge>
                          )}
                        </div>
                        <div className="mt-2 text-xs text-gray-500">
                          By {post.user.username} • {new Date(post.created_at).toLocaleDateString()}
                        </div>
                      </div>
                      <div className="flex gap-2 ml-4">
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => handleFeaturePost(post.post_id)}
                          disabled={isFeaturing}
                          title={post.featured ? "Unfeature" : "Feature"}
                        >
                          <Star className={`w-4 h-4 ${post.featured ? 'fill-yellow-500 text-yellow-500' : ''}`} />
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

        {/* Comments */}
        <Card>
          <CardHeader>
            <CardTitle>Flagged Comments</CardTitle>
            <CardDescription>Comments that have been reported</CardDescription>
          </CardHeader>
          <CardContent>
            {comments.length === 0 ? (
              <div className="text-center py-12">
                <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">No comments to review</p>
              </div>
            ) : (
              <div className="space-y-4">
                {comments.map((comment) => (
                  <div key={comment.comment_id} className="p-4 border rounded-lg hover:bg-gray-50">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <p className="text-sm mb-2">{comment.content}</p>
                        <div className="text-xs text-gray-500">
                          By {comment.user.username} • {new Date(comment.created_at).toLocaleDateString()}
                          {comment.post && (
                            <span> • On post: {comment.post.title}</span>
                          )}
                        </div>
                      </div>
                      <Button 
                        size="sm" 
                        variant="destructive"
                        onClick={() => deleteComment({ commentId: comment.comment_id })}
                        disabled={isDeleting}
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
      </div>
    </div>
  );
}