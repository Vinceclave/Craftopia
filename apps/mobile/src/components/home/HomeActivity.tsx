import React, { useEffect, useState } from 'react';
import { Text, View, TouchableOpacity, ActivityIndicator } from 'react-native';
import { Activity, Award, MessageCircle, Heart, ChevronRight, Sparkles, FileText, CheckCircle, Clock, Target } from 'lucide-react-native';
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
        '/api/v1/posts?feedType=all&limit=5'
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
        challengesResponse.data.slice(0, 10).forEach((uc: any) => {
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

    return activities.slice(0, 10);
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

export const HomeActivity = () => {
  const { on, off, isConnected } = useWebSocket();
  const [realtimeActivities, setRealtimeActivities] = useState<ActivityItem[]>([]);

  const {
    data: apiActivities = [],
    isLoading,
    refetch,
  } = useQuery({
    queryKey: ['homeActivity'],
    queryFn: fetchUserActivity,
    refetchInterval: 30000,
    staleTime: 20000,
  });

  const activities = [...realtimeActivities, ...apiActivities]
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
    .slice(0, 10);

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
      
      setRealtimeActivities(prev => [newActivity, ...prev.slice(0, 4)]);
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
      
      setRealtimeActivities(prev => [newActivity, ...prev.slice(0, 4)]);
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
      
      setRealtimeActivities(prev => [newActivity, ...prev.slice(0, 4)]);
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
      
      setRealtimeActivities(prev => [newActivity, ...prev.slice(0, 4)]);
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
        description: String(data.reason || 'You earned points'),
        time: 'Just now',
        points: data.points || data.amount || 0,
        isNew: true,
        created_at: new Date().toISOString(),
      };
      
      setRealtimeActivities(prev => [newActivity, ...prev.slice(0, 4)]);
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
    switch (type) {
      case 'post':
        return <FileText size={16} color="#3B6E4D" />;
      case 'like':
        return <Heart size={16} color="#D66B4E" />;
      case 'comment':
        return <MessageCircle size={16} color="#5C89B5" />;
      case 'challenge_verified':
        return <CheckCircle size={16} color="#5BA776" />;
      case 'challenge_pending':
        return <Clock size={16} color="#E3A84F" />;
      case 'challenge_completed':
        return <Target size={16} color="#3B6E4D" />;
      case 'points':
        return <Award size={16} color="#E3A84F" />;
      default:
        return <Activity size={16} color="#5F6F64" />;
    }
  };

  // Loading State
  if (isLoading) {
    return (
      <View className="px-4 mb-4">
        <View className="flex-row items-center justify-between mb-3">
          <View>
            <Text className="text-xs font-nunito text-craftopia-textSecondary mb-1">
              Recent Activity
            </Text>
            <Text className="text-base font-poppinsBold text-craftopia-textPrimary">
              Loading Your Journey
            </Text>
          </View>
        </View>
        
        <View className="bg-craftopia-surface rounded-xl p-6 items-center justify-center border border-craftopia-light min-h-24">
          <ActivityIndicator size="small" color="#3B6E4D" />
          <Text className="text-xs font-nunito text-craftopia-textSecondary mt-2">
            Loading your activities
          </Text>
        </View>
      </View>
    );
  }

  // Empty State
  if (activities.length === 0) {
    return (
      <View className="px-4 mb-4">
        <View className="flex-row items-center justify-between mb-3">
          <View>
            <Text className="text-xs font-nunito text-craftopia-textSecondary mb-1">
              Recent Activity
            </Text>
            <Text className="text-base font-poppinsBold text-craftopia-textPrimary">
              Your Journey
            </Text>
          </View>
        </View>
        
        <View className="bg-craftopia-surface rounded-xl p-5 items-center border border-craftopia-light">
          <View className="w-12 h-12 rounded-xl bg-craftopia-primary/10 items-center justify-center mb-3 border border-craftopia-primary/20">
            <Sparkles size={20} color="#3B6E4D" />
          </View>
          <Text className="text-base font-poppinsBold text-craftopia-textPrimary mb-2">
            Start Your Journey
          </Text>
          <Text className="text-sm font-nunito text-craftopia-textSecondary text-center">
            Complete quests and create posts to see activity here
          </Text>
        </View>
      </View>
    );
  }

  return (
    <View className="px-4 mb-4">
      {/* Section Header */}
      <View className="flex-row items-center justify-between mb-3">
        <View>
          <Text className="text-xs font-nunito text-craftopia-textSecondary mb-1">
            Recent Activity
          </Text>
          <View className="flex-row items-center">
            <Text className="text-base font-poppinsBold text-craftopia-textPrimary mr-2">
              Your Journey
            </Text>
            {isConnected && (
              <View className="w-1.5 h-1.5 rounded-full bg-craftopia-success" />
            )}
          </View>
        </View>
        
        <TouchableOpacity 
          className="flex-row items-center px-3 py-1.5 rounded-lg bg-craftopia-primary/10 active:opacity-70"
        >
          <Text className="text-xs font-poppinsBold mr-1 text-craftopia-textPrimary">
            View All
          </Text>
          <ChevronRight size={12} color="#3B6E4D" />
        </TouchableOpacity>
      </View>

      {/* Activity Timeline */}
      <View className="bg-craftopia-surface rounded-xl border border-craftopia-light overflow-hidden mb-3">
        {activities.slice(0, 4).map((activity, index) => (
          <TouchableOpacity
            key={activity.id}
            className="px-4 py-3 active:opacity-70"
            style={{
              borderBottomWidth: index < Math.min(activities.length, 4) - 1 ? 1 : 0,
              borderBottomColor: '#F5F7F2',
              backgroundColor: activity.isNew ? 'rgba(59, 110, 77, 0.05)' : 'transparent',
            }}
          >
            <View className="flex-row items-start">
              {/* Icon */}
              <View className="w-8 h-8 rounded-lg bg-craftopia-light items-center justify-center mr-3 border border-craftopia-light">
                {getActivityIcon(activity.type)}
              </View>

              {/* Content */}
              <View className="flex-1">
                <View className="flex-row items-center justify-between mb-1">
                  <View className="flex-row items-center flex-1">
                    <Text className="text-sm font-poppinsBold text-craftopia-textPrimary flex-1">
                      {activity.title}
                    </Text>
                    {activity.isNew && (
                      <View className="px-1.5 py-0.5 rounded bg-craftopia-primary/10 ml-2">
                        <Text className="text-xs font-poppinsBold text-craftopia-textPrimary">
                          NEW
                        </Text>
                      </View>
                    )}
                  </View>
                  {activity.points && activity.points > 0 && (
                    <View className="px-2 py-0.5 rounded bg-craftopia-warning/10 ml-2">
                      <Text className="text-xs font-poppinsBold text-craftopia-warning">
                        +{activity.points}
                      </Text>
                    </View>
                  )}
                </View>
                <Text className="text-xs font-nunito text-craftopia-textSecondary mb-1" numberOfLines={2}>
                  {activity.description}
                </Text>
                <Text className="text-xs font-nunito text-craftopia-textSecondary">
                  {activity.time}
                </Text>
              </View>
            </View>
          </TouchableOpacity>
        ))}
      </View>

      {/* Motivational Footer */}
      <View className="rounded-xl p-3 bg-craftopia-primary/5 border border-craftopia-primary/20">
        <View className="flex-row items-center justify-center">
          <Sparkles size={14} color="#3B6E4D" />
          <Text className="text-xs font-nunito text-craftopia-textPrimary text-center ml-2">
            Every action creates positive change
          </Text>
        </View>
      </View>
    </View>
  );
};