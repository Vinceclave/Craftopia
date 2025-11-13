// QuickActions.tsx — Final refined version
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
      primary: { 
        text: 'text-craftopia-primary', 
        bg: 'bg-craftopia-primary/10',
        border: 'border-craftopia-primary/20',
        solid: 'bg-craftopia-primary'
      },
      accent: { 
        text: 'text-craftopia-accent', 
        bg: 'bg-craftopia-accent/10',
        border: 'border-craftopia-accent/20',
        solid: 'bg-craftopia-accent'
      },
      success: { 
        text: 'text-craftopia-success', 
        bg: 'bg-craftopia-success/10',
        border: 'border-craftopia-success/20',
        solid: 'bg-craftopia-success'
      },
      warning: { 
        text: 'text-craftopia-warning', 
        bg: 'bg-craftopia-warning/10',
        border: 'border-craftopia-warning/20',
        solid: 'bg-craftopia-warning'
      },
    }
    return colorMap[color as keyof typeof colorMap] || colorMap.primary
  }

  return (
    <View className="bg-craftopia-surface px-4 py-3 border-b border-craftopia-light">
      <View className="flex-row justify-between items-center">
        {actions.map((action, index) => {
          const Icon = action.icon
          const colorClasses = getColorClasses(action.color)
          
          return (
            <TouchableOpacity
              key={index}
              className="items-center flex-1 mx-1"
              onPress={action.onPress}
              activeOpacity={0.8}
            >
              <View className="relative mb-1.5">
                <View
                  className={`w-9 h-9 rounded-lg ${colorClasses.bg} items-center justify-center border ${colorClasses.border}`}
                >
                  <Icon size={16} className={colorClasses.text} />
                </View>

                {/* Badge */}
                {action.badge && action.badge > 0 && (
                  <View className="absolute -top-1 -right-1 bg-craftopia-warning rounded-full w-4 h-4 items-center justify-center border border-craftopia-surface">
                    <Text
                      className="text-craftopia-surface font-poppinsBold"
                      style={{ fontSize: 8, lineHeight: 10 }}
                    >
                      {action.badge > 9 ? '9+' : action.badge}
                    </Text>
                  </View>
                )}
              </View>

              {/* Label */}
              <Text
                className="text-xs font-nunito text-craftopia-textPrimary text-center"
                numberOfLines={1}
                style={{ fontSize: 11 }}
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