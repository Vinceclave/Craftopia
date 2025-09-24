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
      
      // 📁 SPECIFY FOLDER
      formData.append('folder', folder);

      const response: any = await apiService.request('/api/v1/upload/image', {
        method: 'POST',
        data: formData,
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      // Returns: "/uploads/posts/image_1703123456.jpg"
      return response.data.imageUrl;

    } catch (err: any) {
      error('Upload Failed', err.message);
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
      await ImagePicker.requestCameraPermissionsAsync();
      result = await ImagePicker.launchCameraAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });
    } else {
      await ImagePicker.requestMediaLibraryPermissionsAsync();
      result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });
    }

    if (result.canceled || !result.assets[0]) return null;

    return await uploadToFolder(result.assets[0].uri, folder);
  };

  return { pickAndUpload, uploadToFolder, uploading };
};