import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  FlatList,
  ScrollView,
  Alert,
  useWindowDimensions,
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
  const { width: screenWidth } = useWindowDimensions();
  
  // Responsive breakpoints
  const isSmallScreen = screenWidth < 375;
  const isLargeScreen = screenWidth > 414;

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
      className={`mr-3 rounded-xl overflow-hidden bg-craftopia-surface border border-craftopia-light relative ${
        isSmallScreen ? 'w-28' : isLargeScreen ? 'w-36' : 'w-32'
      }`}
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
        <Image 
          source={{ uri: item.uri }} 
          className={`w-full ${
            isSmallScreen ? 'h-20' : isLargeScreen ? 'h-28' : 'h-24'
          }`}
          resizeMode="cover" 
        />
      ) : (
        <View className={`w-full ${
          isSmallScreen ? 'h-20' : isLargeScreen ? 'h-28' : 'h-24'
        } bg-craftopia-light items-center justify-center`}>
          <Sparkles 
            size={isSmallScreen ? 20 : isLargeScreen ? 28 : 24} 
            color="#E6B655" 
          />
        </View>
      )}
      
      <View className="p-2">
        <Text 
          className={`text-craftopia-textPrimary font-semibold font-nunito ${
            isSmallScreen ? 'text-xs' : isLargeScreen ? 'text-sm' : 'text-xs'
          }`}
          numberOfLines={2}
        >
          {item.manualText || new Date(item.createdAt).toLocaleDateString()}
        </Text>
        <Text 
          className={`text-craftopia-textSecondary mt-1 font-nunito ${
            isSmallScreen ? 'text-xs' : isLargeScreen ? 'text-sm' : 'text-xs'
          }`}
        >
          {new Date(item.createdAt).toLocaleDateString('en-US', { 
            month: 'short', 
            day: 'numeric' 
          })}
        </Text>
      </View>

      {/* Delete Button */}
      <TouchableOpacity
        onPress={() => deleteItem(item.id)}
        className={`absolute top-2 right-2 rounded-full bg-craftopia-error/90 items-center justify-center ${
          isSmallScreen ? 'w-5 h-5' : isLargeScreen ? 'w-7 h-7' : 'w-6 h-6'
        }`}
        activeOpacity={0.7}
      >
        <Trash2 
          size={isSmallScreen ? 10 : isLargeScreen ? 14 : 12} 
          color="#FFFFFF" 
        />
      </TouchableOpacity>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView edges={['left', 'right', 'bottom']} className="flex-1 bg-craftopia-background">
      {/* Header */}
      <View className={`bg-craftopia-surface border-b border-craftopia-light ${
        isSmallScreen ? 'px-3 pt-3 pb-3' : isLargeScreen ? 'px-5 pt-5 pb-5' : 'px-4 pt-4 pb-4'
      }`}>
        <View className="flex-row justify-between items-center mb-3">
          <View className="flex-1">
            <Text 
              className={`text-craftopia-textSecondary uppercase tracking-wider mb-1 font-nunito ${
                isSmallScreen ? 'text-xs' : isLargeScreen ? 'text-sm' : 'text-xs'
              }`}
            >
              Craft Hub
            </Text>
            <Text 
              className={`font-bold text-craftopia-textPrimary font-poppinsBold ${
                isSmallScreen ? 'text-lg' : isLargeScreen ? 'text-2xl' : 'text-xl'
              }`}
            >
              Create & Upcycle
            </Text>
          </View>

          {/* History Button */}
          {recentItems.length > 0 && (
            <TouchableOpacity
              className="flex-row items-center bg-craftopia-light rounded-full px-3 py-2"
              activeOpacity={0.7}
            >
              <History 
                size={isSmallScreen ? 14 : isLargeScreen ? 16 : 14} 
                color="#3B6E4D" 
              />
              <Text 
                className={`font-semibold text-craftopia-primary ml-1 font-nunito ${
                  isSmallScreen ? 'text-xs' : isLargeScreen ? 'text-sm' : 'text-xs'
                }`}
              >
                {recentItems.length}
              </Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Info Card */}
        <View className="bg-craftopia-light rounded-xl p-3 border border-craftopia-accent/20">
          <View className="flex-row items-center">
            <View 
              className={`rounded-full bg-craftopia-accent/20 items-center justify-center mr-2 ${
                isSmallScreen ? 'w-8 h-8' : isLargeScreen ? 'w-10 h-10' : 'w-8 h-8'
              }`}
            >
              <Sparkles 
                size={isSmallScreen ? 16 : isLargeScreen ? 20 : 16} 
                color="#E6B655" 
              />
            </View>
            <View className="flex-1">
              <Text 
                className={`font-semibold text-craftopia-textPrimary mb-1 font-poppinsBold ${
                  isSmallScreen ? 'text-sm' : isLargeScreen ? 'text-base' : 'text-sm'
                }`}
              >
                AI-Powered Craft Ideas
              </Text>
              <Text 
                className={`text-craftopia-textSecondary font-nunito ${
                  isSmallScreen ? 'text-xs' : isLargeScreen ? 'text-sm' : 'text-xs'
                }`}
              >
                Scan recyclables to discover creative projects
              </Text>
            </View>
          </View>
        </View>
      </View>

      <ScrollView 
        className="flex-1" 
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ 
          paddingBottom: isSmallScreen ? 16 : isLargeScreen ? 24 : 20 
        }}
      >
        {/* Main Scan CTA */}
        <View className={`${
          isSmallScreen ? 'mx-3 mt-4' : isLargeScreen ? 'mx-5 mt-6' : 'mx-4 mt-5'
        }`}>
          <View className="bg-craftopia-primary rounded-2xl p-4 overflow-hidden">
            {/* Background Pattern */}
            <View className="absolute -right-6 -top-6 w-24 h-24 rounded-full bg-craftopia-primaryLight opacity-20" />
            <View className="absolute -left-3 -bottom-3 w-20 h-20 rounded-full bg-craftopia-primaryLight opacity-20" />

            {/* Content */}
            <View className="relative z-10">
              <View className="flex-row items-center mb-3">
                <View 
                  className={`rounded-full bg-white/20 items-center justify-center mr-3 ${
                    isSmallScreen ? 'w-10 h-10' : isLargeScreen ? 'w-12 h-12' : 'w-10 h-10'
                  }`}
                >
                  <Scan 
                    size={isSmallScreen ? 20 : isLargeScreen ? 24 : 20} 
                    color="#FFFFFF" 
                  />
                </View>
                <View className="flex-1">
                  <Text 
                    className={`font-bold text-white font-poppinsBold ${
                      isSmallScreen ? 'text-base' : isLargeScreen ? 'text-xl' : 'text-lg'
                    }`}
                  >
                    Start Scanning
                  </Text>
                  <Text 
                    className={`text-white/90 font-nunito ${
                      isSmallScreen ? 'text-xs' : isLargeScreen ? 'text-sm' : 'text-xs'
                    }`}
                  >
                    Turn waste into wonderful creations
                  </Text>
                </View>
              </View>

              <TouchableOpacity
                onPress={handleStartScan}
                className="bg-white rounded-full px-4 py-3 flex-row items-center justify-center"
                activeOpacity={0.8}
              >
                <Scan 
                  size={isSmallScreen ? 16 : isLargeScreen ? 20 : 16} 
                  color="#3B6E4D" 
                />
                <Text 
                  className={`font-semibold text-craftopia-primary ml-2 font-nunito ${
                    isSmallScreen ? 'text-sm' : isLargeScreen ? 'text-base' : 'text-sm'
                  }`}
                >
                  Scan Items
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {/* Stats Cards */}
        <View className={`${
          isSmallScreen ? 'mx-3 mt-4' : isLargeScreen ? 'mx-5 mt-6' : 'mx-4 mt-5'
        }`}>
          <View className="flex-row gap-3">
            {/* Total Crafts */}
            <View className="flex-1 bg-craftopia-surface rounded-xl p-3 border border-craftopia-light">
              <View className="flex-row items-center justify-between mb-2">
                <View 
                  className={`rounded-full bg-craftopia-primary/10 items-center justify-center ${
                    isSmallScreen ? 'w-8 h-8' : isLargeScreen ? 'w-10 h-10' : 'w-8 h-8'
                  }`}
                >
                  <Target 
                    size={isSmallScreen ? 16 : isLargeScreen ? 20 : 16} 
                    color="#3B6E4D" 
                  />
                </View>
                <TrendingUp 
                  size={isSmallScreen ? 14 : isLargeScreen ? 16 : 14} 
                  color="#5BA776" 
                />
              </View>
              <Text 
                className={`font-bold text-craftopia-textPrimary font-poppinsBold ${
                  isSmallScreen ? 'text-xl' : isLargeScreen ? 'text-2xl' : 'text-xl'
                }`}
              >
                {recentItems.length}
              </Text>
              <Text 
                className={`text-craftopia-textSecondary font-nunito ${
                  isSmallScreen ? 'text-xs' : isLargeScreen ? 'text-sm' : 'text-xs'
                }`}
              >
                Scanned Items
              </Text>
            </View>

            {/* Points Earned */}
            <View className="flex-1 bg-craftopia-surface rounded-xl p-3 border border-craftopia-light">
              <View className="flex-row items-center justify-between mb-2">
                <View 
                  className={`rounded-full bg-craftopia-accent/10 items-center justify-center ${
                    isSmallScreen ? 'w-8 h-8' : isLargeScreen ? 'w-10 h-10' : 'w-8 h-8'
                  }`}
                >
                  <Award 
                    size={isSmallScreen ? 16 : isLargeScreen ? 20 : 16} 
                    color="#E6B655" 
                  />
                </View>
                <TrendingUp 
                  size={isSmallScreen ? 14 : isLargeScreen ? 16 : 14} 
                  color="#5BA776" 
                />
              </View>
              <Text 
                className={`font-bold text-craftopia-textPrimary font-poppinsBold ${
                  isSmallScreen ? 'text-xl' : isLargeScreen ? 'text-2xl' : 'text-xl'
                }`}
              >
                0
              </Text>
              <Text 
                className={`text-craftopia-textSecondary font-nunito ${
                  isSmallScreen ? 'text-xs' : isLargeScreen ? 'text-sm' : 'text-xs'
                }`}
              >
                Crafts Made
              </Text>
            </View>
          </View>
        </View>

        {/* Recent Scans */}
        {recentItems.length > 0 && (
          <View className={`${isSmallScreen ? 'mt-4' : isLargeScreen ? 'mt-6' : 'mt-5'}`}>
            <View className={`${
              isSmallScreen ? 'px-3 mb-2' : isLargeScreen ? 'px-5 mb-3' : 'px-4 mb-3'
            }`}>
              <View className="flex-row items-center justify-between">
                <View>
                  <Text 
                    className={`font-bold text-craftopia-textPrimary font-poppinsBold ${
                      isSmallScreen ? 'text-base' : isLargeScreen ? 'text-xl' : 'text-lg'
                    }`}
                  >
                    Recent Scans
                  </Text>
                  <Text 
                    className={`text-craftopia-textSecondary font-nunito ${
                      isSmallScreen ? 'text-xs' : isLargeScreen ? 'text-sm' : 'text-xs'
                    }`}
                  >
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
              contentContainerStyle={{ 
                paddingHorizontal: isSmallScreen ? 12 : isLargeScreen ? 20 : 16 
              }}
            />
          </View>
        )}

        {/* Empty State */}
        {recentItems.length === 0 && (
          <View className={`${
            isSmallScreen ? 'mx-3 mt-6' : isLargeScreen ? 'mx-5 mt-8' : 'mx-4 mt-6'
          }`}>
            <View className="bg-craftopia-surface rounded-xl p-6 items-center border border-craftopia-light">
              <View 
                className={`rounded-full bg-craftopia-light items-center justify-center mb-4 ${
                  isSmallScreen ? 'w-16 h-16' : isLargeScreen ? 'w-20 h-20' : 'w-16 h-16'
                }`}
              >
                <Scan 
                  size={isSmallScreen ? 24 : isLargeScreen ? 32 : 24} 
                  color="#5F6F64" 
                />
              </View>
              <Text 
                className={`font-semibold text-craftopia-textPrimary mb-2 font-poppinsBold text-center ${
                  isSmallScreen ? 'text-base' : isLargeScreen ? 'text-xl' : 'text-lg'
                }`}
              >
                No Scans Yet
              </Text>
              <Text 
                className={`text-craftopia-textSecondary text-center mb-4 font-nunito ${
                  isSmallScreen ? 'text-sm' : isLargeScreen ? 'text-base' : 'text-sm'
                }`}
              >
                Start by scanning your recyclable items to discover amazing craft ideas
              </Text>
              <TouchableOpacity
                onPress={handleStartScan}
                className="bg-craftopia-primary rounded-full px-4 py-3"
                activeOpacity={0.7}
              >
                <Text 
                  className={`font-semibold text-white font-nunito ${
                    isSmallScreen ? 'text-sm' : isLargeScreen ? 'text-base' : 'text-sm'
                  }`}
                >
                  Get Started
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* Tips Section */}
        <View className={`${
          isSmallScreen ? 'mx-3 mt-4 mb-4' : isLargeScreen ? 'mx-5 mt-6 mb-6' : 'mx-4 mt-5 mb-5'
        }`}>
          <Text 
            className={`font-bold text-craftopia-textPrimary mb-3 font-poppinsBold ${
              isSmallScreen ? 'text-base' : isLargeScreen ? 'text-xl' : 'text-lg'
            }`}
          >
            Crafting Tips
          </Text>
          
          <View className="space-y-2">
            {/* Tip 1 */}
            <View className="bg-craftopia-surface rounded-xl p-3 border border-craftopia-light">
              <Text 
                className={`font-semibold text-craftopia-textPrimary mb-1 font-poppinsBold ${
                  isSmallScreen ? 'text-sm' : isLargeScreen ? 'text-base' : 'text-sm'
                }`}
              >
                Clean Before Crafting
              </Text>
              <Text 
                className={`text-craftopia-textSecondary font-nunito ${
                  isSmallScreen ? 'text-xs' : isLargeScreen ? 'text-sm' : 'text-xs'
                }`}
              >
                Wash and dry recyclables thoroughly before starting your project
              </Text>
            </View>

            {/* Tip 2 */}
            <View className="bg-craftopia-surface rounded-xl p-3 border border-craftopia-light">
              <Text 
                className={`font-semibold text-craftopia-textPrimary mb-1 font-poppinsBold ${
                  isSmallScreen ? 'text-sm' : isLargeScreen ? 'text-base' : 'text-sm'
                }`}
              >
                Safety First
              </Text>
              <Text 
                className={`text-craftopia-textSecondary font-nunito ${
                  isSmallScreen ? 'text-xs' : isLargeScreen ? 'text-sm' : 'text-xs'
                }`}
              >
                Use proper tools and supervision when cutting or working with sharp materials
              </Text>
            </View>

            {/* Tip 3 */}
            <View className="bg-craftopia-surface rounded-xl p-3 border border-craftopia-light">
              <Text 
                className={`font-semibold text-craftopia-textPrimary mb-1 font-poppinsBold ${
                  isSmallScreen ? 'text-sm' : isLargeScreen ? 'text-base' : 'text-sm'
                }`}
              >
                Get Creative
              </Text>
              <Text 
                className={`text-craftopia-textSecondary font-nunito ${
                  isSmallScreen ? 'text-xs' : isLargeScreen ? 'text-sm' : 'text-xs'
                }`}
              >
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