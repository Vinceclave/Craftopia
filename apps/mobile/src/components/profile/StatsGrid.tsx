import { LucideIcon } from 'lucide-react-native';
import React from 'react';
import { View, Text } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

interface StatItem {
  label: string;
  value: string | number;
  icon: LucideIcon;
}

interface StatsGridProps {
  stats: StatItem[];
}

export const StatsGrid: React.FC<StatsGridProps> = ({ stats }) => {
  const Stat: React.FC<StatItem & { fullWidth?: boolean; index: number }> = ({ 
    label, value, icon: Icon, fullWidth, index 
  }) => (
    <View className={`${fullWidth ? 'w-full' : 'w-1/2'} p-1`}>
      <LinearGradient
        colors={
          index === 0 ? ['#667eea', '#764ba2'] :
          index === 1 ? ['#f093fb', '#f5576c'] :
          ['#4facfe', '#00f2fe']
        }
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        className="rounded-lg overflow-hidden shadow-sm p-4"
      >
        <View className="flex-row justify-between items-start">
          <Icon size={36} color="#fff"/>
        </View>
        <Text className="text-white font-bold text-2xl mt-2">{value}</Text>
        <Text className="text-white/70 text-sm">{label}</Text>
      </LinearGradient>
    </View>
  );

  return (
    <View className="px-0">
      <View className="mb-3">
        <Text className="text-lg font-bold text-gray-800 mb-1">Analytics Overview</Text>
        <View className="h-1 w-10 bg-craftopia-primary rounded-full" />
      </View>

      <View className="flex-row flex-wrap -mx-1">
        {stats.map((stat, index) => (
          <Stat key={index} {...stat} index={index} fullWidth={index === 2} />
        ))}
      </View>
    </View>
  );
};
