import React, { useState, useCallback } from 'react'
import { Post } from './Post'
import { CommentModal } from './comment/CommentModal'
import type { Comment } from './type'

interface PostContainerProps extends React.ComponentProps<typeof Post> {
  postId: number
  onLoadComments?: (postId: number) => Promise<Comment[]>
  onAddComment?: (postId: number, content: string) => Promise<void>
  onToggleCommentReaction?: (commentId: number) => Promise<void>
}

export const PostContainer: React.FC<PostContainerProps> = ({
  postId,
  onLoadComments,
  onAddComment,
  onToggleCommentReaction,
  ...postProps
}) => {
  const [showCommentModal, setShowCommentModal] = useState(false)
  const [comments, setComments] = useState<Comment[]>([])
  const [loadingComments, setLoadingComments] = useState(false)

  const handleOpenComments = useCallback(async () => {
    setShowCommentModal(true)
    if (onLoadComments) {
      setLoadingComments(true)
      try {
        const fetched = await onLoadComments(postId)
        setComments(fetched)
      } finally {
        setLoadingComments(false)
      }
    }
  }, [onLoadComments, postId])

  const handleAddComment = useCallback(
    async (content: string) => {
      if (!onAddComment) return
      await onAddComment(postId, content)
      if (onLoadComments) {
        const updated = await onLoadComments(postId)
        setComments(updated)
      }
    },
    [onAddComment, onLoadComments, postId]
  )

  const handleToggleCommentReaction = useCallback(
    async (commentId: number) => {
      if (!onToggleCommentReaction) return
      await onToggleCommentReaction(commentId)
      setComments(prev =>
        prev.map(c =>
          c.comment_id === commentId
            ? { ...c, isLiked: !c.isLiked, likeCount: c.isLiked ? c.likeCount - 1 : c.likeCount + 1 }
            : c
        )
      )
    },
    [onToggleCommentReaction]
  )

  return (
    <>
      <Post {...postProps} onOpenComments={handleOpenComments} />
      <CommentModal
        visible={showCommentModal}
        onClose={() => setShowCommentModal(false)}
        postTitle={postProps.title}
        comments={comments}
        onAddComment={handleAddComment}
        onToggleCommentReaction={handleToggleCommentReaction}
        loading={loadingComments}
      />
    </>
  )
}
