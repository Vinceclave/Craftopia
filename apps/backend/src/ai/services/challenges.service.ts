// challenges.service.ts
import { ai } from "../gemini/client";
import { AppError } from "../../utils/error";
import { challengePrompt } from "../prompt/challenges.prompt";
import { parseResponse } from "../utils/responseParser";
import { config } from "../../config";
import prisma from "../../config/prisma";
import { MaterialType, ChallengeCategory, ChallengeSource } from "../../generated/prisma";

export interface AIChallenge {
  title: string;
  description: string;
  points_reward: number;
  material_type: MaterialType;
  category: 'daily' | 'weekly' | 'monthly';
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

export const generateChallenge = async (frequency: 'daily' | 'weekly' | 'monthly' = 'daily'): Promise<AIChallenge[]> => {
  try {
    // Get random material types for variety
    const materialTypes = Object.keys(materialMap);
    const selectedMaterials = materialTypes
      .sort(() => 0.5 - Math.random())
      .slice(0, Math.min(materialTypes.length, frequency === 'daily' ? 3 : 5));

    const prompt = challengePrompt(selectedMaterials.join(", "), frequency);

    const response = await ai.models.generateContent({
      model: config.ai.model,
      contents: prompt,
    });

    const text = response.text;
    console.log('AI Response:', text);

    if (!text) {
      throw new Error('AI response is empty');
    }

    // Parse the JSON response
    const parsedChallenges = parseResponse(text);
    
    // Validate and transform the response
    const challenges: AIChallenge[] = parsedChallenges.map((challenge: any) => ({
      title: challenge.title,
      description: challenge.description,
      points_reward: challenge.pointsReward,
      material_type: materialMap[challenge.materialType] || MaterialType.mixed,
      category: frequency,
      is_active: challenge.isActive,
      source: 'ai' as const,
    }));

    console.log(`Generated ${challenges.length} ${frequency} challenges:`, challenges);
    
    // DON'T auto-save - let admin control this
    return challenges;

  } catch (error: any) {
    console.error('AI generation failed:', error);
    throw new AppError('Failed to generate challenges', 500);
  }
};

export const createChallenges = async (challenges: AIChallenge[]) => {
  try {
    const savedChallenges = await prisma.ecoChallenge.createMany({
      data: challenges.map(challenge => ({
        title: challenge.title.trim(),
        description: challenge.description.trim(),
        points_reward: challenge.points_reward,
        material_type: challenge.material_type,
        category: challenge.category.toUpperCase() as ChallengeCategory,
        source: ChallengeSource.ai,
        is_active: challenge.is_active,
        created_by_admin_id: null,
      })),
      skipDuplicates: true,
    });
    
    console.log(`Saved ${savedChallenges.count} challenges to database`);
    return savedChallenges;
  } catch (error) {
    console.error('Failed to save challenges to database:', error);
    throw new AppError('Failed to save challenges to database', 500);
  }
};

// Your existing createChallenge function (single challenge creation)
export const createChallenge = async (data: {
  title: string;
  description: string;
  points_reward: number;
  material_type: string;
  created_by_admin_id?: number | null;  // Made optional
  category: ChallengeCategory;
}) => {
  if (!data.title?.trim()) {
    throw new AppError('Challenge title is required', 400);
  }

  if (!data.description?.trim()) {
    throw new AppError('Challenge description is required', 400);
  }

  if (!data.points_reward || data.points_reward < 1) {
    throw new AppError('Points reward must be greater than 0', 400);
  }

  if (!Object.values(MaterialType).includes(data.material_type as MaterialType)) {
    throw new AppError(`Invalid material type. Allowed values: ${Object.values(MaterialType).join(', ')}`, 400);
  }

  if (!Object.values(ChallengeCategory).includes(data.category)) {
    throw new AppError(`Invalid category. Allowed values: ${Object.values(ChallengeCategory).join(', ')}`, 400);
  }

  return prisma.ecoChallenge.create({
    data: {
      title: data.title.trim(),
      description: data.description.trim(),
      points_reward: data.points_reward,
      material_type: data.material_type as MaterialType,
      category: data.category,
      source: data.created_by_admin_id ? ChallengeSource.admin : ChallengeSource.ai,
      created_by_admin_id: data.created_by_admin_id || null,
    },
    include: {
      created_by_admin: {
        select: { user_id: true, username: true }
      }
    }
  });
};
