// apps/mobile/src/services/craft.service.ts - COMPLETE UPDATED FILE

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
  generatedImageUrl?: string;  // Base64 initially, S3 URL after save
  idea_id?: number;             // ✅ Database ID (after save)
  is_saved?: boolean;           // ✅ Save status
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

// ✅ NEW: Save craft request/response
export interface SaveCraftRequest {
  idea_json: {
    title: string;
    description: string;
    steps: string[];
    timeNeeded: string;
    quickTip: string;
  };
  recycled_materials: string[];
  base64_image?: string;  // Base64 image, backend uploads to S3
}

export interface SaveCraftResponse {
  success: boolean;
  message: string;
  data: {
    idea_id: number;
    idea_json: object;
    recycled_materials: object;
    generated_image_url?: string;  // S3 URL
    is_saved: boolean;
    created_at: string;
  };
  timestamp: string;
}

export interface ToggleSaveResponse {
  success: boolean;
  message: string;
  data: {
    isSaved: boolean;
    craftIdea: any;
  };
  timestamp: string;
}

export interface SavedCraftsResponse {
  success: boolean;
  data: CraftIdea[];
  pagination: {
    total: number;
    page: number;
    lastPage: number;
    limit: number;
  };
  timestamp: string;
}

export interface CraftStatsResponse {
  success: boolean;
  data: {
    totalCrafts: number;
    craftsThisMonth: number;
    savedCrafts: number;
  };
  timestamp: string;
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
      
      if (!request.materials || request.materials.length === 0) {
        throw new Error("Materials are required");
      }
      
      if (!request.referenceImageBase64) {
        console.warn("⚠️  WARNING: No reference image provided");
      }
      
      const payload = { 
        materials: request.materials.join(", "),
        referenceImageBase64: request.referenceImageBase64
      };
      
      const payloadString = JSON.stringify(payload);
      const payloadSize = new Blob([payloadString]).size;
      const payloadSizeMB = (payloadSize / (1024 * 1024)).toFixed(2);
      
      console.log("📊 Request Details:");
      console.log("  📦 Materials:", request.materials);
      console.log("  🖼️  Has Reference Image:", !!request.referenceImageBase64);
      console.log("  📊 Payload Size:", payloadSizeMB, "MB");
      
      if (parseFloat(payloadSizeMB) > 50) {
        throw new Error(`Payload too large: ${payloadSizeMB} MB`);
      }

      console.log("⏳ Sending request...");
      const startTime = Date.now();
      
      const response = await apiService.postAI<GenerateCraftResponse>(
        API_ENDPOINTS.AI.GENERATE_CRAFT,
        payload
      );
      
      const duration = ((Date.now() - startTime) / 1000).toFixed(2);
      console.log("✅ Request successful in", duration, "seconds");
      
      return response;
    } catch (error: any) {
      console.error("❌ Generate craft failed:", error.message);
      throw new Error(error.message || "Failed to generate craft ideas.");
    }
  }

  async detectMaterials(imageBase64: string): Promise<DetectMaterialsResponse> {
    try {
      console.log("🔍 Detecting materials...");
      
      if (!imageBase64 || !imageBase64.trim()) {
        throw new Error("Image base64 is required");
      }

      const response = await apiService.postAI<DetectMaterialsResponse>(
        API_ENDPOINTS.AI.DETECT_MATERIALS,
        { imageBase64 }
      );
      
      console.log("✅ Materials detected:", response.data?.materials?.length || 0);
      
      return response;
    } catch (error: any) {
      console.error("❌ Detect materials failed:", error.message);
      throw new Error(error.message || "Failed to detect materials.");
    }
  }

  /**
   * ✅ Save craft with base64 image
   * Backend uploads image to S3 and saves to database
   */
  async saveCraftFromBase64(request: SaveCraftRequest): Promise<SaveCraftResponse> {
    try {
      console.log("💾 Saving craft with base64 image...");
      
      const response = await apiService.post<SaveCraftResponse>(
        API_ENDPOINTS.CRAFTS.SAVE_FROM_BASE64,
        request
      );
      
      console.log("✅ Craft saved with S3 image");
      return response;
    } catch (error: any) {
      console.error("❌ Save craft failed:", error.message);
      throw new Error(error.message || "Failed to save craft.");
    }
  }

  /**
   * ✅ Toggle save/unsave (for already-saved crafts)
   */
  async toggleSaveCraft(ideaId: number): Promise<ToggleSaveResponse> {
    try {
      console.log("💾 Toggling save for craft:", ideaId);
      
      const response = await apiService.post<ToggleSaveResponse>(
        API_ENDPOINTS.CRAFTS.TOGGLE_SAVE(ideaId.toString()),
        {}
      );
      
      console.log("✅ Save toggled:", response.data.isSaved);
      
      return response;
    } catch (error: any) {
      console.error("❌ Toggle save failed:", error.message);
      throw new Error(error.message || "Failed to toggle save.");
    }
  }

  /**
   * ✅ Get saved crafts
   */
  async getSavedCrafts(page = 1, limit = 10): Promise<SavedCraftsResponse> {
    try {
      console.log("📚 Fetching saved crafts...");
      
      const response = await apiService.get<SavedCraftsResponse>(
        `${API_ENDPOINTS.CRAFTS.SAVED_LIST}?page=${page}&limit=${limit}`
      );
      
      console.log("✅ Saved crafts retrieved:", response.data?.length || 0);
      
      return response;
    } catch (error: any) {
      console.error("❌ Get saved crafts failed:", error.message);
      throw new Error(error.message || "Failed to get saved crafts.");
    }
  }

  /**
   * ✅ Get user craft stats
   */
  async getUserCraftStats(): Promise<CraftStatsResponse> {
    try {
      console.log("📊 Fetching user craft stats...");
      
      const response = await apiService.get<CraftStatsResponse>(
        API_ENDPOINTS.CRAFTS.USER_STATS
      );
      
      console.log("✅ Stats retrieved");
      
      return response;
    } catch (error: any) {
      console.error("❌ Get stats failed:", error.message);
      throw new Error(error.message || "Failed to get craft stats.");
    }
  }

    
}

export const craftService = new CraftService();