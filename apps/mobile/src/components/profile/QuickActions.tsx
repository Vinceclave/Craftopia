// QuickActions.tsx - Ultra compact version
import React from 'react'
import { View, Text, TouchableOpacity } from 'react-native'
import { LucideIcon } from 'lucide-react-native'

interface QuickAction {
  label: string
  icon: LucideIcon
  color: 'primary' | 'accent' | 'success' | 'warning'
  onPress: () => void
  badge?: number
}

interface QuickActionsProps {
  actions: QuickAction[]
}

export const QuickActions: React.FC<QuickActionsProps> = ({ actions }) => {
  const getColorClasses = (color: string) => {
    const colorMap = {
      primary: { text: 'text-craftopia-primary', bg: 'bg-craftopia-primary/10' },
      accent: { text: 'text-craftopia-accent', bg: 'bg-craftopia-accent/10' },
      success: { text: 'text-craftopia-success', bg: 'bg-craftopia-success/10' },
      warning: { text: 'text-craftopia-warning', bg: 'bg-craftopia-warning/10' },
    }
    return colorMap[color as keyof typeof colorMap] || colorMap.primary
  }

  return (
    <View className="px-4 py-2 bg-craftopia-surface border-b border-craftopia-light/30">
      <View className="flex-row justify-between items-center">
        {actions.map((action, index) => {
          const Icon = action.icon
          const colorClasses = getColorClasses(action.color)
          
          return (
            <TouchableOpacity
              key={index}
              className="items-center flex-1 mx-0.5"
              onPress={action.onPress}
              activeOpacity={0.7}
            >
              <View className="relative mb-1">
                <View className={`w-8 h-8 rounded-lg ${colorClasses.bg} items-center justify-center border border-craftopia-light/20`}>
                  <Icon size={14} className={colorClasses.text} />
                </View>
                
                {action.badge && action.badge > 0 && (
                  <View className="absolute -top-0.5 -right-0.5 bg-red-500 rounded-full w-3 h-3 items-center justify-center border border-craftopia-surface">
                    <Text className="text-craftopia-surface font-bold" style={{ fontSize: 8, lineHeight: 12 }}>
                      {action.badge > 9 ? '9+' : action.badge}
                    </Text>
                  </View>
                )}
              </View>
              
              <Text 
                className="text-craftopia-textPrimary font-medium text-center px-0.5"
                numberOfLines={1}
                style={{ fontSize: 10, lineHeight: 12 }}
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