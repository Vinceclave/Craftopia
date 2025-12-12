// apps/mobile/src/screens/Craft.tsx
import React, { useState } from 'react';
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
  StatusBar,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import {
  Scan,
  Sparkles,
  History,
  Award,
  Clock,
  Bookmark,
  Package,
  ArrowRight,
  Zap,
  Lightbulb,
} from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { CraftStackParamList } from '~/navigations/types';
import { useNavigation } from '@react-navigation/native';
import { useSavedCrafts, useCraftStats } from '~/hooks/queries/useCraft';

// --- Types & Helpers ---

const parseIdeaJson = (ideaJson: any) => {
  try {
    if (typeof ideaJson === 'string') return JSON.parse(ideaJson);
    return ideaJson;
  } catch (error) {
    return ideaJson || {};
  }
};

const parseMaterials = (materials: any) => {
  try {
    if (Array.isArray(materials)) return materials;
    if (typeof materials === 'string') return JSON.parse(materials);
    return [];
  } catch (error) {
    return [];
  }
};

// --- Sub-Components ---

const Header = ({ craftsMade }: { craftsMade: number }) => (
  <View className="px-6 pt-2 pb-6 bg-craftopia-surface border-b border-craftopia-light/50">
    <View className="flex-row justify-between items-start">
      <View>
        <Text className="text-craftopia-textSecondary font-nunito text-xs uppercase tracking-widest mb-1 font-bold">
          Craft Hub
        </Text>
        <Text className="text-3xl font-poppinsBold text-craftopia-textPrimary tracking-tight">
          Create & Upcycle
        </Text>
        <Text className="text-craftopia-textSecondary font-nunito text-sm mt-1">
          Turn your waste into wonder today.
        </Text>
      </View>
      {craftsMade > 0 && (
        <View className="bg-craftopia-primary/10 px-3 py-1.5 rounded-full flex-row items-center mt-1">
          <History size={14} color="#3B6E4D" />
          <Text className="ml-1.5 text-craftopia-primary font-bold font-nunito text-xs">
            {craftsMade} Crafted
          </Text>
        </View>
      )}
    </View>
  </View>
);

const StatCard = ({
  icon: Icon,
  value,
  label,
  color,
  bgColor,
  isLoading,
}: {
  icon: any;
  value: string | number;
  label: string;
  color: string;
  bgColor: string;
  isLoading?: boolean;
}) => (
  <View className="flex-1 bg-white rounded-2xl p-4 shadow-sm border border-slate-100 flex-row items-center justify-between">
    <View>
      {isLoading ? (
        <ActivityIndicator size="small" color={color} className="self-start mb-1" />
      ) : (
        <Text className="text-2xl font-poppinsBold text-craftopia-textPrimary">
          {value}
        </Text>
      )}
      <Text className="text-xs text-craftopia-textSecondary font-nunito font-semibold uppercase tracking-wide">
        {label}
      </Text>
    </View>
    <View style={{ backgroundColor: bgColor }} className="w-10 h-10 rounded-full items-center justify-center">
      <Icon size={20} color={color} />
    </View>
  </View>
);

const ScanActionCard = ({ onPress }: { onPress: () => void }) => (
  <TouchableOpacity
    onPress={onPress}
    activeOpacity={0.9}
    className="mx-6 mt-6 shadow-md shadow-craftopia-primary/20"
  >
    <LinearGradient
      colors={['#3B6E4D', '#2A5138']}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      className="rounded-3xl p-6 relative overflow-hidden"
    >
      {/* Abstract Shapes */}
      <View className="absolute -right-10 -top-10 w-40 h-40 rounded-full bg-white opacity-10" />
      <View className="absolute -left-10 -bottom-10 w-32 h-32 rounded-full bg-craftopia-accent opacity-10" />

      <View className="flex-row items-center justify-between z-10">
        <View className="flex-1 mr-4">
          <View className="bg-white/20 self-start p-2 rounded-xl mb-3">
            <Scan size={24} color="#FFF" />
          </View>
          <Text className="text-white font-poppinsBold text-2xl mb-1">
            Start Scanning
          </Text>
          <Text className="text-white/80 font-nunito text-sm leading-5">
            Identify recyclables and get instant AI-generated craft ideas.
          </Text>
        </View>
        <View className="bg-white h-12 w-12 rounded-full items-center justify-center shadow-lg">
          <ArrowRight size={24} color="#3B6E4D" />
        </View>
      </View>
    </LinearGradient>
  </TouchableOpacity>
);

