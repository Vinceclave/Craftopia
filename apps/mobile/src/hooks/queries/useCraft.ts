// apps/mobile/src/hooks/queries/useCraft.ts

import { useMutation } from "@tanstack/react-query";
import { craftService, GenerateCraftRequest } from "~/services/craft.service";

export const useGenerateCraft = () =>
  useMutation({
    mutationFn: (request: GenerateCraftRequest) => 
      craftService.generateCraft(request), // ✅ Pass the whole object
  });

export const useDetectMaterials = () =>
  useMutation({
    mutationFn: (imageBase64: string) =>
      craftService.detectMaterials(imageBase64),
  });