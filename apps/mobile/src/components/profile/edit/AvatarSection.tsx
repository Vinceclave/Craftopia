import React, { useState } from 'react'
import { View, Text, TouchableOpacity, Image, Modal } from 'react-native'
import { Camera, Image as ImageIcon } from 'lucide-react-native'
import * as ImagePicker from 'expo-image-picker'
import { useLocalUpload } from '~/hooks/useUpload'
import { API_BASE_URL } from '~/config/api'

interface Props {
  avatar?: string
  onChange?: (uri?: string) => void
}

export const AvatarSection: React.FC<Props> = ({ avatar = '🧑‍🎨', onChange }) => {
  const safeAvatar = String(avatar || '🧑‍🎨');
  const isEmoji = safeAvatar.length <= 2 && !safeAvatar.startsWith('http');
  
  const { uploadToFolder } = useLocalUpload()
  const [showPicker, setShowPicker] = useState(false)
  const [uploading, setUploading] = useState(false)

  const pickImage = async (fromCamera = false) => {
    const permission = fromCamera
      ? await ImagePicker.requestCameraPermissionsAsync()
      : await ImagePicker.requestMediaLibraryPermissionsAsync()

    if (!permission.granted) return

    const result = await (fromCamera
      ? ImagePicker.launchCameraAsync({ quality: 0.7 })
      : ImagePicker.launchImageLibraryAsync({ quality: 0.7 }))

    if (!result.canceled) {
      const asset = result.assets[0]
      setUploading(true)
      try {
        const uploadedPath = await uploadToFolder(asset.uri, 'profiles');
        if (!uploadedPath) throw new Error('Upload failed');

        const fullUrl = uploadedPath.startsWith('http') 
          ? uploadedPath 
          : `${API_BASE_URL}${uploadedPath}`;

        if (fullUrl) onChange?.(fullUrl)
        setShowPicker(false)
      } catch (err) {
        console.error('Avatar upload failed:', err)
      } finally {
        setUploading(false)
      }
    }
  }

  return (
    <View className="bg-craftopia-surface mx-4 mt-3 rounded-xl p-4 border border-craftopia-light">
      <Text className="text-sm font-poppinsBold text-craftopia-textPrimary mb-3">
        Profile Photo
      </Text>

      <View className="items-center">
        <TouchableOpacity onPress={() => setShowPicker(true)} disabled={uploading}>
          <View className="relative">
            <View className="w-16 h-16 bg-craftopia-light rounded-xl items-center justify-center overflow-hidden border border-craftopia-light">
              {isEmoji ? (
                <Text className="text-base">{avatar}</Text>
              ) : (
                <Image
                  source={{ uri: avatar }}
                  className="w-full h-full rounded-xl"
                  resizeMode="cover"
                />
              )}
            </View>
            <View className="absolute -bottom-1 -right-1 w-5 h-5 bg-craftopia-primary rounded-full items-center justify-center border-2 border-craftopia-surface">
              <Camera size={10} color="#FFFFFF" />
            </View>
          </View>
        </TouchableOpacity>

        <Text className="text-xs font-nunito text-craftopia-textSecondary mt-2">
          Tap to change photo
        </Text>
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
              className="flex-row items-center p-3 bg-craftopia-light rounded-lg mb-2"
              onPress={() => pickImage(true)}
            >
              <View className="w-8 h-8 bg-craftopia-primary/10 rounded-lg items-center justify-center mr-3">
                <Camera size={16} color="#3B6E4D" />
              </View>
              <Text className="text-sm font-nunito text-craftopia-textPrimary">
                Take Photo
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              className="flex-row items-center p-3 bg-craftopia-light rounded-lg"
              onPress={() => pickImage(false)}
            >
              <View className="w-8 h-8 bg-craftopia-primary/10 rounded-lg items-center justify-center mr-3">
                <ImageIcon size={16} color="#3B6E4D" />
              </View>
              <Text className="text-sm font-nunito text-craftopia-textPrimary">
                Choose from Gallery
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              className="mt-3 p-3 bg-craftopia-light rounded-lg"
              onPress={() => setShowPicker(false)}
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