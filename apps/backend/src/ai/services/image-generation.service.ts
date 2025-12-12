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
    if (!referenceImageBase64) {
      console.warn("⚠️  WARNING: No reference image - AI may hallucinate materials!");
    }

    // Extract material details for strict matching
    const materialList = materials.split(',').map(m => m.trim());
    const materialCount = materialList.length;

    // Build the image generation prompt with STRICT anti-hallucination rules
    let imagePrompt = "";

    if (visualDescription && visualDescription.trim()) {
      // Use the detailed visual description from the craft idea

      // Parse material quantities for explicit validation
      const materialCounts = materialList.map(m => {
        const match = m.match(/^(.+?)\s*\((\d+)\)$/);
        if (match) {
          return `${match[2]}x ${match[1]}`;
        }
        return `1x ${m}`;
      }).join(', ');

      imagePrompt = `
Create a beautiful, professional photograph of a completed DIY upcycling craft project.

**WHAT YOU'RE PHOTOGRAPHING:**
${visualDescription}

**CRAFT TITLE:** "${craftTitle}"

**🚨 CRITICAL - EXACT MATERIAL INVENTORY (COUNT EVERY ITEM):**
You have a reference image showing the ACTUAL materials the user scanned.

**MATERIALS AVAILABLE (THIS IS ALL YOU HAVE):**
${materialCounts}
Total items: ${materialCount}

**STRICT COUNTING RULES:**
${materialList.map((m, i) => {
        const match = m.match(/^(.+?)\s*\((\d+)\)$/);
        const count = match ? match[2] : '1';
        const name = match ? match[1] : m;
        return `${i + 1}. ${name}: EXACTLY ${count} (no more, no less)`;
      }).join('\n')}

**BEFORE GENERATING - VERIFY THESE RULES:**
□ I have counted each material in the reference image
□ My craft uses EXACTLY the quantities listed above
□ I have NOT added any extra bottles, cans, boxes, or containers
□ I have NOT increased any quantities beyond what's available
□ The materials in my image match the SIZE shown in reference
□ The craft is physically possible with ONLY these materials
□ I have not invented any materials from nowhere

**ANTI-HALLUCINATION RULES (CRITICAL):**
1. **Reference Image is Truth:** Look at the reference image - that's ALL the materials available
2. **Count Verification:** Before generating, count materials in reference image and match exactly
3. **No Additions:** DO NOT add bottles, cans, jars, boxes, or any items not in reference
4. **No Quantity Increases:** If reference shows 1 bottle, use 1 bottle (not 2, not 3)
5. **No Substitutions:** If they have plastic, don't show glass; if they have small, don't show large
6. **Size Matching:** Match the SIZE and TYPE from reference image exactly
7. **Physical Reality:** The craft MUST be achievable with ONLY the scanned materials

**ABSOLUTELY FORBIDDEN (WILL CAUSE FAILURE):**
❌ Showing more items than listed in materials inventory above
❌ Adding extra bottles, containers, or materials not in reference image
❌ Using larger/smaller items than shown in reference image
❌ Creating crafts that need more materials than provided
❌ Inventing additional decorative items from nowhere (unless basic household items)
❌ Showing multiple of an item when only one exists in reference
❌ Adding professional craft supplies (felt, googly eyes, special decorations)

**ALLOWED ADDITIONS (Basic Household Items Only):**
✅ Simple paint/markers for decoration
✅ Basic glue or tape (not visible in final product)
✅ String or rubber bands if mentioned in description
✅ One small plant or common household item for context (if in description)

**STYLE REQUIREMENTS:**
📸 Photography Style:
- High-quality, Pinterest-worthy photo
- Looks handmade but polished and neat
- Shows the recycled materials clearly transformed
- Natural, inviting aesthetic
- REALISTIC - must be makeable with ONLY the scanned materials
- Focus on the EXACT number of materials listed above

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

**FINAL VERIFICATION CHECKLIST:**
Before generating the image, confirm:
□ Material count matches exactly: ${materialCounts}
□ No extra materials added beyond the inventory above
□ Sizes match the reference image
□ Types match the reference image  
□ The craft is physically possible with ONLY these ${materialCount} item(s)
□ I have not hallucinated any additional materials

**IMPORTANT:**
- This is a FINISHED, COMPLETED craft - not materials or work-in-progress
- Should look achievable for beginners
- Professional but handmade quality
- Make it look like something from a DIY blog or Pinterest board
- MUST use ONLY the materials from the reference image - nothing more!
- COUNT YOUR MATERIALS: ${materialCounts} - that's it!
`.trim();

    } else {
      // Fallback: Generate from craft details with strict rules

      const stepDetails = craftSteps && craftSteps.length > 0
        ? craftSteps.slice(-2).join(' ')
        : craftDescription;

      // Parse material quantities for explicit validation
      const materialCounts = materialList.map(m => {
        const match = m.match(/^(.+?)\s*\((\d+)\)$/);
        if (match) {
          return `${match[2]}x ${match[1]}`;
        }
        return `1x ${m}`;
      }).join(', ');

      imagePrompt = `
Create a beautiful, professional photograph of a completed DIY upcycling craft project.

**CRAFT DETAILS:**
Title: "${craftTitle}"
Description: ${craftDescription}
Final steps: ${stepDetails}

**🚨 CRITICAL - EXACT MATERIAL INVENTORY:**
You have a reference image showing the ACTUAL scanned materials.

**MATERIALS AVAILABLE (THIS IS ALL YOU HAVE):**
${materialCounts}
Total items: ${materialCount}

**STRICT COUNTING RULES:**
${materialList.map((m, i) => {
        const match = m.match(/^(.+?)\s*\((\d+)\)$/);
        const count = match ? match[2] : '1';
        const name = match ? match[1] : m;
        return `${i + 1}. ${name}: EXACTLY ${count} (no more, no less)`;
      }).join('\n')}

**ANTI-HALLUCINATION RULES (CRITICAL):**
1. **Reference Image is Truth:** Look at the reference image - that's ALL the materials available
2. **Count Verification:** Count materials in reference image and match exactly
3. **No Additions:** DO NOT add bottles, cans, jars, boxes, or any items not in reference
4. **No Quantity Increases:** If reference shows 1 bottle, use 1 bottle (not 2, not 3)
5. **No Substitutions:** If they have plastic, don't show glass; if small, don't show large
6. **Size Matching:** Match SIZE and TYPE from reference image exactly
7. **Physical Reality:** Craft MUST be achievable with ONLY the scanned materials

**ABSOLUTELY FORBIDDEN:**
❌ Adding materials not in the reference image
❌ Using more items than shown in reference
❌ Inventing decorative elements from nowhere
❌ Showing different sizes/types than reference
❌ Adding professional craft supplies (felt, googly eyes, etc.)

**ALLOWED (Basic Household Items Only):**
✅ Simple paint/markers for decoration
✅ Basic glue or tape (not visible)
✅ String or rubber bands if needed
✅ One small plant or household item for context

**STYLE REQUIREMENTS:**
📸 Photography Style:
- High-quality, Pinterest-worthy photo
- Handmade but polished and professional-looking
- Clearly shows the recycled materials transformed
- Beginner-friendly and inspiring
- REALISTIC - physically possible with scanned materials only
- Shows EXACT number of materials: ${materialCounts}

🌅 Lighting:
- Bright natural daylight from the side
- Soft, warm lighting
- Gentle shadows that add depth

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

**FINAL VERIFICATION:**
Before generating, confirm:
□ Material count: ${materialCounts} - exact match
□ No extra items added
□ Quantities match reference image
□ Sizes match reference image
□ Physically possible with ONLY these ${materialCount} item(s)

**IMPORTANT:**
- FINISHED craft only - not work in progress
- Don't add extra recyclables not in the materials list
- Don't show messy workspace
- Don't make it look like trash - make it look like a treasure!
- Don't use dark or dramatic lighting
- COUNT YOUR MATERIALS: ${materialCounts} - that's all you have!
`.trim();
    }

    const payload: any = {
      model: config.ai.imageModel,
      prompt: imagePrompt,
      config: {
        numberOfImages: 1,
      },
    };

    // Handle reference image if provided (CRITICAL for accuracy)
    if (referenceImageBase64) {
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
      payload.referenceImages = [
        {
          mimeType: mimeType,
          image: {
            imageBytes: cleanBase64
          }
        }
      ];

    } else {
      console.warn("⚠️  DANGER: No reference image - AI may add extra materials!");
      console.warn("⚠️  Recommend always providing reference image for accuracy");
    }

    let response;
    try {
      response = await aiImage.models.generateImages(payload);
    } catch (apiError: any) {
      console.error("❌ Imagen API call failed:", apiError);
      throw new AppError(`Image generation failed: ${apiError.message || 'Unknown error'}`, 500);
    }

    const images = response.generatedImages ?? [];
    if (images.length === 0) {
      throw new AppError("No images generated", 500);
    }

    const imgBytes = images[0].image?.imageBytes;
    if (!imgBytes) {
      throw new AppError("Image generation failed - no image data returned", 500);
    }

    const generatedSizeMB = (imgBytes.length / (1024 * 1024)).toFixed(2);

    return `data:image/png;base64,${imgBytes}`;

  } catch (err: any) {
    console.error("❌ Error:", err.message);
    console.error("❌ Stack:", err.stack);

    throw new AppError(err.message || "Image generation failed", 500);
  }
};