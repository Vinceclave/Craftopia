// apps/mobile/src/components/feed/post/SearchModal.tsx - CRAFTOPIA REFINED
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
      <SafeAreaView edges={['left', 'right']} className="flex-1 bg-craftopia-surface">
        <KeyboardAvoidingView
          className="flex-1"
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >
          {/* Header */}
          <View className="px-4 py-3 border-b border-craftopia-light">
            <View className="flex-row items-center">
              <View className="flex-1 flex-row items-center bg-craftopia-light rounded-xl px-3 py-2.5 border border-craftopia-light">
                <Search size={18} color="#3B6E4D" />
                <TextInput
                  value={query}
                  onChangeText={setQuery}
                  placeholder="Search posts, tags, users..."
                  placeholderTextColor="#5F6F64"
                  className="flex-1 ml-2 text-craftopia-textPrimary text-sm font-nunito"
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
                    <X size={18} color="#3B6E4D" />
                  </TouchableOpacity>
                )}
              </View>
              
              <TouchableOpacity 
                onPress={onClose} 
                className="ml-2 active:opacity-70"
              >
                <Text className="text-craftopia-textSecondary font-poppinsBold">Cancel</Text>
              </TouchableOpacity>
            </View>
          </View>

          <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
            {query.length === 0 ? (
              /* Empty State */
              <View className="p-4">
                {/* Quick Searches */}
                <View className="mb-6">
                  <Text className="text-craftopia-textPrimary font-poppinsBold text-base mb-3">
                    Quick Searches
                  </Text>
                  <View className="flex-row flex-wrap gap-2">
                    {quickSearches.map((search, index) => (
                      <TouchableOpacity
                        key={`quick-search-${index}`}
                        className="bg-craftopia-surface px-3 py-2 rounded-lg border border-craftopia-light active:opacity-70"
                        onPress={() => handleRecentSearch(search)}
                        activeOpacity={0.7}
                      >
                        <Text className="text-craftopia-textPrimary font-nunito">
                          {search}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>

                {/* Recent Searches */}
                {recentSearches.length > 0 && (
                  <View className="mb-6">
                    <View className="flex-row justify-between items-center mb-3">
                      <Text className="text-craftopia-textPrimary font-poppinsBold text-base">
                        Recent
                      </Text>
                      <TouchableOpacity 
                        onPress={clearRecentSearches}
                        className="active:opacity-70"
                      >
                        <Text className="text-craftopia-primary text-xs font-poppinsBold">Clear all</Text>
                      </TouchableOpacity>
                    </View>
                    {recentSearches.map((search, index) => (
                      <TouchableOpacity
                        key={`recent-search-${index}`}
                        className="flex-row items-center justify-between py-2 border-b border-craftopia-light active:opacity-70"
                        onPress={() => handleRecentSearch(search)}
                        activeOpacity={0.7}
                      >
                        <View className="flex-row items-center flex-1">
                          <Clock size={16} color="#3B6E4D" />
                          <Text className="text-craftopia-textPrimary ml-2 flex-1 text-sm font-nunito">
                            {search}
                          </Text>
                        </View>
                        <TouchableOpacity
                          onPress={(e) => {
                            e.stopPropagation();
                            removeRecentSearch(search);
                          }}
                          className="p-1 active:opacity-70"
                        >
                          <X size={14} color="#3B6E4D" />
                        </TouchableOpacity>
                      </TouchableOpacity>
                    ))}
                  </View>
                )}

                {/* Trending Tags */}
                <View>
                  <View className="flex-row items-center mb-3">
                    <TrendingUp size={18} color="#E3A84F" />
                    <Text className="text-craftopia-textPrimary font-poppinsBold text-base ml-1.5">
                      Trending Tags
                    </Text>
                  </View>
                  
                  {tagsLoading ? (
                    <View className="py-6 items-center">
                      <ActivityIndicator size="small" color="#3B6E4D" />
                    </View>
                  ) : trendingTags && trendingTags.length > 0 ? (
                    <View className="space-y-2">
                      {trendingTags.slice(0, 5).map((tag, index) => {
                        if (!tag || !tag.tag) return null;
                        
                        return (
                          <TouchableOpacity
                            key={`trending-tag-${tag.tag}-${index}`}
                            className="flex-row items-center justify-between p-3 bg-craftopia-surface rounded-lg border border-craftopia-light active:opacity-70"
                            onPress={() => handleTagPress(tag.tag)}
                            activeOpacity={0.7}
                          >
                            <View className="flex-row items-center">
                              <View className="w-10 h-10 bg-craftopia-primary/10 rounded-lg items-center justify-center mr-3 border border-craftopia-light">
                                <Hash size={18} color="#3B6E4D" />
                              </View>
                              <View>
                                <Text className="font-poppinsBold text-craftopia-textPrimary text-sm">
                                  #{tag.tag}
                                </Text>
                                <Text className="text-craftopia-textSecondary text-xs mt-0.5 font-nunito">
                                  {tag.count} posts
                                </Text>
                              </View>
                            </View>
                            <ArrowRight size={16} color="#3B6E4D" />
                          </TouchableOpacity>
                        );
                      })}
                    </View>
                  ) : (
                    <View className="py-6 items-center">
                      <Hash size={24} color="#F5F7F2" />
                      <Text className="text-craftopia-textSecondary mt-1 text-center font-nunito">
                        No trending tags available
                      </Text>
                    </View>
                  )}
                </View>
              </View>
            ) : (
              /* Search Results State */
              <View className="p-4">
                <Text className="text-craftopia-textSecondary text-sm mb-3 font-nunito">
                  Search for "{query}"
                </Text>
                
                {/* Matching Tags */}
                {matchingTags.length > 0 && (
                  <View className="mb-4">
                    <Text className="text-craftopia-textPrimary font-poppinsBold text-base mb-2">
                      Tags
                    </Text>
                    <View className="space-y-1.5">
                      {matchingTags.map((tag, index) => (
                        <TouchableOpacity
                          key={`matching-tag-${tag.tag}-${index}`}
                          className="flex-row items-center justify-between p-2.5 bg-craftopia-surface rounded-lg border border-craftopia-light active:opacity-70"
                          onPress={() => handleTagPress(tag.tag)}
                          activeOpacity={0.7}
                        >
                          <View className="flex-row items-center">
                            <Hash size={16} color="#3B6E4D" />
                            <Text className="font-poppinsBold text-craftopia-textPrimary ml-2">
                              {tag.tag}
                            </Text>
                          </View>
                          <Text className="text-craftopia-textSecondary text-xs font-nunito">
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
                  className="flex-row items-center justify-between p-3 bg-craftopia-primary/5 rounded-lg border border-craftopia-primary/20 active:opacity-70"
                  activeOpacity={0.7}
                >
                  <View>
                    <Text className="font-poppinsBold text-craftopia-primary text-sm">
                      Search for "{query}"
                    </Text>
                    <Text className="text-craftopia-textSecondary text-xs mt-0.5 font-nunito">
                      Find posts matching your search
                    </Text>
                  </View>
                  <ArrowRight size={18} color="#3B6E4D" />
                </TouchableOpacity>
              </View>
            )}
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </Modal>
  );
};