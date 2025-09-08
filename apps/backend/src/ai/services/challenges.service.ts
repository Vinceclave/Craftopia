import { ai } from "../gemini/client";
import { AppError } from "../../utils/error";
import { challengePrompt } from "../prompt/challenges.prompt";
import { parseResponse } from "../utils/responseParser";

export const generateChallenge = async () => {
  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash",
    contents: challengePrompt,
  });

  const text = response.text;
  if (!text) throw new AppError("AI did not return a response", 500);

  const parsed = parseResponse(text);
  if (!parsed || typeof parsed !== "object") {
    throw new AppError("AI did not return a valid challenge", 500);
  }

  return parsed;
};
