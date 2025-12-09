import React, { useState, useEffect } from 'react'
import { View, Text, TouchableOpacity, Image, Modal, ActivityIndicator } from 'react-native'
import { Camera, Image as ImageIcon, User } from 'lucide-react-native'
import * as ImagePicker from 'expo-image-picker'
import { useLocalUpload } from '~/hooks/useUpload'
import { useProfile } from '~/hooks/useProfile'

interface Props {
  avatar?: string
  onChange?: (uri?: string) => void
}

export const AvatarSection: React.FC<Props> = ({ avatar: propAvatar, onChange }) => {
  const { profile, updateProfilePhoto, isUpdating } = useProfile();
  const { uploadToFolder, uploading: uploadingImage } = useLocalUpload();
  const [showPicker, setShowPicker] = useState(false);
  const [imageError, setImageError] = useState(false);
  
  // Get avatar from profile or props, with emoji fallback
  const profileAvatar = profile?.profile?.profile_picture_url;
  const avatar = propAvatar || profileAvatar || '🧑‍🎨';
  const safeAvatar = String(avatar);
  const isEmoji = safeAvatar.length <= 2 && !safeAvatar.startsWith('http');
  
  const uploading = uploadingImage || isUpdating;
  
  useEffect(() => {
    // Reset error when avatar changes
    if (imageError && avatar !== safeAvatar) {
      setImageError(false);
    }
  }, [propAvatar, profileAvatar, avatar, isEmoji]);

  const pickImage = async (fromCamera = false) => {
    const permission = fromCamera
      ? await ImagePicker.requestCameraPermissionsAsync()
      : await ImagePicker.requestMediaLibraryPermissionsAsync()

    if (!permission.granted) {
      return;
    }

    const result = await (fromCamera
      ? ImagePicker.launchCameraAsync({ 
          quality: 0.7,
          allowsEditing: true,
          aspect: [1, 1],
        })
      : ImagePicker.launchImageLibraryAsync({ 
          quality: 0.7,
          allowsEditing: true,
          aspect: [1, 1],
        }))

    if (!result.canceled) {
      const asset = result.assets[0];
      
      try {
        // Upload to S3
        const uploadedUrl = await uploadToFolder(asset.uri, 'profiles');
        
        if (!uploadedUrl) {
          throw new Error('Upload failed - no URL returned');
        }

        // Update profile in backend
        await updateProfilePhoto(uploadedUrl);
        
        // Call onChange callback if provided
        onChange?.(uploadedUrl);
        
        setShowPicker(false);
        setImageError(false);
      } catch (err: any) {
        console.error('❌ Avatar upload failed:', err);
        console.error('Error details:', err.message);
      }
    }
  }

  return (
    <View className="bg-craftopia-surface mx-4 mt-3 rounded-xl p-4 border border-craftopia-light">
      <Text className="text-sm font-poppinsBold text-craftopia-textPrimary mb-3">
        Profile Photo
      </Text>

      <View className="items-center">
        <TouchableOpacity 
          onPress={() => setShowPicker(true)} 
          disabled={uploading}
          activeOpacity={0.7}
        >
          <View className="relative">
            <View className="w-20 h-20 bg-craftopia-light rounded-xl items-center justify-center overflow-hidden border-2 border-craftopia-light">
              {uploading ? (
                <ActivityIndicator size="small" color="#3B6E4D" />
              ) : isEmoji || imageError ? (
                <Text className="text-3xl">{isEmoji ? avatar : '🧑‍🎨'}</Text>
              ) : (
                <Image
                  source={{ uri: avatar }}
                  className="w-full h-full"
                  resizeMode="cover"
                  onError={(e) => {
                    console.error('❌ Image load error:', e.nativeEvent.error);
                    setImageError(true);
                  }}
                  onLoad={() => {
                    setImageError(false);
                  }}
                />
              )}
            </View>
            <View className="absolute -bottom-1 -right-1 w-7 h-7 bg-craftopia-primary rounded-full items-center justify-center border-2 border-craftopia-surface">
              <Camera size={12} color="#FFFFFF" />
            </View>
          </View>
        </TouchableOpacity>

        <Text className="text-xs font-nunito text-craftopia-textSecondary mt-2">
          {uploading ? 'Uploading...' : 'Tap to change photo'}
        </Text>
        
        {!isEmoji && !imageError && (
          <Text className="text-xs font-nunito text-craftopia-textSecondary mt-1">
            Current photo loaded
          </Text>
        )}
      </View>

      <Modal
        visible={showPicker}
        transparent
        animationType="slide"
        onRequestClose={() => setShowPicker(false)}
      >
        <View className="flex-1 bg-black/50 justify-end">
          <View className="bg-craftopia-surface rounded-t-xl p-4">
            <View className="w-8 h-1 bg-craftopia-light rounded-full self-center mb-3" />
            <Text className="text-sm font-poppinsBold text-craftopia-textPrimary mb-3 text-center">
              Select Image
            </Text>

            <TouchableOpacity
              className="flex-row items-center p-3 bg-craftopia-light rounded-lg mb-2 active:opacity-70"
              onPress={() => pickImage(true)}
              activeOpacity={0.7}
            >
              <View className="w-8 h-8 bg-craftopia-primary/10 rounded-lg items-center justify-center mr-3">
                <Camera size={16} color="#3B6E4D" />
              </View>
              <Text className="text-sm font-nunito text-craftopia-textPrimary">
                Take Photo
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              className="flex-row items-center p-3 bg-craftopia-light rounded-lg active:opacity-70"
              onPress={() => pickImage(false)}
              activeOpacity={0.7}
            >
              <View className="w-8 h-8 bg-craftopia-primary/10 rounded-lg items-center justify-center mr-3">
                <ImageIcon size={16} color="#3B6E4D" />
              </View>
              <Text className="text-sm font-nunito text-craftopia-textPrimary">
                Choose from Gallery
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              className="mt-3 p-3 bg-craftopia-light rounded-lg active:opacity-70"
              onPress={() => setShowPicker(false)}
              activeOpacity={0.7}
            >
              <Text className="text-center text-sm font-nunito text-craftopia-textSecondary">
                Cancel
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  )
}