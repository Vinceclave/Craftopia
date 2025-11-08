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
      <View className="flex-1 justify-center items-center py-8">
        <ActivityIndicator size="small" color="#5A7160" />
        <Text className="text-craftopa-textSecondary text-xs mt-2 font-nunito tracking-wide">
          Loading posts...
        </Text>
      </View>
    );
  }

  if (error) {
    return (
      <View className="flex-1 justify-center items-center py-8 px-5">
        <Text className="text-craftopa-textPrimary text-base font-poppinsBold text-center mb-1 tracking-tight">
          Oops! Something went wrong
        </Text>
        <Text className="text-craftopa-textSecondary text-xs text-center mb-3 font-nunito tracking-wide">
          {error.message}
        </Text>
        <TouchableOpacity 
          onPress={onRefresh} 
          className="bg-craftopa-primary px-4 py-2 rounded-lg active:opacity-70"
          activeOpacity={0.7}
        >
          <Text className="text-white text-xs font-poppinsBold tracking-tight">Try Again</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View className="flex-1 justify-center items-center py-8 px-5">
      <View className="w-12 h-12 bg-craftopa-light/5 rounded-xl items-center justify-center mb-3 border border-craftopa-light/10">
        {hasActiveFilters ? (
          <Filter size={20} color="#5A7160" />
        ) : (
          <FileText size={20} color="#5A7160" />
        )}
      </View>
      <Text className="text-craftopa-textPrimary text-base font-poppinsBold mb-1 text-center tracking-tight">
        {hasActiveFilters ? 'No matching posts' : 'No posts yet'}
      </Text>
      <Text className="text-craftopa-textSecondary text-xs text-center mb-4 font-nunito tracking-wide">
        {hasActiveFilters 
          ? 'Try adjusting your filters'
          : 'Be the first to share!'
        }
      </Text>
      <TouchableOpacity 
        onPress={hasActiveFilters ? onClearFilters : onCreatePost} 
        className="bg-craftopa-primary px-4 py-2 rounded-lg flex-row items-center active:opacity-70"
        activeOpacity={0.7}
      >
        {hasActiveFilters ? (
          <>
            <Filter size={14} color="white" />
            <Text className="text-white text-xs font-poppinsBold ml-1.5 tracking-tight">Clear Filters</Text>
          </>
        ) : (
          <>
            <Plus size={14} color="white" />
            <Text className="text-white text-xs font-poppinsBold ml-1.5 tracking-tight">Create Post</Text>
          </>
        )}
      </TouchableOpacity>
    </View>
  );
};