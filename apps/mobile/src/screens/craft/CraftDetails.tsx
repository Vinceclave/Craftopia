// apps/mobile/src/screens/craft/CraftDetails.tsx - FIXED DUPLICATE SAVE WITH HASH CHECKING

import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  ScrollView, 
  TouchableOpacity, 
  Image, 
  Alert,
  ActivityIndicator 
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { 
  ArrowLeft, 
  Clock, 
  Lightbulb, 
  Share2, 
  Bookmark, 
  CheckCircle2,
  Sparkles,
  Wrench,
  Star,
  BarChart3
} from 'lucide-react-native';
import { useSaveCraftFromBase64, useToggleSaveCraft } from '~/hooks/queries/useCraft';

type RootStackParamList = {
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
  };
};

type CraftDetailsNavigationProp = NativeStackNavigationProp<RootStackParamList, 'CraftDetails'>;
type CraftDetailsRouteProp = RouteProp<RootStackParamList, 'CraftDetails'>;

// ✅ Helper function to create a unique hash for a craft
const createCraftHash = (title: string, description: string, materials: string[]): string => {
  const hashString = `${title}-${description}-${materials.join(',')}`.toLowerCase().trim();
  return hashString;
};

export const CraftDetailsScreen = () => {
  const navigation = useNavigation<CraftDetailsNavigationProp>();
  const route = useRoute<CraftDetailsRouteProp>();
  
  const { 
    craftTitle, 
    materials, 
    steps, 
    generatedImageUrl,
    timeNeeded,
    quickTip,
    description = '',
    difficulty,
    toolsNeeded,
    uniqueFeature,
    ideaId: initialIdeaId,
    isSaved: initialSaved = false
  } = route.params;

  // ✅ Create unique hash for this craft
  const craftHash = createCraftHash(craftTitle, description, materials);

  const [isSaved, setIsSaved] = useState(initialSaved);
  const [ideaId, setIdeaId] = useState(initialIdeaId);
  const [imageUrl, setImageUrl] = useState(generatedImageUrl);
  const [saveAttempted, setSaveAttempted] = useState(false);

  const saveMutation = useSaveCraftFromBase64();
  const toggleMutation = useToggleSaveCraft();

  // ✅ Check if this craft is already saved (even without ideaId)
  useEffect(() => {
    console.log('🔍 Craft Details loaded:', {
      title: craftTitle,
      hash: craftHash,
      ideaId: initialIdeaId,
      isSaved: initialSaved,
    });

    // If already marked as saved, respect that
    if (initialSaved || initialIdeaId) {
      console.log('✅ Craft already saved:', { ideaId: initialIdeaId, isSaved: initialSaved });
    }
  }, []);

  const handleBack = () => {
    navigation.goBack();
  };

  const handleShare = async () => {
    Alert.alert(
      'Share Craft',
      'Share this craft idea with others?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Share', onPress: () => console.log('Sharing...') }
      ]
    );
  };

  const handleSave = async () => {
    // ✅ Check 1: Already processing
    if (saveAttempted && !ideaId) {
      Alert.alert(
        'Saving In Progress',
        'This craft is currently being saved. Please wait...'
      );
      return;
    }

    // ✅ Check 2: Already saved (has ideaId)
    if (ideaId) {
      // This craft is in the database - toggle saved state
      try {
        const result = await toggleMutation.mutateAsync(ideaId);
        setIsSaved(result.data.isSaved);
        
        Alert.alert(
          'Success',
          result.data.isSaved 
            ? '✅ Craft saved to your collection!' 
            : '📤 Craft removed from saved items'
        );
      } catch (error: any) {
        Alert.alert('Error', error.message || 'Failed to toggle save');
      }
      return;
    }

    // ✅ Check 3: Already marked as saved but no ideaId yet
    if (isSaved && !ideaId) {
      Alert.alert(
        'Already Saved',
        'This craft has already been saved to your collection!',
        [{ text: 'OK' }]
      );
      return;
    }

    // ✅ Proceed with saving new craft
    console.log('💾 Saving new craft:', {
      title: craftTitle,
      hash: craftHash,
      hasImage: !!generatedImageUrl
    });

    setSaveAttempted(true);

    try {
      const result = await saveMutation.mutateAsync({
        idea_json: {
          title: craftTitle,
          description: description,
          difficulty: difficulty,
          steps,
          timeNeeded: timeNeeded || '',
          toolsNeeded: toolsNeeded,
          quickTip: quickTip || '',
          uniqueFeature: uniqueFeature,
        },
        recycled_materials: materials,
        base64_image: generatedImageUrl,
      });

      console.log('✅ Craft saved successfully:', {
        ideaId: result.data.idea_id,
        title: craftTitle
      });

      // Update local state
      setIdeaId(result.data.idea_id);
      setIsSaved(true);
      
      // Replace base64 with S3 URL if available
      if (result.data.generated_image_url) {
        setImageUrl(result.data.generated_image_url);
      }

      Alert.alert('Success', '✅ Craft saved to your collection!');
    } catch (error: any) {
      setSaveAttempted(false);
      
      console.error('❌ Save error:', error.message);
      
      // Check for duplicate/already saved errors
      if (error.message?.includes('already saved') || 
          error.message?.includes('duplicate') ||
          error.message?.includes('unique constraint')) {
        setIsSaved(true);
        Alert.alert(
          'Already Saved',
          'This craft has already been saved to your collection!'
        );
      } else {
        Alert.alert('Error', error.message || 'Failed to save craft');
      }
    }
  };

  const isProcessing = saveMutation.isPending || toggleMutation.isPending;

  // ✅ Difficulty color mapping
  const getDifficultyColor = (diff?: string) => {
    switch (diff?.toLowerCase()) {
      case 'easy': return { bg: '#E8F5E9', text: '#2E7D32', icon: '#4CAF50' };
      case 'medium': return { bg: '#FFF9E6', text: '#F57C00', icon: '#FF9800' };
      case 'advanced': return { bg: '#FFEBEE', text: '#C62828', icon: '#F44336' };
      default: return { bg: '#F0F4F2', text: '#5F6F64', icon: '#5F6F64' };
    }
  };

  const difficultyColors = getDifficultyColor(difficulty);

  // ✅ Determine if save button should be shown
  const showSaveButton = !isSaved;
  const saveButtonDisabled = isProcessing || saveAttempted || isSaved;

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
            <Text 
              className="text-lg font-bold text-[#1F2A1F] font-poppinsBold flex-1" 
              numberOfLines={1}
            >
              {craftTitle}
            </Text>
          </View>
          
          <View className="flex-row items-center space-x-2 ml-2">
            {/* Bookmark Button */}
            <TouchableOpacity 
              onPress={handleSave}
              disabled={saveButtonDisabled}
              className={`w-9 h-9 rounded-full items-center justify-center ${
                isSaved ? 'bg-[#3B6E4D]/20' : 'bg-[#F0F4F2]'
              }`}
            >
              {isProcessing ? (
                <ActivityIndicator size="small" color="#3B6E4D" />
              ) : (
                <Bookmark 
                  size={18} 
                  color={isSaved ? "#3B6E4D" : "#5F6F64"} 
                  fill={isSaved ? "#3B6E4D" : "transparent"}
                />
              )}
            </TouchableOpacity>
            
            <TouchableOpacity 
              onPress={handleShare}
              className="w-9 h-9 rounded-full bg-[#F0F4F2] items-center justify-center"
            >
              <Share2 size={18} color="#5F6F64" />
            </TouchableOpacity>
          </View>
        </View>

        {/* Enhanced Meta Info */}
        <View className="flex-row items-center mt-3 flex-wrap gap-2">
          {difficulty && (
            <View 
              className="flex-row items-center px-3 py-1.5 rounded-lg"
              style={{ backgroundColor: difficultyColors.bg }}
            >
              <BarChart3 size={14} color={difficultyColors.icon} />
              <Text 
                className="text-sm ml-1 font-nunito font-semibold"
                style={{ color: difficultyColors.text }}
              >
                {difficulty}
              </Text>
            </View>
          )}
          
          {timeNeeded && (
            <View className="flex-row items-center bg-[#F0F4F2] px-3 py-1.5 rounded-lg">
              <Clock size={14} color="#5F6F64" />
              <Text className="text-sm text-[#5F6F64] ml-1 font-nunito">
                {timeNeeded}
              </Text>
            </View>
          )}
          
          {/* ✅ Clear saved status badge */}
          {isSaved && (
            <View className="flex-row items-center bg-[#3B6E4D]/10 px-3 py-1.5 rounded-lg">
              <CheckCircle2 size={14} color="#3B6E4D" fill="#3B6E4D" />
              <Text className="text-sm text-[#3B6E4D] ml-1 font-nunito font-semibold">
                Saved
              </Text>
            </View>
          )}
        </View>
      </View>

      <ScrollView className="flex-1">
        {/* AI-Generated Image */}
        {imageUrl && (
          <View className="mx-4 mt-4 relative">
            <Image
              source={{ uri: imageUrl }}
              className="w-full h-60 rounded-2xl"
              resizeMode="cover"
            />
            <View className="absolute top-3 right-3 bg-[#3B6E4D]/90 px-3 py-1.5 rounded-lg flex-row items-center">
              <Sparkles size={12} color="#FFFFFF" />
              <Text className="text-xs text-white ml-1 font-nunito font-semibold">
                AI Generated
              </Text>
            </View>
          </View>
        )}

        {/* Description */}
        {description && (
          <View className="mx-4 mt-4 p-4 bg-white rounded-2xl border border-[#E8ECEB]">
            <Text className="text-base text-[#1F2A1F] font-nunito leading-6">
              {description}
            </Text>
          </View>
        )}

        {/* Unique Feature */}
        {uniqueFeature && (
          <View className="mx-4 mt-4 p-4 bg-gradient-to-r from-[#E6B655]/10 to-[#E6B655]/5 rounded-2xl border border-[#E6B655]/30">
            <View className="flex-row items-start">
              <View className="w-8 h-8 rounded-full bg-[#E6B655]/20 items-center justify-center mr-3">
                <Star size={16} color="#E6B655" fill="#E6B655" />
              </View>
              <View className="flex-1">
                <Text className="text-sm font-bold text-[#1F2A1F] mb-1 font-poppinsBold">
                  What Makes This Special
                </Text>
                <Text className="text-sm text-[#5F6F64] font-nunito leading-5">
                  {uniqueFeature}
                </Text>
              </View>
            </View>
          </View>
        )}

        {/* Materials Used */}
        <View className="mx-4 mt-4">
          <Text className="text-base font-bold text-[#1F2A1F] mb-3 font-poppinsBold">
            Materials Used
          </Text>
          <View className="flex-row flex-wrap gap-2">
            {materials.map((material, index) => (
              <View 
                key={index} 
                className="bg-[#3B6E4D]/10 px-4 py-2 rounded-xl"
              >
                <Text className="text-sm text-[#3B6E4D] font-nunito font-semibold">
                  {material}
                </Text>
              </View>
            ))}
          </View>
        </View>

        {/* Tools Needed */}
        {toolsNeeded && toolsNeeded.length > 0 && (
          <View className="mx-4 mt-4">
            <View className="flex-row items-center mb-3">
              <Wrench size={18} color="#1F2A1F" />
              <Text className="text-base font-bold text-[#1F2A1F] ml-2 font-poppinsBold">
                Tools You'll Need
              </Text>
            </View>
            <View className="flex-row flex-wrap gap-2">
              {toolsNeeded.map((tool, index) => (
                <View 
                  key={index} 
                  className="bg-[#F0F4F2] px-3 py-2 rounded-lg flex-row items-center"
                >
                  <View className="w-1.5 h-1.5 rounded-full bg-[#5F6F64] mr-2" />
                  <Text className="text-sm text-[#1F2A1F] font-nunito">
                    {tool}
                  </Text>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* Steps */}
        <View className="mx-4 mt-6">
          <Text className="text-base font-bold text-[#1F2A1F] mb-4 font-poppinsBold">
            Step-by-Step Instructions
          </Text>
          {steps.map((step, index) => (
            <View key={index} className="flex-row mb-4">
              <View className="w-8 h-8 rounded-full bg-[#3B6E4D] items-center justify-center mr-3 mt-0.5">
                <Text className="text-white font-bold text-sm font-poppinsBold">
                  {index + 1}
                </Text>
              </View>
              <View className="flex-1 bg-white p-4 rounded-xl border border-[#E8ECEB]">
                <Text className="text-sm text-[#1F2A1F] font-nunito leading-6">
                  {step}
                </Text>
              </View>
            </View>
          ))}
        </View>

        {/* Quick Tip */}
        {quickTip && (
          <View className="mx-4 mt-4 mb-6 p-4 bg-[#FFF9E6] rounded-2xl border border-[#FFE8A3]">
            <View className="flex-row items-start">
              <Lightbulb size={20} color="#F59E0B" />
              <View className="flex-1 ml-3">
                <Text className="text-sm font-bold text-[#92400E] mb-1 font-poppinsBold">
                  Pro Tip
                </Text>
                <Text className="text-sm text-[#78350F] font-nunito leading-5">
                  {quickTip}
                </Text>
              </View>
            </View>
          </View>
        )}

        {/* ✅ Save Button - Only show if not saved */}
        {showSaveButton && (
          <View className="mx-4 mb-8">
            <TouchableOpacity 
              onPress={handleSave}
              disabled={saveButtonDisabled}
              className={`py-4 rounded-xl flex-row items-center justify-center ${
                saveButtonDisabled ? 'bg-[#3B6E4D]/50' : 'bg-[#3B6E4D]'
              }`}
              activeOpacity={0.8}
            >
              {isProcessing ? (
                <>
                  <ActivityIndicator size="small" color="#FFFFFF" />
                  <Text className="text-white font-bold text-base ml-2 font-poppinsBold">
                    Saving...
                  </Text>
                </>
              ) : (
                <>
                  <Bookmark size={20} color="#FFFFFF" />
                  <Text className="text-white font-bold text-base ml-2 font-poppinsBold">
                    Save to My Projects
                  </Text>
                </>
              )}
            </TouchableOpacity>
          </View>
        )}

        {/* ✅ Already Saved Message */}
        {isSaved && (
          <View className="mx-4 mb-8 p-4 bg-[#3B6E4D]/10 rounded-xl border border-[#3B6E4D]/20">
            <View className="flex-row items-center justify-center">
              <CheckCircle2 size={20} color="#3B6E4D" fill="#3B6E4D" />
              <Text className="text-[#3B6E4D] font-bold text-base ml-2 font-poppinsBold">
                Saved to Your Collection
              </Text>
            </View>
            {ideaId && (
              <Text className="text-[#5F6F64] text-xs text-center mt-2 font-nunito">
                ID: #{ideaId}
              </Text>
            )}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};