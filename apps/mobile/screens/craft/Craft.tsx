import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

const Craft = () => {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Craft Ideas</Text>
      <Text>Discover new DIY craft projects and upcycling tutorials.</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 16 },
  title: { fontSize: 24, fontWeight: 'bold', marginBottom: 8 },
});

export default Craft;
