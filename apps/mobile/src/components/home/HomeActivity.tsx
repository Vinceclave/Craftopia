// HomeActivity.tsx - Redesigned with modern Craftopia aesthetic
import React, { useEffect, useState } from 'react';
import { Text, View, TouchableOpacity, ActivityIndicator } from 'react-native';
import { Activity, Award, MessageCircle, Heart, ChevronRight, Trophy, Sparkles, FileText, CheckCircle, Clock, Target } from 'lucide-react-native';
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
            description: post.title || 'Created a new post',
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
              description: `${post.likeCount || post.like_count} people liked your post`,
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
              description: `${post.commentCount || post.comment_count} comments on your post`,
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
          const challengeTitle = challenge?.title || 'Challenge';

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
        description: data.title || 'Created a new post',
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
        description: `${data.username} liked your post`,
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
        description: `${data.username} commented on your post`,
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
        description: `${data.challenge?.title || 'Quest'} completed`,
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
        description: data.reason || 'You earned points!',
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
        return <FileText size={18} color="#5A7160" />;
      case 'like':
        return <Heart size={18} color="#EF4444" />;
      case 'comment':
        return <MessageCircle size={18} color="#9333EA" />;
      case 'challenge_verified':
        return <CheckCircle size={18} color="#10B981" />;
      case 'challenge_pending':
        return <Clock size={18} color="#F59E0B" />;
      case 'challenge_completed':
        return <Target size={18} color="#5A7160" />;
      case 'points':
        return <Award size={18} color="#D4A96A" />;
      default:
        return <Activity size={18} color="#6B7280" />;
    }
  };

  // Loading State
    if (isLoading) {
    return (
      <View className="px-5 mb-4">
        <View className="flex-row items-center justify-between mb-3">
          <View>
            <Text className="text-xs font-nunito text-craftopa-textSecondary tracking-wide mb-0.5">
              Recent Activity
            </Text>
            <Text className="text-base font-poppinsBold text-craftopa-textPrimary tracking-tight">
              Loading Your Journey
            </Text>
          </View>
        </View>
        
        <View className="bg-white rounded-2xl p-6 items-center justify-center shadow-sm border border-craftopa-light/5 min-h-24">
          <ActivityIndicator size="small" color="#5A7160" />
          <Text className="text-xs font-nunito text-craftopa-textSecondary mt-2 tracking-wide">
            Loading your activities...
          </Text>
        </View>
      </View>
    );
  }

  // Empty State
  if (activities.length === 0) {
    return (
      <View className="px-5 mb-4">
        <View className="flex-row items-center justify-between mb-3">
          <View>
            <Text className="text-xs font-nunito text-craftopa-textSecondary tracking-wide mb-0.5">
              Recent Activity
            </Text>
            <Text className="text-base font-poppinsBold text-craftopa-textPrimary tracking-tight">
              Your Journey
            </Text>
          </View>
        </View>
        
        <View className="bg-white rounded-2xl p-5 items-center shadow-sm border border-craftopa-light/5">
          <View className="w-12 h-12 rounded-xl bg-craftopa-primary/5 items-center justify-center mb-2 border border-craftopa-light/10">
            <Sparkles size={20} color="#5A7160" opacity={0.7} />
          </View>
          <Text className="text-base font-poppinsBold text-craftopa-textPrimary mb-1 tracking-tight">
            Start Your Journey!
          </Text>
          <Text className="text-xs font-nunito text-craftopa-textSecondary text-center tracking-wide">
            Complete quests and create posts to see activity here.
          </Text>
        </View>
      </View>
    );
  }

  return (
    <View className="px-5 mb-4">
      {/* Section Header */}
      <View className="flex-row items-center justify-between mb-3">
        <View>
          <Text className="text-xs font-nunito text-craftopa-textSecondary tracking-wide mb-0.5">
            Recent Activity
          </Text>
          <View className="flex-row items-center">
            <Text className="text-base font-poppinsBold text-craftopa-textPrimary tracking-tight mr-1.5">
              Your Journey
            </Text>
            {isConnected && (
              <View className="w-1.5 h-1.5 rounded-full bg-green-500 shadow-sm" />
            )}
          </View>
        </View>
        
        <TouchableOpacity 
          className="flex-row items-center px-3 py-1.5 rounded-lg active:opacity-70"
          style={{ backgroundColor: 'rgba(90, 113, 96, 0.08)' }}
        >
          <Text className="text-xs font-poppinsBold mr-1 text-craftopa-textPrimary">
            View All
          </Text>
          <ChevronRight size={12} color="#5A7160" />
        </TouchableOpacity>
      </View>

      {/* Activity Timeline */}
      <View className="bg-white rounded-2xl shadow-sm border border-craftopa-light/5 overflow-hidden mb-3">
        {activities.slice(0, 4).map((activity, index) => ( // Reduced from 5 to 4
          <TouchableOpacity
            key={activity.id}
            className="px-4 py-3 active:opacity-70"
            style={{
              borderBottomWidth: index < Math.min(activities.length, 4) - 1 ? 1 : 0,
              borderBottomColor: 'rgba(90, 113, 96, 0.05)',
              backgroundColor: activity.isNew ? 'rgba(90, 113, 96, 0.03)' : 'transparent',
            }}
          >
            <View className="flex-row items-start">
              {/* Icon */}
              <View className="w-8 h-8 rounded-lg bg-white items-center justify-center mr-2.5 shadow-sm border border-craftopa-light/5">
                {getActivityIcon(activity.type)}
              </View>

              {/* Content */}
              <View className="flex-1">
                <View className="flex-row items-center justify-between mb-1">
                  <View className="flex-row items-center flex-1">
                    <Text className="text-sm font-poppinsBold text-craftopa-textPrimary flex-1 tracking-tight">
                      {activity.title}
                    </Text>
                    {activity.isNew && (
                      <View className="px-1.5 py-0.5 rounded bg-craftopa-primary/10 ml-1.5">
                        <Text className="text-xs font-poppinsBold text-craftopa-textPrimary">
                          NEW
                        </Text>
                      </View>
                    )}
                  </View>
                  {activity.points && activity.points > 0 && (
                    <View className="px-2 py-0.5 rounded bg-craftopa-accent/10 ml-1.5">
                      <Text className="text-xs font-poppinsBold text-craftopa-accent">
                        +{activity.points}
                      </Text>
                    </View>
                  )}
                </View>
                <Text className="text-xs font-nunito text-craftopa-textSecondary mb-1 tracking-wide" numberOfLines={2}>
                  {activity.description}
                </Text>
                <Text className="text-xs font-nunito text-craftopa-textSecondary tracking-wide">
                  {activity.time}
                </Text>
              </View>
            </View>
          </TouchableOpacity>
        ))}
      </View>

      {/* Motivational Footer */}
      <View className="rounded-xl px-3 py-2 bg-gradient-to-r from-craftopa-primary/5 to-craftopa-accent/3 border border-craftopa-light/10">
        <View className="flex-row items-center justify-center">
          <Sparkles size={14} color="#5A7160" />
          <Text className="text-xs font-nunito text-craftopa-textPrimary text-center flex-1 ml-1.5 tracking-wide">
            Every action creates positive change! 🌱
          </Text>
        </View>
      </View>
    </View>
  );
};