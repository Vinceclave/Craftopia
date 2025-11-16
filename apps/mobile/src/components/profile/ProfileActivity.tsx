import React, { useEffect, useState } from 'react';
import { Text, View, TouchableOpacity, ActivityIndicator, FlatList } from 'react-native';
import { Activity, Award, MessageCircle, Heart, FileText, CheckCircle, Clock, Target, Sparkles } from 'lucide-react-native';
import { useWebSocket } from '~/context/WebSocketContext';
import { WebSocketEvent } from '~/config/websocket';
import { useQuery } from '@tanstack/react-query';
import { apiService } from '~/services/base.service';

interface ActivityItem {
  id: string;
  type: 'post' | 'comment' | 'like' | 'challenge_completed' | 'challenge_pending' | 'challenge_verified' | 'points';
  title: string;
  description: string;
  time: string;
  points?: number;
  isNew?: boolean;
  created_at: string;
  metadata?: any;
}

// Fetch comprehensive user activity
const fetchUserActivity = async (): Promise<ActivityItem[]> => {
  try {
    const activities: ActivityItem[] = [];

    // 1. Fetch user's posts
    try {
      const postsResponse = await apiService.get<{ data: any[] }>(
        '/api/v1/posts?feedType=all&limit=20'
      );
      
      if (postsResponse.data && Array.isArray(postsResponse.data)) {
        postsResponse.data.forEach((post: any) => {
          activities.push({
            id: `post-${post.post_id}`,
            type: 'post',
            title: 'Post Created',
            description: String(post.title || 'Created a new post'),
            time: formatTimeAgo(post.created_at),
            created_at: post.created_at,
            metadata: { 
              postId: post.post_id,
              likeCount: post.likeCount || post.like_count || 0,
              commentCount: post.commentCount || post.comment_count || 0
            }
          });

          if ((post.likeCount || post.like_count || 0) > 0) {
            activities.push({
              id: `post-likes-${post.post_id}`,
              type: 'like',
              title: 'Post Liked',
              description: `${String(post.likeCount || post.like_count)} people liked your post`,
              time: formatTimeAgo(post.created_at),
              created_at: post.created_at,
              metadata: { postId: post.post_id }
            });
          }

          if ((post.commentCount || post.comment_count || 0) > 0) {
            activities.push({
              id: `post-comments-${post.post_id}`,
              type: 'comment',
              title: 'Post Commented',
              description: `${String(post.commentCount || post.comment_count)} comments on your post`,
              time: formatTimeAgo(post.created_at),
              created_at: post.created_at,
              metadata: { postId: post.post_id }
            });
          }
        });
      }
    } catch (error) {
      console.warn('Failed to fetch posts:', error);
    }

    // 2. Fetch user's challenges
    try {
      const challengesResponse = await apiService.get<{ data: any[] }>(
        '/api/v1/user-challenges/user'
      );

      if (challengesResponse.data && Array.isArray(challengesResponse.data)) {
        challengesResponse.data.forEach((uc: any) => {
          const challenge = uc.challenge;
          const challengeTitle = String(challenge?.title || 'Challenge');

          if (uc.status === 'verified') {
            activities.push({
              id: `challenge-verified-${uc.user_challenge_id}`,
              type: 'challenge_verified',
              title: 'Quest Verified',
              description: `${challengeTitle} completed`,
              time: formatTimeAgo(uc.verified_at || uc.completed_at || uc.updated_at),
              points: challenge?.points_rewards || 0,
              created_at: uc.verified_at || uc.completed_at || uc.updated_at,
              metadata: { 
                userChallengeId: uc.user_challenge_id,
                wasteKg: challenge?.waste_kg || 0
              }
            });
          } else if (uc.status === 'completed' || uc.status === 'pending_verification') {
            activities.push({
              id: `challenge-pending-${uc.user_challenge_id}`,
              type: 'challenge_pending',
              title: 'Quest Pending',
              description: `${challengeTitle} awaiting verification`,
              time: formatTimeAgo(uc.completed_at || uc.updated_at),
              created_at: uc.completed_at || uc.updated_at,
              metadata: { userChallengeId: uc.user_challenge_id }
            });
          } else if (uc.status === 'in_progress') {
            activities.push({
              id: `challenge-progress-${uc.user_challenge_id}`,
              type: 'challenge_completed',
              title: 'Quest Started',
              description: challengeTitle,
              time: formatTimeAgo(uc.created_at),
              created_at: uc.created_at,
              metadata: { userChallengeId: uc.user_challenge_id }
            });
          }
        });
      }
    } catch (error) {
      console.warn('Failed to fetch challenges:', error);
    }

    // Sort by date (newest first)
    activities.sort((a, b) => 
      new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    );

    return activities;
  } catch (error) {
    console.error('Failed to fetch user activity:', error);
    return [];
  }
};

