// apps/mobile/src/screens/craft/CraftResults.tsx

import React, { useState, useCallback, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Image, Modal, BackHandler, StatusBar } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute, RouteProp, useFocusEffect } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { ArrowLeft, Clock, Sparkles, ImageIcon, AlertCircle, X, Save, BarChart3, CheckCircle2 } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
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

// --- Components ---

const Header = ({ onBack, savedCount, hasSavedCrafts, detectedMaterials }: any) => (
  <View className="px-6 pt-2 pb-6 bg-white border-b border-gray-100 rounded-b-[32px] shadow-sm z-20">
    <View className="flex-row items-center justify-between mb-4">
      <TouchableOpacity
        onPress={onBack}
        className="w-10 h-10 rounded-full bg-slate-50 items-center justify-center border border-slate-100"
      >
        <ArrowLeft size={20} color="#3B6E4D" />
      </TouchableOpacity>

      {hasSavedCrafts ? (
        <View className="flex-row items-center bg-green-50 px-3 py-1.5 rounded-full border border-green-100">
          <CheckCircle2 size={14} color="#16A34A" />
          <Text className="text-xs text-green-700 ml-1.5 font-bold font-nunito">
            {savedCount} Saved
          </Text>
        </View>
      ) : (
        <View className="flex-row items-center bg-amber-50 px-3 py-1.5 rounded-full border border-amber-100">
          <AlertCircle size={14} color="#D97706" />
          <Text className="text-xs text-amber-700 ml-1.5 font-bold font-nunito">
            Not Saved
          </Text>
        </View>
      )}
    </View>

    <Text className="text-2xl font-poppinsBold text-craftopia-textPrimary mb-1">
      Craft Ideas
    </Text>
    <Text className="text-craftopia-textSecondary font-nunito text-sm mb-4">
      Found {detectedMaterials.length} materials to work with
    </Text>

    <View className="flex-row flex-wrap gap-2">
      {detectedMaterials.map((material: string, index: number) => (
        <View key={index} className="bg-craftopia-primary/10 px-3 py-1.5 rounded-lg border border-craftopia-primary/20">
          <Text className="text-xs text-craftopia-primary font-bold font-nunito uppercase">{material}</Text>
        </View>
      ))}
    </View>
  </View>
);

const CraftCard = ({ craft, index, isSaved, onPress }: { craft: CraftIdea; index: number; isSaved: boolean; onPress: () => void }) => {
  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.9}
      className="bg-white rounded-[24px] mb-5 shadow-sm border border-slate-100 overflow-hidden"
    >
      {/* Image Area */}
      <View className="h-48 w-full bg-slate-100 relative">
        {craft.generatedImageUrl ? (
          <Image
            source={{ uri: craft.generatedImageUrl }}
            className="w-full h-full"
            resizeMode="cover"
          />
        ) : (
          <View className="w-full h-full items-center justify-center bg-slate-50">
            <ImageIcon size={32} color="#94A3B8" />
          </View>
        )}

        <LinearGradient
          colors={['rgba(0,0,0,0.4)', 'transparent']}
          className="absolute inset-0 h-20"
        />

        {/* Badges */}
        <View className="absolute top-3 right-3 flex-row gap-2">
          {isSaved && (
            <View className="bg-white/90 backdrop-blur-md px-2.5 py-1.5 rounded-lg flex-row items-center shadow-sm">
              <CheckCircle2 size={12} color="#16A34A" />
              <Text className="text-[10px] text-green-700 font-bold ml-1 uppercase">Saved</Text>
            </View>
          )}
          <View className="bg-black/40 backdrop-blur-md px-2.5 py-1.5 rounded-lg flex-row items-center">
            <Sparkles size={12} color="#FFF" />
            <Text className="text-[10px] text-white font-bold ml-1 uppercase">AI Generated</Text>
          </View>
        </View>

        {craft.difficulty && (
          <View className="absolute bottom-3 left-3 bg-white/90 backdrop-blur-md px-2.5 py-1.5 rounded-lg shadow-sm">
            <Text className="text-[10px] text-craftopia-textPrimary font-bold uppercase">{craft.difficulty}</Text>
          </View>
        )}
      </View>

      {/* Content Area */}
      <View className="p-5">
        <Text className="text-lg font-poppinsBold text-craftopia-textPrimary mb-2 leading-6">
          {craft.title}
        </Text>

        <Text numberOfLines={2} className="text-sm text-craftopia-textSecondary font-nunito leading-5 mb-4">
          {craft.description}
        </Text>

        <View className="flex-row items-center justify-between pt-4 border-t border-slate-50">
          {craft.timeNeeded && (
            <View className="flex-row items-center">
              <Clock size={14} color="#64748B" />
              <Text className="text-xs text-slate-500 font-nunito ml-1.5 font-semibold">
                {craft.timeNeeded}
              </Text>
            </View>
          )}

          <Text className="text-xs text-craftopia-primary font-bold font-nunito bg-green-50 px-2 py-1 rounded-md">
            {craft.steps.length} Steps
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );
};

