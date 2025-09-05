import prisma from "../config/prisma";
import { MaterialType } from "../generated/prisma";
import { AppError } from '../utils/error';

export const createChallenge = async (data: {
  title: string;
  description: string;
  points_reward: number;
  material_type: string;
  created_by_admin_id: number | null;
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

  return prisma.ecoChallenge.create({
    data: {
      title: data.title.trim(),
      description: data.description.trim(),
      points_reward: data.points_reward,
      material_type: data.material_type as MaterialType,
      created_by_admin_id: data.created_by_admin_id
    }
  });
};

export const getAllChallenges = async (page = 1, limit = 10) => {
  if (page < 1) page = 1;
  if (limit < 1 || limit > 100) limit = 10;

  const skip = (page - 1) * limit;

  const [data, total] = await Promise.all([
    prisma.ecoChallenge.findMany({
      skip,
      take: limit,
      orderBy: { created_at: 'desc' },
      include: {
        created_by_admin: {
          select: { user_id: true, username: true }
        }
      }
    }),
    prisma.ecoChallenge.count()
  ]);

  return {
    data,
    meta: {
      total,
      page,
      lastPage: Math.ceil(total / limit),
      limit
    }
  };
};

export const getChallengeById = async (challengeId: number) => {
  if (!challengeId || challengeId <= 0) {
    throw new AppError('Invalid challenge ID', 400);
  }

  const challenge = await prisma.ecoChallenge.findUnique({
    where: { challenge_id: challengeId },
    include: {
      created_by_admin: {
        select: { user_id: true, username: true }
      }
    }
  });

  if (!challenge) {
    throw new AppError('Challenge not found', 404);
  }

  return challenge;
};

async function aiGenerateChallenge(): Promise<{
  title: string;
  description: string;
  points: number;
  materialType: MaterialType;
}> {
  const materials = Object.values(MaterialType);
  const randomMaterial = materials[Math.floor(Math.random() * materials.length)];

  const challenges = [
    {
      title: `Transform ${randomMaterial} waste`,
      description: `Collect and upcycle 5 pieces of ${randomMaterial} into something useful`,
      points: Math.floor(Math.random() * 50) + 20,
    },
    {
      title: `Creative ${randomMaterial} project`,
      description: `Create an artistic piece using discarded ${randomMaterial}`,
      points: Math.floor(Math.random() * 40) + 30,
    },
    {
      title: `${randomMaterial} recycling challenge`,
      description: `Properly sort and process ${randomMaterial} waste in your community`,
      points: Math.floor(Math.random() * 30) + 15,
    }
  ];

  const randomChallenge = challenges[Math.floor(Math.random() * challenges.length)];

  return {
    title: randomChallenge.title,
    description: randomChallenge.description,
    points: randomChallenge.points,
    materialType: randomMaterial as MaterialType,
  };
}

export const generateAndSaveChallenge = async (adminId?: number) => {
  const aiChallenge = await aiGenerateChallenge();
  return prisma.ecoChallenge.create({
    data: {
      title: aiChallenge.title,
      description: aiChallenge.description,
      points_reward: aiChallenge.points,
      material_type: aiChallenge.materialType,
      created_by_admin_id: adminId || null,
    },
  });
};