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
  async generateCraft(materials: string[]): Promise<GenerateCraftResponse> {
    try {
      console.log("🎨 GENERATE:", materials);

      // Convert array to comma-separated string format expected by backend
      const materialsString = materials.join(", ");

      return await apiService.post<GenerateCraftResponse>(
        API_ENDPOINTS.AI.GENERATE_CRAFT,
        { materials: materialsString }
      );
    } catch (error: any) {
      console.error("❌ generateCraft error:", error);
      throw new Error(error.message || "Failed to generate craft ideas.");
    }
  }

  async detectMaterials(imageBase64: string): Promise<DetectMaterialsResponse> {
    try {
        console.log("🔍 DETECT MATERIALS:", imageBase64.substring(0, 50));

        return await apiService.post<DetectMaterialsResponse>(
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