import prisma from "../config/prisma";
import { MaterialType, ChallengeCategory } from "../generated/prisma";
import { AppError } from '../utils/error';

export const createChallenge = async (data: {
  title: string;
  description: string;
  points_reward: number;
  material_type: string;
  created_by_admin_id: number | null;
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
      created_by_admin_id: data.created_by_admin_id,
    },
    include: {
      created_by_admin: {
        select: { user_id: true, username: true }
      }
    }
  });
};

export const generateAndSaveChallenge = async (category: ChallengeCategory, adminId?: number) => {
  const aiChallenge = await aiGenerateChallenge();
  
  return prisma.ecoChallenge.create({
    data: {
      title: aiChallenge.title,
      description: aiChallenge.description,
      points_reward: aiChallenge.points,
      material_type: aiChallenge.materialType,
      category,
      created_by_admin_id: adminId || null,
    },
    include: {
      created_by_admin: {
        select: { user_id: true, username: true }
      }
    }
  });
};

export const getAllChallenges = async (category?: string) => {
  const where: any = {
    deleted_at: null,
    is_active: true,
  };

  if (category && category !== 'all') {
    where.category = category;
  }

  const data = await prisma.ecoChallenge.findMany({
    where,
    orderBy: { created_at: 'desc' },
    include: {
      created_by_admin: {
        select: { user_id: true, username: true },
      },
      _count: {
        select: {
          participants: {
            where: { deleted_at: null },
          },
        },
      },
    },
  });

  return { data, total: data.length };
};

export const getChallengeById = async (challengeId: number) => {
  if (!challengeId || challengeId <= 0) {
    throw new AppError('Invalid challenge ID', 400);
  }

  const challenge = await prisma.ecoChallenge.findFirst({
    where: {
      challenge_id: challengeId,
      deleted_at: null
    },
    include: {
      created_by_admin: {
        select: { user_id: true, username: true }
      },
      participants: {
        where: { deleted_at: null },
        include: {
          user: {
            select: { user_id: true, username: true }
          }
        },
        orderBy: { created_at: 'desc' },
        take: 10 // Show recent participants
      },
      _count: {
        select: {
          participants: {
            where: { deleted_at: null }
          }
        }
      }
    }
  });

  if (!challenge) {
    throw new AppError('Challenge not found', 404);
  }

  return {
    ...challenge,
    participantCount: challenge._count.participants,
    _count: undefined // Remove from response
  };
};

// AI simulation function
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