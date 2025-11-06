// services/s3.service.ts
import { S3Client, PutObjectCommand, GetObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { Upload } from '@aws-sdk/lib-storage';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(__dirname, '../../.env') });

const s3 = new S3Client({
  region: process.env.AWS_REGION!,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  },
});

/**
 * Upload file to S3 and return a pre-signed URL
 * @param file - Multer file object
 * @param folder - Folder name in S3 bucket
 * @returns Pre-signed URL valid for 7 days
 */
export async function uploadFileToS3(file: Express.Multer.File, folder: string) {
  const timestamp = Date.now();
  const extension = path.extname(file.originalname);
  const key = `${folder}/image_${timestamp}${extension}`;

  // Upload file to S3
  const upload = new Upload({
    client: s3,
    params: {
      Bucket: process.env.AWS_BUCKET_NAME!,
      Key: key,
      Body: file.buffer,
      ContentType: file.mimetype,
    },
  });

  await upload.done();

  // Generate pre-signed URL (valid for 7 days)
  const command = new GetObjectCommand({
    Bucket: process.env.AWS_BUCKET_NAME!,
    Key: key,
  });

  const signedUrl = await getSignedUrl(s3, command, { 
    expiresIn: 604800 // 7 days in seconds
  });

  return signedUrl;
}

/**
 * Generate a new pre-signed URL for an existing S3 object
 * Use this to refresh expired URLs
 * @param key - S3 object key (e.g., "posts/image_1234567890.jpg")
 * @param expiresIn - URL expiration time in seconds (default: 7 days)
 * @returns Pre-signed URL
 */
export async function getSignedUrlForKey(key: string, expiresIn: number = 604800) {
  const command = new GetObjectCommand({
    Bucket: process.env.AWS_BUCKET_NAME!,
    Key: key,
  });

  return await getSignedUrl(s3, command, { expiresIn });
}

/**
 * Extract S3 key from a pre-signed URL
 * @param signedUrl - Pre-signed URL
 * @returns S3 key or null if invalid
 */
export function extractKeyFromSignedUrl(signedUrl: string): string | null {
  try {
    const url = new URL(signedUrl);
    // Remove leading slash
    const key = url.pathname.substring(1);
    return key;
  } catch (error) {
    console.error('Invalid URL:', error);
    return null;
  }
}

/**
 * Check if a pre-signed URL is expired
 * @param signedUrl - Pre-signed URL
 * @returns true if expired, false otherwise
 */
export function isUrlExpired(signedUrl: string): boolean {
  try {
    const url = new URL(signedUrl);
    const expiresParam = url.searchParams.get('X-Amz-Expires');
    const dateParam = url.searchParams.get('X-Amz-Date');
    
    if (!expiresParam || !dateParam) return true;

    const expiresIn = parseInt(expiresParam, 10);
    const dateStr = dateParam;
    
    // Parse date: format is YYYYMMDDTHHmmssZ
    const year = parseInt(dateStr.substring(0, 4), 10);
    const month = parseInt(dateStr.substring(4, 6), 10) - 1;
    const day = parseInt(dateStr.substring(6, 8), 10);
    const hour = parseInt(dateStr.substring(9, 11), 10);
    const minute = parseInt(dateStr.substring(11, 13), 10);
    const second = parseInt(dateStr.substring(13, 15), 10);
    
    const signedDate = new Date(Date.UTC(year, month, day, hour, minute, second));
    const expirationDate = new Date(signedDate.getTime() + expiresIn * 1000);
    
    return Date.now() > expirationDate.getTime();
  } catch (error) {
    console.error('Error checking URL expiration:', error);
    return true; // Assume expired if we can't parse
  }
}