// apps/mobile/src/services/craft.service.ts

import { apiService } from "./base.service";
import { API_ENDPOINTS } from "~/config/api";

// ----------------------
// Types
// ----------------------
export interface CraftIdea {
  title: string;
  description: string;
  steps: string[];
  timeNeeded: string;
  quickTip: string;
  generatedImageUrl?: string;
}

export interface GenerateCraftRequest {
  materials: string[];
  referenceImageBase64: string;
}

export interface GenerateCraftResponse {
  success: boolean;
  message: string;
  data: {
    materials: string[];
    ideas: CraftIdea[];
    count: number;
    generatedAt: string;
    referenceImageUrl?: string;
  };
  timestamp: string;
}

export interface DetectMaterialsResult {
  imageUrl: string;
  imageBase64: string;
  materials: string[];
}

export interface DetectMaterialsResponse {
  success: boolean;
  message: string;
  data: DetectMaterialsResult;
}

// ----------------------
// Service
// ----------------------
class CraftService {
  async generateCraft(
    request: GenerateCraftRequest
  ): Promise<GenerateCraftResponse> {
    try {
      const payload = { 
        materials: request.materials.join(", "),
        referenceImageBase64: request.referenceImageBase64
      };
      
      // Calculate payload size for debugging
      const payloadString = JSON.stringify(payload);
      const payloadSize = new Blob([payloadString]).size;
      const payloadSizeMB = (payloadSize / (1024 * 1024)).toFixed(2);
      
      console.log("🎨 GENERATE CRAFT REQUEST:");
      console.log("  📦 Materials:", request.materials);
      console.log("  🖼️  Has Image:", !!request.referenceImageBase64);
      console.log("  📏 Image Length:", request.referenceImageBase64?.length);
      console.log("  📊 Total Payload Size:", payloadSizeMB + " MB");
      
      if (parseFloat(payloadSizeMB) > 50) {
        console.warn("⚠️  WARNING: Payload exceeds 50MB! Size:", payloadSizeMB + " MB");
        throw new Error(`Payload too large: ${payloadSizeMB} MB. Please use a smaller image.`);
      }
      
      if (parseFloat(payloadSizeMB) > 10) {
        console.warn("⚠️  Large payload detected:", payloadSizeMB + " MB");
      }

      // ✅ USE postAI with extended timeout for image generation
      console.log("⏳ Sending request with extended timeout (120s)...");
      
      return await apiService.postAI<GenerateCraftResponse>(
        API_ENDPOINTS.AI.GENERATE_CRAFT,
        payload
      );
    } catch (error: any) {
      console.error("❌ generateCraft error:", error);
      throw new Error(error.message || "Failed to generate craft ideas.");
    }
  }

  async detectMaterials(imageBase64: string): Promise<DetectMaterialsResponse> {
    try {
      const payloadSize = new Blob([JSON.stringify({ imageBase64 })]).size;
      const payloadSizeMB = (payloadSize / (1024 * 1024)).toFixed(2);
      
      console.log("🔍 DETECT MATERIALS:");
      console.log("  📏 Image Length:", imageBase64.length);
      console.log("  📊 Payload Size:", payloadSizeMB + " MB");
      console.log("  🖼️  Image Preview:", imageBase64.substring(0, 50));

      // ✅ USE postAI with extended timeout
      return await apiService.postAI<DetectMaterialsResponse>(
        API_ENDPOINTS.AI.DETECT_MATERIALS,
        { imageBase64 }
      );
    } catch (error: any) {
      console.error("❌ detectMaterials error:", error);
      throw new Error(error.message || "Failed to detect materials.");
    }
  }
}

export const craftService = new CraftService();