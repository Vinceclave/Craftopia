
import { Response, Request } from "express";
import { generateCraft } from "../services/ai.service";
import { AppError } from "../../utils/error";
import { sendSuccess } from "../../utils/response";


export const craftController = async (req: Request, res: Response) => {
    const { materials } = req.body;
    const result = await generateCraft(materials); // Call the service
    sendSuccess(res, result, 'Generated Successfully');
};
