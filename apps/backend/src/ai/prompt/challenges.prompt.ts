// apps/backend/src/ai/prompt/challenges.prompt.ts - UPDATED VERSION

export const challengePrompt = (materialTypes: string, frequency: 'daily' | 'weekly' | 'monthly' = 'daily') => {
  const challengeCount = frequency === 'daily' ? 5 : frequency === 'weekly' ? 10 : 15;
  
  return `Generate an array of ${challengeCount} RECYCLING challenges focused strictly on recyclable materials: ${materialTypes}

IMPORTANT: Focus ONLY on actual recyclable materials and eco-friendly recycling activities.

Create challenges that produce CLEAR, PHOTOGRAPHABLE recycling results for AI validation:

Requirements for each challenge:
- Must involve transforming RECYCLABLE materials into useful items
- Focus on upcycling, repurposing, or proper recycling practices
- Result should be clearly identifiable in a photo
- Include specific quantities of recyclable materials
- Promote environmental sustainability and waste reduction
- Avoid non-recyclable or harmful materials

Return ONLY valid JSON array with this exact structure:

[
  {
    "title": "engaging recycling-focused 3-5 word title",
    "description": "specific recycling task using recyclable materials that creates clear visual result",
    "pointsReward": 20,
    "materialType": "plastic",
    "isActive": true,
    "source": "ai"
  }
]

Rules:
- Return ONLY the JSON array, no additional text
- ONLY use these recyclable materials: plastic, paper, glass, metal, electronics, organic, textile
- Point rewards: 15-30 points based on recycling impact and effort
- Make outcomes easily recognizable by AI in photos
- Include specific quantities for verification
- Focus on environmental benefits and sustainability

Examples of GOOD recyclable material challenges:

[
  {
    "title": "Plastic Bottle Planters",
    "description": "Transform 6 clean plastic bottles into herb planters with drainage holes and soil, arrange in garden display.",
    "pointsReward": 25,
    "materialType": "plastic",
    "isActive": true,
    "source": "ai"
  },
  {
    "title": "Glass Jar Storage Set",
    "description": "Clean and repurpose 8 glass jars as kitchen storage containers, label and organize on shelf.",
    "pointsReward": 20,
    "materialType": "glass",
    "isActive": true,
    "source": "ai"
  },
  {
    "title": "Newspaper Gift Wrapping",
    "description": "Use old newspapers to wrap 5 gifts creatively, include decorative paper ribbons made from magazines.",
    "pointsReward": 15,
    "materialType": "paper",
    "isActive": true,
    "source": "ai"
  },
  {
    "title": "Metal Can Organizers",
    "description": "Convert 4 clean metal cans into desk organizers, remove labels and arrange as pen/tool holders.",
    "pointsReward": 18,
    "materialType": "metal",
    "isActive": true,
    "source": "ai"
  },
  {
    "title": "Textile Cleaning Rags",
    "description": "Cut 10 old t-shirts into reusable cleaning rags, hem edges and stack neatly for household use.",
    "pointsReward": 16,
    "materialType": "textile",
    "isActive": true,
    "source": "ai"
  },
  {
    "title": "Cardboard Drawer Dividers",
    "description": "Create 6 drawer dividers from cardboard boxes, measure and cut to fit standard drawer sizes.",
    "pointsReward": 17,
    "materialType": "paper",
    "isActive": true,
    "source": "ai"
  },
  {
    "title": "Organic Compost Bin",
    "description": "Set up compost bin using organic kitchen scraps, show 2 weeks of decomposition progress.",
    "pointsReward": 28,
    "materialType": "organic",
    "isActive": true,
    "source": "ai"
  }
]

Generate challenges that encourage proper recycling habits and creative reuse of common recyclable household materials.`;
};