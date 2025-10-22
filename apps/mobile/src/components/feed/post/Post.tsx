import React, { memo } from 'react';
import { View } from 'react-native';
import type { PostProps } from './type';
import { PostHeader } from './PostHeader';
import { PostContent } from './PostContent';
import { PostActions } from './PostActions';

export const Post: React.FC<PostProps> = memo((props) => {
  // Validate required data
  if (!props.post_id || !props.title) {
    console.warn('Post component received invalid data:', props);
    return null;
  }

  return (
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
        likeCount={props.likeCount || 0}
        commentCount={props.commentCount || 0}
        isLiked={props.isLiked || false}
        onToggleReaction={props.onToggleReaction}
        onOpenComments={props.onOpenComments}
      />
    </View>
  );
});