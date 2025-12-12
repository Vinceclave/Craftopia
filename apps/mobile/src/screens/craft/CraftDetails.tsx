// apps/mobile/src/screens/craft/CraftDetails.tsx
import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  Modal,
  Dimensions,
  StatusBar,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { LinearGradient } from 'expo-linear-gradient';
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
  Share2,
  Maximize2,
  ChevronRight,
} from 'lucide-react-native';
import { useSaveCraftFromBase64, useToggleSaveCraft } from '~/hooks/queries/useCraft';
import { NetworkError } from '~/services/craft.service';
import crypto from 'crypto-js';
import { ModalService } from '~/context/modalContext';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

// --- Types ---

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

// --- Helpers ---

const createCraftHash = (title: string, description: string, materials: string[]): string => {
  const normalizedTitle = title.toLowerCase().trim();
  const normalizedDescription = description.toLowerCase().trim();
  const normalizedMaterials = materials.map(m => m.toLowerCase().trim()).sort().join(',');
  const hashString = `${normalizedTitle}|||${normalizedDescription}|||${normalizedMaterials}`;
  return crypto.SHA256(hashString).toString().substring(0, 32);
};

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

// --- Components ---

const HeroImage = ({ imageUrl, onExpand }: { imageUrl?: string; onExpand?: () => void }) => {
  if (!imageUrl) {
    return (
      <View className="h-72 w-full bg-craftopia-primary">
        <LinearGradient
          colors={['#3B6E4D', '#2A5138']}
          className="h-full w-full items-center justify-center p-8"
        >
          <Sparkles size={48} color="rgba(255,255,255,0.2)" />
        </LinearGradient>
      </View>
    );
  }

  return (
    <View className="h-80 w-full relative">
      <Image
        source={{ uri: imageUrl }}
        className="w-full h-full"
        resizeMode="cover"
      />
      <LinearGradient
        colors={['rgba(0,0,0,0.3)', 'transparent', 'rgba(0,0,0,0.1)']}
        className="absolute inset-0"
      />
      {onExpand && (
        <TouchableOpacity
          onPress={onExpand}
          className="absolute bottom-4 right-4 bg-black/30 backdrop-blur-md p-2 rounded-full"
        >
          <Maximize2 size={20} color="#FFF" />
        </TouchableOpacity>
      )}
    </View>
  );
};

const SectionTitle = ({ title, icon: Icon }: { title: string; icon?: any }) => (
  <View className="flex-row items-center mb-4 mt-6 px-4">
    {Icon && <Icon size={20} color="#3B6E4D" className="mr-2" />}
    <Text className="text-xl font-poppinsBold text-craftopia-textPrimary">
      {title}
    </Text>
  </View>
);

const Chip = ({ label, icon: Icon, color = '#3B6E4D', bgColor = '#f0fdf4' }: any) => (
  <View
    className="flex-row items-center px-3 py-1.5 rounded-lg mr-2 mb-2 border border-black/5"
    style={{ backgroundColor: bgColor }}
  >
    {Icon && <Icon size={14} color={color} style={{ marginRight: 6 }} />}
    <Text className="text-xs font-bold font-nunito" style={{ color }}>{label}</Text>
  </View>
);

const StepCard = ({ number, text }: { number: number; text: string }) => (
  <View className="flex-row mb-4 px-4">
    <View className="w-8 h-8 rounded-full bg-craftopia-primary items-center justify-center mr-4 shadow-sm shadow-craftopia-primary/30 mt-1">
      <Text className="text-white font-poppinsBold text-sm">{number}</Text>
    </View>
    <View className="flex-1 bg-white p-4 rounded-xl border border-slate-100 shadow-sm">
      <Text className="text-craftopia-textPrimary font-nunito leading-6 text-sm">
        {text}
      </Text>
    </View>
  </View>
);

const InfoCard = ({ icon: Icon, title, description, color, bgColor, borderColor }: any) => (
  <View
    className="mx-4 mb-6 p-4 rounded-2xl border"
    style={{ backgroundColor: bgColor, borderColor: borderColor }}
  >
    <View className="flex-row items-start">
      <View className="p-2 rounded-full bg-white/50 mr-3">
        <Icon size={20} color={color} />
      </View>
      <View className="flex-1">
        <Text className="text-sm font-bold mb-1 font-poppinsBold" style={{ color: color }}>
          {title}
        </Text>
        <Text className="text-sm font-nunito leading-5 text-slate-700">
          {description}
        </Text>
      </View>
    </View>
  </View>
);

