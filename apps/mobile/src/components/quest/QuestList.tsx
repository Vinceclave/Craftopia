import React from 'react';
import { View, Text, FlatList, Animated, Easing } from 'react-native';
import Button from '../common/Button';

interface Challenge {
  challenge_id: number;
  title: string;
  description: string;
  points_reward: number;
  category: string;
  material_type: string;
  source: string;
  is_active: boolean;
  _count: { participants: number };
}

interface QuestListProps {
  challenges: Challenge[] | null;
  loading?: boolean;
  onJoin?: (challengeId: number) => void;
}
const SkeletonItem: React.FC = () => {
  const shimmer = React.useRef(new Animated.Value(0)).current;

  React.useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(shimmer, {
          toValue: 1,
          duration: 1000,
          easing: Easing.linear,
          useNativeDriver: false,
        }),
        Animated.timing(shimmer, {
          toValue: 0,
          duration: 1000,
          easing: Easing.linear,
          useNativeDriver: false,
        }),
      ])
    ).start();
  }, [shimmer]);

  const backgroundColor = shimmer.interpolate({
    inputRange: [0, 1],
    outputRange: ['#F2F4F3', '#E8EAE9'], // Using craftopia-light shades
  });

  return (
    <View className="mx-4 my-1 p-3 bg-craftopia-surface rounded-lg border border-craftopia-light">
      <Animated.View style={{ height: 16, width: '60%', borderRadius: 4, backgroundColor, marginBottom: 8 }} />
      <Animated.View style={{ height: 12, width: '90%', borderRadius: 4, backgroundColor, marginBottom: 4 }} />
      <Animated.View style={{ height: 12, width: '70%', borderRadius: 4, backgroundColor, marginBottom: 8 }} />
      <Animated.View style={{ height: 24, width: '40%', borderRadius: 12, backgroundColor }} />
    </View>
  );
};

export const QuestList: React.FC<QuestListProps> = ({ challenges, loading = false, onJoin }) => {
   if (loading) {
      return (
        <FlatList
          data={Array.from({ length: 3 })}
          keyExtractor={(_, index) => `skeleton-${index}`}
          renderItem={() => <SkeletonItem />}
          contentContainerStyle={{ paddingVertical: 8 }}
        />
      );
    }
  
  if (!challenges || challenges.length === 0) {
    return (
      <View className="px-4 py-4">
        <Text className="text-craftopia-textSecondary text-sm text-center">No quests available</Text>
      </View>
    );
  }

  return (
    <FlatList
      data={challenges}
      keyExtractor={(item) => item.challenge_id.toString()}
      scrollEnabled={false}
      contentContainerStyle={{ paddingHorizontal: 16 }}
      renderItem={({ item }) => (
        <View className={`p-3 mb-2 rounded-lg border ${item.is_active ? 'bg-craftopia-surface border-craftopia-light' : 'bg-craftopia-light border-craftopia-light'}`}>
          <View className="flex-row justify-between items-center">
            <Text className="text-sm font-medium text-craftopia-textPrimary">{item.title}</Text>
            {!item.is_active && <Text className="text-xs text-red-500 font-medium">Inactive</Text>}
          </View>

          <Text className="text-sm text-craftopia-textSecondary mt-1">{item.description}</Text>

          <View className="flex-row justify-between mt-2">
            <Text className="text-sm font-medium text-craftopia-primary">{item.points_reward} pts</Text>
            <Text className="text-xs text-craftopia-textSecondary">{item._count.participants} participants</Text>
          </View>

          <View className="mt-2 flex-row flex-wrap gap-1">
            <Text className="px-2 py-1 bg-craftopia-light rounded-full text-xs text-craftopia-textSecondary">{item.category}</Text>
            <Text className="px-2 py-1 bg-craftopia-light rounded-full text-xs text-craftopia-textSecondary">{item.material_type}</Text>
          </View>

          {item.is_active && (
            <View className="mt-3">
              <Button
                title="Join Challenge"
                onPress={() => onJoin && onJoin(item.challenge_id)}
                size="sm"
              />
            </View>
          )}
        </View>
      )}
    />
  );
};