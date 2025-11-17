import React from 'react'
import { View, Text, FlatList, TouchableOpacity, SafeAreaView, ScrollView } from 'react-native'
import { useRoute } from '@react-navigation/native'

type RouteParams = {
  craftTitle: string
  materials: string[]
  steps: string[]
}

export const CraftDetailsScreen: React.FC = () => {
  const route = useRoute<any>()
  const { craftTitle, materials, steps } = route.params as RouteParams

  return (
    <SafeAreaView className="flex-1 bg-[#FFF9F0] px-5 pt-4">
      <ScrollView>
        <Text className="text-2xl font-bold text-[#2B4A2F] mb-2">{craftTitle}</Text>

        {/* Materials Section */}
        <View className="bg-white rounded-xl p-4 mb-4 shadow-sm shadow-black/6">
          <Text className="text-lg font-bold text-[#2B4A2F] mb-2">Materials</Text>
          {materials.length > 0 ? (
            <FlatList
              data={materials}
              keyExtractor={(item, idx) => `${item}-${idx}`}
              renderItem={({ item }) => (
                <View className="flex-row items-center mb-1">
                  <View className="w-2 h-2 bg-[#6CAC73] rounded-full mr-2" />
                  <Text className="text-[#3B3B3B]">{item}</Text>
                </View>
              )}
            />
          ) : (
            <Text className="text-[#3B3B3B] text-sm">No materials specified.</Text>
          )}
        </View>

        {/* Steps Section */}
        <View className="bg-white rounded-xl p-4 mb-4 shadow-sm shadow-black/6">
          <Text className="text-lg font-bold text-[#2B4A2F] mb-2">Steps</Text>
          {steps.length > 0 ? (
            <FlatList
              data={steps}
              keyExtractor={(item, idx) => `${item}-${idx}`}
              renderItem={({ item, index }) => (
                <View className="flex-row mb-2">
                  <Text className="font-bold text-[#6CAC73] mr-2">{index + 1}.</Text>
                  <Text className="text-[#3B3B3B] flex-shrink">{item}</Text>
                </View>
              )}
            />
          ) : (
            <Text className="text-[#3B3B3B] text-sm">No steps provided.</Text>
          )}
        </View>

        {/* Optional AR View Button */}
        <TouchableOpacity className="bg-[#6CAC73] py-3 rounded-xl items-center mb-6">
          <Text className="text-white font-bold text-base">🔍 View in AR</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  )
}

export default CraftDetailsScreen
