// apps/mobile/src/components/feed/CreatePostFAB.tsx
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
      className="absolute bottom-24 right-5 w-14 h-14 bg-craftopia-primary rounded-full items-center justify-center"
      activeOpacity={0.8}
      style={{
        shadowColor: '#374A36',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 8,
      }}
    >
      <Plus size={24} color="white" />
    </TouchableOpacity>
  );
};