import React from 'react';
import { View, Text, TouchableOpacity, ActivityIndicator } from 'react-native';
import { Plus, FileText, Filter } from 'lucide-react-native';

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
      <View className="flex-1 justify-center items-center py-6">
        <ActivityIndicator size="small" color="#3B6E4D" />
        <Text className="text-craftopia-textSecondary text-xs mt-2 font-nunito">
          Loading posts...
        </Text>
      </View>
    );
  }

  if (error) {
    return (
      <View className="flex-1 justify-center items-center py-6 px-4">
        <Text className="text-craftopia-textPrimary text-base font-poppinsBold text-center mb-1">
          Oops! Something went wrong
        </Text>
        <Text className="text-craftopia-textSecondary text-xs text-center mb-3 font-nunito">
          {error.message}
        </Text>
        <TouchableOpacity 
          onPress={onRefresh} 
          className="bg-craftopia-primary px-4 py-2 rounded-lg active:opacity-70"
          activeOpacity={0.7}
        >
          <Text className="text-white text-xs font-poppinsBold">Try Again</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View className="flex-1 justify-center items-center py-6 px-4">
      <View className="w-12 h-12 bg-craftopia-light rounded-lg items-center justify-center mb-3 border border-craftopia-light">
        {hasActiveFilters ? (
          <Filter size={20} color="#3B6E4D" />
        ) : (
          <FileText size={20} color="#3B6E4D" />
        )}
      </View>
      <Text className="text-craftopia-textPrimary text-base font-poppinsBold mb-1 text-center">
        {hasActiveFilters ? 'No matching posts' : 'No posts yet'}
      </Text>
      <Text className="text-craftopia-textSecondary text-xs text-center mb-3 font-nunito">
        {hasActiveFilters 
          ? 'Try adjusting your filters'
          : 'Be the first to share!'
        }
      </Text>
      <TouchableOpacity 
        onPress={hasActiveFilters ? onClearFilters : onCreatePost} 
        className="bg-craftopia-primary px-4 py-2 rounded-lg flex-row items-center active:opacity-70"
        activeOpacity={0.7}
      >
        {hasActiveFilters ? (
          <>
            <Filter size={14} color="#FFFFFF" />
            <Text className="text-white text-xs font-poppinsBold ml-1.5">Clear Filters</Text>
          </>
        ) : (
          <>
            <Plus size={14} color="#FFFFFF" />
            <Text className="text-white text-xs font-poppinsBold ml-1.5">Create Post</Text>
          </>
        )}
      </TouchableOpacity>
    </View>
  );
};