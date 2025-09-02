import { Request, Response } from "express";
import { generateCraftProject } from "../services/craft.service";

export async function createCraft(req: Request, res: Response) {
  const { items } = req.body;

  if (!items || !Array.isArray(items)) {
    return res.status(400).json({ error: "items array is required" });
  }

  const recyclableItems = items.filter(item => item.recyclable);

  if (recyclableItems.length === 0) {
    return res.status(400).json({ error: "No recyclable items provided" });
  }

  try {
    const craft = await generateCraftProject(recyclableItems);
    res.json({ craft });
  } catch (error) {
    console.error("Error creating craft:", error);
    res.status(500).json({ error: "Failed to create craft project" });
  }
}