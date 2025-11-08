// apps/mobile/src/components/feed/post/SearchModal.tsx - CRAFTOPIA REDESIGN
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
import { X, Search, TrendingUp, Hash, Clock, ArrowRight, Sparkles } from 'lucide-react-native';
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

  const removeRecentSearch = async (searchToRemove: string) => {
    try {
      const updated = recentSearches.filter(s => s !== searchToRemove);
      await AsyncStorage.setItem(RECENT_SEARCHES_KEY, JSON.stringify(updated));
      setRecentSearches(updated);
    } catch (error) {
      console.error('Failed to remove recent search:', error);
    }
  };

  const handleSearch = () => {
    if (!query.trim()) return;
    
    saveRecentSearch(query.trim());
    onSearch(query.trim());
    onClose();
  };

  const handleRecentSearch = (search: string) => {
    onSearch(search);
    onClose();
  };

  const handleTagPress = (tag: string) => {
    if (!tag) return;
    
    saveRecentSearch(`#${tag}`);
    onResultPress({
      type: 'tag',
      id: tag,
      tag,
      count: trendingTags.find(t => t.tag === tag)?.count || 0,
    });
    onClose();
  };

  // Quick search suggestions
  const quickSearches = [
    'recycling tips',
    'DIY crafts',
    'zero waste',
    'upcycling ideas',
  ];

  // Filter matching tags safely
  const getMatchingTags = () => {
    if (!query || !trendingTags || trendingTags.length === 0) return [];
    
    return trendingTags.filter(tag => {
      if (!tag || !tag.tag) return false;
      if (typeof tag.tag !== 'string') return false;
      
      try {
        return tag.tag.toLowerCase().includes(query.toLowerCase());
      } catch (error) {
        console.error('Error filtering tag:', tag, error);
        return false;
      }
    });
  };

  const matchingTags = getMatchingTags();

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <SafeAreaView edges={['left', 'right']} className="flex-1 bg-white">
        <KeyboardAvoidingView
          className="flex-1"
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >
          {/* Header */}
          <View className="px-5 py-4 border-b border-craftopa-light/10">
            <View className="flex-row items-center">
              <View className="flex-1 flex-row items-center bg-craftopa-light/5 rounded-2xl px-4 py-3 border border-craftopa-light/10">
                <Search size={20} color="#5A7160" />
                <TextInput
                  value={query}
                  onChangeText={setQuery}
                  placeholder="Search posts, tags, users..."
                  placeholderTextColor="#9CA3AF"
                  className="flex-1 ml-3 text-craftopa-textPrimary text-base font-nunito tracking-wide"
                  autoFocus
                  returnKeyType="search"
                  onSubmitEditing={handleSearch}
                  style={Platform.OS === 'web' ? { outlineStyle: 'none' } as any : {}}
                />
                {query.length > 0 && (
                  <TouchableOpacity 
                    onPress={() => setQuery('')}
                    className="active:opacity-70"
                  >
                    <X size={20} color="#5A7160" />
                  </TouchableOpacity>
                )}
              </View>
              
              <TouchableOpacity 
                onPress={onClose} 
                className="ml-3 active:opacity-70"
              >
                <Text className="text-craftopa-textSecondary font-poppinsBold tracking-tight">Cancel</Text>
              </TouchableOpacity>
            </View>
          </View>

          <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
            {query.length === 0 ? (
              /* Empty State */
              <View className="p-5">
                {/* Quick Searches */}
                <View className="mb-8">
                  <Text className="text-craftopa-textPrimary font-poppinsBold text-lg mb-4 tracking-tight">
                    Quick Searches
                  </Text>
                  <View className="flex-row flex-wrap gap-3">
                    {quickSearches.map((search, index) => (
                      <TouchableOpacity
                        key={`quick-search-${index}`}
                        className="bg-white px-4 py-3 rounded-2xl border border-craftopa-light/10 shadow-sm active:opacity-70"
                        onPress={() => handleRecentSearch(search)}
                        activeOpacity={0.7}
                      >
                        <Text className="text-craftopa-textPrimary font-nunito tracking-wide">
                          {search}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>

                {/* Recent Searches */}
                {recentSearches.length > 0 && (
                  <View className="mb-8">
                    <View className="flex-row justify-between items-center mb-4">
                      <Text className="text-craftopa-textPrimary font-poppinsBold text-lg tracking-tight">
                        Recent
                      </Text>
                      <TouchableOpacity 
                        onPress={clearRecentSearches}
                        className="active:opacity-70"
                      >
                        <Text className="text-craftopa-primary text-sm font-poppinsBold tracking-tight">Clear all</Text>
                      </TouchableOpacity>
                    </View>
                    {recentSearches.map((search, index) => (
                      <TouchableOpacity
                        key={`recent-search-${index}`}
                        className="flex-row items-center justify-between py-3 border-b border-craftopa-light/10 active:opacity-70"
                        onPress={() => handleRecentSearch(search)}
                        activeOpacity={0.7}
                      >
                        <View className="flex-row items-center flex-1">
                          <Clock size={18} color="#5A7160" />
                          <Text className="text-craftopa-textPrimary ml-3 flex-1 text-base font-nunito tracking-wide">
                            {search}
                          </Text>
                        </View>
                        <TouchableOpacity
                          onPress={(e) => {
                            e.stopPropagation();
                            removeRecentSearch(search);
                          }}
                          className="p-2 active:opacity-70"
                        >
                          <X size={16} color="#5A7160" />
                        </TouchableOpacity>
                      </TouchableOpacity>
                    ))}
                  </View>
                )}

                {/* Trending Tags */}
                <View>
                  <View className="flex-row items-center mb-4">
                    <TrendingUp size={20} color="#D4A96A" />
                    <Text className="text-craftopa-textPrimary font-poppinsBold text-lg ml-2 tracking-tight">
                      Trending Tags
                    </Text>
                  </View>
                  
                  {tagsLoading ? (
                    <View className="py-8 items-center">
                      <ActivityIndicator size="small" color="#5A7160" />
                    </View>
                  ) : trendingTags && trendingTags.length > 0 ? (
                    <View className="space-y-3">
                      {trendingTags.slice(0, 5).map((tag, index) => {
                        if (!tag || !tag.tag) return null;
                        
                        return (
                          <TouchableOpacity
                            key={`trending-tag-${tag.tag}-${index}`}
                            className="flex-row items-center justify-between p-4 bg-white rounded-2xl border border-craftopa-light/10 shadow-sm active:opacity-70"
                            onPress={() => handleTagPress(tag.tag)}
                            activeOpacity={0.7}
                          >
                            <View className="flex-row items-center">
                              <View className="w-12 h-12 bg-craftopa-primary/10 rounded-xl items-center justify-center mr-4 border border-craftopa-light/10">
                                <Hash size={20} color="#5A7160" />
                              </View>
                              <View>
                                <Text className="font-poppinsBold text-craftopa-textPrimary text-base tracking-tight">
                                  #{tag.tag}
                                </Text>
                                <Text className="text-craftopa-textSecondary text-sm mt-1 font-nunito tracking-wide">
                                  {tag.count} posts
                                </Text>
                              </View>
                            </View>
                            <ArrowRight size={18} color="#5A7160" />
                          </TouchableOpacity>
                        );
                      })}
                    </View>
                  ) : (
                    <View className="py-8 items-center">
                      <Hash size={32} color="#E5E7EB" />
                      <Text className="text-craftopa-textSecondary mt-2 text-center font-nunito tracking-wide">
                        No trending tags available
                      </Text>
                    </View>
                  )}
                </View>
              </View>
            ) : (
              /* Search Results State */
              <View className="p-5">
                <Text className="text-craftopa-textSecondary text-base mb-4 font-nunito tracking-wide">
                  Search for "{query}"
                </Text>
                
                {/* Matching Tags */}
                {matchingTags.length > 0 && (
                  <View className="mb-6">
                    <Text className="text-craftopa-textPrimary font-poppinsBold text-lg mb-3 tracking-tight">
                      Tags
                    </Text>
                    <View className="space-y-2">
                      {matchingTags.map((tag, index) => (
                        <TouchableOpacity
                          key={`matching-tag-${tag.tag}-${index}`}
                          className="flex-row items-center justify-between p-3 bg-white rounded-xl border border-craftopa-light/10 shadow-sm active:opacity-70"
                          onPress={() => handleTagPress(tag.tag)}
                          activeOpacity={0.7}
                        >
                          <View className="flex-row items-center">
                            <Hash size={18} color="#5A7160" />
                            <Text className="font-poppinsBold text-craftopa-textPrimary ml-3 tracking-tight">
                              {tag.tag}
                            </Text>
                          </View>
                          <Text className="text-craftopa-textSecondary text-sm font-nunito tracking-wide">
                            {tag.count} posts
                          </Text>
                        </TouchableOpacity>
                      ))}
                    </View>
                  </View>
                )}

                {/* Search Prompt */}
                <TouchableOpacity
                  onPress={handleSearch}
                  className="flex-row items-center justify-between p-4 bg-craftopa-primary/5 rounded-2xl border border-craftopa-primary/20 active:opacity-70"
                  activeOpacity={0.7}
                >
                  <View>
                    <Text className="font-poppinsBold text-craftopa-primary text-base tracking-tight">
                      Search for "{query}"
                    </Text>
                    <Text className="text-craftopa-textSecondary text-sm mt-1 font-nunito tracking-wide">
                      Find posts matching your search
                    </Text>
                  </View>
                  <ArrowRight size={20} color="#5A7160" />
                </TouchableOpacity>
              </View>
            )}
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </Modal>
  );
};