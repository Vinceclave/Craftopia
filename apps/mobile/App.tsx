import * as Google from "expo-auth-session/providers/google";
import { useEffect } from "react";
import { Button } from "react-native";

export default function App() {
  const [request, response, promptAsync] = Google.useAuthRequest({
    androidClientId: "282411662669-0jsh8pum8c628chps3h48anoglda3v50.apps.googleusercontent.com",
    webClientId: "282411662669-aoa9sq25ln442176soaih4tuoodmel9p.apps.googleusercontent.com",
  });

  useEffect(() => {
    if (response?.type === "success") {
      const { authentication } = response;
      console.log("Google token:", authentication?.idToken);
      // Send authentication.idToken to backend
    }
  }, [response]);

  return (
    <Button
      disabled={!request}
      title="Login with Google"
      onPress={() => promptAsync()}
    />
  );
}
