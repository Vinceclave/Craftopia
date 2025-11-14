import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Search, X, Filter } from 'lucide-react-native';

interface ActiveFiltersProps {
  searchQuery: string;
  selectedCategory: string;
  selectedTag: string | null;
  postsCount: number;
  onClearAll: () => void;
  onClearSearch: () => void;
  onClearCategory: () => void;
  onClearTag: () => void;
  categories: Array<{ id: string; label: string }>;
}

export const ActiveFilters: React.FC<ActiveFiltersProps> = ({
  searchQuery,
  selectedCategory,
  selectedTag,
  postsCount,
  onClearAll,
  onClearSearch,
  onClearCategory,
  onClearTag,
  categories,
}) => {
  const hasFilters = searchQuery || selectedCategory !== 'all' || selectedTag;

  if (!hasFilters) return null;

  return (
    <View className="bg-craftopia-surface border-b border-craftopia-light px-4 py-2">
      <View className="flex-row items-center justify-between">
        <View className="flex-row items-center flex-1 flex-wrap gap-1.5">
          {/* Results Count */}
          <View className="flex-row items-center">
            <Filter size={12} color="#3B6E4D" />
            <Text className="text-craftopia-textSecondary text-xs font-poppinsBold ml-1">
              {postsCount}
            </Text>
          </View>

          {/* Filter Chips */}
          {searchQuery && (
            <View className="bg-craftopia-surface rounded-md px-2 py-1 flex-row items-center border border-craftopia-light">
              <Search size={10} color="#3B6E4D" />
              <Text className="text-craftopia-textPrimary text-xs font-poppinsBold ml-1">
                {searchQuery}
              </Text>
              <TouchableOpacity 
                onPress={onClearSearch}
                className="ml-1 active:opacity-70"
                activeOpacity={0.7}
              >
                <X size={10} color="#3B6E4D" />
              </TouchableOpacity>
            </View>
          )}
          
          {selectedCategory !== 'all' && (
            <View className="bg-craftopia-primary/5 rounded-md px-2 py-1 flex-row items-center border border-craftopia-primary/20">
              <Text className="text-craftopia-primary text-xs font-poppinsBold">
                {categories.find(c => c.id === selectedCategory)?.label}
              </Text>
              <TouchableOpacity 
                onPress={onClearCategory}
                className="ml-1 active:opacity-70"
                activeOpacity={0.7}
              >
                <X size={10} color="#3B6E4D" />
              </TouchableOpacity>
            </View>
          )}
          
          {selectedTag && (
            <View className="bg-craftopia-warning/5 rounded-md px-2 py-1 flex-row items-center border border-craftopia-warning/20">
              <Text className="text-craftopia-warning text-xs font-poppinsBold">
                #{selectedTag}
              </Text>
              <TouchableOpacity 
                onPress={onClearTag}
                className="ml-1 active:opacity-70"
                activeOpacity={0.7}
              >
                <X size={10} color="#E3A84F" />
              </TouchableOpacity>
            </View>
          )}
        </View>

        {/* Clear All */}
        <TouchableOpacity 
          onPress={onClearAll}
          className="ml-2 active:opacity-70"
          activeOpacity={0.7}
        >
          <Text className="text-craftopia-primary text-xs font-poppinsBold">
            Clear All
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};