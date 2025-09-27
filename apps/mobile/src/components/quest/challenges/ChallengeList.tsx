import React from 'react';
import { FlatList, View, Text, Animated, Easing } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { EcoQuestStackParamList } from '~/navigations/types';
import Button from '~/components/common/Button';

interface Challenge {
  id: number | string;
  title: string;
  description: string;
  completedAt?: string;
}

interface ChallengeListProps {
  challenges: Challenge[];
  loading: boolean;
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

export const ChallengeList: React.FC<ChallengeListProps> = ({ challenges, loading }) => {
  const navigation = useNavigation<NativeStackNavigationProp<EcoQuestStackParamList>>();

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
      <View className="flex-1 justify-center items-center py-6">
        <Text className="text-craftopia-textSecondary text-sm">No challenges found</Text>
      </View>
    );
  }

  return (
    <FlatList
      data={challenges}
      keyExtractor={(item, index) => (item.id ? item.id.toString() : index.toString())}
      className="flex-1"
      contentContainerStyle={{ paddingVertical: 8 }}
      renderItem={({ item }) => (
        <View className="mx-4 my-1 p-3 bg-craftopia-surface rounded-lg border border-craftopia-light">
          <Text className="text-sm font-semibold text-craftopia-textPrimary">{item.title}</Text>
          <Text className="text-xs text-craftopia-textSecondary mt-1">{item.description}</Text>
          {item.completedAt && (
            <Text className="text-xs text-craftopia-growth mt-1">
              Completed: {new Date(item.completedAt).toLocaleDateString()}
            </Text>
          )}
          <Button
            title="View Details"
            size="sm"
            className="mt-2"
            onPress={() => navigation.navigate('QuestDetails', { questId: Number(item.id) })}
          />
        </View>
      )}
    />
  );
};
