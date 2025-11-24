import { AppError } from "../../utils/error";
import { aiImage } from "../gemini/client"; // your GoogleGenAI client
import { config } from "../../config";

export const generateCraftImage = async (
  craftTitle: string,
  craftDescription: string,
  materials: string,
  referenceImageBase64?: string
) => {
  try {
    const prompt = `
Create a high-quality craft image.

Craft Title: ${craftTitle}
Craft Description: ${craftDescription}
Materials: ${materials}

If a reference image is provided, use it as style/shape inspiration.
`.trim();

    const payload: any = {
      model: config.ai.imageModel,
      prompt,
      config: {
        numberOfImages: 1,
      },
    };

    // If user provided a reference image, add it
    if (referenceImageBase64) {
      payload.referenceImages = [
        {
          mimeType: "image/png",
          image: {
            imageBytes: referenceImageBase64
          }
        }
      ];
    }

    // Call Imagen
    const response = await aiImage.models.generateImages(payload);

    const images = response.generatedImages ?? [];
    if (images.length === 0) {
      throw new AppError("No images generated", 500);
    }

    const imgBytes = images[0].image?.imageBytes;
    if (!imgBytes) {
      throw new AppError("Image generation failed", 500);
    }

    // Return the Base64 string
    return imgBytes;

  } catch (err: any) {
    console.error("Craft Image Generation Error:", err);
    throw new AppError(err.message || "Image generation failed", 500);
  }
};
