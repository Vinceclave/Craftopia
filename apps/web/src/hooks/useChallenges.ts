import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { challengesAPI } from '../lib/api';
import { useState } from 'react';

export const useChallenges = () => {
  const [category, setCategory] = useState<string>('');
  
  const queryClient = useQueryClient();

  const { data, isLoading, error } = useQuery({
    queryKey: ['challenges', category],
    queryFn: () => challengesAPI.getAll(category),
  });

  const createMutation = useMutation({
    mutationFn: challengesAPI.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['challenges'] });
    },
  });

  const generateAIMutation = useMutation({
    mutationFn: challengesAPI.generateAI,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['challenges'] });
    },
  });

  const { data: pendingData, isLoading: isPendingLoading } = useQuery({
    queryKey: ['pending-verifications'],
    queryFn: () => challengesAPI.getPendingVerifications(),
  });

  return {
    challenges: data?.data || [],
    isLoading,
    error,
    category,
    setCategory,
    createChallenge: createMutation.mutateAsync,
    generateAIChallenge: generateAIMutation.mutateAsync,
    isCreating: createMutation.isPending,
    isGenerating: generateAIMutation.isPending,
    pendingVerifications: pendingData?.data || [],
    isPendingLoading,
  };
};
