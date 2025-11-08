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
    <View className="bg-white border-b border-craftopa-light/10 px-5 py-2">
      <View className="flex-row items-center justify-between">
        <View className="flex-row items-center flex-1 flex-wrap gap-1.5">
          {/* Results Count */}
          <View className="flex-row items-center">
            <Filter size={12} color="#5A7160" />
            <Text className="text-craftopa-textSecondary text-xs font-poppinsBold ml-1 tracking-tight">
              {postsCount}
            </Text>
          </View>

          {/* Filter Chips */}
          {searchQuery && (
            <View className="bg-white rounded-md px-2 py-1 flex-row items-center border border-craftopa-light/10 shadow-sm">
              <Search size={10} color="#5A7160" />
              <Text className="text-craftopa-textPrimary text-xs font-poppinsBold ml-1 tracking-tight">
                {searchQuery}
              </Text>
              <TouchableOpacity 
                onPress={onClearSearch}
                className="ml-1 active:opacity-70"
                activeOpacity={0.7}
              >
                <X size={10} color="#5A7160" />
              </TouchableOpacity>
            </View>
          )}
          
          {selectedCategory !== 'all' && (
            <View className="bg-craftopa-primary/5 rounded-md px-2 py-1 flex-row items-center border border-craftopa-primary/20">
              <Text className="text-craftopa-primary text-xs font-poppinsBold tracking-tight">
                {categories.find(c => c.id === selectedCategory)?.label}
              </Text>
              <TouchableOpacity 
                onPress={onClearCategory}
                className="ml-1 active:opacity-70"
                activeOpacity={0.7}
              >
                <X size={10} color="#5A7160" />
              </TouchableOpacity>
            </View>
          )}
          
          {selectedTag && (
            <View className="bg-craftopa-accent/5 rounded-md px-2 py-1 flex-row items-center border border-craftopa-accent/20">
              <Text className="text-craftopa-accent text-xs font-poppinsBold tracking-tight">
                #{selectedTag}
              </Text>
              <TouchableOpacity 
                onPress={onClearTag}
                className="ml-1 active:opacity-70"
                activeOpacity={0.7}
              >
                <X size={10} color="#D4A96A" />
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
          <Text className="text-craftopa-primary text-xs font-poppinsBold tracking-tight">
            Clear All
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};