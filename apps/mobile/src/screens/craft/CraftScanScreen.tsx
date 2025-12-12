// apps/mobile/src/screens/craft/CraftScanScreen.tsx
import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ActivityIndicator,
  Animated,
  Dimensions,
  ScrollView,
  StatusBar,
  StyleSheet
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import * as ImagePicker from 'expo-image-picker';
import { ModalService } from '~/context/modalContext';
import {
  Camera,
  Image as ImageIcon,
  Sparkles,
  ArrowLeft,
  Zap,
  ScanLine,
  Upload
} from 'lucide-react-native';
import { CraftStackParamList } from '~/navigations/types';
import { LinearGradient } from 'expo-linear-gradient';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

// --- Components ---

const ScannerVisual = ({ pulseAnim }: { pulseAnim: any }) => {
  return (
    <View className="items-center justify-center my-10 relative">
      <View className="relative items-center justify-center">
        {/* Outer Animated Ring 1 */}
        <Animated.View
          className="absolute rounded-full border border-craftopia-primary/20"
          style={{
            width: 280,
            height: 280,
            transform: [{ scale: pulseAnim }],
            opacity: 0.5
          }}
        />
        {/* Outer Animated Ring 2 */}
        <Animated.View
          className="absolute rounded-full bg-craftopia-primary/5"
          style={{
            width: 220,
            height: 220,
            transform: [{ scale: pulseAnim }],
          }}
        />

        {/* Main Gradient Circle */}
        <LinearGradient
          colors={['#3B6E4D', '#2A5138']}
          className="w-40 h-40 rounded-full items-center justify-center shadow-lg shadow-craftopia-primary/40 elevation-10"
        >
          <Camera size={64} color="#FFF" />

          {/* Floating badge */}
          <View className="absolute -top-2 -right-2 bg-craftopia-accent w-8 h-8 rounded-full items-center justify-center border-2 border-white">
            <Sparkles size={16} color="#FFF" fill="#FFF" />
          </View>
        </LinearGradient>

        {/* Scanning Line Animation Effect overlay (conceptual) */}
        <View className="absolute top-0 bottom-0 w-1 bg-craftopia-accent/30 h-full opacity-50" />
      </View>
    </View>
  );
};

const ActionButton = ({
  title,
  subtitle,
  icon: Icon,
  onPress,
  variant = 'primary',
  disabled
}: any) => {
  const isPrimary = variant === 'primary';

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled}
      activeOpacity={0.8}
      className={`relative overflow-hidden rounded-2xl mb-4 shadow-sm elevation-4 ${disabled ? 'opacity-50' : 'opacity-100'
        }`}
    >
      {isPrimary ? (
        <LinearGradient
          colors={['#3B6E4D', '#2C533C']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          className="px-6 py-5 flex-row items-center"
        >
          <View className="w-12 h-12 rounded-full bg-white/20 items-center justify-center mr-4">
            <Icon size={24} color="#FFF" />
          </View>
          <View className="flex-1">
            <Text className="text-white font-poppinsBold text-lg">{title}</Text>
            <Text className="text-white/80 font-nunito text-xs">{subtitle}</Text>
          </View>
          <Zap size={20} color="#FCD34D" fill="#FCD34D" />
        </LinearGradient>
      ) : (
        <View className="bg-white px-6 py-5 flex-row items-center border border-slate-100 rounded-2xl">
          <View className="w-12 h-12 rounded-full bg-slate-100 items-center justify-center mr-4">
            <Icon size={24} color="#3B6E4D" />
          </View>
          <View className="flex-1">
            <Text className="text-craftopia-textPrimary font-poppinsBold text-lg">{title}</Text>
            <Text className="text-craftopia-textSecondary font-nunito text-xs">{subtitle}</Text>
          </View>
          <ArrowLeft size={20} color="#CBD5E1" style={{ transform: [{ rotate: '180deg' }] }} />
        </View>
      )}
    </TouchableOpacity>
  );
};

const TipItem = ({ text }: { text: string }) => (
  <View className="flex-row items-center gap-3 mb-2">
    <View className="w-1.5 h-1.5 rounded-full bg-craftopia-success" />
    <Text className="flex-1 text-sm font-nunito text-craftopia-textSecondary leading-5">
      {text}
    </Text>
  </View>
);

// --- Main Screen ---

