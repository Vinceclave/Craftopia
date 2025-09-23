import React, { memo } from 'react';
import { View } from 'react-native';
import type { PostProps } from './type';
import { PostHeader } from './PostHeader';
import { PostContent } from './PostContent';
import { PostActions } from './PostActions';

export const Post: React.FC<PostProps> = memo((props) => (
  <View className="bg-craftopia-surface border-b border-craftopia-light pb-3 mb-3 p-4">
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
));
