// apps/backend/src/ai/prompt/challenges.prompt.ts
// UPDATED VERSION with waste_kg tracking and proper difficulty scaling

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

  // Difficulty guidelines based on frequency
  const difficultyGuidelines = frequency === 'daily' 
    ? `
⭐ DAILY CHALLENGE GUIDELINES (SIMPLE & QUICK):
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Time Required: 5-15 minutes MAX
Items Needed: 1-3 common items
Tools: Basic only (scissors, tape, markers, cloth)
Complexity: Super simple - anyone can do after work/school
Focus: Quick sorting, cleaning, organizing, or basic prep

EXAMPLES OF GOOD DAILY CHALLENGES:
✓ "Sort 5 plastic bottles by type"
✓ "Clean and organize 3 glass jars"
✓ "Fold and stack 5 paper bags"
✓ "Rinse 10 aluminum cans for recycling"
✓ "Bundle old newspapers with string"

❌ BAD (Too Complex for Daily):
✗ "Build a vertical garden" (takes 30+ min)
✗ "Sew reusable bags" (requires sewing)
✗ "Create furniture" (way too long)
`
    : frequency === 'weekly'
    ? `
⭐⭐ WEEKLY CHALLENGE GUIDELINES (MODERATE):
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Time Required: 30 minutes - 2 hours
Items Needed: 4-8 items
Tools: Basic to intermediate (glue gun, drill, paint, needle)
Complexity: Multi-step projects, some planning needed
Focus: Functional items, outdoor projects, crafting

EXAMPLES OF GOOD WEEKLY CHALLENGES:
✓ "Build vertical garden with 6 bottles"
✓ "Create storage boxes from 4 cardboard boxes"
✓ "Make bird feeders from 3 plastic containers"
✓ "Sew 2 reusable shopping bags"
✓ "Paint and decorate 5 glass bottles as vases"

❌ BAD (Too Simple for Weekly):
✗ "Clean 3 bottles" (this is daily)
✗ "Sort paper" (too quick)
`
    : `
⭐⭐⭐ MONTHLY CHALLENGE GUIDELINES (COMPLEX & IMPACTFUL):
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Time Required: 3-5+ hours or multiple sessions
Items Needed: 10+ items
Tools: Advanced acceptable (power tools, sewing machine)
Complexity: Major projects requiring dedication
Focus: Large-scale impact, furniture, community initiatives

EXAMPLES OF GOOD MONTHLY CHALLENGES:
✓ "Build bookshelf from 15+ cardboard boxes"
✓ "Organize community e-waste collection (20+ items)"
✓ "Create quilt from 20+ textile pieces"
✓ "Build greenhouse frame with 30+ bottles"
✓ "Start composting system for neighborhood"

❌ BAD (Too Simple for Monthly):
✗ "Sort 10 bottles" (this is daily/weekly)
✗ "Clean some jars" (way too easy)
`;

  return `You are a recycling challenge generator for Craftopia app. Generate ${challengeCount} ${frequency.toUpperCase()} challenges.

${difficultyGuidelines}

🌍 WASTE CALCULATION GUIDE (CRITICAL):
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Calculate "wasteKg" based on items used:

PLASTIC:
- Small bottle (500ml): 0.03 kg
- Large bottle (2L): 0.05 kg
- Container (large): 0.08 kg
- Plastic bag: 0.005 kg

PAPER:
- 10 sheets: 0.05 kg
- Small box: 0.1 kg
- Medium box: 0.2 kg
- Large box: 0.5 kg
- Newspaper: 0.2 kg

GLASS:
- Small jar: 0.2 kg
- Large jar: 0.3 kg
- Wine bottle: 0.5 kg

METAL:
- Aluminum can: 0.015 kg
- Soup can: 0.05 kg

TEXTILE:
- T-shirt: 0.15 kg
- Jeans: 0.5 kg

ELECTRONICS:
- Phone: 0.15 kg
- Laptop: 2.5 kg

ORGANIC:
- 1kg of food scraps: 1.0 kg

📋 REQUIRED JSON FORMAT:
Return ONLY a valid JSON array (no markdown, no explanations):

[
  {
    "title": "3-5 word catchy title",
    "description": "Clear task description with specific quantities and photo requirements",
    "pointsReward": ${frequency === 'daily' ? '15-25' : frequency === 'weekly' ? '25-40' : '40-60'},
    "wasteKg": 0.15,
    "materialType": "plastic|paper|glass|metal|electronics|organic|textile",
    "isActive": true,
    "source": "ai",
    "startAt": "${startAt}",
    "expiresAt": "${expiresAtISO}"
  }
]

🎯 CRITICAL RULES:
1. Materials: ONLY use: ${materialTypes}
2. Points: 
   - Daily: 15-25 points
   - Weekly: 25-40 points
   - Monthly: 40-60 points
3. WasteKg: Calculate accurately using guide above
4. Difficulty: Match frequency (simple daily, moderate weekly, complex monthly)
5. Photo: Describe clear proof photo requirement
6. Return: ONLY JSON array, no other text

🔥 EXAMPLES BY FREQUENCY:

${frequency === 'daily' ? `
DAILY EXAMPLES (SIMPLE 5-15 MIN):
[
  {
    "title": "Sort 5 Plastic Bottles",
    "description": "Collect 5 plastic bottles, remove labels, sort by type (PET/HDPE). Photo: Cleaned bottles lined up.",
    "pointsReward": 15,
    "wasteKg": 0.15,
    "materialType": "plastic",
    "isActive": true,
    "source": "ai",
    "startAt": "${startAt}",
    "expiresAt": "${expiresAtISO}"
  },
  {
    "title": "Clean 3 Glass Jars",
    "description": "Wash 3 glass jars thoroughly, remove stickers. Photo: Clean jars drying.",
    "pointsReward": 16,
    "wasteKg": 0.6,
    "materialType": "glass",
    "isActive": true,
    "source": "ai",
    "startAt": "${startAt}",
    "expiresAt": "${expiresAtISO}"
  },
  {
    "title": "Bundle Old Newspapers",
    "description": "Stack and tie 5 newspapers with string. Photo: Bundled newspapers ready for recycling.",
    "pointsReward": 18,
    "wasteKg": 1.0,
    "materialType": "paper",
    "isActive": true,
    "source": "ai",
    "startAt": "${startAt}",
    "expiresAt": "${expiresAtISO}"
  }
]
` : frequency === 'weekly' ? `
WEEKLY EXAMPLES (MODERATE 30MIN-2HR):
[
  {
    "title": "Bottle Vertical Garden",
    "description": "Create hanging planters from 6 plastic bottles with drainage and soil. Photo: Planted garden hanging.",
    "pointsReward": 30,
    "wasteKg": 0.3,
    "materialType": "plastic",
    "isActive": true,
    "source": "ai",
    "startAt": "${startAt}",
    "expiresAt": "${expiresAtISO}"
  },
  {
    "title": "Cardboard Storage Boxes",
    "description": "Transform 4 cardboard boxes into decorated storage containers. Photo: Boxes holding items.",
    "pointsReward": 28,
    "wasteKg": 0.8,
    "materialType": "paper",
    "isActive": true,
    "source": "ai",
    "startAt": "${startAt}",
    "expiresAt": "${expiresAtISO}"
  },
  {
    "title": "Reusable Shopping Bags",
    "description": "Sew 2 shopping bags from old t-shirts. Photo: Bags holding grocery items.",
    "pointsReward": 32,
    "wasteKg": 0.3,
    "materialType": "textile",
    "isActive": true,
    "source": "ai",
    "startAt": "${startAt}",
    "expiresAt": "${expiresAtISO}"
  }
]
` : `
MONTHLY EXAMPLES (COMPLEX 3-5+ HR):
[
  {
    "title": "Cardboard Furniture Build",
    "description": "Build functional shelf from 15+ cardboard boxes. Layer, reinforce, paint. Photo: Shelf holding books.",
    "pointsReward": 50,
    "wasteKg": 3.0,
    "materialType": "paper",
    "isActive": true,
    "source": "ai",
    "startAt": "${startAt}",
    "expiresAt": "${expiresAtISO}"
  },
  {
    "title": "Community E-Waste Drive",
    "description": "Organize collection of 20+ electronic items. Partner with recycling center. Photo: Items with receipt.",
    "pointsReward": 55,
    "wasteKg": 5.0,
    "materialType": "electronics",
    "isActive": true,
    "source": "ai",
    "startAt": "${startAt}",
    "expiresAt": "${expiresAtISO}"
  },
  {
    "title": "Textile Quilting Project",
    "description": "Create quilt from 20+ old textile pieces. Sew, add backing. Photo: Completed quilt in use.",
    "pointsReward": 48,
    "wasteKg": 3.0,
    "materialType": "textile",
    "isActive": true,
    "source": "ai",
    "startAt": "${startAt}",
    "expiresAt": "${expiresAtISO}"
  }
]
`}

Generate ${challengeCount} ${frequency} challenges now following ALL rules above.`;
};