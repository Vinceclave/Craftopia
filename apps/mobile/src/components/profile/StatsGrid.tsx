import React from 'react'
import { View, Text } from 'react-native'
import { LucideIcon } from 'lucide-react-native'

interface StatItem {
  label: string
  value: string
  icon: LucideIcon
}

interface StatsGridProps {
  stats: StatItem[]
}

export const StatsGrid: React.FC<StatsGridProps> = ({ stats }) => {
  return (
    <View className="p-4 bg-craftopia-surface rounded-xl shadow-sm">
      <Text className="text-lg font-semibold text-craftopia-textPrimary mb-4">
        Overview
      </Text>
      <View className="flex-row justify-between">
        {stats.map((stat, i) => {
          const Icon = stat.icon
          return (
            <View key={i} className="flex-1 items-center">
              <View className="w-10 h-10 rounded-full bg-craftopia-primary/10 items-center justify-center mb-2">
                <Icon size={18} color="#004E98" />
              </View>
              <Text className="text-base font-bold text-craftopia-textPrimary">
                {stat.value}
              </Text>
              <Text className="text-xs text-craftopia-textSecondary mt-0.5">
                {stat.label}
              </Text>
            </View>
          )
        })}
      </View>
    </View>
  )
}
