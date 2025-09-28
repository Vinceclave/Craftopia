export interface Comment {
  comment_id: number;
  user_id: number;
  content: string;
  created_at: string;
  user: {
    user_id: number;
    username: string;
  };
}

/**
 * Get comments for a post
 */
export const useComments = (postId: number) => {
  return useQuery({
    queryKey: postKeys.comments(postId),
    queryFn: async (): Promise<Comment[]> => {
      try {
        const response = await postService.getComments(postId.toString());
        return response.data || [];
      } catch (error) {
        console.error('Failed to load comments:', error);
        // Return mock data for now if API fails
        return [
          {
            comment_id: 1,
            user_id: 2,
            content: 'Great post! Thanks for sharing.',
            created_at: new Date().toISOString(),
            user: { user_id: 2, username: 'johndoe' },
          },
          {
            comment_id: 2,
            user_id: 3,
            content: 'This is very helpful, thanks!',
            created_at: new Date(Date.now() - 3600000).toISOString(),
            user: { user_id: 3, username: 'jane_smith' },
          },
        ];
      }
    },
    enabled: !!postId,
    staleTime: 1 * 60 * 1000,
  });
};

/**
 * Add comment mutation
 */
export const useAddComment = () => {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async ({ postId, content }: { postId: number; content: string }) => {
      const response = await postService.addComment({ postId, content });
      return { postId, comment: response.data };
    },
    onSuccess: ({ postId, comment }) => {
      // Add the new comment to the cache
      queryClient.setQueryData(
        postKeys.comments(postId),
        (oldComments: Comment[] = []) => [...oldComments, comment]
      );

      // Update the post's comment count
      queryClient.setQueriesData(
        { queryKey: postKeys.lists() },
        (oldData: any) => {
          if (!oldData) return oldData;

          const updatePost = (post: Post) =>
            post.post_id === postId
              ? { ...post, commentCount: post.commentCount + 1 }
              : post;

          // Handle infinite query structure
          if (oldData.pages) {
            return {
              ...oldData,
              pages: oldData.pages.map((page: any) => ({
                ...page,
                posts: page.posts?.map(updatePost) || [],
              })),
            };
          }

          // Handle regular array structure
          if (Array.isArray(oldData)) {
            return oldData.map(updatePost);
          }

          return oldData;
        }
      );
    },
    onError: (error) => {
      console.error('Failed to add comment:', error);
    },
  });
};