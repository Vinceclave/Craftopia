// apps/mobile/src/screens/craft/CraftResults.tsx 

import React, { useState, useCallback, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Image, Modal, BackHandler } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute, RouteProp, useFocusEffect } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { ArrowLeft, Clock, Sparkles, ImageIcon, AlertCircle, X, Save } from 'lucide-react-native';
import { CraftIdea } from '~/services/craft.service';

type RootStackParamList = {
  CraftResults: {
    detectedMaterials: string[];
    craftIdeas: CraftIdea[];
    craftSavedState?: {
      index: number;
      isSaved: boolean;
      ideaId?: number;
    };
  };
  CraftDetails: {
    craftTitle: string;
    materials: string[];
    steps: string[];
    generatedImageUrl?: string;
    timeNeeded?: string;
    quickTip?: string;
    description?: string;
    difficulty?: string;
    toolsNeeded?: string[];
    uniqueFeature?: string;
    ideaId?: number;
    isSaved?: boolean;
    craftIndex?: number;
  };
};

type CraftResultsNavigationProp = NativeStackNavigationProp<RootStackParamList, 'CraftResults'>;
type CraftResultsRouteProp = RouteProp<RootStackParamList, 'CraftResults'>;

export const CraftResultsScreen = () => {
  const navigation = useNavigation<CraftResultsNavigationProp>();
  const route = useRoute<CraftResultsRouteProp>();
  const { detectedMaterials, craftIdeas, craftSavedState } = route.params;

  const [showExitModal, setShowExitModal] = useState(false);

  // ✅ Track saved state for each craft idea locally
  const [craftSavedStates, setCraftSavedStates] = useState<Record<number, { isSaved: boolean; ideaId?: number }>>(() => {
    const initialStates: Record<number, { isSaved: boolean; ideaId?: number }> = {};
    craftIdeas.forEach((idea, index) => {
      initialStates[index] = {
        isSaved: idea.is_saved || false,
        ideaId: idea.idea_id
      };
    });
    return initialStates;
  });

  // ✅ Update saved state when returning from CraftDetails
  useEffect(() => {
    if (craftSavedState) {
      setCraftSavedStates(prev => ({
        ...prev,
        [craftSavedState.index]: {
          isSaved: craftSavedState.isSaved,
          ideaId: craftSavedState.ideaId
        }
      }));
    }
  }, [craftSavedState]);

  // ✅ Check if any crafts have been saved
  const hasSavedCrafts = Object.values(craftSavedStates).some(state => state.isSaved);
  const savedCount = Object.values(craftSavedStates).filter(state => state.isSaved).length;

  // ✅ Handle hardware back button
  useFocusEffect(
    useCallback(() => {
      const onBackPress = () => {
        if (!hasSavedCrafts) {
          setShowExitModal(true);
          return true;
        }
        return false;
      };

      const subscription = BackHandler.addEventListener('hardwareBackPress', onBackPress);

      return () => subscription.remove();
    }, [hasSavedCrafts])
  );

  const handleBack = () => {
    if (!hasSavedCrafts) {
      setShowExitModal(true);
    } else {
      navigation.goBack();
    }
  };

  const handleExitConfirm = () => {
    setShowExitModal(false);
    navigation.goBack();
  };

  const handleExitCancel = () => {
    setShowExitModal(false);
  };

  const handleCraftPress = (craft: CraftIdea, index: number) => {
    // ✅ Get the current saved state from our local tracking
    const currentState = craftSavedStates[index] || { isSaved: craft.is_saved || false, ideaId: craft.idea_id };

    navigation.navigate('CraftDetails', {
      craftTitle: craft.title,
      materials: detectedMaterials,
      steps: craft.steps,
      generatedImageUrl: craft.generatedImageUrl,
      timeNeeded: craft.timeNeeded,
      quickTip: craft.quickTip,
      description: craft.description,
      difficulty: craft.difficulty, // ✅ Pass difficulty
      toolsNeeded: craft.toolsNeeded, // ✅ Pass tools
      uniqueFeature: craft.uniqueFeature, // ✅ Pass unique feature
      ideaId: currentState.ideaId,
      isSaved: currentState.isSaved,
      craftIndex: index, // ✅ Pass index to track which craft this is
    });
  };

  return (
    <SafeAreaView edges={["left", "right", "bottom"]} className="flex-1 bg-[#F8FBF8]">
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

          {/* Save indicator */}
          {hasSavedCrafts ? (
            <View className="flex-row items-center bg-[#3B6E4D]/10 px-3 py-1.5 rounded-lg border border-[#3B6E4D]/20">
              <Save size={14} color="#3B6E4D" fill="#3B6E4D" />
              <Text className="text-xs text-[#3B6E4D] ml-1 font-nunito font-semibold">
                {savedCount} Saved
              </Text>
            </View>
          ) : (
            <View className="flex-row items-center bg-[#FFF9E6] px-3 py-1.5 rounded-lg border border-[#FFE8A3]">
              <AlertCircle size={14} color="#F59E0B" />
              <Text className="text-xs text-[#92400E] ml-1 font-nunito font-semibold">
                Not Saved
              </Text>
            </View>
          )}
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

        {craftIdeas.map((craft, index) => {
          // ✅ Get current saved state for this craft
          const craftState = craftSavedStates[index] || { isSaved: craft.is_saved || false, ideaId: craft.idea_id };
          const isCraftSaved = craftState.isSaved;

          return (
            <TouchableOpacity
              key={index}
              onPress={() => handleCraftPress(craft, index)}
              className="bg-white rounded-2xl mb-4 overflow-hidden border border-[#E8ECEB]"
              activeOpacity={0.7}
            >
              {/* AI-generated image */}
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

                  {/* ✅ Saved Badge - Shows if this specific craft is saved */}
                  {isCraftSaved && (
                    <View className="absolute top-3 left-3 bg-[#5BA776]/90 px-3 py-1.5 rounded-lg flex-row items-center">
                      <Save size={12} color="#FFFFFF" fill="#FFFFFF" />
                      <Text className="text-xs text-white ml-1 font-nunito font-semibold">
                        Saved
                      </Text>
                    </View>
                  )}
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
                <View className="flex-row items-start justify-between mb-2">
                  <Text className="text-lg font-bold text-[#1F2A1F] font-poppinsBold flex-1">
                    {craft.title}
                  </Text>

                  {/* ✅ Save status indicator */}
                  {isCraftSaved && (
                    <View className="ml-2 bg-[#5BA776]/10 px-2 py-1 rounded-lg">
                      <Text className="text-xs text-[#5BA776] font-nunito font-semibold">
                        ✓ Saved
                      </Text>
                    </View>
                  )}
                </View>

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

                  <View className="flex-row items-center gap-2">
                    {craft.difficulty && (
                      <Text className="text-xs text-[#5F6F64] font-nunito">
                        {craft.difficulty}
                      </Text>
                    )}
                    <Text className="text-xs text-[#3B6E4D] font-nunito font-semibold">
                      {craft.steps.length} steps
                    </Text>
                  </View>
                </View>
              </View>
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      {/* Exit Confirmation Modal */}
      <Modal
        visible={showExitModal}
        transparent
        animationType="fade"
        onRequestClose={handleExitCancel}
      >
        <View className="flex-1 bg-black/60 items-center justify-center px-4">
          <View
            className="bg-white rounded-3xl p-6 w-full max-w-sm border-2 border-[#E8ECEB]"
            style={{
              shadowColor: '#000',
              shadowOffset: { width: 0, height: 8 },
              shadowOpacity: 0.3,
              shadowRadius: 16,
            }}
          >
            {/* Close Button */}
            <TouchableOpacity
              onPress={handleExitCancel}
              className="absolute top-4 right-4 w-8 h-8 rounded-full bg-[#F0F4F2] items-center justify-center"
            >
              <X size={16} color="#5F6F64" />
            </TouchableOpacity>

            {/* Icon */}
            <View className="items-center mb-4">
              <View className="w-16 h-16 rounded-full bg-[#FFF9E6] items-center justify-center mb-3 border-2 border-[#FFE8A3]">
                <AlertCircle size={32} color="#F59E0B" />
              </View>
              <Text className="text-xl font-poppinsBold text-[#1F2A1F] text-center">
                Save Your Crafts?
              </Text>
            </View>

            {/* Message */}
            <Text className="text-base font-nunito text-[#5F6F64] text-center mb-6 leading-6">
              You haven't saved any craft ideas yet. These AI-generated ideas will be lost if you go back.
            </Text>

            {/* Stats */}
            <View className="bg-[#F0F4F2] rounded-xl p-3 mb-6">
              <View className="flex-row items-center justify-center gap-2">
                <Sparkles size={16} color="#3B6E4D" />
                <Text className="text-sm font-nunito text-[#1F2A1F]">
                  <Text className="font-bold">{craftIdeas.length}</Text> craft {craftIdeas.length === 1 ? 'idea' : 'ideas'} generated
                </Text>
              </View>
            </View>

            {/* Buttons */}
            <View className="gap-3">
              <TouchableOpacity
                onPress={handleExitCancel}
                className="bg-[#3B6E4D] rounded-2xl py-4 items-center"
                activeOpacity={0.8}
              >
                <Text className="text-base font-poppinsBold text-white">
                  Stay & Save Crafts
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={handleExitConfirm}
                className="bg-[#F0F4F2] rounded-2xl py-4 items-center"
                activeOpacity={0.8}
              >
                <Text className="text-base font-poppinsBold text-[#5F6F64]">
                  Exit Without Saving
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};