import { Camera, ImageIcon, X } from 'lucide-react-native'
import React, { useState } from 'react'
import { Image, Text, TouchableOpacity, View, Modal, ActivityIndicator } from 'react-native'
import { useLocalUpload } from '~/hooks/useUpload'

interface ImageUploadPickerProps {
  label?: string
  description: string
  value?: string
  onChange: (url?: string) => void
  folder?: 'posts' | 'profiles' | 'crafts' | 'challenges'
}

export const ImageUploadPicker: React.FC<ImageUploadPickerProps> = ({
  label = 'Proof Image',
  description = 'Upload from camera, gallery',
  value,
  onChange,
  folder = 'challenges',
}) => {
  const [showPicker, setShowPicker] = useState(false)
  const { pickAndUpload, uploading } = useLocalUpload()

  const handleImageUpload = async (type: 'camera' | 'gallery') => {
    const url = await pickAndUpload(type, folder)
    if (url) onChange(url)
    setShowPicker(false)
  }

  return (
    <View className="mb-3">
      {label ? (
        <Text className="text-craftopia-textSecondary text-sm mb-2 font-medium">
          {label}
        </Text>
      ) : null}

      {value ? (
        <View className="relative">
          <Image
            source={{ uri: value }}
            className="w-full h-32 rounded-lg"
            resizeMode="cover"
          />
          <TouchableOpacity
            className="absolute top-2 right-2 bg-black/60 rounded-full p-1"
            onPress={() => onChange(undefined)}
          >
            <X size={12} color="white" />
          </TouchableOpacity>
        </View>
      ) : (
        <TouchableOpacity
          disabled={uploading}
          className="bg-craftopia-light border-2 border-dashed border-craftopia-light rounded-lg p-4 items-center"
          activeOpacity={0.8}
          onPress={() => setShowPicker(true)}
        >
          {uploading ? (
            <ActivityIndicator size="small" color="#004E98" />
          ) : (
            <>
              <View className="w-8 h-8 bg-craftopia-primary/10 rounded-full items-center justify-center mb-1.5">
                <ImageIcon size={16} color="#004E98" />
              </View>
              <Text className="text-craftopia-textPrimary font-medium mb-0.5">
                Add Proof
              </Text>
              <Text className="text-craftopia-textSecondary text-xs text-center">
                {description}
              </Text>
            </>
          )}
        </TouchableOpacity>
      )}

      {/* Picker Modal */}
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
              Add Proof
            </Text>

            <View className="space-y-2">
              <TouchableOpacity
                className="flex-row items-center p-3 bg-craftopia-light rounded-lg"
                onPress={() => handleImageUpload('camera')}
                disabled={uploading}
              >
                <View className="w-8 h-8 bg-craftopia-primary/10 rounded-full items-center justify-center mr-3">
                  <Camera size={14} color="#004E98" />
                </View>
                <View>
                  <Text className="font-medium text-craftopia-textPrimary text-sm">Take Photo</Text>
                  <Text className="text-xs text-craftopia-textSecondary">Use camera to capture</Text>
                </View>
              </TouchableOpacity>

              <TouchableOpacity
                className="flex-row items-center p-3 bg-craftopia-light rounded-lg"
                onPress={() => handleImageUpload('gallery')}
                disabled={uploading}
              >
                <View className="w-8 h-8 bg-craftopia-primary/10 rounded-full items-center justify-center mr-3">
                  <ImageIcon size={14} color="#004E98" />
                </View>
                <View>
                  <Text className="font-medium text-craftopia-textPrimary text-sm">Choose from Gallery</Text>
                  <Text className="text-xs text-craftopia-textSecondary">Select from your photos</Text>
                </View>
              </TouchableOpacity>
            </View>

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
