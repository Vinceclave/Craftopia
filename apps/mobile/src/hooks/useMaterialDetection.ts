// apps/mobile/src/hooks/useMaterialDetection.ts

import { useState } from 'react';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_BASE_URL, API_ENDPOINTS } from '../config/api';

interface DetectedMaterial {
  name: string;
  materialType: string;
  quantity: number;
  condition: string;
  characteristics: {
    color: string;
    size: string;
    shape: string;
  };
}

interface MaterialDetectionResult {
  detectedMaterials: DetectedMaterial[];
  imageDescription: string;
  totalItemsDetected: number;
  confidenceScore: number;
  upcyclingPotential: string;
  suggestedCategories: string[];
  notes: string;
}

interface DIYProject {
  title: string;
  description: string;
  difficulty: string;
  estimatedTime: string;
  materials: Array<{ name: string; quantity: string; fromDetected: boolean }>;
  additionalMaterials: Array<{ name: string; quantity: string; optional: boolean }>;
  steps: string[];
  tips: string[];
  outcome: string;
  sustainabilityImpact: string;
  tags: string[];
}

export const useMaterialDetection = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [detection, setDetection] = useState<MaterialDetectionResult | null>(null);
  const [projects, setProjects] = useState<DIYProject[]>([]);

  /**
   * Upload image to server
   */
    const uploadImage = async (imageUri: string): Promise<string> => {
  const token = await AsyncStorage.getItem('accessToken');
  if (!token) throw new Error("Access token not found");

  const formData = new FormData();
  formData.append('image', {
    uri: imageUri,
    type: 'image/jpeg',
    name: 'recyclable.jpg',
  } as any); // Use proper type if you're using TypeScript with React Native

  try {
    const response = await axios.post(
      `${API_BASE_URL}/api/v1/upload/image`, // Removed `?folder=materials`
      formData,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data',
        },
      }
    );

    return response.data.data.imageUrl;
  } catch (error: any) {
    const msg = error.response?.data?.error || 'Image upload failed';
    console.error('[Image Upload Error]', msg);
    throw new Error(msg);
  }
};

  /**
   * Detect materials from image
   */
  const detectMaterials = async (imageUri: string): Promise<MaterialDetectionResult> => {
    setLoading(true);
    setError(null);

    try {
      // Upload image first
      const imageUrl = await uploadImage(imageUri);

      // Detect materials
      const token = await AsyncStorage.getItem('accessToken');
      const response = await axios.post(
        API_ENDPOINTS.AI.DETECT_MATERIALS,
        { imageUrl },
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }
      );

      const result = response.data.data;
      setDetection(result);
      return result;

    } catch (err: any) {
      const errorMessage = err.response?.data?.error || 'Failed to detect materials';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  /**
   * Generate DIY projects from detection
   */
  const generateProjects = async (
    detectionResult: MaterialDetectionResult,
    preferences?: {
      difficulty?: 'easy' | 'medium' | 'hard';
      timeAvailable?: string;
      projectType?: string;
    }
  ): Promise<DIYProject[]> => {
    setLoading(true);
    setError(null);

    try {
      const token = await AsyncStorage.getItem('accessToken');
      const response = await axios.post(
        API_ENDPOINTS.AI.GENERATE_PROJECTS,
        { 
          detection: detectionResult,
          preferences 
        },
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }
      );

      const result = response.data.data.projects;
      setProjects(result);
      return result;

    } catch (err: any) {
      const errorMessage = err.response?.data?.error || 'Failed to generate projects';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  /**
   * Complete pipeline: detect + generate
   */
  const analyzeAndGenerate = async (
    imageUri: string,
    preferences?: {
      difficulty?: 'easy' | 'medium' | 'hard';
      timeAvailable?: string;
      projectType?: string;
    }
  ): Promise<{
    detection: MaterialDetectionResult;
    projects: DIYProject[];
  }> => {
    setLoading(true);
    setError(null);

    try {
      // Upload image first
      const imageUrl = await uploadImage(imageUri);

      // Analyze and generate in one call
      const token = await AsyncStorage.getItem('accessToken');
      const response = await axios.post(
        API_ENDPOINTS.AI.ANALYZE_AND_GENERATE,
        { 
          imageUrl,
          preferences 
        },
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }
      );

      const result = response.data.data;
      setDetection(result.detection);
      setProjects(result.projects);
      
      return result;

    } catch (err: any) {
      const errorMessage = err.response?.data?.error || 'Failed to analyze image';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  /**
   * Reset state
   */
  const reset = () => {
    setDetection(null);
    setProjects([]);
    setError(null);
    setLoading(false);
  };

  return {
    loading,
    error,
    detection,
    projects,
    detectMaterials,
    generateProjects,
    analyzeAndGenerate,
    reset,
  };
};