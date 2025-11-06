// apps/mobile/src/components/common/ImageUploadPicker.tsx
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
import { X, Camera, Image as ImageIcon, Upload, CheckCircle } from 'lucide-react-native'
import { useLocalUpload } from '~/hooks/useUpload'

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
  label = 'Upload Image',
  description = 'Take a photo or choose from gallery',
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
            quality: 0.8,
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
          })
        : ImagePicker.launchImageLibraryAsync({ 
            quality: 0.8,
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
          }))

      if (!result.canceled && result.assets[0]) {
        const asset = result.assets[0]
        
        setLocalImageUri(asset.uri)
        setShowPicker(false)
        setUploading(true)
        onUploadStart?.()
        
        console.log('📤 Starting upload:', asset.uri)
        
        try {
          const uploadedUrl = await uploadToFolder(asset.uri, folder)
          
          if (uploadedUrl) {
            console.log('✅ Upload successful:', uploadedUrl)
            onChange?.(uploadedUrl)
            setLocalImageUri(null)
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

  const displayImageUri = localImageUri || value

  return (
    <View className="mb-4">
      {label && (
        <Text className="text-sm font-semibold mb-2" style={{ color: '#1A1A1A' }}>
          {label}
        </Text>
      )}

      {displayImageUri ? (
        <View className="relative">
          <Image
            source={{ 
              uri: localImageUri 
                ? localImageUri  // Local file (before upload)
                : value          // Pre-signed S3 URL (after upload)
            }}
            className="w-full rounded-xl"
            style={{ 
              height: 200,
              backgroundColor: '#F3F4F6',
            }}
            resizeMode="cover"
          />
          
          {uploading && (
            <View 
              className="absolute inset-0 rounded-xl items-center justify-center"
              style={{ backgroundColor: 'rgba(0,0,0,0.6)' }}
            >
              <View className="items-center">
                <ActivityIndicator size="large" color="#ffffff" />
                <View className="flex-row items-center mt-3 bg-white rounded-full px-4 py-2">
                  <Upload size={16} color="#374A36" />
                  <Text className="text-sm font-semibold ml-2" style={{ color: '#374A36' }}>
                    Uploading...
                  </Text>
                </View>
              </View>
            </View>
          )}
          
          {!disabled && !uploading && (
            <TouchableOpacity
              className="absolute top-3 right-3 p-2 rounded-full"
              style={{ backgroundColor: 'rgba(0,0,0,0.6)' }}
              onPress={handleRemove}
              activeOpacity={0.7}
            >
              <X size={20} color="white" />
            </TouchableOpacity>
          )}

          {!uploading && value && (
            <View 
              className="absolute top-3 left-3 flex-row items-center px-3 py-1.5 rounded-full"
              style={{ backgroundColor: 'rgba(74, 124, 89, 0.9)' }}
            >
              <CheckCircle size={14} color="white" />
              <Text className="text-xs font-semibold text-white ml-1">
                Uploaded
              </Text>
            </View>
          )}
        </View>
      ) : (
        <TouchableOpacity
          disabled={uploading || disabled}
          onPress={() => setShowPicker(true)}
          className="rounded-xl overflow-hidden border-2 border-dashed"
          style={{ 
            borderColor: '#D1D5DB',
            backgroundColor: '#F9FAFB',
            height: 200,
          }}
          activeOpacity={0.7}
        >
          {uploading ? (
            <View className="flex-1 items-center justify-center">
              <ActivityIndicator color="#374A36" size="large" />
              <Text className="text-sm font-medium mt-3" style={{ color: '#6B7280' }}>
                Uploading...
              </Text>
            </View>
          ) : (
            <View className="flex-1 items-center justify-center">
              <View 
                className="w-16 h-16 rounded-full items-center justify-center mb-3"
                style={{ backgroundColor: 'rgba(55, 74, 54, 0.1)' }}
              >
                <ImageIcon size={28} color="#374A36" />
              </View>
              <Text className="text-base font-semibold mb-1" style={{ color: '#1A1A1A' }}>
                Add Image
              </Text>
              {description && (
                <Text className="text-sm text-center px-6" style={{ color: '#6B7280' }}>
                  {description}
                </Text>
              )}
            </View>
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
        <View className="flex-1 justify-end" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <View 
            className="bg-white rounded-t-3xl p-6"
            style={{
              borderTopLeftRadius: 24,
              borderTopRightRadius: 24,
            }}
          >
            <View 
              className="w-12 h-1 rounded-full self-center mb-6" 
              style={{ backgroundColor: '#D1D5DB' }}
            />
            
            <Text className="text-lg font-bold text-center mb-6" style={{ color: '#1A1A1A' }}>
              Select Image Source
            </Text>

            <TouchableOpacity
              className="flex-row items-center p-4 rounded-xl mb-3"
              style={{ backgroundColor: '#F3F4F6' }}
              onPress={() => pickImage(true)}
              disabled={uploading || disabled}
              activeOpacity={0.7}
            >
              <View 
                className="w-12 h-12 rounded-full items-center justify-center mr-4"
                style={{ backgroundColor: 'rgba(55, 74, 54, 0.1)' }}
              >
                <Camera size={20} color="#374A36" />
              </View>
              <View className="flex-1">
                <Text className="text-base font-semibold mb-0.5" style={{ color: '#1A1A1A' }}>
                  Take Photo
                </Text>
                <Text className="text-sm" style={{ color: '#6B7280' }}>
                  Use your camera
                </Text>
              </View>
            </TouchableOpacity>

            <TouchableOpacity
              className="flex-row items-center p-4 rounded-xl mb-4"
              style={{ backgroundColor: '#F3F4F6' }}
              onPress={() => pickImage(false)}
              disabled={uploading || disabled}
              activeOpacity={0.7}
            >
              <View 
                className="w-12 h-12 rounded-full items-center justify-center mr-4"
                style={{ backgroundColor: 'rgba(55, 74, 54, 0.1)' }}
              >
                <ImageIcon size={20} color="#374A36" />
              </View>
              <View className="flex-1">
                <Text className="text-base font-semibold mb-0.5" style={{ color: '#1A1A1A' }}>
                  Choose from Gallery
                </Text>
                <Text className="text-sm" style={{ color: '#6B7280' }}>
                  Pick from your photos
                </Text>
              </View>
            </TouchableOpacity>

            <TouchableOpacity
              className="p-4 rounded-xl border-2"
              style={{ borderColor: '#E5E7EB' }}
              onPress={() => setShowPicker(false)}
              activeOpacity={0.7}
            >
              <Text className="text-center font-semibold" style={{ color: '#6B7280' }}>
                Cancel
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  )
}