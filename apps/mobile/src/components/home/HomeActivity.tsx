// apps/mobile/src/components/home/HomeActivity.tsx - COMPREHENSIVE REAL ACTIVITY
import React, { useEffect, useState } from 'react';
import { Text, View, TouchableOpacity, ActivityIndicator } from 'react-native';
import { Activity, Award, MessageCircle, Heart, TrendingUp, ChevronRight, Trophy, Sparkles, Zap, Target, FileText, CheckCircle, Clock } from 'lucide-react-native';
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
          // Add post creation activity
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

          // Add like activity if post has likes
          if ((post.likeCount || post.like_count || 0) > 0) {
            activities.push({
              id: `post-likes-${post.post_id}`,
              type: 'like',
              title: 'Post Liked',
              description: `${post.likeCount || post.like_count} people liked "${post.title?.substring(0, 30)}..."`,
              time: formatTimeAgo(post.created_at),
              created_at: post.created_at,
              metadata: { postId: post.post_id }
            });
          }

          // Add comment activity if post has comments
          if ((post.commentCount || post.comment_count || 0) > 0) {
            activities.push({
              id: `post-comments-${post.post_id}`,
              type: 'comment',
              title: 'Post Commented',
              description: `${post.commentCount || post.comment_count} comments on "${post.title?.substring(0, 30)}..."`,
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
            // Verified challenge
            activities.push({
              id: `challenge-verified-${uc.user_challenge_id}`,
              type: 'challenge_verified',
              title: 'Challenge Verified ✓',
              description: `${challengeTitle} - Earned ${challenge?.points_rewards || 0} points`,
              time: formatTimeAgo(uc.verified_at || uc.completed_at || uc.updated_at),
              points: challenge?.points_rewards || 0,
              created_at: uc.verified_at || uc.completed_at || uc.updated_at,
              metadata: { 
                userChallengeId: uc.user_challenge_id,
                wasteKg: challenge?.waste_kg || 0
              }
            });
          } else if (uc.status === 'completed' || uc.status === 'pending_verification') {
            // Pending verification
            activities.push({
              id: `challenge-pending-${uc.user_challenge_id}`,
              type: 'challenge_pending',
              title: 'Challenge Pending',
              description: `${challengeTitle} - Waiting for verification`,
              time: formatTimeAgo(uc.completed_at || uc.updated_at),
              created_at: uc.completed_at || uc.updated_at,
              metadata: { userChallengeId: uc.user_challenge_id }
            });
          } else if (uc.status === 'in_progress') {
            // In progress
            activities.push({
              id: `challenge-progress-${uc.user_challenge_id}`,
              type: 'challenge_completed',
              title: 'Challenge In Progress',
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

    return activities.slice(0, 10); // Return top 10 most recent
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

  // Fetch real activity data from API
  const {
    data: apiActivities = [],
    isLoading,
    refetch,
  } = useQuery({
    queryKey: ['homeActivity'],
    queryFn: fetchUserActivity,
    refetchInterval: 30000, // Refetch every 30 seconds
    staleTime: 20000, // Consider data stale after 20 seconds
  });

  // Combine real-time activities with API data
  const activities = [...realtimeActivities, ...apiActivities]
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
    .slice(0, 10);

  // Real-time activity updates via WebSocket
  useEffect(() => {
    if (!isConnected) return;

    console.log('📊 HomeActivity: Setting up real-time listeners');

    // Post created
    const handlePostCreated = (data: any) => {
      console.log('📝 HomeActivity: Post created event:', data);
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

    // Post liked
    const handlePostLiked = (data: any) => {
      console.log('❤️ HomeActivity: Post liked event:', data);
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

    // Post commented
    const handlePostCommented = (data: any) => {
      console.log('💬 HomeActivity: Post commented event:', data);
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

    // Challenge completed
    const handleChallengeCompleted = (data: any) => {
      console.log('⏳ HomeActivity: Challenge completed event:', data);
      const newActivity: ActivityItem = {
        id: `challenge-pending-rt-${Date.now()}`,
        type: 'challenge_pending',
        title: 'Challenge Pending',
        description: `${data.challenge?.title || 'Challenge'} - Awaiting verification`,
        time: 'Just now',
        isNew: true,
        created_at: new Date().toISOString(),
        metadata: { userChallengeId: data.userChallengeId }
      };
      
      setRealtimeActivities(prev => [newActivity, ...prev.slice(0, 4)]);
      setTimeout(() => {
        setRealtimeActivities(prev => 
          prev.map(act => act.id === newActivity.id ? { ...act, isNew: false } : act)
        );
      }, 5000);
      
      refetch();
    };

    // Challenge verified
    const handleChallengeVerified = (data: any) => {
      console.log('🎉 HomeActivity: Challenge verified event:', data);
      const newActivity: ActivityItem = {
        id: `challenge-verified-rt-${Date.now()}`,
        type: 'challenge_verified',
        title: 'Challenge Verified ✓',
        description: `${data.challenge?.title || 'Challenge'} - Earned ${data.points_awarded || 0} points`,
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

    // Challenge joined
    const handleChallengeJoined = (data: any) => {
      console.log('✅ HomeActivity: Challenge joined event:', data);
      const newActivity: ActivityItem = {
        id: `challenge-progress-rt-${Date.now()}`,
        type: 'challenge_completed',
        title: 'Challenge Started',
        description: data.challenge?.title || 'Started a new challenge',
        time: 'Just now',
        isNew: true,
        created_at: new Date().toISOString(),
        metadata: { userChallengeId: data.userChallengeId }
      };
      
      setRealtimeActivities(prev => [newActivity, ...prev.slice(0, 4)]);
      setTimeout(() => {
        setRealtimeActivities(prev => 
          prev.map(act => act.id === newActivity.id ? { ...act, isNew: false } : act)
        );
      }, 5000);
      
      refetch();
    };

    // Points awarded
    const handlePointsAwarded = (data: any) => {
      console.log('⭐ HomeActivity: Points awarded event:', data);
      const newActivity: ActivityItem = {
        id: `points-rt-${Date.now()}`,
        type: 'points',
        title: 'Points Earned',
        description: data.reason || data.challengeTitle || 'You earned points!',
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

    // Register listeners
    on(WebSocketEvent.POST_CREATED, handlePostCreated);
    on(WebSocketEvent.POST_LIKED, handlePostLiked);
    on(WebSocketEvent.POST_COMMENTED, handlePostCommented);
    on(WebSocketEvent.CHALLENGE_COMPLETED, handleChallengeCompleted);
    on(WebSocketEvent.CHALLENGE_VERIFIED, handleChallengeVerified);
    on(WebSocketEvent.CHALLENGE_JOINED, handleChallengeJoined);
    on(WebSocketEvent.POINTS_AWARDED, handlePointsAwarded);

    console.log('✅ HomeActivity: Real-time listeners registered');

    // Cleanup
    return () => {
      console.log('🧹 HomeActivity: Removing real-time listeners');
      off(WebSocketEvent.POST_CREATED, handlePostCreated);
      off(WebSocketEvent.POST_LIKED, handlePostLiked);
      off(WebSocketEvent.POST_COMMENTED, handlePostCommented);
      off(WebSocketEvent.CHALLENGE_COMPLETED, handleChallengeCompleted);
      off(WebSocketEvent.CHALLENGE_VERIFIED, handleChallengeVerified);
      off(WebSocketEvent.CHALLENGE_JOINED, handleChallengeJoined);
      off(WebSocketEvent.POINTS_AWARDED, handlePointsAwarded);
    };
  }, [isConnected, on, off, refetch]);

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'post':
        return <FileText size={16} color="#3B82F6" />;
      case 'like':
        return <Heart size={16} color="#EF4444" />;
      case 'comment':
        return <MessageCircle size={16} color="#8B5CF6" />;
      case 'challenge_verified':
        return <CheckCircle size={16} color="#10B981" />;
      case 'challenge_pending':
        return <Clock size={16} color="#F59E0B" />;
      case 'challenge_completed':
        return <Target size={16} color="#374A36" />;
      case 'points':
        return <Award size={16} color="#D4A96A" />;
      default:
        return <Activity size={16} color="#6B7280" />;
    }
  };

  const getActivityColor = (type: string) => {
    switch (type) {
      case 'post':
        return { bg: 'rgba(59, 130, 246, 0.1)', border: 'rgba(59, 130, 246, 0.15)' };
      case 'like':
        return { bg: 'rgba(239, 68, 68, 0.1)', border: 'rgba(239, 68, 68, 0.15)' };
      case 'comment':
        return { bg: 'rgba(139, 92, 246, 0.1)', border: 'rgba(139, 92, 246, 0.15)' };
      case 'challenge_verified':
        return { bg: 'rgba(16, 185, 129, 0.1)', border: 'rgba(16, 185, 129, 0.15)' };
      case 'challenge_pending':
        return { bg: 'rgba(245, 158, 11, 0.1)', border: 'rgba(245, 158, 11, 0.15)' };
      case 'challenge_completed':
        return { bg: 'rgba(55, 74, 54, 0.1)', border: 'rgba(55, 74, 54, 0.15)' };
      case 'points':
        return { bg: 'rgba(212, 169, 106, 0.1)', border: 'rgba(212, 169, 106, 0.15)' };
      default:
        return { bg: '#F3F4F6', border: '#E5E7EB' };
    }
  };

  // Loading State
  if (isLoading) {
    return (
      <View className="px-4 mb-4">
        <View className="flex-row items-center justify-between mb-3">
          <View className="flex-row items-center">
            <View 
              className="w-9 h-9 rounded-full items-center justify-center mr-2"
              style={{ backgroundColor: 'rgba(55, 74, 54, 0.1)' }}
            >
              <Activity size={18} color="#374A36" />
            </View>
            <View>
              <Text className="text-lg font-bold" style={{ color: '#1A1A1A' }}>
                Recent Activity
              </Text>
              <Text className="text-xs" style={{ color: '#9CA3AF' }}>
                Loading...
              </Text>
            </View>
          </View>
        </View>
        
        <View 
          className="bg-white rounded-xl p-6 items-center justify-center"
          style={{ 
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.05,
            shadowRadius: 8,
            elevation: 2,
            minHeight: 120,
          }}
        >
          <ActivityIndicator size="large" color="#374A36" />
          <Text className="text-sm mt-3" style={{ color: '#6B7280' }}>
            Loading your activities...
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
          <View className="flex-row items-center">
            <View 
              className="w-9 h-9 rounded-full items-center justify-center mr-2"
              style={{ backgroundColor: 'rgba(55, 74, 54, 0.1)' }}
            >
              <Activity size={18} color="#374A36" />
            </View>
            <View>
              <Text className="text-lg font-bold" style={{ color: '#1A1A1A' }}>
                Recent Activity
              </Text>
              <Text className="text-xs" style={{ color: '#9CA3AF' }}>
                No activities yet
              </Text>
            </View>
          </View>
        </View>
        
        <View 
          className="bg-white rounded-xl p-6 items-center"
          style={{ 
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.05,
            shadowRadius: 8,
            elevation: 2,
          }}
        >
          <View 
            className="w-14 h-14 rounded-full items-center justify-center mb-3"
            style={{ backgroundColor: '#F3F4F6' }}
          >
            <Sparkles size={24} color="#9CA3AF" />
          </View>
          <Text className="text-base font-bold mb-1" style={{ color: '#1A1A1A' }}>
            Start Your Journey!
          </Text>
          <Text className="text-sm text-center" style={{ color: '#6B7280' }}>
            Complete challenges, create posts, and interact with the community to see your activity here.
          </Text>
        </View>
      </View>
    );
  }

  return (
    <View className="px-4 mb-4">
      {/* Section Header */}
      <View className="flex-row items-center justify-between mb-3">
        <View className="flex-row items-center">
          <View 
            className="w-9 h-9 rounded-full items-center justify-center mr-2"
            style={{ backgroundColor: 'rgba(55, 74, 54, 0.1)' }}
          >
            <Activity size={18} color="#374A36" />
          </View>
          <View>
            <View className="flex-row items-center">
              <Text className="text-lg font-bold" style={{ color: '#1A1A1A' }}>
                Recent Activity
              </Text>
              {isConnected && (
                <View className="w-2 h-2 rounded-full bg-green-500 ml-2" />
              )}
            </View>
            <Text className="text-xs" style={{ color: '#9CA3AF' }}>
              {activities.length} recent {activities.length === 1 ? 'activity' : 'activities'}
            </Text>
          </View>
        </View>
        
        <TouchableOpacity 
          className="flex-row items-center px-3 py-1.5 rounded-full"
          style={{ backgroundColor: '#F3F4F6' }}
          activeOpacity={0.7}
        >
          <Text className="text-xs font-bold mr-0.5" style={{ color: '#374A36' }}>
            View All
          </Text>
          <ChevronRight size={12} color="#374A36" />
        </TouchableOpacity>
      </View>

      {/* Activity Timeline */}
      <View 
        className="bg-white rounded-xl overflow-hidden mb-3"
        style={{ 
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.05,
          shadowRadius: 8,
          elevation: 2,
        }}
      >
        {activities.slice(0, 5).map((activity, index) => (
          <TouchableOpacity
            key={activity.id}
            className="p-4"
            style={{
              borderBottomWidth: index < Math.min(activities.length, 5) - 1 ? 1 : 0,
              borderBottomColor: '#F3F4F6',
              backgroundColor: activity.isNew ? 'rgba(55, 74, 54, 0.05)' : 'transparent',
            }}
            activeOpacity={0.7}
          >
            <View className="flex-row items-start">
              {/* Icon */}
              <View 
                className="w-9 h-9 rounded-full items-center justify-center mr-3"
                style={{ 
                  backgroundColor: getActivityColor(activity.type).bg,
                  borderWidth: 1,
                  borderColor: getActivityColor(activity.type).border,
                }}
              >
                {getActivityIcon(activity.type)}
              </View>

              {/* Content */}
              <View className="flex-1">
                <View className="flex-row items-center justify-between mb-0.5">
                  <View className="flex-row items-center flex-1">
                    <Text className="text-sm font-bold flex-1" style={{ color: '#1A1A1A' }}>
                      {activity.title}
                    </Text>
                    {activity.isNew && (
                      <View 
                        className="px-2 py-0.5 rounded-full ml-2"
                        style={{ backgroundColor: 'rgba(55, 74, 54, 0.15)' }}
                      >
                        <Text className="text-xs font-bold" style={{ color: '#374A36' }}>
                          NEW
                        </Text>
                      </View>
                    )}
                  </View>
                  {activity.points && activity.points > 0 && (
                    <View 
                      className="px-2.5 py-0.5 rounded-full ml-2"
                      style={{ backgroundColor: 'rgba(212, 169, 106, 0.15)' }}
                    >
                      <Text className="text-xs font-bold" style={{ color: '#D4A96A' }}>
                        +{activity.points}
                      </Text>
                    </View>
                  )}
                </View>
                <Text className="text-xs mb-1" style={{ color: '#6B7280' }} numberOfLines={2}>
                  {activity.description}
                </Text>
                <Text className="text-xs" style={{ color: '#9CA3AF' }}>
                  {activity.time}
                </Text>
              </View>
            </View>
          </TouchableOpacity>
        ))}
      </View>

      {/* Motivational Footer */}
      <View 
        className="rounded-xl px-3 py-3"
        style={{ 
          backgroundColor: 'rgba(55, 74, 54, 0.05)',
          borderWidth: 1,
          borderColor: 'rgba(55, 74, 54, 0.1)',
        }}
      >
        <View className="flex-row items-center">
          <Sparkles size={16} color="#374A36" />
          <Text className="text-xs font-semibold text-center flex-1 ml-2" style={{ color: '#374A36' }}>
            Keep going! Every action makes a difference! 🌍
          </Text>
        </View>
      </View>
    </View>
  );
};