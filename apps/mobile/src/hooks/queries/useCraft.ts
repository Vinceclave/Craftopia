// apps/mobile/src/hooks/queries/useCraft.ts - COMPLETE UPDATED FILE

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { 
  craftService, 
  GenerateCraftRequest, 
  SaveCraftRequest 
} from "~/services/craft.service";

/**
 * Generate craft ideas from materials
 */
export const useGenerateCraft = () =>
  useMutation({
    mutationFn: (request: GenerateCraftRequest) => 
      craftService.generateCraft(request),
  });

/**
 * Detect materials from image
 */
export const useDetectMaterials = () =>
  useMutation({
    mutationFn: (imageBase64: string) =>
      craftService.detectMaterials(imageBase64),
  });

/**
 * ✅ Save craft with base64 image
 * Uploads to S3 and saves to database
 */
export const useSaveCraftFromBase64 = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (request: SaveCraftRequest) => 
      craftService.saveCraftFromBase64(request),
    onSuccess: () => {
      // Invalidate queries to refresh data
      queryClient.invalidateQueries({ queryKey: ['savedCrafts'] });
      queryClient.invalidateQueries({ queryKey: ['craftStats'] });
    },
  });
};

/**
 * ✅ Toggle save/unsave craft (for already-saved crafts)
 */
export const useToggleSaveCraft = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (ideaId: number) =>
      craftService.toggleSaveCraft(ideaId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['savedCrafts'] });
      queryClient.invalidateQueries({ queryKey: ['craftStats'] });
    },
  });
};

/**
 * ✅ Get saved crafts with pagination
 */
export const useSavedCrafts = (page = 1, limit = 10) =>
  useQuery({
    queryKey: ['savedCrafts', page, limit],
    queryFn: () => craftService.getSavedCrafts(page, limit),
  });

/**
 * ✅ Get user craft statistics
 */
export const useCraftStats = () =>
  useQuery({
    queryKey: ['craftStats'],
    queryFn: () => craftService.getUserCraftStats(),
  });