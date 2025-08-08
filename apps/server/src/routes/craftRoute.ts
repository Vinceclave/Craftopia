import express, { Request, Response } from 'express';
import { getGroqResponse } from '../services/craftService';

const router = express.Router();

/**
 * @route   POST /api/groq
 * @desc    Send a prompt to the Groq AI and return a generated response
 * @access  Public
 */
router.post('/', async (req: Request, res: Response) => {
  const { prompt} = req.body;

  if (!prompt || typeof prompt !== 'string') {
    return res.status(400).json({ error: 'Prompt is required and must be a string.' });
  }

  try {
    const response = await getGroqResponse(prompt);
    res.status(200).json({ success: true, response });
  } catch (error: any) {
    console.error('Groq error:', error.message);
    res.status(500).json({ success: false, error: error.message });
  }
});

export default router;
