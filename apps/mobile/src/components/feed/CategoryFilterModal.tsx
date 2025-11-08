// apps/mobile/src/components/feed/CategoryFilterModal.tsx - CLEAN REDESIGN WITH LUCIDE
import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Modal,
} from 'react-native';
import { X, Check, Grid, Users, BookOpen, Trophy, ShoppingBag, MoreHorizontal } from 'lucide-react-native';

interface Category {
  id: string;
  label: string;
  icon: string;
}

interface CategoryFilterModalProps {
  visible: boolean;
  categories: Category[];
  selectedCategory: string;
  onSelect: (categoryId: string) => void;
  onClose: () => void;
}

export const CategoryFilterModal: React.FC<CategoryFilterModalProps> = ({
  visible,
  categories,
  selectedCategory,
  onSelect,
  onClose,
}) => {
  const handleCategoryPress = (categoryId: string) => {
    onSelect(categoryId);
  };

  const isAllSelected = selectedCategory === '';

  // Map category IDs to Lucide icons
  const getCategoryIcon = (categoryId: string, isSelected: boolean) => {
    const iconColor = isSelected ? '#FFFFFF' : '#6B7280';
    const iconSize = 20;

    switch (categoryId) {
      case 'social':
        return <Users size={iconSize} color={iconColor} />;
      case 'tutorial':
        return <BookOpen size={iconSize} color={iconColor} />;
      case 'challenge':
        return <Trophy size={iconSize} color={iconColor} />;
      case 'marketplace':
        return <ShoppingBag size={iconSize} color={iconColor} />;
      case 'other':
        return <MoreHorizontal size={iconSize} color={iconColor} />;
      default:
        return <Grid size={iconSize} color={iconColor} />;
    }
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      statusBarTranslucent={true}
      onRequestClose={onClose}
    >
      <View className="flex-1 bg-black/40 justify-end">
        {/* Touchable backdrop */}
        <TouchableOpacity
          className="flex-1"
          activeOpacity={1}
          onPress={onClose}
        />
        
        {/* Modal Content */}
        <View 
          className="bg-white rounded-t-3xl pt-4 pb-6 max-h-[70%]"
          style={{
            shadowColor: '#000',
            shadowOffset: { width: 0, height: -4 },
            shadowOpacity: 0.1,
            shadowRadius: 20,
            elevation: 20,
          }}
        >
          {/* Header */}
          <View className="px-5 pb-4 border-b border-gray-100">
            <View className="flex-row items-center justify-between">
              <Text className="text-xl font-bold text-gray-900">
                Categories
              </Text>
              <TouchableOpacity
                onPress={onClose}
                className="w-8 h-8 items-center justify-center rounded-full bg-gray-100"
              >
                <X size={20} color="#6B7280" />
              </TouchableOpacity>
            </View>
          </View>

          {/* Categories List */}
          <ScrollView 
            className="flex-1"
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ paddingVertical: 8 }}
          >
            {/* Category List */}
            {categories.map((category) => {
              const isSelected = selectedCategory === category.id;
              
              return (
                <TouchableOpacity
                  key={category.id}
                  className={`flex-row items-center justify-between mx-5 p-4 rounded-xl mb-2 ${
                    isSelected 
                      ? 'bg-blue-500' 
                      : 'bg-gray-50'
                  }`}
                  onPress={() => handleCategoryPress(category.id)}
                >
                  <View className="flex-row items-center flex-1">
                    <View className={`w-10 h-10 rounded-xl items-center justify-center mr-3 ${
                      isSelected ? 'bg-white/20' : 'bg-gray-200'
                    }`}>
                      {getCategoryIcon(category.id, isSelected)}
                    </View>
                    <Text className={`font-semibold text-base ${
                      isSelected ? 'text-white' : 'text-gray-900'
                    }`}>
                      {category.label}
                    </Text>
                  </View>
                  
                  {isSelected && (
                    <Check size={20} color="#FFFFFF" />
                  )}
                </TouchableOpacity>
              );
            })}
          </ScrollView>

          {/* Done Button */}
          <View className="px-5 pt-2">
            <TouchableOpacity
              onPress={onClose}
              className="bg-gray-900 py-4 rounded-xl items-center"
            >
              <Text className="text-white font-semibold text-base">
                Done
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};