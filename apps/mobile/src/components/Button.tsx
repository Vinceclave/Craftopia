// src/components/GoogleLoginButton.tsx
import React, { useState } from "react";
import { Button, Alert } from "react-native";
import { signInWithGoogle } from "../services/googleAuth";

const GoogleLoginButton = () => {
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    try {
      setLoading(true);
      const result = await signInWithGoogle();
      Alert.alert("Login Success", `Welcome ${result.user.username}`);
    } catch (err: any) {
      Alert.alert("Login Failed", err.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Button
      title={loading ? "Signing in..." : "Sign in with Google"}
      onPress={handleLogin}
      disabled={loading}
    />
  );
};

export default GoogleLoginButton;
