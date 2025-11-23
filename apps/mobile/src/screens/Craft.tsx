import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  FlatList,
  ScrollView,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import {
  Scan,
  Sparkles,
  History,
  TrendingUp,
  Award,
  Target,
  Trash2,
} from 'lucide-react-native';
import { CraftStackParamList } from '~/navigations/types';
import { useNavigation } from '@react-navigation/native';

type SavedItem = {
  id: string;
  uri?: string;
  manualText?: string;
  createdAt: number;
};

const STORAGE_KEY = '@craftopia_saved_items_v1';

export const CraftScreen: React.FC = () => {
  const navigation = useNavigation<NativeStackNavigationProp<CraftStackParamList>>();
  const [recentItems, setRecentItems] = useState<SavedItem[]>([]);

  useEffect(() => {
    loadSavedItems();
  }, []);

  const loadSavedItems = async () => {
    try {
      const raw = await AsyncStorage.getItem(STORAGE_KEY);
      setRecentItems(raw ? JSON.parse(raw) : []);
    } catch (err) {
      console.warn('Failed to load saved items', err);
    }
  };

  const deleteItem = async (id: string) => {
    Alert.alert('Delete Item', 'Delete this saved scan?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          const filtered = recentItems.filter((i) => i.id !== id);
          await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
          setRecentItems(filtered);
        },
      },
    ]);
  };

  const handleStartScan = () => {
    navigation.navigate('CraftScan');
  };

  const renderSavedItem = ({ item }: { item: SavedItem }) => (
    <TouchableOpacity
      className="w-32 mr-3 rounded-xl overflow-hidden bg-craftopia-surface border border-craftopia-light relative"
      onPress={() => {
        navigation.navigate('CraftDetails', {
          craftTitle: item.manualText || 'Your Craft',
          materials: item.manualText ? item.manualText.split(',').map((t) => t.trim()) : [],
          steps: ['Step 1: Start crafting', 'Step 2: Finish crafting'],
        });
      }}
      activeOpacity={0.7}
    >
      {item.uri ? (
        <Image source={{ uri: item.uri }} className="w-full h-24" resizeMode="cover" />
      ) : (
        <View className="w-full h-24 bg-craftopia-light items-center justify-center">
          <Sparkles size={24} color="#E6B655" />
        </View>
      )}
      
      <View className="p-2">
        <Text className="text-xs text-craftopia-textPrimary font-semibold font-nunito" numberOfLines={2}>
          {item.manualText || new Date(item.createdAt).toLocaleDateString()}
        </Text>
        <Text className="text-xs text-craftopia-textSecondary mt-1 font-nunito">
          {new Date(item.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
        </Text>
      </View>

      {/* Delete Button */}
      <TouchableOpacity
        onPress={() => deleteItem(item.id)}
        className="absolute top-2 right-2 w-6 h-6 rounded-full bg-craftopia-error/90 items-center justify-center"
        activeOpacity={0.7}
      >
        <Trash2 size={12} color="#FFFFFF" />
      </TouchableOpacity>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView edges={['left', 'right', 'bottom']} className="flex-1 bg-craftopia-background">
      {/* Header */}
      <View className="px-4 pt-4 pb-4 bg-craftopia-surface border-b border-craftopia-light">
        <View className="flex-row justify-between items-center mb-3">
          <View className="flex-1">
            <Text className="text-xs text-craftopia-textSecondary uppercase tracking-wider mb-1 font-nunito">
              Craft Hub
            </Text>
            <Text className="text-xl font-bold text-craftopia-textPrimary font-poppinsBold">
              Create & Upcycle
            </Text>
          </View>

          {/* History Button */}
          {recentItems.length > 0 && (
            <TouchableOpacity
              className="flex-row items-center bg-craftopia-light rounded-full px-3 py-2"
              activeOpacity={0.7}
            >
              <History size={14} color="#3B6E4D" />
              <Text className="text-xs font-semibold text-craftopia-primary ml-1 font-nunito">
                {recentItems.length}
              </Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Info Card */}
        <View className="bg-craftopia-light rounded-xl px-3 py-3 border border-craftopia-accent/20">
          <View className="flex-row items-center">
            <View className="w-8 h-8 rounded-full bg-craftopia-accent/20 items-center justify-center mr-2">
              <Sparkles size={16} color="#E6B655" />
            </View>
            <View className="flex-1">
              <Text className="text-sm font-semibold text-craftopia-textPrimary mb-0.5 font-poppinsBold">
                AI-Powered Craft Ideas
              </Text>
              <Text className="text-xs text-craftopia-textSecondary font-nunito">
                Scan recyclables to discover creative projects
              </Text>
            </View>
          </View>
        </View>
      </View>

      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        {/* Main Scan CTA */}
        <View className="mx-4 mt-6">
          <View className="bg-gradient-to-br from-craftopia-primary to-craftopia-primaryLight rounded-2xl p-6 overflow-hidden">
            {/* Background Pattern */}
            <View className="absolute -right-8 -top-8 w-32 h-32 rounded-full bg-white/10" />
            <View className="absolute -left-4 -bottom-4 w-24 h-24 rounded-full bg-white/10" />

            {/* Content */}
            <View className="relative z-10">
              <View className="flex-row items-center mb-3">
                <View className="w-12 h-12 rounded-full bg-white/20 items-center justify-center mr-3">
                  <Scan size={24} color="#FFFFFF" />
                </View>
                <View className="flex-1">
                  <Text className="text-lg font-bold text-white font-poppinsBold">
                    Start Scanning
                  </Text>
                  <Text className="text-sm text-white/90 font-nunito">
                    Turn waste into wonderful creations
                  </Text>
                </View>
              </View>

              <TouchableOpacity
                onPress={handleStartScan}
                className="bg-white rounded-full px-6 py-3 flex-row items-center justify-center"
                activeOpacity={0.8}
              >
                <Scan size={18} color="#3B6E4D" />
                <Text className="text-base font-semibold text-craftopia-primary ml-2 font-nunito">
                  Scan Items
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {/* Stats Cards */}
        <View className="mx-4 mt-6">
          <View className="flex-row gap-3">
            {/* Total Crafts */}
            <View className="flex-1 bg-craftopia-surface rounded-xl p-4 border border-craftopia-light">
              <View className="flex-row items-center justify-between mb-2">
                <View className="w-10 h-10 rounded-full bg-craftopia-primary/10 items-center justify-center">
                  <Target size={20} color="#3B6E4D" />
                </View>
                <TrendingUp size={16} color="#5BA776" />
              </View>
              <Text className="text-2xl font-bold text-craftopia-textPrimary font-poppinsBold">
                {recentItems.length}
              </Text>
              <Text className="text-xs text-craftopia-textSecondary font-nunito">
                Scanned Items
              </Text>
            </View>

            {/* Points Earned */}
            <View className="flex-1 bg-craftopia-surface rounded-xl p-4 border border-craftopia-light">
              <View className="flex-row items-center justify-between mb-2">
                <View className="w-10 h-10 rounded-full bg-craftopia-accent/10 items-center justify-center">
                  <Award size={20} color="#E6B655" />
                </View>
                <TrendingUp size={16} color="#5BA776" />
              </View>
              <Text className="text-2xl font-bold text-craftopia-textPrimary font-poppinsBold">
                0
              </Text>
              <Text className="text-xs text-craftopia-textSecondary font-nunito">
                Crafts Made
              </Text>
            </View>
          </View>
        </View>

        {/* Recent Scans */}
        {recentItems.length > 0 && (
          <View className="mt-6">
            <View className="px-4 mb-3">
              <View className="flex-row items-center justify-between">
                <View>
                  <Text className="text-lg font-bold text-craftopia-textPrimary font-poppinsBold">
                    Recent Scans
                  </Text>
                  <Text className="text-sm text-craftopia-textSecondary font-nunito">
                    Your saved recyclables
                  </Text>
                </View>
              </View>
            </View>

            <FlatList
              data={recentItems}
              keyExtractor={(i) => i.id}
              horizontal
              showsHorizontalScrollIndicator={false}
              renderItem={renderSavedItem}
              contentContainerStyle={{ paddingHorizontal: 16 }}
            />
          </View>
        )}

        {/* Empty State */}
        {recentItems.length === 0 && (
          <View className="mx-4 mt-8">
            <View className="bg-craftopia-surface rounded-xl p-8 items-center border border-craftopia-light">
              <View className="w-20 h-20 rounded-full bg-craftopia-light items-center justify-center mb-4">
                <Scan size={32} color="#5F6F64" />
              </View>
              <Text className="text-base font-semibold text-craftopia-textPrimary mb-2 font-poppinsBold text-center">
                No Scans Yet
              </Text>
              <Text className="text-sm text-craftopia-textSecondary text-center mb-4 font-nunito px-4">
                Start by scanning your recyclable items to discover amazing craft ideas
              </Text>
              <TouchableOpacity
                onPress={handleStartScan}
                className="bg-craftopia-primary rounded-full px-6 py-3"
                activeOpacity={0.7}
              >
                <Text className="text-sm font-semibold text-white font-nunito">
                  Get Started
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* Tips Section */}
        <View className="mx-4 mt-6 mb-6">
          <Text className="text-base font-bold text-craftopia-textPrimary mb-3 font-poppinsBold">
            Crafting Tips
          </Text>
          
          <View className="space-y-2">
            {/* Tip 1 */}
            <View className="bg-craftopia-surface rounded-xl p-4 border border-craftopia-light">
              <Text className="text-sm font-semibold text-craftopia-textPrimary mb-1 font-poppinsBold">
                Clean Before Crafting
              </Text>
              <Text className="text-xs text-craftopia-textSecondary font-nunito">
                Wash and dry recyclables thoroughly before starting your project
              </Text>
            </View>

            {/* Tip 2 */}
            <View className="bg-craftopia-surface rounded-xl p-4 border border-craftopia-light">
              <Text className="text-sm font-semibold text-craftopia-textPrimary mb-1 font-poppinsBold">
                Safety First
              </Text>
              <Text className="text-xs text-craftopia-textSecondary font-nunito">
                Use proper tools and supervision when cutting or working with sharp materials
              </Text>
            </View>

            {/* Tip 3 */}
            <View className="bg-craftopia-surface rounded-xl p-4 border border-craftopia-light">
              <Text className="text-sm font-semibold text-craftopia-textPrimary mb-1 font-poppinsBold">
                Get Creative
              </Text>
              <Text className="text-xs text-craftopia-textSecondary font-nunito">
                Don't be afraid to modify designs and add your personal touch
              </Text>
            </View>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default CraftScreen;