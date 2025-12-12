// apps/backend/src/ai/services/material.service.ts

import { ai } from "../gemini/client";
import { AppError } from "../../utils/error";
import { config } from "../../config";
import { createMaterialDetectionPrompt } from "../prompt/material.prompt";
import axios from "axios";

/**
 * Material normalization mapping to standardize similar material names
 * This prevents duplicate entries like "plastic cap" vs "plastic bottle cap"
 */
const MATERIAL_NORMALIZATION_MAP: Record<string, string> = {
  // Plastic bottles and caps (all variations)
  "plastic bottle": "plastic bottles",
  "plastic water bottle": "plastic bottles",
  "plasticbottle": "plastic bottles",
  "plasticwaterbottle": "plastic bottles",
  "plastic water bottles": "plastic bottles",
  "water bottle": "plastic bottles",
  "water bottles": "plastic bottles",

  "plastic cap": "plastic bottle caps",
  "plastic caps": "plastic bottle caps",
  "plastic bottle cap": "plastic bottle caps",
  "plasticbottle cap": "plastic bottle caps",
  "bottle cap": "plastic bottle caps",
  "bottle caps": "plastic bottle caps",
  "cap": "plastic bottle caps",
  "caps": "plastic bottle caps",

  // Plastic containers
  "plastic container": "plastic containers",

  // Plastic bags
  "plastic bag": "plastic bags",

  // Cardboard (all variations)
  "cardboard": "cardboard boxes",
  "cardboard box": "cardboard boxes",
  "card board": "cardboard boxes",
  "card board box": "cardboard boxes",

  // Aluminum cans (all variations)
  "aluminum can": "aluminum cans",
  "aluminium can": "aluminum cans",
  "aluminium cans": "aluminum cans",
  "soda can": "aluminum cans",
  "soda cans": "aluminum cans",
  "aluminum soda can": "aluminum cans",
  "aluminum soda cans": "aluminum cans",
  "coke can": "aluminum cans",
  "coke cans": "aluminum cans",
  "pop can": "aluminum cans",
  "pop cans": "aluminum cans",

  // Glass (all variations)
  "glass bottle": "glass bottles",
  "glass jar": "glass jars",

  // Paper (all variations)
  "newspaper": "newspapers",
  "news paper": "newspapers",
  "paper bag": "paper bags",

  // Metal/Tin cans (all variations)
  "tin can": "tin cans",
  "metal can": "tin cans",
  "metal cans": "tin cans",
  "steel can": "tin cans",
  "steel cans": "tin cans",
};

/**
 * Normalize material name to prevent duplicates
 * @param material - Raw material name from AI
 * @returns Normalized material name
 */
const normalizeMaterialName = (material: string): string => {
  if (!material) return material;

  // Extract count if present (e.g., "plastic bottles (5)" or "plastic bottles x5" or "5x plastic bottles")
  let workingMaterial = material.trim();
  let count: string | null = null;

  // Match patterns: (5), x5, 5x, or just the number
  const countPatterns = [
    /^(.+?)\s*\((\d+)\)$/,           // "plastic bottles (5)"
    /^(.+?)\s*x\s*(\d+)$/i,          // "plastic bottles x5"
    /^(\d+)\s*x\s*(.+)$/i,           // "5x plastic bottles"
    /^(.+?)\s+(\d+)$/,               // "plastic bottles 5"
  ];

  for (const pattern of countPatterns) {
    const match = workingMaterial.match(pattern);
    if (match) {
      // Check if first group is the number or the material
      if (pattern.source.startsWith('^(\\d+)')) {
        count = match[1];
        workingMaterial = match[2];
      } else {
        workingMaterial = match[1];
        count = match[2];
      }
      break;
    }
  }

  // Remove descriptive prefixes (large, small, medium, clear, blue, red, etc.)
  const descriptivePrefixes = /^(large|small|medium|big|tiny|clear|blue|red|green|yellow|white|black|empty|full|used|new)\s+/i;
  workingMaterial = workingMaterial.replace(descriptivePrefixes, '');

  // Remove extra whitespace and normalize case
  workingMaterial = workingMaterial.replace(/\s+/g, ' ').trim().toLowerCase();

  // Check if we have a normalization rule
  const normalized = MATERIAL_NORMALIZATION_MAP[workingMaterial] || workingMaterial;

  // Re-attach count if it existed
  return count ? `${normalized} (${count})` : normalized;
};

/**
 * Merge materials with the same normalized name and sum their counts
 * @param materials - Array of material names (possibly with counts)
 * @returns Merged array with combined counts
 */
const mergeDuplicateMaterials = (materials: string[]): string[] => {
  const materialMap = new Map<string, number>();

  for (const material of materials) {
    const normalized = normalizeMaterialName(material);

    // Extract count
    const countMatch = normalized.match(/^(.+?)\s*\((\d+)\)$/);
    const baseName = countMatch ? countMatch[1].trim() : normalized.trim();
    const count = countMatch ? parseInt(countMatch[2], 10) : 1;

    // Add or update count
    const currentCount = materialMap.get(baseName) || 0;
    materialMap.set(baseName, currentCount + count);
  }

  // Convert back to array
  return Array.from(materialMap.entries()).map(([name, count]) => {
    return count > 1 ? `${name} (${count})` : name;
  });
};

/**
 * Detect recyclable materials from an image URL
 * @param imageUrl - Public URL of the image to analyze
 * @returns Array of detected material strings
 */
export const detectMaterialsFromImage = async (
  imageBase64: string
): Promise<string[]> => {
  if (!imageBase64?.trim()) {
    throw new AppError("Base64 image is required", 400);
  }

  try {
    // Extract MIME type and strip "data:image/png;base64,"
    const matches = imageBase64.match(/^data:(image\/\w+);base64,(.*)$/);

    if (!matches) {
      throw new AppError("Invalid base64 image format", 400);
    }

    const mimeType = matches[1];
    const base64Data = matches[2];

    const prompt = createMaterialDetectionPrompt();

    // Send to AI model
    const response = await ai.models.generateContent({
      model: config.ai.model,
      contents: [
        {
          role: "user",
          parts: [
            {
              inlineData: {
                mimeType,
                data: base64Data,
              },
            },
            {
              text: prompt,
            },
          ],
        },
      ],
    });

    const rawText = response.text;

    if (!rawText?.trim()) {
      throw new AppError("AI returned empty response", 500);
    }

    // Parse JSON
    let materials: string[];
    try {
      let cleaned = rawText.replace(/```json|```/g, "").trim();
      materials = JSON.parse(cleaned);

      if (!Array.isArray(materials)) {
        throw new Error("Expected array");
      }
    } catch {
      throw new AppError("Invalid AI response format", 500);
    }

    // Normalize and merge duplicate materials
    const normalizedMaterials = mergeDuplicateMaterials(materials);

    return normalizedMaterials;
  } catch (error: any) {
    console.error("❌ Base64 detection error:", error);

    if (error instanceof AppError) throw error;

    throw new AppError(error.message || "Failed to detect materials", 500);
  }
};

/**
 * Get all normalization rules (useful for debugging)
 * @returns Object containing all normalization mappings
 */
export const getNormalizationRules = (): Record<string, string> => {
  return { ...MATERIAL_NORMALIZATION_MAP };
};

/**
 * Test normalization on a sample array (useful for debugging)
 * @param materials - Array of material names to test
 * @returns Normalized and merged materials
 */
export const testNormalization = (materials: string[]): string[] => {
  return mergeDuplicateMaterials(materials);
};

