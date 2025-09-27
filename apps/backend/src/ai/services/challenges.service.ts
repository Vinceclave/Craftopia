import { ai } from "../gemini/client";
import { AppError } from "../../utils/error";
import { challengePrompt } from "../prompt/challenges.prompt";
import { parseJsonFromMarkdown } from "../utils/responseParser";
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
  start_at: Date;
  expires_at: Date;
}

// Mapping only common recyclable materials
const recyclableMaterialMap: Record<string, MaterialType> = {
  plastic: MaterialType.plastic,
  paper: MaterialType.paper,
  glass: MaterialType.glass,
  metal: MaterialType.metal,
  electronics: MaterialType.electronics,
  organic: MaterialType.organic,
  textile: MaterialType.textile,
};

// Pick materials based on frequency
const getRecyclableMaterials = (frequency: 'daily' | 'weekly' | 'monthly'): string[] => {
  const commonRecyclables = ['plastic', 'paper', 'glass', 'metal'];
  const allRecyclables = [...commonRecyclables, 'textile', 'organic'];

  switch (frequency) {
    case 'daily':
      return commonRecyclables.sort(() => 0.5 - Math.random()).slice(0, 3);
    case 'weekly':
      return allRecyclables.sort(() => 0.5 - Math.random()).slice(0, 4);
    case 'monthly':
      return allRecyclables.sort(() => 0.5 - Math.random()).slice(0, 5);
    default:
      return commonRecyclables;
  }
};

// Map frequency to default expiration days
const frequencyToDays: Record<'daily' | 'weekly' | 'monthly', number> = {
  daily: 1,
  weekly: 7,
  monthly: 30,
};

export const generateChallenge = async (frequency: 'daily' | 'weekly' | 'monthly' = 'daily'): Promise<AIChallenge[]> => {
  try {
    const selectedMaterials = getRecyclableMaterials(frequency);
    const materialTypesString = selectedMaterials.join(", ");

    console.log(`Generating ${frequency} challenges for recyclable materials: ${materialTypesString}`);

    const prompt = challengePrompt(materialTypesString, frequency);

    const response = await ai.models.generateContent({
      model: config.ai.model,
      contents: prompt,
    });

    const text = response.text;
    if (!text) throw new Error('AI response is empty');

    const parsedChallenges = parseJsonFromMarkdown(text);
    if (!Array.isArray(parsedChallenges)) throw new Error('Expected an array of challenges');

    const now = new Date();

    const challenges: AIChallenge[] = parsedChallenges
      .filter((challenge: any) => challenge && typeof challenge === 'object' && recyclableMaterialMap[challenge.materialType?.toLowerCase()])
      .map((challenge: any) => {
        const expiresAt = new Date(now);
        expiresAt.setDate(now.getDate() + frequencyToDays[frequency]);

        return {
          title: challenge.title || 'Untitled Challenge',
          description: challenge.description || '',
          points_reward: Math.max(15, Math.min(30, Number(challenge.pointsReward) || 20)),
          material_type: recyclableMaterialMap[challenge.materialType.toLowerCase()] || MaterialType.mixed,
          category: frequency,
          is_active: challenge.isActive !== false,
          source: 'ai',
          start_at: now,
          expires_at: expiresAt,
        };
      });

    if (challenges.length === 0) throw new Error('No valid recyclable material challenges generated');

    console.log(`Generated ${challenges.length} recyclable ${frequency} challenges:`, challenges.map(c => `${c.title} (${c.material_type})`));
    return challenges;

  } catch (error: any) {
    console.error('Recyclable challenge generation failed:', error);
    throw new AppError('Failed to generate recyclable material challenges', 500);
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
        category: challenge.category as ChallengeCategory,
        source: ChallengeSource.ai,
        is_active: challenge.is_active,
        created_by_admin_id: null,
        start_at: challenge.start_at,
        expires_at: challenge.expires_at
      })),
      skipDuplicates: true,
    });

    console.log(`Saved ${savedChallenges.count} recyclable challenges to database`);
    return savedChallenges;
  } catch (error) {
    console.error('Failed to save recyclable challenges to database:', error);
    throw new AppError('Failed to save recyclable challenges to database', 500);
  }
};

export const createChallenge = async (data: {
  title: string;
  description: string;
  points_reward: number;
  material_type: string;
  created_by_admin_id?: number | null;
  category: ChallengeCategory;
}) => {
  if (!data.title?.trim()) throw new AppError('Challenge title is required', 400);
  if (!data.description?.trim()) throw new AppError('Challenge description is required', 400);
  if (!data.points_reward || data.points_reward < 1) throw new AppError('Points reward must be greater than 0', 400);
  if (!Object.values(MaterialType).includes(data.material_type as MaterialType)) throw new AppError(`Invalid material type. Allowed recyclable materials: ${Object.values(MaterialType).join(', ')}`, 400);
  if (!Object.values(ChallengeCategory).includes(data.category)) throw new AppError(`Invalid category. Allowed values: ${Object.values(ChallengeCategory).join(', ')}`, 400);

  const now = new Date();
  const expiresAt = new Date(now);
  expiresAt.setDate(now.getDate() + 7); // default 7 days if not provided

  return prisma.ecoChallenge.create({
    data: {
      title: data.title.trim(),
      description: data.description.trim(),
      points_reward: data.points_reward,
      material_type: data.material_type as MaterialType,
      category: data.category,
      source: data.created_by_admin_id ? ChallengeSource.admin : ChallengeSource.ai,
      created_by_admin_id: data.created_by_admin_id || null,
      start_at: now,
      expires_at: expiresAt,
    },
    include: {
      created_by_admin: {
        select: { user_id: true, username: true },
      },
    },
  });
};
