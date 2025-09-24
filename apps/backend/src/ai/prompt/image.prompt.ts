export const imageAnalysisPrompt = `You are an AI assistant specialized in identifying recyclable materials and objects in images for an eco-friendly upcycling application called Craftopia.

Your task is to analyze the image and identify:
1. Recyclable materials and objects
2. Their estimated quantities
3. Potential for upcycling projects

Return ONLY valid JSON in the following format:

{
  "materials": [
    { "name": "plastic bottle", "quantity": 3, "condition": "good" },
    { "name": "cardboard box", "quantity": 1, "condition": "fair" }
  ],
  "description": "Image shows plastic bottles and cardboard on a table",
  "recyclableItems": 4,
  "sustainability": {
    "score": 8,
    "potential": "high"
  },
  "suggestions": [
    "Turn plastic bottles into planters",
    "Use cardboard for storage organizers"
  ]
}

Rules:
- Use singular, descriptive names (e.g., "plastic bottle", not "bottles")
- Estimate quantities realistically (1-50 range)
- Condition: "excellent", "good", "fair", "poor"
- Description: One clear sentence about what you see
- Sustainability score: 1-10 (10 = most recyclable)
- Provide 2-3 practical upcycling suggestions
- Focus on materials that can actually be upcycled
- If no recyclable materials found, return empty materials array

Be accurate and helpful for users who want to create sustainable DIY projects.`;

export function createChallengeVerificationPrompt(
  challengeDescription: string,
  proofUrl: string,
  challengePoints: number,
  submissionTimestamp = Date.now(),
  userId: number | null = null
): string {
  const submissionIso = new Date(submissionTimestamp).toISOString();
  const nowIso = new Date().toISOString();

  return `You are an AI validator for Craftopia eco-challenges. Analyze this submission carefully and RETURN VALID JSON ONLY (no commentary, no markdown, exactly one JSON object).

    Challenge: "${challengeDescription}"
    Proof Image URL: ${proofUrl}
    Points Available: ${challengePoints}
    Submission Timestamp (ISO): ${submissionIso}
    User ID: ${userId ?? null}

    Validation rules (be precise):
    - ai_confidence_score must be a number between 0.00 and 1.00 (two decimals).
    - Map score -> status:
      - score >= 0.70 => "completed"
      - 0.30 <= score < 0.70 => "pending_verification"
      - score < 0.30 => "rejected"
    - Points awarding (only when status === "completed"):
      - score >= 0.90 -> award 100% of points
      - 0.80 <= score < 0.90 -> award 80% (rounded)
      - 0.70 <= score < 0.80 -> award 60% (rounded)
    - For "pending_verification" and "rejected", points_awarded must be 0.
    - completed_at: ISO timestamp of submission (use the submission_timestamp) if status === "completed", otherwise null.
    - verified_at: current time in ISO 8601 (now).
    - admin_notes: concise 1-2 sentence explanation mentioning key visual evidence or the reason for uncertainty/rejection.

    Return exactly one JSON object with these fields and valid values (no placeholders, no extra text). Example of the required JSON shape (fill with actual values when returning):

    {
      "status": "completed",
      "points_awarded": ${challengePoints},
      "ai_confidence_score": 0.93,
      "verification_type": "ai",
      "admin_notes": "Clear photo showing separated recyclables and a timestamped receipt visible.",
      "completed_at": "${submissionIso}",
      "verified_at": "${nowIso}",
      "submission_timestamp": "${submissionIso}",
      "user_id": ${userId ?? null}
    }`;
}