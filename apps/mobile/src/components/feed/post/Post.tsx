// apps/mobile/src/components/feed/post/Post.tsx - CRAFTOPIA REFINED
import React, { memo } from 'react';
import { View, TouchableOpacity } from 'react-native';
import type { PostProps } from './type';
import { PostHeader } from './PostHeader';
import { PostContent } from './PostContent';
import { PostActions } from './PostActions';

export const Post: React.FC<PostProps> = memo((props) => {
  if (!props.post_id || !props.title) {
    console.warn('Post component received invalid data:', props);
    return null;
  }

  return (
    <View className="bg-craftopia-surface border-b border-craftopia-light pb-2 mb-1">
      <View className="px-4 pt-3">
        <PostHeader 
          user={props.user} 
          featured={props.featured} 
          created_at={props.created_at} 
          onOptionsPress={props.onOptionsPress}
        />
        
        {/* Content with subtle hover effect */}
        <TouchableOpacity 
          onPress={props.onPress}
          activeOpacity={0.9}
          disabled={!props.onPress}
          className="rounded-lg active:bg-craftopia-light/5"
        >
          <PostContent
            title={props.title}
            content={props.content}
            image_url={props.image_url}
            tags={props.tags}
          />
        </TouchableOpacity>
      </View>
      
      {/* Clean actions bar */}
      <View className="px-4">
        <PostActions
          likeCount={props.likeCount || 0}
          commentCount={props.commentCount || 0}
          isLiked={props.isLiked || false}
          onToggleReaction={props.onToggleReaction}
          onOpenComments={props.onOpenComments}
        />
      </View>
    </View>
  );
});

Post.displayName = 'Post';