// --- Main Screen ---

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
  } = route.params;

  // Logic specific state
  const [isSaved, setIsSaved] = useState(initialSaved);
  const [ideaId, setIdeaId] = useState(initialIdeaId);
  const [imageUrl, setImageUrl] = useState(generatedImageUrl);
  const [isNetworkError, setIsNetworkError] = useState(false);
  const [isPendingSave, setIsPendingSave] = useState(false);
  const [imageModalVisible, setImageModalVisible] = useState(false);

  // Refs for duplicate prevention
  const saveAttemptRef = useRef(false);
  const lastSaveAttemptRef = useRef(0);

  // Queries
  const saveMutation = useSaveCraftFromBase64();
  const toggleMutation = useToggleSaveCraft();

  const difficultyColors = getDifficultyColor(difficulty);
  const craftHash = createCraftHash(craftTitle, description, materials);

  // --- Effects (Logic Preserved) ---

  useEffect(() => {
    if (saveMutation.isSuccess && saveMutation.data) {
      const responseData = saveMutation.data.data;
      const isDupe = (responseData as any).isDuplicate;

      setIsSaved(true);
      setIdeaId(responseData.idea_id);
      if (responseData.generated_image_url) setImageUrl(responseData.generated_image_url);

      setIsNetworkError(false);
      setIsPendingSave(false);
      saveAttemptRef.current = false;

      ModalService.show({
        title: isDupe ? 'Already Saved' : 'Success',
        message: isDupe ? 'This craft is already in your collection!' : '✅ Craft saved successfully!',
        type: isDupe ? 'info' : 'success'
      });
    }
  }, [saveMutation.isSuccess, saveMutation.data]);

  useEffect(() => {
    if (saveMutation.isError && saveMutation.error) {
      if (saveMutation.error instanceof NetworkError) {
        setIsNetworkError(true);
        setIsPendingSave(true);
      } else {
        setIsNetworkError(false);
        setIsPendingSave(false);
      }
      saveAttemptRef.current = false;
    }
  }, [saveMutation.isError, saveMutation.error]);

  useEffect(() => {
    if (toggleMutation.isSuccess && toggleMutation.data) {
      const newSavedState = toggleMutation.data.data.isSaved;
      setIsSaved(newSavedState);
      setIsNetworkError(false);
      ModalService.show({
        title: 'Success',
        message: newSavedState ? '✅ Available in Saved Crafts' : '📤 Removed from collection',
        type: 'success'
      });
    }
  }, [toggleMutation.isSuccess, toggleMutation.data]);

  useEffect(() => {
    if (toggleMutation.isError && toggleMutation.error) {
      if (toggleMutation.error instanceof NetworkError) {
        setIsNetworkError(true);
        ModalService.show({
          title: 'Network Error',
          message: 'Check your connection and try again.',
          type: 'error'
        });
      }
    }
  }, [toggleMutation.isError, toggleMutation.error]);

  useEffect(() => {
    return () => { saveAttemptRef.current = false; };
  }, []);

  // --- Handlers ---

  const handleBack = () => navigation.goBack();
  const handleImagePress = () => setImageModalVisible(true);
  const handleCloseImageModal = () => setImageModalVisible(false);

  const handleShareToFeed = () => {
    // @ts-ignore
    navigation.navigate('FeedStack', {
      screen: 'Create',
      params: {
        initialTitle: `Check out my ${craftTitle} craft!`,
        initialContent: `I just created this amazing ${craftTitle} using: ${materials.join(', ')}. ${description}`,
        initialCategory: 'Tutorial',
        initialTags: ['craft', 'diy', 'upcycling'],
        redirectToFeed: true,
      }
    });
  };

  const handleSave = async () => {
    const now = Date.now();
    if (saveAttemptRef.current || (now - lastSaveAttemptRef.current < 2000)) return;

    saveAttemptRef.current = true;
    lastSaveAttemptRef.current = now;

    if (ideaId && isSaved) {
      try {
        await toggleMutation.mutateAsync(ideaId);
      } catch (error) {
        saveAttemptRef.current = false;
      }
      return;
    }

    if (isSaved && !ideaId) {
      saveAttemptRef.current = false;
      ModalService.show({ title: 'Already Saved', message: 'Local save already exists.', type: 'info' });
      return;
    }

    try {
      await saveMutation.mutateAsync({
        idea_json: {
          title: craftTitle,
          description,
          difficulty,
          steps,
          timeNeeded: timeNeeded || '',
          toolsNeeded,
          quickTip: quickTip || '',
          uniqueFeature,
        },
        recycled_materials: materials,
        base64_image: generatedImageUrl,
      });
    } catch (error: any) {
      saveAttemptRef.current = false;
      if (error.message?.includes('already saved') || error.message?.includes('duplicate')) {
        setIsSaved(true);
        ModalService.show({ title: 'Already Saved', message: 'Already in your collection!', type: 'info' });
      } else if (!(error instanceof NetworkError)) {
        ModalService.show({ title: 'Error', message: 'Failed to save craft', type: 'error' });
      }
    }
  };

  const isProcessing = saveMutation.isPending || toggleMutation.isPending || saveAttemptRef.current;
  const showSaveButton = !isSaved || (isSaved && ideaId);

  // --- Render ---

  return (
    <View className="flex-1 bg-craftopia-background">
      <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />

      {/* Fixed Header Back Button */}
      <View
        className="absolute top-0 left-0 right-0 z-50 flex-row justify-between items-center px-4 pt-4"
        style={{ marginTop: StatusBar.currentHeight || 44 }}
      >
        <TouchableOpacity
          onPress={handleBack}
          className="w-10 h-10 rounded-full bg-white/20 backdrop-blur-md items-center justify-center border border-white/20"
        >
          <ArrowLeft size={20} color="#FFF" />
        </TouchableOpacity>

        <View className="flex-row space-x-2">
          {isNetworkError && (
            <View className="bg-amber-500/90 backdrop-blur-md px-3 py-2 rounded-full flex-row items-center border border-white/20">
              <WifiOff size={14} color="#FFF" />
              <Text className="text-white text-xs font-bold ml-1.5">Offline</Text>
            </View>
          )}
        </View>
      </View>

      <ScrollView
        className="flex-1"
        showsVerticalScrollIndicator={false}
        bounces={false}
        contentContainerStyle={{ paddingBottom: 100 }}
      >
        <HeroImage imageUrl={imageUrl} onExpand={imageUrl ? handleImagePress : undefined} />

        <View className="bg-craftopia-background -mt-6 rounded-t-3xl pt-8 pb-4 relative">

          {/* Main Title Block */}
          <View className="px-6 mb-6">
            <View className="flex-row items-start justify-between">
              <View className="flex-1 mr-4">
                <Text className="text-2xl font-poppinsBold text-craftopia-textPrimary leading-8">
                  {craftTitle}
                </Text>

                {/* Meta Tags */}
                <View className="flex-row flex-wrap mt-3">
                  {difficulty && (
                    <Chip
                      label={difficulty}
                      icon={BarChart3}
                      color={difficultyColors.text}
                      bgColor={difficultyColors.bg}
                    />
                  )}
                  {timeNeeded && (
                    <Chip
                      label={timeNeeded}
                      icon={Clock}
                      color="#5F6F64"
                      bgColor="#F0F4F2"
                    />
                  )}
                  {isSaved && !isPendingSave && (
                    <Chip
                      label="Saved"
                      icon={CheckCircle2}
                      color="#3B6E4D"
                      bgColor="#DCFCE7"
                    />
                  )}
                </View>
              </View>

              {/* Save FAB - Floating near title for easy access on scroll start */}
              <TouchableOpacity
                onPress={handleSave}
                disabled={isProcessing}
                className={`w-12 h-12 rounded-full items-center justify-center shadow-md ${isSaved ? 'bg-craftopia-surface border border-craftopia-primary' : 'bg-craftopia-primary'}`}
              >
                {isProcessing ? (
                  <ActivityIndicator size="small" color={isSaved ? '#3B6E4D' : '#FFF'} />
                ) : (
                  <Bookmark
                    size={20}
                    color={isSaved ? '#3B6E4D' : '#FFF'}
                    fill={isSaved ? '#3B6E4D' : 'transparent'}
                  />
                )}
              </TouchableOpacity>
            </View>

            {description && (
              <Text className="text-craftopia-textSecondary font-nunito leading-6 mt-4 text-base">
                {description}
              </Text>
            )}
          </View>

          {/* Pending Save Warning */}
          {isPendingSave && (
            <InfoCard
              icon={WifiOff}
              title="Save Pending"
              description="Your craft will be saved automatically when you're back online."
              color="#D97706"
              bgColor="#FFFBEB"
              borderColor="#FDE68A"
            />
          )}

          {/* Unique Feature Highlight */}
          {uniqueFeature && (
            <InfoCard
              icon={Star}
              title="Why It's Special"
              description={uniqueFeature}
              color="#E6B655"
              bgColor="#FFFDF5"
              borderColor="#FDE68A"
            />
          )}

          {/* Pro Tip Highlight */}
          {quickTip && (
            <InfoCard
              icon={Lightbulb}
              title="Pro Tip"
              description={quickTip}
              color="#3B82F6"
              bgColor="#EFF6FF"
              borderColor="#BFDBFE"
            />
          )}

          {/* Materials Section */}
          <SectionTitle title="Materials" icon={Sparkles} />
          <View className="px-6 flex-row flex-wrap gap-2 mb-2">
            {materials.map((m, i) => (
              <View key={i} className="bg-white border border-slate-200 px-4 py-2 rounded-full">
                <Text className="text-craftopia-textPrimary font-nunito font-semibold">{m}</Text>
              </View>
            ))}
          </View>

          {/* Tools Section */}
          {toolsNeeded && toolsNeeded.length > 0 && (
            <>
              <SectionTitle title="Tools" icon={Wrench} />
              <View className="px-6 flex-row flex-wrap gap-2 mb-2">
                {toolsNeeded.map((t, i) => (
                  <View key={i} className="bg-slate-50 border border-slate-100 px-3 py-1.5 rounded-lg flex-row items-center">
                    <View className="w-1.5 h-1.5 rounded-full bg-slate-400 mr-2" />
                    <Text className="text-slate-600 font-nunito text-sm">{t}</Text>
                  </View>
                ))}
              </View>
            </>
          )}

          {/* Steps Section */}
          <SectionTitle title="Instructions" icon={ClipboardCheckIconWrapper} />
          <View className="mb-6">
            {steps.map((step, i) => <StepCard key={i} number={i + 1} text={step} />)}
          </View>

          {/* Bottom Actions */}
          <View className="px-6 space-y-3 mt-4">
            {/* Primary Action: Share (only if saved) */}
            {isSaved && (
              <TouchableOpacity
                onPress={handleShareToFeed}
                className="w-full bg-craftopia-accent py-4 rounded-xl flex-row items-center justify-center shadow-lg shadow-amber-200"
              >
                <Share2 size={20} color="#FFF" className="mr-2" />
                <Text className="text-white font-poppinsBold text-base">Share to Community</Text>
              </TouchableOpacity>
            )}

            {/* Secondary Action: Save/Unsave (Large Button for Emphasis) */}
            {showSaveButton && (
              <TouchableOpacity
                onPress={handleSave}
                disabled={isProcessing}
                className={`w-full py-4 rounded-xl flex-row items-center justify-center border ${isSaved ? 'bg-white border-red-200' : 'bg-craftopia-primary border-craftopia-primary'}`}
              >
                {isProcessing ? (
                  <ActivityIndicator color={isSaved ? '#EF4444' : '#FFF'} />
                ) : (
                  <>
                    <Bookmark size={20} color={isSaved ? '#EF4444' : '#FFF'} className="mr-2" />
                    <Text className={`font-poppinsBold text-base ${isSaved ? 'text-red-500' : 'text-white'}`}>
                      {isSaved ? 'Remove from Saved' : 'Save Craft Idea'}
                    </Text>
                  </>
                )}
              </TouchableOpacity>
            )}

            {/* Save Confirmation Banner (No ID) */}
            {isSaved && !ideaId && !showSaveButton && (
              <View className="bg-green-50 border border-green-200 p-4 rounded-xl flex-row items-center justify-center">
                <CheckCircle2 size={20} color="#16A34A" className="mr-2" />
                <Text className="text-green-700 font-bold">Saved locally</Text>
              </View>
            )}
          </View>
        </View>
      </ScrollView>

      {/* Image Modal */}
      <Modal visible={imageModalVisible} transparent animationType="fade" onRequestClose={handleCloseImageModal}>
        <View className="flex-1 bg-black/95 justify-center items-center">
          <TouchableOpacity
            onPress={handleCloseImageModal}
            className="absolute top-12 right-6 z-50 p-2 bg-white/20 rounded-full"
          >
            <X size={24} color="#FFF" />
          </TouchableOpacity>
          <Image
            source={{ uri: imageUrl }}
            className="w-full h-full"
            resizeMode="contain"
          />
        </View>
      </Modal>
    </View>
  );
};

// Icon wrapper for step title since we don't have CheckList icon in imports
const ClipboardCheckIconWrapper = (props: any) => <CheckCircle2 {...props} />;

export default CraftDetailsScreen;