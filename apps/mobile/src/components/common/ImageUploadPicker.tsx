import React, { useState } from 'react'
import { 
  View, 
  Text, 
  TouchableOpacity, 
  Image, 
  ActivityIndicator, 
  Modal 
} from 'react-native'
import * as ImagePicker from 'expo-image-picker'
import { X, Camera, Image as ImageIcon } from 'lucide-react-native'
import { useLocalUpload } from '~/hooks/useUpload'

interface ImageUploadPickerProps {
  label?: string | null
  description?: string | null
  value?: string
  onChange: (url?: string) => void
  folder?: 'posts' | 'profiles' | 'crafts' | 'challenges'
}

export const ImageUploadPicker: React.FC<ImageUploadPickerProps> = ({
  label = 'Proof Image',
  description = 'Upload from camera, gallery',
  value,
  onChange,
  folder = 'posts',
}) => {
  const { uploadToFolder } = useLocalUpload()
  const [uploading, setUploading] = useState(false)
  const [showPicker, setShowPicker] = useState(false)

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
        const uploadedUrl = await uploadToFolder(asset.uri, folder)
        onChange(uploadedUrl)
      } catch (err) {
        console.error('Upload failed:', err)
      } finally {
        setUploading(false)
        setShowPicker(false)
      }
    }
  }

  return (
    <View className="flex flex-col gap-2">
      {/* Optional Label */}
      {label ? (
        <Text className="text-craftopia-textSecondary text-sm mb-1 font-medium">
          {label}
        </Text>
      ) : null}

      {value ? (
        <View className="relative">
          <Image
            source={{ uri: value }}
            className="w-full h-40 rounded-lg"
            resizeMode="cover"
          />
          <TouchableOpacity
            className="absolute top-2 right-2 bg-black/50 p-1 rounded-full"
            onPress={() => onChange(undefined)}
          >
            <X size={18} color="white" />
          </TouchableOpacity>
        </View>
      ) : (
        <TouchableOpacity
          disabled={uploading}
          onPress={() => setShowPicker(true)}
          className="flex flex-col items-center justify-center border border-dashed border-craftopia-light rounded-lg p-4 bg-craftopia-surface"
        >
          {uploading ? (
            <ActivityIndicator color="#16a34a" />
          ) : (
            <>
              <View className="w-8 h-8 bg-craftopia-primary/10 rounded-full items-center justify-center mb-2">
                <ImageIcon size={20} color="#16a34a" />
              </View>
              <Text className="text-craftopia-textPrimary font-medium">
                Add Image
              </Text>
              {description ? (
                <Text className="text-craftopia-textSecondary text-xs text-center mt-1">
                  {description}
                </Text>
              ) : null}
            </>
          )}
        </TouchableOpacity>
      )}

      {/* Picker Modal */}
      <Modal
        className=''
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
              disabled={uploading}
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
              disabled={uploading}
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
