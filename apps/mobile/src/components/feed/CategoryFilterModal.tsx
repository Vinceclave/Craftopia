// apps/mobile/src/components/feed/CategoryFilterModal.tsx - NATIVEWIND VERSION
import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Modal,
  Dimensions,
} from 'react-native';
import { X, Check, Grid, Users, BookOpen, Trophy, ShoppingBag, MoreHorizontal } from 'lucide-react-native';

const SCREEN_HEIGHT = Dimensions.get('window').height;

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

  // Map category IDs to Lucide icons
  const getCategoryIcon = (categoryId: string, isSelected: boolean) => {
    const iconColor = isSelected ? '#FFFFFF' : '#5A7160';
    const iconSize = 20;

    const id = categoryId?.toLowerCase() || '';

    switch (id) {
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
      case 'all':
        return <Grid size={iconSize} color={iconColor} />;
      default:
        return <Grid size={iconSize} color={iconColor} />;
    }
  };

  if (!visible) return null;

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      statusBarTranslucent={true}
      onRequestClose={onClose}
    >
      <View className="flex-1 bg-black/50 justify-end">
        {/* Touchable backdrop */}
        <TouchableOpacity
          className="flex-1"
          activeOpacity={1}
          onPress={onClose}
        />
        
        {/* Modal Content Container */}
        <View 
          className="bg-white rounded-t-3xl shadow-lg"
          style={{ height: SCREEN_HEIGHT * 0.7 }}
        >
          {/* Header */}
          <View className="flex-row items-center justify-between px-5 pt-5 pb-4 border-b border-gray-100">
            <View className="flex-1">
              <Text className="text-sm text-gray-500 mb-0.5">Filter By</Text>
              <Text className="text-xl font-bold text-gray-800">Categories</Text>
            </View>
            <TouchableOpacity
              onPress={onClose}
              className="w-9 h-9 items-center justify-center rounded-xl bg-gray-100"
              activeOpacity={0.7}
            >
              <X size={18} color="#5A7160" />
            </TouchableOpacity>
          </View>

          {/* Categories List */}
          <View className="flex-1 px-5">
            <ScrollView 
              showsVerticalScrollIndicator={false}
              contentContainerStyle={{ paddingVertical: 16 }}
            >
              {categories && categories.length > 0 ? (
                categories.map((category, index) => {
                  if (!category || !category.id) return null;

                  const isSelected = selectedCategory === category.id;
                  
                  return (
                    <TouchableOpacity
                      key={`${category.id}-${index}`}
                      className={`
                        flex-row items-center justify-between p-4 rounded-2xl mb-2 
                        border shadow-sm
                        ${isSelected 
                          ? 'bg-[#5A7160] border-[#5A7160]/20' 
                          : 'bg-white border-gray-100'
                        }
                      `}
                      onPress={() => handleCategoryPress(category.id)}
                      activeOpacity={0.7}
                    >
                      <View className="flex-row items-center flex-1">
                        <View className={`
                          w-10 h-10 rounded-xl items-center justify-center mr-3 
                          border
                          ${isSelected 
                            ? 'bg-white/20 border-white/30' 
                            : 'bg-gray-50 border-gray-100'
                          }
                        `}>
                          {getCategoryIcon(category.id, isSelected)}
                        </View>
                        <Text className={`
                          font-bold text-base
                          ${isSelected ? 'text-white' : 'text-gray-800'}
                        `}>
                          {category.label || category.id}
                        </Text>
                      </View>
                      
                      {isSelected && (
                        <Check size={20} color="#FFFFFF" />
                      )}
                    </TouchableOpacity>
                  );
                })
              ) : (
                <View className="py-10 items-center justify-center">
                  <Text className="text-sm text-gray-500">No categories available</Text>
                </View>
              )}
            </ScrollView>
          </View>

          {/* Done Button */}
          <View className="px-5 pt-4 pb-8 border-t border-gray-100">
            <TouchableOpacity
              onPress={onClose}
              className="bg-[#5A7160] py-4 rounded-2xl items-center shadow-md"
              activeOpacity={0.7}
            >
              <Text className="text-white font-bold text-base">Apply Filter</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};