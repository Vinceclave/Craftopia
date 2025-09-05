import prisma from "../config/prisma";
import { MaterialType } from "../generated/prisma";

// Create a new challenge
export const createChallenge = async (data: {
  title: string;
  description: string;
  points_reward: number;
  material_type: string;
  created_by_admin_id: number | null;
}) => {
  if (!Object.values(MaterialType).includes(data.material_type as MaterialType)) {
    throw new Error(`Invalid material type. Allowed values: ${Object.values(MaterialType).join(', ')}`);
  }

  return prisma.ecoChallenge.create({
    data: {
      title: data.title,
      description: data.description,
      points_reward: data.points_reward,
      material_type: data.material_type as MaterialType,
      created_by_admin_id: data.created_by_admin_id
    }
  });
};

// Fake AI challenge generator
async function aiGenerateChallenge(): Promise<{
  title: string;
  description: string;
  points: number;
  materialType: MaterialType;
}> {
  const materials = Object.values(MaterialType);
  const randomMaterial = materials[Math.floor(Math.random() * materials.length)];

  return {
    title: `Recycle ${randomMaterial}`,
    description: `Collect and recycle 5 items of ${randomMaterial}`,
    points: Math.floor(Math.random() * 50) + 10,
    materialType: randomMaterial as MaterialType,
  };
}

// Generate & save AI challenge
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