const formatTimeAgo = (dateString: string): string => {
  if (!dateString) return 'Recently';
  
  const now = new Date();
  const date = new Date(dateString);
  const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (seconds < 60) return 'Just now';
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
  if (seconds < 604800) return `${Math.floor(seconds / 86400)}d ago`;
  return `${Math.floor(seconds / 604800)}w ago`;
};

export const ProfileActivity = () => {
  const { on, off, isConnected } = useWebSocket();
  const [realtimeActivities, setRealtimeActivities] = useState<ActivityItem[]>([]);

  const {
    data: apiActivities = [],
    isLoading,
    refetch,
  } = useQuery({
    queryKey: ['profileActivity'],
    queryFn: fetchUserActivity,
    refetchInterval: 30000,
    staleTime: 20000,
  });

  const activities = [...realtimeActivities, ...apiActivities]
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

  // Real-time activity updates via WebSocket
  useEffect(() => {
    if (!isConnected) return;

    const handlePostCreated = (data: any) => {
      const newActivity: ActivityItem = {
        id: `post-rt-${Date.now()}`,
        type: 'post',
        title: 'Post Created',
        description: String(data.title || 'Created a new post'),
        time: 'Just now',
        isNew: true,
        created_at: new Date().toISOString(),
        metadata: { postId: data.post_id }
      };
      
      setRealtimeActivities(prev => [newActivity, ...prev.slice(0, 9)]);
      setTimeout(() => {
        setRealtimeActivities(prev => 
          prev.map(act => act.id === newActivity.id ? { ...act, isNew: false } : act)
        );
      }, 5000);
      refetch();
    };

    const handlePostLiked = (data: any) => {
      const newActivity: ActivityItem = {
        id: `like-rt-${Date.now()}`,
        type: 'like',
        title: 'Post Liked',
        description: `${String(data.username)} liked your post`,
        time: 'Just now',
        isNew: true,
        created_at: new Date().toISOString(),
        metadata: { postId: data.postId }
      };
      
      setRealtimeActivities(prev => [newActivity, ...prev.slice(0, 9)]);
      setTimeout(() => {
        setRealtimeActivities(prev => 
          prev.map(act => act.id === newActivity.id ? { ...act, isNew: false } : act)
        );
      }, 5000);
    };

    const handlePostCommented = (data: any) => {
      const newActivity: ActivityItem = {
        id: `comment-rt-${Date.now()}`,
        type: 'comment',
        title: 'New Comment',
        description: `${String(data.username)} commented on your post`,
        time: 'Just now',
        isNew: true,
        created_at: new Date().toISOString(),
        metadata: { postId: data.postId, commentId: data.commentId }
      };
      
      setRealtimeActivities(prev => [newActivity, ...prev.slice(0, 9)]);
      setTimeout(() => {
        setRealtimeActivities(prev => 
          prev.map(act => act.id === newActivity.id ? { ...act, isNew: false } : act)
        );
      }, 5000);
    };

    const handleChallengeVerified = (data: any) => {
      const newActivity: ActivityItem = {
        id: `challenge-verified-rt-${Date.now()}`,
        type: 'challenge_verified',
        title: 'Quest Verified',
        description: `${String(data.challenge?.title || 'Quest')} completed`,
        time: 'Just now',
        points: data.points_awarded || 0,
        isNew: true,
        created_at: new Date().toISOString(),
        metadata: { 
          userChallengeId: data.userChallengeId,
          wasteKg: data.waste_kg_saved || 0
        }
      };
      
      setRealtimeActivities(prev => [newActivity, ...prev.slice(0, 9)]);
      setTimeout(() => {
        setRealtimeActivities(prev => 
          prev.map(act => act.id === newActivity.id ? { ...act, isNew: false } : act)
        );
      }, 5000);
      refetch();
    };

    const handlePointsAwarded = (data: any) => {
      const newActivity: ActivityItem = {
        id: `points-rt-${Date.now()}`,
        type: 'points',
        title: 'Points Earned',
        description: String(data.reason || 'You earned points!'),
        time: 'Just now',
        points: data.points || data.amount || 0,
        isNew: true,
        created_at: new Date().toISOString(),
      };
      
      setRealtimeActivities(prev => [newActivity, ...prev.slice(0, 9)]);
      setTimeout(() => {
        setRealtimeActivities(prev => 
          prev.map(act => act.id === newActivity.id ? { ...act, isNew: false } : act)
        );
      }, 5000);
    };

    on(WebSocketEvent.POST_CREATED, handlePostCreated);
    on(WebSocketEvent.POST_LIKED, handlePostLiked);
    on(WebSocketEvent.POST_COMMENTED, handlePostCommented);
    on(WebSocketEvent.CHALLENGE_VERIFIED, handleChallengeVerified);
    on(WebSocketEvent.POINTS_AWARDED, handlePointsAwarded);

    return () => {
      off(WebSocketEvent.POST_CREATED, handlePostCreated);
      off(WebSocketEvent.POST_LIKED, handlePostLiked);
      off(WebSocketEvent.POST_COMMENTED, handlePostCommented);
      off(WebSocketEvent.CHALLENGE_VERIFIED, handleChallengeVerified);
      off(WebSocketEvent.POINTS_AWARDED, handlePointsAwarded);
    };
  }, [isConnected, on, off, refetch]);

  const getActivityIcon = (type: string) => {
    const iconSize = 18;
    switch (type) {
      case 'post':
        return <FileText size={iconSize} color="#3B6E4D" />;
      case 'like':
        return <Heart size={iconSize} color="#D66B4E" />;
      case 'comment':
        return <MessageCircle size={iconSize} color="#5C89B5" />;
      case 'challenge_verified':
        return <CheckCircle size={iconSize} color="#5BA776" />;
      case 'challenge_pending':
        return <Clock size={iconSize} color="#E3A84F" />;
      case 'challenge_completed':
        return <Target size={iconSize} color="#3B6E4D" />;
      case 'points':
        return <Award size={iconSize} color="#E6B655" />;
      default:
        return <Activity size={iconSize} color="#5F6F64" />;
    }
  };

  const renderActivityItem = ({ item: activity, index }: { item: ActivityItem; index: number }) => (
    <TouchableOpacity
      className="px-4 py-4 active:opacity-70"
      style={{
        borderBottomWidth: index < activities.length - 1 ? 1 : 0,
        borderBottomColor: '#F5F7F2',
        backgroundColor: activity.isNew ? 'rgba(59, 110, 77, 0.03)' : 'transparent',
      }}
    >
      <View className="flex-row items-start gap-3">
        {/* Icon */}
        <View className="w-10 h-10 rounded-xl bg-craftopia-light items-center justify-center">
          {getActivityIcon(activity.type)}
        </View>

        {/* Content */}
        <View className="flex-1">
          <View className="flex-row items-start justify-between gap-2 mb-1">
            <Text className="text-base font-poppinsBold text-craftopia-textPrimary flex-1">
              {activity.title}
            </Text>
            
            <View className="flex-row items-center gap-1.5">
              {activity.isNew && (
                <View className="px-2 py-0.5 rounded-md bg-craftopia-success/10">
                  <Text className="text-xs font-poppinsBold text-craftopia-success">
                    NEW
                  </Text>
                </View>
              )}
              {activity.points && activity.points > 0 && (
                <View className="px-2 py-0.5 rounded-md bg-craftopia-accent/10">
                  <Text className="text-xs font-poppinsBold text-craftopia-accent">
                    +{activity.points}
                  </Text>
                </View>
              )}
            </View>
          </View>
          
          <Text 
            className="text-sm font-nunito text-craftopia-textSecondary mb-1.5 leading-5" 
            numberOfLines={2}
          >
            {activity.description}
          </Text>
          
          <Text className="text-xs font-nunito text-craftopia-textSecondary">
            {activity.time}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  // Loading State
  if (isLoading) {
    return (
      <View className="px-4 mb-6">
        <View className="flex-row items-center gap-2 mb-4">
          <View className="w-8 h-8 rounded-xl bg-craftopia-accent/10 items-center justify-center">
            <Sparkles size={16} color="#E6B655" />
          </View>
          <Text className="text-lg font-poppinsBold text-craftopia-textPrimary">
            Recent Activity
          </Text>
        </View>
        
        <View className="bg-craftopia-surface rounded-2xl p-8 items-center justify-center border border-craftopia-light">
          <ActivityIndicator size="small" color="#3B6E4D" />
          <Text className="text-sm font-nunito text-craftopia-textSecondary mt-3">
            Loading activities...
          </Text>
        </View>
      </View>
    );
  }

  // Empty State
  if (activities.length === 0) {
    return (
      <View className="px-4 mb-6">
        <View className="flex-row items-center gap-2 mb-4">
          <View className="w-8 h-8 rounded-xl bg-craftopia-accent/10 items-center justify-center">
            <Sparkles size={16} color="#E6B655" />
          </View>
          <Text className="text-lg font-poppinsBold text-craftopia-textPrimary">
            Recent Activity
          </Text>
        </View>
        
        <View className="bg-craftopia-surface rounded-2xl p-8 items-center border border-craftopia-light">
          <View className="w-16 h-16 rounded-2xl bg-craftopia-primary/5 items-center justify-center mb-4">
            <Sparkles size={28} color="#3B6E4D" />
          </View>
          <Text className="text-lg font-poppinsBold text-craftopia-textPrimary mb-2">
            No Activity Yet
          </Text>
          <Text className="text-sm font-nunito text-craftopia-textSecondary text-center max-w-64">
            Start creating posts and completing quests to see your activity timeline
          </Text>
        </View>
      </View>
    );
  }

  return (
    <View className="px-4 mb-6">
      {/* Section Header */}
      <View className="flex-row items-center justify-between mb-4">
        <View className="flex-row items-center gap-2">
          <View className="w-8 h-8 rounded-xl bg-craftopia-accent/10 items-center justify-center">
            <Sparkles size={16} color="#E6B655" />
          </View>
          <Text className="text-lg font-poppinsBold text-craftopia-textPrimary">
            Recent Activity
          </Text>
          {isConnected && (
            <View className="w-2 h-2 rounded-full bg-craftopia-success ml-1" />
          )}
        </View>
        
        <Text className="text-xs font-nunito text-craftopia-textSecondary">
          {activities.length} {activities.length === 1 ? 'item' : 'items'}
        </Text>
      </View>

      {/* Activity List */}
      <View className="bg-craftopia-surface rounded-2xl border border-craftopia-light overflow-hidden">
        <FlatList
          data={activities}
          renderItem={renderActivityItem}
          keyExtractor={(item) => item.id}
          scrollEnabled={false}
        />
      </View>
    </View>
  );
};