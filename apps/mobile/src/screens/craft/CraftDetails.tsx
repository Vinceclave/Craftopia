// apps/mobile/src/screens/craft/CraftDetails.tsx
// ✅ COMPLETE VERSION WITH NETWORK ERROR HANDLING & DUPLICATE PREVENTION

import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  Modal,
  Dimensions
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import {
  ArrowLeft,
  Clock,
  Lightbulb,
  Bookmark,
  CheckCircle2,
  Sparkles,
  Wrench,
  Star,
  BarChart3,
  X,
  WifiOff,
  AlertCircle,
  Share2,
} from 'lucide-react-native';
import { useSaveCraftFromBase64, useToggleSaveCraft } from '~/hooks/queries/useCraft';
import { NetworkError } from '~/services/craft.service';
import crypto from 'crypto-js';
import { ModalService } from '~/context/modalContext';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

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
    craftIndex?: number;
  };
};

type CraftDetailsNavigationProp = NativeStackNavigationProp<RootStackParamList, 'CraftDetails'>;
type CraftDetailsRouteProp = RouteProp<RootStackParamList, 'CraftDetails'>;

/**
 * ✅ Create a unique hash for a craft (same as backend)
 * Used to detect duplicates without needing idea_id
 */
const createCraftHash = (title: string, description: string, materials: string[]): string => {
  const normalizedTitle = title.toLowerCase().trim();
  const normalizedDescription = description.toLowerCase().trim();
  const normalizedMaterials = materials.map(m => m.toLowerCase().trim()).sort().join(',');

  const hashString = `${normalizedTitle}|||${normalizedDescription}|||${normalizedMaterials}`;

  // Create SHA-256 hash using crypto-js
  return crypto.SHA256(hashString).toString().substring(0, 32);
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
    isSaved: initialSaved = false,
    craftIndex
  } = route.params;

  // ✅ Create unique hash for this craft
  const craftHash = createCraftHash(craftTitle, description, materials);

  // ✅ State management
  const [isSaved, setIsSaved] = useState(initialSaved);
  const [ideaId, setIdeaId] = useState(initialIdeaId);
  const [imageUrl, setImageUrl] = useState(generatedImageUrl);
  const [isNetworkError, setIsNetworkError] = useState(false);
  const [isPendingSave, setIsPendingSave] = useState(false);
  const [imageModalVisible, setImageModalVisible] = useState(false);

  // ✅ CRITICAL: Prevent duplicate save attempts
  const saveAttemptRef = useRef(false);
  const lastSaveAttemptRef = useRef(0);

  const saveMutation = useSaveCraftFromBase64();
  const toggleMutation = useToggleSaveCraft();

  // ✅ Monitor SAVE mutation success
  useEffect(() => {
    if (saveMutation.isSuccess && saveMutation.data) {

      const responseData = saveMutation.data.data;

      // Check for duplicate
      if ((responseData as any).isDuplicate) {
        setIsSaved(true);
        setIdeaId(responseData.idea_id);
        if (responseData.generated_image_url) {
          setImageUrl(responseData.generated_image_url);
        }
        setIsNetworkError(false);
        setIsPendingSave(false);
        saveAttemptRef.current = false;

        ModalService.show({
          title: 'Already Saved',
          message: 'This craft has already been saved to your collection!',
          type: 'info'
        });
      } else {
        // New save success
        setIsSaved(true);
        setIdeaId(responseData.idea_id);
        if (responseData.generated_image_url) {
          setImageUrl(responseData.generated_image_url);
        }
        setIsNetworkError(false);
        setIsPendingSave(false);
        saveAttemptRef.current = false;

        ModalService.show({
          title: 'Success',
          message: '✅ Craft saved to your collection!',
          type: 'success'
        });
      }
    }
  }, [saveMutation.isSuccess, saveMutation.data]);

  // ✅ Monitor SAVE mutation errors
  useEffect(() => {
    if (saveMutation.isError && saveMutation.error) {

      if (saveMutation.error instanceof NetworkError) {
        setIsNetworkError(true);
        setIsPendingSave(true);
        saveAttemptRef.current = false;
      } else {
        setIsNetworkError(false);
        setIsPendingSave(false);
        saveAttemptRef.current = false;
      }
    }
  }, [saveMutation.isError, saveMutation.error]);

  // ✅ Monitor TOGGLE mutation success
  useEffect(() => {
    if (toggleMutation.isSuccess && toggleMutation.data) {
      const newSavedState = toggleMutation.data.data.isSaved;
      setIsSaved(newSavedState);
      setIsNetworkError(false);

      ModalService.show({
        title: 'Success',
        message: newSavedState
          ? '✅ Craft saved to your collection!'
          : '📤 Craft removed from saved items',
        type: 'success'
      });
    }
  }, [toggleMutation.isSuccess, toggleMutation.data]);

  // ✅ Monitor TOGGLE mutation errors
  useEffect(() => {
    if (toggleMutation.isError && toggleMutation.error) {

      if (toggleMutation.error instanceof NetworkError) {
        setIsNetworkError(true);

        ModalService.show({
          title: '📡 Network Error',
          message: 'Please check your internet connection and try again.',
          type: 'error'
        });
      }
    }
  }, [toggleMutation.isError, toggleMutation.error]);

  // ✅ Cleanup on unmount
  useEffect(() => {
    return () => {
      saveAttemptRef.current = false;
    };
  }, []);

  const handleBack = () => {
    navigation.goBack();
  };

  const handleImagePress = () => {
    setImageModalVisible(true);
  };

  const handleCloseImageModal = () => {
    setImageModalVisible(false);
  };

  // ✅ Share to Feed Handler - No image so user can upload their own creation
  const handleShareToFeed = () => {
    // @ts-ignore - navigating to another stack
    navigation.navigate('FeedStack', {
      screen: 'Create',
      params: {
        initialTitle: `Check out my ${craftTitle} craft!`,
        initialContent: `I just created this amazing ${craftTitle} using recycled materials: ${materials.join(', ')}. ${description}`,
        initialCategory: 'Tutorial',
        initialTags: ['craft', 'diy', 'upcycling', 'recycled'],
        redirectToFeed: true,
        // No initialImageUri - let user upload their own creation photo
      }
    });
  };

  const handleSave = async () => {
    // ✅ CRITICAL: Prevent rapid duplicate clicks
    const now = Date.now();
    const timeSinceLastAttempt = now - lastSaveAttemptRef.current;

    if (saveAttemptRef.current) {
      ModalService.show({
        title: 'Please Wait',
        message: 'Your craft is being saved. Please wait...',
        type: 'info'
      });
      return;
    }

    if (timeSinceLastAttempt < 2000) {
      ModalService.show({
        title: 'Please Wait',
        message: 'Please wait a moment before trying again.',
        type: 'info'
      });
      return;
    }

    // Set flags
    saveAttemptRef.current = true;
    lastSaveAttemptRef.current = now;

    // ✅ Already saved with ideaId - toggle
    if (ideaId && isSaved) {
      try {
        await toggleMutation.mutateAsync(ideaId);

        // Success is handled in useEffect
      } catch (error: any) {
        saveAttemptRef.current = false;

        if (!(error instanceof NetworkError)) {
          ModalService.show({
            title: 'Error',
            message: error.message || 'Failed to toggle save status',
            type: 'error'
          });
        }
      }
      return;
    }

    // ✅ Already marked as saved locally (but no ideaId) - show message
    if (isSaved && !ideaId) {
      saveAttemptRef.current = false;
      ModalService.show({
        title: 'Already Saved',
        message: 'This craft has already been saved to your collection!',
        type: 'info'
      });
      return;
    }
    try {
      const result = await saveMutation.mutateAsync({
        idea_json: {
          title: craftTitle,
          description: description,
          difficulty: difficulty || undefined,
          steps,
          timeNeeded: timeNeeded || '',
          toolsNeeded: toolsNeeded || undefined,
          quickTip: quickTip || '',
          uniqueFeature: uniqueFeature || undefined,
        },
        recycled_materials: materials,
        base64_image: generatedImageUrl,
      });

      // Success is handled in useEffect
    } catch (error: any) {
      saveAttemptRef.current = false;

      // ✅ Check for duplicate error messages
      if (error.message?.includes('already saved') ||
        error.message?.includes('duplicate') ||
        error.message?.includes('unique constraint')) {
        setIsSaved(true);
        ModalService.show({
          title: 'Already Saved',
          message: 'This craft has already been saved to your collection!',
          type: 'info'
        });
      } else if (!(error instanceof NetworkError)) {
        // Show error for non-network errors
        ModalService.show({
          title: 'Error',
          message: error.message || 'Failed to save craft',
          type: 'error'
        });
      }
    }
  };

  // ✅ Calculate processing state
  const isProcessing = saveMutation.isPending || toggleMutation.isPending || saveAttemptRef.current;

  // ✅ Difficulty color mapping
  const getDifficultyColor = (diff?: string) => {
    switch (diff?.toLowerCase()) {
      case 'easy':
      case 'beginner':
        return { bg: '#E8F5E9', text: '#2E7D32', icon: '#4CAF50' };
      case 'medium':
      case 'intermediate':
        return { bg: '#FFF9E6', text: '#F57C00', icon: '#FF9800' };
      case 'hard':
      case 'advanced':
        return { bg: '#FFEBEE', text: '#C62828', icon: '#F44336' };
      default:
        return { bg: '#F0F4F2', text: '#5F6F64', icon: '#5F6F64' };
    }
  };

  const difficultyColors = getDifficultyColor(difficulty);

  // ✅ Show save button logic
  const showSaveButton = !isSaved || (isSaved && ideaId); // Show if not saved OR if we have ideaId for toggling
  const saveButtonDisabled = isProcessing;

  // ✅ Button text logic
  const getSaveButtonText = () => {
    if (isProcessing) return 'Saving...';
    if (isPendingSave) return 'Queued for Save';
    if (isSaved && ideaId) return 'Unsave';
    if (isSaved && !ideaId) return 'Already Saved';
    return 'Save to My Projects';
  };

  const getSaveButtonIcon = () => {
    if (isProcessing) return null; // Show spinner instead
    if (isPendingSave) return <WifiOff size={20} color="#FFFFFF" />;
    if (isSaved && ideaId) return <Bookmark size={20} color="#FFFFFF" fill="#FFFFFF" />;
    if (isSaved && !ideaId) return <CheckCircle2 size={20} color="#FFFFFF" fill="#FFFFFF" />;
    return <Bookmark size={20} color="#FFFFFF" />;
  };

  return (
    <SafeAreaView edges={['left', 'right', 'bottom']} className="flex-1 bg-[#F8FBF8]">
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

          {/* Status Indicators */}
          <View className="flex-row items-center space-x-2 ml-2">
            {/* Network Error Badge */}
            {isNetworkError && (
              <View className="flex-row items-center bg-[#FFF9E6] px-2 py-1 rounded-lg">
                <WifiOff size={12} color="#F59E0B" />
                <Text className="text-xs text-[#92400E] ml-1 font-nunito">
                  Offline
                </Text>
              </View>
            )}

            {/* Bookmark Button */}
            <TouchableOpacity
              onPress={handleSave}
              disabled={saveButtonDisabled}
              className={`w-9 h-9 rounded-full items-center justify-center ${isSaved ? 'bg-[#3B6E4D]/20' : 'bg-[#F0F4F2]'
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
          {isSaved && !isPendingSave && (
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
            <TouchableOpacity
              onPress={handleImagePress}
              activeOpacity={0.9}
            >
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
            </TouchableOpacity>
          </View>
        )}

        {/* ✅ Pending Save Banner */}
        {isPendingSave && (
          <View className="mx-4 mt-4 p-4 bg-[#FFF9E6] rounded-2xl border border-[#FFE8A3]">
            <View className="flex-row items-start">
              <WifiOff size={20} color="#F59E0B" />
              <View className="flex-1 ml-3">
                <Text className="text-sm font-bold text-[#92400E] mb-1 font-poppinsBold">
                  Queued for Save
                </Text>
                <Text className="text-sm text-[#78350F] font-nunito leading-5">
                  Your craft will be saved automatically when you're back online
                </Text>
              </View>
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

        {/* ✅ Save Button - Smart Display Logic */}
        {showSaveButton && (
          <View className="mx-4 mb-4">
            <TouchableOpacity
              onPress={handleSave}
              disabled={saveButtonDisabled}
              className={`py-4 rounded-xl flex-row items-center justify-center ${saveButtonDisabled ? 'bg-[#3B6E4D]/50' :
                (isSaved && ideaId) ? 'bg-[#E66555]' : 'bg-[#3B6E4D]'
                }`}
              activeOpacity={0.8}
            >
              {isProcessing ? (
                <>
                  <ActivityIndicator size="small" color="#FFFFFF" />
                  <Text className="text-white font-bold text-base ml-2 font-poppinsBold">
                    {getSaveButtonText()}
                  </Text>
                </>
              ) : (
                <>
                  {getSaveButtonIcon()}
                  <Text className="text-white font-bold text-base ml-2 font-poppinsBold">
                    {getSaveButtonText()}
                  </Text>
                </>
              )}
            </TouchableOpacity>
          </View>
        )}

        {/* ✅ Share Your Creation Button - Only show when saved */}
        {isSaved && (
          <View className="mx-4 mb-8">
            <TouchableOpacity
              onPress={handleShareToFeed}
              className="py-4 rounded-xl flex-row items-center justify-center bg-[#E6B655]"
              activeOpacity={0.8}
            >
              <Share2 size={20} color="#FFFFFF" />
              <Text className="text-white font-bold text-base ml-2 font-poppinsBold">
                Share Your Creation
              </Text>
            </TouchableOpacity>

            {/* ✅ Debug Info (Dev Mode Only) */}
            {__DEV__ && (
              <View className="mt-2">
                <Text className="text-xs text-center text-gray-400">
                  Hash: {craftHash}
                </Text>
                {ideaId && (
                  <Text className="text-xs text-center text-gray-400">
                    ID: #{ideaId}
                  </Text>
                )}
                <Text className="text-xs text-center text-gray-400">
                  Saved: {isSaved ? 'Yes' : 'No'} | Network Error: {isNetworkError ? 'Yes' : 'No'}
                </Text>
              </View>
            )}
          </View>
        )}

        {/* ✅ Already Saved Message (No ideaId) */}
        {isSaved && !ideaId && !showSaveButton && (
          <View className="mx-4 mb-8 p-4 bg-[#3B6E4D]/10 rounded-xl border border-[#3B6E4D]/20">
            <View className="flex-row items-center justify-center">
              <CheckCircle2 size={20} color="#3B6E4D" fill="#3B6E4D" />
              <Text className="text-[#3B6E4D] font-bold text-base ml-2 font-poppinsBold">
                Saved to Your Collection
              </Text>
            </View>
          </View>
        )}
      </ScrollView>

      {/* ✅ Full-Screen Image Preview Modal */}
      <Modal
        visible={imageModalVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={handleCloseImageModal}
        statusBarTranslucent
      >
        <View className="absolute inset-0 bg-black">

          {/* Close Button */}
          <TouchableOpacity
            onPress={handleCloseImageModal}
            className="absolute top-12 right-4 z-50 w-10 h-10 rounded-full bg-white/20 items-center justify-center"
            activeOpacity={0.8}
          >
            <X size={24} color="#FFFFFF" />
          </TouchableOpacity>

          {/* Full-Screen Image */}
          <View className="flex-1 items-center justify-center">
            <Image
              source={{ uri: imageUrl }}
              style={{
                width: SCREEN_WIDTH,
                height: SCREEN_HEIGHT
              }}
              resizeMode="contain"
            />
          </View>

          {/* AI Generated Badge */}
          <View className="absolute bottom-8 left-0 right-0 items-center">
            <View className="bg-[#3B6E4D]/90 px-4 py-2 rounded-full flex-row items-center">
              <Sparkles size={16} color="#FFFFFF" />
              <Text className="text-white ml-2 font-nunito font-semibold">
                AI Generated Image
              </Text>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};