// apps/backend/src/ai/services/challenges.service.ts
// UPDATED VERSION with waste_kg tracking

import { ai } from "../gemini/client";
import { AppError } from "../../utils/error";
import { challengePrompt } from "../prompt/challenges.prompt";
import { parseJsonFromMarkdown } from "../utils/responseParser";
import { config } from "../../config";
import prisma from "../../config/prisma";
import { MaterialType, ChallengeCategory, ChallengeSource } from "@prisma/client";

export interface AIChallenge {
  title: string;
  description: string;
  points_reward: number;
  waste_kg: number;  // NEW FIELD
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
      // Daily: focus on most common household items
      return commonRecyclables.sort(() => 0.5 - Math.random()).slice(0, 3);
    case 'weekly':
      // Weekly: include more variety
      return allRecyclables.sort(() => 0.5 - Math.random()).slice(0, 4);
    case 'monthly':
      // Monthly: all materials for complex projects
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

/**
 * Generate AI challenges with proper difficulty scaling and waste tracking
 */
export const generateChallenge = async (
  frequency: 'daily' | 'weekly' | 'monthly' = 'daily'
): Promise<AIChallenge[]> => {
  try {
    const selectedMaterials = getRecyclableMaterials(frequency);
    const materialTypesString = selectedMaterials.join(", ");

    console.log(`🤖 Generating ${frequency} challenges for: ${materialTypesString}`);

    const prompt = challengePrompt(materialTypesString, frequency);

    const response = await ai.models.generateContent({
      model: config.ai.model,
      contents: prompt,
    });

    const text = response.text;
    if (!text) throw new Error('AI response is empty');

    const parsedChallenges = parseJsonFromMarkdown(text);
    if (!Array.isArray(parsedChallenges)) {
      throw new Error('Expected an array of challenges');
    }

    const now = new Date();

    const challenges: AIChallenge[] = parsedChallenges
      .filter((challenge: any) => {
        // Validate required fields
        if (!challenge || typeof challenge !== 'object') {
          console.warn('⚠️ Invalid challenge object:', challenge);
          return false;
        }
        
        if (!recyclableMaterialMap[challenge.materialType?.toLowerCase()]) {
          console.warn('⚠️ Invalid material type:', challenge.materialType);
          return false;
        }
        
        // Validate waste_kg
        const wasteKg = parseFloat(challenge.wasteKg);
        if (isNaN(wasteKg) || wasteKg <= 0) {
          console.warn('⚠️ Invalid waste_kg:', challenge.wasteKg);
          return false;
        }
        
        return true;
      })
      .map((challenge: any) => {
        const expiresAt = new Date(now);
        expiresAt.setDate(now.getDate() + frequencyToDays[frequency]);

        // Parse and validate waste_kg
        const wasteKg = parseFloat(challenge.wasteKg) || 0;

        // Validate and scale points based on frequency
        let pointsReward = Number(challenge.pointsReward) || 20;
        
        if (frequency === 'daily') {
          // Daily: 15-25 points (simple tasks)
          pointsReward = Math.max(15, Math.min(25, pointsReward));
        } else if (frequency === 'weekly') {
          // Weekly: 25-40 points (moderate tasks)
          pointsReward = Math.max(25, Math.min(40, pointsReward));
        } else {
          // Monthly: 40-60 points (complex tasks)
          pointsReward = Math.max(40, Math.min(60, pointsReward));
        }

        return {
          title: challenge.title || 'Untitled Challenge',
          description: challenge.description || '',
          points_reward: pointsReward,
          waste_kg: wasteKg,
          material_type: recyclableMaterialMap[challenge.materialType.toLowerCase()] || MaterialType.mixed,
          category: frequency,
          is_active: challenge.isActive !== false,
          source: 'ai',
          start_at: now,
          expires_at: expiresAt,
        };
      });

    if (challenges.length === 0) {
      throw new Error('No valid recyclable material challenges generated');
    }

    console.log(`✅ Generated ${challenges.length} ${frequency} challenges:`);
    challenges.forEach(c => {
      console.log(`   📦 ${c.title}`);
      console.log(`      └─ ${c.material_type} | ${c.waste_kg}kg | ${c.points_reward}pts`);
    });
    
    return challenges;

  } catch (error: any) {
    console.error('❌ Challenge generation failed:', error.message);
    throw new AppError('Failed to generate recyclable material challenges', 500);
  }
};

/**
 * Save generated challenges to database
 */
export const createChallenges = async (challenges: AIChallenge[]) => {
  try {
    const savedChallenges = await prisma.ecoChallenge.createMany({
      data: challenges.map(challenge => ({
        title: challenge.title.trim(),
        description: challenge.description.trim(),
        points_reward: challenge.points_reward,
        waste_kg: challenge.waste_kg,  // NEW FIELD
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

    console.log(`✅ Saved ${savedChallenges.count} challenges to database`);
    return savedChallenges;
  } catch (error) {
    console.error('❌ Failed to save challenges:', error);
    throw new AppError('Failed to save challenges to database', 500);
  }
};

/**
 * Create a single challenge (admin or AI)
 */
export const createChallenge = async (data: {
  title: string;
  description: string;
  points_reward: number;
  waste_kg?: number;
  material_type: string;
  created_by_admin_id?: number | null;
  category: ChallengeCategory;
}) => {
  // Validation
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
    throw new AppError(
      `Invalid material type. Allowed: ${Object.values(MaterialType).join(', ')}`,
      400
    );
  }
  if (!Object.values(ChallengeCategory).includes(data.category)) {
    throw new AppError(
      `Invalid category. Allowed: ${Object.values(ChallengeCategory).join(', ')}`,
      400
    );
  }

  // Validate waste_kg if provided
  const wasteKg = data.waste_kg !== undefined ? parseFloat(String(data.waste_kg)) : 0;
  if (wasteKg < 0) {
    throw new AppError('Waste kg cannot be negative', 400);
  }

  const now = new Date();
  const expiresAt = new Date(now);
  expiresAt.setDate(now.getDate() + 7); // default 7 days

  return prisma.ecoChallenge.create({
    data: {
      title: data.title.trim(),
      description: data.description.trim(),
      points_reward: data.points_reward,
      waste_kg: wasteKg,
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