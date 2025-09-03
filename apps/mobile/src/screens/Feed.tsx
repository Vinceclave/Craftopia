// apps/mobile/src/screens/Feed.tsx
import React from 'react';
import { SafeAreaView, Text, View, ScrollView, TouchableOpacity, Image } from 'react-native';
import { 
  Heart, MessageCircle, Share2, Bookmark, MoreHorizontal, Filter, Search,
  Award, Leaf, Users, Clock, ChevronRight, TrendingUp, Star, Eye,
  ThumbsUp, Camera, ArrowUpRight, Zap
} from 'lucide-react-native';

export const FeedScreen = () => {
  const feedPosts = [
    {
      id: 1,
      user: { name: 'Emma Chen', avatar: '👩‍🎨', verified: true, level: 'Eco Expert' },
      timeAgo: '2h ago',
      type: 'project',
      title: 'Upcycled Wine Bottle Planters',
      description: 'Transformed old wine bottles into beautiful hanging planters for my balcony garden! 🌱',
      image: null,
      stats: { likes: 47, comments: 12, shares: 8 },
      tags: ['upcycling', 'gardening', 'sustainable'],
      points: 150,
      category: 'Eco',
      featured: true
    },
    {
      id: 2,
      user: { name: 'Marcus Johnson', avatar: '👨‍🔧', verified: false, level: 'Craft Beginner' },
      timeAgo: '4h ago',
      type: 'achievement',
      title: 'First DIY Bookshelf Complete!',
      description: 'Finally finished my first woodworking project. It\'s not perfect but I\'m proud of it!',
      image: null,
      stats: { likes: 23, comments: 8, shares: 3 },
      tags: ['woodworking', 'furniture', 'beginner'],
      points: 200,
      category: 'Craft',
      featured: false
    },
    {
      id: 3,
      user: { name: 'Sarah Kim', avatar: '👩‍🌾', verified: true, level: 'Green Warrior' },
      timeAgo: '6h ago',
      type: 'tip',
      title: 'Zero Waste Kitchen Hacks',
      description: 'My top 5 tips for reducing kitchen waste. Small changes that make a big difference! ♻️',
      image: null,
      stats: { likes: 89, comments: 25, shares: 34 },
      tags: ['zero-waste', 'kitchen', 'tips'],
      points: 0,
      category: 'Eco',
      featured: false
    },
    {
      id: 4,
      user: { name: 'Alex Rivera', avatar: '🧑‍🎨', verified: false, level: 'Creative Explorer' },
      timeAgo: '8h ago',
      type: 'community',
      title: 'Local Maker Space Opening!',
      description: 'Excited to announce our community maker space is finally open. Come join our weekend workshops!',
      image: null,
      stats: { likes: 156, comments: 42, shares: 67 },
      tags: ['community', 'workshop', 'maker-space'],
      points: 0,
      category: 'Social',
      featured: true
    }
  ];

  const trendingTopics = [
    { name: 'Upcycling Challenge', posts: 234, color: '#7C9885' },
    { name: 'Sustainable Living', posts: 189, color: '#00A896' },
    { name: 'DIY Furniture', posts: 156, color: '#FF6700' }
  ];

  const categoryColors = {
    'Eco': '#7C9885',
    'Craft': '#FF6700',
    'Social': '#00A896'
  };

  const getPostTypeIcon = (type: string) => {
    switch (type) {
      case 'project': return Award;
      case 'achievement': return Star;
      case 'tip': return TrendingUp;
      case 'community': return Users;
      default: return Heart;
    }
  };

  return (
    <SafeAreaView className="flex-1" style={{ backgroundColor: '#F0F0F0' }}>
      {/* Floating Background Shapes */}
      <View className="absolute inset-0 overflow-hidden">
        <View 
          className="absolute -top-20 -right-20 w-40 h-40 rounded-full opacity-3" 
          style={{ backgroundColor: '#7C9885' }} 
        />
        <View 
          className="absolute top-64 -left-16 w-32 h-32 rounded-full opacity-2" 
          style={{ backgroundColor: '#00A896' }} 
        />
      </View>

      <ScrollView 
        className="flex-1" 
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 100 }}
      >
        {/* Header */}
        <View className="px-6 pt-12 pb-6">
          <View className="flex-row items-center justify-between mb-6">
            <View>
              <View className="flex-row items-center mb-2">
                <View 
                  className="w-2 h-2 rounded-full mr-3"
                  style={{ backgroundColor: '#00A896' }}
                />
                <Text className="text-sm font-semibold tracking-wider uppercase" style={{ color: '#333333' }}>
                  Community Feed
                </Text>
              </View>
              <Text className="text-4xl font-black tracking-tight" style={{ color: '#004E98' }}>
                Discover & Share
              </Text>
            </View>
            
            <View className="flex-row space-x-3">
              <TouchableOpacity 
                className="w-12 h-12 rounded-2xl items-center justify-center"
                style={{ 
                  backgroundColor: 'white',
                  shadowColor: '#000',
                  shadowOffset: { width: 0, height: 2 },
                  shadowOpacity: 0.06,
                  shadowRadius: 8,
                  borderWidth: 1,
                  borderColor: 'rgba(0, 0, 0, 0.03)'
                }}
              >
                <Search size={20} color="#004E98" />
              </TouchableOpacity>
              
              <TouchableOpacity 
                className="w-12 h-12 rounded-2xl items-center justify-center"
                style={{ 
                  backgroundColor: 'white',
                  shadowColor: '#000',
                  shadowOffset: { width: 0, height: 2 },
                  shadowOpacity: 0.06,
                  shadowRadius: 8,
                  borderWidth: 1,
                  borderColor: 'rgba(0, 0, 0, 0.03)'
                }}
              >
                <Filter size={20} color="#004E98" />
              </TouchableOpacity>
            </View>
          </View>

          {/* Quick Actions */}
          <View className="flex-row space-x-3 mb-6">
            <TouchableOpacity 
              className="flex-1 rounded-2xl p-4 items-center"
              style={{ 
                backgroundColor: '#FF6700',
                shadowColor: '#FF6700',
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.2,
                shadowRadius: 8
              }}
            >
              <Camera size={20} color="#ffffff" />
              <Text className="text-white font-bold text-sm mt-2">Share Project</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              className="flex-1 rounded-2xl p-4 items-center"
              style={{ 
                backgroundColor: 'white',
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.04,
                shadowRadius: 8,
                borderWidth: 1,
                borderColor: 'rgba(0, 0, 0, 0.03)'
              }}
            >
              <Users size={20} color="#004E98" />
              <Text className="font-bold text-sm mt-2" style={{ color: '#004E98' }}>Find Makers</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Trending Topics */}
        <View className="px-6 mb-6">
          <View className="flex-row items-center mb-4">
            <View 
              className="w-8 h-8 rounded-xl items-center justify-center mr-3"
              style={{ backgroundColor: '#FF670012' }}
            >
              <TrendingUp size={16} color="#FF6700" />
            </View>
            <Text className="text-xl font-black" style={{ color: '#004E98' }}>
              Trending Now
            </Text>
          </View>
          
          <ScrollView horizontal showsHorizontalScrollIndicator={false} className="space-x-3">
            {trendingTopics.map((topic, index) => (
              <TouchableOpacity 
                key={index}
                className="rounded-2xl p-4 mr-3"
                style={{ 
                  backgroundColor: 'white',
                  minWidth: 140,
                  shadowColor: '#000',
                  shadowOffset: { width: 0, height: 2 },
                  shadowOpacity: 0.04,
                  shadowRadius: 8,
                  borderWidth: 1,
                  borderColor: 'rgba(0, 0, 0, 0.03)'
                }}
              >
                <View 
                  className="w-1 h-8 rounded-full mb-3"
                  style={{ backgroundColor: topic.color }}
                />
                <Text className="font-bold mb-1" style={{ color: '#004E98' }}>
                  {topic.name}
                </Text>
                <Text className="text-sm font-medium" style={{ color: '#333333' }}>
                  {topic.posts} posts
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Feed Posts */}
        <View className="px-6">
          <View className="flex-row items-center mb-6">
            <View 
              className="w-8 h-8 rounded-xl items-center justify-center mr-3"
              style={{ backgroundColor: '#00A89612' }}
            >
              <Eye size={16} color="#00A896" />
            </View>
            <Text className="text-xl font-black" style={{ color: '#004E98' }}>
              Latest Updates
            </Text>
          </View>
          
          <View className="space-y-5">
            {feedPosts.map((post) => {
              const PostIcon = getPostTypeIcon(post.type);
              const categoryColor = categoryColors[post.category as keyof typeof categoryColors];
              
              return (
                <TouchableOpacity 
                  key={post.id}
                  className="bg-white rounded-2xl p-5 relative overflow-hidden"
                  style={{ 
                    shadowColor: '#000',
                    shadowOffset: { width: 0, height: 4 },
                    shadowOpacity: 0.04,
                    shadowRadius: 12,
                    borderWidth: 1,
                    borderColor: 'rgba(0, 0, 0, 0.03)'
                  }}
                >
                  {post.featured && (
                    <View 
                      className="absolute top-0 left-0 right-0 h-1"
                      style={{ backgroundColor: categoryColor }}
                    />
                  )}
                  
                  {/* Post Header */}
                  <View className="flex-row items-start justify-between mb-4">
                    <View className="flex-row items-center flex-1">
                      <View 
                        className="w-12 h-12 rounded-2xl items-center justify-center mr-3"
                        style={{ backgroundColor: `${categoryColor}12` }}
                      >
                        <Text className="text-xl">{post.user.avatar}</Text>
                      </View>
                      
                      <View className="flex-1">
                        <View className="flex-row items-center">
                          <Text className="font-bold mr-2" style={{ color: '#004E98' }}>
                            {post.user.name}
                          </Text>
                          {post.user.verified && (
                            <View 
                              className="w-4 h-4 rounded-full items-center justify-center"
                              style={{ backgroundColor: categoryColor }}
                            >
                              <Text className="text-white text-xs">✓</Text>
                            </View>
                          )}
                        </View>
                        <View className="flex-row items-center mt-1">
                          <Text className="text-xs font-medium mr-3" style={{ color: '#333333' }}>
                            {post.user.level}
                          </Text>
                          <Text className="text-xs font-medium" style={{ color: '#333333' }}>
                            {post.timeAgo}
                          </Text>
                        </View>
                      </View>
                    </View>
                    
                    <TouchableOpacity>
                      <MoreHorizontal size={20} color="#333333" />
                    </TouchableOpacity>
                  </View>

                  {/* Post Content */}
                  <View className="mb-4">
                    <View className="flex-row items-start mb-3">
                      <View 
                        className="w-6 h-6 rounded-lg items-center justify-center mr-3 mt-1"
                        style={{ backgroundColor: `${categoryColor}20` }}
                      >
                        <PostIcon size={14} color={categoryColor} />
                      </View>
                      <View className="flex-1">
                        <Text className="text-lg font-bold mb-2" style={{ color: '#004E98' }}>
                          {post.title}
                        </Text>
                        <Text className="text-base font-medium leading-relaxed" style={{ color: '#333333' }}>
                          {post.description}
                        </Text>
                      </View>
                    </View>

                    {/* Tags */}
                    <View className="flex-row flex-wrap mt-3 space-x-2">
                      {post.tags.map((tag, index) => (
                        <View 
                          key={index}
                          className="px-3 py-1 rounded-xl mb-2"
                          style={{ backgroundColor: `${categoryColor}12` }}
                        >
                          <Text className="text-xs font-semibold" style={{ color: categoryColor }}>
                            #{tag}
                          </Text>
                        </View>
                      ))}
                    </View>
                  </View>

                  {/* Post Stats */}
                  <View className="flex-row items-center justify-between pt-4 border-t border-gray-100">
                    <View className="flex-row items-center space-x-4">
                      <TouchableOpacity className="flex-row items-center">
                        <ThumbsUp size={16} color="#333333" />
                        <Text className="text-sm font-medium ml-2" style={{ color: '#333333' }}>
                          {post.stats.likes}
                        </Text>
                      </TouchableOpacity>
                      
                      <TouchableOpacity className="flex-row items-center">
                        <MessageCircle size={16} color="#333333" />
                        <Text className="text-sm font-medium ml-2" style={{ color: '#333333' }}>
                          {post.stats.comments}
                        </Text>
                      </TouchableOpacity>
                      
                      <TouchableOpacity className="flex-row items-center">
                        <Share2 size={16} color="#333333" />
                        <Text className="text-sm font-medium ml-2" style={{ color: '#333333' }}>
                          {post.stats.shares}
                        </Text>
                      </TouchableOpacity>
                    </View>
                    
                    <View className="flex-row items-center space-x-3">
                      {post.points > 0 && (
                        <View 
                          className="flex-row items-center px-3 py-2 rounded-xl"
                          style={{ backgroundColor: '#7C988512' }}
                        >
                          <Award size={12} color="#7C9885" />
                          <Text className="text-xs font-bold ml-1" style={{ color: '#7C9885' }}>
                            +{post.points}
                          </Text>
                        </View>
                      )}
                      
                      <TouchableOpacity>
                        <Bookmark size={16} color="#333333" />
                      </TouchableOpacity>
                    </View>
                  </View>
                </TouchableOpacity>
              );
            })}
          </View>

          {/* Load More */}
          <TouchableOpacity 
            className="mt-6 rounded-2xl p-4 items-center"
            style={{ 
              backgroundColor: 'white',
              shadowColor: '#000',
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.04,
              shadowRadius: 8,
              borderWidth: 1,
              borderColor: 'rgba(0, 0, 0, 0.03)'
            }}
          >
            <View className="flex-row items-center">
              <Text className="font-bold mr-2" style={{ color: '#00A896' }}>
                Load More Posts
              </Text>
              <ArrowUpRight size={16} color="#00A896" />
            </View>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* Floating Action Button */}
      <TouchableOpacity 
        className="absolute bottom-8 right-6 w-14 h-14 rounded-2xl items-center justify-center"
        style={{ 
          backgroundColor: '#FF6700',
          shadowColor: '#FF6700',
          shadowOffset: { width: 0, height: 8 },
          shadowOpacity: 0.3,
          shadowRadius: 16
        }}
      >
        <View className="absolute top-0 right-0 w-6 h-6 rounded-full bg-white opacity-10 transform translate-x-2 -translate-y-2" />
        <Camera size={24} color="#ffffff" />
      </TouchableOpacity>
    </SafeAreaView>
  );
};