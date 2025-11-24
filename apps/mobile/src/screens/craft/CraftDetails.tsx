import React from 'react'
import { View, Text, FlatList, TouchableOpacity, SafeAreaView, ScrollView, Image } from 'react-native'
import { useRoute, useNavigation } from '@react-navigation/native'
import { NativeStackNavigationProp } from '@react-navigation/native-stack'
import { ArrowLeft, Clock, Heart, Share2, Sparkles, Image as ImageIcon } from 'lucide-react-native'
import { LinearGradient } from 'expo-linear-gradient'

type RouteParams = {
  craftTitle: string
  materials: string[]
  steps: string[]
  generatedImageUrl?: string
  timeNeeded?: string
  quickTip?: string
}

export const CraftDetailsScreen: React.FC = () => {
  const route = useRoute()
  const navigation = useNavigation<NativeStackNavigationProp<any>>()
  const { craftTitle, materials, steps, generatedImageUrl, timeNeeded, quickTip } = route.params as RouteParams

  const [isLiked, setIsLiked] = React.useState(false)
  const [imageError, setImageError] = React.useState(false)

  const handleBack = () => {
    navigation.goBack()
  }

  const getDifficultyFromTime = (time: string): string => {
    const minutes = parseInt(time.match(/\d+/)?.[0] || '0')
    if (minutes <= 20) return 'Easy'
    if (minutes <= 35) return 'Medium'
    return 'Hard'
  }

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty.toLowerCase()) {
      case 'easy':
        return 'text-[#5BA776]'
      case 'medium':
        return 'text-[#E6B655]'
      case 'hard':
        return 'text-[#E66555]'
      default:
        return 'text-[#5F6F64]'
    }
  }

  const difficulty = timeNeeded ? getDifficultyFromTime(timeNeeded) : 'Medium'

  // Debug: Check if image URL is received
  console.log('Generated Image URL:', generatedImageUrl)

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
            <View className="flex-1">
              <Text className="text-lg font-bold text-[#1F2A1F] font-poppinsBold" numberOfLines={1}>
                {craftTitle}
              </Text>
            </View>
          </View>
          
          <View className="flex-row items-center space-x-2">
            <TouchableOpacity
              onPress={() => setIsLiked(!isLiked)}
              className="w-9 h-9 rounded-full bg-[#F0F4F2] items-center justify-center"
            >
              <Heart 
                size={18} 
                color={isLiked ? "#E66555" : "#5F6F64"} 
                fill={isLiked ? "#E66555" : "transparent"}
              />
            </TouchableOpacity>
            <TouchableOpacity className="w-9 h-9 rounded-full bg-[#F0F4F2] items-center justify-center">
              <Share2 size={18} color="#5F6F64" />
            </TouchableOpacity>
          </View>
        </View>

        {/* Meta Info */}
        {timeNeeded && (
          <View className="flex-row items-center mt-3 space-x-3">
            <View className="flex-row items-center bg-[#F0F4F2] px-3 py-1.5 rounded-lg">
              <Clock size={14} color="#5F6F64" />
              <Text className="text-sm text-[#5F6F64] ml-1 font-nunito">
                {timeNeeded}
              </Text>
            </View>
            <View className="flex-row items-center bg-[#F0F4F2] px-3 py-1.5 rounded-lg">
              <Text className={`text-sm font-semibold font-nunito ${getDifficultyColor(difficulty)}`}>
                {difficulty}
              </Text>
            </View>
            <View className="flex-row items-center bg-[#F0F4F2] px-3 py-1.5 rounded-lg">
              <Sparkles size={14} color="#E6B655" />
              <Text className="text-sm text-[#5F6F64] ml-1 font-nunito">
                {steps.length} steps
              </Text>
            </View>
          </View>
        )}
      </View>

      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        {/* Generated Image */}
        {generatedImageUrl && !imageError ? (
          <View className="mx-4 mt-4">
            <View className="relative rounded-2xl overflow-hidden">
              <Image
                source={{ uri: generatedImageUrl }}
                className="w-full h-60"
                resizeMode="cover"
                onError={() => {
                  console.log('Image failed to load')
                  setImageError(true)
                }}
                onLoad={() => console.log('Image loaded successfully')}
              />
              <LinearGradient
                colors={['transparent', 'rgba(31,42,31,0.5)']}
                className="absolute inset-0"
              />
              
              {/* AI Generated Badge */}
              <View className="absolute top-3 right-3 bg-[#E6B655]/90 backdrop-blur-sm rounded-full px-3 py-1.5 flex-row items-center">
                <Sparkles size={12} color="#FFFFFF" />
                <Text className="text-xs font-semibold text-white ml-1 font-nunito">
                  AI Generated
                </Text>
              </View>
            </View>
          </View>
        ) : (
          // Fallback when no image or image failed to load
          <View className="mx-4 mt-4">
            <View className="relative rounded-2xl overflow-hidden bg-[#F0F4F2] h-60 items-center justify-center">
              <ImageIcon size={48} color="#5F6F64" />
              <Text className="text-[#5F6F64] font-nunito mt-2">
                {imageError ? 'Failed to load image' : 'No preview available'}
              </Text>
              {generatedImageUrl && imageError && (
                <View className="absolute top-3 right-3 bg-[#E6B655]/90 rounded-full px-3 py-1.5">
                  <Text className="text-xs font-semibold text-white font-nunito">
                    AI Generated
                  </Text>
                </View>
              )}
            </View>
          </View>
        )}

        {/* Quick Tip Section */}
        {quickTip && (
          <View className="mx-4 mt-4">
            <View className="bg-[#FFF9E6] rounded-xl p-4 border border-[#E6B655]/20">
              <View className="flex-row items-start">
                <Sparkles size={16} color="#E6B655" className="mt-0.5 mr-3" />
                <View className="flex-1">
                  <Text className="text-sm font-semibold text-[#B48E2C] mb-1 font-nunito">
                    Quick Tip
                  </Text>
                  <Text className="text-sm text-[#5F6F64] font-nunito leading-5">
                    {quickTip}
                  </Text>
                </View>
              </View>
            </View>
          </View>
        )}

        {/* Rest of your existing components... */}
        {/* Materials Section */}
        <View className="mx-4 mt-6">
          <View className="flex-row items-center mb-3">
            <View className="w-8 h-8 rounded-xl bg-[#3B6E4D]/10 items-center justify-center mr-2">
              <Text className="text-lg font-bold text-[#3B6E4D]">📦</Text>
            </View>
            <View>
              <Text className="text-lg font-bold text-[#1F2A1F] font-poppinsBold">
                Materials Needed
              </Text>
              <Text className="text-xs text-[#5F6F64] font-nunito">
                {materials.length} items detected from your scan
              </Text>
            </View>
          </View>

          <View className="bg-white rounded-xl p-4 border border-[#E8ECEB]">
            {materials.length > 0 ? (
              <View className="space-y-2">
                {materials.map((material: string, index: number) => {
                  const match = material.match(/^(.+?)\s*\((\d+)\)$/)
                  const name = match ? match[1].trim() : material
                  const quantity = match ? match[2] : '1'

                  return (
                    <View
                      key={index}
                      className="flex-row items-center justify-between py-2 border-b border-[#F0F4F2] last:border-b-0"
                    >
                      <View className="flex-row items-center flex-1">
                        <View className="w-2 h-2 bg-[#6CAC73] rounded-full mr-3" />
                        <Text className="text-[#3B3B3B] font-nunito flex-1 capitalize">
                          {name}
                        </Text>
                      </View>
                      <Text className="text-sm text-[#5F6F64] font-nunito">
                        Qty: {quantity}
                      </Text>
                    </View>
                  )
                })}
              </View>
            ) : (
              <Text className="text-[#5F6F64] text-sm font-nunito text-center py-4">
                No materials specified.
              </Text>
            )}
          </View>
        </View>

        {/* Steps Section */}
        <View className="mx-4 mt-6 mb-6">
          <View className="flex-row items-center mb-3">
            <View className="w-8 h-8 rounded-xl bg-[#E6B655]/10 items-center justify-center mr-2">
              <Text className="text-lg font-bold text-[#E6B655]">🛠️</Text>
            </View>
            <View>
              <Text className="text-lg font-bold text-[#1F2A1F] font-poppinsBold">
                Step-by-Step Guide
              </Text>
              <Text className="text-xs text-[#5F6F64] font-nunito">
                Follow these {steps.length} steps to create your craft
              </Text>
            </View>
          </View>

          <View className="bg-white rounded-xl p-4 border border-[#E8ECEB]">
            {steps.length > 0 ? (
              <View className="space-y-4">
                {steps.map((step: string, index: number) => (
                  <View key={index} className="flex-row">
                    <View className="w-8 h-8 rounded-full bg-[#3B6E4D] items-center justify-center mr-3 mt-0.5">
                      <Text className="text-white font-bold text-sm font-nunito">
                        {index + 1}
                      </Text>
                    </View>
                    <View className="flex-1">
                      <Text className="text-[#1F2A1F] font-nunito leading-6">
                        {step}
                      </Text>
                    </View>
                  </View>
                ))}
              </View>
            ) : (
              <Text className="text-[#5F6F64] text-sm font-nunito text-center py-4">
                No steps provided.
              </Text>
            )}
          </View>
        </View>

        {/* Action Buttons */}
        <View className="mx-4 mb-8 space-y-3">
          <TouchableOpacity className="bg-[#3B6E4D] py-4 rounded-xl items-center flex-row justify-center">
            <Sparkles size={20} color="#FFFFFF" />
            <Text className="text-white font-bold text-base ml-2 font-poppinsBold">
              View in AR
            </Text>
          </TouchableOpacity>

          <TouchableOpacity className="bg-[#E6B655] py-4 rounded-xl items-center flex-row justify-center">
            <Text className="text-white font-bold text-base font-poppinsBold">
              Save to My Projects
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  )
}

export default CraftDetailsScreen 