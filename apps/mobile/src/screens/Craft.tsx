// apps/mobile/src/screens/Craft.tsx
import React, { useState } from 'react';
import { SafeAreaView, Text, View, ScrollView, TouchableOpacity, TextInput } from 'react-native';
import { Search, Filter, Plus, Clock, Star, Bookmark, Heart, Hammer, Sparkles, TrendingUp } from 'lucide-react-native';

export const CraftScreen = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');

  const categories = ['All', 'Bottles', 'Cans', 'Paper', 'Cardboard', 'Fabric'];
  
  const crafts = [
    {
      id: 1,
      title: 'Bottle Planter',
      description: 'Transform plastic bottles into beautiful planters',
      materials: ['Plastic Bottle', 'Soil', 'Paint'],
      difficulty: 'Easy',
      time: '30 min',
      rating: 4.8,
      likes: 234,
      image: '🌱',
      color: '#7C9885'
    },
    {
      id: 2,
      title: 'Can Wind Chime',
      description: 'Create melodious chimes from aluminum cans',
      materials: ['Aluminum Cans', 'String', 'Beads'],
      difficulty: 'Medium',
      time: '45 min',
      rating: 4.6,
      likes: 189,
      image: '🎵',
      color: '#00A896'
    },
    {
      id: 3,
      title: 'Paper Wall Art',
      description: 'Amazing wall decorations from old magazines',
      materials: ['Old Magazines', 'Glue', 'Frame'],
      difficulty: 'Easy',
      time: '20 min',
      rating: 4.9,
      likes: 312,
      image: '🎨',
      color: '#004E98'
    },
    {
      id: 4,
      title: 'Cardboard Castle',
      description: 'Build an epic castle for kids from cardboard',
      materials: ['Cardboard Boxes', 'Paint', 'Scissors'],
      difficulty: 'Hard',
      time: '2 hours',
      rating: 4.7,
      likes: 156,
      image: '🏰',
      color: '#FF6700'
    },
  ];

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'Easy': return { text: '#7C9885', bg: '#7C988515' };
      case 'Medium': return { text: '#FF6700', bg: '#FF670015' };
      case 'Hard': return { text: '#004E98', bg: '#004E9815' };
      default: return { text: '#333333', bg: '#33333315' };
    }
  };

  return (
    <SafeAreaView className="flex-1" style={{ backgroundColor: '#F0F0F0' }}>
      {/* Floating Background Shapes */}
      <View className="absolute inset-0 overflow-hidden">
        <View 
          className="absolute -top-24 -right-24 w-48 h-48 rounded-full opacity-4" 
          style={{ backgroundColor: '#FF6700' }} 
        />
        <View 
          className="absolute top-80 -left-20 w-36 h-36 rounded-full opacity-3" 
          style={{ backgroundColor: '#7C9885' }} 
        />
      </View>

      <ScrollView 
        className="flex-1 relative z-10" 
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 120 }}
      >
        {/* Header */}
        <View className="px-6 pt-12 pb-8">
          <View className="flex-row justify-between items-start mb-6">
            <View className="flex-1">
              <View className="flex-row items-center mb-2">
                <View 
                  className="w-2 h-2 rounded-full mr-3"
                  style={{ backgroundColor: '#FF6700' }}
                />
                <Text className="text-sm font-semibold tracking-wider uppercase" style={{ color: '#333333' }}>
                  Craft Studio
                </Text>
              </View>
              <Text className="text-4xl font-black tracking-tight mb-3" style={{ color: '#004E98' }}>
                Create & Craft
              </Text>
              <View className="flex-row items-center">
                <Sparkles size={18} color="#FF6700" />
                <Text className="text-lg font-semibold ml-2" style={{ color: '#333333' }}>
                  Turn waste into wonder
                </Text>
              </View>
            </View>
            <TouchableOpacity 
              className="w-14 h-14 rounded-2xl items-center justify-center"
              style={{ 
                backgroundColor: '#FF6700',
                shadowColor: '#FF6700',
                shadowOffset: { width: 0, height: 6 },
                shadowOpacity: 0.3,
                shadowRadius: 12
              }}
            >
              <Plus color="white" size={24} strokeWidth={2.5} />
            </TouchableOpacity>
          </View>
        </View>

        {/* Search Bar */}
        <View className="px-6 mb-8">
          <View className="flex-row space-x-4">
            <View 
              className="flex-1 bg-white rounded-2xl px-5 py-4 flex-row items-center"
              style={{ 
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.06,
                shadowRadius: 12,
                borderWidth: 1,
                borderColor: 'rgba(0, 0, 0, 0.03)'
              }}
            >
              <Search color="#333333" size={20} />
              <TextInput
                placeholder="Search craft ideas..."
                value={searchQuery}
                onChangeText={setSearchQuery}
                className="flex-1 ml-3 text-base font-medium"
                style={{ color: '#004E98' }}
                placeholderTextColor="#333333"
              />
            </View>
            <TouchableOpacity 
              className="bg-white rounded-2xl w-14 h-14 items-center justify-center"
              style={{ 
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.06,
                shadowRadius: 12,
                borderWidth: 1,
                borderColor: 'rgba(0, 0, 0, 0.03)'
              }}
            >
              <Filter color="#004E98" size={20} />
            </TouchableOpacity>
          </View>
        </View>

        {/* Categories */}
        <View className="mb-8">
          <View className="flex-row items-center px-6 mb-4">
            <View 
              className="w-8 h-8 rounded-xl items-center justify-center mr-3"
              style={{ backgroundColor: '#00A89612' }}
            >
              <TrendingUp size={16} color="#00A896" />
            </View>
            <Text className="text-xl font-black" style={{ color: '#004E98' }}>
              Categories
            </Text>
          </View>
          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ paddingHorizontal: 24 }}
          >
            {categories.map((category, index) => (
              <TouchableOpacity
                key={index}
                onPress={() => setSelectedCategory(category)}
                className="mr-4 px-6 py-3 rounded-2xl"
                style={{
                  backgroundColor: selectedCategory === category ? '#004E98' : 'white',
                  shadowColor: selectedCategory === category ? '#004E98' : '#000',
                  shadowOffset: { width: 0, height: selectedCategory === category ? 6 : 2 },
                  shadowOpacity: selectedCategory === category ? 0.2 : 0.04,
                  shadowRadius: selectedCategory === category ? 12 : 8,
                  borderWidth: selectedCategory === category ? 0 : 1,
                  borderColor: selectedCategory === category ? 'transparent' : 'rgba(0, 0, 0, 0.03)'
                }}
              >
                <Text 
                  className="font-bold text-base"
                  style={{ color: selectedCategory === category ? 'white' : '#004E98' }}
                >
                  {category}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Featured Craft */}
        <View className="px-6 mb-8">
          <View className="flex-row items-center mb-4">
            <View 
              className="w-8 h-8 rounded-xl items-center justify-center mr-3"
              style={{ backgroundColor: '#FF670012' }}
            >
              <Star size={16} color="#FF6700" />
            </View>
            <Text className="text-xl font-black" style={{ color: '#004E98' }}>
              Featured Today
            </Text>
          </View>
          <TouchableOpacity 
            className="rounded-2xl p-8 relative overflow-hidden"
            style={{ 
              backgroundColor: '#FF6700',
              shadowColor: '#FF6700',
              shadowOffset: { width: 0, height: 12 },
              shadowOpacity: 0.3,
              shadowRadius: 24
            }}
          >
            {/* Decorative elements */}
            <View className="absolute top-0 right-0 w-32 h-32 rounded-full bg-white opacity-10 transform translate-x-12 -translate-y-12" />
            <View className="absolute bottom-0 left-0 w-24 h-24 rounded-full bg-white opacity-5 transform -translate-x-8 translate-y-8" />
            
            <View className="flex-row items-center justify-between mb-6">
              <View className="flex-1">
                <Text className="text-white font-black text-3xl mb-2">🎭 Mask Making</Text>
                <Text className="text-white text-lg opacity-90 font-semibold">From cardboard & paint</Text>
              </View>
              <View className="bg-white bg-opacity-25 px-4 py-2 rounded-2xl">
                <Text className="text-white font-black text-sm">NEW</Text>
              </View>
            </View>
            <TouchableOpacity className="bg-white bg-opacity-20 rounded-2xl py-4 px-6 border border-white border-opacity-30">
              <View className="flex-row items-center justify-center">
                <Hammer size={20} color="white" />
                <Text className="text-white font-black text-lg ml-3">Start Crafting</Text>
              </View>
            </TouchableOpacity>
          </TouchableOpacity>
        </View>

        {/* Craft Grid */}
        <View className="px-6">
          <View className="flex-row justify-between items-center mb-6">
            <View className="flex-row items-center">
              <View 
                className="w-8 h-8 rounded-xl items-center justify-center mr-3"
                style={{ backgroundColor: '#7C988512' }}
              >
                <Hammer size={16} color="#7C9885" />
              </View>
              <Text className="text-xl font-black" style={{ color: '#004E98' }}>
                Popular Crafts
              </Text>
            </View>
            <TouchableOpacity className="flex-row items-center">
              <Text className="text-base font-bold mr-2" style={{ color: '#00A896' }}>
                See All
              </Text>
              <TrendingUp size={16} color="#00A896" />
            </TouchableOpacity>
          </View>
          
          <View className="flex-row flex-wrap justify-between">
            {crafts.map((craft, index) => (
              <TouchableOpacity
                key={craft.id}
                className="w-[48%] mb-6"
                activeOpacity={0.8}
              >
                <View 
                  className="bg-white rounded-2xl overflow-hidden"
                  style={{ 
                    shadowColor: '#000',
                    shadowOffset: { width: 0, height: 6 },
                    shadowOpacity: 0.08,
                    shadowRadius: 16,
                    borderWidth: 1,
                    borderColor: 'rgba(0, 0, 0, 0.03)'
                  }}
                >
                  {/* Card Header */}
                  <View 
                    className="p-6 items-center relative"
                    style={{ backgroundColor: `${craft.color}12` }}
                  >
                    <View 
                      className="absolute top-0 left-0 right-0 h-1"
                      style={{ backgroundColor: craft.color }}
                    />
                    <Text className="text-4xl mb-3">{craft.image}</Text>
                    <TouchableOpacity 
                      className="absolute top-4 right-4 p-2 rounded-xl"
                      style={{ backgroundColor: `${craft.color}20` }}
                    >
                      <Heart color={craft.color} size={16} />
                    </TouchableOpacity>
                  </View>
                  
                  {/* Card Content */}
                  <View className="p-5">
                    <Text className="font-black text-lg mb-2 leading-tight" style={{ color: '#004E98' }}>
                      {craft.title}
                    </Text>
                    <Text className="text-sm mb-4 leading-relaxed" style={{ color: '#333333' }}>
                      {craft.description}
                    </Text>
                    
                    {/* Meta Info */}
                    <View className="flex-row items-center justify-between mb-4">
                      <View className="flex-row items-center">
                        <Clock color="#333333" size={14} />
                        <Text className="text-sm font-medium ml-2" style={{ color: '#333333' }}>
                          {craft.time}
                        </Text>
                      </View>
                      <View className="flex-row items-center">
                        <Star color="#FF6700" size={14} fill="#FF6700" />
                        <Text className="text-sm font-bold ml-2" style={{ color: '#333333' }}>
                          {craft.rating}
                        </Text>
                      </View>
                    </View>
                    
                    {/* Difficulty Badge */}
                    <View className="flex-row justify-between items-center">
                      <View 
                        className="px-3 py-2 rounded-xl"
                        style={{ backgroundColor: getDifficultyColor(craft.difficulty).bg }}
                      >
                        <Text 
                          className="text-xs font-bold"
                          style={{ color: getDifficultyColor(craft.difficulty).text }}
                        >
                          {craft.difficulty}
                        </Text>
                      </View>
                      <View className="flex-row items-center">
                        <Heart color="#FF6700" size={14} />
                        <Text className="text-sm font-medium ml-2" style={{ color: '#333333' }}>
                          {craft.likes}
                        </Text>
                      </View>
                    </View>
                  </View>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Pro Tip */}
        <View className="px-6 mt-6">
          <View 
            className="rounded-2xl p-6 relative overflow-hidden"
            style={{ 
              backgroundColor: '#00A89615',
              borderWidth: 1,
              borderColor: '#00A89625'
            }}
          >
            <View 
              className="absolute top-0 left-0 right-0 h-1"
              style={{ backgroundColor: '#00A896' }}
            />
            <View className="flex-row items-start">
              <View 
                className="w-12 h-12 rounded-2xl items-center justify-center mr-4"
                style={{ backgroundColor: '#00A89620' }}
              >
                <Text className="text-2xl">💡</Text>
              </View>
              <View className="flex-1">
                <Text className="font-black text-lg mb-2" style={{ color: '#004E98' }}>
                  Pro Tip
                </Text>
                <Text className="font-medium leading-relaxed" style={{ color: '#333333' }}>
                  Always clean materials thoroughly before crafting. This ensures better adhesion and a professional finish!
                </Text>
              </View>
            </View>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};