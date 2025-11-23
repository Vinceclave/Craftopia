import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  Image,
  ActivityIndicator,
  Animated,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Sparkles, CheckCircle, Zap, Scan } from 'lucide-react-native';
import { CraftStackParamList } from '~/navigations/types';
import { LinearGradient } from 'expo-linear-gradient';

type RouteParams = RouteProp<CraftStackParamList, 'CraftProcessing'>;

// Mock detected items data (static for now)
const MOCK_DETECTED_ITEMS = [
  {
    id: '1',
    name: 'Plastic Bottle',
    category: 'Plastic',
    confidence: 95,
    recyclable: true,
  },
  {
    id: '2',
    name: 'Cardboard Box',
    category: 'Paper',
    confidence: 88,
    recyclable: true,
  },
  {
    id: '3',
    name: 'Glass Jar',
    category: 'Glass',
    confidence: 92,
    recyclable: true,
  },
];

export const CraftProcessingScreen = () => {
  const navigation = useNavigation<NativeStackNavigationProp<CraftStackParamList>>();
  const route = useRoute<RouteParams>();
  const { imageUri } = route.params;

  const [processingStep, setProcessingStep] = useState(0);
  const [fadeAnim] = useState(new Animated.Value(0));
  const [scaleAnim] = useState(new Animated.Value(0.9));
  const [progressAnim] = useState(new Animated.Value(0));

  const processingSteps = [
    { icon: Scan, label: 'Analyzing image', color: '#3B6E4D' }, // craftopia-primary
    { icon: Zap, label: 'Detecting materials', color: '#E6B655' }, // craftopia-accent
    { icon: Sparkles, label: 'Identifying recyclables', color: '#5C89B5' }, // craftopia-info
    { icon: CheckCircle, label: 'Generating ideas', color: '#5BA776' }, // craftopia-success
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
      duration: 6000,
      useNativeDriver: false,
    }).start();

    // Step progression
    const stepInterval = setInterval(() => {
      setProcessingStep((prev) => {
        if (prev < processingSteps.length - 1) {
          return prev + 1;
        } else {
          clearInterval(stepInterval);
          setTimeout(() => {
            navigation.replace('CraftResults', {
              imageUri,
              detectedItems: MOCK_DETECTED_ITEMS,
            });
          }, 1000);
          return prev;
        }
      });
    }, 1500);

    return () => clearInterval(stepInterval);
  }, []);

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
                colors={['transparent', 'rgba(31,42,31,0.6)']} // craftopia-textPrimary with opacity
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
                        outputRange: [0, 256], // 64 * 4 (h-64 in pixels)
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
                colors={['#3B6E4D', '#5BA776']} // craftopia-primary to craftopia-success
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
                      <CheckCircle size={20} color="#5BA776" /> // craftopia-success
                    ) : isCurrent ? (
                      <ActivityIndicator size="small" color={step.color} />
                    ) : (
                      <StepIcon size={20} color="#5F6F64" /> // craftopia-textSecondary
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
              <Zap size={18} color="#5C89B5" /> {/* craftopia-info */}
            </View>
            <View className="flex-1">
              <Text className="text-sm font-poppinsBold text-craftopia-textPrimary">
                Vision AI at Work
              </Text>
              <Text className="text-xs font-nunito text-craftopia-textSecondary">
                Analyzing materials & generating ideas
              </Text>
            </View>
          </View>
        </View>
      </View>
    </SafeAreaView>
  );
};