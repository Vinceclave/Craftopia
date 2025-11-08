// apps/mobile/src/components/feed/ActiveFilters.tsx - ULTRA MINIMAL
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
    <View className="bg-white border-b border-gray-100 px-4 py-3">
      <View className="flex-row items-center justify-between">
        <View className="flex-row items-center flex-1 flex-wrap gap-2">
          {/* Results Count */}
          <View className="flex-row items-center">
            <Filter size={14} color="#6B7280" />
            <Text className="text-gray-600 text-sm font-medium ml-1">
              {postsCount}
            </Text>
          </View>

          {/* Filter Chips */}
          {searchQuery && (
            <View className="bg-gray-50 rounded-lg px-2 py-1 flex-row items-center border border-gray-200">
              <Search size={12} color="#6B7280" />
              <Text className="text-gray-700 text-xs font-medium ml-1">
                {searchQuery}
              </Text>
              <TouchableOpacity 
                onPress={onClearSearch}
                className="ml-1"
              >
                <X size={12} color="#6B7280" />
              </TouchableOpacity>
            </View>
          )}
          
          {selectedCategory !== 'all' && (
            <View className="bg-blue-50 rounded-lg px-2 py-1 flex-row items-center border border-blue-200">
              <Text className="text-blue-700 text-xs font-medium">
                {categories.find(c => c.id === selectedCategory)?.label}
              </Text>
              <TouchableOpacity 
                onPress={onClearCategory}
                className="ml-1"
              >
                <X size={12} color="#1D4ED8" />
              </TouchableOpacity>
            </View>
          )}
          
          {selectedTag && (
            <View className="bg-green-50 rounded-lg px-2 py-1 flex-row items-center border border-green-200">
              <Text className="text-green-700 text-xs font-medium">
                #{selectedTag}
              </Text>
              <TouchableOpacity 
                onPress={onClearTag}
                className="ml-1"
              >
                <X size={12} color="#047857" />
              </TouchableOpacity>
            </View>
          )}
        </View>

        {/* Clear All */}
        <TouchableOpacity 
          onPress={onClearAll}
          className="ml-2"
        >
          <Text className="text-blue-500 text-xs font-medium">
            Clear
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};