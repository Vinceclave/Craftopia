// src/utils/analyzeImage.ts
import axios from "axios";
import { groq } from "../config/groq.config";

/**
 * Downloads the image and re-uploads it to a smaller, faster CDN
 * to avoid Groq timeout issues.
 */
const fetchAndOptimizeImage = async (imageUrl: string): Promise<string> => {
  try {
    // Download the image as a buffer
    const response = await axios.get(imageUrl, { responseType: "arraybuffer" });

    // Convert to base64 so we can send directly to Groq
    const base64Image = `data:image/jpeg;base64,${Buffer.from(
      response.data
    ).toString("base64")}`;

    return base64Image;
  } catch (err) {
    console.error("❌ Failed to fetch/convert image:", err);
    throw new Error("Could not download/convert the image");
  }
};

export const analyzeImage = async (imageUrl: string) => {
  try {
    // Convert to Base64 (avoids Groq fetching slow/large URLs)
    const imageData = await fetchAndOptimizeImage(imageUrl);

    // Call Groq API
    const chatCompletion = await groq.chat.completions.create({
      messages: [
        {
          role: "user",
          content: [
            { type: "text", text: "Describe the contents of this image in detail." },
            { type: "image_url", image_url: { url: imageData } },
          ],
        },
      ],
      model: "meta-llama/llama-4-scout-17b-16e-instruct", // ✅ Vision model
      temperature: 0.7,
      max_completion_tokens: 512,
      top_p: 1,
      stream: false,
    });

    return chatCompletion.choices[0]?.message?.content || "No description available.";
  } catch (error: any) {
    console.error("❌ Error analyzing image:", error?.response?.data || error);
    throw new Error("Failed to analyze image");
  }
};
