import React, { useEffect, useState } from 'react'
import {
  View,
  Text,
  TouchableOpacity,
  TextInput,
  Image,
  FlatList,
  Alert,
  Modal,
  ScrollView,
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import * as ImagePicker from 'expo-image-picker'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { useNavigation } from '@react-navigation/native'

type SavedItem = {
  id: string
  uri?: string
  manualText?: string
  createdAt: number
}

const STORAGE_KEY = '@craftopia_saved_items_v1'

export const CraftScreen: React.FC = () => {
  const navigation = useNavigation<any>()
  const [manualModalVisible, setManualModalVisible] = useState(false)
  const [manualText, setManualText] = useState('')
  const [previewPhoto, setPreviewPhoto] = useState<string | null>(null)
  const [recentItems, setRecentItems] = useState<SavedItem[]>([])
  const [loadingPermission, setLoadingPermission] = useState(false)

  useEffect(() => {
    loadSavedItems()
  }, [])

  const loadSavedItems = async () => {
    try {
      const raw = await AsyncStorage.getItem(STORAGE_KEY)
      setRecentItems(raw ? JSON.parse(raw) : [])
    } catch (err) {
      console.warn('Failed to load saved items', err)
    }
  }

  const saveItem = async (item: SavedItem) => {
    try {
      const updated = [item, ...recentItems].slice(0, 20)
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updated))
      setRecentItems(updated)
    } catch (err) {
      console.warn('Failed to save item', err)
    }
  }

  const deleteItem = async (id: string) => {
    Alert.alert('Delete', 'Delete this saved item?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          const filtered = recentItems.filter((i) => i.id !== id)
          await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(filtered))
          setRecentItems(filtered)
        },
      },
    ])
  }

  const pickImageFromCamera = async () => {
    setLoadingPermission(true)
    const permission = await ImagePicker.requestCameraPermissionsAsync()
    setLoadingPermission(false)
    if (!permission.granted)
      return Alert.alert('Permission required', 'Camera permission is required.')
    const result = await ImagePicker.launchCameraAsync({ quality: 0.8, allowsEditing: true })
    if (!result.cancelled) handleImageResult(result.uri)
  }

  const pickImageFromGallery = async () => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync()
    if (!permission.granted)
      return Alert.alert('Permission required', 'Gallery permission is required.')
    const result = await ImagePicker.launchImageLibraryAsync({ quality: 0.8, allowsEditing: true })
    if (!result.cancelled) handleImageResult(result.uri)
  }

  const handleImageResult = (uri: string) => {
    setPreviewPhoto(uri)
    Alert.alert('Photo ready', 'Use this photo to generate a craft idea?', [
      { text: 'Cancel', style: 'cancel', onPress: () => setPreviewPhoto(null) },
      { text: 'Use Photo', onPress: () => processAndSavePhoto(uri) },
    ])
  }

  const processAndSavePhoto = async (uri: string) => {
    const newItem: SavedItem = { id: `${Date.now()}`, uri, createdAt: Date.now() }
    await saveItem(newItem)
    Alert.alert('Saved', 'Photo saved to your library. Craft idea will be generated.')
    setPreviewPhoto(null)
  }

  const handleManualSubmit = async () => {
    const trimmed = manualText.trim()
    if (!trimmed) return Alert.alert('Enter items', 'Please type the items you want to use.')
    const newItem: SavedItem = { id: `${Date.now()}`, manualText: trimmed, createdAt: Date.now() }
    await saveItem(newItem)
    setManualText('')
    setManualModalVisible(false)
    Alert.alert('Saved', 'Your items have been added. Craft idea will be generated.')
  }

  const renderSavedItem = ({ item }: { item: SavedItem }) => (
    <TouchableOpacity
      className="w-30 mr-3 rounded-xl overflow-hidden bg-white p-2 items-center relative"
      onPress={() =>
        navigation.navigate('CraftDetails', {
          craftTitle: item.manualText || 'Your Craft',
          materials: item.manualText ? item.manualText.split(',').map((t) => t.trim()) : [],
          steps: ['Step 1: Start crafting', 'Step 2: Finish crafting'],
        })
      }
    >
      {item.uri ? (
        <Image source={{ uri: item.uri }} className="w-24 h-20 rounded-lg" />
      ) : (
        <View className="w-24 h-20 rounded-lg bg-[#FFF9F0] items-center justify-center">
          <Text className="text-[#2B4A2F] font-bold">{item.manualText?.split(',')[0] ?? 'Item'}</Text>
        </View>
      )}
      <Text className="mt-1 text-xs text-[#3B3B3B] text-center">
        {item.manualText ? item.manualText : new Date(item.createdAt).toLocaleDateString()}
      </Text>
      <TouchableOpacity
        onPress={() => deleteItem(item.id)}
        className="absolute top-1 right-1"
      >
        <Text className="text-xs">🗑</Text>
      </TouchableOpacity>
    </TouchableOpacity>
  )

  return (
    <SafeAreaView className="flex-1 bg-[#FFF9F0] px-5 pt-4">
      <ScrollView>
        <View className="mb-3">
          <Text className="text-2xl font-bold text-[#2B4A2F]">Start a Craft</Text>
          <Text className="text-sm text-[#3B3B3B] mt-1">
            Take a photo, upload, or type items to generate ideas.
          </Text>
        </View>

        <View className="bg-white rounded-xl p-4 shadow-sm shadow-black/6">
          <Text className="text-lg font-bold text-[#2B4A2F] mb-3">Add your recyclables</Text>

          <TouchableOpacity
            className={`bg-[#6CAC73] py-3 rounded-xl items-center mb-3 ${loadingPermission ? 'opacity-70' : ''}`}
            onPress={pickImageFromCamera}
          >
            <Text className="text-white font-bold text-base">📸 Take a Photo</Text>
          </TouchableOpacity>

          <TouchableOpacity
            className="bg-white border border-[#BABABA] py-3 rounded-xl items-center mb-3"
            onPress={pickImageFromGallery}
          >
            <Text className="text-[#2B4A2F] font-bold text-sm">🖼 Upload from Gallery</Text>
          </TouchableOpacity>

          <TouchableOpacity className="py-2 rounded items-center" onPress={() => setManualModalVisible(true)}>
            <Text className="text-[#3B3B3B] text-sm underline">✏️ Type Items Manually</Text>
          </TouchableOpacity>

          <Text className="mt-2 text-xs text-[#3B3B3B]">
            Your photos are stored securely. You can delete them anytime.
          </Text>
        </View>

        {recentItems.length > 0 && (
          <View className="mt-4">
            <Text className="text-base font-bold text-[#2B4A2F] mb-2 ml-1">Your recent items</Text>
            <FlatList
              data={recentItems}
              keyExtractor={(i) => i.id}
              horizontal
              showsHorizontalScrollIndicator={false}
              renderItem={renderSavedItem}
              contentContainerStyle={{ paddingHorizontal: 12 }}
            />
          </View>
        )}

        {/* Manual input modal */}
        <Modal visible={manualModalVisible} animationType="slide" transparent>
          <View className="flex-1 bg-black/40 items-center justify-center px-5">
            <View className="w-full bg-white rounded-xl p-4">
              <Text className="text-lg font-bold text-[#2B4A2F]">Describe your items</Text>
              <Text className="text-xs text-[#3B3B3B] mt-1">E.g. "Plastic bottle, yarn, cardboard"</Text>
              <TextInput
                value={manualText}
                onChangeText={setManualText}
                placeholder="e.g. plastic bottle, fabric, tape"
                className="mt-3 min-h-[80px] border border-[#E6E6E6] rounded-lg p-3 text-black"
                multiline
              />
              <View className="mt-3 flex-row justify-between">
                <TouchableOpacity
                  className="py-3 px-4 rounded-lg bg-white min-w-[120px] items-center"
                  onPress={() => { setManualModalVisible(false); setManualText('') }}
                >
                  <Text className="text-[#3B3B3B]">Cancel</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  className="py-3 px-4 rounded-lg bg-[#6CAC73] min-w-[120px] items-center"
                  onPress={handleManualSubmit}
                >
                  <Text className="text-white">Save & Generate</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>
      </ScrollView>
    </SafeAreaView>
  )
}

export default CraftScreen
