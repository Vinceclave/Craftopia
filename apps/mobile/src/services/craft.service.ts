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
  referenceImageBase64?: string;
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
      console.log("\n🎨 ============================================");
      console.log("🎨 CRAFT SERVICE - Generate Craft Request");
      console.log("🎨 ============================================");
      
      // Validate inputs
      if (!request.materials || request.materials.length === 0) {
        throw new Error("Materials are required");
      }
      
      if (!request.referenceImageBase64) {
        console.warn("⚠️  WARNING: No reference image provided to generateCraft");
        console.warn("⚠️  Generated images may not accurately reflect scanned materials");
      }
      
      const payload = { 
        materials: request.materials.join(", "),
        referenceImageBase64: request.referenceImageBase64
      };
      
      // Calculate payload size for debugging
      const payloadString = JSON.stringify(payload);
      const payloadSize = new Blob([payloadString]).size;
      const payloadSizeMB = (payloadSize / (1024 * 1024)).toFixed(2);
      
      console.log("📊 Request Details:");
      console.log("  📦 Materials:", request.materials);
      console.log("  📦 Materials Count:", request.materials.length);
      console.log("  🖼️  Has Reference Image:", !!request.referenceImageBase64);
      
      if (request.referenceImageBase64) {
        const imageSizeMB = (request.referenceImageBase64.length / (1024 * 1024)).toFixed(2);
        console.log("  📏 Image Length:", request.referenceImageBase64.length, "characters");
        console.log("  📊 Image Size:", imageSizeMB, "MB");
        console.log("  🔍 Image Preview:", request.referenceImageBase64.substring(0, 100));
        
        // Check if it has proper data URI prefix
        if (request.referenceImageBase64.startsWith('data:image')) {
          console.log("  ✅ Image has proper data URI prefix");
        } else {
          console.log("  ⚠️  Image missing data URI prefix");
        }
      }
      
      console.log("  📊 Total Payload Size:", payloadSizeMB, "MB");
      
      // Validate payload size
      if (parseFloat(payloadSizeMB) > 50) {
        console.error("❌ Payload exceeds 50MB limit!");
        throw new Error(`Payload too large: ${payloadSizeMB} MB. Please use a smaller image.`);
      }
      
      if (parseFloat(payloadSizeMB) > 10) {
        console.warn("⚠️  Large payload detected:", payloadSizeMB, "MB - may take longer to process");
      }

      console.log("\n⏳ Sending request to backend (timeout: 120s)...");
      console.log("🎯 Endpoint:", API_ENDPOINTS.AI.GENERATE_CRAFT);
      
      const startTime = Date.now();
      
      // Use postAI with extended timeout for image generation
      const response = await apiService.postAI<GenerateCraftResponse>(
        API_ENDPOINTS.AI.GENERATE_CRAFT,
        payload
      );
      
      const duration = ((Date.now() - startTime) / 1000).toFixed(2);
      
      console.log("\n✅ ============================================");
      console.log("✅ CRAFT SERVICE - Request Successful");
      console.log("✅ ============================================");
      console.log("⏱️  Duration:", duration, "seconds");
      console.log("📊 Ideas Generated:", response.data?.ideas?.length || 0);
      
      if (response.data?.ideas) {
        const ideasWithImages = response.data.ideas.filter(i => i.generatedImageUrl).length;
        console.log("🖼️  Ideas with Images:", ideasWithImages);
      }
      
      console.log("✅ ============================================\n");
      
      return response;
    } catch (error: any) {
      console.error("\n❌ ============================================");
      console.error("❌ CRAFT SERVICE - Request Failed");
      console.error("❌ ============================================");
      console.error("❌ Error Message:", error.message);
      
      if (error.response) {
        console.error("❌ Response Status:", error.response.status);
        console.error("❌ Response Data:", error.response.data);
      }
      
      console.error("❌ ============================================\n");
      
      throw new Error(error.message || "Failed to generate craft ideas.");
    }
  }

  async detectMaterials(imageBase64: string): Promise<DetectMaterialsResponse> {
    try {
      console.log("\n🔍 ============================================");
      console.log("🔍 CRAFT SERVICE - Detect Materials Request");
      console.log("🔍 ============================================");
      
      if (!imageBase64 || !imageBase64.trim()) {
        throw new Error("Image base64 is required");
      }
      
      const payloadSize = new Blob([JSON.stringify({ imageBase64 })]).size;
      const payloadSizeMB = (payloadSize / (1024 * 1024)).toFixed(2);
      const imageSizeMB = (imageBase64.length / (1024 * 1024)).toFixed(2);
      
      console.log("📊 Request Details:");
      console.log("  📏 Image Length:", imageBase64.length, "characters");
      console.log("  📊 Image Size:", imageSizeMB, "MB");
      console.log("  📊 Payload Size:", payloadSizeMB, "MB");
      console.log("  🔍 Image Preview:", imageBase64.substring(0, 100));
      
      // Check if it has proper data URI prefix
      if (imageBase64.startsWith('data:image')) {
        console.log("  ✅ Image has proper data URI prefix");
      } else {
        console.log("  ⚠️  Image missing data URI prefix");
      }

      console.log("\n⏳ Sending request to backend...");
      console.log("🎯 Endpoint:", API_ENDPOINTS.AI.DETECT_MATERIALS);
      
      const startTime = Date.now();
      
      // Use postAI with extended timeout
      const response = await apiService.postAI<DetectMaterialsResponse>(
        API_ENDPOINTS.AI.DETECT_MATERIALS,
        { imageBase64 }
      );
      
      const duration = ((Date.now() - startTime) / 1000).toFixed(2);
      
      console.log("\n✅ ============================================");
      console.log("✅ DETECT MATERIALS - Request Successful");
      console.log("✅ ============================================");
      console.log("⏱️  Duration:", duration, "seconds");
      console.log("📊 Materials Detected:", response.data?.materials?.length || 0);
      
      if (response.data?.materials) {
        console.log("📦 Materials:", response.data.materials);
      }
      
      console.log("✅ ============================================\n");
      
      return response;
    } catch (error: any) {
      console.error("\n❌ ============================================");
      console.error("❌ DETECT MATERIALS - Request Failed");
      console.error("❌ ============================================");
      console.error("❌ Error Message:", error.message);
      
      if (error.response) {
        console.error("❌ Response Status:", error.response.status);
        console.error("❌ Response Data:", error.response.data);
      }
      
      console.error("❌ ============================================\n");
      
      throw new Error(error.message || "Failed to detect materials.");
    }
  }
}

export const craftService = new CraftService();