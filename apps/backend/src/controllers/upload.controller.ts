// controllers/upload.controller.ts
import { Response } from 'express';
import { AuthRequest } from '../middlewares/auth.middleware';
import { sendSuccess, sendError } from '../utils/response';
import { asyncHandler } from '../utils/asyncHandler';

export const uploadImage = asyncHandler(async (req: AuthRequest, res: Response) => {
  if (!req.file) {
    return sendError(res, 'No file uploaded', 400);
  }

  const folder = (req.query.folder as string) || 'posts';
  const imageUrl = `/uploads/${folder}/${req.file.filename}`;

  sendSuccess(
    res,
    {
      imageUrl,
      filename: req.file.filename,
      originalName: req.file.originalname,
      size: req.file.size,
      folder,
    },
    'Image uploaded successfully'
  );
});
