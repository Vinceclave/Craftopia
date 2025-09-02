// src/controllers/craft.controller.ts
import { Request, Response } from "express";
import { generateCraftIdeas } from "../services/craft.service";

export const generateCraftController = async (req: Request, res: Response) => {
  try {
    const { preferences, materials } = req.body;
    if (!materials) return res.status(400).json({ error: "materials are required" });

    const craftIdeas = await generateCraftIdeas({ preferences, materials });
    res.json(craftIdeas);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Craft generation failed" });
  }
};
