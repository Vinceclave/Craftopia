// apps/mobile/src/services/craft.service.ts - ENHANCED WITH NETWORK ERROR HANDLING

import { apiService } from "./base.service";
import { API_ENDPOINTS } from "~/config/api";
import NetInfo from '@react-native-community/netinfo';

// ----------------------
// Types
// ----------------------
export interface CraftIdea {
  title: string;
  description: string;
  steps: string[];
  timeNeeded: string;
  quickTip: string;
  difficulty?: string;
  toolsNeeded?: string[];
  uniqueFeature?: string;
  generatedImageUrl?: string;
  idea_id?: number;
  is_saved?: boolean;
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

export interface SaveCraftRequest {
  idea_json: {
    title: string;
    description: string;
    steps: string[];
    timeNeeded: string;
    quickTip: string;
    difficulty?: string;
    toolsNeeded?: string[];
    uniqueFeature?: string;
  };
  recycled_materials: string[];
  base64_image?: string;
}

export interface SaveCraftResponse {
  success: boolean;
  message: string;
  data: {
    idea_id: number;
    idea_json: object;
    recycled_materials: object;
    generated_image_url?: string;
    is_saved: boolean;
    created_at: string;
  };
  timestamp: string;
}

// ✅ NEW: Network error type
export class NetworkError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'NetworkError';
  }
}

// ✅ NEW: Offline queue for failed saves
interface PendingSave {
  id: string;
  request: SaveCraftRequest;
  timestamp: number;
  retryCount: number;
}

class CraftService {
  private pendingSaves: Map<string, PendingSave> = new Map();
  private isOnline: boolean = true;
  private maxRetries = 3;

  constructor() {
    // Monitor network status
    this.initNetworkMonitoring();
  }

  /**
   * ✅ Monitor network status and process pending saves when online
   */
  private initNetworkMonitoring() {
    NetInfo.addEventListener(state => {
      const wasOffline = !this.isOnline;
      this.isOnline = state.isConnected ?? false;

      // If just came back online, process pending saves
      if (wasOffline && this.isOnline) {
        this.processPendingSaves();
      }
    });
  }

  /**
   * ✅ Check if device is online
   */
  async checkNetworkStatus(): Promise<boolean> {
    try {
      const state = await NetInfo.fetch();
      return state.isConnected ?? false;
    } catch (error) {
      console.error('❌ Failed to check network status:', error);
      return false;
    }
  }

  /**
   * ✅ Generate craft ideas with network error handling
   */
  async generateCraft(
    request: GenerateCraftRequest
  ): Promise<GenerateCraftResponse> {
    try {
      // Check network first
      const isOnline = await this.checkNetworkStatus();
      if (!isOnline) {
        throw new NetworkError('No internet connection. Please check your network and try again.');
      }

      if (!request.materials || request.materials.length === 0) {
        throw new Error("Materials are required");
      }

      const payload = {
        materials: request.materials.join(", "),
        referenceImageBase64: request.referenceImageBase64
      };

      const payloadString = JSON.stringify(payload);
      const payloadSize = new Blob([payloadString]).size;
      const payloadSizeMB = (payloadSize / (1024 * 1024)).toFixed(2);

      if (parseFloat(payloadSizeMB) > 50) {
        throw new Error(`Payload too large: ${payloadSizeMB} MB`);
      }

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
      
      // Check if it's a network error
      if (this.isNetworkError(error)) {
        throw new NetworkError('Network request failed. Please check your internet connection.');
      }
      
      throw new Error(error.message || "Failed to generate craft ideas.");
    }
  }

  /**
   * ✅ Detect materials with network error handling
   */
  async detectMaterials(imageBase64: string): Promise<any> {
    try {

      // Check network first
      const isOnline = await this.checkNetworkStatus();
      if (!isOnline) {
        throw new NetworkError('No internet connection. Please check your network and try again.');
      }

      if (!imageBase64 || !imageBase64.trim()) {
        throw new Error("Image base64 is required");
      }

      const response = await apiService.postAI<any>(
        API_ENDPOINTS.AI.DETECT_MATERIALS,
        { imageBase64 }
      );

      return response;
    } catch (error: any) {
      console.error("❌ Detect materials failed:", error.message);
      
      if (this.isNetworkError(error)) {
        throw new NetworkError('Network request failed. Please check your internet connection.');
      }
      
      throw new Error(error.message || "Failed to detect materials.");
    }
  }

  /**
   * ✅ Save craft with network error handling and offline queue
   */
  async saveCraftFromBase64(request: SaveCraftRequest): Promise<SaveCraftResponse> {
    try {

      // Check network first
      const isOnline = await this.checkNetworkStatus();
      if (!isOnline) {
        // Add to pending queue
        const pendingId = this.addToPendingQueue(request);
        
        throw new NetworkError(
          'No internet connection. Your craft will be saved automatically when you\'re back online.'
        );
      }

      const response = await apiService.post<SaveCraftResponse>(
        API_ENDPOINTS.CRAFTS.SAVE_FROM_BASE64,
        request
      );

      return response;
    } catch (error: any) {
      console.error("❌ Save craft failed:", error.message);
      
      if (this.isNetworkError(error)) {
        // Add to pending queue
        const pendingId = this.addToPendingQueue(request);
        
        throw new NetworkError(
          'Network error occurred. Your craft will be saved automatically when connection is restored.'
        );
      }
      
      throw new Error(error.message || "Failed to save craft.");
    }
  }

