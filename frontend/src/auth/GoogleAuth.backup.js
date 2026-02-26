// BACKUP: Original Expo Auth Session Implementation
// src/auth/GoogleAuth.js
import * as React from "react";
import * as WebBrowser from "expo-web-browser";
import * as Google from "expo-auth-session/providers/google";
import { useEffect } from "react";
import { Button } from "react-native";
import { makeRedirectUri } from "expo-auth-session";

WebBrowser.maybeCompleteAuthSession();

export default function GoogleAuth({ onLoginSuccess }) {
  const redirectUri = makeRedirectUri({
    scheme: 'com.rbirla.frontend'
  });
  
  console.log("Redirect URI:", redirectUri);

  const [request, response, promptAsync] = Google.useAuthRequest({
    androidClientId: "326978844574-er9qf5c76uf4ossa5khilvdspj87f9qm.apps.googleusercontent.com",
    webClientId: "326978844574-54fubta3no9p0322hsf5nfj1et7b4a67.apps.googleusercontent.com",
    scopes: ["profile", "email", "https://www.googleapis.com/auth/youtube.readonly"],
    redirectUri: redirectUri,
  });

  console.log("Auth request:", request);
  
  useEffect(() => {
    console.log("Auth response:", response);
    if (response?.type === "success") {
      console.log("✅ Authentication successful!");
      const { authentication } = response;
      console.log("Access token:", authentication?.accessToken);
      // Call the parent handler and pass the access token
      onLoginSuccess(authentication.accessToken);
    } else if (response?.type === "error") {
      console.log("❌ Authentication error:", response.error);
    } else if (response?.type === "cancel") {
      console.log("⚠️ Authentication cancelled");
    }
  }, [response]);

  return <Button disabled={!request} title="Sign in with Google" onPress={() => promptAsync()} />;
}