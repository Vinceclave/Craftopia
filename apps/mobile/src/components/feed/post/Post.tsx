import React, { memo } from 'react';
import { View } from 'react-native';
import type { PostProps } from './type';
import { PostHeader } from './PostHeader';
import { PostContent } from './PostContent';
import { PostActions } from './PostActions';

export const Post: React.FC<PostProps> = memo((props) => (
  <View className="bg-craftopia-surface border-b border-craftopia-light/30 pb-3 mb-2 px-4 pt-3">
    <PostHeader 
      user={props.user} 
      featured={props.featured} 
      created_at={props.created_at} 
    />
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
));