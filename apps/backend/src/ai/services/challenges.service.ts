import { ai } from "../gemini/client";
import { AppError } from "../../utils/error";
import { challengePrompt } from "../prompt/challenges.prompt";
import { parseResponse } from "../utils/responseParser";
import { config } from "../../config";
import { MaterialType, ChallengeCategory } from "../../generated/prisma";
import prisma from "../../config/prisma";

export interface AIChallenge {
  title: string;
  description: string;
  points_reward: number;
  material_type: MaterialType;
  is_active: boolean;
  source: 'ai';
}

// Material mapping
const materialMap: Record<string, MaterialType> = {
  plastic: "plastic",
  paper: "paper",
  glass: "glass",
  metal: "metal",
  electronics: "electronics",
  organic: "organic",
  textile: "textile",
  mixed: "mixed",
};

/**
 * Generate AI challenges
 */
export const generateChallenge = async (
  materials: string[],
  category: ChallengeCategory
): Promise<AIChallenge[]> => {
  try {
    const prompt = `${challengePrompt}\nMaterials: ${materials.join(', ')}\nCategory: ${category}`;
    const response = await ai.models.generateContent({
      model: config.ai.model,
      contents: prompt,
    });

    const text = response.text;
    if (!text?.trim()) throw new AppError("AI did not return a response", 500);

    const parsed = parseResponse(text);
    if (!parsed || !Array.isArray(parsed)) throw new AppError("AI did not return valid challenges array", 500);

    return parsed.map((ch: any, idx: number) => {
      const requiredFields = ['title', 'description', 'pointsReward', 'materialType'];
      const missing = requiredFields.filter(f => ch[f] === undefined);
      if (missing.length > 0) throw new AppError(`Challenge #${idx + 1} missing fields: ${missing.join(', ')}`, 500);

      const key = ch.materialType.toLowerCase();
      if (!materialMap[key]) throw new AppError(`Challenge #${idx + 1} has invalid material type: ${ch.materialType}`, 500);

      return {
        title: ch.title,
        description: ch.description,
        points_reward: Math.max(1, Math.min(100, ch.pointsReward)),
        material_type: materialMap[key],
        is_active: ch.isActive ?? true,
        source: 'ai',
      };
    });

  } catch (err) {
    console.error("AI generation failed, using fallback:", err);
    return generateChallengeFallback(materials);
  }
};

/**
 * Fallback AI simulation in case AI fails
 */
const generateChallengeFallback = (materials: string[]): AIChallenge[] => {
  const challenges: AIChallenge[] = [];

  for (let i = 0; i < 3; i++) {
    const mat = materials[Math.floor(Math.random() * materials.length)] as MaterialType;
    challenges.push({
      title: `Upcycle ${mat} creatively`,
      description: `Collect and transform some ${mat} into something useful or artistic`,
      points_reward: Math.floor(Math.random() * 50) + 20,
      material_type: mat,
      is_active: true,
      source: 'ai',
    });
  }

  return challenges;
};

/**
 * Save AI challenges to DB
 */
export const createChallenges = async (
  materials: string[],
  category: ChallengeCategory,
  adminId?: number
) => {
  const aiChallenges = await generateChallenge(materials, category);

  const saved: AIChallenge[] = [];
  for (const ch of aiChallenges) {
    const dbCh = await prisma.ecoChallenge.create({
      data: {
        title: ch.title,
        description: ch.description,
        points_reward: ch.points_reward,
        material_type: ch.material_type,
        category,
        created_by_admin_id: adminId || null,
      }
    });
    saved.push({
      ...ch,
      points_reward: dbCh.points_reward,
      material_type: dbCh.material_type,
    });
  }

  return saved;
};
