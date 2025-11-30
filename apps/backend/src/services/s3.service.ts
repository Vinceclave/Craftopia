// apps/backend/src/services/s3.service.ts

import { S3Client, PutObjectCommand, GetObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { Upload } from '@aws-sdk/lib-storage';
import dotenv from 'dotenv';
import path from 'path';
import crypto from 'crypto';

dotenv.config({ path: path.resolve(__dirname, '../../.env') });

const s3 = new S3Client({
  region: process.env.AWS_REGION!,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  },
});

/**
 * Upload base64 image to S3 and return a pre-signed URL
 * Used for AI-generated images that need to be saved
 * @param base64Data - Base64 string (with or without data URI prefix)
 * @param folder - Folder name in S3 bucket (e.g., 'crafts', 'posts')
 * @param expiresIn - Pre-signed URL expiration time in seconds (default: 7 days)
 * @returns Pre-signed URL valid for specified duration
 */
export async function uploadBase64ToS3(
  base64Data: string,
  folder: string = 'crafts',
  expiresIn: number = 604800 // 7 days
): Promise<string> {
  try {
    // Remove data URI prefix if present (data:image/png;base64,...)
    let cleanBase64 = base64Data;
    let mimeType = 'image/jpeg'; // default
    
    if (base64Data.includes(',')) {
      const parts = base64Data.split(',');
      cleanBase64 = parts[1];
      
      // Extract MIME type from data URI
      const dataUriPrefix = parts[0];
      if (dataUriPrefix.includes('image/png')) {
        mimeType = 'image/png';
      } else if (dataUriPrefix.includes('image/webp')) {
        mimeType = 'image/webp';
      } else if (dataUriPrefix.includes('image/jpeg') || dataUriPrefix.includes('image/jpg')) {
        mimeType = 'image/jpeg';
      }
    }

    // Convert base64 to buffer
    const buffer = Buffer.from(cleanBase64, 'base64');

    // Generate unique filename
    const timestamp = Date.now();
    const randomString = crypto.randomBytes(8).toString('hex');
    const extension = mimeType === 'image/png' ? '.png' : '.jpg';
    const key = `${folder}/image_${timestamp}_${randomString}${extension}`;

    console.log(`📤 Uploading base64 image to S3: ${key}`);
    console.log(`📊 Image size: ${(buffer.length / 1024).toFixed(2)} KB`);

    // Upload to S3 using Upload (handles large files)
    const upload = new Upload({
      client: s3,
      params: {
        Bucket: process.env.AWS_BUCKET_NAME!,
        Key: key,
        Body: buffer,
        ContentType: mimeType,
      },
    });

    await upload.done();

    console.log(`✅ Upload complete: ${key}`);

    // Generate pre-signed URL
    const command = new GetObjectCommand({
      Bucket: process.env.AWS_BUCKET_NAME!,
      Key: key,
    });

    const signedUrl = await getSignedUrl(s3, command, { expiresIn });

    console.log(`✅ Pre-signed URL generated (expires in ${expiresIn / 86400} days)`);

    return signedUrl;
  } catch (error: any) {
    console.error('❌ S3 base64 upload error:', error);
    throw new Error(`Failed to upload image to S3: ${error.message}`);
  }
}

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