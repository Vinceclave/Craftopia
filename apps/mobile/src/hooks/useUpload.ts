// hooks/useLocalUpload.ts
import { useState } from 'react';
import * as ImagePicker from 'expo-image-picker';
import { apiService } from '~/services/base.service';
import { useAlert } from './useAlert';

export const useLocalUpload = () => {
  const [uploading, setUploading] = useState(false);
  const { error } = useAlert();

  const uploadToFolder = async (
    imageUri: string,
    folder: 'posts' | 'profiles' | 'crafts' | 'challenges' = 'posts'
  ): Promise<string | null> => {
    try {
      setUploading(true);

      const formData = new FormData();
      formData.append('image', {
        uri: imageUri,
        type: 'image/jpeg',
        name: 'image.jpg',
      } as any);

      // ✅ folder is sent via query param, not body
      const response: any = await apiService.request(`/api/v1/upload/image?folder=${folder}`, {
        method: 'POST',
        data: formData,
        headers: { 'Content-Type': 'multipart/form-data' },
        timeout: 30000,
      });

      if (response.success && response.data?.imageUrl) {
        return response.data.imageUrl;
      } else {
        throw new Error('Upload response invalid');
      }
    } catch (err: any) {
      console.error('Upload error details:', err);

      if (err.response?.data?.error) {
        error('Upload Failed', err.response.data.error);
      } else if (err.message) {
        error('Upload Failed', err.message);
      } else {
        error('Upload Failed', 'Unknown error occurred');
      }

      return null;
    } finally {
      setUploading(false);
    }
  };

  const pickAndUpload = async (
    source: 'camera' | 'gallery',
    folder: 'posts' | 'profiles' | 'crafts' | 'challenges' = 'posts'
  ): Promise<string | null> => {
    let result;

    if (source === 'camera') {
      const permission = await ImagePicker.requestCameraPermissionsAsync();
      if (!permission.granted) {
        error('Permission Denied', 'Camera permission is required');
        return null;
      }

      result = await ImagePicker.launchCameraAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        quality: 0.8,
      });
    } else {
      const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!permission.granted) {
        error('Permission Denied', 'Media library permission is required');
        return null;
      }

      result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        quality: 0.8,
      });
    }

    if (result.canceled || !result.assets[0]) {
      return null;
    }

    return await uploadToFolder(result.assets[0].uri, folder);
  };

  return { pickAndUpload, uploadToFolder, uploading };
};
