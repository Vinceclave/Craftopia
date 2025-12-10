// Enhanced ImageUploadPicker - ONLY UPLOADS ON SUBMIT
import React, { useState } from 'react'
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  Modal,
  Platform
} from 'react-native'
import * as ImagePicker from 'expo-image-picker'
import { ModalService } from '~/context/modalContext'
import { X, Camera, Image as ImageIcon, CheckCircle } from 'lucide-react-native'

export interface ImageUploadPickerProps {
  label?: string;
  description?: string;
  value?: string | null;
  onChange?: (value: string | undefined) => void;
  folder?: string;
  disabled?: boolean;
  maxSizeMB?: number;
  allowedFormats?: string[];
  aspectRatio?: [number, number];
  required?: boolean;
  showPreview?: boolean;
  onError?: (error: string) => void;
}

export const ImageUploadPicker: React.FC<ImageUploadPickerProps> = ({
  label = 'Upload Image',
  description = 'Take a photo or choose from gallery',
  value,
  onChange,
  disabled = false,
  maxSizeMB = 10,
  allowedFormats = ['image/jpeg', 'image/png', 'image/jpg'],
  aspectRatio,
  required = false,
  showPreview = true,
  onError,
}) => {
  const [showPicker, setShowPicker] = useState(false)

  const validateImage = (asset: ImagePicker.ImagePickerAsset): boolean => {
    if (asset.fileSize && asset.fileSize > maxSizeMB * 1024 * 1024) {
      const error = `Image size must be less than ${maxSizeMB}MB`
      onError?.(error)
      ModalService.show({
        title: 'File Too Large',
        message: error,
        type: 'warning'
      });
      return false
    }

    if (asset.mimeType && !allowedFormats.includes(asset.mimeType)) {
      const error = `Please select a valid image format (${allowedFormats.join(', ')})`
      onError?.(error)
      ModalService.show({
        title: 'Invalid Format',
        message: error,
        type: 'warning'
      });
      return false
    }

    return true
  }

  const pickImage = async (fromCamera = false) => {
    if (disabled) return

    try {
      const permission = fromCamera
        ? await ImagePicker.requestCameraPermissionsAsync()
        : await ImagePicker.requestMediaLibraryPermissionsAsync()

      if (!permission.granted) {
        const error = 'Permission required to access photos'
        onError?.(error)
        ModalService.show({
          title: 'Permission Required',
          message: error,
          type: 'warning'
        });
        return
      }

      const result = await (fromCamera
        ? ImagePicker.launchCameraAsync({
          quality: 0.8,
          mediaTypes: ImagePicker.MediaTypeOptions.Images,
          aspect: aspectRatio,
          allowsEditing: !!aspectRatio,
        })
        : ImagePicker.launchImageLibraryAsync({
          quality: 0.8,
          mediaTypes: ImagePicker.MediaTypeOptions.Images,
          aspect: aspectRatio,
          allowsEditing: !!aspectRatio,
        }))

      if (!result.canceled && result.assets[0]) {
        const asset = result.assets[0]

        if (!validateImage(asset)) return

        // ✅ ONLY store local URI - NO upload yet!
        onChange?.(asset.uri)
        setShowPicker(false)
      }
    } catch (error) {
      onError?.(error instanceof Error ? error.message : 'Image selection failed')
    }
  }

  const handleRemove = () => {
    if (required && value) {
      ModalService.show({
        title: 'Remove Image',
        message: 'This image is required. Are you sure you want to remove it?',
        type: 'warning',
        confirmText: 'Remove',
        cancelText: 'Cancel',
        onConfirm: () => onChange?.(undefined)
      });
    } else {
      onChange?.(undefined)
    }
  }

  // Check if it's a local file or uploaded URL
  const isLocalFile = value?.startsWith('file://')
  const isUploadedUrl = value && !isLocalFile

  return (
    <View className="mb-4">

      {label && (
        <View className="flex-row items-center mb-2">
          <Text className="text-sm font-semibold" style={{ color: '#1A1A1A' }}>
            {label}
          </Text>
          {required && <Text className="text-red-500 ml-1">*</Text>}
        </View>
      )}

      {value && showPreview ? (
        <View className="relative">
          <Image
            source={{ uri: value }}
            className="w-full rounded-xl"
            style={{ height: 200, backgroundColor: '#F3F4F6' }}
            resizeMode="cover"
          />

          {!disabled && (
            <TouchableOpacity
              className="absolute top-3 right-3 p-2 rounded-full"
              style={{ backgroundColor: 'rgba(0,0,0,0.6)' }}
              onPress={handleRemove}>
              <X size={20} color="white" />
            </TouchableOpacity>
          )}

          {/* Show status badge */}
          {isLocalFile && (
            <View className="absolute top-3 left-3 flex-row items-center px-3 py-1.5 rounded-full"
              style={{ backgroundColor: 'rgba(229, 182, 85, 0.9)' }}>
              <ImageIcon size={14} color="white" />
              <Text className="text-xs font-semibold text-white ml-1">Ready to Upload</Text>
            </View>
          )}

          {isUploadedUrl && (
            <View className="absolute top-3 left-3 flex-row items-center px-3 py-1.5 rounded-full"
              style={{ backgroundColor: 'rgba(74, 124, 89, 0.9)' }}>
              <CheckCircle size={14} color="white" />
              <Text className="text-xs font-semibold text-white ml-1">Uploaded</Text>
            </View>
          )}
        </View>
      ) : (
        <TouchableOpacity
          disabled={disabled}
          onPress={() => setShowPicker(true)}
          className="rounded-xl overflow-hidden border-2 border-dashed"
          style={{
            borderColor: disabled ? '#E5E7EB' : '#D1D5DB',
            backgroundColor: '#F9FAFB',
            height: 200,
            opacity: disabled ? 0.6 : 1,
          }}>

          <View className="flex-1 items-center justify-center p-4">
            <View className="w-16 h-16 rounded-full items-center justify-center mb-3"
              style={{ backgroundColor: 'rgba(55,74,54,0.1)' }}>
              <ImageIcon size={28} color="#374A36" />
            </View>
            <Text className="text-base font-semibold mb-1 text-center" style={{ color: '#1A1A1A' }}>
              {value && !showPreview ? 'Change Image' : 'Add Image'}
            </Text>
            {description && (
              <Text className="text-sm text-center" style={{ color: '#6B7280' }}>
                {description}
              </Text>
            )}
            <Text className="text-xs text-center mt-1" style={{ color: '#9CA3AF' }}>
              Max {maxSizeMB}MB • {allowedFormats.join(', ')}
            </Text>
          </View>
        </TouchableOpacity>
      )}

      {/* Modal Picker */}
      <Modal
        visible={showPicker && !disabled}
        transparent
        animationType="slide"
        onRequestClose={() => setShowPicker(false)}
        statusBarTranslucent>

        <View className="flex-1 justify-end"
          style={{ backgroundColor: 'rgba(0,0,0,0.5)', paddingTop: Platform.OS === 'ios' ? 44 : 0 }}>

          <View className="bg-white rounded-t-3xl p-6">
            <View className="w-12 h-1 rounded-full self-center mb-6"
              style={{ backgroundColor: '#D1D5DB' }} />

            <Text className="text-lg font-bold text-center mb-2" style={{ color: '#1A1A1A' }}>
              Select Image Source
            </Text>

            <Text className="text-sm text-center mb-6" style={{ color: '#6B7280' }}>
              Max {maxSizeMB}MB • {allowedFormats.join(', ')}
            </Text>

            <TouchableOpacity
              className="flex-row items-center p-4 rounded-xl mb-3"
              style={{ backgroundColor: '#F3F4F6' }}
              onPress={() => pickImage(true)}>
              <View className="w-12 h-12 rounded-full items-center justify-center mr-4"
                style={{ backgroundColor: 'rgba(55,74,54,0.1)' }}>
                <Camera size={20} color="#374A36" />
              </View>
              <View className="flex-1">
                <Text className="text-base font-semibold" style={{ color: '#1A1A1A' }}>
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
              onPress={() => pickImage(false)}>
              <View className="w-12 h-12 rounded-full items-center justify-center mr-4"
                style={{ backgroundColor: 'rgba(55,74,54,0.1)' }}>
                <ImageIcon size={20} color="#374A36" />
              </View>
              <View className="flex-1">
                <Text className="text-base font-semibold" style={{ color: '#1A1A1A' }}>
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
              onPress={() => setShowPicker(false)}>
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