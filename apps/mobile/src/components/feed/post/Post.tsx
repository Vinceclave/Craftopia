// apps/mobile/src/components/feed/post/Post.tsx - CRAFTOPIA REDESIGN
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
    <View className="bg-white border-b border-craftopa-light/10 pb-3 mb-1">
      <View className="px-5 pt-4">
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
          className="rounded-xl active:bg-craftopa-light/5"
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
      <View className="px-5">
        <PostActions
          likeCount={props.likeCount || 0}
          commentCount={props.commentCount || 0}
          isLiked={props.isLiked || false}
          onToggleReaction={props.onToggleReaction}
          onOpenComments={props.onOpenComments}
          onShare={props.onShare}
        />
      </View>
    </View>
  );
});

Post.displayName = 'Post';