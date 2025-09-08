import { ai } from "../../config/gemini";
import { AppError } from "../../utils/error";

export const generateChallenges = () => {

    const response = ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: 'As an assistant',
    })

    

 




}