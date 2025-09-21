// apps/mobile/src/components/feed/TrendingTagItem.tsx - WITH GROWTH
import React from 'react'
import { Text, TouchableOpacity, View } from 'react-native'
import { TrendingUp } from 'lucide-react-native'

interface TrendingTagProps {
  tag: string
  count: number
  growth?: number
}

export const TrendingTagItem = ({ tag, count, growth }: TrendingTagProps) => (
  <TouchableOpacity className="bg-blue-50 rounded-full px-4 py-2 mr-3 min-w-[100px]">
    <View className="flex-row items-center justify-between">
      <View className="flex-1">
        <Text className="text-blue-700 font-semibold text-sm">#{tag}</Text>
        <Text className="text-blue-500 text-xs">{count} posts</Text>
      </View>
      {growth && (
        <View className="flex-row items-center ml-2">
          <TrendingUp size={12} color="#10B981" />
          <Text className="text-green-600 text-xs ml-1">+{growth}%</Text>
        </View>
      )}
    </View>
  </TouchableOpacity>
)