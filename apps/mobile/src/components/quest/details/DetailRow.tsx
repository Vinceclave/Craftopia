import React from 'react'
import { View, Text } from 'react-native'
import { Tag, Calendar, Clock, Box } from 'lucide-react-native'

interface DetailRowProp {
  category: string
  materialType: string
  created_at: string
  expire_at?: string
}

export const DetailRow: React.FC<DetailRowProp> = ({
  category,
  materialType,
  created_at,
  expire_at
}) => {
  const formatDate = (dateStr: string) =>
    new Date(dateStr).toLocaleDateString(undefined, {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })

  return (
    <View className="mx-4 my-3 p-3 bg-craftopia-surface rounded-lg border border-craftopia-light">
      <View className="flex-row items-center mb-2">
        <Tag size={14} color="#6B7280" />
        <Text className="text-craftopia-textPrimary text-sm font-medium ml-2">{category}</Text>
      </View>

      <View className="flex-row items-center mb-2">
        <Box size={14} color="#6B7280" />
        <Text className="text-craftopia-textSecondary text-sm ml-2">{materialType}</Text>
      </View>

      <View className="flex-row items-center mb-2">
        <Calendar size={14} color="#6B7280" />
        <Text className="text-craftopia-textSecondary text-sm ml-2">Created: {formatDate(created_at)}</Text>
      </View>

      {expire_at && (
        <View className="flex-row items-center">
          <Clock size={14} color="#6B7280" />
          <Text className="text-craftopia-textSecondary text-sm ml-2">Expires: {formatDate(expire_at)}</Text>
        </View>
      )}
    </View>
  )
}   