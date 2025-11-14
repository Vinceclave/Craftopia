// Enhanced ImageUploadPicker with additional features
import React, { useState } from 'react'
import { 
  View, 
  Text, 
  TouchableOpacity, 
  Image, 
  ActivityIndicator, 
  Modal,
  Alert,
  Platform 
} from 'react-native'
import * as ImagePicker from 'expo-image-picker'
import { X, Camera, Image as ImageIcon, Upload, CheckCircle, AlertCircle } from 'lucide-react-native'
import { useLocalUpload } from '~/hooks/useUpload'

interface EnhancedImageUploadPickerProps extends ImageUploadPickerProps {
  maxSizeMB?: number;
  allowedFormats?: string[];
  aspectRatio?: [number, number];
  required?: boolean;
  showPreview?: boolean;
  onError?: (error: string) => void;
}

export const ImageUploadPicker: React.FC<EnhancedImageUploadPickerProps> = ({
  label = 'Upload Image',
  description = 'Take a photo or choose from gallery',
  value,
  onChange,
  folder = 'posts',
  onUploadStart,
  onUploadComplete,
  disabled = false,
  maxSizeMB = 10,
  allowedFormats = ['image/jpeg', 'image/png', 'image/jpg'],
  aspectRatio,
  required = false,
  showPreview = true,
  onError,
}) => {
  const { uploadToFolder } = useLocalUpload()
  const [uploading, setUploading] = useState(false)
  const [showPicker, setShowPicker] = useState(false)
  const [localImageUri, setLocalImageUri] = useState<string | null>(null)
  const [uploadProgress, setUploadProgress] = useState(0)

  const validateImage = (asset: ImagePicker.ImagePickerAsset): boolean => {
    // Check file size
    if (asset.fileSize && asset.fileSize > maxSizeMB * 1024 * 1024) {
      const error = `Image size must be less than ${maxSizeMB}MB`;
      onError?.(error);
      Alert.alert('File Too Large', error);
      return false;
    }

    // Check file type
    if (asset.mimeType && !allowedFormats.includes(asset.mimeType)) {
      const error = `Please select a valid image format (${allowedFormats.join(', ')})`;
      onError?.(error);
      Alert.alert('Invalid Format', error);
      return false;
    }

    return true;
  };

  const pickImage = async (fromCamera = false) => {
    if (disabled) return

    try {
      const permission = fromCamera
        ? await ImagePicker.requestCameraPermissionsAsync()
        : await ImagePicker.requestMediaLibraryPermissionsAsync()

      if (!permission.granted) {
        const error = 'Permission required to access photos';
        onError?.(error);
        Alert.alert('Permission Required', error);
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
        
        if (!validateImage(asset)) return;
        
        setLocalImageUri(asset.uri)
        setShowPicker(false)
        setUploading(true)
        setUploadProgress(0)
        onUploadStart?.()
        
        console.log('📤 Starting upload:', asset.uri)
        
        try {
          // Simulate progress (replace with actual progress if your upload hook supports it)
          const progressInterval = setInterval(() => {
            setUploadProgress(prev => {
              if (prev >= 90) {
                clearInterval(progressInterval);
                return 90;
              }
              return prev + 10;
            });
          }, 200);

          const uploadedUrl = await uploadToFolder(asset.uri, folder)
          
          clearInterval(progressInterval);
          setUploadProgress(100);

          if (uploadedUrl) {
            console.log('✅ Upload successful:', uploadedUrl)
            onChange?.(uploadedUrl)
            setTimeout(() => setLocalImageUri(null), 500); // Keep local image briefly for smooth transition
          } else {
            console.error('❌ Upload failed: No URL returned')
            setLocalImageUri(null)
            onChange?.(undefined)
            onError?.('Upload failed. Please try again.');
          }
        } catch (err) {
          console.error('❌ Upload error:', err)
          setLocalImageUri(null)
          onChange?.(undefined)
          onError?.(err instanceof Error ? err.message : 'Upload failed');
        } finally {
          setUploading(false)
          setUploadProgress(0)
          onUploadComplete?.()
        }
      }
    } catch (error) {
      console.error('❌ Image picker error:', error)
      setUploading(false)
      setUploadProgress(0)
      onComplete?.()
      setLocalImageUri(null)
      onError?.(error instanceof Error ? error.message : 'Image selection failed');
    }
  }

  const handleRemove = () => {
    if (required && value) {
      Alert.alert(
        'Remove Image',
        'This image is required. Are you sure you want to remove it?',
        [
          { text: 'Cancel', style: 'cancel' },
          { 
            text: 'Remove', 
            style: 'destructive',
            onPress: () => {
              setLocalImageUri(null)
              onChange?.(undefined)
            }
          },
        ]
      );
    } else {
      setLocalImageUri(null)
      onChange?.(undefined)
    }
  }

  const displayImageUri = localImageUri || value

  return (
    <View className="mb-4">
      {label && (
        <View className="flex-row items-center mb-2">
          <Text className="text-sm font-semibold" style={{ color: '#1A1A1A' }}>
            {label}
          </Text>
          {required && (
            <Text className="text-red-500 ml-1">*</Text>
          )}
        </View>
      )}

      {displayImageUri && showPreview ? (
        <View className="relative">
          <Image
            source={{ 
              uri: localImageUri 
                ? localImageUri
                : value
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
                <View className="w-32 bg-gray-300 rounded-full h-2 mt-3">
                  <View 
                    className="bg-green-500 h-2 rounded-full" 
                    style={{ width: `${uploadProgress}%` }}
                  />
                </View>
                <Text className="text-white text-sm mt-2">
                  {uploadProgress}%
                </Text>
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
            borderColor: disabled ? '#E5E7EB' : '#D1D5DB',
            backgroundColor: disabled ? '#F9FAFB' : '#F9FAFB',
            height: 200,
            opacity: disabled ? 0.6 : 1,
          }}
          activeOpacity={0.7}
        >
          {uploading ? (
            <View className="flex-1 items-center justify-center">
              <ActivityIndicator color="#374A36" size="large" />
              <Text className="text-sm font-medium mt-3" style={{ color: '#6B7280' }}>
                Uploading... {uploadProgress}%
              </Text>
            </View>
          ) : (
            <View className="flex-1 items-center justify-center p-4">
              <View 
                className="w-16 h-16 rounded-full items-center justify-center mb-3"
                style={{ backgroundColor: 'rgba(55, 74, 54, 0.1)' }}
              >
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
          )}
        </TouchableOpacity>
      )}

      {/* Enhanced Picker Modal */}
      <Modal
        visible={showPicker && !disabled}
        transparent
        animationType="slide"
        onRequestClose={() => setShowPicker(false)}
        statusBarTranslucent
      >
        <View 
          className="flex-1 justify-end" 
          style={{ 
            backgroundColor: 'rgba(0,0,0,0.5)',
            paddingTop: Platform.OS === 'ios' ? 44 : 0,
          }}
        >
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
            
            <Text className="text-lg font-bold text-center mb-2" style={{ color: '#1A1A1A' }}>
              Select Image Source
            </Text>
            
            <Text className="text-sm text-center mb-6" style={{ color: '#6B7280' }}>
              Max {maxSizeMB}MB • {allowedFormats.join(', ')}
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