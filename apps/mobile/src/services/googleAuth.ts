// src/services/googleAuth.ts
import { GoogleSignin } from '@react-native-google-signin/google-signin';
import axios from 'axios';

GoogleSignin.configure({
  webClientId: '282411662669-aoa9sq25ln442176soaih4tuoodmel9p.apps.googleusercontent.com', // from Google Cloud
  offlineAccess: false,
});

export const signInWithGoogle = async () => {
  await GoogleSignin.hasPlayServices();
  const userInfo = await GoogleSignin.signIn();
  const { idToken } = await GoogleSignin.getTokens();

  if (!idToken) throw new Error("No Google ID token received");

  // Send token to backend
  const res = await axios.post("http://192.168.1.10:5000/api/auth/google/mobile", {
    token: idToken,
  });

  return res.data; // { user, token, refreshToken }
};
