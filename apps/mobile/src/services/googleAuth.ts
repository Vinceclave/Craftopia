import * as Google from 'expo-auth-session/providers/google';
import * as WebBrowser from 'expo-web-browser';
import { postGoogleToken } from './api';

WebBrowser.maybeCompleteAuthSession();

interface GoogleAuthResponse {
  user: {
    username: string;
    email: string;
    // add other user fields returned by your backend
  };
  token: string; // JWT token from backend
}

export const useGoogleAuth = () => {
  const [request, response, promptAsync] = Google.useIdTokenAuthRequest({
    clientId: '282411662669-aoa9sq25ln442176soaih4tuoodmel9p.apps.googleusercontent.com', // replace with your Web Client ID
  });

  const signInWithGoogle = async (): Promise<GoogleAuthResponse | null> => {
    if (!request) return null;

    try {
      const result = await promptAsync();
      if (result.type === 'success') {
        const idToken = result.params.id_token;
        const backendResponse = await postGoogleToken(idToken);
        return backendResponse;
      }
    } catch (error: any) {
      console.error('Google auth error:', error);
      throw new Error(error.message || 'Google authentication failed');
    }

    return null;
  };

  return { request, response, signInWithGoogle };
};
