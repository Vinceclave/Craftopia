// apps/mobile/src/screens/craft/CraftResults.tsx - UPDATED NAVIGATION SECTION

import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, Image, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { ArrowLeft, Clock, Sparkles, ImageIcon } from 'lucide-react-native';
import { CraftIdea } from '~/services/craft.service';

type RootStackParamList = {
  CraftResults: {
    detectedMaterials: string[];
    craftIdeas: CraftIdea[];
  };
  CraftDetails: {
    craftTitle: string;
    materials: string[];
    steps: string[];
    generatedImageUrl?: string;
    timeNeeded?: string;
    quickTip?: string;
    description?: string;
    ideaId?: number;        // ✅ Database ID (if saved)
    isSaved?: boolean;      // ✅ Save status
  };
};

type CraftResultsNavigationProp = NativeStackNavigationProp<RootStackParamList, 'CraftResults'>;
type CraftResultsRouteProp = RouteProp<RootStackParamList, 'CraftResults'>;

export const CraftResultsScreen = () => {
  const navigation = useNavigation<CraftResultsNavigationProp>();
  const route = useRoute<CraftResultsRouteProp>();
  const { detectedMaterials, craftIdeas } = route.params;

  const handleBack = () => {
    navigation.goBack();
  };

  // ✅ Updated to pass all necessary data including ideaId and isSaved
  const handleCraftPress = (craft: CraftIdea) => {
    navigation.navigate('CraftDetails', {
      craftTitle: craft.title,
      materials: detectedMaterials,
      steps: craft.steps,
      generatedImageUrl: craft.generatedImageUrl,  // Base64 or S3 URL
      timeNeeded: craft.timeNeeded,
      quickTip: craft.quickTip,
      description: craft.description,
      ideaId: craft.idea_id,        // ✅ Pass database ID (undefined if not saved yet)
      isSaved: craft.is_saved,      // ✅ Pass save status (undefined if not saved yet)
    });
  };

  return (
    <SafeAreaView className="flex-1 bg-[#F8FBF8]">
      {/* Header */}
      <View className="px-4 pt-4 pb-3 bg-white border-b border-[#E8ECEB]">
        <View className="flex-row items-center justify-between">
          <View className="flex-row items-center flex-1">
            <TouchableOpacity 
              onPress={handleBack}
              className="w-9 h-9 rounded-full bg-[#F0F4F2] items-center justify-center mr-3"
            >
              <ArrowLeft size={18} color="#3B6E4D" />
            </TouchableOpacity>
            <Text className="text-lg font-bold text-[#1F2A1F] font-poppinsBold">
              Craft Ideas
            </Text>
          </View>
        </View>

        {/* Materials Preview */}
        <View className="mt-3">
          <Text className="text-xs text-[#5F6F64] mb-2 font-nunito">Materials detected:</Text>
          <View className="flex-row flex-wrap gap-2">
            {detectedMaterials.map((material, index) => (
              <View 
                key={index} 
                className="bg-[#3B6E4D]/10 px-3 py-1.5 rounded-lg"
              >
                <Text className="text-xs text-[#3B6E4D] font-nunito font-semibold">
                  {material}
                </Text>
              </View>
            ))}
          </View>
        </View>
      </View>

      {/* Craft Ideas List */}
      <ScrollView className="flex-1 px-4 py-4">
        <Text className="text-sm text-[#5F6F64] mb-4 font-nunito">
          We found {craftIdeas.length} creative {craftIdeas.length === 1 ? 'idea' : 'ideas'} for you
        </Text>

        {craftIdeas.map((craft, index) => (
          <TouchableOpacity
            key={index}
            onPress={() => handleCraftPress(craft)}
            className="bg-white rounded-2xl mb-4 overflow-hidden border border-[#E8ECEB]"
            activeOpacity={0.7}
          >
            {/* ✅ Display AI-generated image (base64 or S3 URL) */}
            {craft.generatedImageUrl ? (
              <View className="relative">
                <Image
                  source={{ uri: craft.generatedImageUrl }}
                  className="w-full h-48"
                  resizeMode="cover"
                />
                {/* AI Generated Badge */}
                <View className="absolute top-3 right-3 bg-[#3B6E4D]/90 px-3 py-1.5 rounded-lg flex-row items-center">
                  <Sparkles size={12} color="#FFFFFF" />
                  <Text className="text-xs text-white ml-1 font-nunito font-semibold">
                    AI Generated
                  </Text>
                </View>
              </View>
            ) : (
              <View className="w-full h-48 bg-[#F0F4F2] items-center justify-center">
                <ImageIcon size={40} color="#5F6F64" />
                <Text className="text-xs text-[#5F6F64] mt-2 font-nunito">
                  No image available
                </Text>
              </View>
            )}

            {/* Craft Info */}
            <View className="p-4">
              <Text className="text-lg font-bold text-[#1F2A1F] mb-2 font-poppinsBold">
                {craft.title}
              </Text>
              
              <Text 
                className="text-sm text-[#5F6F64] mb-3 font-nunito" 
                numberOfLines={2}
              >
                {craft.description}
              </Text>

              <View className="flex-row items-center justify-between">
                {craft.timeNeeded && (
                  <View className="flex-row items-center bg-[#F0F4F2] px-3 py-1.5 rounded-lg">
                    <Clock size={14} color="#5F6F64" />
                    <Text className="text-xs text-[#5F6F64] ml-1 font-nunito">
                      {craft.timeNeeded}
                    </Text>
                  </View>
                )}
                
                <Text className="text-xs text-[#3B6E4D] font-nunito font-semibold">
                  {craft.steps.length} steps
                </Text>
              </View>
            </View>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
};