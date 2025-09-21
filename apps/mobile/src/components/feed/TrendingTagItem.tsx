import React from 'react'
import { Text, TouchableOpacity } from 'react-native'
import { TrendingUp } from 'lucide-react-native'

interface TrendingTagProps {
  tag: string
  count: number
  growth: number
}

export const TrendingTagItem = ({ tag, count, growth }: TrendingTagProps) => (
  <TouchableOpacity className="bg-gray-50 rounded-full px-4 py-2 mr-3 flex-row items-center">
    <TrendingUp size={14} color="#10B981" />
    <Text className="text-gray-800 font-medium ml-1">#{tag}</Text>
    <Text className="text-xs text-gray-500 ml-2">{count}</Text>
    <Text className="text-xs text-green-600 ml-1">+{growth}%</Text>
  </TouchableOpacity>
)
 