export const CraftScanScreen = () => {
  const navigation = useNavigation<NativeStackNavigationProp<CraftStackParamList>>();
  const [isProcessing, setIsProcessing] = useState(false);
  const pulseAnim = useRef(new Animated.Value(1)).current;

  // Pulse Animation Loop
  useEffect(() => {
    const animation = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.1,
          duration: 1500,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 1500,
          useNativeDriver: true,
        }),
      ])
    );
    animation.start();
    return () => animation.stop();
  }, []);

  useFocusEffect(
    React.useCallback(() => {
      setIsProcessing(false);
    }, [])
  );

  const handleBack = () => navigation.goBack();

  const handleImageSelected = (uri: string) => {
    console.log('📸 Image selected:', uri);
    setIsProcessing(true);
    // Simulate processing delay for smoothness
    setTimeout(() => {
      navigation.navigate('CraftProcessing', { imageUri: uri });
    }, 500);
  };

  const pickImageFromCamera = async () => {
    if (isProcessing) return;
    const permission = await ImagePicker.requestCameraPermissionsAsync();

    if (!permission.granted) {
      ModalService.show({ title: 'Permission Required', message: 'Camera access is needed to scan items.', type: 'warning' });
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
    if (isProcessing) return;
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (!permission.granted) {
      ModalService.show({ title: 'Permission Required', message: 'Gallery access is needed to upload photos.', type: 'warning' });
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

  return (
    <View className="flex-1 bg-craftopia-background">
      <StatusBar barStyle="dark-content" backgroundColor="#FAFAF7" />
      <SafeAreaView edges={['top', 'left', 'right']} className="flex-1">

        {/* Header */}
        <View className="px-6 py-4 flex-row items-center justify-between">
          <TouchableOpacity
            onPress={handleBack}
            className="w-10 h-10 rounded-full bg-white border border-slate-100 items-center justify-center shadow-sm"
          >
            <ArrowLeft size={20} color="#3B6E4D" />
          </TouchableOpacity>
          <View className="items-end">
            <Text className="font-poppinsBold text-lg text-craftopia-textPrimary">AI Scanner</Text>
            <View className="flex-row items-center">
              <View className="w-2 h-2 rounded-full bg-green-500 mr-1" />
              <Text className="text-xs font-nunito text-craftopia-textSecondary">Active</Text>
            </View>
          </View>
        </View>

        <ScrollView
          contentContainerStyle={{ flexGrow: 1, paddingBottom: 40 }}
          showsVerticalScrollIndicator={false}
          className="px-6"
        >
          {/* Hero Section */}
          <View className="items-center mt-4 mb-8">
            <Text className="text-3xl font-poppinsBold text-craftopia-textPrimary text-center mb-2">
              Scan & Create
            </Text>
            <Text className="text-craftopia-textSecondary text-center font-nunito text-sm px-8 leading-6">
              Take a photo of your recyclable items and let our AI suggest amazing craft ideas.
            </Text>

            {/* Dynamic Visual */}
            <ScannerVisual pulseAnim={pulseAnim} />
          </View>

          {/* Action Buttons */}
          <View className="mb-8">
            <ActionButton
              title="Capture Photo"
              subtitle="Use your camera to scan items instantly"
              icon={Camera}
              onPress={pickImageFromCamera}
              disabled={isProcessing}
              variant="primary"
            />

            <ActionButton
              title="Upload from Gallery"
              subtitle="Choose an existing photo from your device"
              icon={ImageIcon}
              onPress={pickImageFromGallery}
              disabled={isProcessing}
              variant="secondary"
            />
          </View>

          {/* Tips Section */}
          <View className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm">
            <View className="flex-row items-center mb-4">
              <View className="bg-amber-100 p-2 rounded-full mr-3">
                <Sparkles size={16} color="#D97706" />
              </View>
              <Text className="font-poppinsBold text-craftopia-textPrimary text-base">
                For Best Results
              </Text>
            </View>
            <TipItem text="Ensure there is good lighting on the object." />
            <TipItem text="Place the item on a plain, uncluttered background." />
            <TipItem text="Spread out multiple items if scanning a group." />
          </View>
        </ScrollView>
      </SafeAreaView>

      {/* Loading Overlay */}
      {isProcessing && (
        <View className="absolute inset-0 bg-black/60 items-center justify-center z-50 backdrop-blur-sm">
          <View className="bg-white rounded-3xl p-8 items-center w-64 shadow-2xl">
            <ActivityIndicator size="large" color="#3B6E4D" className="mb-4" />
            <Text className="font-poppinsBold text-lg text-craftopia-textPrimary mb-1">
              Analyzing...
            </Text>
            <Text className="text-center text-sm text-craftopia-textSecondary font-nunito">
              Identifying materials and generating ideas
            </Text>
          </View>
        </View>
      )}
    </View>
  );
};

export default CraftScanScreen;