import { ArrowLeft } from 'lucide-react-native'
import React from 'react'
import { Text, View } from 'react-native'
import Button from '~/components/common/Button'

interface DetailHeaderProp {
  onBackPress: () => void
  questId: number
}

export const DetailHeader: React.FC<DetailHeaderProp> = ({ onBackPress, questId }) => {
  return (
    <View className="bg-craftopia-surface px-4 py-3 border-b border-craftopia-light">
      <View className="flex-row items-center">
        <Button
          onPress={onBackPress}
          title=""
          iconOnly
          leftIcon={<ArrowLeft size={16} color="#1A1A1A" />}
          className="bg-transparent p-1 mr-2"
        />
        <View>
          <Text className="text-sm font-semibold text-craftopia-textPrimary">
            Quest Details
          </Text>
          <Text className="text-xs text-craftopia-textSecondary">
            Challenge #{questId}
          </Text>
        </View>
      </View>
    </View>
  )
}
