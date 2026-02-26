// src/auth/GoogleAuth.js - Firebase Auth Implementation
import React, { useState } from "react";
import { Button } from "react-native";
import { GoogleSignin } from '@react-native-google-signin/google-signin';
import auth, { GoogleAuthProvider } from '@react-native-firebase/auth';
import '../config/firebase'; // Initialize Firebase

// Configure Google Sign-In
GoogleSignin.configure({
  webClientId: '326978844574-54fubta3no9p0322hsf5nfj1et7b4a67.apps.googleusercontent.com', // Web client (client_type: 3)
  scopes: ['profile', 'email', 'https://www.googleapis.com/auth/youtube.readonly'],
});

export default function GoogleAuth({ onLoginSuccess }) {
  const [isLoading, setIsLoading] = useState(false);

  async function onGoogleButtonPress() {
    if (isLoading) return; // Prevent multiple presses
    
    setIsLoading(true);
    try {
      // Check if your device supports Google Play
      await GoogleSignin.hasPlayServices({ showPlayServicesUpdateDialog: true });
      
      // Get the users ID token
      const response = await GoogleSignin.signIn();
      
      console.log("✅ Google Sign-In successful:", response);
      
      if (response && response.data) {
        const { idToken, user } = response.data;
        
        console.log("✅ User data:", user);
        
        // Create a Google credential with the token using modern Firebase API
        const googleCredential = GoogleAuthProvider.credential(idToken);
        
        // Sign-in the user with the credential using modern Firebase API
        const userCredential = await auth().signInWithCredential(googleCredential);
        
        console.log("✅ Firebase Auth successful:", userCredential.user);
        
        // Get fresh access token for YouTube API
        const tokens = await GoogleSignin.getTokens();
        console.log("Access token:", tokens.accessToken);
        
        // Call the parent handler with both access token and user credential
        onLoginSuccess(tokens.accessToken, userCredential);
      } else {
        // Handle legacy response format
        const { idToken, user } = response;
        
        console.log("✅ Legacy User data:", user);
        
        // Create a Google credential with the token using modern Firebase API
        const googleCredential = GoogleAuthProvider.credential(idToken);
        
        // Sign-in the user with the credential
        const userCredential = await auth().signInWithCredential(googleCredential);
        
        console.log("✅ Firebase Auth successful:", userCredential.user);
        
        // Get fresh access token for YouTube API
        const tokens = await GoogleSignin.getTokens();
        console.log("Access token:", tokens.accessToken);
        
        // Call the parent handler with both access token and user credential
        onLoginSuccess(tokens.accessToken, userCredential);
      }
      
    } catch (error) {
      console.log("❌ Google Sign-In error:", error);
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <Button 
      title={isLoading ? "Signing in..." : "Sign in with Google"} 
      onPress={onGoogleButtonPress}
      disabled={isLoading}
    />
  );
}