// --- Main Screen ---

export const CraftResultsScreen = () => {
  const navigation = useNavigation<CraftResultsNavigationProp>();
  const route = useRoute<CraftResultsRouteProp>();
  const { detectedMaterials, craftIdeas, craftSavedState } = route.params;

  const [showExitModal, setShowExitModal] = useState(false);

  // Track saved state locally
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

  // Update when returning from details
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

  const hasSavedCrafts = Object.values(craftSavedStates).some(state => state.isSaved);
  const savedCount = Object.values(craftSavedStates).filter(state => state.isSaved).length;

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

  const handleCraftPress = (craft: CraftIdea, index: number) => {
    const currentState = craftSavedStates[index] || { isSaved: craft.is_saved || false, ideaId: craft.idea_id };

    navigation.navigate('CraftDetails', {
      craftTitle: craft.title,
      materials: detectedMaterials,
      steps: craft.steps,
      generatedImageUrl: craft.generatedImageUrl,
      timeNeeded: craft.timeNeeded,
      quickTip: craft.quickTip,
      description: craft.description,
      difficulty: craft.difficulty,
      toolsNeeded: craft.toolsNeeded,
      uniqueFeature: craft.uniqueFeature,
      ideaId: currentState.ideaId,
      isSaved: currentState.isSaved,
      craftIndex: index,
    });
  };

  return (
    <View className="flex-1 bg-craftopia-background">
      <StatusBar barStyle="dark-content" backgroundColor="#FFF" />
      <SafeAreaView edges={['top']} className="flex-0 bg-white" />
      <SafeAreaView edges={['left', 'right', 'bottom']} className="flex-1">

        <Header
          onBack={handleBack}
          hasSavedCrafts={hasSavedCrafts}
          savedCount={savedCount}
          detectedMaterials={detectedMaterials}
        />

        <ScrollView
          className="flex-1"
          contentContainerStyle={{ padding: 24, paddingBottom: 100 }}
          showsVerticalScrollIndicator={false}
        >
          {craftIdeas.map((craft, index) => {
            const isSaved = craftSavedStates[index]?.isSaved || false;
            return (
              <CraftCard
                key={index}
                craft={craft}
                index={index}
                isSaved={isSaved}
                onPress={() => handleCraftPress(craft, index)}
              />
            );
          })}
        </ScrollView>
      </SafeAreaView>

      {/* Exit Modal */}
      <Modal
        visible={showExitModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowExitModal(false)}
      >
        <View className="flex-1 bg-black/60 items-center justify-center px-6">
          <View className="bg-white rounded-3xl p-6 w-full max-w-sm shadow-2xl">
            <View className="w-14 h-14 rounded-full bg-amber-100 items-center justify-center mb-4 self-center">
              <AlertCircle size={28} color="#D97706" />
            </View>

            <Text className="text-xl font-poppinsBold text-craftopia-textPrimary text-center mb-2">
              Unsaved Ideas
            </Text>
            <Text className="text-base text-craftopia-textSecondary text-center font-nunito leading-6 mb-6">
              You haven't saved any of these generated ideas. They will be lost if you leave now.
            </Text>

            <TouchableOpacity
              onPress={() => setShowExitModal(false)}
              className="bg-craftopia-primary w-full py-4 rounded-xl items-center mb-3 shadow-lg shadow-green-900/20"
            >
              <Text className="text-white font-poppinsBold text-base">Keep Exploring</Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => {
                setShowExitModal(false);
                navigation.goBack();
              }}
              className="py-3 items-center"
            >
              <Text className="text-slate-400 font-bold font-nunito">Discard & Exit</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
};

export default CraftResultsScreen;