import React, { useState } from 'react';
import { SafeAreaView, ScrollView, View, Text, TextInput, TouchableOpacity, KeyboardAvoidingView, Platform } from 'react-native';
import { Camera, Heart, ChevronLeft } from 'lucide-react-native';
import { useNavigation } from '@react-navigation/native';

export const CreatePostScreen = () => {
  const navigation = useNavigation();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('Eco');

  const handleSubmit = () => {
    console.log({ title, description, category });
    // Call API here
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#F0F0F0' }}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        {/* Back Button */}
        <TouchableOpacity
          style={{
            position: 'absolute',
            top: 16,
            left: 16,
            width: 40,
            height: 40,
            borderRadius: 20,
            backgroundColor: 'white',
            justifyContent: 'center',
            alignItems: 'center',
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.1,
            shadowRadius: 4,
            zIndex: 10,
          }}
          onPress={() => navigation.goBack()}
        >
          <ChevronLeft size={24} color="#004E98" />
        </TouchableOpacity>

        {/* Scrollable Form */}
        <ScrollView
          contentContainerStyle={{ padding: 20, paddingTop: 60, paddingBottom: 120 }}
        >
          <Text style={{ fontSize: 22, fontWeight: 'bold', color: '#004E98', marginBottom: 20 }}>
            Create Post
          </Text>

          {/* Title */}
          <Text style={{ fontSize: 14, fontWeight: '600', color: '#333', marginBottom: 6 }}>Title</Text>
          <TextInput
            placeholder="Enter post title"
            value={title}
            onChangeText={setTitle}
            style={{
              backgroundColor: '#fff',
              borderRadius: 12,
              padding: 12,
              fontSize: 16,
              color: '#004E98',
              marginBottom: 16,
            }}
          />

          {/* Description */}
          <Text style={{ fontSize: 14, fontWeight: '600', color: '#333', marginBottom: 6 }}>Description</Text>
          <TextInput
            placeholder="Write something..."
            value={description}
            onChangeText={setDescription}
            multiline
            numberOfLines={4}
            style={{
              backgroundColor: '#fff',
              borderRadius: 12,
              padding: 12,
              fontSize: 16,
              color: '#004E98',
              textAlignVertical: 'top',
              marginBottom: 16,
            }}
          />

          {/* Add Image */}
          <TouchableOpacity
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              backgroundColor: '#fff',
              borderRadius: 12,
              padding: 12,
              marginBottom: 16,
              shadowColor: '#000',
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.05,
              shadowRadius: 4,
            }}
          >
            <Camera size={20} color="#FF6700" />
            <Text style={{ fontSize: 16, fontWeight: '600', color: '#004E98', marginLeft: 8 }}>
              Add Image
            </Text>
          </TouchableOpacity>

          {/* Category */}
          <Text style={{ fontSize: 14, fontWeight: '600', color: '#333', marginBottom: 6 }}>Category</Text>
          <View style={{ flexDirection: 'row', gap: 8, marginBottom: 16 }}>
            {['Eco', 'Craft', 'Social'].map((cat) => (
              <TouchableOpacity
                key={cat}
                onPress={() => setCategory(cat)}
                style={{
                  paddingVertical: 6,
                  paddingHorizontal: 12,
                  borderRadius: 20,
                  backgroundColor: category === cat ? '#FF6700' : '#fff',
                  borderWidth: 1,
                  borderColor: category === cat ? '#FF6700' : '#ccc',
                }}
              >
                <Text style={{ color: category === cat ? '#fff' : '#004E98', fontWeight: '600' }}>
                  {cat}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </ScrollView>

        {/* Floating Submit Button */}
        <TouchableOpacity
          onPress={handleSubmit}
          style={{
            position: 'absolute',
            bottom: 24,
            left: 20,
            right: 20,
            flexDirection: 'row',
            justifyContent: 'center',
            alignItems: 'center',
            backgroundColor: '#FF6700',
            borderRadius: 24,
            paddingVertical: 14,
            shadowColor: '#FF6700',
            shadowOffset: { width: 0, height: 6 },
            shadowOpacity: 0.3,
            shadowRadius: 12,
            zIndex: 10,
          }}
        >
          <Heart size={20} color="#fff" />
          <Text style={{ color: '#fff', fontWeight: 'bold', fontSize: 16, marginLeft: 8 }}>
            Create Post
          </Text>
        </TouchableOpacity>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};
