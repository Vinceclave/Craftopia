// controllers/challenge.controller.ts
import { Request, Response, NextFunction } from "express";
import * as challengeService from "../services/challenge.service";
import { MaterialType } from "../generated/prisma";

// Manual challenge creation
export const createChallenge = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { title, description, points_reward, material_type, created_by_admin_id } = req.body;

    // Validate material_type against enum
    if (!Object.values(MaterialType).includes(material_type as MaterialType)) {
      return res.status(400).json({
        success: false,
        error: `Invalid material type. Allowed values: ${Object.values(MaterialType).join(', ')}`
      });
    }

    const challenge = await challengeService.createChallenge({
      title,
      description,
      points_reward,
      material_type,
      created_by_admin_id
    });

    res.status(201).json({
      success: true,
      data: challenge
    });
  } catch (err) {
    next(err);
  }
};

// AI generate challenge
export const generateChallenge = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { adminId } = req.body;
    const challenge = await challengeService.generateAndSaveChallenge(adminId);
    res.json({ success: true, data: challenge });
  } catch (err) {
    next(err);
  }
};
