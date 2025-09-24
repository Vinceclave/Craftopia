  import React, { useEffect, useState, useCallback } from 'react';
  import {
    Text,
    View,
    ActivityIndicator,
    ScrollView,
    RefreshControl,
    Alert,
  } from 'react-native';
  import { useNavigation, RouteProp, useRoute } from '@react-navigation/native';
  import { NativeStackNavigationProp } from '@react-navigation/native-stack';
  import { EcoQuestStackParamList } from '~/navigations/types';
  import Button from '~/components/common/Button';
  import { ArrowLeft } from 'lucide-react-native';
  import { SafeAreaView } from 'react-native-safe-area-context';
  import { apiService } from '~/services/base.service';
  import { API_ENDPOINTS } from '~/config/api';

  // Challenge type
  interface Challenge {
    challenge_id: number;
    title: string;
    description: string;
    points_reward: number;
    material_type: string;
    source: string;
    _count?: { participants: number };
  }

  // UserChallenge type (minimal for join)
  interface UserChallenge {
    user_challenge_id: number;
    status: string;
  }

  export const QuestDetailsScreen = () => {
    const navigation = useNavigation<NativeStackNavigationProp<EcoQuestStackParamList>>();
    const route = useRoute<RouteProp<EcoQuestStackParamList, 'QuestDetails'>>();
    const { questId } = route.params;

    const [challenge, setChallenge] = useState<Challenge | null>(null);
    const [loading, setLoading] = useState<boolean>(false);
    const [joining, setJoining] = useState<boolean>(false);
    const [joined, setJoined] = useState<boolean>(false);

    // Fetch challenge details
    const fetchChallenge = useCallback(async () => {
      try {
        setLoading(true);
        const response = await apiService.request(API_ENDPOINTS.CHALLENGES.BY_ID(questId));
        setChallenge(response.data);

        // Optional: check if user already joined
        if (response.data.user_joined) {
          setJoined(true);
        }
      } catch (error) {
        console.error('Error fetching challenge:', error);
        Alert.alert('Error', 'Unable to fetch challenge. Please try again.');
        setChallenge(null);
      } finally {
        setLoading(false);
      }
    }, [questId]);

    // Join challenge
    const handleJoinChallenge = async () => {
      if (!challenge) return;
      try {
        setJoining(true);
        const response = await apiService.request<UserChallenge>( API_ENDPOINTS.USER_CHALLENGES.JOIN, {
          method: 'POST',
          data: { challenge_id: challenge.challenge_id },
        });

        console.log(response)
        setJoined(true);
        Alert.alert('Success', 'You have joined this challenge!');
      } catch (error) {
        console.error('Error joining challenge:', error);
        Alert.alert('Error', 'Failed to join challenge. Please try again.');
      } finally {
        setJoining(false);
      }
    };

    useEffect(() => {
      fetchChallenge();
    }, [fetchChallenge]);

    return (
      <SafeAreaView edges={['top', 'left', 'right']} className="flex-1 bg-craftopia-light">
        {/* Header */}
        <View className="bg-craftopia-surface px-4 py-3 border-b border-craftopia-light">
          <View className="flex-row items-center">
            <Button
              onPress={() => navigation.goBack()}
              title=""
              iconOnly
              leftIcon={<ArrowLeft size={18} color="#1A1A1A" />}
              className="bg-transparent p-1 mr-2"
            />
            <View>
              <Text className="text-base font-semibold text-craftopia-textPrimary">
                Quest Details
              </Text>
              <Text className="text-xs text-craftopia-textSecondary">
                Challenge #{questId}
              </Text>
            </View>
          </View>
        </View>

        {/* Content */}
        <ScrollView
          contentContainerStyle={{ padding: 16 }}
          refreshControl={<RefreshControl refreshing={loading} onRefresh={fetchChallenge} />}
        >
          {loading ? (
            <ActivityIndicator size="large" color="#4F46E5" style={{ marginTop: 40 }} />
          ) : !challenge ? (
            <Text className="text-center py-10 text-gray-500">Challenge not found.</Text>
          ) : (
            <View className="bg-craftopia-surface rounded-lg p-4 space-y-3">
              <Text className="text-lg font-semibold text-craftopia-textPrimary">
                {challenge.title}
              </Text>
              <Text className="text-sm text-craftopia-textSecondary">
                {challenge.description}
              </Text>
              <View className="flex-row justify-between">
                <Text className="text-sm text-craftopia-textSecondary">
                  Material: {challenge.material_type}
                </Text>
                <Text className="text-sm text-craftopia-textSecondary">
                  Points: {challenge.points_reward}
                </Text>
              </View>
              <Text className="text-sm text-craftopia-textSecondary">
                Source: {challenge.source}
              </Text>
              <Text className="text-sm text-craftopia-textSecondary">
                Participants: {challenge._count?.participants ?? 0}
              </Text>

              {/* Join Challenge Button */}
              {!joined ? (
                <Button
                  onPress={handleJoinChallenge}
                  title={joining ? 'Joining...' : 'Join Challenge'}
                  disabled={joining}
                  className="mt-4"
                />
              ) : (
                <Text className="text-green-600 font-semibold mt-4">
                  You have already joined this challenge.
                </Text>
              )}
            </View>
          )}
        </ScrollView>
      </SafeAreaView>
    );
  };
