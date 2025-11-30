// apps/backend/src/ai/services/craft.service.ts 

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
  visualDescription?: string;
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
  console.log("🎨 CRAFT SERVICE - Image-Enhanced Generation");
  console.log("🎨 ============================================");
  console.log("📦 Materials:", cleanMaterials);
  console.log("🖼️  Has referenceImageBase64:", !!referenceImageBase64);

  if (referenceImageBase64) {
    const imageSizeMB = (referenceImageBase64.length / (1024 * 1024)).toFixed(2);
    console.log("📏 Reference Image Length:", referenceImageBase64.length);
    console.log("📊 Reference Image Size:", imageSizeMB, "MB");
    console.log("✅ Will send image to AI for visual material analysis");
  } else {
    console.log("⚠️  No reference image - generating from text materials only");
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
    console.log("🤖 Generating craft ideas with visual material reference...");

    const hasReferenceImage = !!referenceImageBase64;
    const prompt = craftPrompt(cleanMaterials, hasReferenceImage);

    let response;

    // 🎯 NEW: If we have a reference image, send it to the AI
    if (referenceImageBase64) {
      console.log("📸 Sending reference image to AI for accurate material analysis...");

      // Extract base64 data and MIME type
      let cleanBase64 = referenceImageBase64.trim();
      let mimeType = "image/jpeg";

      if (cleanBase64.includes(',')) {
        const parts = cleanBase64.split(',');
        if (parts.length === 2) {
          const dataUriPrefix = parts[0];
          cleanBase64 = parts[1];

          if (dataUriPrefix.includes('image/png')) {
            mimeType = "image/png";
          } else if (dataUriPrefix.includes('image/webp')) {
            mimeType = "image/webp";
          } else if (dataUriPrefix.includes('image/jpeg') || dataUriPrefix.includes('image/jpg')) {
            mimeType = "image/jpeg";
          }
        }
      }

      // Send image + prompt to AI
      response = await ai.models.generateContent({
        model: config.ai.model,
        contents: [
          {
            role: "user",
            parts: [
              {
                inlineData: {
                  mimeType,
                  data: cleanBase64,
                },
              },
              {
                text: prompt,
              },
            ],
          },
        ],
      });

      console.log("✅ AI analyzed the reference image for material details");
    } else {
      // No image - text-only generation
      response = await ai.models.generateContent({
        model: config.ai.model,
        contents: prompt,
      });
    }

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

    // Validate each idea structure
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
    console.log("🎨 Starting image generation for each craft idea...");

    // Generate images for each craft
    const ideasWithImages: CraftIdea[] = [];

    for (let i = 0; i < validIdeas.length; i++) {
      const idea = validIdeas[i];

      try {
        console.log(`\n🖼️  [${i + 1}/${validIdeas.length}] Generating image for: "${idea.title}"`);
        console.log(`📝 Difficulty: ${idea.difficulty || 'Not specified'}`);
        console.log(`⏱️  Time: ${idea.timeNeeded}`);
        console.log(`🔧 Steps: ${idea.steps.length} steps`);
        console.log(`✨ Has Visual Description: ${!!idea.visualDescription}`);

        // Pass craft details AND reference image to image generation
        const imageUrl = await generateCraftImage(
          idea.title,
          idea.description,
          cleanMaterials,
          idea.steps,
          referenceImageBase64, // 🎯 Pass the same reference image
          idea.visualDescription
        );

        ideasWithImages.push({
          ...idea,
          generatedImageUrl: imageUrl,
        });

        console.log(`✅ [${i + 1}/${validIdeas.length}] Image generated successfully`);
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
    console.log(`✅ IMAGE-ENHANCED CRAFT SERVICE COMPLETE`);
    console.log(`📊 Total Ideas: ${ideasWithImages.length}`);
    console.log(`🖼️  Ideas with Images: ${ideasWithImages.filter(i => i.generatedImageUrl).length}`);
    console.log(`📸 Used Reference Image: ${hasReferenceImage ? 'Yes' : 'No'}`);
    console.log("🎨 ============================================\n");

    return {
      materials: Array.isArray(materials) ? materials : [materials],
      ideas: ideasWithImages,
      count: ideasWithImages.length,
      generatedAt: new Date().toISOString(),
      metadata: {
        hasReferenceImage,
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