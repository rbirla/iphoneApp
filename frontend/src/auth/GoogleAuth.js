// src/auth/GoogleAuth.js
import * as React from "react";
import * as WebBrowser from "expo-web-browser";
import * as Google from "expo-auth-session/providers/google";
import { useEffect } from "react";
import { Button } from "react-native";

WebBrowser.maybeCompleteAuthSession();

export default function GoogleAuth({ onLoginSuccess }) {
  const [request, response, promptAsync] = Google.useAuthRequest({
    expoClientId: "15576715152-2rpp0prgclg6vghdaiekdddedh72gdap.apps.googleusercontent.com",
    iosClientId: "15576715152-d28jpqs8b0ntcna7a50vbmhguli2pj4d.apps.googleusercontent.com",
    // androidClientId: "<YOUR_ANDROID_CLIENT_ID>",
    webClientId: "15576715152-2rpp0prgclg6vghdaiekdddedh72gdap.apps.googleusercontent.com", // from Google Cloud Console
    scopes: ["profile", "email", "https://www.googleapis.com/auth/youtube.readonly"],
    redirectUri: "https://auth.expo.io/@rbirla/frontend",
  });

  console.log("Auth request:", request);
  useEffect(() => {
    if (response?.type === "success") {
      const { authentication } = response;
      // Call the parent handler and pass the access token
      onLoginSuccess(authentication.accessToken);
    }
  }, [response]);

  return <Button disabled={!request} title="Sign in with Google" onPress={() => promptAsync()} />;
}
