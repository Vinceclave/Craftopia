import React, { useState, useEffect, useRef } from 'react';
import { MotiView, MotiText } from 'moti';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Pressable, View, Image, ActivityIndicator, Alert, Dimensions } from 'react-native';
import { Scan, RotateCcw, X } from 'lucide-react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { useIsFocused } from '@react-navigation/native';

const windowWidth = Dimensions.get('window').width;
const cameraPreviewWidth = windowWidth - 40; // 20 padding each side
const cameraPreviewHeight = (cameraPreviewWidth * 4) / 3; // 4:3 ratio

const Craft = () => {
  const [permission, requestPermission] = useCameraPermissions();
  const [facing, setFacing] = useState<'front' | 'back'>('back');
  const [photo, setPhoto] = useState<string | null>(null);
  const [isTaking, setIsTaking] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);

  const cameraRef = useRef<any>(null);
  const isFocused = useIsFocused();

  useEffect(() => {
    if (!permission) requestPermission();
  }, [permission]);

  if (!permission) {
    return (
      <SafeAreaView className="flex-1 bg-cream justify-center items-center">
        <MotiText className="text-darkgray text-center p-4">Requesting camera permission...</MotiText>
      </SafeAreaView>
    );
  }

  if (!permission.granted) {
    return (
      <SafeAreaView className="flex-1 bg-cream justify-center items-center px-6">
        <MotiText className="text-darkgray text-center text-lg mb-4">
          Camera permission is required to scan items.
        </MotiText>
        <Pressable className="p-4 bg-green rounded-xl" onPress={requestPermission}>
          <MotiText className="text-softwhite font-semibold">Grant Permission</MotiText>
        </Pressable>
      </SafeAreaView>
    );
  }

  const takePhoto = async () => {
    if (cameraRef.current && !isTaking) {
      try {
        setIsTaking(true);
        const photoData = await cameraRef.current.takePictureAsync({
          quality: 0.4,
          skipProcessing: true,
        });
        setPhoto(photoData.uri);
      } catch (e) {
        console.error('Error taking photo:', e);
      } finally {
        setIsTaking(false);
      }
    }
  };

  const switchCamera = () => setFacing((prev) => (prev === 'back' ? 'front' : 'back'));

  const generateFromPhoto = async () => {
    if (!photo) return;
    try {
      setIsGenerating(true);

      // Example of sending photo to backend
      // Replace with your API logic here
      const formData = new FormData();
      formData.append('image', {
        uri: photo,
        name: 'photo.jpg',
        type: 'image/jpeg',
      } as any);

      const response = await fetch('http://192.168.1.9:3000/api/images/analyze', {
        method: 'POST',
        body: formData,
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      if (!response.ok) throw new Error('Failed to analyze image');

      const data = await response.json();
      Alert.alert('Analysis Result', data.description || 'No description.');
    } catch (error) {
      console.error('Generate error:', error);
      Alert.alert('Error', 'Failed to generate from photo.');
    } finally {
      setIsGenerating(false);
    }
  };

  const retakePhoto = () => setPhoto(null);

  return (
    <SafeAreaView className="flex-1 bg-cream">
      <MotiView className="p-6 pb-40 min-h-screen justify-between gap-6 items-stretch overflow-hidden">
        <MotiView>
          <MotiText className="text-3xl font-luckiest text-forest mb-2">AI Craft Generator</MotiText>
          <MotiText className="text-base font-openSans text-darkgray">
            Ready to turn recyclables into remarkable creations?
          </MotiText>
        </MotiView>

        {/* Camera preview or photo */}
        <MotiView className="flex-1 bg-black rounded-xl overflow-hidden justify-center items-center">
          {!photo ? (
            isFocused ? (
              <View
                style={{
                  width: cameraPreviewWidth,
                  height: cameraPreviewHeight,
                  borderRadius: 20,
                  overflow: 'hidden',
                }}
              >
                <CameraView
                  style={{ flex: 1 }}
                  facing={facing}
                  ref={cameraRef}
                />
              </View>
            ) : (
              <View
                style={{
                  width: cameraPreviewWidth,
                  height: cameraPreviewHeight,
                  borderRadius: 20,
                  backgroundColor: '#111',
                }}
              />
            )
          ) : (
            <View
              style={{
                width: cameraPreviewWidth,
                height: cameraPreviewHeight,
                borderRadius: 20,
                overflow: 'hidden',
                position: 'relative',
              }}
            >
              <Image
                source={{ uri: photo }}
                style={{ width: '100%', height: '100%', resizeMode: 'cover' }}
              />
              <Pressable
                onPress={retakePhoto}
                className="absolute top-12 right-4 bg-black bg-opacity-60 p-3 rounded-full"
                hitSlop={8}
                style={{ elevation: 20 }}
              >
                <X size={24} color="white" />
              </Pressable>
            </View>
          )}
        </MotiView>

        {/* Controls */}
        {!photo ? (
          <MotiView className="flex justify-between items-center bg-white p-4 rounded-xl shadow-md">
            <MotiText className='mb-4'>
              Tap the button below to scan recyclable items and get craft ideas from AI!
            </MotiText>
            <Pressable
              onPress={takePhoto}
              disabled={isTaking}
              className="w-full bg-green py-4 rounded-full flex-row items-center justify-center shadow-lg"
              style={{ elevation: 10 }}
            >
              {isTaking ? (
                <ActivityIndicator color="white" />
              ) : (
                <MotiView className="flex-row items-center space-x-3 gap-2">
                  <Scan size={28} color="white" />
                  <MotiText className="text-white font-semibold text-lg">
                    Scan Items
                  </MotiText>
                </MotiView>
              )}
            </Pressable>
            {/* placeholder for layout balance */}
            <View style={{ width: 48 }} />
          </MotiView>
        ) : (
          <MotiView className="bg-white p-4 rounded-xl shadow-md">
            <Pressable
              onPress={generateFromPhoto}
              disabled={isGenerating}
              className="bg-green p-4 rounded-xl items-center"
              style={{ opacity: isGenerating ? 0.75 : 1 }}
            >
              {isGenerating ? (
                <ActivityIndicator color="white" />
              ) : (
                <MotiText className="text-softwhite font-semibold text-lg">
                  Generate Craft Ideas
                </MotiText>
              )}
            </Pressable>
          </MotiView>
        )}
      </MotiView>
    </SafeAreaView>
  );
};

export default Craft;
