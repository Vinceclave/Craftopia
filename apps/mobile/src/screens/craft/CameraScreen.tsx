// apps/mobile/src/screens/CameraCraft.tsx

import React, { useState, useRef, useEffect } from 'react';
import {
  SafeAreaView,
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Alert,
  Image,
} from 'react-native';
import {
  Camera,
  X,
  CheckCircle,
  Sparkles,
  Recycle,
  Clock,
  Star,
  ArrowRight,
  Lightbulb,
  Leaf,
} from 'lucide-react-native';
import * as ImagePicker from 'expo-image-picker';
import axios from 'axios';
import { API_BASE_URL, API_ENDPOINTS } from '../../config/api';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface DetectedMaterial {
  name: string;
  materialType: string;
  quantity: number;
  condition: string;
  characteristics: {
    color: string;
    size: string;
    shape: string;
  };
}

interface MaterialDetectionResult {
  detectedMaterials: DetectedMaterial[];
  imageDescription: string;
  totalItemsDetected: number;
  confidenceScore: number;
  upcyclingPotential: string;
  suggestedCategories: string[];
  notes: string;
}

interface DIYProject {
  title: string;
  description: string;
  difficulty: string;
  estimatedTime: string;
  materials: Array<{ name: string; quantity: string; fromDetected: boolean }>;
  additionalMaterials: Array<{ name: string; quantity: string; optional: boolean }>;
  steps: string[];
  tips: string[];
  outcome: string;
  sustainabilityImpact: string;
  tags: string[];
}

