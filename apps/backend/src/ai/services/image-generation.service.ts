// apps/backend/src/ai/services/image-generation.service.ts - STRICT MATERIAL COUNT

import { AppError } from "../../utils/error";
import { aiImage } from "../gemini/client";
import { config } from "../../config";

/**
 * Enhanced craft image generation with STRICT material usage
 * Shows ONLY the exact materials that were scanned
 */
export const generateCraftImage = async (
  craftTitle: string,
  craftDescription: string,
  materials: string,
  craftSteps?: string[],
  referenceImageBase64?: string
) => {
  try {
    console.log("\n🎨 ============================================");
    console.log("🎨 IMAGE GENERATION SERVICE - STRICT MATERIALS");
    console.log("🎨 ============================================");
    console.log("📝 Craft Title:", craftTitle);
    console.log("📝 Materials:", materials);
    console.log("📝 Steps Count:", craftSteps?.length || 0);
    console.log("🖼️  Has Reference Image:", !!referenceImageBase64);

    // 🎯 Extract material count for strict enforcement
    const materialList = materials.split(',').map(m => m.trim());
    const materialCount = materialList.length;
    
    console.log("📊 Material Count:", materialCount);
    console.log("📦 Materials List:", materialList);

    // 🎯 Extract key visual details from steps
    let visualDetails = "";
    if (craftSteps && craftSteps.length > 0) {
      const finalSteps = craftSteps.slice(-3).join(" ");
      visualDetails = `\nConstruction details: ${finalSteps}`;
    }

    // Create ULTRA-DETAILED prompt with STRICT material enforcement
    const prompt = referenceImageBase64
      ? `
Create a professional, ULTRA-REALISTIC photograph of a completed DIY craft project.

🚨 CRITICAL MATERIAL CONSTRAINT:
The reference image shows EXACTLY what materials are available.
You MUST use ONLY these materials - DO NOT add extra items.

Materials available: ${materials}
Number of items: ${materialCount}

**STRICT RULES:**
1. If you see 1 bottle in the reference → Show ONLY 1 bottle in the craft
2. If you see 2 cans in the reference → Show ONLY 2 cans in the craft
3. DO NOT multiply materials (no showing 3-4 bottles if only 1 was scanned)
4. DO NOT add additional recyclables that weren't scanned
5. You CAN show basic supplies (tape, glue, markers) but the MAIN materials must match exactly

**CRITICAL: USE THE REFERENCE IMAGE AS YOUR SOURCE**
The reference image shows the ACTUAL materials that were scanned by the user.
You MUST use these EXACT materials with their EXACT:
- Quantity (if 1 bottle shown, use ONLY 1 bottle in the final craft)
- Colors (if the bottle is blue, make it blue)
- Textures (if it's transparent, keep it transparent)
- Sizes and proportions
- Material types (plastic/cardboard/glass/metal)
- Conditions (new/used/worn)

**CRAFT PROJECT DETAILS:**
Title: ${craftTitle}
Description: ${craftDescription}
Materials Used: ${materials} (USE ONLY THESE - NO ADDITIONS)${visualDetails}

**PHOTOGRAPHY REQUIREMENTS - ULTRA-REALISTIC STYLE:**

1. REAL PHOTO AESTHETIC (NOT CGI, NOT 3D RENDER, NOT ILLUSTRATION)
   - Must look like an actual photograph taken with a camera
   - Show actual recycled materials (maintain their realistic appearance)
   - Include natural imperfections (slight wear, texture, creases)
   - Avoid computer-generated or overly perfect appearance

2. ACCURATE MATERIAL REPRESENTATION
   - Match the EXACT materials from the reference image
   - Use the EXACT QUANTITY shown in reference (count the items carefully)
   - If reference shows 1 plastic bottle → Final craft shows 1 bottle transformed
   - If reference shows 2 items → Final craft uses exactly 2 items
   - Maintain the same colors, transparency, and textures
   - Show the transformation from reference materials to finished craft

3. MATERIAL COUNT VERIFICATION
   - Before generating, count materials in reference image
   - Ensure final craft uses EXACTLY that count
   - Do not multiply or add extra items
   - Example: 1 bottle reference → 1 bottle in final image (not 2, not 3, not 4)

4. LIGHTING & COMPOSITION
   - Soft, natural daylight or bright indoor lighting
   - Main light from top-left at 45-degree angle
   - Gentle shadows to show depth and dimension
   - Clean, uncluttered background (white table, light wood surface, or neutral countertop)
   
5. CAMERA PERSPECTIVE
   - Shot from slightly above (30-45 degree angle)
   - Center the craft in frame with subtle depth of field
   - Sharp focus on the craft, background slightly soft
   - Show the craft in context (on desk, shelf, or in use)

6. HANDMADE DIY AESTHETIC
   - Should look handmade but well-executed
   - Slight imperfections are good (shows it's DIY)
   - Edges don't need to be perfectly straight
   - Visible construction materials okay (tape, glue lines visible)
   - Shows it was made at home from the EXACT materials scanned

7. STYLE MUST BE: Real DIY photograph, Pinterest craft tutorial, single-item transformation showcase

8. AVOID: Multiple copies of the same item (unless multiple were scanned), stock photos, CGI renders, 3D models, illustrations, cartoons, anime style, overly polished product photography, artificial studio lighting, unrealistic perfection, adding materials that weren't in the reference image

**VERIFICATION CHECKLIST:**
✓ Count materials in reference image
✓ Ensure craft uses EXACTLY that many items (no more, no less)
✓ Materials match the colors/textures from reference
✓ No additional recyclables added beyond what was scanned
✓ Shows realistic transformation of the EXACT materials provided

The final image should inspire someone to think: "I could make this with the ONE bottle I just scanned!"
`.trim()
      : `
Create a professional, ULTRA-REALISTIC photograph of a completed DIY craft project.

🚨 CRITICAL MATERIAL CONSTRAINT:
Materials available: ${materials}
Number of items: ${materialCount}

You MUST use ONLY these exact materials - DO NOT add extra items.

**STRICT RULES:**
1. Use ONLY the number of items specified in materials list
2. If materials say "plastic bottle" (singular) → Show ONLY 1 bottle
3. If materials say "plastic bottles (2)" → Show ONLY 2 bottles
4. DO NOT multiply materials or add extras
5. You CAN show basic supplies (tape, glue, markers) but recyclables must match exactly

**CRAFT PROJECT DETAILS:**
Title: ${craftTitle}
Description: ${craftDescription}
Materials Used: ${materials} (ONLY THESE - NO ADDITIONS)${visualDetails}

**PHOTOGRAPHY REQUIREMENTS - ULTRA-REALISTIC STYLE:**

1. REAL PHOTO AESTHETIC (NOT CGI, NOT 3D RENDER, NOT ILLUSTRATION)
   - Must look like an actual photograph taken with a camera
   - Show actual recycled materials (realistic appearance)
   - Include natural imperfections (realistic texture, slight wear)
   - Avoid computer-generated or overly perfect appearance

2. MATERIAL REPRESENTATION
   - Show EXACTLY the number of items specified: ${materialCount} item(s)
   - Use typical recycled material colors (clear plastic, brown cardboard, clear glass)
   - Display authentic textures and material properties
   - Materials should look cleaned and prepared but recognizable
   - DO NOT show multiple copies if only 1 was specified

3. MATERIAL COUNT VERIFICATION
   - Carefully count materials specified: ${materials}
   - Final craft must use EXACTLY that count
   - Example: If 1 bottle → show 1 bottle transformed (not 2, not 3)
   - Example: If 2 cans → show exactly 2 cans used (not 1, not 4)

4. LIGHTING & COMPOSITION
   - Soft, natural daylight or bright indoor lighting
   - Main light from top-left at 45-degree angle
   - Gentle shadows for depth
   - Clean background (white table or light wood surface)
   
5. CAMERA PERSPECTIVE
   - Shot from slightly above (30-45 degree angle)
   - Center the craft with subtle depth of field
   - Sharp focus on craft, soft background
   - Show in functional context (on desk, shelf, kitchen counter)

6. HANDMADE DIY AESTHETIC
   - Should look handmade and achievable at home
   - Slight imperfections that show it's DIY
   - Edges don't need to be perfectly straight
   - Visible materials and construction (tape, glue visible is okay)
   - Shows transformation of EXACT materials (no extras)

7. STYLE: Real DIY photograph, craft blog tutorial photo, single-item upcycle showcase, Pinterest DIY post

8. AVOID: Multiple copies when only one item specified, adding extra materials, stock photography, CGI, 3D renders, illustrations, cartoons, overly polished product shots, artificial lighting, unrealistic perfection

**VERIFICATION:**
✓ Material count matches specification: ${materialCount} item(s)
✓ No additional recyclables beyond what's listed
✓ Shows realistic transformation achievable with these exact materials

The result should look achievable with the EXACT materials specified!
`.trim();

    console.log("📝 Prompt Length:", prompt.length, "characters");
    console.log("🔍 Material-Strict Prompt Preview:", prompt.substring(0, 300), "...");

    const payload: any = {
      model: config.ai.imageModel,
      prompt,
      config: {
        numberOfImages: 1,
      },
    };

    // Handle reference image if provided
    if (referenceImageBase64) {
      console.log("🖼️  Processing reference image for STRICT material matching...");
      
      let cleanBase64 = referenceImageBase64;
      let mimeType = "image/jpeg";
      
      if (referenceImageBase64.includes(',')) {
        const parts = referenceImageBase64.split(',');
        cleanBase64 = parts[1];
        
        const dataUriPrefix = parts[0];
        if (dataUriPrefix.includes('image/png')) {
          mimeType = "image/png";
        } else if (dataUriPrefix.includes('image/webp')) {
          mimeType = "image/webp";
        } else if (dataUriPrefix.includes('image/jpeg') || dataUriPrefix.includes('image/jpg')) {
          mimeType = "image/jpeg";
        }
      }
      
      const imageSizeMB = (cleanBase64.length / (1024 * 1024)).toFixed(2);
      
      console.log("📊 Reference Image Details:");
      console.log("  - MIME Type:", mimeType);
      console.log("  - Size:", imageSizeMB, "MB");
      console.log("  - Will enforce EXACT material match from reference");
      
      if (!cleanBase64 || cleanBase64.length < 100) {
        throw new AppError("Invalid reference image - too short", 400);
      }
      
      payload.referenceImages = [
        {
          mimeType: mimeType,
          image: {
            imageBytes: cleanBase64
          }
        }
      ];
      
      console.log("✅ Reference image added - will match EXACT materials/count");
    }

    console.log("\n🚀 Calling Google Imagen API with STRICT material constraints...");
    console.log("📊 Enforcement:");
    console.log("  - Material Count:", materialCount);
    console.log("  - Will NOT multiply materials");
    console.log("  - Will NOT add extras");

    // Call Imagen API
    const response = await aiImage.models.generateImages(payload);

    console.log("✅ Imagen API response received");

    const images = response.generatedImages ?? [];
    if (images.length === 0) {
      throw new AppError("No images generated by Imagen", 500);
    }

    const imgBytes = images[0].image?.imageBytes;
    if (!imgBytes) {
      throw new AppError("Image generation failed - no image data returned", 500);
    }

    const generatedSizeMB = (imgBytes.length / (1024 * 1024)).toFixed(2);
    console.log("✅ MATERIAL-ACCURATE Image generated successfully");
    console.log("📊 Generated Image Size:", generatedSizeMB, "MB");
    console.log("✅ Should show EXACTLY", materialCount, "item(s)");
    console.log("🎨 ============================================\n");

    return `data:image/png;base64,${imgBytes}`;

  } catch (err: any) {
    console.error("\n❌ ============================================");
    console.error("❌ IMAGEN API ERROR");
    console.error("❌ ============================================");
    console.error("❌ Error:", err.message);
    console.error("❌ ============================================\n");
    
    throw new AppError(err.message || "Image generation failed", 500);
  }
};