// apps/mobile/src/screens/craft/CraftProcessing.tsx
import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  View,
  Text,
  Image,
  ActivityIndicator,
  Animated,
  BackHandler,
  StatusBar,
  useWindowDimensions,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute, RouteProp, useFocusEffect } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Sparkles, CheckCircle, Zap, Scan, ImageIcon, AlertCircle, BrainCircuit, X } from 'lucide-react-native';
import { CraftStackParamList } from '~/navigations/types';
import { LinearGradient } from 'expo-linear-gradient';
import * as ImageManipulator from 'expo-image-manipulator';
import { ModalService } from '~/context/modalContext';
import { useDetectMaterials, useGenerateCraft } from '~/hooks/queries/useCraft';

type RouteParams = RouteProp<CraftStackParamList, 'CraftProcessing'>;

const STEPS = [
  { icon: Scan, label: 'Analyzing Image Structure', color: '#3B6E4D' },
  { icon: Zap, label: 'Detecting Materials', color: '#E6B655' },
  { icon: Sparkles, label: 'Identifying Recyclables', color: '#5C89B5' },
  { icon: ImageIcon, label: 'Generating Visualizations', color: '#E6B655' },
  { icon: BrainCircuit, label: 'Finalizing Craft Ideas', color: '#5BA776' },
];

