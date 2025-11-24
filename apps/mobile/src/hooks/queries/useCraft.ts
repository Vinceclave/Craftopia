import { useMutation } from "@tanstack/react-query";
import { craftService } from "~/services/craft.service";

export const useGenerateCraft = () =>
  useMutation({
    mutationFn: (materials: string[]) => craftService.generateCraft(materials),
  });

export const useDetectMaterials = () =>
  useMutation({
    mutationFn: (imageBase64: string) =>
      craftService.detectMaterials(imageBase64),
  });
