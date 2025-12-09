// apps/mobile/src/hooks/queries/useCraft.enhanced.ts - WITH NETWORK ERROR HANDLING

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Alert } from "react-native";
import { 
  craftService, 
  GenerateCraftRequest, 
  SaveCraftRequest,
  NetworkError 
} from "~/services/craft.service";

/**
 * ✅ Generate craft ideas with network error handling
 */
export const useGenerateCraft = () =>
  useMutation({
    mutationFn: (request: GenerateCraftRequest) => 
      craftService.generateCraft(request),
    onError: (error: any) => {
      console.error('❌ Generate craft error:', error);
      
      if (error instanceof NetworkError) {
        Alert.alert(
          '📡 Network Error',
          error.message,
          [{ text: 'OK' }]
        );
      } else {
        Alert.alert(
          'Error',
          error.message || 'Failed to generate craft ideas',
          [{ text: 'OK' }]
        );
      }
    },
    retry: (failureCount, error) => {
      // Don't retry on validation errors
      if (!(error instanceof NetworkError)) {
        return false;
      }
      // Retry network errors up to 2 times
      return failureCount < 2;
    },
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
  });

/**
 * ✅ Detect materials with network error handling
 */
export const useDetectMaterials = () =>
  useMutation({
    mutationFn: (imageBase64: string) =>
      craftService.detectMaterials(imageBase64),
    onError: (error: any) => {
      console.error('❌ Detect materials error:', error);
      
      if (error instanceof NetworkError) {
        Alert.alert(
          '📡 Network Error',
          error.message,
          [{ text: 'OK' }]
        );
      } else {
        Alert.alert(
          'Error',
          error.message || 'Failed to detect materials',
          [{ text: 'OK' }]
        );
      }
    },
    retry: (failureCount, error) => {
      if (!(error instanceof NetworkError)) {
        return false;
      }
      return failureCount < 2;
    },
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
  });

/**
 * ✅ Save craft with network error handling and offline queue
 */
export const useSaveCraftFromBase64 = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (request: SaveCraftRequest) => 
      craftService.saveCraftFromBase64(request),
    onSuccess: (data) => {
      // ✅ Only invalidate on actual success
      queryClient.invalidateQueries({ queryKey: ['savedCrafts'] });
      queryClient.invalidateQueries({ queryKey: ['craftStats'] });
    },
    onError: (error: any) => {
      console.error('❌ Save craft error:', error);
      
      if (error instanceof NetworkError) {
        // Network error - will be queued
        Alert.alert(
          '📡 Offline Mode',
          'Your craft will be saved automatically when you\'re back online.',
          [{ text: 'OK' }]
        );
      } else {
        // Other errors
        Alert.alert(
          'Save Failed',
          error.message || 'Failed to save craft',
          [{ text: 'OK' }]
        );
      }
    },
    // ✅ CRITICAL: Don't retry saves automatically to avoid duplicates
    retry: false,
  });
};

/**
 * ✅ Toggle save/unsave with network error handling
 */
export const useToggleSaveCraft = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (ideaId: number) =>
      craftService.toggleSaveCraft(ideaId),
    onSuccess: (data) => {
      // ✅ Only invalidate on actual success
      queryClient.invalidateQueries({ queryKey: ['savedCrafts'] });
      queryClient.invalidateQueries({ queryKey: ['craftStats'] });
    },
    onError: (error: any) => {
      console.error('❌ Toggle save error:', error);
      
      if (error instanceof NetworkError) {
        Alert.alert(
          '📡 Network Error',
          'Please check your internet connection and try again.',
          [{ text: 'OK' }]
        );
      } else {
        Alert.alert(
          'Error',
          error.message || 'Failed to update save status',
          [{ text: 'OK' }]
        );
      }
    },
    // Retry toggle operations
    retry: (failureCount, error) => {
      if (!(error instanceof NetworkError)) {
        return false;
      }
      return failureCount < 2;
    },
    retryDelay: 1000,
  });
};

/**
 * ✅ Get saved crafts with error handling and offline support
 */
export const useSavedCrafts = (page = 1, limit = 10, enabled = true) =>
  useQuery({
    queryKey: ['savedCrafts', page, limit],
    queryFn: () => craftService.getSavedCrafts(page, limit),
    enabled,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
    retry: (failureCount, error: any) => {
      // Don't retry network errors for queries
      if (error instanceof NetworkError) {
        return false;
      }
      return failureCount < 2;
    },
    onError: (error: any) => {
      console.error('❌ Get saved crafts error:', error);
      
      if (error instanceof NetworkError) {
        // Silent fail for queries - show cached data if available
        console.warn('⚠️ Network error, showing cached data if available');
      }
    },
  });

/**
 * ✅ Get user craft statistics with error handling
 */
export const useCraftStats = (enabled = true) =>
  useQuery({
    queryKey: ['craftStats'],
    queryFn: () => craftService.getUserCraftStats(),
    enabled,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
    retry: (failureCount, error: any) => {
      if (error instanceof NetworkError) {
        return false;
      }
      return failureCount < 2;
    },
    onError: (error: any) => {
      console.error('❌ Get craft stats error:', error);
      
      if (error instanceof NetworkError) {
        console.warn('⚠️ Network error, showing cached stats if available');
      }
    },
  });

/**
 * ✅ Get pending saves count
 */
export const usePendingSavesCount = () => {
  return useQuery({
    queryKey: ['pendingSavesCount'],
    queryFn: () => craftService.getPendingSavesCount(),
    refetchInterval: 5000, // Check every 5 seconds
  });
};