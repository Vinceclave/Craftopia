import React, { useState } from 'react';
import { TouchableOpacity, Text, StyleSheet, Alert, ActivityIndicator } from 'react-native';
import { useGoogleAuth } from '../services/googleAuth';

export const GoogleLoginButton: React.FC = () => {
  const { request, signInWithGoogle } = useGoogleAuth();
  const [loading, setLoading] = useState(false);

  const handlePress = async () => {
    setLoading(true);
    try {
      const user = await signInWithGoogle();
      if (user) {
        Alert.alert('Login Successful', `Welcome, ${user.user.username}`);
      }
    } catch (error: any) {
      Alert.alert('Login Failed', error.message || 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <TouchableOpacity
      style={[styles.button, !request ? styles.disabled : undefined]}
      disabled={!request || loading}
      onPress={handlePress}
    >
      {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>Sign in with Google</Text>}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    backgroundColor: '#4285F4',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 6,
    alignItems: 'center',
    justifyContent: 'center',
  },
  disabled: {
    backgroundColor: '#a0c3ff',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});
