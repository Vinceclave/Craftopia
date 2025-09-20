// apps/mobile/src/screens/Feed.tsx
import React, { useState } from 'react';
import { SafeAreaView, ScrollView, View, Text, TouchableOpacity } from 'react-native';
import { Camera, Search, Filter } from 'lucide-react-native';
import { CreatePostScreen } from './feed/CreatePost';

export const FeedScreen = () => {
  const [showCreatePost, setShowCreatePost] = useState(false);

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#F0F0F0' }}>
      {/* Feed Content */}
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 100 }}
      >
        {/* Header */}
        <View style={{ paddingHorizontal: 24, paddingTop: 24, paddingBottom: 16 }}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <View>
              <Text style={{ fontSize: 12, fontWeight: '600', color: '#555', marginBottom: 4 }}>Community Feed</Text>
              <Text style={{ fontSize: 32, fontWeight: '800', color: '#004E98' }}>Discover & Share</Text>
            </View>

            {/* Search & Filter */}
            <View style={{ flexDirection: 'row', gap: 12 }}>
              <TouchableOpacity style={{ width: 48, height: 48, borderRadius: 24, backgroundColor: '#fff', justifyContent: 'center', alignItems: 'center' }}>
                <Search size={24} color="#004E98" />
              </TouchableOpacity>
              <TouchableOpacity style={{ width: 48, height: 48, borderRadius: 24, backgroundColor: '#fff', justifyContent: 'center', alignItems: 'center' }}>
                <Filter size={24} color="#004E98" />
              </TouchableOpacity>
            </View>
          </View>

          {/* Quick Action: Create Post */}
          <View style={{ flexDirection: 'row', marginBottom: 16 }}>
            <TouchableOpacity 
              style={{
                flex: 1,
                flexDirection: 'row',
                justifyContent: 'center',
                alignItems: 'center',
                backgroundColor: '#FF6700',
                padding: 16,
                borderRadius: 24,
              }}
              onPress={() => setShowCreatePost(true)}
            >
              <Camera size={28} color="#fff" />
              <Text style={{ color: '#fff', fontWeight: 'bold', fontSize: 16, marginLeft: 8 }}>
                Create Post
              </Text>
            </TouchableOpacity>
          </View>

          {/* Placeholder Feed Items */}
          {Array.from({ length: 5 }).map((_, i) => (
            <View key={i} style={{ backgroundColor: '#fff', borderRadius: 16, padding: 16, marginBottom: 12 }}>
              <Text style={{ fontSize: 16, fontWeight: '600', color: '#004E98' }}>Post {i + 1}</Text>
              <Text style={{ fontSize: 14, color: '#333', marginTop: 4 }}>This is a sample post content...</Text>
            </View>
          ))}
        </View>
      </ScrollView>

      {/* Floating CreatePostScreen */}
      {showCreatePost && (
        <View style={{ 
          position: 'absolute', 
          top: 0, left: 0, right: 0, bottom: 0, 
          backgroundColor: '#F0F0F0', 
          zIndex: 9999 
        }}>
          <CreatePostScreen />
          <TouchableOpacity
            style={{ position: 'absolute', top: 16, right: 16, padding: 8 }}
            onPress={() => setShowCreatePost(false)}
          >
            <Text style={{ fontSize: 16, color: '#FF6700', fontWeight: 'bold' }}>Close</Text>
          </TouchableOpacity>
        </View>
      )}
    </SafeAreaView>
  );
};
