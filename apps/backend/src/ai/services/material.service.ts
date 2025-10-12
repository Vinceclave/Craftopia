// apps/backend/src/ai/services/material.service.ts

import { ai } from "../gemini/client";
import { AppError } from "../../utils/error";
import { parseJsonFromMarkdown } from "../utils/responseParser";
import { config } from "../../config";
import { createMaterialDetectionPrompt, createDIYProjectPrompt } from "../prompt/material.prompt";
import fs from 'fs';
import path from 'path';

export interface DetectedMaterial {
  name: string;
  materialType: 'plastic' | 'paper' | 'glass' | 'metal' | 'electronics' | 'organic' | 'textile' | 'mixed';
  quantity: number;
  condition: 'good' | 'fair' | 'poor';
  characteristics: {
    color: string;
    size: 'small' | 'medium' | 'large';
    shape: string;
  };
}

export interface MaterialDetectionResult {
  detectedMaterials: DetectedMaterial[];
  imageDescription: string;
  totalItemsDetected: number;
  confidenceScore: number;
  upcyclingPotential: 'high' | 'medium' | 'low';
  suggestedCategories: string[];
  notes: string;
}

export interface DIYProject {
  title: string;
  description: string;
  difficulty: 'easy' | 'medium' | 'hard';
  estimatedTime: string;
  materials: Array<{
    name: string;
    quantity: string;
    fromDetected: boolean;
  }>;
  additionalMaterials: Array<{
    name: string;
    quantity: string;
    optional: boolean;
  }>;
  steps: string[];
  tips: string[];
  outcome: string;
  sustainabilityImpact: string;
  tags: string[];
}

/**
 * Detect recyclable materials from an uploaded image
 */
export const detectMaterialsFromImage = async (
  imageUrl: string
): Promise<MaterialDetectionResult> => {
  if (!imageUrl?.trim()) {
    throw new AppError("Image URL is required", 400);
  }

  try {
    // Resolve file path
    const filePath = path.join(process.cwd(), imageUrl);

    if (!fs.existsSync(filePath)) {
      throw new AppError("Image file not found", 404);
    }

    // Read and encode image
    const imageBuffer = fs.readFileSync(filePath);
    const base64ImageData = imageBuffer.toString("base64");

    const ext = path.extname(filePath).toLowerCase();
    const contentType = ext === ".png"
      ? "image/png"
      : ext === ".webp"
      ? "image/webp"
      : "image/jpeg";

    // Create detection prompt
    const prompt = createMaterialDetectionPrompt();

    console.log("🔍 Analyzing image for recyclable materials...");

    // Call AI model
    const result = await ai.models.generateContent({
      model: config.ai.model,
      contents: [
        {
          role: "user",
          parts: [
            {
              inlineData: {
                mimeType: contentType,
                data: base64ImageData,
              },
            },
            {
              text: prompt,
            },
          ],
        },
      ],
    });

    const rawText = result.text;

    if (!rawText?.trim()) {
      throw new AppError("AI material detection failed - empty response", 500);
    }

    console.log("📝 Raw AI response:", rawText.substring(0, 200) + "...");

    // Parse response
    let detection: MaterialDetectionResult;
    try {
      detection = parseJsonFromMarkdown(rawText);
      console.log("✅ Material detection completed:", detection);
    } catch (parseError) {
      console.error("❌ Failed to parse AI detection response:", parseError);
      throw new AppError("Invalid AI detection format", 500);
    }

    // Validate detection structure
    if (!detection || typeof detection !== "object") {
      throw new AppError("Invalid detection object", 500);
    }

    if (!Array.isArray(detection.detectedMaterials)) {
      throw new AppError("Missing detectedMaterials array", 500);
    }

    return detection;

  } catch (error: any) {
    console.error("❌ Material detection error:", error);

    if (error instanceof AppError) {
      throw error;
    }

    if (error.message?.includes("quota")) {
      throw new AppError("AI service quota exceeded", 503);
    }

    if (error.message?.includes("network")) {
      throw new AppError("Network error during AI detection", 502);
    }

    throw new AppError("Failed to detect materials from image", 500);
  }
};

