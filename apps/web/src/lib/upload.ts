// apps/web/src/lib/upload.ts - NEW FILE
import api from './api';

/**
 * Upload image to S3 via backend API
 * Uses the existing authenticated API instance
 */
export const uploadImageToS3 = async (file: File): Promise<string> => {
  const formData = new FormData();
  formData.append('image', file);

  try {
    // Use the authenticated api instance (not axios directly)
    const response = await api.post('/upload/image', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });

    console.log('✅ Image upload response:', response);

    // Handle different response structures
    const imageUrl = 
      response?.data?.data?.imageUrl || 
      response?.data?.imageUrl || 
      response?.imageUrl;

    if (!imageUrl) {
      throw new Error('No image URL in response');
    }

    return imageUrl;
  } catch (error: any) {
    console.error('❌ Image upload error:', error);
    throw new Error(error?.response?.data?.error || error?.message || 'Failed to upload image');
  }
};

/**
 * Validate image file before upload
 */
export const validateImageFile = (file: File): { valid: boolean; error?: string } => {
  // Check file type
  const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
  if (!allowedTypes.includes(file.type)) {
    return {
      valid: false,
      error: 'Please select a valid image file (JPEG, PNG, or WEBP)',
    };
  }

  // Check file size (10MB)
  const maxSize = 10 * 1024 * 1024; // 10MB in bytes
  if (file.size > maxSize) {
    return {
      valid: false,
      error: 'Image size must be less than 10MB',
    };
  }

  return { valid: true };
};

/**
 * Create image preview from file
 */
export const createImagePreview = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onloadend = () => {
      resolve(reader.result as string);
    };
    
    reader.onerror = () => {
      reject(new Error('Failed to read file'));
    };
    
    reader.readAsDataURL(file);
  });
};