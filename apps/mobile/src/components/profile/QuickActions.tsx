// QuickActions.tsx
import React from 'react'
import { View, Text, TouchableOpacity, Dimensions } from 'react-native'
import { LucideIcon } from 'lucide-react-native'

interface QuickAction {
  label: string
  icon: LucideIcon
  color: 'primary' | 'growth' | 'accent'  // Keep growth
  onPress: () => void
  badge?: number
}


interface QuickActionsProps {
  actions: QuickAction[]
}

const colorMap = {
  primary: {
    bg: 'bg-craftopia-primary/10',
    icon: 'text-craftopia-primary',
    text: 'text-craftopia-textSecondary'
  },
  growth: {  // Add growth mapping
    bg: 'bg-green-500/10',  // or use your growth color if defined
    icon: 'text-green-500',
    text: 'text-craftopia-textSecondary'
  },
  accent: {
    bg: 'bg-craftopia-accent/10',
    icon: 'text-craftopia-accent',
    text: 'text-craftopia-textSecondary'
  }
}

export const QuickActions: React.FC<QuickActionsProps> = ({ actions }) => {
  const screenWidth = Dimensions.get('window').width
  const itemWidth = (screenWidth - 32) / actions.length // Reduced padding

  return (
    <View className="py-3 px-4 bg-craftopia-surface border-b border-craftopia-primary/5">
      <View className="flex-row justify-between items-center">
        {actions.map((action, index) => {
          const Icon = action.icon
          const colors = colorMap[action.color] || colorMap.primary // Fallback to primary if color not found
          
          return (
            <TouchableOpacity
              key={index}
              className="items-center"
              style={{ width: itemWidth }}
              onPress={action.onPress}
              activeOpacity={0.6}
            >
              <View className="relative mb-1">
                <View className={`w-11 h-11 rounded-full items-center justify-center ${colors.bg}`}>
                  <Icon size={18} className={colors.icon} strokeWidth={1.8} />
                </View>

                {action.badge && action.badge > 0 && (
                  <View className="absolute -top-0.5 -right-0.5 bg-red-500 rounded-full w-4 h-4 items-center justify-center">
                    <Text className="text-craftopia-surface text-xs font-medium">
                      {action.badge > 9 ? '9+' : action.badge}
                    </Text>
                  </View>
                )}
              </View>

              <Text 
                className={`text-xs text-center ${colors.text}`}
                style={{ maxWidth: itemWidth - 4 }}
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