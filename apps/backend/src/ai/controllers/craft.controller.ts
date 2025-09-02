import { Request, Response } from "express";
import { generateCraftFromItems } from "../services/craft.service";

export async function createCraftFromRecyclables(req: Request, res: Response) {
  const { items } = req.body;

  if (!items || !Array.isArray(items)) {
    return res.status(400).json({ error: "Materials array is required" }); // This triggers if body is missing or invalid
  }

  const recyclableItems = items.filter(i => i.recyclable);

  if (recyclableItems.length === 0) {
    return res.status(200).json({ message: "No recyclable items to generate craft.", craft: null });
  }


  try {
    const craftProject = await generateCraftFromItems(recyclableItems);
    res.json({ craft: craftProject });
  } catch (error) {
    console.error("Error generating craft:", error);
    res.status(500).json({ error: "Failed to generate craft" });
  }
}
