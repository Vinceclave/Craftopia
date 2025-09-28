import React, { useState, useCallback } from 'react'
import { Post } from './Post'
import { CommentModal } from './comment/CommentModal'
import { useComments, useAddComment, type Comment } from '~/hooks/queries/usePosts'

interface PostContainerProps extends React.ComponentProps<typeof Post> {
  postId: number
}

export const PostContainer: React.FC<PostContainerProps> = ({
  postId,
  ...postProps
}) => {
  const [showCommentModal, setShowCommentModal] = useState(false)

  // TanStack Query hooks for comments
  const { 
    data: comments = [], 
    isLoading: loadingComments, 
    refetch: refetchComments 
  } = useComments(postId)

  const addCommentMutation = useAddComment()

  const handleOpenComments = useCallback(() => {
    console.log('Opening comments for post:', postId)
    setShowCommentModal(true)
    // Comments will be loaded automatically by useComments hook
  }, [postId])

  const handleAddComment = useCallback(
    async (content: string) => {
      if (!content.trim()) {
        console.log('Empty comment content')
        return
      }
      
      console.log('Adding comment:', content, 'to post:', postId)
      
      try {
        await addCommentMutation.mutateAsync({ postId, content })
        console.log('Comment added successfully')
        // The mutation will automatically update the cache
      } catch (error) {
        console.error('Failed to add comment:', error)
        // You could show a toast notification here
      }
    },
    [addCommentMutation, postId]
  )

  const handleCloseModal = useCallback(() => {
    console.log('Closing comment modal')
    setShowCommentModal(false)
  }, [])

  return (
    <>
      <Post {...postProps} onOpenComments={handleOpenComments} />
      <CommentModal
        visible={showCommentModal}
        onClose={handleCloseModal}
        postTitle={postProps.title}
        comments={comments}
        onAddComment={handleAddComment}
        loading={loadingComments}
        submitting={addCommentMutation.isPending}
      />
    </>
  )
}