export const challengePrompt = `Generate an array of recycling challenges in strict JSON format:

[
  {
    "title": "engaging 3-5 word title",
    "description": "specific 1-2 sentence task",
    "pointsReward": 1-100,
    "materialType": "plastic|paper|glass|metal|electronics|organic|textile|mixed",
    "isActive": true,
    "source": "ai"
  }
]

Rules:
- Return **an array** of 3 challenges.
- Use only the provided materials when possible.
- Ensure JSON is valid and parseable.

Examples:
[
  {
    "title": "Plastic Bottle Planters",
    "description": "Transform 5 plastic bottles into small planters for herbs",
    "pointsReward": 20,
    "materialType": "plastic",
    "isActive": true,
    "source": "ai"
  },
  {
    "title": "Glass Jar Storage",
    "description": "Repurpose 3 glass jars as storage containers",
    "pointsReward": 15,
    "materialType": "glass",
    "isActive": true,
    "source": "ai"
  }
]
`;