const SavedCraftCard = ({ item, onPress, width }: { item: any; onPress: () => void; width: number }) => {
  const ideaJson = parseIdeaJson(item.idea_json);

  return (
    <TouchableOpacity
      style={{ width }}
      className="mr-4 bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden h-full flex-col"
      onPress={onPress}
      activeOpacity={0.8}
    >
      <View className="h-32 w-full bg-slate-100 relative">
        {item.generated_image_url ? (
          <Image
            source={{ uri: item.generated_image_url }}
            className="w-full h-full"
            resizeMode="cover"
          />
        ) : (
          <View className="w-full h-full items-center justify-center bg-craftopia-light/50">
            <Sparkles size={28} color="#E6B655" />
          </View>
        )}
        <View className="absolute top-2 right-2 bg-white/90 backdrop-blur-sm px-2 py-1 rounded-md shadow-sm">
          <Bookmark size={12} color="#3B6E4D" fill="#3B6E4D" />
        </View>
      </View>

      <View className="p-3 flex-1 justify-between">
        <View>
          <Text numberOfLines={2} className="font-poppinsBold text-sm text-craftopia-textPrimary leading-5 mb-1">
            {ideaJson.title || 'Untitled Craft'}
          </Text>
          <View className="flex-row flex-wrap gap-1">
            {ideaJson.difficulty && (
              <Text className="text-[10px] bg-craftopia-accent/10 text-craftopia-accent px-1.5 py-0.5 rounded font-bold uppercase">
                {ideaJson.difficulty}
              </Text>
            )}
            {ideaJson.timeNeeded && (
              <View className="flex-row items-center">
                <Clock size={10} color="#94A3B8" />
                <Text className="text-[10px] text-slate-400 font-nunito ml-1">
                  {ideaJson.timeNeeded}
                </Text>
              </View>
            )}
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
};

const TipItem = ({ title, description, icon: Icon, color }: any) => (
  <View className="bg-white rounded-xl p-4 mb-3 border border-slate-100 flex-row items-start shadow-sm">
    <View className={`p-2 rounded-full mr-3 ${color === 'blue' ? 'bg-blue-50' : color === 'amber' ? 'bg-amber-50' : 'bg-green-50'}`}>
      <Icon size={18} color={color === 'blue' ? '#3B82F6' : color === 'amber' ? '#F59E0B' : '#10B981'} />
    </View>
    <View className="flex-1">
      <Text className="font-poppinsBold text-craftopia-textPrimary text-sm mb-1">
        {title}
      </Text>
      <Text className="text-craftopia-textSecondary font-nunito text-xs leading-5">
        {description}
      </Text>
    </View>
  </View>
);

// --- Main Screen ---

export const CraftScreen: React.FC = () => {
  const navigation = useNavigation<NativeStackNavigationProp<CraftStackParamList>>();
  const { width } = useWindowDimensions();

  // Queries
  const { data: savedCraftsData, isLoading: isLoadingCrafts, refetch: refetchCrafts } = useSavedCrafts(1, 10);
  const { data: statsData, isLoading: isLoadingStats, refetch: refetchStats } = useCraftStats();

  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = async () => {
    setRefreshing(true);
    await Promise.all([refetchCrafts(), refetchStats()]);
    setRefreshing(false);
  };

  const handleStartScan = () => navigation.navigate('CraftScan');

  const handleCraftPress = (craft: any) => {
    const ideaJson = parseIdeaJson(craft.idea_json);
    const materials = parseMaterials(craft.recycled_materials);
    navigation.navigate('CraftDetails', {
      craftTitle: ideaJson.title || 'Craft Idea',
      materials,
      steps: ideaJson.steps || [],
      generatedImageUrl: craft.generated_image_url,
      timeNeeded: ideaJson.timeNeeded,
      quickTip: ideaJson.quickTip,
      description: ideaJson.description,
      difficulty: ideaJson.difficulty,
      toolsNeeded: ideaJson.toolsNeeded,
      uniqueFeature: ideaJson.uniqueFeature,
      ideaId: craft.idea_id,
      isSaved: craft.is_saved,
    });
  };

  // Data
  const savedCrafts = savedCraftsData?.data || [];
  const stats = statsData?.data ?? { totalCrafts: 0, savedCrafts: 0, totalMaterials: 0 };

  // Responsive calculations
  const isTablet = width > 768;
  const cardWidth = isTablet ? 220 : 160;

  return (
    <SafeAreaView edges={['left', 'right']} className="flex-1 bg-craftopia-background">
      <StatusBar barStyle="dark-content" backgroundColor="#FAFAF7" />
      <ScrollView
        className="flex-1"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 40 }}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#3B6E4D']} tintColor="#3B6E4D" />
        }
      >
        <SafeAreaView edges={['top']} className="bg-craftopia-surface" />

        {/* Header Section */}
        <Header craftsMade={stats.savedCrafts} />

        {/* Hero Action */}
        <ScanActionCard onPress={handleStartScan} />

        {/* Stats Grid */}
        <View className="px-6 mt-6 flex-row gap-4">
          <StatCard
            icon={Package}
            value={stats.totalCrafts}
            label="Total Ideas"
            color="#3B6E4D"
            bgColor="#E8F5E9"
            isLoading={isLoadingStats}
          />
          <StatCard
            icon={Award}
            value={stats.savedCrafts}
            label="Saved"
            color="#E6B655"
            bgColor="#FFF8E1"
            isLoading={isLoadingStats}
          />
        </View>

        {/* Saved Crafts Section */}
        <View className="mt-8">
          <View className="px-6 flex-row justify-between items-end mb-4">
            <View>
              <Text className="text-lg font-poppinsBold text-craftopia-textPrimary">
                Your Collection
              </Text>
              <Text className="text-xs text-craftopia-textSecondary font-nunito">
                Ideas you've saved for later
              </Text>
            </View>
            <TouchableOpacity onPress={() => { /* Navigate to full list if implemented */ }}>
              <Text className="text-craftopia-primary font-bold text-xs bg-craftopia-primary/5 px-3 py-1.5 rounded-full">
                View All
              </Text>
            </TouchableOpacity>
          </View>

          {isLoadingCrafts ? (
            <View className="h-48 items-center justify-center bg-white mx-6 rounded-2xl border border-dashed border-gray-200">
              <ActivityIndicator color="#3B6E4D" />
            </View>
          ) : savedCrafts.length > 0 ? (
            <FlatList
              data={savedCrafts}
              horizontal
              showsHorizontalScrollIndicator={false}
              keyExtractor={(item, i) => item.idea_id?.toString() || i.toString()}
              contentContainerStyle={{ paddingHorizontal: 24 }}
              renderItem={({ item }) => (
                <SavedCraftCard
                  item={item}
                  onPress={() => handleCraftPress(item)}
                  width={cardWidth}
                />
              )}
            />
          ) : (
            <View className="mx-6 bg-white rounded-2xl p-8 items-center border border-slate-100 shadow-sm">
              <View className="bg-gray-50 p-4 rounded-full mb-3">
                <Bookmark size={24} color="#94A3B8" />
              </View>
              <Text className="text-craftopia-textPrimary font-semibold mb-1 text-center">
                No saved crafts yet
              </Text>
              <Text className="text-craftopia-textSecondary text-center text-xs px-4">
                Scan items to generate and save your favorite ideas here.
              </Text>
            </View>
          )}
        </View>

        {/* Tips Section */}
        <View className="mx-6 mt-8">
          <Text className="text-lg font-poppinsBold text-craftopia-textPrimary mb-4">
            Pro Tips
          </Text>
          <TipItem
            title="Clean It Up"
            description="Always wash and dry your recyclables thoroughly before starting any project to ensure longevity."
            icon={Sparkles}
            color="blue"
          />
          <TipItem
            title="Safety First"
            description="Use proper tools like safety scissors or gloves when handling sharp edges of cans or plastic."
            icon={Zap}
            color="amber"
          />
          <TipItem
            title="Mix Materials"
            description="Combine different recyclables like paper and plastic to create unique textures and structures."
            icon={Lightbulb}
            color="green"
          />
        </View>

        {/* Bottom Spacing */}
        <View className="h-10" />
      </ScrollView>
    </SafeAreaView>
  );
};

export default CraftScreen;