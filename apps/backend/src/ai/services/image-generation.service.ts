// apps/backend/src/ai/services/image-generation.service.ts

import { AppError } from "../../utils/error";
import { aiImage } from "../gemini/client";
import { config } from "../../config";

export const generateCraftImage = async (
  craftTitle: string,
  craftDescription: string,
  materials: string,
  referenceImageBase64?: string
) => {
  try {
    console.log("\n🎨 ============================================");
    console.log("🎨 IMAGE GENERATION SERVICE");
    console.log("🎨 ============================================");
    console.log("📝 Craft Title:", craftTitle);
    console.log("📝 Materials:", materials);
    console.log("🖼️  Has Reference Image:", !!referenceImageBase64);

    // Create enhanced prompt based on whether we have a reference image
    const prompt = referenceImageBase64
      ? `
Create a high-quality, realistic craft project photograph based on the reference image provided.

**CRITICAL INSTRUCTIONS - USE THE REFERENCE IMAGE**:
- The reference image shows the ACTUAL materials that were scanned
- Use the EXACT materials, colors, and textures visible in the reference photo
- Match the material types from the reference (plastic bottles, cardboard, etc.)
- Show how these SPECIFIC materials transform into the finished craft
- Maintain the same color palette and material characteristics from the reference

**Craft Project Details**:
Title: ${craftTitle}
Description: ${craftDescription}
Materials Detected: ${materials}

**Visual Style**:
- Realistic, professional craft photography
- Well-lit, clean background (white or light wood surface)
- Show the finished craft as if made from the materials in the reference image
- Hands-on, DIY aesthetic
- Clear focus on the craft project
- Natural lighting with soft shadows

**Composition**:
- Center the finished craft in the frame
- Show the craft from a flattering angle (slightly above, 45-degree angle)
- Include slight depth of field to make the craft stand out
- Professional product photography style

The result should look like a real photograph of someone successfully completing this craft project using the exact materials from the reference image.
`.trim()
      : `
Create a high-quality, realistic craft project photograph.

**Craft Project Details**:
Title: ${craftTitle}
Description: ${craftDescription}
Materials: ${materials}

**Visual Style**:
- Realistic, professional craft photography
- Well-lit, clean background (white or light wood surface)
- Show the finished craft project
- Hands-on, DIY aesthetic
- Clear focus on the craft
- Natural lighting with soft shadows

**Composition**:
- Center the craft in the frame
- Show from a flattering angle (slightly above, 45-degree angle)
- Include slight depth of field
- Professional product photography style

The result should look like a real photograph of a completed craft project.
`.trim();

    console.log("📝 Prompt Length:", prompt.length, "characters");
    console.log("🔍 Prompt Preview:", prompt.substring(0, 200), "...");

    const payload: any = {
      model: config.ai.imageModel,
      prompt,
      config: {
        numberOfImages: 1,
      },
    };

    // Handle reference image if provided
    if (referenceImageBase64) {
      console.log("🖼️  Processing reference image...");
      
      // Remove data URI prefix if present (data:image/jpeg;base64,)
      let cleanBase64 = referenceImageBase64;
      let mimeType = "image/jpeg";
      
      if (referenceImageBase64.includes(',')) {
        const parts = referenceImageBase64.split(',');
        cleanBase64 = parts[1];
        
        // Extract mime type from data URI
        const dataUriPrefix = parts[0];
        if (dataUriPrefix.includes('image/png')) {
          mimeType = "image/png";
        } else if (dataUriPrefix.includes('image/webp')) {
          mimeType = "image/webp";
        } else if (dataUriPrefix.includes('image/jpeg') || dataUriPrefix.includes('image/jpg')) {
          mimeType = "image/jpeg";
        }
        
        console.log("✅ Extracted data URI prefix");
      } else {
        console.log("ℹ️  No data URI prefix found, assuming raw base64");
      }
      
      const imageSizeMB = (cleanBase64.length / (1024 * 1024)).toFixed(2);
      
      console.log("📊 Reference Image Details:");
      console.log("  - MIME Type:", mimeType);
      console.log("  - Base64 Length:", cleanBase64.length, "characters");
      console.log("  - Estimated Size:", imageSizeMB, "MB");
      console.log("  - Preview:", cleanBase64.substring(0, 50), "...");
      
      // Validate base64
      if (!cleanBase64 || cleanBase64.length < 100) {
        throw new AppError("Invalid reference image - too short", 400);
      }
      
      payload.referenceImages = [
        {
          mimeType: mimeType,
          image: {
            imageBytes: cleanBase64  // ✅ Use cleaned base64 without data URI prefix
          }
        }
      ];
      
      console.log("✅ Reference image added to payload");
    } else {
      console.log("ℹ️  No reference image - generating without visual reference");
    }

    console.log("\n🚀 Calling Google Imagen API...");
    console.log("📊 Payload Summary:");
    console.log("  - Model:", payload.model);
    console.log("  - Has Reference Image:", !!payload.referenceImages);
    console.log("  - Prompt Length:", payload.prompt.length);

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
    console.log("✅ Image generated successfully");
    console.log("📊 Generated Image Size:", generatedSizeMB, "MB");
    console.log("📊 Generated Image Length:", imgBytes.length, "bytes");
    console.log("🎨 ============================================\n");

    // Return the Base64 string with data URI prefix for display
    return `data:image/png;base64,${imgBytes}`;

  } catch (err: any) {
    console.error("\n❌ ============================================");
    console.error("❌ IMAGEN API ERROR");
    console.error("❌ ============================================");
    console.error("❌ Error Name:", err.name);
    console.error("❌ Error Message:", err.message);
    
    if (err.stack) {
      console.error("❌ Stack Trace:", err.stack);
    }
    
    if (err.response) {
      console.error("❌ Response Status:", err.response.status);
      console.error("❌ Response Data:", err.response.data);
    }
    
    console.error("❌ ============================================\n");
    
    throw new AppError(err.message || "Image generation failed", 500);
  }
};