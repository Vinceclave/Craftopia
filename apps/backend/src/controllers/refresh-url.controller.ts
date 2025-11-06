import { Response } from 'express';
import { AuthRequest } from '../middlewares/auth.middleware';
import { sendSuccess, sendError } from '../utils/response';
import { asyncHandler } from '../utils/asyncHandler';
import { getSignedUrlForKey, extractKeyFromSignedUrl, isUrlExpired } from '../services/s3.service';

/**
 * Refresh an expired pre-signed URL
 * POST /api/v1/upload/refresh-url
 * Body: { imageUrl: "https://bucket.s3.region.amazonaws.com/..." }
 */
export const refreshImageUrl = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { imageUrl } = req.body;

  if (!imageUrl) {
    return sendError(res, 'Image URL is required', 400);
  }

  try {
    // Extract S3 key from the URL
    const key = extractKeyFromSignedUrl(imageUrl);
    
    if (!key) {
      return sendError(res, 'Invalid image URL', 400);
    }

    // Check if URL is expired
    const expired = isUrlExpired(imageUrl);

    // Generate new pre-signed URL
    const newImageUrl = await getSignedUrlForKey(key);

    sendSuccess(
      res,
      {
        imageUrl: newImageUrl,
        key,
        wasExpired: expired,
      },
      'Image URL refreshed successfully'
    );
  } catch (err: any) {
    return sendError(res, 'Failed to refresh image URL', 500, err.message);
  }
});