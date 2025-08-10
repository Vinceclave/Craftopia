import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

const Challenges = () => {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Eco Challenges</Text>
      <Text>Participate in eco-friendly challenges and track your progress.</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 16 },
  title: { fontSize: 24, fontWeight: 'bold', marginBottom: 8 },
});

export default Challenges;
