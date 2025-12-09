// apps/mobile/src/screens/Craft.tsx - FIXED JSON PARSING FOR SAVED CRAFTS

import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  FlatList,
  ScrollView,
  useWindowDimensions,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import {
  Scan,
  Sparkles,
  History,
  TrendingUp,
  Award,
  Target,
  Clock,
  Bookmark,
  Package,
} from 'lucide-react-native';
import { CraftStackParamList } from '~/navigations/types';
import { useNavigation } from '@react-navigation/native';
import { useSavedCrafts, useCraftStats } from '~/hooks/queries/useCraft';

// ✅ Helper to safely parse idea_json
const parseIdeaJson = (ideaJson: any) => {
  try {
    if (typeof ideaJson === 'string') {
      return JSON.parse(ideaJson);
    }
    return ideaJson;
  } catch (error) {
    console.error('Failed to parse idea_json:', error);
    return ideaJson || {};
  }
};

// ✅ Helper to safely parse recycled_materials
const parseMaterials = (materials: any) => {
  try {
    if (Array.isArray(materials)) {
      return materials;
    }
    if (typeof materials === 'string') {
      return JSON.parse(materials);
    }
    return [];
  } catch (error) {
    console.error('Failed to parse materials:', error);
    return [];
  }
};

export const CraftScreen: React.FC = () => {
  const navigation = useNavigation<NativeStackNavigationProp<CraftStackParamList>>();
  const { width: screenWidth } = useWindowDimensions();

  // ✅ Fetch saved crafts and stats from database
  const { data: savedCraftsData, isLoading: isLoadingCrafts, refetch: refetchCrafts } = useSavedCrafts(1, 10);
  const { data: statsData, isLoading: isLoadingStats, refetch: refetchStats } = useCraftStats();

  const [refreshing, setRefreshing] = useState(false);

  // Responsive breakpoints
  const isSmallScreen = screenWidth < 375;
  const isLargeScreen = screenWidth > 414;

  // ✅ Pull to refresh
  const onRefresh = async () => {
    setRefreshing(true);
    await Promise.all([refetchCrafts(), refetchStats()]);
    setRefreshing(false);
  };

  const handleStartScan = () => {
    navigation.navigate('CraftScan');
  };

  const handleCraftPress = (craft: any) => {
    // ✅ Parse idea_json properly
    const ideaJson = parseIdeaJson(craft.idea_json);
    const materials = parseMaterials(craft.recycled_materials);

    navigation.navigate('CraftDetails', {
      craftTitle: ideaJson.title || 'Craft Idea',
      materials: materials,
      steps: ideaJson.steps || [],
      generatedImageUrl: craft.generated_image_url,
      timeNeeded: ideaJson.timeNeeded,
      quickTip: ideaJson.quickTip,
      description: ideaJson.description,
      difficulty: ideaJson.difficulty,           // ✅ NOW PARSED
      toolsNeeded: ideaJson.toolsNeeded,         // ✅ NOW PARSED
      uniqueFeature: ideaJson.uniqueFeature,     // ✅ NOW PARSED
      ideaId: craft.idea_id,
      isSaved: craft.is_saved,
    });
  };

  const renderSavedCraft = ({ item }: { item: any }) => {
    // ✅ Parse idea_json properly
    const ideaJson = parseIdeaJson(item.idea_json);

    return (
      <TouchableOpacity
        className={`mr-3 rounded-xl overflow-hidden bg-craftopia-surface border border-craftopia-light relative ${isSmallScreen ? 'w-40' : isLargeScreen ? 'w-48' : 'w-44'
          }`}
        onPress={() => handleCraftPress(item)}
        activeOpacity={0.7}
      >
        {item.generated_image_url ? (
          <Image
            source={{ uri: item.generated_image_url }}
            className={`w-full ${isSmallScreen ? 'h-28' : isLargeScreen ? 'h-36' : 'h-32'
              }`}
            resizeMode="cover"
          />
        ) : (
          <View className={`w-full ${isSmallScreen ? 'h-28' : isLargeScreen ? 'h-36' : 'h-32'
            } bg-craftopia-light items-center justify-center`}>
            <Sparkles
              size={isSmallScreen ? 24 : isLargeScreen ? 32 : 28}
              color="#E6B655"
            />
          </View>
        )}

        {/* Saved Badge */}
        <View className="absolute top-2 right-2 bg-craftopia-success/90 px-2 py-1 rounded-lg flex-row items-center">
          <Bookmark size={10} color="#FFFFFF" fill="#FFFFFF" />
          <Text className="text-xs text-white ml-1 font-nunito font-semibold">
            Saved
          </Text>
        </View>

        <View className="p-3">
          <Text
            className={`text-craftopia-textPrimary font-semibold font-nunito ${isSmallScreen ? 'text-xs' : isLargeScreen ? 'text-sm' : 'text-xs'
              }`}
            numberOfLines={2}
          >
            {ideaJson.title || 'Craft Idea'}
          </Text>

          {ideaJson.timeNeeded && (
            <View className="flex-row items-center mt-1">
              <Clock size={10} color="#5F6F64" />
              <Text
                className={`text-craftopia-textSecondary ml-1 font-nunito ${isSmallScreen ? 'text-xs' : isLargeScreen ? 'text-xs' : 'text-xs'
                  }`}
              >
                {ideaJson.timeNeeded}
              </Text>
            </View>
          )}

          {/* ✅ Show difficulty if available */}
          {ideaJson.difficulty && (
            <View className="flex-row items-center mt-1">
              <Text
                className={`text-craftopia-accent font-nunito font-semibold ${isSmallScreen ? 'text-xs' : isLargeScreen ? 'text-xs' : 'text-xs'
                  }`}
              >
                {ideaJson.difficulty}
              </Text>
            </View>
          )}

          <Text
            className={`text-craftopia-textSecondary mt-1 font-nunito ${isSmallScreen ? 'text-xs' : isLargeScreen ? 'text-sm' : 'text-xs'
              }`}
          >
            {new Date(item.created_at).toLocaleDateString('en-US', {
              month: 'short',
              day: 'numeric'
            })}
          </Text>
        </View>
      </TouchableOpacity>
    );
  };

  // ✅ Extract stats
  const savedCrafts = savedCraftsData?.data || [];
  const stats = statsData?.data ?? {
    totalCrafts: 0,
    savedCrafts: 0,
    totalMaterials: 0,
  };
  const totalCrafts = stats.totalCrafts;
  const craftsMade = stats.savedCrafts;
  const totalMaterials = stats.totalMaterials;
  return (
    <SafeAreaView edges={['left', 'right', 'bottom']} className="flex-1 bg-craftopia-background">
      {/* Header */}
      <View className={`bg-craftopia-surface border-b border-craftopia-light ${isSmallScreen ? 'px-3 pt-3 pb-3' : isLargeScreen ? 'px-5 pt-5 pb-5' : 'px-4 pt-4 pb-4'
        }`}>
        <View className="flex-row justify-between items-center mb-3">
          <View className="flex-1">
            <Text
              className={`text-craftopia-textSecondary uppercase tracking-wider mb-1 font-nunito ${isSmallScreen ? 'text-xs' : isLargeScreen ? 'text-sm' : 'text-xs'
                }`}
            >
              Craft Hub
            </Text>
            <Text
              className={`font-bold text-craftopia-textPrimary font-poppinsBold ${isSmallScreen ? 'text-lg' : isLargeScreen ? 'text-2xl' : 'text-xl'
                }`}
            >
              Create & Upcycle
            </Text>
          </View>

          {/* History Button */}
          {craftsMade > 0 && (
            <TouchableOpacity
              className="flex-row items-center bg-craftopia-light rounded-full px-3 py-2"
              activeOpacity={0.7}
            >
              <History
                size={isSmallScreen ? 14 : isLargeScreen ? 16 : 14}
                color="#3B6E4D"
              />
              <Text
                className={`font-semibold text-craftopia-primary ml-1 font-nunito ${isSmallScreen ? 'text-xs' : isLargeScreen ? 'text-sm' : 'text-xs'
                  }`}
              >
                {craftsMade}
              </Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Info Card */}
        <View className="bg-craftopia-light rounded-xl p-3 border border-craftopia-accent/20">
          <View className="flex-row items-center">
            <View
              className={`rounded-full bg-craftopia-accent/20 items-center justify-center mr-2 ${isSmallScreen ? 'w-8 h-8' : isLargeScreen ? 'w-10 h-10' : 'w-8 h-8'
                }`}
            >
              <Sparkles
                size={isSmallScreen ? 16 : isLargeScreen ? 20 : 16}
                color="#E6B655"
              />
            </View>
            <View className="flex-1">
              <Text
                className={`font-semibold text-craftopia-textPrimary mb-1 font-poppinsBold ${isSmallScreen ? 'text-sm' : isLargeScreen ? 'text-base' : 'text-sm'
                  }`}
              >
                AI-Powered Craft Ideas
              </Text>
              <Text
                className={`text-craftopia-textSecondary font-nunito ${isSmallScreen ? 'text-xs' : isLargeScreen ? 'text-sm' : 'text-xs'
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
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#3B6E4D']} />
        }
        contentContainerStyle={{
          paddingBottom: isSmallScreen ? 16 : isLargeScreen ? 24 : 20
        }}
      >
        {/* Main Scan CTA */}
        <View className={`${isSmallScreen ? 'mx-3 mt-4' : isLargeScreen ? 'mx-5 mt-6' : 'mx-4 mt-5'
          }`}>
          <View className="bg-craftopia-primary rounded-2xl p-4 overflow-hidden">
            {/* Background Pattern */}
            <View className="absolute -right-6 -top-6 w-24 h-24 rounded-full bg-craftopia-primaryLight opacity-20" />
            <View className="absolute -left-3 -bottom-3 w-20 h-20 rounded-full bg-craftopia-primaryLight opacity-20" />

            {/* Content */}
            <View className="relative z-10">
              <View className="flex-row items-center mb-3">
                <View
                  className={`rounded-full bg-white/20 items-center justify-center mr-3 ${isSmallScreen ? 'w-10 h-10' : isLargeScreen ? 'w-12 h-12' : 'w-10 h-10'
                    }`}
                >
                  <Scan
                    size={isSmallScreen ? 20 : isLargeScreen ? 24 : 20}
                    color="#FFFFFF"
                  />
                </View>
                <View className="flex-1">
                  <Text
                    className={`font-bold text-white font-poppinsBold ${isSmallScreen ? 'text-base' : isLargeScreen ? 'text-xl' : 'text-lg'
                      }`}
                  >
                    Start Scanning
                  </Text>
                  <Text
                    className={`text-white/90 font-nunito ${isSmallScreen ? 'text-xs' : isLargeScreen ? 'text-sm' : 'text-xs'
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
                  className={`font-semibold text-craftopia-primary ml-2 font-nunito ${isSmallScreen ? 'text-sm' : isLargeScreen ? 'text-base' : 'text-sm'
                    }`}
                >
                  Scan Items
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {/* ✅ Stats Cards with Real Data */}
        <View className={`${isSmallScreen ? 'mx-3 mt-4' : isLargeScreen ? 'mx-5 mt-6' : 'mx-4 mt-5'
          }`}>
          <View className="flex-row gap-3">
            {/* Total Materials Used */}
            <View className="flex-1 bg-craftopia-surface rounded-xl p-3 border border-craftopia-light">
              <View className="flex-row items-center justify-between mb-2">
                <View
                  className={`rounded-full bg-craftopia-primary/10 items-center justify-center ${isSmallScreen ? 'w-8 h-8' : isLargeScreen ? 'w-10 h-10' : 'w-8 h-8'
                    }`}
                >
                  <Package
                    size={isSmallScreen ? 16 : isLargeScreen ? 20 : 16}
                    color="#3B6E4D"
                  />
                </View>
                {isLoadingStats && <ActivityIndicator size="small" color="#5BA776" />}
              </View>
              <Text
                className={`font-bold text-craftopia-textPrimary font-poppinsBold ${isSmallScreen ? 'text-xl' : isLargeScreen ? 'text-2xl' : 'text-xl'
                  }`}
              >
                {totalCrafts}
              </Text>
              <Text
                className={`text-craftopia-textSecondary font-nunito ${isSmallScreen ? 'text-xs' : isLargeScreen ? 'text-sm' : 'text-xs'
                  }`}
              >
                Total Crafts
              </Text>
            </View>

            {/* Crafts Made */}
            <View className="flex-1 bg-craftopia-surface rounded-xl p-3 border border-craftopia-light">
              <View className="flex-row items-center justify-between mb-2">
                <View
                  className={`rounded-full bg-craftopia-accent/10 items-center justify-center ${isSmallScreen ? 'w-8 h-8' : isLargeScreen ? 'w-10 h-10' : 'w-8 h-8'
                    }`}
                >
                  <Award
                    size={isSmallScreen ? 16 : isLargeScreen ? 20 : 16}
                    color="#E6B655"
                  />
                </View>
                {isLoadingStats && <ActivityIndicator size="small" color="#5BA776" />}
              </View>
              <Text
                className={`font-bold text-craftopia-textPrimary font-poppinsBold ${isSmallScreen ? 'text-xl' : isLargeScreen ? 'text-2xl' : 'text-xl'
                  }`}
              >
                {craftsMade}
              </Text>
              <Text
                className={`text-craftopia-textSecondary font-nunito ${isSmallScreen ? 'text-xs' : isLargeScreen ? 'text-sm' : 'text-xs'
                  }`}
              >
                Crafts Saved
              </Text>
            </View>
          </View>
        </View>

        {/* ✅ Saved Crafts from Database */}
        {isLoadingCrafts ? (
          <View className="items-center justify-center py-12">
            <ActivityIndicator size="large" color="#3B6E4D" />
            <Text className="text-craftopia-textSecondary mt-3 font-nunito">
              Loading your crafts...
            </Text>
          </View>
        ) : savedCrafts.length > 0 ? (
          <View className={`${isSmallScreen ? 'mt-4' : isLargeScreen ? 'mt-6' : 'mt-5'}`}>
            <View className={`${isSmallScreen ? 'px-3 mb-2' : isLargeScreen ? 'px-5 mb-3' : 'px-4 mb-3'
              }`}>
              <View className="flex-row items-center justify-between">
                <View>
                  <Text
                    className={`font-bold text-craftopia-textPrimary font-poppinsBold ${isSmallScreen ? 'text-base' : isLargeScreen ? 'text-xl' : 'text-lg'
                      }`}
                  >
                    Saved Crafts
                  </Text>
                  <Text
                    className={`text-craftopia-textSecondary font-nunito ${isSmallScreen ? 'text-xs' : isLargeScreen ? 'text-sm' : 'text-xs'
                      }`}
                  >
                    Your creative collection
                  </Text>
                </View>

                <View className="bg-craftopia-success/10 px-3 py-1.5 rounded-lg">
                  <Text className="text-craftopia-success font-nunito font-semibold text-xs">
                    {savedCrafts.length} {savedCrafts.length === 1 ? 'craft' : 'crafts'}
                  </Text>
                </View>
              </View>
            </View>

            <FlatList
              data={savedCrafts}
              keyExtractor={(item, index) => item.idea_id?.toString() || index.toString()}
              horizontal
              showsHorizontalScrollIndicator={false}
              renderItem={renderSavedCraft}
              contentContainerStyle={{
                paddingHorizontal: isSmallScreen ? 12 : isLargeScreen ? 20 : 16
              }}
            />
          </View>
        ) : (
          // Empty State
          <View className={`${isSmallScreen ? 'mx-3 mt-6' : isLargeScreen ? 'mx-5 mt-8' : 'mx-4 mt-6'
            }`}>
            <View className="bg-craftopia-surface rounded-xl p-6 items-center border border-craftopia-light">
              <View
                className={`rounded-full bg-craftopia-light items-center justify-center mb-4 ${isSmallScreen ? 'w-16 h-16' : isLargeScreen ? 'w-20 h-20' : 'w-16 h-16'
                  }`}
              >
                <Bookmark
                  size={isSmallScreen ? 24 : isLargeScreen ? 32 : 24}
                  color="#5F6F64"
                />
              </View>
              <Text
                className={`font-semibold text-craftopia-textPrimary mb-2 font-poppinsBold text-center ${isSmallScreen ? 'text-base' : isLargeScreen ? 'text-xl' : 'text-lg'
                  }`}
              >
                No Saved Crafts Yet
              </Text>
              <Text
                className={`text-craftopia-textSecondary text-center mb-4 font-nunito ${isSmallScreen ? 'text-sm' : isLargeScreen ? 'text-base' : 'text-sm'
                  }`}
              >
                Start by scanning your recyclable items to discover and save amazing craft ideas
              </Text>
              <TouchableOpacity
                onPress={handleStartScan}
                className="bg-craftopia-primary rounded-full px-4 py-3"
                activeOpacity={0.7}
              >
                <Text
                  className={`font-semibold text-white font-nunito ${isSmallScreen ? 'text-sm' : isLargeScreen ? 'text-base' : 'text-sm'
                    }`}
                >
                  Get Started
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* Tips Section */}
        <View className={`${isSmallScreen ? 'mx-3 mt-4 mb-4' : isLargeScreen ? 'mx-5 mt-6 mb-6' : 'mx-4 mt-5 mb-5'
          }`}>
          <Text
            className={`font-bold text-craftopia-textPrimary mb-3 font-poppinsBold ${isSmallScreen ? 'text-base' : isLargeScreen ? 'text-xl' : 'text-lg'
              }`}
          >
            Crafting Tips
          </Text>

          <View className="space-y-2">
            {/* Tip 1 */}
            <View className="bg-craftopia-surface rounded-xl p-3 border border-craftopia-light">
              <Text
                className={`font-semibold text-craftopia-textPrimary mb-1 font-poppinsBold ${isSmallScreen ? 'text-sm' : isLargeScreen ? 'text-base' : 'text-sm'
                  }`}
              >
                Clean Before Crafting
              </Text>
              <Text
                className={`text-craftopia-textSecondary font-nunito ${isSmallScreen ? 'text-xs' : isLargeScreen ? 'text-sm' : 'text-xs'
                  }`}
              >
                Wash and dry recyclables thoroughly before starting your project
              </Text>
            </View>

            {/* Tip 2 */}
            <View className="bg-craftopia-surface rounded-xl p-3 border border-craftopia-light">
              <Text
                className={`font-semibold text-craftopia-textPrimary mb-1 font-poppinsBold ${isSmallScreen ? 'text-sm' : isLargeScreen ? 'text-base' : 'text-sm'
                  }`}
              >
                Safety First
              </Text>
              <Text
                className={`text-craftopia-textSecondary font-nunito ${isSmallScreen ? 'text-xs' : isLargeScreen ? 'text-sm' : 'text-xs'
                  }`}
              >
                Use proper tools and supervision when cutting or working with sharp materials
              </Text>
            </View>

            {/* Tip 3 */}
            <View className="bg-craftopia-surface rounded-xl p-3 border border-craftopia-light">
              <Text
                className={`font-semibold text-craftopia-textPrimary mb-1 font-poppinsBold ${isSmallScreen ? 'text-sm' : isLargeScreen ? 'text-base' : 'text-sm'
                  }`}
              >
                Get Creative
              </Text>
              <Text
                className={`text-craftopia-textSecondary font-nunito ${isSmallScreen ? 'text-xs' : isLargeScreen ? 'text-sm' : 'text-xs'
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