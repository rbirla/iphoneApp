// src/screens/LoginScreen.js
import React, { useState } from "react";
import { View, Text, TextInput, Button, StyleSheet } from "react-native";
import GoogleAuth from "../auth/GoogleAuth";
import { useNavigation } from "@react-navigation/native";

export default function LoginScreen() {
  const [email, setEmail] = useState("");
  const navigation = useNavigation();

  const handleEmailLogin = () => {
    // For now, just continue to HomeScreen with email
    navigation.replace("Home", { email });
  };

  const handleGoogleLoginSuccess = async (accessToken) => {
    console.log("🎉 Logged in with Google. Token:", accessToken);
    await getYouTubeSubscriptions(accessToken); // 🧪 Fetch and log subscriptions
    navigation.replace("Home", { accessToken }); // Then navigate to Home
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

const getYouTubeSubscriptions = async (accessToken) => {
    try {
      const res = await fetch("https://www.googleapis.com/youtube/v3/subscriptions?part=snippet&mine=true", {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });
      const data = await res.json();
      console.log("✅ Subscriptions:", data); // For testing
    } catch (err) {
      console.error("❌ Error fetching subscriptions:", err);
    }
  };
  

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