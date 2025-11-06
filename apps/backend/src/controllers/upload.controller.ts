import { Response } from 'express';
import { AuthRequest } from '../middlewares/auth.middleware';
import { sendSuccess, sendError } from '../utils/response';
import { asyncHandler } from '../utils/asyncHandler';
import { uploadFileToS3 } from '../services/s3.service';

export const uploadImage = asyncHandler(async (req: AuthRequest, res: Response) => {
  if (!req.file) {
    return sendError(res, 'No file uploaded', 400);
  }

  const folder = (req.query.folder as string) || 'posts';

  try {
    // Upload file from memory directly to S3
    const imageUrl = await uploadFileToS3(req.file, folder);

    sendSuccess(
      res,
      {
        imageUrl,
        filename: req.file.originalname,
        size: req.file.size,
        folder,
      },
      'Image uploaded successfully'
    );
  } catch (err: any) {
    return sendError(res, 'Failed to upload image to S3', 500, err.message);
  }
});
