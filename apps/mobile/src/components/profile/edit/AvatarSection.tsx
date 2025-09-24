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

// ✅ Replace with your server's public URL

export const AvatarSection: React.FC<Props> = ({ avatar = '🧑‍🎨', onChange }) => {
  const safeAvatar = avatar || '🧑‍🎨';
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
        // Upload and get relative path
        const uploadedPath = await uploadToFolder(asset.uri, 'profiles')
        console.log('✅ Avatar uploaded (relative path):', uploadedPath)

        // Convert to absolute URL
        const fullUrl = uploadedPath.startsWith('http') 
          ? uploadedPath 
          : `${API_BASE_URL}${uploadedPath}`

        console.log('✅ Avatar full URL:', fullUrl)

        if (fullUrl) onChange?.(fullUrl)
        setShowPicker(false)
      } catch (err) {
        console.error('❌ Avatar upload failed:', err)
      } finally {
        setUploading(false)
      }
    }
  }

  return (
    <View className="bg-craftopia-surface rounded-2xl p-6 border border-craftopia-light shadow mt-4">
      <Text className="text-lg font-bold text-craftopia-textPrimary mb-4">
        Profile Photo
      </Text>

      <View className="items-center">
        <TouchableOpacity onPress={() => setShowPicker(true)} disabled={uploading}>
          <View className="relative">
            <View className="w-24 h-24 bg-craftopia-light rounded-2xl items-center justify-center overflow-hidden">
              {isEmoji ? (
                <Text className="text-xl">{avatar}</Text>
              ) : (
                <Image
                  source={{ uri: avatar }}
                  className="w-full h-full rounded-2xl"
                  resizeMode="cover"
                />
              )}
            </View>
            <View className="absolute -bottom-1 -right-1 w-8 h-8 bg-craftopia-primary rounded-full items-center justify-center">
              <Camera size={14} color="white" />
            </View>
          </View>
        </TouchableOpacity>

        <Text className="text-sm text-craftopia-textSecondary mt-3">
          Tap to change photo
        </Text>

        {avatar && avatar.startsWith('file://') && (
          <Text className="text-xs text-blue-600 mt-1">
            New image selected (not saved yet)
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
            <View className="w-8 h-0.5 bg-craftopia-light rounded-full self-center mb-4" />
            <Text className="text-sm font-semibold text-craftopia-textPrimary mb-4 text-center">
              Select Image
            </Text>

            <TouchableOpacity
              className="flex-row items-center p-3 bg-craftopia-light rounded-lg mb-2"
              onPress={() => pickImage(true)}
            >
              <View className="w-8 h-8 bg-craftopia-primary/10 rounded-full items-center justify-center mr-3">
                <Camera size={16} color="#16a34a" />
              </View>
              <Text className="text-craftopia-textPrimary font-medium text-sm">
                Take Photo
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              className="flex-row items-center p-3 bg-craftopia-light rounded-lg"
              onPress={() => pickImage(false)}
            >
              <View className="w-8 h-8 bg-craftopia-primary/10 rounded-full items-center justify-center mr-3">
                <ImageIcon size={16} color="#16a34a" />
              </View>
              <Text className="text-craftopia-textPrimary font-medium text-sm">
                Choose from Gallery
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              className="mt-4 p-3 bg-craftopia-light rounded-lg"
              onPress={() => setShowPicker(false)}
            >
              <Text className="text-center font-medium text-craftopia-textSecondary text-sm">
                Cancel
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  )
}
