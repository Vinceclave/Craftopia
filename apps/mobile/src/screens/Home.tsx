import React from 'react';
import { View, StyleSheet, Text } from 'react-native';
import { GoogleLoginButton } from '../components/GoogleLoginButton';

export const HomeScreen: React.FC = () => {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Welcome to Craftopia</Text>
      <GoogleLoginButton />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 },
  title: { fontSize: 24, fontWeight: 'bold', marginBottom: 20 },
});
