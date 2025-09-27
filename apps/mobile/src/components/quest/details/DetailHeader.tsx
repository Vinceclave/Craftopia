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
    <View className="p-4 bg-craftopia-surface rounded-lg border border-craftopia-light">
      <View className="flex-row items-center">
        <Button
          onPress={onBackPress}
          title=""
          iconOnly
          leftIcon={<ArrowLeft size={18} className="text-craftopia-textPrimary" />}
          className="bg-transparent p-2 mr-3"
        />
        <View className="flex-1">
          <Text className="text-base font-semibold text-craftopia-textPrimary">
            Quest Details
          </Text>
          <Text className="text-sm text-craftopia-textSecondary mt-1">
            Challenge #{questId}
          </Text>
        </View>
      </View>
    </View>
  )
}