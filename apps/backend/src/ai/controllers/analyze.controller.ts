import { Request, Response } from "express";
import { detectRecyclableMaterials, detectRecyclableMaterialsAlternative } from "../services/recycling.service";
import { generateCraftProject } from "../services/craft.service";
import { generateCraftImage } from "../services/pollination.service";

export async function analyzeAndCraft(req: Request, res: Response) {
  const { imageUrl } = req.body;

  if (!imageUrl) {
    return res.status(400).json({ error: "imageUrl is required" });
  }

  try {
    console.log("Analyzing image:", imageUrl);
    
    // Step 1: Detect recyclable materials
    let items = await detectRecyclableMaterials(imageUrl);
    console.log(`Primary method detected ${items.length} items`);
    
    // Fallback to alternative method if needed
    if (items.length === 0) {
      console.log("Trying alternative detection method...");
      items = await detectRecyclableMaterialsAlternative(imageUrl);
      console.log(`Alternative method detected ${items.length} items`);
    }
    
    if (items.length === 0) {
      return res.json({ 
        items: [], 
        craft: null,
        craftImage: null,
        message: "No objects detected in the image"
      });
    }

    const recyclableItems = items.filter(item => item.recyclable);
    console.log(`Found ${recyclableItems.length} recyclable items out of ${items.length} total`);
    
    if (recyclableItems.length === 0) {
      return res.json({ 
        items, 
        craft: null,
        craftImage: null,
        message: "Items detected but none are recyclable for crafting"
      });
    }

    // Step 2: Generate craft project
    console.log("Generating craft project...");
    const craft = await generateCraftProject(recyclableItems);
    
    // Step 3: Generate craft visualization with Pollinations.AI
    const craftImage = generateCraftImage(recyclableItems, craft);
    console.log("Generated craft image URL");
    
    res.json({ 
      items, 
      craft,
      craftImage,
      message: `Found ${items.length} items, ${recyclableItems.length} recyclable`
    });

  } catch (error) {
    console.error("Error in analyze and craft:", error);
    res.status(500).json({ 
      error: "Failed to process request",
      details: error instanceof Error ? error.message : "Unknown error"
    });
  }
}

// Keep the test endpoint simple too
export async function testImageDetection(req: Request, res: Response) {
  const { imageUrl } = req.body;

  if (!imageUrl) {
    return res.status(400).json({ error: "imageUrl is required" });
  }

  try {
    const [primaryResult, alternativeResult] = await Promise.allSettled([
      detectRecyclableMaterials(imageUrl),
      detectRecyclableMaterialsAlternative(imageUrl)
    ]);

    res.json({
      imageUrl,
      primary: {
        status: primaryResult.status,
        items: primaryResult.status === 'fulfilled' ? primaryResult.value : [],
        error: primaryResult.status === 'rejected' ? primaryResult.reason.message : null
      },
      alternative: {
        status: alternativeResult.status,
        items: alternativeResult.status === 'fulfilled' ? alternativeResult.value : [],
        error: alternativeResult.status === 'rejected' ? alternativeResult.reason.message : null
      }
    });

  } catch (error) {
    console.error("Error in test detection:", error);
    res.status(500).json({ error: "Failed to test image detection" });
  }
}