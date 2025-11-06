// testUpload.ts
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';
import { S3Client } from '@aws-sdk/client-s3';
import { Upload } from '@aws-sdk/lib-storage';

// 1️⃣ Load .env (adjust path if needed)
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

// 2️⃣ Check environment variables
console.log('AWS_ACCESS_KEY_ID:', process.env.AWS_ACCESS_KEY_ID);
console.log('AWS_SECRET_ACCESS_KEY:', process.env.AWS_SECRET_ACCESS_KEY);
console.log('AWS_REGION:', process.env.AWS_REGION);
console.log('AWS_BUCKET_NAME:', process.env.AWS_BUCKET_NAME);

// 3️⃣ Initialize S3 client
const s3 = new S3Client({
  region: process.env.AWS_REGION!,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  },
});

async function uploadFileToS3(file: Express.Multer.File, folder: string) {
  const timestamp = Date.now();
  const extension = path.extname(file.originalname);
  const key = `${folder}/image_${timestamp}${extension}`;

  const upload = new Upload({
    client: s3,
    params: {
      Bucket: process.env.AWS_BUCKET_NAME!,
      Key: key,
      Body: file.buffer,
      ContentType: file.mimetype,
      // ACL removed for "Bucket owner enforced" buckets
    },
  });

  await upload.done();

  return `https://${process.env.AWS_BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/${key}`;
}

async function testUpload() {
  try {
    // 4️⃣ Path to local image
    const filePath = path.join(__dirname, 'test-image.jpg'); // <-- make sure this exists
    const fileBuffer = fs.readFileSync(filePath);

    // 5️⃣ Create a fake Multer file object
    const file = {
      originalname: 'test-image.jpg',
      buffer: fileBuffer,
      mimetype: 'image/jpeg',
      size: fileBuffer.length,
    } as Express.Multer.File;

    const folder = 'test'; // S3 folder
    const url = await uploadFileToS3(file, folder);

    console.log('✅ File uploaded successfully:', url);
  } catch (err) {
    console.error('❌ Upload failed:', err);
  }
}

// 6️⃣ Run the test
testUpload();
