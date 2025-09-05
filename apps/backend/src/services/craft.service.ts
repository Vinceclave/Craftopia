import prisma from "../config/prisma";

// ------------------- CREATE -------------------
export const createCraftIdea = async (data: {
  generated_by_user_id?: number;
  idea_json: object;
  recycled_materials?: object;
}) => {
  return await prisma.craftIdea.create({
    data,
  });
};

// ------------------- GET ALL / PAGINATION / FILTER / SEARCH -------------------
interface GetCraftIdeasOptions {
  page?: number;
  limit?: number;
  search?: string;
  material?: string;
  startDate?: string;
  endDate?: string;
  user_id?: number;
}

export const getCraftIdeas = async ({
  page = 1,
  limit = 10,
  search,
  material,
  startDate,
  endDate,
  user_id,
}: GetCraftIdeasOptions) => {
  const skip = (page - 1) * limit;

  const where: any = { deleted_at: null };

  if (user_id) where.generated_by_user_id = user_id;

  if (startDate || endDate) {
    where.created_at = {};
    if (startDate) where.created_at.gte = new Date(startDate);
    if (endDate) where.created_at.lte = new Date(endDate);
  }

  if (search) {
    where.OR = [
      { idea_json: { path: [], string_contains: search } },
      { recycled_materials: { path: [], string_contains: search } },
    ];
  }

  if (material) {
    where.recycled_materials = {
      array_contains: [material], // assumes recycled_materials is a JSON array
    };
  }

  const [data, total] = await Promise.all([
    prisma.craftIdea.findMany({
      where,
      skip,
      take: limit,
      orderBy: { created_at: 'desc' },
      include: { generated_by_user: true },
    }),
    prisma.craftIdea.count({ where }),
  ]);

  return {
    data,
    meta: {
      total,
      page,
      last_page: Math.ceil(total / limit),
    },
  };
};

// ------------------- GET BY ID -------------------
export const getCraftIdeaById = async (idea_id: number) => {
  return await prisma.craftIdea.findUnique({
    where: { idea_id },
    include: { generated_by_user: true },
  });
};

// ------------------- GET BY USER -------------------
export const getCraftIdeasByUser = async (user_id: number) => {
  return await prisma.craftIdea.findMany({
    where: { generated_by_user_id: user_id, deleted_at: null },
    orderBy: { created_at: 'desc' },
  });
};

// ------------------- DELETE (SOFT DELETE) -------------------
export const deleteCraftIdea = async (idea_id: number) => {
  return await prisma.craftIdea.update({
    where: { idea_id },
    data: { deleted_at: new Date() },
  });
};

// ------------------- STATS / OPTIONAL -------------------

// Count crafts (optionally by user)
export const countCraftIdeas = async (user_id?: number) => {
  const where: any = { deleted_at: null };
  if (user_id) where.generated_by_user_id = user_id;
  return await prisma.craftIdea.count({ where });
};

// Get recent crafts
export const getRecentCraftIdeas = async (limit: number = 5) => {
  return await prisma.craftIdea.findMany({
    where: { deleted_at: null },
    orderBy: { created_at: 'desc' },
    take: limit,
  });
};

