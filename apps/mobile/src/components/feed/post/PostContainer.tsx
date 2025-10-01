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
    setShowCommentModal(true)
  }, [])

  const handleAddComment = useCallback(
    async (content: string) => {
      if (!content.trim()) return
      
      try {
        await addCommentMutation.mutateAsync({ postId, content })
      } catch (error) {
        console.error('Failed to add comment:', error)
      }
    },
    [addCommentMutation, postId]
  )

  const handleCloseModal = useCallback(() => {
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