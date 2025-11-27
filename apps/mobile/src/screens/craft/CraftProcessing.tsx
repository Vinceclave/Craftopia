import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  Image,
  ActivityIndicator,
  Animated,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Sparkles, CheckCircle, Zap, Scan, ImageIcon } from 'lucide-react-native';
import { CraftStackParamList } from '~/navigations/types';
import { LinearGradient } from 'expo-linear-gradient';
import * as ImageManipulator from 'expo-image-manipulator';
import { useDetectMaterials, useGenerateCraft } from '~/hooks/queries/useCraft';

type RouteParams = RouteProp<CraftStackParamList, 'CraftProcessing'>;

export const CraftProcessingScreen = () => {
  const navigation = useNavigation<NativeStackNavigationProp<CraftStackParamList>>();
  const route = useRoute<RouteParams>();
  const { imageUri } = route.params;

  const [processingStep, setProcessingStep] = useState(0);
  const [fadeAnim] = useState(new Animated.Value(0));
  const [scaleAnim] = useState(new Animated.Value(0.9));
  const [progressAnim] = useState(new Animated.Value(0));
  const [imageBase64, setImageBase64] = useState<string>('');

  const detectMaterialsMutation = useDetectMaterials();
  const generateCraftMutation = useGenerateCraft();

  const processingSteps = [
    { icon: Scan, label: 'Analyzing image', color: '#3B6E4D' },
    { icon: Zap, label: 'Detecting materials', color: '#E6B655' },
    { icon: Sparkles, label: 'Identifying recyclables', color: '#5C89B5' },
    { icon: ImageIcon, label: 'Generating visualizations', color: '#E6B655' },
    { icon: CheckCircle, label: 'Creating craft ideas', color: '#5BA776' },
  ];

  useEffect(() => {
    // Initial animations
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        friction: 8,
        tension: 40,
        useNativeDriver: true,
      }),
    ]).start();

    // Progress bar animation
    Animated.timing(progressAnim, {
      toValue: 1,
      duration: 8000,
      useNativeDriver: false,
    }).start();

    // Start processing the image
    processImage();
  }, []);

  const processImage = async () => {
    try {
      // Step 1: Analyzing image (0.5s delay for UX)
      setProcessingStep(0);
      await new Promise(resolve => setTimeout(resolve, 500));

      // Step 2: Compress and convert image to base64
      setProcessingStep(1);
      
      console.log('🖼️  Original image URI:', imageUri);
      
      // ✅ COMPRESS IMAGE BEFORE CONVERTING TO BASE64
      const compressedImage = await ImageManipulator.manipulateAsync(
        imageUri,
        [
          { resize: { width: 1024 } } // Resize to max width of 1024px
        ],
        {
          compress: 0.7, // 70% quality
          format: ImageManipulator.SaveFormat.JPEG,
          base64: true
        }
      );

      console.log('🖼️  Image compressed successfully');
      
      // Get base64 from compressed image
      const base64Data = compressedImage.base64;
      if (!base64Data) {
        throw new Error('Failed to convert image to base64');
      }
      
      // Add the data URI prefix
      const base64Image = `data:image/jpeg;base64,${base64Data}`;
      
      // Calculate and log size
      const sizeInBytes = base64Image.length;
      const sizeInMB = (sizeInBytes / (1024 * 1024)).toFixed(2);
      console.log('🖼️  Base64 size:', sizeInMB + ' MB');
      
      if (parseFloat(sizeInMB) > 10) {
        console.warn('⚠️  Image is large:', sizeInMB + ' MB - may cause issues');
      }
      
      setImageBase64(base64Image); // Store for craft generation

      // Detect materials
      const detectResponse = await detectMaterialsMutation.mutateAsync(base64Image);
      
      if (!detectResponse.success || !detectResponse.data?.materials) {
        throw new Error('Failed to detect materials');
      }

      console.log('✅ Materials detected:', detectResponse.data.materials);

      // Step 3: Identifying recyclables (brief delay for UX)
      setProcessingStep(2);
      await new Promise(resolve => setTimeout(resolve, 800));

      // Step 4: Generating visualizations & craft ideas
      setProcessingStep(3);
      
      console.log('🎨 Starting craft generation with image...');
      
      // Generate craft ideas WITH the reference image
      const craftResponse = await generateCraftMutation.mutateAsync({
        materials: detectResponse.data.materials,
        referenceImageBase64: base64Image,
      });

      if (!craftResponse.success || !craftResponse.data?.ideas) {
        throw new Error('Failed to generate craft ideas');
      }

      console.log('✅ Craft ideas generated:', craftResponse.data.ideas.length);

      // Step 5: Finalizing
      setProcessingStep(4);
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Navigate to results with the actual data including generated images
      navigation.replace('CraftResults', {
        imageUri,
        detectedMaterials: detectResponse.data.materials,
        craftIdeas: craftResponse.data.ideas,
      });

    } catch (error: any) {
      console.error('❌ Processing error:', error);
      Alert.alert(
        'Processing Failed',
        error.message || 'Unable to process the image. Please try again.',
        [
          {
            text: 'OK',
            onPress: () => navigation.goBack(),
          },
        ]
      );
    }
  };

  const progressWidth = progressAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0%', '100%'],
  });

  return (
    <SafeAreaView edges={['left', 'right']} className="flex-1 bg-craftopia-background">
      <View className="flex-1 px-4 justify-center items-center">
        {/* Image with Modern Frame */}
        <Animated.View
          style={{
            opacity: fadeAnim,
            transform: [{ scale: scaleAnim }],
          }}
          className="mb-8"
        >
          <View className="relative">
            {/* Glow Effect */}
            <View className="absolute -inset-4 rounded-3xl bg-craftopia-primary/20 blur-2xl" />
            
            {/* Image Container */}
            <View className="relative rounded-3xl overflow-hidden border-2 border-craftopia-secondary/20">
              <Image
                source={{ uri: imageUri }}
                className="w-64 h-64"
                resizeMode="cover"
              />
              
              {/* Gradient Overlay */}
              <LinearGradient
                colors={['transparent', 'rgba(31,42,31,0.6)']}
                className="absolute inset-0"
              />
              
              {/* Scanning Effect */}
              <View className="absolute inset-0 border-2 border-craftopia-primary/50">
                <View className="absolute top-0 left-0 right-0 h-1 bg-craftopia-primary" />
                <Animated.View 
                  style={{
                    transform: [{
                      translateY: progressAnim.interpolate({
                        inputRange: [0, 1],
                        outputRange: [0, 256],
                      })
                    }]
                  }}
                  className="absolute left-0 right-0 h-0.5 bg-craftopia-primary/80 shadow-lg shadow-craftopia-primary/50"
                />
              </View>

              {/* Sparkle Badge */}
              <View className="absolute -top-3 -right-3">
                <View className="w-12 h-12 rounded-full bg-gradient-to-br from-craftopia-accent to-craftopia-warning items-center justify-center"
                  style={{
                    shadowColor: '#E6B655',
                    shadowOffset: { width: 0, height: 4 },
                    shadowOpacity: 0.6,
                    shadowRadius: 12,
                  }}
                >
                  <Sparkles size={20} color="#FFFFFF" fill="#FFFFFF" />
                </View>
              </View>
            </View>
          </View>
        </Animated.View>

        {/* Status Section */}
        <View className="items-center w-full max-w-sm mb-8">
          {/* Current Status */}
          <View className="items-center mb-6">
            <Text className="text-2xl font-poppinsBold text-craftopia-textPrimary mb-2">
              AI Processing
            </Text>
            <View className="flex-row items-center">
              {React.createElement(processingSteps[processingStep].icon, {
                size: 20,
                color: processingSteps[processingStep].color,
              })}
              <Text className="text-base font-nunito text-craftopia-textSecondary ml-2">
                {processingSteps[processingStep].label}
              </Text>
            </View>
          </View>

          {/* Modern Progress Bar */}
          <View className="w-full h-1.5 rounded-full bg-craftopia-light/50 mb-6 overflow-hidden">
            <Animated.View 
              style={{ width: progressWidth }}
              className="h-full rounded-full"
            >
              <LinearGradient
                colors={['#3B6E4D', '#5BA776']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                className="h-full"
              />
            </Animated.View>
          </View>

          {/* Modern Steps */}
          <View className="w-full bg-craftopia-surface/80 backdrop-blur-xl rounded-2xl p-4 border border-craftopia-secondary/20">
            {processingSteps.map((step, index) => {
              const StepIcon = step.icon;
              const isComplete = index < processingStep;
              const isCurrent = index === processingStep;
              
              return (
                <View key={index} className={`flex-row items-center ${index < processingSteps.length - 1 ? 'mb-4' : ''}`}>
                  {/* Icon */}
                  <View 
                    className={`w-10 h-10 rounded-2xl items-center justify-center mr-3 ${
                      isComplete 
                        ? 'bg-craftopia-success/20' 
                        : isCurrent 
                        ? 'bg-craftopia-primary/10' 
                        : 'bg-craftopia-light/50'
                    }`}
                  >
                    {isComplete ? (
                      <CheckCircle size={20} color="#5BA776" />
                    ) : isCurrent ? (
                      <ActivityIndicator size="small" color={step.color} />
                    ) : (
                      <StepIcon size={20} color="#5F6F64" />
                    )}
                  </View>

                  {/* Label */}
                  <View className="flex-1">
                    <Text 
                      className={`text-sm font-nunito ${
                        isComplete || isCurrent
                          ? 'text-craftopia-textPrimary font-semibold'
                          : 'text-craftopia-textSecondary'
                      }`}
                    >
                      {step.label}
                    </Text>
                  </View>

                  {/* Status Indicator */}
                  {isComplete && (
                    <View className="w-2 h-2 rounded-full bg-craftopia-success" />
                  )}
                </View>
              );
            })}
          </View>
        </View>

        {/* Bottom Info */}
        <View className="bg-gradient-to-r from-craftopia-info/10 to-craftopia-primary/10 backdrop-blur-xl rounded-2xl p-4 border border-craftopia-secondary/20 w-full max-w-sm">
          <View className="flex-row items-center">
            <View className="w-10 h-10 rounded-2xl bg-gradient-to-br from-craftopia-info/20 to-craftopia-primary/20 items-center justify-center mr-3">
              <Zap size={18} color="#5C89B5" />
            </View>
            <View className="flex-1">
              <Text className="text-sm font-poppinsBold text-craftopia-textPrimary">
                Vision AI at Work
              </Text>
              <Text className="text-xs font-nunito text-craftopia-textSecondary">
                Analyzing materials & generating visuals
              </Text>
            </View>
          </View>
        </View>
      </View>
    </SafeAreaView>
  );
};