export const CameraCraftScreen = () => {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [detection, setDetection] = useState<MaterialDetectionResult | null>(null);
  const [projects, setProjects] = useState<DIYProject[]>([]);
  const [expandedProject, setExpandedProject] = useState<number | null>(null);

  const getMaterialIcon = (type: string) => {
    const icons: { [key: string]: string } = {
      plastic: '♻️',
      paper: '📄',
      glass: '🫙',
      metal: '🔩',
      electronics: '🔌',
      organic: '🌿',
      textile: '🧵',
      mixed: '📦',
    };
    return icons[type] || '♻️';
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty.toLowerCase()) {
      case 'easy': return { bg: '#7C988515', text: '#7C9885', border: '#7C988530' };
      case 'medium': return { bg: '#FF670015', text: '#FF6700', border: '#FF670030' };
      case 'hard': return { bg: '#004E9815', text: '#004E98', border: '#004E9830' };
      default: return { bg: '#33333315', text: '#333333', border: '#33333330' };
    }
  };

  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    
    if (status !== 'granted') {
      Alert.alert('Permission needed', 'Please grant camera roll permissions');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0]) {
      setSelectedImage(result.assets[0].uri);
      setDetection(null);
      setProjects([]);
    }
  };

  const takePhoto = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    
    if (status !== 'granted') {
      Alert.alert('Permission needed', 'Please grant camera permissions');
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0]) {
      setSelectedImage(result.assets[0].uri);
      setDetection(null);
      setProjects([]);
    }
  };

  const analyzeImage = async () => {
    if (!selectedImage) {
      Alert.alert('No image', 'Please select or take a photo first');
      return;
    }

    setAnalyzing(true);

    try {
      const token = await AsyncStorage.getItem('accessToken');
      
      // Upload image first
      const formData = new FormData();
      formData.append('image', {
        uri: selectedImage,
        type: 'image/jpeg',
        name: 'recyclable.jpg',
      } as any);

      const uploadResponse = await axios.post(
        `${API_BASE_URL}/api/v1/upload/image?folder=materials`,
        formData,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'multipart/form-data',
          },
        }
      );

      const imageUrl = uploadResponse.data.data.imageUrl;

      // Analyze and generate projects
      const analysisResponse = await axios.post(
        API_ENDPOINTS.AI.ANALYZE_AND_GENERATE,
        { imageUrl },
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }
      );

      setDetection(analysisResponse.data.data.detection);
      setProjects(analysisResponse.data.data.projects);

    } catch (error: any) {
      console.error('Analysis error:', error);
      Alert.alert(
        'Analysis Failed',
        error.response?.data?.error || 'Could not analyze image. Please try again.'
      );
    } finally {
      setAnalyzing(false);
    }
  };

  const resetScreen = () => {
    setSelectedImage(null);
    setDetection(null);
    setProjects([]);
    setExpandedProject(null);
  };

  if (!selectedImage) {
    // Initial camera selection screen
    return (
      <SafeAreaView className="flex-1" style={{ backgroundColor: '#F0F0F0' }}>
        <View className="flex-1">
          {/* Header */}
          <View className="px-6 pt-12 pb-8">
            <View className="flex-row items-center mb-2">
              <View 
                className="w-2 h-2 rounded-full mr-3"
                style={{ backgroundColor: '#00A896' }}
              />
              <Text className="text-sm font-semibold tracking-wider uppercase" style={{ color: '#333333' }}>
                AI Camera
              </Text>
            </View>
            <Text className="text-4xl font-black tracking-tight mb-3" style={{ color: '#004E98' }}>
              Scan & Create
            </Text>
            <View className="flex-row items-center">
              <Sparkles size={18} color="#FF6700" />
              <Text className="text-lg font-semibold ml-2" style={{ color: '#333333' }}>
                Detect recyclables & get DIY ideas
              </Text>
            </View>
          </View>

          {/* Camera Options */}
          <View className="flex-1 justify-center px-6">
            <View 
              className="rounded-3xl p-8 mb-6"
              style={{ 
                backgroundColor: '#004E98',
                shadowColor: '#004E98',
                shadowOffset: { width: 0, height: 12 },
                shadowOpacity: 0.3,
                shadowRadius: 24
              }}
            >
              <View className="items-center mb-6">
                <View 
                  className="w-20 h-20 rounded-full items-center justify-center mb-4"
                  style={{ backgroundColor: 'rgba(255, 255, 255, 0.2)' }}
                >
                  <Camera size={40} color="white" />
                </View>
                <Text className="text-white font-black text-2xl text-center mb-2">
                  Start Scanning
                </Text>
                <Text className="text-white text-center opacity-90 text-base">
                  Take a photo of recyclable materials and get instant DIY project ideas
                </Text>
              </View>

              <TouchableOpacity
                onPress={takePhoto}
                className="bg-white rounded-2xl py-4 mb-3"
                activeOpacity={0.8}
              >
                <View className="flex-row items-center justify-center">
                  <Camera size={22} color="#004E98" />
                  <Text className="text-lg font-black ml-3" style={{ color: '#004E98' }}>
                    Take Photo
                  </Text>
                </View>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={pickImage}
                className="bg-white bg-opacity-20 rounded-2xl py-4 border-2 border-white border-opacity-30"
                activeOpacity={0.8}
              >
                <View className="flex-row items-center justify-center">
                  <Image 
                    source={{ uri: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjQiIGhlaWdodD0iMjQiIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48L3N2Zz4=' }}
                    style={{ width: 22, height: 22, tintColor: 'white' }}
                  />
                  <Text className="text-lg font-black text-white ml-3">
                    Choose from Gallery
                  </Text>
                </View>
              </TouchableOpacity>
            </View>

            {/* How it works */}
            <View 
              className="rounded-2xl p-6"
              style={{ 
                backgroundColor: 'white',
                borderWidth: 1,
                borderColor: 'rgba(0, 0, 0, 0.05)'
              }}
            >
              <Text className="font-black text-lg mb-4" style={{ color: '#004E98' }}>
                How it works
              </Text>
              <View className="space-y-3">
                {[
                  { icon: '📸', text: 'Take or upload a photo of recyclables' },
                  { icon: '🔍', text: 'AI identifies materials instantly' },
                  { icon: '💡', text: 'Get personalized DIY project ideas' },
                  { icon: '🎨', text: 'Start crafting with step-by-step guides' },
                ].map((step, index) => (
                  <View key={index} className="flex-row items-center mb-3">
                    <View 
                      className="w-10 h-10 rounded-xl items-center justify-center mr-3"
                      style={{ backgroundColor: '#F0F0F0' }}
                    >
                      <Text className="text-xl">{step.icon}</Text>
                    </View>
                    <Text className="flex-1 font-medium" style={{ color: '#333333' }}>
                      {step.text}
                    </Text>
                  </View>
                ))}
              </View>
            </View>
          </View>
        </View>
      </SafeAreaView>
    );
  }

  // Image analysis screen
  return (
    <SafeAreaView className="flex-1" style={{ backgroundColor: '#F0F0F0' }}>
      <ScrollView 
        className="flex-1"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 100 }}
      >
        {/* Header with close button */}
        <View className="px-6 pt-12 pb-6 flex-row justify-between items-center">
          <View className="flex-1">
            <Text className="text-3xl font-black" style={{ color: '#004E98' }}>
              {detection ? 'Materials Found' : 'Analyzing...'}
            </Text>
          </View>
          <TouchableOpacity
            onPress={resetScreen}
            className="w-12 h-12 rounded-full items-center justify-center"
            style={{ backgroundColor: 'rgba(0, 0, 0, 0.05)' }}
          >
            <X size={24} color="#333333" />
          </TouchableOpacity>
        </View>

        {/* Selected Image */}
        <View className="px-6 mb-6">
          <View 
            className="rounded-2xl overflow-hidden"
            style={{ 
              shadowColor: '#000',
              shadowOffset: { width: 0, height: 8 },
              shadowOpacity: 0.1,
              shadowRadius: 16
            }}
          >
            <Image
              source={{ uri: selectedImage }}
              className="w-full h-64"
              resizeMode="cover"
            />
            {!detection && !analyzing && (
              <View className="absolute inset-0 bg-black bg-opacity-40 items-center justify-center">
                <TouchableOpacity
                  onPress={analyzeImage}
                  className="bg-white rounded-2xl px-8 py-4"
                  activeOpacity={0.8}
                >
                  <View className="flex-row items-center">
                    <Sparkles size={20} color="#004E98" />
                    <Text className="font-black text-lg ml-2" style={{ color: '#004E98' }}>
                      Analyze Image
                    </Text>
                  </View>
                </TouchableOpacity>
              </View>
            )}
          </View>
        </View>

        {/* Loading State */}
        {analyzing && (
          <View className="px-6 mb-6">
            <View 
              className="rounded-2xl p-6 items-center"
              style={{ backgroundColor: '#004E9810' }}
            >
              <ActivityIndicator size="large" color="#004E98" />
              <Text className="font-bold text-lg mt-4" style={{ color: '#004E98' }}>
                Analyzing materials...
              </Text>
              <Text className="text-center mt-2" style={{ color: '#333333' }}>
                AI is identifying recyclable items and generating project ideas
              </Text>
            </View>
          </View>
        )}

        {/* Detection Results */}
        {detection && (
          <>
            {/* Detection Summary */}
            <View className="px-6 mb-6">
              <View 
                className="rounded-2xl p-6"
                style={{ 
                  backgroundColor: 'white',
                  borderWidth: 1,
                  borderColor: 'rgba(0, 0, 0, 0.05)'
                }}
              >
                <View className="flex-row items-center justify-between mb-4">
                  <View className="flex-row items-center">
                    <CheckCircle size={24} color="#7C9885" />
                    <Text className="font-black text-xl ml-2" style={{ color: '#004E98' }}>
                      Detection Complete
                    </Text>
                  </View>
                  <View 
                    className="px-3 py-1 rounded-full"
                    style={{ backgroundColor: '#7C988520' }}
                  >
                    <Text className="font-bold text-sm" style={{ color: '#7C9885' }}>
                      {Math.round(detection.confidenceScore * 100)}% confident
                    </Text>
                  </View>
                </View>

                <Text className="mb-4 leading-relaxed" style={{ color: '#333333' }}>
                  {detection.imageDescription}
                </Text>

                <View className="flex-row justify-between">
                  <View>
                    <Text className="text-sm opacity-60 mb-1" style={{ color: '#333333' }}>
                      Items Found
                    </Text>
                    <Text className="font-black text-2xl" style={{ color: '#004E98' }}>
                      {detection.totalItemsDetected}
                    </Text>
                  </View>
                  <View>
                    <Text className="text-sm opacity-60 mb-1" style={{ color: '#333333' }}>
                      Potential
                    </Text>
                    <Text 
                      className="font-black text-2xl capitalize"
                      style={{ 
                        color: detection.upcyclingPotential === 'high' ? '#7C9885' :
                               detection.upcyclingPotential === 'medium' ? '#FF6700' : '#333333'
                      }}
                    >
                      {detection.upcyclingPotential}
                    </Text>
                  </View>
                </View>
              </View>
            </View>

            {/* Detected Materials */}
            <View className="px-6 mb-6">
              <View className="flex-row items-center mb-4">
                <Recycle size={20} color="#00A896" />
                <Text className="font-black text-xl ml-2" style={{ color: '#004E98' }}>
                  Detected Materials
                </Text>
              </View>
              <View className="space-y-3">
                {detection.detectedMaterials.map((material, index) => (
                  <View
                    key={index}
                    className="rounded-2xl p-4 flex-row items-center"
                    style={{ 
                      backgroundColor: 'white',
                      borderWidth: 1,
                      borderColor: 'rgba(0, 0, 0, 0.05)'
                    }}
                  >
                    <View 
                      className="w-12 h-12 rounded-xl items-center justify-center mr-3"
                      style={{ backgroundColor: '#F0F0F0' }}
                    >
                      <Text className="text-2xl">
                        {getMaterialIcon(material.materialType)}
                      </Text>
                    </View>
                    <View className="flex-1">
                      <Text className="font-bold text-base mb-1" style={{ color: '#004E98' }}>
                        {material.name}
                      </Text>
                      <View className="flex-row items-center">
                        <Text className="text-sm mr-3" style={{ color: '#333333' }}>
                          Qty: {material.quantity}
                        </Text>
                        <View 
                          className="px-2 py-1 rounded-lg"
                          style={{ 
                            backgroundColor: material.condition === 'good' ? '#7C988515' :
                                           material.condition === 'fair' ? '#FF670015' : '#33333315'
                          }}
                        >
                          <Text 
                            className="text-xs font-bold capitalize"
                            style={{ 
                              color: material.condition === 'good' ? '#7C9885' :
                                     material.condition === 'fair' ? '#FF6700' : '#333333'
                            }}
                          >
                            {material.condition}
                          </Text>
                        </View>
                      </View>
                    </View>
                  </View>
                ))}
              </View>
            </View>

            {/* DIY Projects */}
            {projects.length > 0 && (
              <View className="px-6 mb-6">
                <View className="flex-row items-center mb-4">
                  <Lightbulb size={20} color="#FF6700" />
                  <Text className="font-black text-xl ml-2" style={{ color: '#004E98' }}>
                    DIY Project Ideas
                  </Text>
                </View>

                {projects.map((project, index) => {
                  const isExpanded = expandedProject === index;
                  const diffColors = getDifficultyColor(project.difficulty);

                  return (
                    <TouchableOpacity
                      key={index}
                      onPress={() => setExpandedProject(isExpanded ? null : index)}
                      className="rounded-2xl mb-4 overflow-hidden"
                      style={{ 
                        backgroundColor: 'white',
                        shadowColor: '#000',
                        shadowOffset: { width: 0, height: 4 },
                        shadowOpacity: 0.08,
                        shadowRadius: 12,
                        borderWidth: 1,
                        borderColor: 'rgba(0, 0, 0, 0.05)'
                      }}
                      activeOpacity={0.9}
                    >
                      {/* Project Header */}
                      <View className="p-5">
                        <View className="flex-row justify-between items-start mb-3">
                          <View className="flex-1 pr-3">
                            <Text className="font-black text-lg mb-2" style={{ color: '#004E98' }}>
                              {project.title}
                            </Text>
                            <Text className="leading-relaxed" style={{ color: '#333333' }}>
                              {project.description}
                            </Text>
                          </View>
                          <View 
                            className="px-3 py-2 rounded-xl"
                            style={{ 
                              backgroundColor: diffColors.bg,
                              borderWidth: 1,
                              borderColor: diffColors.border
                            }}
                          >
                            <Text className="font-bold text-xs" style={{ color: diffColors.text }}>
                              {project.difficulty.toUpperCase()}
                            </Text>
                          </View>
                        </View>

                        <View className="flex-row items-center">
                          <Clock size={16} color="#333333" />
                          <Text className="font-medium ml-2 mr-4" style={{ color: '#333333' }}>
                            {project.estimatedTime}
                          </Text>
                          <Leaf size={16} color="#7C9885" />
                          <Text className="font-medium ml-2 flex-1" style={{ color: '#7C9885' }}>
                            Eco-friendly
                          </Text>
                          <ArrowRight 
                            size={20} 
                            color="#004E98"
                            style={{ 
                              transform: [{ rotate: isExpanded ? '90deg' : '0deg' }]
                            }}
                          />
                        </View>
                      </View>

                      {/* Expanded Content */}
                      {isExpanded && (
                        <View 
                          className="px-5 pb-5 pt-2"
                          style={{ borderTopWidth: 1, borderTopColor: 'rgba(0, 0, 0, 0.05)' }}
                        >
                          {/* Materials */}
                          <Text className="font-bold mb-2" style={{ color: '#004E98' }}>
                            Materials Needed:
                          </Text>
                          {project.materials.map((mat, i) => (
                            <View key={i} className="flex-row items-center mb-1">
                              <Text className="text-2xl mr-2">•</Text>
                              <Text style={{ color: '#333333' }}>
                                {mat.quantity} {mat.name}
                                {mat.fromDetected && (
                                  <Text style={{ color: '#7C9885' }}> (detected)</Text>
                                )}
                              </Text>
                            </View>
                          ))}

                          {/* Additional Materials */}
                          {project.additionalMaterials.length > 0 && (
                            <>
                              <Text className="font-bold mt-3 mb-2" style={{ color: '#004E98' }}>
                                Additional Items:
                              </Text>
                              {project.additionalMaterials.map((mat, i) => (
                                <View key={i} className="flex-row items-center mb-1">
                                  <Text className="text-2xl mr-2">•</Text>
                                  <Text style={{ color: '#333333' }}>
                                    {mat.quantity} {mat.name}
                                    {mat.optional && (
                                      <Text style={{ color: '#888' }}> (optional)</Text>
                                    )}
                                  </Text>
                                </View>
                              ))}
                            </>
                          )}

                          {/* Steps */}
                          <Text className="font-bold mt-4 mb-2" style={{ color: '#004E98' }}>
                            Steps:
                          </Text>
                          {project.steps.map((step, i) => (
                            <View key={i} className="flex-row mb-2">
                              <Text className="font-bold mr-2" style={{ color: '#004E98' }}>
                                {i + 1}.
                              </Text>
                              <Text className="flex-1" style={{ color: '#333333' }}>
                                {step}
                              </Text>
                            </View>
                          ))}

                          {/* Tips */}
                          {project.tips.length > 0 && (
                            <>
                              <View 
                                className="rounded-xl p-4 mt-4"
                                style={{ backgroundColor: '#FF670010' }}
                              >
                                <Text className="font-bold mb-2" style={{ color: '#FF6700' }}>
                                  💡 Pro Tips:
                                </Text>
                                {project.tips.map((tip, i) => (
                                  <Text key={i} className="mb-1" style={{ color: '#333333' }}>
                                    • {tip}
                                  </Text>
                                ))}
                              </View>
                            </>
                          )}

                          {/* Sustainability Impact */}
                          <View 
                            className="rounded-xl p-4 mt-3"
                            style={{ backgroundColor: '#7C988510' }}
                          >
                            <View className="flex-row items-center mb-2">
                              <Leaf size={18} color="#7C9885" />
                              <Text className="font-bold ml-2" style={{ color: '#7C9885' }}>
                                Environmental Impact
                              </Text>
                            </View>
                            <Text style={{ color: '#333333' }}>
                              {project.sustainabilityImpact}
                            </Text>
                          </View>
                        </View>
                      )}
                    </TouchableOpacity>
                  );
                })}
              </View>
            )}
          </>
        )}
      </ScrollView>

      {/* Bottom Action Bar */}
      {detection && (
        <View 
          className="absolute bottom-0 left-0 right-0 px-6 py-4"
          style={{ 
            backgroundColor: 'white',
            shadowColor: '#000',
            shadowOffset: { width: 0, height: -4 },
            shadowOpacity: 0.1,
            shadowRadius: 12
          }}
        >
          <TouchableOpacity
            onPress={resetScreen}
            className="rounded-2xl py-4"
            style={{ backgroundColor: '#004E98' }}
            activeOpacity={0.8}
          >
            <Text className="text-white font-black text-center text-lg">
              Scan Another Item
            </Text>
          </TouchableOpacity>
        </View>
      )}
    </SafeAreaView>
  );
};