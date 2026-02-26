// src/screens/LoginScreen.js
import React, { useState } from "react";
import { View, Text, TextInput, Button, StyleSheet } from "react-native";
import GoogleAuth from "../auth/GoogleAuth";
import { useNavigation } from "@react-navigation/native";
import { BASE_URL } from "../api/api";

export default function LoginScreen() {
  const [email, setEmail] = useState("");
  const navigation = useNavigation();

  const handleEmailLogin = () => {
    // For now, just continue to HomeScreen with email
    navigation.replace("Home", { email }); //homescreen replaces the login screen 
  };

  const handleGoogleLoginSuccess = async (accessToken, userCredential) => {
    console.log("🎉 Logged in with Google. Token:", accessToken);
    
    try {
      // Use backend endpoint to sync subscriptions
      const userId = userCredential.user.uid;
      console.log("🔄 Syncing user subscriptions with backend...");
      
      const response = await fetch(`${BASE_URL}/sync_user_subscriptions/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ access_token: accessToken, user_id: userId })
      });
      
      const subscriptionData = await response.json();
      console.log("✅ Subscriptions synced successfully:", subscriptionData);
      
      console.log("📺 Synced subscriptions:", subscriptionData.subscriptions_count);
      
      // Navigate to Home screen with user data
      navigation.replace("Home", { 
        accessToken,
        userId,
        subscriptionsCount: subscriptionData.subscriptions_count
      });
      
    } catch (error) {
      console.error("❌ Subscription sync failed, but continuing:", error);
      
      // Navigate anyway, even if sync fails
      console.log("📱 Navigating to Home screen without sync...");
      navigation.replace("Home", { 
        accessToken,
        userId: userCredential.user.uid
      });
    }
  };
  

  return (
    <View style={styles.container}>
      <Text style={styles.heading}>Sign In</Text>

      <GoogleAuth onLoginSuccess={handleGoogleLoginSuccess} />

      <Text style={styles.orText}>or</Text>

      <TextInput
        placeholder="Enter your email"
        style={styles.input}
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
        autoCapitalize="none"
      />
      <Button title="Continue with Email" onPress={handleEmailLogin} />
    </View>
  );
}

// YouTube API calls moved to backend - this function is no longer needed
  

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    padding: 20,
  },
  heading: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 20,
    textAlign: "center",
  },
  orText: {
    textAlign: "center",
    marginVertical: 10,
  },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 5,
    padding: 10,
    marginBottom: 10,
  },
});