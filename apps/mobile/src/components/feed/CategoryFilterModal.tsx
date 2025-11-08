// apps/mobile/src/components/feed/CategoryFilterModal.tsx - CRAFTOPIA REDESIGN
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

  // Map category IDs to Lucide icons
  const getCategoryIcon = (categoryId: string, isSelected: boolean) => {
    const iconColor = isSelected ? '#FFFFFF' : '#5A7160';
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
      <View className="flex-1 bg-black/50 justify-end">
        {/* Touchable backdrop */}
        <TouchableOpacity
          className="flex-1"
          activeOpacity={1}
          onPress={onClose}
        />
        
        {/* Modal Content */}
        <View 
          className="bg-white rounded-t-3xl pt-5 pb-8 max-h-[70%] shadow-xl"
        >
          {/* Header */}
          <View className="px-5 pb-4 border-b border-craftopa-light/10">
            <View className="flex-row items-center justify-between">
              <View>
                <Text className="text-sm font-nunito text-craftopa-textSecondary tracking-wide mb-0.5">
                  Filter By
                </Text>
                <Text className="text-xl font-poppinsBold text-craftopa-textPrimary tracking-tight">
                  Categories
                </Text>
              </View>
              <TouchableOpacity
                onPress={onClose}
                className="w-9 h-9 items-center justify-center rounded-xl bg-craftopa-light/10 active:opacity-70 border border-craftopa-light/10"
              >
                <X size={18} color="#5A7160" />
              </TouchableOpacity>
            </View>
          </View>

          {/* Categories List */}
          <ScrollView 
            className="flex-1"
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ paddingVertical: 12 }}
          >
            {/* Category List */}
            {categories.map((category) => {
              const isSelected = selectedCategory === category.id;
              
              return (
                <TouchableOpacity
                  key={category.id}
                  className={`flex-row items-center justify-between mx-5 p-4 rounded-2xl mb-2 active:opacity-70 border ${
                    isSelected 
                      ? 'bg-craftopa-primary border-craftopa-primary/20' 
                      : 'bg-white border-craftopa-light/10'
                  } shadow-sm`}
                  onPress={() => handleCategoryPress(category.id)}
                >
                  <View className="flex-row items-center flex-1">
                    <View className={`w-10 h-10 rounded-xl items-center justify-center mr-3 border ${
                      isSelected ? 'bg-white/20 border-white/30' : 'bg-craftopa-light/5 border-craftopa-light/10'
                    }`}>
                      {getCategoryIcon(category.id, isSelected)}
                    </View>
                    <Text className={`font-poppinsBold text-base tracking-tight ${
                      isSelected ? 'text-white' : 'text-craftopa-textPrimary'
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
          <View className="px-5 pt-4">
            <TouchableOpacity
              onPress={onClose}
              className="bg-craftopa-primary py-4 rounded-2xl items-center active:opacity-70 shadow-sm border border-craftopa-primary/20"
            >
              <Text className="text-white font-poppinsBold text-base tracking-tight">
                Apply Filter
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};