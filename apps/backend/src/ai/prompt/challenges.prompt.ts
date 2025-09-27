export const challengePrompt = (
  materialTypes: string,
  frequency: 'daily' | 'weekly' | 'monthly' = 'daily'
) => {
  const challengeCount = frequency === 'daily' ? 5 : frequency === 'weekly' ? 10 : 15;
  const expiresInDays = frequency === 'daily' ? 1 : frequency === 'weekly' ? 7 : 30;

  const now = new Date();
  const startAt = now.toISOString();
  const expiresAt = new Date(now);
  expiresAt.setDate(now.getDate() + expiresInDays);
  const expiresAtISO = expiresAt.toISOString();

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
    "source": "ai",
    "startAt": "${startAt}",
    "expiresAt": "${expiresAtISO}"
  }
]

Rules:
- Return ONLY the JSON array, no additional text
- ONLY use these recyclable materials: plastic, paper, glass, metal, electronics, organic, textile
- Point rewards: 15-30 points based on recycling impact and effort
- Make outcomes easily recognizable by AI in photos
- Include specific quantities for verification
- Focus on environmental benefits and sustainability
- "startAt" should always be today's date
- "expiresAt" should be startAt + ${expiresInDays} days (1 day for daily, 7 for weekly, 30 for monthly)

Examples of GOOD recyclable material challenges:

[
  {
    "title": "Plastic Bottle Planters",
    "description": "Transform 6 clean plastic bottles into herb planters with drainage holes and soil, arrange in garden display.",
    "pointsReward": 25,
    "materialType": "plastic",
    "isActive": true,
    "source": "ai",
    "startAt": "${startAt}",
    "expiresAt": "${new Date(new Date().setDate(new Date().getDate() + 1)).toISOString()}"
  },
  {
    "title": "Textile Grocery Bags",
    "description": "Create reusable grocery bags from old textile scraps. It's 2025 right now, with at least two grocery items (e.g., apples, small box) placed inside.",
    "pointsReward": 25,
    "materialType": "textile",
    "isActive": true,
    "source": "ai",
    "startAt": "${startAt}",
    "expiresAt": "${expiresAtISO}"
  }
]

Generate challenges that encourage proper recycling habits and creative reuse of common recyclable household materials.`;
};
