// apps/mobile/src/hooks/queries/useCraft.enhanced.ts - WITH NETWORK ERROR HANDLING

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ModalService } from "~/context/modalContext";
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

      if (error instanceof NetworkError) {
        ModalService.show({
          title: '📡 Network Error',
          message: error.message,
          type: 'error'
        });
      } else {
        ModalService.show({
          title: 'Error',
          message: error.message || 'Failed to generate craft ideas',
          type: 'error'
        });
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

      if (error instanceof NetworkError) {
        ModalService.show({
          title: '📡 Network Error',
          message: error.message,
          type: 'error'
        });
      } else {
        ModalService.show({
          title: 'Error',
          message: error.message || 'Failed to detect materials',
          type: 'error'
        });
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

      if (error instanceof NetworkError) {
        // Network error - will be queued
        ModalService.show({
          title: '📡 Offline Mode',
          message: 'Your craft will be saved automatically when you\'re back online.',
          type: 'warning'
        });
      } else {
        // Other errors
        ModalService.show({
          title: 'Save Failed',
          message: error.message || 'Failed to save craft',
          type: 'error'
        });
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

      if (error instanceof NetworkError) {
        ModalService.show({
          title: '📡 Network Error',
          message: 'Please check your internet connection and try again.',
          type: 'error'
        });
      } else {
        ModalService.show({
          title: 'Error',
          message: error.message || 'Failed to update save status',
          type: 'error'
        });
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
    queryFn: async () => {
      try {
        return await craftService.getSavedCrafts(page, limit);
      } catch (error: any) {

        if (error instanceof NetworkError) {
          // silently handled usually
        }

        throw error; // <-- IMPORTANT
      }
    },
    enabled,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
    retry: (failureCount, error: any) => {
      if (error instanceof NetworkError) return false;
      return failureCount < 2;
    },
  });


/**
 * ✅ Get user craft statistics with error handling
 */
export const useCraftStats = (enabled = true) =>
  useQuery({
    queryKey: ['craftStats'],
    queryFn: async () => {
      try {
        return await craftService.getUserCraftStats();
      } catch (error: any) {

        if (error instanceof NetworkError) {
          // silently handled usually
        }

        throw error; // IMPORTANT so react-query handles it
      }
    },
    enabled,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
    retry: (failureCount, error: any) => {
      if (error instanceof NetworkError) return false;
      return failureCount < 2;
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