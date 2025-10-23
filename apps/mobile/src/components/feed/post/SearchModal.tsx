// apps/mobile/src/components/feed/SearchModal.tsx
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
import { X, Search, TrendingUp, Hash, User } from 'lucide-react-native';

interface SearchResult {
  type: 'post' | 'tag' | 'user';
  id: number | string;
  title?: string;
  content?: string;
  username?: string;
  tag?: string;
  count?: number;
}

interface SearchModalProps {
  visible: boolean;
  onClose: () => void;
  onResultPress: (result: SearchResult) => void;
}

export const SearchModal: React.FC<SearchModalProps> = ({
  visible,
  onClose,
  onResultPress,
}) => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [recentSearches, setRecentSearches] = useState<string[]>([
    'recycling',
    'DIY crafts',
    'upcycling',
  ]);
  const [trendingTags] = useState([
    { tag: 'sustainability', count: 234 },
    { tag: 'zerowaste', count: 189 },
    { tag: 'ecofriendly', count: 156 },
    { tag: 'upcycling', count: 142 },
  ]);

  useEffect(() => {
    if (visible) {
      setQuery('');
      setResults([]);
    }
  }, [visible]);

  useEffect(() => {
    if (query.length > 0) {
      handleSearch(query);
    } else {
      setResults([]);
    }
  }, [query]);

  const handleSearch = async (searchQuery: string) => {
    setLoading(true);
    try {
      // TODO: Replace with actual API call
      // Simulated search results
      await new Promise(resolve => setTimeout(resolve, 300));
      
      const mockResults: SearchResult[] = [
        {
          type: 'post',
          id: 1,
          title: `Post about ${searchQuery}`,
          content: 'This is a sample post matching your search...',
        },
        {
          type: 'tag',
          id: searchQuery,
          tag: searchQuery,
          count: 42,
        },
        {
          type: 'user',
          id: 2,
          username: `${searchQuery}_user`,
        },
      ];

      setResults(mockResults);
    } catch (error) {
      console.error('Search failed:', error);
      setResults([]);
    } finally {
      setLoading(false);
    }
  };

  const handleRecentSearch = (search: string) => {
    setQuery(search);
  };

  const handleResultClick = (result: SearchResult) => {
    // Add to recent searches
    if (!recentSearches.includes(query)) {
      setRecentSearches(prev => [query, ...prev.slice(0, 4)]);
    }
    
    onResultPress(result);
    onClose();
  };

  const clearRecentSearches = () => {
    setRecentSearches([]);
  };

  const renderResultItem = (result: SearchResult) => {
    switch (result.type) {
      case 'post':
        return (
          <TouchableOpacity
            key={`post-${result.id}`}
            className="p-3 border-b border-craftopia-light"
            onPress={() => handleResultClick(result)}
            activeOpacity={0.7}
          >
            <View className="flex-row items-start">
              <View className="w-10 h-10 bg-craftopia-primary/10 rounded-full items-center justify-center mr-3">
                <Search size={16} color="#374A36" />
              </View>
              <View className="flex-1">
                <Text className="font-medium text-craftopia-textPrimary mb-1" numberOfLines={1}>
                  {result.title}
                </Text>
                <Text className="text-sm text-craftopia-textSecondary" numberOfLines={2}>
                  {result.content}
                </Text>
              </View>
            </View>
          </TouchableOpacity>
        );

      case 'tag':
        return (
          <TouchableOpacity
            key={`tag-${result.id}`}
            className="p-3 border-b border-craftopia-light"
            onPress={() => handleResultClick(result)}
            activeOpacity={0.7}
          >
            <View className="flex-row items-center">
              <View className="w-10 h-10 bg-craftopia-primary/10 rounded-full items-center justify-center mr-3">
                <Hash size={16} color="#374A36" />
              </View>
              <View className="flex-1">
                <Text className="font-medium text-craftopia-primary">
                  #{result.tag}
                </Text>
                <Text className="text-xs text-craftopia-textSecondary">
                  {result.count} posts
                </Text>
              </View>
            </View>
          </TouchableOpacity>
        );

      case 'user':
        return (
          <TouchableOpacity
            key={`user-${result.id}`}
            className="p-3 border-b border-craftopia-light"
            onPress={() => handleResultClick(result)}
            activeOpacity={0.7}
          >
            <View className="flex-row items-center">
              <View className="w-10 h-10 bg-craftopia-primary/10 rounded-full items-center justify-center mr-3">
                <User size={16} color="#374A36" />
              </View>
              <View className="flex-1">
                <Text className="font-medium text-craftopia-textPrimary">
                  {result.username}
                </Text>
                <Text className="text-xs text-craftopia-textSecondary">User</Text>
              </View>
            </View>
          </TouchableOpacity>
        );

      default:
        return null;
    }
  };

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
                  placeholder="Search posts, tags, users..."
                  placeholderTextColor="#9CA3AF"
                  className="flex-1 ml-2 text-craftopia-textPrimary"
                  autoFocus
                />
                {query.length > 0 && (
                  <TouchableOpacity onPress={() => setQuery('')}>
                    <X size={16} color="#6B7280" />
                  </TouchableOpacity>
                )}
              </View>
            </View>
          </View>

          <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
            {loading ? (
              <View className="flex-1 justify-center items-center py-8">
                <ActivityIndicator size="small" color="#374A36" />
                <Text className="text-craftopia-textSecondary text-sm mt-2">
                  Searching...
                </Text>
              </View>
            ) : query.length === 0 ? (
              <View className="p-4">
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
                        className="flex-row items-center py-2"
                        onPress={() => handleRecentSearch(search)}
                        activeOpacity={0.7}
                      >
                        <Search size={14} color="#6B7280" />
                        <Text className="text-craftopia-textPrimary ml-3 flex-1">
                          {search}
                        </Text>
                        <TouchableOpacity
                          onPress={(e) => {
                            e.stopPropagation();
                            setRecentSearches(prev => prev.filter(s => s !== search));
                          }}
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
                  {trendingTags.map((tag) => (
                    <TouchableOpacity
                      key={tag.tag}
                      className="flex-row items-center justify-between py-3 border-b border-craftopia-light"
                      onPress={() => handleResultClick({ 
                        type: 'tag', 
                        id: tag.tag, 
                        tag: tag.tag, 
                        count: tag.count 
                      })}
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
              </View>
            ) : results.length > 0 ? (
              <View className="bg-craftopia-surface">
                {results.map(renderResultItem)}
              </View>
            ) : (
              <View className="flex-1 justify-center items-center py-8">
                <Text className="text-craftopia-textSecondary text-center">
                  No results found for {`"${query}"`}
                </Text>
                <Text className="text-craftopia-textSecondary text-xs text-center mt-1">
                  Try different keywords
                </Text>
              </View>
            )}
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </Modal>
  );
};