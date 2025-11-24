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
  ImageIcon,
} from 'lucide-react-native';
import { CraftStackParamList } from '~/navigations/types';
import { LinearGradient } from 'expo-linear-gradient';

type RouteParams = RouteProp<CraftStackParamList, 'CraftResults'>;

interface CraftIdea {
  title: string;
  description: string;
  steps: string[];
  timeNeeded: string;
  quickTip: string;
  generatedImageUrl?: string; // NEW: AI-generated visualization
}

export const CraftResultsScreen = () => {
  const navigation = useNavigation<NativeStackNavigationProp<CraftStackParamList>>();
  const route = useRoute<RouteParams>();
  const { imageUri, detectedMaterials, craftIdeas } = route.params;

  const handleBack = () => navigation.navigate('Craft');

  const handleCraftPress = (craft: CraftIdea) => {
    navigation.navigate('CraftDetails', {
      craftTitle: craft.title,
      materials: detectedMaterials,
      steps: craft.steps,
      generatedImageUrl: craft.generatedImageUrl, // Pass the generated image
    });
  };

  const getDifficultyFromTime = (timeNeeded: string): string => {
    const minutes = parseInt(timeNeeded.match(/\d+/)?.[0] || '0');
    if (minutes <= 20) return 'Easy';
    if (minutes <= 35) return 'Medium';
    return 'Hard';
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
              {detectedMaterials.length} Materials Detected
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
            <LinearGradient
              colors={['transparent', 'rgba(31,42,31,0.5)']}
              className="absolute inset-0"
            />
            
            {/* Success Badge */}
            <View className="absolute bottom-3 left-3 bg-craftopia-success rounded-full px-3 py-1.5 flex-row items-center">
              <Sparkles size={14} color="#FFFFFF" />
              <Text className="text-xs font-semibold text-white ml-1 font-nunito">
                Successfully Scanned
              </Text>
            </View>
          </View>
        </View>

        {/* Detected Materials Section */}
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

          {/* Materials List */}
          <View className="space-y-2">
            {detectedMaterials.map((material: string, index: number) => {
              // Parse material string (e.g., "plastic water bottles (5)")
              const match = material.match(/^(.+?)\s*\((\d+)\)$/);
              const name = match ? match[1].trim() : material;
              const quantity = match ? match[2] : '1';
              
              // Determine category from material name
              let category = 'Recyclable';
              let categoryColor = { 
                bg: 'bg-craftopia-success/10', 
                text: 'text-craftopia-success', 
                border: 'border-craftopia-success/20' 
              };
              
              if (name.toLowerCase().includes('plastic')) {
                category = 'Plastic';
                categoryColor = { 
                  bg: 'bg-craftopia-info/10', 
                  text: 'text-craftopia-info', 
                  border: 'border-craftopia-info/20' 
                };
              } else if (name.toLowerCase().includes('paper') || name.toLowerCase().includes('cardboard')) {
                category = 'Paper';
                categoryColor = { 
                  bg: 'bg-craftopia-accent/10', 
                  text: 'text-craftopia-accent', 
                  border: 'border-craftopia-accent/20' 
                };
              } else if (name.toLowerCase().includes('glass')) {
                category = 'Glass';
                categoryColor = { 
                  bg: 'bg-craftopia-success/10', 
                  text: 'text-craftopia-success', 
                  border: 'border-craftopia-success/20' 
                };
              }

              return (
                <View
                  key={index}
                  className={`bg-craftopia-surface rounded-xl p-3 border ${categoryColor.border}`}
                >
                  <View className="flex-row items-center justify-between">
                    <View className="flex-1">
                      <View className="flex-row items-center mb-1">
                        <Text className="text-sm font-semibold text-craftopia-textPrimary font-poppinsBold capitalize">
                          {name}
                        </Text>
                        <View className="ml-2">
                          <CheckCircle size={14} color="#5BA776" />
                        </View>
                      </View>
                      <View className="flex-row items-center">
                        <View className={`px-2 py-0.5 rounded-lg ${categoryColor.bg}`}>
                          <Text className={`text-xs font-medium font-nunito ${categoryColor.text}`}>
                            {category}
                          </Text>
                        </View>
                        <Text className="text-xs text-craftopia-textSecondary ml-2 font-nunito">
                          Qty: {quantity}
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
                  {craftIdeas.length} AI-generated suggestions with visuals
                </Text>
              </View>
            </View>
          </View>

          {/* Craft Cards */}
          <View className="space-y-3">
            {craftIdeas.map((craft: CraftIdea, index: number) => {
              const difficulty = getDifficultyFromTime(craft.timeNeeded);
              
              return (
                <TouchableOpacity
                  key={index}
                  onPress={() => handleCraftPress(craft)}
                  className="bg-craftopia-surface rounded-xl overflow-hidden border border-craftopia-light"
                  activeOpacity={0.7}
                >
                  {/* NEW: Generated Image Preview */}
                  {craft.generatedImageUrl && (
                    <View className="relative">
                      <Image
                        source={{ uri: craft.generatedImageUrl }}
                        className="w-full h-40"
                        resizeMode="cover"
                      />
                      <LinearGradient
                        colors={['transparent', 'rgba(31,42,31,0.8)']}
                        className="absolute inset-0"
                      />
                      
                      {/* AI Generated Badge */}
                      <View className="absolute top-2 right-2 bg-craftopia-accent/90 backdrop-blur-sm rounded-full px-2.5 py-1 flex-row items-center">
                        <ImageIcon size={12} color="#FFFFFF" />
                        <Text className="text-xs font-semibold text-white ml-1 font-nunito">
                          AI Generated
                        </Text>
                      </View>

                      {/* Title Overlay */}
                      <View className="absolute bottom-0 left-0 right-0 p-3">
                        <Text className="text-lg font-bold text-white font-poppinsBold">
                          {craft.title}
                        </Text>
                      </View>
                    </View>
                  )}

                  {/* Craft Header (if no image) */}
                  {!craft.generatedImageUrl && (
                    <View className="bg-gradient-to-r from-craftopia-primary/5 to-craftopia-secondary/5 p-4">
                      <View className="flex-row items-center justify-between mb-2">
                        <Text className="text-lg font-bold text-craftopia-textPrimary flex-1 font-poppinsBold">
                          {craft.title}
                        </Text>
                        <ChevronRight size={20} color="#3B6E4D" />
                      </View>
                    </View>
                  )}

                  {/* Craft Details */}
                  <View className="p-4">
                    <Text className="text-sm text-craftopia-textSecondary mb-3 font-nunito leading-5">
                      {craft.description}
                    </Text>

                    {/* Meta Info */}
                    <View className="flex-row items-center justify-between">
                      <View className="flex-row items-center gap-2">
                        <View className="flex-row items-center bg-craftopia-light px-2.5 py-1.5 rounded-lg">
                          <Clock size={14} color="#5F6F64" />
                          <Text className="text-xs text-craftopia-textSecondary ml-1 font-nunito">
                            {craft.timeNeeded}
                          </Text>
                        </View>
                        <View className="flex-row items-center bg-craftopia-light px-2.5 py-1.5 rounded-lg">
                          <Text className={`text-xs font-semibold font-nunito ${getDifficultyColor(difficulty)}`}>
                            {difficulty}
                          </Text>
                        </View>
                      </View>

                      <View className="flex-row items-center bg-craftopia-accent/10 px-2.5 py-1.5 rounded-lg">
                        <Sparkles size={12} color="#E6B655" />
                        <Text className="text-xs text-craftopia-accent ml-1 font-nunito font-semibold">
                          {craft.steps.length} steps
                        </Text>
                      </View>
                    </View>
                  </View>

                  {/* Quick Tip Section */}
                  {craft.quickTip && (
                    <View className="px-4 py-3 bg-craftopia-accent/5 border-t border-craftopia-light">
                      <View className="flex-row items-start">
                        <Lightbulb size={14} color="#E6B655" className="mt-0.5 mr-2" />
                        <View className="flex-1">
                          <Text className="text-xs font-semibold text-craftopia-accent mb-0.5 font-nunito">
                            Quick Tip
                          </Text>
                          <Text className="text-xs text-craftopia-textSecondary font-nunito leading-4">
                            {craft.quickTip}
                          </Text>
                        </View>
                      </View>
                    </View>
                  )}
                </TouchableOpacity>
              );
            })}
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