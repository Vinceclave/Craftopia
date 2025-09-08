import { ai } from "../../config/gemini";
import { Request, Response } from "express";

export const imageRecognition = async (req: Request, res: Response) => {
  try {
    const { url } = req.body; // ✅ Extract the URL from body

    if (!url) {
      return res.status(400).json({ error: "Image URL is required" });
    }

    // Fetch the image as a buffer
    const response = await fetch(url);
    if (!response.ok) {
      return res.status(400).json({ error: "Failed to fetch image from URL" });
    }

    const imageArrayBuffer = await response.arrayBuffer();
    const base64ImageData = Buffer.from(imageArrayBuffer).toString("base64");

    // Send to Gemini
    const result = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: [
        {
          role: "user",
          parts: [
            {
              inlineData: {
                mimeType: "image/jpeg",
                data: base64ImageData,
              },
            },
            {
              text: `
You are an AI that identifies objects in an image.
Return ONLY valid JSON in the following format:

{
  "materials": [
    { "name": "item name", "quantity": number },
    ...
  ],
  "description": "short sentence describing the image"
}

Rules:
- Use singular names (e.g., "apple", not "apples").
- Estimate quantities if possible (e.g., 3 bottles, 1 table).
- Keep description short (max 1 sentence).
              `,
            },
          ],
        },
      ],
    });

    const text = result.text;
    console.log(text)
  } catch (error: any) {
    console.error("Error in imageRecognition:", error);
    res.status(500).json({ error: "Image analysis failed" });
  }
};
