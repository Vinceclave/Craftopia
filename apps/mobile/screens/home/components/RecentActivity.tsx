import React from 'react';
import { View, Text, FlatList } from 'react-native';
import { MotiView } from 'moti';
import { Easing } from 'react-native-reanimated';
import { Sparkles } from 'lucide-react-native';

const dummyData = [
  { id: '1', title: 'Craft Completed', description: 'You finished “Upcycled Bottle Planter.”', date: 'Aug 10, 2025' },
  { id: '2', title: 'Eco Challenge Joined', description: 'Joined “Plastic-Free Week” challenge.', date: 'Aug 8, 2025' },
  { id: '3', title: 'New Craft Idea', description: 'Saved “DIY Paper Organizer.”', date: 'Aug 5, 2025' },
];

const ActivityItem = ({ item, index }) => (
  <MotiView
    from={{ opacity: 0, translateY: 10 }}
    animate={{ opacity: 1, translateY: 0 }}
    transition={{
      delay: 100 * index,
      type: 'timing',
      easing: Easing.out(Easing.ease),
    }}
    style={{
      backgroundColor: '#FAFAF9',
      padding: 14,
      borderRadius: 16,
      shadowColor: '#000',
      shadowOpacity: 0.05,
      shadowRadius: 4,
      borderLeftWidth: 4,
      borderLeftColor: '#4CAF50',
      flexDirection: 'row',
      alignItems: 'center',
    }}
    accessible
    accessibilityLabel={`${item.title}. ${item.description}. Date: ${item.date}`}
  >
    <View
      style={{
        backgroundColor: 'rgba(76, 175, 80, 0.1)',
        padding: 8,
        borderRadius: 50,
        marginRight: 12,
      }}
    >
      <Sparkles size={22} color="#4CAF50" />
    </View>

    <View style={{ flex: 1 }}>
      <Text style={{ fontSize: 14, fontWeight: '600', color: '#2E7D32' }}>
        {item.title}
      </Text>
      <Text style={{ fontSize: 12, color: '#4B5563', marginTop: 2 }}>
        {item.description}
      </Text>
      <Text style={{ fontSize: 11, color: '#9CA3AF', fontStyle: 'italic', marginTop: 4 }}>
        {item.date}
      </Text>
    </View>
  </MotiView>
);

const RecentActivity = () => {
  return (
    <View style={{ marginTop: 8 }}>
      <Text
        accessible
        accessibilityRole="header"
        style={{
          fontSize: 20,
          fontWeight: '600',
          color: '#2E7D32',
          marginBottom: 16,
        }}
      >
        Recent Activity
      </Text>
      <FlatList
        data={dummyData}
        keyExtractor={(item) => item.id}
        renderItem={({ item, index }) => <ActivityItem item={item} index={index} />}
        showsVerticalScrollIndicator={false}
        ItemSeparatorComponent={() => <View style={{ height: 10 }} />}
      />
    </View>
  );
};

export default RecentActivity;
