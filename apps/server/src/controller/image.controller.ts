import { Request, Response } from 'express';
import { analyzeImage } from '../services/imageRecognition.service';

export const  getImageAnalysis = async (req: Request, res: Response) => {
    try {
        const { imageUrl } = req.body;

        if (!imageUrl) 
            return res.status(400).json({ error: "Image Url is required"});

        const result = await analyzeImage(imageUrl);
        
        res.json({ description: result });

    } catch(error: any) {
        res.status(500).json({ error: error.message});
    }
}