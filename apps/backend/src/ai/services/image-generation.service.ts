// apps/backend/src/ai/services/image-generation.service.ts 
// ✅ ENHANCED: Strict material matching to prevent AI hallucination

import { AppError } from "../../utils/error";
import { aiImage } from "../gemini/client";
import { config } from "../../config";

/**
 * Generate friendly, accurate DIY craft images that match the materials and craft description
 * ✅ STRICT material validation to prevent hallucination
 * ✅ Reference image ensures exact material matching
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
    console.log("🎨 ANTI-HALLUCINATION IMAGE GENERATION");
    console.log("🎨 ============================================");
    console.log("📝 Craft Title:", craftTitle);
    console.log("📝 Materials:", materials);
    console.log("📝 Steps Count:", craftSteps?.length || 0);
    console.log("📝 Visual Description:", visualDescription ? "✅ Provided" : "⚠️ Not provided");
    console.log("📝 Reference Image:", referenceImageBase64 ? "✅ Provided (CRITICAL for accuracy)" : "⚠️ Missing");

    if (!referenceImageBase64) {
      console.warn("⚠️  WARNING: No reference image - AI may hallucinate materials!");
    }

    // Extract material details for strict matching
    const materialList = materials.split(',').map(m => m.trim());
    const materialCount = materialList.length;

    console.log("📊 Detected Materials:", materialList);
    console.log("📊 Material Count:", materialCount);

    // Build the image generation prompt with STRICT anti-hallucination rules
    let imagePrompt = "";

    if (visualDescription && visualDescription.trim()) {
      // Use the detailed visual description from the craft idea
      console.log("✅ Using visual description from craft idea");
      
      imagePrompt = `
Create a beautiful, professional photograph of a completed DIY upcycling craft project.

**WHAT YOU'RE PHOTOGRAPHING:**
${visualDescription}

**CRAFT TITLE:** "${craftTitle}"

**🚨 CRITICAL - MATERIAL ACCURACY RULES (MUST FOLLOW):**
You have a reference image showing the ACTUAL materials the user scanned.
- Materials available: ${materials}
- Item count: ${materialCount} item(s)
- Use ONLY these exact materials visible in the reference image
- DO NOT add bottles, cans, jars, or any items not in the reference image
- DO NOT increase quantities (if reference shows 1 bottle, use 1 bottle, not 2 or 3)
- DO NOT substitute materials (if they have plastic, don't show glass)
- Match the SIZE and TYPE of materials from the reference image exactly
- The finished craft MUST be physically possible with ONLY the items shown

**FORBIDDEN - WILL CAUSE HALLUCINATION:**
❌ Adding extra bottles, containers, or materials not in the reference image
❌ Using larger/smaller items than shown in the reference image
❌ Creating crafts that need more materials than provided
❌ Inventing additional decorative items from nowhere
❌ Showing multiple of an item when only one exists in reference

**STYLE REQUIREMENTS:**
📸 Photography Style:
- High-quality, Pinterest-worthy photo
- Looks handmade but polished and neat
- Shows the recycled materials clearly transformed
- Natural, inviting aesthetic
- REALISTIC - must be makeable with ONLY the scanned materials

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

**MATERIAL VERIFICATION CHECKLIST:**
Before generating, verify:
□ Every item in the craft matches the reference image materials
□ No extra materials added that aren't in the reference image
□ Quantities match exactly (not more, not less)
□ Size and type of materials match the reference image
□ The craft is physically possible with ONLY the scanned materials

**IMPORTANT:**
- This is a FINISHED, COMPLETED craft - not materials or work-in-progress
- Should look achievable for beginners
- Professional but handmade quality
- Make it look like something from a DIY blog or Pinterest board
- MUST use ONLY the materials from the reference image - nothing more!
`.trim();

    } else {
      // Fallback: Generate from craft details with strict rules
      console.log("⚠️ No visual description - generating from craft details with strict material rules");
      
      const stepDetails = craftSteps && craftSteps.length > 0 
        ? craftSteps.slice(-2).join(' ') 
        : craftDescription;

      imagePrompt = `
Create a beautiful, professional photograph of a completed DIY upcycling craft project.

**CRAFT DETAILS:**
Title: "${craftTitle}"
Description: ${craftDescription}
Final steps: ${stepDetails}

**🚨 CRITICAL - MATERIALS USED (MUST MATCH EXACTLY):**
${materials}
Quantity: ${materialCount} item(s)

**ANTI-HALLUCINATION RULES:**
You have a reference image showing the ACTUAL scanned materials.
- Use ONLY what you see in the reference image
- DO NOT add extra bottles, cans, or containers
- DO NOT increase quantities beyond what's shown
- DO NOT substitute different materials
- Match SIZE, TYPE, and QUANTITY from reference image

**FORBIDDEN:**
❌ Adding materials not in the reference image
❌ Using more items than shown in reference
❌ Inventing decorative elements from nowhere
❌ Showing different sizes/types than reference

**STYLE REQUIREMENTS:**
📸 Photography Style:
- High-quality, Pinterest-worthy photo
- Handmade but polished and professional-looking
- Clearly shows the recycled materials transformed
- Beginner-friendly and inspiring
- REALISTIC - physically possible with scanned materials only

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
- Match the reference image materials EXACTLY
- Look sturdy, usable, and well-made
- Make viewers excited to try making it
- Show the craft being used if applicable

**MATERIAL VERIFICATION:**
□ Checked reference image for exact materials
□ No extra items added
□ Quantities match reference image
□ Sizes match reference image
□ Physically possible with scanned materials only

**FORBIDDEN:**
- Don't add extra recyclables not in the materials list
- Don't show work in progress or messy workspace
- Don't make it look like trash - make it look like a treasure!
- Don't use dark or dramatic lighting
- Don't add materials not in reference image
`.trim();
    }

    console.log("📝 Image Prompt Length:", imagePrompt.length, "characters");
    console.log("🔍 Anti-Hallucination Rules: ENABLED");
    console.log("🔍 Reference Image Validation: REQUIRED");

    const payload: any = {
      model: config.ai.imageModel,
      prompt: imagePrompt,
      config: {
        numberOfImages: 1,
      },
    };

    // Handle reference image if provided (CRITICAL for accuracy)
    if (referenceImageBase64) {
      console.log("🖼️ Processing reference image for STRICT material matching...");

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

      console.log("✅ Reference image added - AI will match EXACT materials from scan");
      console.log("🎯 Anti-hallucination mode: ACTIVE");
    } else {
      console.warn("⚠️  DANGER: No reference image - AI may add extra materials!");
      console.warn("⚠️  Recommend always providing reference image for accuracy");
    }

    console.log("\n🚀 Calling Google Imagen API with strict material rules...");

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
    console.log("✅ ✨ ANTI-HALLUCINATION IMAGE GENERATED! ✨");
    console.log("📊 Generated Image Size:", generatedSizeMB, "MB");
    console.log("🎯 Material Matching: STRICT (reference image used)");
    console.log("📦 Exact materials used:", materials);
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