/**
 * Generate DIY project ideas based on detected materials
 */
export const generateDIYProjects = async (
  detectionResult: MaterialDetectionResult,
  userPreferences?: {
    difficulty?: 'easy' | 'medium' | 'hard';
    timeAvailable?: string;
    projectType?: string;
  }
): Promise<DIYProject[]> => {
  try {
    // Format detected materials for prompt
    const materialsDescription = detectionResult.detectedMaterials
      .map(m => `- ${m.quantity}x ${m.name} (${m.materialType}, ${m.condition} condition)`)
      .join('\n');

    const fullDescription = `
Image Analysis:
${detectionResult.imageDescription}

Detected Materials:
${materialsDescription}

Total Items: ${detectionResult.totalItemsDetected}
Upcycling Potential: ${detectionResult.upcyclingPotential}
Confidence: ${(detectionResult.confidenceScore * 100).toFixed(0)}%
Notes: ${detectionResult.notes}
    `.trim();

    // Create project generation prompt
    const prompt = createDIYProjectPrompt(fullDescription, userPreferences);

    console.log("🎨 Generating DIY project ideas...");

    // Call AI model
    const result = await ai.models.generateContent({
      model: config.ai.model,
      contents: prompt,
    });

    const rawText = result.text;

    if (!rawText?.trim()) {
      throw new AppError("AI project generation failed - empty response", 500);
    }

    console.log("📝 Raw AI projects:", rawText.substring(0, 200) + "...");

    // Parse response
    let projects: DIYProject[];
    try {
      projects = parseJsonFromMarkdown(rawText);
      console.log(`✅ Generated ${projects.length} DIY project ideas`);
    } catch (parseError) {
      console.error("❌ Failed to parse AI projects response:", parseError);
      throw new AppError("Invalid AI projects format", 500);
    }

    // Validate projects structure
    if (!Array.isArray(projects)) {
      throw new AppError("Expected array of projects", 500);
    }

    if (projects.length === 0) {
      throw new AppError("No projects generated", 500);
    }

    // Validate each project
    const validProjects = projects.filter(project => {
      return project &&
        typeof project === 'object' &&
        typeof project.title === 'string' &&
        typeof project.description === 'string' &&
        Array.isArray(project.steps) &&
        project.steps.length > 0;
    });

    if (validProjects.length === 0) {
      throw new AppError("No valid projects generated", 500);
    }

    return validProjects;

  } catch (error: any) {
    console.error("❌ DIY project generation error:", error);

    if (error instanceof AppError) {
      throw error;
    }

    if (error.message?.includes("quota")) {
      throw new AppError("AI service quota exceeded", 503);
    }

    throw new AppError("Failed to generate DIY projects", 500);
  }
};

/**
 * Complete pipeline: detect materials and generate projects
 */
export const analyzeImageAndGenerateProjects = async (
  imageUrl: string,
  userPreferences?: {
    difficulty?: 'easy' | 'medium' | 'hard';
    timeAvailable?: string;
    projectType?: string;
  }
): Promise<{
  detection: MaterialDetectionResult;
  projects: DIYProject[];
}> => {
  console.log("🚀 Starting material analysis pipeline...");

  // Step 1: Detect materials
  const detection = await detectMaterialsFromImage(imageUrl);

  // Check if any materials were detected
  if (detection.detectedMaterials.length === 0) {
    throw new AppError(
      "No recyclable materials detected in the image. Please try again with a clearer image of recyclable items.",
      400
    );
  }

  // Step 2: Generate projects
  const projects = await generateDIYProjects(detection, userPreferences);

  console.log("✅ Analysis pipeline completed successfully");

  return {
    detection,
    projects,
  };
};