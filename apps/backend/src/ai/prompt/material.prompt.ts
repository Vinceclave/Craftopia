// apps/backend/src/ai/prompt/material.prompt.ts

export const createMaterialDetectionPrompt = (): string => {
  return `You are an AI specialized in identifying recyclable materials from images for upcycling projects.

TASK: Analyze the provided image and identify ALL recyclable materials visible.

RECYCLABLE MATERIAL CATEGORIES:
- plastic (bottles, containers, bags, packaging, straws, caps)
- paper (newspapers, magazines, cardboard, boxes, paper bags)
- glass (bottles, jars, containers)
- metal (cans, aluminum foil, wire, small metal objects)
- electronics (old phones, cables, batteries, circuit boards)
- organic (leaves, branches, food scraps for composting)
- textile (old clothes, fabric scraps, rags, yarn)
- mixed (items containing multiple materials)

DETECTION REQUIREMENTS:
1. Identify each distinct recyclable item in the image
2. Categorize each item by material type
3. Estimate quantity of each item
4. Assess condition (good, fair, poor)
5. Note any special characteristics (color, size, shape)

RESPONSE FORMAT - Return ONLY valid JSON:

{
  "detectedMaterials": [
    {
      "name": "specific item name (e.g., 'plastic water bottle', 'cardboard box')",
      "materialType": "plastic|paper|glass|metal|electronics|organic|textile|mixed",
      "quantity": number,
      "condition": "good|fair|poor",
      "characteristics": {
        "color": "primary color",
        "size": "small|medium|large",
        "shape": "description of shape"
      }
    }
  ],
  "imageDescription": "brief 1-2 sentence description of the image",
  "totalItemsDetected": number,
  "confidenceScore": 0.0-1.0,
  "upcyclingPotential": "high|medium|low",
  "suggestedCategories": ["category1", "category2"],
  "notes": "any special observations about the materials"
}

RULES:
- Be specific with item names (e.g., "2L plastic soda bottle" not just "bottle")
- Only detect items that are clearly visible and recyclable
- Confidence score should reflect certainty of detection
- Upcycling potential based on material quality and versatility
- Minimum 0.6 confidence to include an item
- If no recyclable materials detected, return empty detectedMaterials array
- Do not include non-recyclable items (regular trash, food, etc.)

EXAMPLES:

Good Detection:
{
  "detectedMaterials": [
    {
      "name": "plastic water bottle",
      "materialType": "plastic",
      "quantity": 3,
      "condition": "good",
      "characteristics": {
        "color": "clear",
        "size": "medium",
        "shape": "cylindrical"
      }
    },
    {
      "name": "cardboard box",
      "materialType": "paper",
      "quantity": 1,
      "condition": "good",
      "characteristics": {
        "color": "brown",
        "size": "large",
        "shape": "rectangular"
      }
    }
  ],
  "imageDescription": "Collection of clean plastic bottles and a cardboard box on a table",
  "totalItemsDetected": 4,
  "confidenceScore": 0.92,
  "upcyclingPotential": "high",
  "suggestedCategories": ["plastic", "paper"],
  "notes": "Materials are clean and in excellent condition for crafting"
}

Now analyze the provided image and return your detection results.`;
};

export const createDIYProjectPrompt = (
  detectedMaterials: string,
  userPreferences?: {
    difficulty?: 'easy' | 'medium' | 'hard';
    timeAvailable?: string;
    projectType?: string;
  }
): string => {
  const difficulty = userPreferences?.difficulty || 'any difficulty level';
  const timeAvailable = userPreferences?.timeAvailable || 'any time frame';
  const projectType = userPreferences?.projectType || 'any type of project';

  return `You are Craftopia AI, an expert in creating innovative DIY upcycling projects.

DETECTED MATERIALS:
${detectedMaterials}

USER PREFERENCES:
- Difficulty: ${difficulty}
- Time Available: ${timeAvailable}
- Project Type: ${projectType}

TASK: Generate 3-5 creative DIY project ideas using the detected materials.

PROJECT REQUIREMENTS:
1. Use primarily the detected materials
2. Match user's difficulty preference
3. Provide clear, step-by-step instructions
4. Include estimated time and difficulty
5. Suggest additional common materials if needed
6. Focus on practical, useful, or decorative outcomes
7. Promote sustainability and creativity

RESPONSE FORMAT - Return ONLY valid JSON array:

[
  {
    "title": "Creative 3-6 word project name",
    "description": "Brief 1-2 sentence description of the project and its benefits",
    "difficulty": "easy|medium|hard",
    "estimatedTime": "duration (e.g., '30 minutes', '1-2 hours')",
    "materials": [
      {
        "name": "material name",
        "quantity": "amount needed",
        "fromDetected": true
      }
    ],
    "additionalMaterials": [
      {
        "name": "common material name",
        "quantity": "amount needed",
        "optional": true|false
      }
    ],
    "steps": [
      "Clear, actionable step 1",
      "Clear, actionable step 2",
      "..."
    ],
    "tips": [
      "Helpful tip 1",
      "Helpful tip 2"
    ],
    "outcome": "What the finished project looks like and its uses",
    "sustainabilityImpact": "How this project helps the environment",
    "tags": ["tag1", "tag2", "tag3"]
  }
]

RULES:
- Generate 3-5 projects of varying difficulty
- Steps should be 6-10 actions each
- Use clear, simple language
- Include safety tips if needed
- Make projects achievable with detected materials
- Add creativity and inspiration
- Focus on upcycling, not just recycling

EXAMPLE OUTPUT:

[
  {
    "title": "Hanging Garden Planters",
    "description": "Transform plastic bottles into beautiful vertical garden planters. Perfect for herbs, flowers, or succulents.",
    "difficulty": "easy",
    "estimatedTime": "45 minutes",
    "materials": [
      {
        "name": "plastic bottles",
        "quantity": "3-4",
        "fromDetected": true
      }
    ],
    "additionalMaterials": [
      {
        "name": "rope or twine",
        "quantity": "2 meters",
        "optional": false
      },
      {
        "name": "potting soil",
        "quantity": "as needed",
        "optional": false
      },
      {
        "name": "paint",
        "quantity": "optional",
        "optional": true
      }
    ],
    "steps": [
      "Clean and dry the plastic bottles thoroughly",
      "Cut bottles in half horizontally or create side openings",
      "Poke drainage holes in the bottom using a hot nail or drill",
      "Optional: Paint bottles with acrylic paint for decoration",
      "Thread rope through bottles to create hanging system",
      "Fill with potting soil",
      "Plant your herbs or flowers",
      "Hang in a sunny spot and water regularly"
    ],
    "tips": [
      "Use clear bottles for better light penetration to roots",
      "Label each planter with plant names using permanent marker",
      "Start with hardy herbs like mint, basil, or rosemary"
    ],
    "outcome": "A vertical garden that saves space and adds greenery to any area while reusing plastic waste.",
    "sustainabilityImpact": "Diverts plastic from landfills while creating a functional garden that can produce fresh herbs, reducing grocery packaging waste.",
    "tags": ["garden", "planters", "herbs", "home-decor", "beginner-friendly"]
  }
]

Generate creative, practical DIY projects now based on the detected materials.`;
};