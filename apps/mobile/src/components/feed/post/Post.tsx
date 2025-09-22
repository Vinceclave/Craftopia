import React, { memo } from 'react'
import { View } from 'react-native'
import type { PostProps } from './type'
import { PostHeader } from './PostHeader'
import { PostContent } from './PostContent'
import { PostActions } from './PostActions'

export const Post: React.FC<PostProps> = memo((props) => (
  <View className="bg-white border-b border-gray-100 pb-4 mb-4 px-4">
    <PostHeader user={props.user} featured={props.featured} created_at={props.created_at} />
    <PostContent 
      title={props.title} 
      content={props.content} 
      image_url={props.image_url} 
      tags={props.tags} 
    />
    <PostActions
      likeCount={props.likeCount}
      commentCount={props.commentCount}
      isLiked={props.isLiked}
      onToggleReaction={props.onToggleReaction}
      onOpenComments={props.onOpenComments}
    />
  </View>
))