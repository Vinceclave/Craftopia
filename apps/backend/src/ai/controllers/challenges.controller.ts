import { Request, Response } from "express";
import { sendSuccess } from "../../utils/response";
import { asyncHandler } from "../../utils/asyncHandler";
import { generateChallenge } from "../services/challenges.service";

export const generateChallenges = asyncHandler(async (req: Request, res: Response) => {
  const { materials, category } = req.body;

  if (!materials || !Array.isArray(materials) || !category) {
    return res.status(400).json({ message: "materials array and category required" });
  }

  const challenges = await generateChallenge(materials, category);
  sendSuccess(res, challenges, 'Challenges successfully generated');
});
