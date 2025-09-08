import { ai } from "../../gemini/client";
import { AppError } from "../../../utils/error";
import { prompt } from "./prompt";

export const generateAIChallenge = async () => {
    
    const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: prompt,
    })

    if (!response)
        throw new AppError('Empty AI response', 500)

    return response.text;
}
