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
import { X, Camera, Image as ImageIcon, Upload } from 'lucide-react-native'
import { useLocalUpload } from '~/hooks/useUpload'
import { API_BASE_URL } from '~/config/api'

interface ImageUploadPickerProps {
  label?: string | null
  description?: string | null
  value?: string
  onChange: (url?: string) => void
  folder?: 'posts' | 'profiles' | 'crafts' | 'challenges'
  onUploadStart?: () => void
  onUploadComplete?: () => void
  disabled?: boolean
}

export const ImageUploadPicker: React.FC<ImageUploadPickerProps> = ({
  label = 'Proof Image',
  description = 'Upload from camera, gallery',
  value,
  onChange,
  folder = 'posts',
  onUploadStart,
  onUploadComplete,
  disabled = false,
}) => {
  const { uploadToFolder } = useLocalUpload()
  const [uploading, setUploading] = useState(false)
  const [showPicker, setShowPicker] = useState(false)
  const [localImageUri, setLocalImageUri] = useState<string | null>(null)

  const pickImage = async (fromCamera = false) => {
    if (disabled) return

    try {
      const permission = fromCamera
        ? await ImagePicker.requestCameraPermissionsAsync()
        : await ImagePicker.requestMediaLibraryPermissionsAsync()

      if (!permission.granted) {
        console.warn('Permission denied')
        return
      }

      const result = await (fromCamera
        ? ImagePicker.launchCameraAsync({ 
            quality: 0.7,
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
          })
        : ImagePicker.launchImageLibraryAsync({ 
            quality: 0.7,
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
          }))

      if (!result.canceled && result.assets[0]) {
        const asset = result.assets[0]
        
        // ✅ Show preview immediately with local URI
        setLocalImageUri(asset.uri)
        setShowPicker(false)
        
        // ✅ Start upload
        setUploading(true)
        onUploadStart?.()
        
        console.log('📤 Starting upload:', asset.uri)
        
        try {
          const uploadedUrl = await uploadToFolder(asset.uri, folder)
          
          if (uploadedUrl) {
            console.log('✅ Upload successful:', uploadedUrl)
            // ✅ CRITICAL: Only set the value after successful upload
            onChange?.(uploadedUrl)
            setLocalImageUri(null) // Clear local URI after successful upload
          } else {
            console.error('❌ Upload failed: No URL returned')
            setLocalImageUri(null)
            onChange?.(undefined)
          }
        } catch (err) {
          console.error('❌ Upload error:', err)
          setLocalImageUri(null)
          onChange?.(undefined)
        } finally {
          setUploading(false)
          onUploadComplete?.()
        }
      }
    } catch (error) {
      console.error('❌ Image picker error:', error)
      setUploading(false)
      onUploadComplete?.()
      setLocalImageUri(null)
    }
  }

  const handleRemove = () => {
    setLocalImageUri(null)
    onChange?.(undefined)
  }

  // ✅ Determine which image to show
  const displayImageUri = localImageUri || value

  return (
    <View className="flex flex-col gap-2">
      {label && (
        <Text className="text-craftopia-textSecondary text-sm mb-1 font-medium">
          {label}
        </Text>
      )}

      {displayImageUri ? (
        <View className="relative">
          <Image
            source={{ 
              uri: localImageUri 
                ? localImageUri  // Show local image while uploading
                : `${API_BASE_URL}${value}` // Show server image after upload
            }}
            className="w-full h-40 rounded-lg"
            resizeMode="cover"
          />
          
          {/* ✅ Show uploading overlay */}
          {uploading && (
            <View className="absolute inset-0 bg-black/50 rounded-lg items-center justify-center">
              <ActivityIndicator size="large" color="#ffffff" />
              <View className="flex-row items-center mt-2 bg-white/90 px-3 py-1 rounded-full">
                <Upload size={14} color="#16a34a" />
                <Text className="text-xs text-green-600 ml-1 font-medium">
                  Uploading...
                </Text>
              </View>
            </View>
          )}
          
          {/* ✅ Remove button (disabled while uploading) */}
          {!disabled && !uploading && (
            <TouchableOpacity
              className="absolute top-2 right-2 bg-black/50 p-1 rounded-full"
              onPress={handleRemove}
            >
              <X size={18} color="white" />
            </TouchableOpacity>
          )}
        </View>
      ) : (
        <TouchableOpacity
          disabled={uploading || disabled}
          onPress={() => setShowPicker(true)}
          className="flex flex-col items-center justify-center border border-dashed border-craftopia-light rounded-lg p-4 bg-craftopia-surface"
        >
          {uploading ? (
            <>
              <ActivityIndicator color="#16a34a" />
              <Text className="text-craftopia-textSecondary text-xs mt-2">
                Uploading...
              </Text>
            </>
          ) : (
            <>
              <View className="w-8 h-8 bg-craftopia-primary/10 rounded-full items-center justify-center mb-2">
                <ImageIcon size={20} color="#16a34a" />
              </View>
              <Text className="text-craftopia-textPrimary font-medium">
                Add Image
              </Text>
              {description && (
                <Text className="text-craftopia-textSecondary text-xs text-center mt-1">
                  {description}
                </Text>
              )}
            </>
          )}
        </TouchableOpacity>
      )}

      {/* Picker Modal */}
      <Modal
        visible={showPicker && !disabled}
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
              disabled={uploading || disabled}
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
              disabled={uploading || disabled}
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