import React from 'react'
import { Text, View } from 'react-native'
import Button from '../common/Button'
import { ChevronRight, Target } from 'lucide-react-native'

export interface QuestProps {
  title: string;
  description: string;
  points?: number;
  completed?: boolean;
}

interface HomeQuestProps {
  quests: QuestProps[];
  loading: boolean;
  onSeeAllPress?: () => void;
}

export const HomeQuest: React.FC<HomeQuestProps> = ({ quests, loading, onSeeAllPress }) => {
  return (
    <View className="mx-4 mt-3 p-3 bg-craftopia-surface rounded-lg border border-craftopia-light shadow-sm">
      {/* Header Section */}
      <View className="flex-row items-center justify-between mb-3">
        <View className="flex-row items-center gap-2">
          <View className="w-6 h-6 bg-craftopia-accent/20 rounded-full items-center justify-center">
            <Target size={14} className="text-craftopia-accent" />
          </View>
          <View>
            <Text className="text-sm font-semibold text-craftopia-textPrimary">
              Daily Quests
            </Text>
            <Text className="text-xs text-craftopia-textSecondary">
              Complete challenges, earn rewards
            </Text>
          </View>
        </View>
        
        <Button
          onPress={onSeeAllPress}
          title='See all'
          rightIcon={<ChevronRight size={14} className="text-craftopia-secondary" />}
          size='sm'
          className='bg-transparent px-2'
          textClassName='text-craftopia-secondary text-xs'
        />
      </View>

      {/* Quests List */}
      <View className="gap-2">
        {loading ? (
          <View className="items-center py-2">
            <Text className="text-craftopia-textSecondary text-xs">Loading quests...</Text>
          </View>
        ) : quests.length === 0 ? (
          <View className="items-center py-2">
            <Text className="text-craftopia-textSecondary text-xs">No quests available today</Text>
            <Text className="text-craftopia-textSecondary text-xs">Check back tomorrow!</Text>
          </View>
        ) : (
          quests.slice(0, 2).map((quest, index) => (
            <View key={index} className="p-2 bg-craftopia-primaryLight/10 rounded-lg border border-craftopia-primaryLight/20">
              <View className="flex-row justify-between items-start mb-1">
                <Text className="text-xs font-medium text-craftopia-textPrimary flex-1 mr-2">
                  {quest.title}
                </Text>
                {quest.points && (
                  <Text className="text-xs font-medium text-craftopia-accent bg-craftopia-accent/20 px-1.5 py-0.5 rounded-full">
                    {quest.points} pts
                  </Text>
                )}
              </View>
              <Text className="text-xs text-craftopia-textSecondary leading-3">
                {quest.description}
              </Text>
              {quest.completed && (
                <View className="flex-row justify-end mt-1">
                  <Text className="text-xs text-craftopia-success font-medium bg-craftopia-success/20 px-1.5 py-0.5 rounded-full">
                    Completed
                  </Text>
                </View>
              )}
            </View>
          ))
        )}
      </View>
    </View>
  )
}