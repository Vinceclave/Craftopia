// apps/backend/src/ai/services/challenges.service.ts - UPDATED RECYCLABLE FOCUS

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

// UPDATED: Only recyclable materials mapping
const recyclableMaterialMap: Record<string, MaterialType> = {
  plastic: "plastic",     // Bottles, containers, bags
  paper: "paper",         // Newspapers, cardboard, magazines
  glass: "glass",         // Jars, bottles
  metal: "metal",         // Cans, foil, containers
  electronics: "electronics", // E-waste for proper recycling
  organic: "organic",     // Compostable materials
  textile: "textile",     // Clothing, fabric for repurposing
};

// UPDATED: Focus on common recyclable materials
const getRecyclableMaterials = (frequency: 'daily' | 'weekly' | 'monthly'): string[] => {
  const commonRecyclables = ['plastic', 'paper', 'glass', 'metal'];
  const allRecyclables = [...commonRecyclables, 'textile', 'organic'];
  
  switch (frequency) {
    case 'daily':
      // Focus on most common household recyclables
      return commonRecyclables.sort(() => 0.5 - Math.random()).slice(0, 3);
    case 'weekly':
      // Include more variety for weekly challenges
      return allRecyclables.sort(() => 0.5 - Math.random()).slice(0, 4);
    case 'monthly':
      // Use all recyclable materials for monthly challenges
      return allRecyclables.sort(() => 0.5 - Math.random()).slice(0, 5);
    default:
      return commonRecyclables;
  }
};

export const generateChallenge = async (frequency: 'daily' | 'weekly' | 'monthly' = 'daily'): Promise<AIChallenge[]> => {
  try {
    // Get appropriate recyclable materials for the frequency
    const selectedMaterials = getRecyclableMaterials(frequency);
    const materialTypesString = selectedMaterials.join(", ");

    console.log(`Generating ${frequency} challenges for recyclable materials: ${materialTypesString}`);

    const prompt = challengePrompt(materialTypesString, frequency);

    const response = await ai.models.generateContent({
      model: config.ai.model,
      contents: prompt,
    });

    const text = response.text;
    console.log('AI Response for recyclable challenges:', text);

    if (!text) {
      throw new Error('AI response is empty');
    }

    // Parse the JSON response
    const parsedChallenges = parseResponse(text);
    
    // Validate and transform the response - ensure only recyclable materials
    const challenges: AIChallenge[] = parsedChallenges
      .filter((challenge: any) => {
        // Filter out any challenges with non-recyclable materials
        const materialType = challenge.materialType?.toLowerCase();
        return materialType && recyclableMaterialMap[materialType];
      })
      .map((challenge: any) => ({
        title: challenge.title,
        description: challenge.description,
        points_reward: Math.max(15, Math.min(30, challenge.pointsReward || 20)), // Ensure 15-30 points
        material_type: recyclableMaterialMap[challenge.materialType] || MaterialType.mixed,
        category: frequency,
        is_active: challenge.isActive,
        source: 'ai' as const,
      }));

    console.log(`Generated ${challenges.length} recyclable ${frequency} challenges:`, 
      challenges.map(c => `${c.title} (${c.material_type})`));
    
    // Validate we have challenges and they're focused on recyclables
    if (challenges.length === 0) {
      throw new Error('No valid recyclable material challenges generated');
    }

    return challenges;

  } catch (error: any) {
    console.error('Recyclable challenge generation failed:', error);
    throw new AppError('Failed to generate recyclable material challenges', 500);
  }
};

// Keep existing createChallenges and createChallenge functions unchanged
export const createChallenges = async (challenges: AIChallenge[]) => {
  try {
    const savedChallenges = await prisma.ecoChallenge.createMany({
      data: challenges.map(challenge => ({
        title: challenge.title.trim(),
        description: challenge.description.trim(),
        points_reward: challenge.points_reward,
        material_type: challenge.material_type,
        category: challenge.category as ChallengeCategory, // Remove .toUpperCase()
        source: ChallengeSource.ai,
        is_active: challenge.is_active,
        created_by_admin_id: null,
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
    throw new AppError(`Invalid material type. Allowed recyclable materials: ${Object.values(MaterialType).join(', ')}`, 400);
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