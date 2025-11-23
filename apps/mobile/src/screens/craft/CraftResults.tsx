import React from 'react';
import {
  View,
  Text,
  Image,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import {
  ArrowLeft,
  Sparkles,
  CheckCircle,
  Recycle,
  Lightbulb,
  ChevronRight,
  Clock,
} from 'lucide-react-native';
import { CraftStackParamList } from '~/navigations/types';

type RouteParams = RouteProp<CraftStackParamList, 'CraftResults'>;

interface DetectedItem {
  id: string;
  name: string;
  category: string;
  confidence: number;
  recyclable: boolean;
}

// Mock craft suggestions (static for now)
const MOCK_CRAFT_IDEAS = [
  {
    id: '1',
    title: 'Vertical Garden Planter',
    difficulty: 'Easy',
    time: '30 min',
    materials: ['Plastic Bottle', 'Scissors', 'Soil'],
    description: 'Transform plastic bottles into hanging planters for herbs or flowers',
    image: 'https://via.placeholder.com/300x200/3B6E4D/FFFFFF?text=Planter',
  },
  {
    id: '2',
    title: 'Storage Organizer',
    difficulty: 'Medium',
    time: '45 min',
    materials: ['Cardboard Box', 'Fabric', 'Glue'],
    description: 'Create a decorative storage box for desk or closet organization',
    image: 'https://via.placeholder.com/300x200/E6B655/FFFFFF?text=Organizer',
  },
  {
    id: '3',
    title: 'Decorative Vase',
    difficulty: 'Easy',
    time: '20 min',
    materials: ['Glass Jar', 'Paint', 'Twine'],
    description: 'Upcycle glass jars into beautiful decorative vases',
    image: 'https://via.placeholder.com/300x200/5BA776/FFFFFF?text=Vase',
  },
];

export const CraftResultsScreen = () => {
  const navigation = useNavigation<NativeStackNavigationProp<CraftStackParamList>>();
  const route = useRoute<RouteParams>();
  const { imageUri, detectedItems } = route.params;

  const handleBack = () => navigation.navigate('Craft');

  const handleCraftPress = (craft: typeof MOCK_CRAFT_IDEAS[0]) => {
    navigation.navigate('CraftDetails', {
      craftTitle: craft.title,
      materials: craft.materials,
      steps: [
        'Gather all materials',
        'Clean and prepare recyclables',
        'Follow the crafting process',
        'Add final touches',
      ],
    });
  };

  const getCategoryColor = (category: string) => {
    switch (category.toLowerCase()) {
      case 'plastic':
        return { bg: 'bg-craftopia-info/10', text: 'text-craftopia-info', border: 'border-craftopia-info/20' };
      case 'paper':
        return { bg: 'bg-craftopia-accent/10', text: 'text-craftopia-accent', border: 'border-craftopia-accent/20' };
      case 'glass':
        return { bg: 'bg-craftopia-success/10', text: 'text-craftopia-success', border: 'border-craftopia-success/20' };
      default:
        return { bg: 'bg-craftopia-light', text: 'text-craftopia-textSecondary', border: 'border-craftopia-light' };
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty.toLowerCase()) {
      case 'easy':
        return 'text-craftopia-success';
      case 'medium':
        return 'text-craftopia-warning';
      case 'hard':
        return 'text-craftopia-error';
      default:
        return 'text-craftopia-textSecondary';
    }
  };

  return (
    <SafeAreaView edges={['left', 'right']} className="flex-1 bg-craftopia-background">
      {/* Header */}
      <View className="px-4 pt-4 pb-3 bg-craftopia-surface border-b border-craftopia-light">
        <View className="flex-row items-center mb-3">
          <TouchableOpacity
            onPress={handleBack}
            className="w-9 h-9 rounded-full bg-craftopia-light items-center justify-center mr-3"
          >
            <ArrowLeft size={18} color="#3B6E4D" />
          </TouchableOpacity>

          <View className="flex-1">
            <Text className="text-xs text-craftopia-textSecondary uppercase tracking-wider mb-0.5 font-nunito">
              Scan Results
            </Text>
            <Text className="text-xl font-bold text-craftopia-textPrimary font-poppinsBold">
              {detectedItems.length} Items Detected
            </Text>
          </View>

          <View className="w-9 h-9 rounded-full bg-craftopia-success/10 items-center justify-center">
            <CheckCircle size={18} color="#5BA776" />
          </View>
        </View>
      </View>

      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        {/* Scanned Image */}
        <View className="mx-4 mt-4">
          <View className="relative rounded-2xl overflow-hidden">
            <Image
              source={{ uri: imageUri }}
              className="w-full h-48"
              resizeMode="cover"
            />
            <View className="absolute inset-0 bg-gradient-to-t from-craftopia-textPrimary/50 to-transparent" />
            
            {/* Success Badge */}
            <View className="absolute bottom-3 left-3 bg-craftopia-success rounded-full px-3 py-1.5 flex-row items-center">
              <Sparkles size={14} color="#FFFFFF" />
              <Text className="text-xs font-semibold text-white ml-1 font-nunito">
                Successfully Scanned
              </Text>
            </View>
          </View>
        </View>

        {/* Detected Items Section */}
        <View className="mx-4 mt-4">
          <View className="flex-row items-center justify-between mb-3">
            <View className="flex-row items-center">
              <View className="w-8 h-8 rounded-xl bg-craftopia-primary/10 items-center justify-center mr-2">
                <Recycle size={18} color="#3B6E4D" />
              </View>
              <View>
                <Text className="text-lg font-bold text-craftopia-textPrimary font-poppinsBold">
                  Detected Materials
                </Text>
                <Text className="text-xs text-craftopia-textSecondary font-nunito">
                  All items are recyclable ♻️
                </Text>
              </View>
            </View>
          </View>

          {/* Items List */}
          <View className="space-y-2">
            {detectedItems.map((item: DetectedItem) => {
              const colors = getCategoryColor(item.category);
              return (
                <View
                  key={item.id}
                  className={`bg-craftopia-surface rounded-xl p-3 border ${colors.border}`}
                >
                  <View className="flex-row items-center justify-between">
                    <View className="flex-1">
                      <View className="flex-row items-center mb-1">
                        <Text className="text-sm font-semibold text-craftopia-textPrimary font-poppinsBold">
                          {item.name}
                        </Text>
                        {item.recyclable && (
                          <View className="ml-2">
                            <CheckCircle size={14} color="#5BA776" />
                          </View>
                        )}
                      </View>
                      <View className="flex-row items-center">
                        <View className={`px-2 py-0.5 rounded-lg ${colors.bg}`}>
                          <Text className={`text-xs font-medium font-nunito ${colors.text}`}>
                            {item.category}
                          </Text>
                        </View>
                        <Text className="text-xs text-craftopia-textSecondary ml-2 font-nunito">
                          {item.confidence}% match
                        </Text>
                      </View>
                    </View>
                  </View>
                </View>
              );
            })}
          </View>
        </View>

        {/* Craft Suggestions Section */}
        <View className="mx-4 mt-6 mb-4">
          <View className="flex-row items-center justify-between mb-3">
            <View className="flex-row items-center">
              <View className="w-8 h-8 rounded-xl bg-craftopia-accent/10 items-center justify-center mr-2">
                <Lightbulb size={18} color="#E6B655" />
              </View>
              <View>
                <Text className="text-lg font-bold text-craftopia-textPrimary font-poppinsBold">
                  Craft Ideas for You
                </Text>
                <Text className="text-xs text-craftopia-textSecondary font-nunito">
                  {MOCK_CRAFT_IDEAS.length} suggestions based on your items
                </Text>
              </View>
            </View>
          </View>

          {/* Craft Cards */}
          <View className="space-y-3">
            {MOCK_CRAFT_IDEAS.map((craft) => (
              <TouchableOpacity
                key={craft.id}
                onPress={() => handleCraftPress(craft)}
                className="bg-craftopia-surface rounded-xl overflow-hidden border border-craftopia-light"
                activeOpacity={0.7}
              >
                {/* Craft Image */}
                <Image
                  source={{ uri: craft.image }}
                  className="w-full h-40"
                  resizeMode="cover"
                />

                {/* Craft Info */}
                <View className="p-3">
                  <View className="flex-row items-center justify-between mb-2">
                    <Text className="text-base font-bold text-craftopia-textPrimary flex-1 font-poppinsBold">
                      {craft.title}
                    </Text>
                    <ChevronRight size={18} color="#3B6E4D" />
                  </View>

                  <Text className="text-xs text-craftopia-textSecondary mb-3 font-nunito">
                    {craft.description}
                  </Text>

                  {/* Meta Info */}
                  <View className="flex-row items-center justify-between">
                    <View className="flex-row items-center gap-2">
                      <View className="flex-row items-center bg-craftopia-light px-2 py-1 rounded-lg">
                        <Clock size={12} color="#5F6F64" />
                        <Text className="text-xs text-craftopia-textSecondary ml-1 font-nunito">
                          {craft.time}
                        </Text>
                      </View>
                      <View className="flex-row items-center bg-craftopia-light px-2 py-1 rounded-lg">
                        <Text className={`text-xs font-semibold font-nunito ${getDifficultyColor(craft.difficulty)}`}>
                          {craft.difficulty}
                        </Text>
                      </View>
                    </View>

                    <Text className="text-xs text-craftopia-textSecondary font-nunito">
                      {craft.materials.length} materials
                    </Text>
                  </View>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Bottom Tips */}
        <View className="mx-4 mb-6">
          <View className="bg-craftopia-light rounded-xl p-4 border border-craftopia-accent/20">
            <View className="flex-row items-center mb-2">
              <Lightbulb size={16} color="#E6B655" />
              <Text className="text-sm font-semibold text-craftopia-textPrimary ml-2 font-poppinsBold">
                Pro Tips
              </Text>
            </View>
            <Text className="text-xs text-craftopia-textSecondary leading-5 font-nunito">
              • Clean and dry materials before crafting{'\n'}
              • Follow safety guidelines when using tools{'\n'}
              • Get creative - modify designs to your style{'\n'}
              • Share your creations with the community
            </Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};