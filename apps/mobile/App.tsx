import { StatusBar } from 'expo-status-bar';
import { View, Text } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';

export default function App() {
  return (
    <View className="flex-1 justify-center items-center bg-background">
      <Text className="text-primary font-inter text-xl">
        Hello, Craftopia!
      </Text>
    </View>
  );
}
