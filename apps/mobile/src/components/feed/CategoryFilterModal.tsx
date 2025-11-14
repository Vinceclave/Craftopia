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
    const iconColor = isSelected ? '#FFFFFF' : '#3B6E4D';
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
          className="bg-craftopia-surface rounded-t-3xl"
          style={{ height: SCREEN_HEIGHT * 0.7 }}
        >
          {/* Header */}
          <View className="flex-row items-center justify-between px-4 pt-4 pb-3 border-b border-craftopia-light">
            <View className="flex-1">
              <Text className="text-sm text-craftopia-textSecondary mb-1">Filter By</Text>
              <Text className="text-lg font-poppinsBold text-craftopia-textPrimary">Categories</Text>
            </View>
            <TouchableOpacity
              onPress={onClose}
              className="w-9 h-9 items-center justify-center rounded-lg bg-craftopia-light"
              activeOpacity={0.7}
            >
              <X size={16} color="#3B6E4D" />
            </TouchableOpacity>
          </View>

          {/* Categories List */}
          <View className="flex-1 px-4">
            <ScrollView 
              showsVerticalScrollIndicator={false}
              contentContainerStyle={{ paddingVertical: 12 }}
            >
              {categories && categories.length > 0 ? (
                categories.map((category, index) => {
                  if (!category || !category.id) return null;

                  const isSelected = selectedCategory === category.id;
                  
                  return (
                    <TouchableOpacity
                      key={`${category.id}-${index}`}
                      className={`
                        flex-row items-center justify-between p-3 rounded-xl mb-2 
                        border
                        ${isSelected 
                          ? 'bg-craftopia-primary border-craftopia-primary/20' 
                          : 'bg-craftopia-surface border-craftopia-light'
                        }
                      `}
                      onPress={() => handleCategoryPress(category.id)}
                      activeOpacity={0.7}
                    >
                      <View className="flex-row items-center flex-1">
                        <View className={`
                          w-9 h-9 rounded-lg items-center justify-center mr-3 
                          border
                          ${isSelected 
                            ? 'bg-white/20 border-white/30' 
                            : 'bg-craftopia-light border-craftopia-light'
                          }
                        `}>
                          {getCategoryIcon(category.id, isSelected)}
                        </View>
                        <Text className={`
                          font-poppinsBold text-base
                          ${isSelected ? 'text-white' : 'text-craftopia-textPrimary'}
                        `}>
                          {category.label || category.id}
                        </Text>
                      </View>
                      
                      {isSelected && (
                        <Check size={18} color="#FFFFFF" />
                      )}
                    </TouchableOpacity>
                  );
                })
              ) : (
                <View className="py-8 items-center justify-center">
                  <Text className="text-sm text-craftopia-textSecondary">No categories available</Text>
                </View>
              )}
            </ScrollView>
          </View>

          {/* Done Button */}
          <View className="px-4 pt-3 pb-6 border-t border-craftopia-light">
            <TouchableOpacity
              onPress={onClose}
              className="bg-craftopia-primary py-3 rounded-xl items-center"
              activeOpacity={0.7}
            >
              <Text className="text-white font-poppinsBold text-base">Apply Filter</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};