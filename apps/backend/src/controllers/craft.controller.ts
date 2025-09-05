import { Request, Response, NextFunction } from 'express';
import * as craftService from '../services/craft.service';

// ------------------- CREATE -------------------
export const createCraftIdea = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { generated_by_user_id, idea_json, recycled_materials } = req.body;

    if (!idea_json) {
      return res.status(400).json({ success: false, message: 'idea_json is required' });
    }

    const craftIdea = await craftService.createCraftIdea({
      generated_by_user_id,
      idea_json,
      recycled_materials,
    });

    res.status(201).json({ success: true, data: craftIdea });
  } catch (error: any) {
    next(error);
  }
};

// ------------------- GET ALL / PAGINATION / FILTER / SEARCH -------------------
export const getCraftIdeas = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { page, limit, search, material, startDate, endDate, user_id } = req.query;

    const result = await craftService.getCraftIdeas({
      page: page ? Number(page) : 1,
      limit: limit ? Number(limit) : 10,
      search: search ? String(search) : undefined,
      material: material ? String(material) : undefined,
      startDate: startDate ? String(startDate) : undefined,
      endDate: endDate ? String(endDate) : undefined,
      user_id: user_id ? Number(user_id) : undefined,
    });

    res.status(200).json({ success: true, ...result });
  } catch (error: any) {
    next(error);
  }
};

// ------------------- GET BY ID -------------------
export const getCraftIdeaById = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { idea_id } = req.params;
    const craftIdea = await craftService.getCraftIdeaById(Number(idea_id));
    if (!craftIdea) throw { statusCode: 404, message: 'Craft idea not found' };
    res.status(200).json({ success: true, data: craftIdea });
  } catch (error: any) {
    next(error);
  }
};

// ------------------- GET BY USER -------------------
export const getCraftIdeasByUser = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { user_id } = req.params;
    const craftIdeas = await craftService.getCraftIdeasByUser(Number(user_id));
    res.status(200).json({ success: true, data: craftIdeas });
  } catch (error: any) {
    next(error);
  }
};

// ------------------- DELETE (SOFT DELETE) -------------------
export const deleteCraftIdea = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { idea_id } = req.params;
    const deleted = await craftService.deleteCraftIdea(Number(idea_id));
    res.status(200).json({ success: true, data: deleted });
  } catch (error: any) {
    next(error);
  }
};

// ------------------- STATS / OPTIONAL -------------------

// Count crafts (optionally by user)
export const countCraftIdeas = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { user_id } = req.query;
    const total = await craftService.countCraftIdeas(user_id ? Number(user_id) : undefined);
    res.status(200).json({ success: true, total });
  } catch (error: any) {
    next(error);
  }
};

// Get recent crafts
export const getRecentCraftIdeas = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const limit = req.query.limit ? Number(req.query.limit) : 5;
    const crafts = await craftService.getRecentCraftIdeas(limit);
    res.status(200).json({ success: true, data: crafts });
  } catch (error: any) {
    next(error);
  }
};

