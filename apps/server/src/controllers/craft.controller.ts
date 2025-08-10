import { Request, Response } from 'express';
import { getCraftIdea } from '../services/craft.service';

export const generateCraftIdea = async (req: Request, res: Response) => {
  try {
    const { userMaterials } = req.body;

    if (!userMaterials) {
      return res.status(400).json({ error: 'userMaterials is required' });
    }

    const idea = await getCraftIdea(userMaterials);
    res.json({ idea });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};
