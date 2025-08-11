import { imagePrompts } from "../ai/prompts";
import { groq } from "../config/groq.config";


export const analyzeImageBuffer = async (imageBuffer: Buffer) => {
  try {
    // Convert buffer to base64
    const base64Image = `data:image/jpeg;base64,${imageBuffer.toString("base64")}`;

    // Call Groq API with base64 image
    const chatCompletion = await groq.chat.completions.create({
      messages: [
        {
          role: "user",
          content: [
            { type: "text", text: imagePrompts.classifyMaterial },
            { type: "image_url", image_url: { url: base64Image } }, // Groq expects image_url object with url being base64 string too
          ],
        },
      ],
      model: "meta-llama/llama-4-scout-17b-16e-instruct",
      temperature: 0.7,
      max_completion_tokens: 128,
      top_p: 1,
      stream: false,
    });

    return chatCompletion.choices[0]?.message?.content || "No description available.";
  } catch (error: any) {
    console.error("❌ Error analyzing image:", error?.response?.data || error);
    throw new Error("Failed to analyze image");
  }
};
