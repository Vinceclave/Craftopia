import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { challengesAPI} from '../lib/api';
import { useState } from 'react';

export const useChallenges = () => {
  const [category, setCategory] = useState<string>('');
  
  const queryClient = useQueryClient();

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['challenges', category],
    queryFn: async () => {
      const response = await challengesAPI.getAll(category);
      return response;
    },
    retry: 1,
  });

  const createMutation = useMutation({
    mutationFn: async (challengeData: any) => {
      return await challengesAPI.create(challengeData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['challenges'] });
    },
    onError: (error: any) => {
      console.error('❌ Create challenge error:', error);
    }
  });

  const generateAIMutation = useMutation({
    mutationFn: async (category: string) => {
      console.log('🤖 Generating AI challenge, category:', category);
      return await challengesAPI.generateAI(category);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['challenges'] });
    },
    onError: (error: any) => {
      console.error('❌ Generate AI challenge error:', error);
    }
  });

  const { data: pendingData, isLoading: isPendingLoading, refetch: refetchPending } = useQuery({
    queryKey: ['pending-verifications'],
    queryFn: async () => {
      const response = await challengesAPI.getPendingVerifications();
      return response;
    },
    retry: 1,
  });

  return {
    challenges: data?.data?.data || data?.data || [],
    isLoading,
    error,
    category,
    setCategory,
    refetch,
    createChallenge: createMutation.mutateAsync,
    generateAIChallenge: generateAIMutation.mutateAsync,
    isCreating: createMutation.isPending,
    isGenerating: generateAIMutation.isPending,
    pendingVerifications: pendingData?.data?.data || pendingData?.data || [],
    isPendingLoading,
    refetchPending,
  };
};
