import { Request, Response } from "express";
import { detectRecyclableMaterials, RecyclableItem } from "../services/recycling.service";
import { generateCraftFromItems, CraftProject } from "../services/craft.service";

export async function analyzeAndCraft(req: Request, res: Response) {
  const { imageUrl } = req.body;

  if (!imageUrl || typeof imageUrl !== "string") {
    return res.status(400).json({ error: "imageUrl is required" });
  }

  try {
    // Step 1: Detect recyclable materials
    const items: RecyclableItem[] = await detectRecyclableMaterials(imageUrl);

    if (!items || items.length === 0) {
      return res.status(200).json({ message: "No recyclable items detected.", items: [], craft: null });
    }

    // Step 2: Filter only recyclable items for crafting
    const recyclableItems = items.filter(i => i.recyclable);

    if (recyclableItems.length === 0) {
      return res.status(200).json({ message: "No recyclable items to generate craft.", items, craft: null });
    }

    // Step 3: Generate craft project
    const craft: CraftProject = await generateCraftFromItems(recyclableItems);

    // Step 4: Respond with both detected items and craft
    res.json({ items, craft });

  } catch (error) {
    console.error("Error processing image and generating craft:", error);
    res.status(500).json({ error: "Failed to analyze image and generate craft" });
  }
}
