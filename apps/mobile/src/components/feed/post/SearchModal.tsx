// apps/mobile/src/components/feed/post/SearchModal.tsx - WITH REAL SEARCH
import React, { useState, useEffect } from 'react';
import {
  Modal,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { X, Search, TrendingUp, Hash, ArrowUpRight } from 'lucide-react-native';
import { useTrendingTags } from '~/hooks/queries/usePosts';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface SearchResult {
  type: 'post' | 'tag' | 'user' | 'query';
  id: number | string;
  title?: string;
  content?: string;
  username?: string;
  tag?: string;
  count?: number;
  query?: string;
}

interface SearchModalProps {
  visible: boolean;
  onClose: () => void;
  onResultPress: (result: SearchResult) => void;
  onSearch: (query: string) => void;
}

const RECENT_SEARCHES_KEY = '@recent_searches';
const MAX_RECENT_SEARCHES = 5;

export const SearchModal: React.FC<SearchModalProps> = ({
  visible,
  onClose,
  onResultPress,
  onSearch,
}) => {
  const [query, setQuery] = useState('');
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const { data: trendingTags = [], isLoading: tagsLoading } = useTrendingTags();

  // Load recent searches
  useEffect(() => {
    if (visible) {
      loadRecentSearches();
      setQuery('');
    }
  }, [visible]);

  const loadRecentSearches = async () => {
    try {
      const stored = await AsyncStorage.getItem(RECENT_SEARCHES_KEY);
      if (stored) {
        setRecentSearches(JSON.parse(stored));
      }
    } catch (error) {
      console.error('Failed to load recent searches:', error);
    }
  };

  const saveRecentSearch = async (searchQuery: string) => {
    try {
      const trimmed = searchQuery.trim();
      if (!trimmed) return;

      const updated = [
        trimmed,
        ...recentSearches.filter(s => s !== trimmed)
      ].slice(0, MAX_RECENT_SEARCHES);

      await AsyncStorage.setItem(RECENT_SEARCHES_KEY, JSON.stringify(updated));
      setRecentSearches(updated);
    } catch (error) {
      console.error('Failed to save recent search:', error);
    }
  };

  const clearRecentSearches = async () => {
    try {
      await AsyncStorage.removeItem(RECENT_SEARCHES_KEY);
      setRecentSearches([]);
    } catch (error) {
      console.error('Failed to clear recent searches:', error);
    }
  };

  const handleSearch = () => {
    if (!query.trim()) return;
    
    saveRecentSearch(query.trim());
    onSearch(query.trim());
    onClose();
  };

  const handleRecentSearch = (search: string) => {
    setQuery(search);
    onSearch(search);
    onClose();
  };

  const handleTagPress = (tag: string) => {
    saveRecentSearch(`#${tag}`);
    onResultPress({
      type: 'tag',
      id: tag,
      tag,
      count: trendingTags.find(t => t.tag === tag)?.count || 0,
    });
    onClose();
  };

  const handleQuickSearch = (searchTerm: string) => {
    setQuery(searchTerm);
    saveRecentSearch(searchTerm);
    onSearch(searchTerm);
    onClose();
  };

  const removeRecentSearch = async (search: string) => {
    try {
      const updated = recentSearches.filter(s => s !== search);
      await AsyncStorage.setItem(RECENT_SEARCHES_KEY, JSON.stringify(updated));
      setRecentSearches(updated);
    } catch (error) {
      console.error('Failed to remove recent search:', error);
    }
  };

  // Quick search suggestions
  const quickSearches = [
    'recycling tips',
    'DIY crafts',
    'zero waste',
    'upcycling ideas',
  ];

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <SafeAreaView edges={['left', 'right']} className="flex-1 bg-craftopia-light">
        <KeyboardAvoidingView
          className="flex-1"
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >
          {/* Header */}
          <View className="bg-craftopia-surface px-4 py-3 border-b border-craftopia-light">
            <View className="flex-row items-center">
              <TouchableOpacity onPress={onClose} className="mr-3">
                <X size={20} color="#1A1A1A" />
              </TouchableOpacity>
              
              <View className="flex-1 flex-row items-center bg-craftopia-light rounded-full px-3 py-2">
                <Search size={16} color="#6B7280" />
                <TextInput
                  value={query}
                  onChangeText={setQuery}
                  placeholder="Search posts, tags..."
                  placeholderTextColor="#9CA3AF"
                  className="flex-1 ml-2 text-craftopia-textPrimary"
                  autoFocus
                  returnKeyType="search"
                  onSubmitEditing={handleSearch}
                />
                {query.length > 0 && (
                  <TouchableOpacity onPress={() => setQuery('')}>
                    <X size={16} color="#6B7280" />
                  </TouchableOpacity>
                )}
              </View>

              {query.trim() && (
                <TouchableOpacity 
                  onPress={handleSearch}
                  className="ml-2"
                >
                  <Text className="text-craftopia-primary font-medium">Search</Text>
                </TouchableOpacity>
              )}
            </View>
          </View>

          <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
            {query.length === 0 ? (
              <View className="p-4">
                {/* Quick Searches */}
                <View className="mb-6">
                  <Text className="text-sm font-semibold text-craftopia-textPrimary mb-3">
                    Quick Searches
                  </Text>
                  <View className="flex-row flex-wrap gap-2">
                    {quickSearches.map((search) => (
                      <TouchableOpacity
                        key={search}
                        className="bg-craftopia-primary/10 px-3 py-2 rounded-full flex-row items-center"
                        onPress={() => handleQuickSearch(search)}
                        activeOpacity={0.7}
                      >
                        <Text className="text-craftopia-primary text-sm font-medium">
                          {search}
                        </Text>
                        <ArrowUpRight size={12} color="#374A36" className="ml-1" />
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>

                {/* Recent Searches */}
                {recentSearches.length > 0 && (
                  <View className="mb-6">
                    <View className="flex-row justify-between items-center mb-3">
                      <Text className="text-sm font-semibold text-craftopia-textPrimary">
                        Recent Searches
                      </Text>
                      <TouchableOpacity onPress={clearRecentSearches}>
                        <Text className="text-xs text-craftopia-primary">Clear All</Text>
                      </TouchableOpacity>
                    </View>
                    {recentSearches.map((search, index) => (
                      <TouchableOpacity
                        key={index}
                        className="flex-row items-center justify-between py-2.5"
                        onPress={() => handleRecentSearch(search)}
                        activeOpacity={0.7}
                      >
                        <View className="flex-row items-center flex-1">
                          <Search size={14} color="#6B7280" />
                          <Text className="text-craftopia-textPrimary ml-3 flex-1">
                            {search}
                          </Text>
                        </View>
                        <TouchableOpacity
                          onPress={(e) => {
                            e.stopPropagation();
                            removeRecentSearch(search);
                          }}
                          className="p-1"
                        >
                          <X size={14} color="#6B7280" />
                        </TouchableOpacity>
                      </TouchableOpacity>
                    ))}
                  </View>
                )}

                {/* Trending Tags */}
                <View>
                  <View className="flex-row items-center mb-3">
                    <TrendingUp size={16} color="#374A36" />
                    <Text className="text-sm font-semibold text-craftopia-textPrimary ml-2">
                      Trending Tags
                    </Text>
                  </View>
                  
                  {tagsLoading ? (
                    <View className="py-4 items-center">
                      <ActivityIndicator size="small" color="#374A36" />
                    </View>
                  ) : trendingTags.length > 0 ? (
                    <View>
                      {trendingTags.map((tag) => (
                        <TouchableOpacity
                          key={tag.tag}
                          className="flex-row items-center justify-between py-3 border-b border-craftopia-light"
                          onPress={() => handleTagPress(tag.tag)}
                          activeOpacity={0.7}
                        >
                          <View className="flex-row items-center">
                            <View className="w-10 h-10 bg-craftopia-primary/10 rounded-full items-center justify-center mr-3">
                              <Hash size={16} color="#374A36" />
                            </View>
                            <View>
                              <Text className="font-medium text-craftopia-primary">
                                #{tag.tag}
                              </Text>
                              <Text className="text-xs text-craftopia-textSecondary">
                                {tag.count} posts
                              </Text>
                            </View>
                          </View>
                          <TrendingUp size={14} color="#10B981" />
                        </TouchableOpacity>
                      ))}
                    </View>
                  ) : (
                    <Text className="text-craftopia-textSecondary text-sm py-4 text-center">
                      No trending tags available
                    </Text>
                  )}
                </View>
              </View>
            ) : (
              /* Search Results */
              <View className="p-4">
                <Text className="text-craftopia-textSecondary text-sm mb-3">
                  Press "Search" to find posts matching "{query}"
                </Text>
                
                {/* Matching Tags */}
                {trendingTags
                  .filter(tag => tag.tag.toLowerCase().includes(query.toLowerCase()))
                  .length > 0 && (
                  <View className="mb-4">
                    <Text className="text-sm font-semibold text-craftopia-textPrimary mb-2">
                      Matching Tags
                    </Text>
                    {trendingTags
                      .filter(tag => tag.tag.toLowerCase().includes(query.toLowerCase()))
                      .map((tag) => (
                        <TouchableOpacity
                          key={tag.tag}
                          className="flex-row items-center py-2.5 bg-craftopia-light rounded-lg mb-2 px-3"
                          onPress={() => handleTagPress(tag.tag)}
                        >
                          <Hash size={16} color="#374A36" />
                          <Text className="font-medium text-craftopia-primary ml-2">
                            {tag.tag}
                          </Text>
                          <Text className="text-xs text-craftopia-textSecondary ml-auto">
                            {tag.count} posts
                          </Text>
                        </TouchableOpacity>
                      ))
                    }
                  </View>
                )}
              </View>
            )}
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </Modal>
  );
};