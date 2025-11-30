// apps/backend/src/ai/services/image-generation.service.ts 

import { AppError } from "../../utils/error";
import { aiImage } from "../gemini/client";
import { config } from "../../config";

/**
 * Generate friendly, accurate DIY craft images that match the materials and craft description
 * ✅ Creates images that show exactly what users can make with their scanned materials
 */
export const generateCraftImage = async (
  craftTitle: string,
  craftDescription: string,
  materials: string,
  craftSteps?: string[],
  referenceImageBase64?: string,
  visualDescription?: string
) => {
  try {
    console.log("\n🎨 ============================================");
    console.log("🎨 FRIENDLY DIY IMAGE GENERATION");
    console.log("🎨 ============================================");
    console.log("📝 Craft Title:", craftTitle);
    console.log("📝 Materials:", materials);
    console.log("📝 Steps Count:", craftSteps?.length || 0);
    console.log("📝 Visual Description:", visualDescription ? "✅ Provided" : "⚠️ Not provided");
    console.log("📝 Reference Image:", referenceImageBase64 ? "✅ Provided" : "ℹ️ Not provided");

    // Extract material details for strict matching
    const materialList = materials.split(',').map(m => m.trim());
    const materialCount = materialList.length;

    console.log("📊 Detected Materials:", materialList);
    console.log("📊 Material Count:", materialCount);

    // Build the image generation prompt
    let imagePrompt = "";

    if (visualDescription && visualDescription.trim()) {
      // Use the detailed visual description from the craft idea
      console.log("✅ Using visual description from craft idea");
      
      imagePrompt = `
Create a beautiful, professional photograph of a completed DIY upcycling craft project.

**WHAT YOU'RE PHOTOGRAPHING:**
${visualDescription}

**CRAFT TITLE:** "${craftTitle}"

**STYLE REQUIREMENTS:**
📸 Photography Style:
- High-quality, Pinterest-worthy photo
- Looks handmade but polished and neat
- Shows the recycled materials clearly transformed
- Natural, inviting aesthetic

🌅 Lighting:
- Bright, natural daylight (soft and warm)
- Coming from the side (left or right)
- Creates gentle, soft shadows
- Makes colors pop naturally

🎨 Setting:
- Clean, simple background (white table, light wood surface, or neutral countertop)
- Minimal distractions - focus on the craft
- Maybe one small decorative element (plant, book) if it enhances the scene
- Looks like a cozy home workspace or craft area

✨ Mood:
- Inspiring and achievable
- Makes viewers think: "I can make this!"
- Warm and welcoming
- Shows the craft in actual use if applicable

**CRITICAL MATERIAL MATCHING:**
- Materials used: ${materials}
- Show EXACTLY these materials transformed into the craft
- Don't add extra recyclables that weren't listed
- The finished product should clearly show it's made from: ${materialList.join(', ')}

**IMPORTANT:**
- This is a FINISHED, COMPLETED craft - not materials or work-in-progress
- Should look achievable for beginners
- Professional but handmade quality
- Make it look like something from a DIY blog or Pinterest board
`.trim();

    } else {
      // Fallback: Generate from craft details
      console.log("⚠️ No visual description - generating from craft details");
      
      const stepDetails = craftSteps && craftSteps.length > 0 
        ? craftSteps.slice(-2).join(' ') 
        : craftDescription;

      imagePrompt = `
Create a beautiful, professional photograph of a completed DIY upcycling craft project.

**CRAFT DETAILS:**
Title: "${craftTitle}"
Description: ${craftDescription}
Final steps: ${stepDetails}

**MATERIALS USED (MUST MATCH EXACTLY):**
${materials}
Quantity: ${materialCount} item(s)

**STYLE REQUIREMENTS:**
📸 Photography Style:
- High-quality, Pinterest-worthy photo
- Handmade but polished and professional-looking
- Clearly shows the recycled materials transformed
- Beginner-friendly and inspiring

🌅 Lighting:
- Bright natural daylight from the side
- Soft, warm lighting
- Gentle shadows that add depth
- Colors look vibrant and true

🎨 Setting:
- Simple, clean surface (white table or light wood)
- Minimal background - focus on the craft
- Looks like a home craft space
- Maybe a small plant or neutral decor item

✨ Final Product Should:
- Be COMPLETELY FINISHED (not in progress)
- Use ONLY the materials listed: ${materialList.join(', ')}
- Look sturdy, usable, and well-made
- Make viewers excited to try making it
- Show the craft being used if applicable (e.g., holding pens, displaying items)

**FORBIDDEN:**
- Don't add extra recyclables not in the materials list
- Don't show work in progress or messy workspace
- Don't make it look like trash - make it look like a treasure!
- Don't use dark or dramatic lighting
`.trim();
    }

    console.log("📝 Image Prompt Length:", imagePrompt.length, "characters");
    console.log("🔍 Prompt Preview:", imagePrompt.substring(0, 200), "...");

    const payload: any = {
      model: config.ai.imageModel,
      prompt: imagePrompt,
      config: {
        numberOfImages: 1,
      },
    };

    // Handle reference image if provided
    if (referenceImageBase64) {
      console.log("🖼️ Processing reference image for material matching...");

      if (typeof referenceImageBase64 !== 'string') {
        console.error("❌ Invalid reference image type:", typeof referenceImageBase64);
        throw new AppError("Invalid reference image format - expected string", 400);
      }

      let cleanBase64 = referenceImageBase64.trim();
      let mimeType = "image/jpeg";

      // Handle data URI format
      if (cleanBase64.includes(',')) {
        try {
          const parts = cleanBase64.split(',');
          
          if (parts.length !== 2) {
            throw new AppError("Invalid base64 data URI format", 400);
          }

          const dataUriPrefix = parts[0];
          cleanBase64 = parts[1];

          // Detect MIME type
          if (dataUriPrefix.includes('image/png')) {
            mimeType = "image/png";
          } else if (dataUriPrefix.includes('image/webp')) {
            mimeType = "image/webp";
          } else if (dataUriPrefix.includes('image/jpeg') || dataUriPrefix.includes('image/jpg')) {
            mimeType = "image/jpeg";
          } else {
            console.warn("⚠️ Unknown MIME type, defaulting to image/jpeg");
          }
        } catch (splitError) {
          console.error("❌ Error parsing data URI:", splitError);
          throw new AppError("Failed to parse base64 data URI", 400);
        }
      }

      // Validate base64
      if (!cleanBase64 || cleanBase64.length < 100) {
        console.error("❌ Invalid base64 length:", cleanBase64?.length || 0);
        throw new AppError("Invalid reference image - too short or empty", 400);
      }

      // Test base64 format
      if (!/^[A-Za-z0-9+/=]+$/.test(cleanBase64)) {
        console.error("❌ Invalid base64 characters");
        throw new AppError("Invalid base64 encoding", 400);
      }

      const imageSizeMB = (cleanBase64.length / (1024 * 1024)).toFixed(2);
      console.log("✅ Reference Image Valid:");
      console.log("  - MIME Type:", mimeType);
      console.log("  - Size:", imageSizeMB, "MB");

      payload.referenceImages = [
        {
          mimeType: mimeType,
          image: {
            imageBytes: cleanBase64
          }
        }
      ];

      console.log("✅ Reference image added - will match these exact materials");
    } else {
      console.log("ℹ️ No reference image - generating based on material description only");
    }

    console.log("\n🚀 Calling Google Imagen API...");

    let response;
    try {
      response = await aiImage.models.generateImages(payload);
    } catch (apiError: any) {
      console.error("❌ Imagen API call failed:", apiError);
      throw new AppError(`Image generation failed: ${apiError.message || 'Unknown error'}`, 500);
    }

    console.log("✅ Imagen API response received");

    const images = response.generatedImages ?? [];
    if (images.length === 0) {
      throw new AppError("No images generated", 500);
    }

    const imgBytes = images[0].image?.imageBytes;
    if (!imgBytes) {
      throw new AppError("Image generation failed - no image data returned", 500);
    }

    const generatedSizeMB = (imgBytes.length / (1024 * 1024)).toFixed(2);
    console.log("✅ ✨ FRIENDLY DIY IMAGE GENERATED! ✨");
    console.log("📊 Generated Image Size:", generatedSizeMB, "MB");
    console.log("🎨 Image matches materials:", materials);
    console.log("🎨 ============================================\n");

    return `data:image/png;base64,${imgBytes}`;

  } catch (err: any) {
    console.error("\n❌ ============================================");
    console.error("❌ IMAGE GENERATION ERROR");
    console.error("❌ ============================================");
    console.error("❌ Error:", err.message);
    console.error("❌ Stack:", err.stack);
    console.error("❌ ============================================\n");

    throw new AppError(err.message || "Image generation failed", 500);
  }
};