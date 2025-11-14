import React from 'react';
import { TouchableOpacity } from 'react-native';
import { Plus } from 'lucide-react-native';

interface CreatePostFABProps {
  onPress: () => void;
}

export const CreatePostFAB: React.FC<CreatePostFABProps> = ({ onPress }) => {
  return (
    <TouchableOpacity
      onPress={onPress}
      className="absolute bottom-24 right-4 w-12 h-12 bg-craftopia-primary rounded-full items-center justify-center"
      activeOpacity={0.8}
      style={{
        shadowColor: '#3B6E4D',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.3,
        shadowRadius: 4,
        elevation: 4,
      }}
    >
      <Plus size={20} color="#FFFFFF" />
    </TouchableOpacity>
  );
};