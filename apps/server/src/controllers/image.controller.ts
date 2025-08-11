import { Request, Response } from 'express';
import { analyzeImageBuffer } from '../services/imageRecognition.service';

export const getImageAnalysis = async (req: Request, res: Response) => {
  try {
    // multer puts the file info in req.file
    const file = req.file;
    if (!file) {
      return res.status(400).json({ error: "Image file is required" });
    }

    // file.buffer contains the binary data of the image
    const result = await analyzeImageBuffer(file.buffer);

    res.json({ description: result });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};
