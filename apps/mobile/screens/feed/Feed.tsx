import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

const Feed = () => {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Community Feed</Text>
      <Text>See updates, posts, and creations shared by other users.</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 16 },
  title: { fontSize: 24, fontWeight: 'bold', marginBottom: 8 },
});

export default Feed;