  /**
   * ✅ Toggle save with network error handling
   */
  async toggleSaveCraft(ideaId: number): Promise<any> {
    try {

      // Check network first
      const isOnline = await this.checkNetworkStatus();
      if (!isOnline) {
        throw new NetworkError('No internet connection. Please check your network and try again.');
      }

      const response = await apiService.post<any>(
        API_ENDPOINTS.CRAFTS.TOGGLE_SAVE(ideaId.toString()),
        {}
      );

      return response;
    } catch (error: any) {
      
      if (this.isNetworkError(error)) {
        throw new NetworkError('Network request failed. Please check your internet connection.');
      }
      
      throw new Error(error.message || "Failed to toggle save.");
    }
  }

  /**
   * ✅ Get saved crafts with network error handling
   */
  async getSavedCrafts(page = 1, limit = 10): Promise<any> {
    try {
      // Check network first
      const isOnline = await this.checkNetworkStatus();
      if (!isOnline) {
        throw new NetworkError('No internet connection. Please check your network and try again.');
      }

      const response = await apiService.get<any>(
        `${API_ENDPOINTS.CRAFTS.SAVED_LIST}?page=${page}&limit=${limit}`
      );


      return response;
    } catch (error: any) {
      console.error("❌ Get saved crafts failed:", error.message);
      
      if (this.isNetworkError(error)) {
        throw new NetworkError('Network request failed. Please check your internet connection.');
      }
      
      throw new Error(error.message || "Failed to get saved crafts.");
    }
  }

  /**
   * ✅ Get user craft stats with network error handling
   */
  async getUserCraftStats(): Promise<any> {
    try {

      // Check network first
      const isOnline = await this.checkNetworkStatus();
      if (!isOnline) {
        throw new NetworkError('No internet connection. Please check your network and try again.');
      }

      const response = await apiService.get<any>(
        API_ENDPOINTS.CRAFTS.USER_STATS
      );

      return response;
    } catch (error: any) {
      console.error("❌ Get stats failed:", error.message);
      
      if (this.isNetworkError(error)) {
        throw new NetworkError('Network request failed. Please check your internet connection.');
      }
      
      throw new Error(error.message || "Failed to get craft stats.");
    }
  }

  /**
   * ✅ Add craft save to pending queue
   */
  private addToPendingQueue(request: SaveCraftRequest): string {
    const id = `pending_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    const pendingSave: PendingSave = {
      id,
      request,
      timestamp: Date.now(),
      retryCount: 0,
    };

    this.pendingSaves.set(id, pendingSave);
    
    return id;
  }

  /**
   * ✅ Process all pending saves (called when back online)
   */
  private async processPendingSaves() {
    if (this.pendingSaves.size === 0) {
      return;
    }

    const promises = Array.from(this.pendingSaves.entries()).map(
      async ([id, pendingSave]) => {
        try {

          const response = await apiService.post<SaveCraftResponse>(
            API_ENDPOINTS.CRAFTS.SAVE_FROM_BASE64,
            pendingSave.request
          );

          this.pendingSaves.delete(id);

          return { success: true, id, response };
        } catch (error: any) {

          // Increment retry count
          pendingSave.retryCount++;

          // If max retries reached, remove from queue
          if (pendingSave.retryCount >= this.maxRetries) {
            this.pendingSaves.delete(id);
          } else {
            // Update the pending save
            this.pendingSaves.set(id, pendingSave);
          }

          return { success: false, id, error: error.message };
        }
      }
    );

    const results = await Promise.allSettled(promises);
    
    const successful = results.filter(r => r.status === 'fulfilled' && (r.value as any).success).length;
    const failed = results.length - successful;

  }

  /**
   * ✅ Check if error is a network error
   */
  private isNetworkError(error: any): boolean {
    if (error instanceof NetworkError) {
      return true;
    }

    const errorMessage = error.message?.toLowerCase() || '';
    const networkKeywords = [
      'network',
      'connection',
      'timeout',
      'fetch',
      'enotfound',
      'econnrefused',
      'econnreset',
      'offline',
      'no internet',
    ];

    return networkKeywords.some(keyword => errorMessage.includes(keyword));
  }

  /**
   * ✅ Get pending saves count (for UI display)
   */
  getPendingSavesCount(): number {
    return this.pendingSaves.size;
  }

  /**
   * ✅ Clear all pending saves
   */
  clearPendingSaves(): void {
    this.pendingSaves.clear();
  }
}

export const craftService = new CraftService();