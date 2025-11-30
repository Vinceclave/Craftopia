// apps/backend/src/ai/services/image-generation.service.ts - VISUAL ENHANCED

import { AppError } from "../../utils/error";
import { aiImage } from "../gemini/client";
import { config } from "../../config";

/**
 * Enhanced craft image generation with VISUAL focus
 * Uses visualDescription if available, otherwise strict material rules
 */
export const generateCraftImage = async (
  craftTitle: string,
  craftDescription: string,
  materials: string,
  craftSteps?: string[],
  referenceImageBase64?: string,
  visualDescription?: string // ✅ NEW parameter
) => {
  try {
    console.log("\n🎨 ============================================");
    console.log("🎨 IMAGE GENERATION SERVICE - VISUAL ENHANCED");
    console.log("🎨 ============================================");
    console.log("📝 Craft Title:", craftTitle);
    console.log("📝 Materials:", materials);
    console.log("📝 Steps Count:", craftSteps?.length || 0);
    console.log("📝 Visual Description:", visualDescription ? "Provided" : "Not provided");

    // 🎯 Extract material count for strict enforcement
    const materialList = materials.split(',').map(m => m.trim());
    const materialCount = materialList.length;

    console.log("📊 Material Count:", materialCount);

    // 🎯 Use visual description if available, otherwise fallback to steps
    let visualDetails = "";
    if (visualDescription) {
      visualDetails = `\nVISUAL DESCRIPTION OF FINAL PRODUCT: ${visualDescription}`;
    } else if (craftSteps && craftSteps.length > 0) {
      const finalSteps = craftSteps.slice(-3).join(" ");
      visualDetails = `\nConstruction details: ${finalSteps}`;
    }

    // Create ENHANCED prompt with focus on VISUAL RESULT
    const prompt = referenceImageBase64
      ? `
Create a professional, ULTRA-REALISTIC photograph of a completed DIY craft project.

**SUBJECT:**
A finished upcycling project titled "${craftTitle}".
${visualDetails}

**MATERIAL SOURCE:**
The reference image shows the raw materials. You must transform these EXACT materials into the final craft.
- Materials: ${materials}
- Quantity: ${materialCount} item(s)

**VISUAL STYLE:**
- **Photorealistic:** Looks like a high-quality photo from a craft blog or Pinterest.
- **Lighting:** Bright, natural sunlight from the side. Soft shadows.
- **Setting:** Clean, modern surface (white table or light wood).
- **Aesthetic:** Handmade but neat. Shows the texture of the recycled materials (e.g., clear plastic, cardboard grain).

**CONSTRAINTS:**
- Use ONLY the materials shown in the reference image.
- Do NOT add extra bottles, cans, or boxes if they aren't in the reference.
- You CAN show basic supplies like glue, tape, or paint if implied by the design.
- The final object must look STURDY and USABLE.

**GOAL:**
Show the user exactly what they can make with the items they just scanned. Inspire them!
`.trim()
      : `
Create a professional, ULTRA-REALISTIC photograph of a completed DIY craft project.

**SUBJECT:**
A finished upcycling project titled "${craftTitle}".
${visualDetails}

**MATERIALS USED:**
- ${materials}
- Quantity: ${materialCount} item(s)

**VISUAL STYLE:**
- **Photorealistic:** Looks like a high-quality photo from a craft blog or Pinterest.
- **Lighting:** Bright, natural sunlight from the side. Soft shadows.
- **Setting:** Clean, modern surface (white table or light wood).
- **Aesthetic:** Handmade but neat. Shows the texture of the recycled materials.

**CONSTRAINTS:**
- Use ONLY the materials listed.
- Do NOT add extra recyclables.
- You CAN show basic supplies like glue, tape, or paint.
- The final object must look STURDY and USABLE.

**GOAL:**
Show the user exactly what they can make with the items they just scanned. Inspire them!
`.trim();

    console.log("📝 Prompt Length:", prompt.length, "characters");
    console.log("🔍 Visual Prompt Preview:", prompt.substring(0, 300), "...");

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

      console.log("✅ Reference image added");
    }

    console.log("\n🚀 Calling Google Imagen API...");

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
    console.log("✅ VISUAL-ACCURATE Image generated successfully");
    console.log("📊 Generated Image Size:", generatedSizeMB, "MB");
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