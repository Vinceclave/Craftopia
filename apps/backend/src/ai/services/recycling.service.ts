import { groq } from '../config/groq-cloud';
import { RecyclableItem } from '../types';

export async function detectRecyclableMaterials(imageUrl: string): Promise<RecyclableItem[]> {
  const response = await groq.chat.completions.create({
    model: "meta-llama/llama-4-scout-17b-16e-instruct",
    messages: [
      {
        role: "system",
        content: `You are an expert at identifying objects and materials in images for recycling purposes.

TASK: Analyze the image and identify ALL visible objects, then determine if each is recyclable.

COMMON RECYCLABLE ITEMS:
- Plastic bottles (water, soda, juice)
- Aluminum cans (soda, beer)
- Glass bottles and jars
- Paper (newspapers, magazines, office paper)
- Cardboard boxes
- Metal containers (tin cans, food cans)
- Electronics (phones, computers, batteries)

INSTRUCTIONS:
1. Look carefully at EVERY object in the image
2. Don't just focus on obvious recyclables - check all items
3. If unsure about recyclability, err on the side of inclusion
4. Count items accurately
5. Even identify non-recyclable items (mark recyclable: false)

RESPONSE FORMAT - MUST be valid JSON array:
[
  {"name": "plastic water bottle", "quantity": 2, "recyclable": true, "description": "clear PET bottles"},
  {"name": "aluminum can", "quantity": 1, "recyclable": true},
  {"name": "food wrapper", "quantity": 1, "recyclable": false, "description": "plastic wrapper"}
]

IMPORTANT: Always return at least some items if you see ANY objects in the image, even if they're not recyclable.`
      },
      {
        role: "user",
        content: [
          { 
            type: "text", 
            text: "Carefully examine this image and identify ALL visible objects. List both recyclable and non-recyclable items you can see." 
          },
          { type: "image_url", image_url: { url: imageUrl } }
        ]
      }
    ],
    temperature: 0.1, // Slightly increase for more diverse responses
    max_completion_tokens: 1000,
  });

  const content = response.choices[0]?.message?.content ?? "[]";
  
  // Log the raw response for debugging
  console.log("AI Response:", content);
  
  try {
    // Clean the response in case there's extra text
    const cleanContent = content.trim();
    let jsonStart = cleanContent.indexOf('[');
    let jsonEnd = cleanContent.lastIndexOf(']') + 1;
    
    if (jsonStart === -1 || jsonEnd === 0) {
      console.error("No JSON array found in response:", content);
      return [];
    }
    
    const jsonString = cleanContent.substring(jsonStart, jsonEnd);
    const parsed = JSON.parse(jsonString) as RecyclableItem[];
    
    // Validate the response
    if (!Array.isArray(parsed)) {
      console.error("Response is not an array:", parsed);
      return [];
    }
    
    // Filter out invalid items
    const validItems = parsed.filter(item => 
      item && 
      typeof item.name === 'string' && 
      typeof item.quantity === 'number' && 
      typeof item.recyclable === 'boolean'
    );
    
    console.log(`Detected ${validItems.length} valid items`);
    return validItems;
    
  } catch (error) {
    console.error("Failed to parse AI response:", error);
    console.error("Raw content:", content);
    
    // Return empty array but log the issue
    return [];
  }
}

// Alternative function with different model for comparison
export async function detectRecyclableMaterialsAlternative(imageUrl: string): Promise<RecyclableItem[]> {
  const response = await groq.chat.completions.create({
    model: "meta-llama/llama-3.2-90b-vision-preview", // Try a different model
    messages: [
      {
        role: "system",
        content: `Identify objects in images for recycling. Return JSON array only.
        
Format: [{"name": "object", "quantity": 1, "recyclable": true/false}]

Look for: bottles, cans, paper, cardboard, electronics, containers, packaging.
Include ALL visible objects, not just recyclables.`
      },
      {
        role: "user",
        content: [
          { type: "text", text: "What objects do you see in this image? List everything." },
          { type: "image_url", image_url: { url: imageUrl } }
        ]
      }
    ],
    temperature: 0,
    max_completion_tokens: 800,
  });

  const content = response.choices[0]?.message?.content ?? "[]";
  console.log("Alternative model response:", content);
  
  try {
    return JSON.parse(content) as RecyclableItem[];
  } catch (error) {
    console.error("Alternative model parse error:", error);
    return [];
  }
}