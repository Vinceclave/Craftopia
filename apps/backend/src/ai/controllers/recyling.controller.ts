// src/controllers/recycling.controller.ts
import { Request, Response } from "express";
import { detectRecyclingMaterials } from "../services/recycling.service";

export const detectRecyclingController = async (req: Request, res: Response) => {
  try {
    const { imageUrl } = req.body;
    if (!imageUrl) return res.status(400).json({ error: "imageUrl is required" });

    const result = await detectRecyclingMaterials({ imageUrl });
    res.json(result);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Recycling detection failed" });
  }
};
