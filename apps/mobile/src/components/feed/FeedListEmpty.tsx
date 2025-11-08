// apps/mobile/src/components/feed/FeedListEmpty.tsx
import React from 'react';
import { View, Text, TouchableOpacity, ActivityIndicator } from 'react-native';
import { Plus } from 'lucide-react-native';

interface FeedListEmptyProps {
  isLoading: boolean;
  error: Error | null;
  hasActiveFilters: boolean;
  onRefresh: () => void;
  onClearFilters: () => void;
  onCreatePost: () => void;
}

export const FeedListEmpty: React.FC<FeedListEmptyProps> = ({
  isLoading,
  error,
  hasActiveFilters,
  onRefresh,
  onClearFilters,
  onCreatePost,
}) => {
  if (isLoading) {
    return (
      <View className="flex-1 justify-center items-center py-8">
        <ActivityIndicator size="small" color="#374A36" />
        <Text className="text-craftopia-textSecondary text-xs mt-2">
          Loading posts...
        </Text>
      </View>
    );
  }

  if (error) {
    return (
      <View className="flex-1 justify-center items-center py-8 px-4">
        <Text className="text-craftopia-textPrimary text-base font-semibold text-center mb-1">
          Oops! Something went wrong
        </Text>
        <Text className="text-craftopia-textSecondary text-xs text-center mb-3">
          {error.message}
        </Text>
        <TouchableOpacity 
          onPress={onRefresh} 
          className="bg-craftopia-primary px-4 py-2 rounded-lg"
          activeOpacity={0.7}
        >
          <Text className="text-white text-xs font-medium">Try Again</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View className="flex-1 justify-center items-center py-8 px-4">
      <Text className="text-xl mb-1">📝</Text>
      <Text className="text-craftopia-textPrimary text-base font-semibold mb-1">
        No posts found
      </Text>
      <Text className="text-craftopia-textSecondary text-center text-xs mb-3">
        {hasActiveFilters 
          ? 'Try adjusting your filters or search terms'
          : 'Be the first to share something!'
        }
      </Text>
      <TouchableOpacity 
        onPress={hasActiveFilters ? onClearFilters : onCreatePost} 
        className="bg-craftopia-primary px-4 py-2 rounded-lg flex-row items-center"
        activeOpacity={0.7}
      >
        {hasActiveFilters ? (
          <Text className="text-white text-xs font-medium">Clear Filters</Text>
        ) : (
          <>
            <Plus size={16} color="white" />
            <Text className="text-white text-xs font-medium ml-1.5">Create Post</Text>
          </>
        )}
      </TouchableOpacity>
    </View>
  );
};