export const CraftProcessingScreen = () => {
  const navigation = useNavigation<NativeStackNavigationProp<CraftStackParamList>>();
  const route = useRoute<RouteParams>();
  const { imageUri } = route.params;
  const { width } = useWindowDimensions();

  // Animation values
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.95)).current;
  const progressAnim = useRef(new Animated.Value(0)).current;
  const shimmerAnim = useRef(new Animated.Value(0)).current;

  // State
  const [processingStep, setProcessingStep] = useState(0);
  const [isProcessing, setIsProcessing] = useState(true);
  const [processingError, setProcessingError] = useState<string | null>(null);

  // Queries
  const detectMaterialsMutation = useDetectMaterials();
  const generateCraftMutation = useGenerateCraft();

  // Handle hardware back button
  useFocusEffect(
    useCallback(() => {
      const onBackPress = () => {
        if (isProcessing) {
          handleCancel();
          return true;
        }
        return false;
      };

      const subscription = BackHandler.addEventListener('hardwareBackPress', onBackPress);
      return () => subscription.remove();
    }, [isProcessing, navigation])
  );

  const handleCancel = () => {
    ModalService.show({
      title: 'Stop Processing?',
      message: 'We are analyzing your item. Going back now will cancel the scan.',
      type: 'warning',
      confirmText: 'Yes, Stop',
      cancelText: 'Continue',
      onConfirm: () => navigation.goBack(),
    });
  };

  useEffect(() => {
    // Entrance animation
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        friction: 8,
        tension: 40,
        useNativeDriver: true,
      }),
    ]).start();

    // Loop shimmer animation
    Animated.loop(
      Animated.sequence([
        Animated.timing(shimmerAnim, {
          toValue: 1,
          duration: 1500,
          useNativeDriver: true,
        }),
        Animated.timing(shimmerAnim, {
          toValue: 0,
          duration: 1500,
          useNativeDriver: true,
        }),
      ])
    ).start();

    // Start processing
    processImage();

    // Mimic progress for UX (the actual steps control the discrete progress, this is a smooth filler)
    Animated.timing(progressAnim, {
      toValue: 1,
      duration: 12000,
      useNativeDriver: false,
    }).start();

  }, []);

  const processImage = async () => {
    try {
      setIsProcessing(true);
      setProcessingError(null);

      // --- Step 1: Analyze ---
      setProcessingStep(0);
      await new Promise(resolve => setTimeout(resolve, 600));

      // --- Step 2: Compress & Convert ---
      setProcessingStep(1);

      const compressedImage = await ImageManipulator.manipulateAsync(
        imageUri,
        [{ resize: { width: 1024 } }],
        {
          compress: 0.7,
          format: ImageManipulator.SaveFormat.JPEG,
          base64: true
        }
      );

      const base64Data = compressedImage.base64;
      if (!base64Data || base64Data.length < 100) {
        throw new Error('Image processing failed: Invalid data');
      }

      const base64Image = `data:image/jpeg;base64,${base64Data}`;

      // --- Step 3: Detect Materials ---
      setProcessingStep(2);
      const detectResponse = await detectMaterialsMutation.mutateAsync(base64Image);

      if (!detectResponse.success || !detectResponse.data?.materials) {
        throw new Error('Could not identify any materials. Please try a clearer photo.');
      }

      // --- Step 4: Generating Visuals (Simulated delay for UX if quick) ---
      setProcessingStep(3);
      await new Promise(resolve => setTimeout(resolve, 800));

      // --- Step 5: Finalizing Ideas ---
      setProcessingStep(4);

      const craftResponse = await generateCraftMutation.mutateAsync({
        materials: detectResponse.data.materials,
        referenceImageBase64: base64Image,
      });

      if (!craftResponse.success || !craftResponse.data?.ideas) {
        throw new Error('Failed to generate craft ideas.');
      }

      setIsProcessing(false);

      // Navigate
      navigation.replace('CraftResults', {
        imageUri,
        detectedMaterials: detectResponse.data.materials,
        craftIdeas: craftResponse.data.ideas,
      });

    } catch (error: any) {
      console.error("Processing Error:", error);
      setIsProcessing(false);
      setProcessingError(error.message || 'Something went wrong while processing.');

      ModalService.show({
        title: 'Analysis Failed',
        message: error.message || 'We ran into an issue processing your image. Please try again.',
        type: 'error',
        confirmText: 'Try Again',
        cancelText: 'Cancel',
        onConfirm: () => {
          setProcessingStep(0);
          setProcessingError(null);
          // Restart simulations and processing
          progressAnim.setValue(0);
          Animated.timing(progressAnim, {
            toValue: 1,
            duration: 12000,
            useNativeDriver: false,
          }).start();
          processImage();
        },
        onCancel: () => navigation.goBack()
      });
    }
  };

  const progressWidth = progressAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0%', '100%'],
  });

  const shimmerTranslate = shimmerAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [-300, 300],
  });

  return (
    <SafeAreaView edges={['left', 'right']} className="flex-1 bg-craftopia-background">
      <StatusBar barStyle="dark-content" backgroundColor="#FAFAF7" />

      {/* Header with Cancel Button */}
      <View className="absolute top-12 right-6 z-50">
        <TouchableOpacity
          onPress={handleCancel}
          className="w-10 h-10 bg-white/50 backdrop-blur-md rounded-full items-center justify-center border border-craftopia-secondary/20"
        >
          <X size={20} color="#5F6F64" />
        </TouchableOpacity>
      </View>

      {/* Main Content Container */}
      <View className="flex-1 px-6 justify-center items-center pb-12">

        {/* -- Header Text -- */}
        <Animated.View style={{ opacity: fadeAnim }} className="mb-8 items-center">
          <Text className="text-2xl font-poppinsBold text-craftopia-textPrimary mb-1 text-center">
            {processingError ? 'Analysis Paused' : 'Crafting Magic'}
          </Text>
          <Text className="text-sm font-nunito text-craftopia-textSecondary text-center max-w-xs">
            {processingError
              ? 'We encountered an issue with your scan.'
              : 'Our AI is analyzing your item to generate unique upcycling ideas.'}
          </Text>
        </Animated.View>

        {/* -- Image Preview with Scanning Effect -- */}
        <Animated.View
          style={{
            opacity: fadeAnim,
            transform: [{ scale: scaleAnim }],
          }}
          className="mb-10 relative"
        >
          {/* Background Glow */}
          <View className="absolute -inset-6 bg-craftopia-primary/10 rounded-full blur-2xl" />

          <View
            className="w-64 h-64 rounded-3xl overflow-hidden bg-white shadow-xl shadow-craftopia-primary/20 border-4 border-white"
            style={{ elevation: 10 }}
          >
            <Image
              source={{ uri: imageUri }}
              className="w-full h-full"
              resizeMode="cover"
            />

            {/* Gradient Overlay */}
            <LinearGradient
              colors={['transparent', 'rgba(0,0,0,0.3)']}
              className="absolute inset-0"
            />

            {/* Scanning Laser Line */}
            {isProcessing && (
              <View className="absolute inset-0 overflow-hidden">
                <Animated.View
                  style={{
                    transform: [{
                      translateY: shimmerTranslate
                    }]
                  }}
                  className="w-full h-12 bg-craftopia-primary/30 blur-md transform -rotate-12 scale-150"
                />
                <Animated.View
                  style={{
                    transform: [{
                      translateY: shimmerTranslate
                    }]
                  }}
                  className="absolute top-6 w-full h-0.5 bg-white shadow-lg shadow-white"
                />
              </View>
            )}

            {/* AI Badge */}
            <View className="absolute top-4 right-4 bg-white/90 backdrop-blur-md rounded-full p-2 shadow-sm">
              <Sparkles size={16} color="#E6B655" />
            </View>
          </View>
        </Animated.View>

        {/* -- Progress Section -- */}
        <View className="w-full max-w-sm bg-white rounded-3xl p-6 shadow-sm border border-slate-100">

          {/* Progress Bar */}
          <View className="mb-6">
            <View className="flex-row justify-between mb-2">
              <Text className="text-xs font-poppinsBold text-craftopia-textPrimary uppercase tracking-wider">
                Progress
              </Text>
              <Text className="text-xs font-nunito font-bold text-craftopia-primary">
                {Math.min(Math.round((processingStep + 1) / STEPS.length * 100), 100)}%
              </Text>
            </View>
            <View className="h-2 bg-slate-100 rounded-full overflow-hidden w-full">
              <Animated.View
                style={{ width: progressWidth }}
                className="h-full bg-craftopia-primary rounded-full relative"
              >
                <View className="absolute right-0 top-0 bottom-0 w-20 bg-white/30" />
              </Animated.View>
            </View>
          </View>

          {/* Steps List */}
          <View>
            {STEPS.map((step, index) => {
              const StepIcon = step.icon;
              const isCompleted = index < processingStep;
              const isCurrent = index === processingStep;
              const isActive = isCompleted || isCurrent;

              return (
                <View key={index} className={`flex-row items-center ${index !== STEPS.length - 1 ? 'mb-4' : ''}`}>
                  <View className={`w-8 h-8 rounded-full items-center justify-center mr-3 border ${isActive
                    ? 'bg-craftopia-primary/10 border-craftopia-primary/20'
                    : 'bg-slate-50 border-slate-100'
                    }`}>
                    {isCompleted ? (
                      <CheckCircle size={14} color="#3B6E4D" strokeWidth={3} />
                    ) : isCurrent && isProcessing ? (
                      <ActivityIndicator size="small" color={step.color} />
                    ) : (
                      <StepIcon size={14} color={isActive ? step.color : '#CBD5E1'} />
                    )}
                  </View>

                  <Text className={`font-nunito text-sm flex-1 ${isCurrent
                    ? 'text-craftopia-textPrimary font-bold'
                    : isActive
                      ? 'text-craftopia-textPrimary font-medium'
                      : 'text-slate-400'
                    }`}>
                    {step.label}
                  </Text>
                </View>
              );
            })}
          </View>

        </View>

        {/* Error State Action */}
        {processingError && (
          <Animated.View
            style={{ opacity: fadeAnim }}
            className="absolute bottom-10 w-full px-6"
          >
            <View className="bg-red-50 border border-red-100 p-4 rounded-xl flex-row items-center mb-4">
              <AlertCircle size={20} color="#EF4444" />
              <Text className="ml-3 flex-1 text-red-700 font-nunito text-sm">
                {processingError}
              </Text>
            </View>
          </Animated.View>
        )}

      </View>
    </SafeAreaView>
  );
};  