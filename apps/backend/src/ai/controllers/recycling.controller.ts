import { Request, Response } from "express";
import { detectRecyclableMaterials } from "../services/recycling.service";

export async function analyzeRecycling(req: Request, res: Response) {
  const { imageUrl } = req.body;

  if (!imageUrl || typeof imageUrl !== "string") {
    return res.status(400).json({ error: "imageUrl is required" });
  }

  try {
    const items = await detectRecyclableMaterials(imageUrl);
    res.json({ items });
  } catch (error) {
    console.error("Error analyzing recycling image:", error);
    res.status(500).json({ error: "Failed to detect recyclable materials" });
  }
}
