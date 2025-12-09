import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  Animated,
  Dimensions,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import * as ImagePicker from 'expo-image-picker';
import { Camera, Image as ImageIcon, Sparkles, ArrowLeft, Zap, CircleDot } from 'lucide-react-native';
import { CraftStackParamList } from '~/navigations/types';
import { LinearGradient } from 'expo-linear-gradient';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');
const isSmallScreen = screenWidth < 375;
const isLargeScreen = screenWidth > 414;

export const CraftScanScreen = () => {
  const navigation = useNavigation<NativeStackNavigationProp<CraftStackParamList>>();
  const [isProcessing, setIsProcessing] = useState(false);
  const pulseAnim = React.useRef(new Animated.Value(1)).current;

  React.useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.05,
          duration: 2000,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 2000,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, []);

  // Reset processing state when screen comes into focus
  useFocusEffect(
    React.useCallback(() => {
      setIsProcessing(false);
      return () => {
        // Cleanup if needed
      };
    }, [])
  );

  const handleBack = () => navigation.goBack();

  const pickImageFromCamera = async () => {
    if (isProcessing) {
      return;
    }

    const permission = await ImagePicker.requestCameraPermissionsAsync();
    if (!permission.granted) {
      Alert.alert('Permission Required', 'Camera permission is required to scan items.');
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      quality: 0.8,
      allowsEditing: true,
    });

    if (!result.canceled && result.assets[0]) {
      handleImageSelected(result.assets[0].uri);
    }
  };

  const pickImageFromGallery = async () => {
    if (isProcessing) {
      console.log('⚠️ Already processing, ignoring gallery request');
      return;
    }

    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      Alert.alert('Permission Required', 'Gallery permission is required to upload photos.');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      quality: 0.8,
      allowsEditing: true,
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
    });

    if (!result.canceled && result.assets[0]) {
      handleImageSelected(result.assets[0].uri);
    }
  };

  const handleImageSelected = (uri: string) => {
    console.log('📸 Image selected:', uri);
    setIsProcessing(true);
    
    // Small delay to show processing state
    setTimeout(() => {
      navigation.navigate('CraftProcessing', { imageUri: uri });
    }, 300);
  };

  // Responsive size calculations
  const getResponsiveSize = (base: number, small: number, large: number) => {
    if (isSmallScreen) return small;
    if (isLargeScreen) return large;
    return base;
  };

  const circleSize = getResponsiveSize(144, 120, 160);
  const iconSize = getResponsiveSize(56, 48, 64);

  return (
    <SafeAreaView edges={['left', 'right']} className="flex-1 bg-craftopia-background">
      {/* Header */}
      <View className="px-4 pt-4 pb-3">
        <View className="flex-row items-center gap-3">
          <TouchableOpacity
            onPress={handleBack}
            className="w-10 h-10 rounded-2xl bg-white/10 items-center justify-center"
            style={{
              shadowColor: '#000',
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.3,
              shadowRadius: 8,
            }}
          >
            <ArrowLeft size={20} color="#3B6E4D" strokeWidth={2.5} />
          </TouchableOpacity>

          <View className="flex-1 gap-1">
            <Text className="text-2xl font-poppinsBold text-craftopia-textPrimary">
              AI Craft Scanner
            </Text>
            <View className="flex-row items-center gap-2">
              <View className="w-2 h-2 rounded-full bg-craftopia-success" />
              <Text className="text-sm font-nunito text-craftopia-textSecondary">
                Powered by Vision AI
              </Text>
            </View>
          </View>
        </View>
      </View>

      {/* Scrollable Content - Centered */}
      <ScrollView 
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ 
          flexGrow: 1, 
          justifyContent: 'center' 
        }}
        className="flex-1 px-4"
      >
        <View className="flex-1 justify-center gap-8">
          {/* Hero Scan Area */}
          <Animated.View 
            style={{ transform: [{ scale: pulseAnim }] }}
            className="items-center gap-6"
          >
            {/* Gradient Circle Background */}
            <View className="relative items-center justify-center">
              {/* Outer Glow Ring */}
              <View 
                className="absolute rounded-full bg-craftopia-primary/10"
                style={{
                  width: circleSize * 1.4,
                  height: circleSize * 1.4,
                }}
              />
              <View 
                className="absolute rounded-full bg-craftopia-primary/20"
                style={{
                  width: circleSize * 1.2,
                  height: circleSize * 1.2,
                }}
              />
              
              {/* Main Circle */}
              <View 
                className="rounded-full bg-gradient-to-br from-craftopia-primary to-craftopia-secondary items-center justify-center"
                style={{
                  width: circleSize,
                  height: circleSize,
                  shadowColor: '#3B6E4D',
                  shadowOffset: { width: 0, height: 8 },
                  shadowOpacity: 0.5,
                  shadowRadius: 24,
                }}
              >
                <Camera 
                  size={iconSize} 
                  color="#FFFFFF" 
                  strokeWidth={2} 
                />
                
                {/* Decorative dots */}
                <View className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-craftopia-accent items-center justify-center">
                  <Sparkles size={14} color="#FFFFFF" />
                </View>
              </View>
            </View>

            <View className="items-center gap-3">
              <Text className="text-3xl font-poppinsBold text-craftopia-textPrimary text-center">
                Scan & Create
              </Text>
              <Text className="text-base font-nunito text-craftopia-textSecondary text-center px-4 leading-6">
                Transform recyclables into stunning crafts with AI-powered suggestions
              </Text>
            </View>
          </Animated.View>

          {/* Action Buttons - Centered */}
          <View className="gap-3">
            {/* Primary Camera Button */}
            <TouchableOpacity
              onPress={pickImageFromCamera}
              disabled={isProcessing}
              activeOpacity={0.8}
              className="relative overflow-hidden rounded-2xl"
              style={{
                shadowColor: '#3B6E4D',
                shadowOffset: { width: 0, height: 8 },
                shadowOpacity: 0.4,
                shadowRadius: 16,
                opacity: isProcessing ? 0.5 : 1,
              }}
            >
              <LinearGradient
                colors={['#3B6E4D', '#2C533C']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                className="px-6 py-5"
              >
                <View className="flex-row items-center gap-3">
                  <View className="w-10 h-10 rounded-full bg-white/20 items-center justify-center">
                    <Camera size={20} color="#FFFFFF" strokeWidth={2.5} />
                  </View>
                  <View className="flex-1 gap-1">
                    <Text className="text-lg font-poppinsBold text-white">
                      Capture Photo
                    </Text>
                    <Text className="text-xs font-nunito text-white/80">
                      Use your camera to scan items
                    </Text>
                  </View>
                  <Zap size={20} color="#FCD34D" fill="#FCD34D" />
                </View>
              </LinearGradient>
            </TouchableOpacity>
          </View>

          {/* Tips Card - Centered */}
          <View className="bg-white/80 rounded-2xl p-4 border border-craftopia-secondary/20">
            <View className="flex-row items-center gap-2 mb-3">
              <View className="w-8 h-8 rounded-full bg-craftopia-accent/20 items-center justify-center">
                <Sparkles size={16} color="#E3A84F" />
              </View>
              <Text className="text-lg font-poppinsBold text-craftopia-textPrimary">
                Pro Tips
              </Text>
            </View>
            <View className="gap-2">
              <View className="flex-row items-start gap-3">
                <View className="w-1.5 h-1.5 rounded-full bg-craftopia-success mt-1.5" />
                <Text className="flex-1 text-sm font-nunito text-craftopia-textSecondary">
                  Use good lighting for better detection
                </Text>
              </View>
              <View className="flex-row items-start gap-3">
                <View className="w-1.5 h-1.5 rounded-full bg-craftopia-success mt-1.5" />
                <Text className="flex-1 text-sm font-nunito text-craftopia-textSecondary">
                  Clean items show clearer in photos
                </Text>
              </View>
              <View className="flex-row items-start gap-3">
                <View className="w-1.5 h-1.5 rounded-full bg-craftopia-success mt-1.5" />
                <Text className="flex-1 text-sm font-nunito text-craftopia-textSecondary">
                  Multiple items? Spread them out
                </Text>
              </View>
            </View>
          </View>
        </View>
      </ScrollView>

      {/* Loading Overlay */}
      {isProcessing && (
        <View className="absolute inset-0 bg-black/80 items-center justify-center">
          <View className="bg-white/90 rounded-3xl p-8 items-center border border-craftopia-secondary/20 mx-4 gap-4">
            <ActivityIndicator size="large" color="#3B6E4D" />
            <View className="items-center gap-1">
              <Text className="text-lg font-poppinsBold text-craftopia-textPrimary">
                Processing...
              </Text>
              <Text className="text-sm font-nunito text-craftopia-textSecondary">
                Preparing your scan
              </Text>
            </View>
          </View>
        </View>
      )}
    </SafeAreaView>
  );
};