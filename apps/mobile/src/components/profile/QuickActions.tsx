// QuickActions.tsx
import React from 'react'
import { View, Text, TouchableOpacity, Dimensions } from 'react-native'
import { LucideIcon } from 'lucide-react-native'

interface QuickAction {
  label: string
  icon: LucideIcon
  color: 'primary' | 'growth' | 'accent'
  onPress: () => void
  badge?: number // Optional badge count
}

interface QuickActionsProps {
  actions: QuickAction[]
}

const colorMap = {
  primary: '#6366F1', // Subtle indigo
  growth: '#10B981', // Subtle emerald
  accent: '#F59E0B',  // Subtle amber
}

export const QuickActions: React.FC<QuickActionsProps> = ({ actions }) => {
  const screenWidth = Dimensions.get('window').width
  const itemWidth = (screenWidth - 32) / actions.length // Reduced padding

  return (
    <View className="py-3 px-4 bg-white">
      <View className="flex-row justify-between items-center">
        {actions.map((action, index) => {
          const Icon = action.icon
          
          return (
            <TouchableOpacity
              key={index}
              className="items-center"
              style={{ width: itemWidth }}
              onPress={action.onPress}
              activeOpacity={0.6}
            >
              {/* Minimalist circular button */}
              <View className="relative mb-1">
                <View 
                  className="w-11 h-11 rounded-full items-center justify-center"
                  style={{
                    backgroundColor: colorMap[action.color] + '15', // 15% opacity
                  }}
                >
                  <Icon 
                    size={18} 
                    color={colorMap[action.color]} 
                    strokeWidth={1.8}
                  />
                </View>

                {/* Minimal badge */}
                {action.badge && action.badge > 0 && (
                  <View className="absolute -top-0.5 -right-0.5 bg-red-500 rounded-full w-4 h-4 items-center justify-center">
                    <Text className="text-white text-xs font-medium">
                      {action.badge > 9 ? '9+' : action.badge}
                    </Text>
                  </View>
                )}
              </View>

              {/* Minimal label */}
              <Text 
                className="text-gray-600 text-center"
                style={{ 
                  fontSize: 11,
                  maxWidth: itemWidth - 4
                }}
                numberOfLines={1}
              >
                {action.label}
              </Text>
            </TouchableOpacity>
          )
        })}
      </View>
    </View>
  )
}