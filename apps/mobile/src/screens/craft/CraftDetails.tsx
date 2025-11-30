// apps/mobile/src/screens/craft/CraftDetails.tsx - COMPLETE UPDATED FILE

import React, { useState } from 'react';
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
  Sparkles
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
    ideaId?: number;        // ✅ Database ID (if already saved)
    isSaved?: boolean;      // ✅ Save status
  };
};

type CraftDetailsNavigationProp = NativeStackNavigationProp<RootStackParamList, 'CraftDetails'>;
type CraftDetailsRouteProp = RouteProp<RootStackParamList, 'CraftDetails'>;

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
    ideaId: initialIdeaId,
    isSaved: initialSaved = false
  } = route.params;

  // ✅ State management
  const [isSaved, setIsSaved] = useState(initialSaved);
  const [ideaId, setIdeaId] = useState(initialIdeaId);
  const [imageUrl, setImageUrl] = useState(generatedImageUrl);

  // ✅ Mutations
  const saveMutation = useSaveCraftFromBase64();
  const toggleMutation = useToggleSaveCraft();

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

  // ✅ Handle save/unsave
  const handleSave = async () => {
    if (ideaId) {
      // Already in database - just toggle
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
    } else {
      // Not in database yet - save with base64 image
      try {
        const result = await saveMutation.mutateAsync({
          idea_json: {
            title: craftTitle,
            description: description,
            steps,
            timeNeeded: timeNeeded || '',
            quickTip: quickTip || '',
          },
          recycled_materials: materials,
          base64_image: generatedImageUrl, // ✅ Send base64, backend uploads to S3
        });

        // Update local state with saved data
        setIdeaId(result.data.idea_id);
        setIsSaved(true);
        
        // ✅ Replace base64 with S3 URL
        if (result.data.generated_image_url) {
          setImageUrl(result.data.generated_image_url);
        }

        Alert.alert('Success', '✅ Craft saved to your collection!');
      } catch (error: any) {
        Alert.alert('Error', error.message || 'Failed to save craft');
      }
    }
  };

  const isProcessing = saveMutation.isPending || toggleMutation.isPending;

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
            {/* ✅ Bookmark Button */}
            <TouchableOpacity 
              onPress={handleSave}
              disabled={isProcessing}
              className="w-9 h-9 rounded-full bg-[#F0F4F2] items-center justify-center"
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

        {/* Meta Info */}
        <View className="flex-row items-center mt-3 space-x-3">
          {timeNeeded && (
            <View className="flex-row items-center bg-[#F0F4F2] px-3 py-1.5 rounded-lg">
              <Clock size={14} color="#5F6F64" />
              <Text className="text-sm text-[#5F6F64] ml-1 font-nunito">
                {timeNeeded}
              </Text>
            </View>
          )}
          
          {/* ✅ Saved Badge */}
          {isSaved && (
            <View className="flex-row items-center bg-[#3B6E4D]/10 px-3 py-1.5 rounded-lg">
              <Bookmark size={14} color="#3B6E4D" fill="#3B6E4D" />
              <Text className="text-sm text-[#3B6E4D] ml-1 font-nunito font-semibold">
                Saved
              </Text>
            </View>
          )}
        </View>
      </View>

      <ScrollView className="flex-1">
        {/* ✅ AI-Generated Image (base64 initially, S3 URL after save) */}
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
                <Text className="text-sm text-[#1F2A1F] font-nunito leading-5">
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
                  Quick Tip
                </Text>
                <Text className="text-sm text-[#78350F] font-nunito">
                  {quickTip}
                </Text>
              </View>
            </View>
          </View>
        )}

        {/* ✅ Save Button (only if not saved) */}
        {!isSaved && (
          <View className="mx-4 mb-8">
            <TouchableOpacity 
              onPress={handleSave}
              disabled={isProcessing}
              className="bg-[#3B6E4D] py-4 rounded-xl flex-row items-center justify-center"
              activeOpacity={0.8}
            >
              {isProcessing ? (
                <ActivityIndicator size="small" color="#FFFFFF" />
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
      </ScrollView>
    </SafeAreaView>
  );
};