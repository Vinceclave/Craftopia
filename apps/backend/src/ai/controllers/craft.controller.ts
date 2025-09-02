import { Request, Response } from 'express';
import { GroqService } from '@/ai/services/craft.service';
import { GenerateRequest, ApiResponse } from '@/ai/types/ai.types';

const groqService = new GroqService();

export const generateCrafts = async (req: Request, res: Response) => {
  try {
    const { materials, difficulty, ageGroup }: GenerateRequest = req.body;

    if (!materials || materials.length === 0) {
      return res.status(400).json({ 
        success: false, 
        error: 'Materials are required' 
      });
    }

    console.log('🎨 Generating crafts for:', materials);

    const crafts = await groqService.generateCrafts(materials, { difficulty, ageGroup });

    const response: ApiResponse = {
      success: true,
      crafts
    };

    res.json(response);
  } catch (error: any) {
    console.error('❌ Error:', error.message);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};