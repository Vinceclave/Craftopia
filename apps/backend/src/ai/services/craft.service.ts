// apps/backend/src/ai/services/craft.service.ts - ENHANCED WITH BETTER IMAGE GENERATION

import { AppError } from "../../utils/error";
import { ai } from "../gemini/client";
import { craftPrompt } from "../prompt/craft.prompt";
import { parseJsonFromMarkdown } from "../utils/responseParser";
import { config } from "../../config";
import { generateCraftImage } from "./image-generation.service";

interface CraftIdea {
  title: string;
  description: string;
  difficulty?: string;
  steps: string[];
  timeNeeded: string;
  toolsNeeded?: string[];
  quickTip: string;
  uniqueFeature?: string;
  generatedImageUrl?: string;
}

export const generateCraft = async (
  materials: string | string[],
  referenceImageBase64?: string
) => {
  // Normalize input: join array into a single string if needed
  const cleanMaterials = Array.isArray(materials)
    ? materials.map((m) => m.trim()).filter(Boolean).join(", ")
    : materials?.trim();

  console.log("🎨 ============================================");
  console.log("🎨 CRAFT SERVICE - Enhanced Generate Craft");
  console.log("🎨 ============================================");
  console.log("📦 Materials:", cleanMaterials);
  console.log("🖼️  Has referenceImageBase64:", !!referenceImageBase64);
  
  if (referenceImageBase64) {
    const imageSizeMB = (referenceImageBase64.length / (1024 * 1024)).toFixed(2);
    console.log("📏 Reference Image Length:", referenceImageBase64.length);
    console.log("📊 Reference Image Size:", imageSizeMB, "MB");
  } else {
    console.log("⚠️  No reference image - generating generic craft images");
  }

  // Validation
  if (!cleanMaterials) {
    throw new AppError("Materials are required", 400);
  }

  if (cleanMaterials.length < 3) {
    throw new AppError(
      "Materials description too short (minimum 3 characters)",
      400
    );
  }

  if (cleanMaterials.length > 200) {
    throw new AppError(
      "Materials description too long (max 200 characters)",
      400
    );
  }

  // Check for harmful content
  const harmfulKeywords = [
    "weapon",
    "explosive",
    "dangerous",
    "toxic",
    "poison",
  ];
  const lowerMaterials = cleanMaterials.toLowerCase();

  if (harmfulKeywords.some((keyword) => lowerMaterials.includes(keyword))) {
    throw new AppError(
      "Cannot generate craft ideas for potentially harmful materials",
      400
    );
  }

  try {
    console.log("🤖 Generating ULTRA-REALISTIC craft ideas from AI...");

    const prompt = craftPrompt(cleanMaterials);

    const response = await ai.models.generateContent({
      model: config.ai.model,
      contents: prompt,
    });

    const text = response.text;
    if (!text?.trim()) {
      throw new AppError("AI did not return a response", 500);
    }

    console.log("✅ AI response received");

    const ideas = parseJsonFromMarkdown(text);

    if (!Array.isArray(ideas) || ideas.length === 0) {
      throw new AppError(
        "AI could not generate craft ideas for the provided materials",
        500
      );
    }

    // Validate each idea structure - ENHANCED validation
    const validIdeas = ideas.filter(
      (idea) =>
        idea &&
        typeof idea === "object" &&
        typeof idea.title === "string" &&
        typeof idea.description === "string" &&
        Array.isArray(idea.steps) &&
        idea.title.trim() &&
        idea.description.trim() &&
        idea.steps.length > 0
    );

    if (validIdeas.length === 0) {
      throw new AppError("AI returned invalid craft idea format", 500);
    }

    console.log(`✅ Generated ${validIdeas.length} valid craft ideas`);
    console.log("🎨 Starting ENHANCED image generation for each craft idea...");

    // 🎯 Generate ULTRA-REALISTIC images with craft details
    const ideasWithImages: CraftIdea[] = [];

    for (let i = 0; i < validIdeas.length; i++) {
      const idea = validIdeas[i];
      
      try {
        console.log(`\n🖼️  [${i + 1}/${validIdeas.length}] Generating REALISTIC image for: "${idea.title}"`);
        console.log(`📝 Difficulty: ${idea.difficulty || 'Not specified'}`);
        console.log(`⏱️  Time: ${idea.timeNeeded}`);
        console.log(`🔧 Steps: ${idea.steps.length} steps`);
        console.log(`✨ Unique Feature: ${idea.uniqueFeature || 'None specified'}`);

        // ✅ Pass craft steps to image generation for better visual accuracy
        const imageUrl = await generateCraftImage(
          idea.title,
          idea.description,
          cleanMaterials,
          idea.steps, // 🎯 NEW: Pass steps for visual details
          referenceImageBase64
        );

        // ✅ Keep as base64 - will upload to S3 only when user saves
        ideasWithImages.push({
          ...idea,
          generatedImageUrl: imageUrl, // Base64 data URI
        });

        console.log(`✅ [${i + 1}/${validIdeas.length}] REALISTIC image generated successfully`);
      } catch (imageError: any) {
        console.error(`❌ [${i + 1}/${validIdeas.length}] Failed to generate image:`, imageError.message);
        
        // Include the idea even without an image
        ideasWithImages.push({
          ...idea,
          generatedImageUrl: undefined,
        });
      }
    }

    console.log("\n🎨 ============================================");
    console.log(`✅ ENHANCED CRAFT SERVICE COMPLETE`);
    console.log(`📊 Total Ideas: ${ideasWithImages.length}`);
    console.log(`🖼️  Ideas with Images: ${ideasWithImages.filter(i => i.generatedImageUrl).length}`);
    console.log(`✨ Unique Features: ${ideasWithImages.filter(i => i.uniqueFeature).length}`);
    console.log(`🔧 Tools Specified: ${ideasWithImages.filter(i => i.toolsNeeded).length}`);
    console.log("🎨 ============================================\n");

    // ✅ Return with base64 images and enhanced metadata
    return {
      materials: Array.isArray(materials) ? materials : [materials],
      ideas: ideasWithImages,
      count: ideasWithImages.length,
      generatedAt: new Date().toISOString(),
      metadata: {
        hasReferenceImage: !!referenceImageBase64,
        averageSteps: Math.round(
          ideasWithImages.reduce((sum, idea) => sum + idea.steps.length, 0) / 
          ideasWithImages.length
        ),
        imagesGenerated: ideasWithImages.filter(i => i.generatedImageUrl).length,
      }
    };
  } catch (error: any) {
    if (error instanceof AppError) throw error;

    console.error("❌ AI Craft Generation Error:", error);

    if (error.message?.includes("API key")) {
      throw new AppError("AI service configuration error", 500);
    }

    if (error.message?.includes("quota")) {
      throw new AppError(
        "AI service quota exceeded, please try again later",
        503
      );
    }

    throw new AppError("Failed to generate craft ideas from AI service", 500);
  }
};