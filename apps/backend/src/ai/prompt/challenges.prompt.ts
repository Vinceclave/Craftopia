export const challengePrompt = (materialTypes: string, frequency: 'daily' | 'weekly' | 'monthly' = 'daily') => {
  const challengeCount = frequency === 'daily' ? 5 : frequency === 'weekly' ? 10 : 15;
  
  return `Generate an array of ${challengeCount} recycling challenges in strict JSON format using these materials: ${materialTypes}

Create challenges that produce CLEAR, PHOTOGRAPHABLE results for AI validation:

Requirements for each challenge:
- Must create a visible, tangible outcome
- Result should be clearly identifiable in a photo
- Include specific quantities/numbers when possible
- Avoid abstract or hard-to-photograph outcomes
- Focus on transformation of materials into new forms

Return ONLY valid JSON array with this exact structure:

[
  {
    "title": "engaging 3-5 word title",
    "description": "specific task that creates a clear visual result for photo validation",
    "pointsReward": 20,
    "materialType": "plastic",
    "isActive": true,
    "source": "ai"
  }
]

Rules:
- Return ONLY the JSON array, no additional text
- Use materials: plastic, paper, glass, metal, electronics, organic, textile, mixed
- Point rewards: 10-30 points based on effort and visual impact
- Make outcomes easily recognizable by AI in photos
- Include specific numbers/quantities for verification

Examples of GOOD photo-validatable challenges:
[
  {
    "title": "Bottle Planter Garden",
    "description": "Transform 5 plastic bottles into planters with soil and plants visible.",
    "pointsReward": 25,
    "materialType": "plastic",
    "isActive": true,
    "source": "ai"
  },
  {
    "title": "Glass Jar Organization",
    "description": "Arrange 8 clean glass jars filled with organized items as storage.",
    "pointsReward": 20,
    "materialType": "glass", 
    "isActive": true,
    "source": "ai"
  },
  {
    "title": "Paper Origami Display",
    "description": "Create 12 origami figures from old magazines arranged in a display.",
    "pointsReward": 15,
    "materialType": "paper",
    "isActive": true,
    "source": "ai"
  }
]`;
};