import React, { useState, useEffect } from "react";
import { View, Text, TextInput, Button, FlatList, TouchableOpacity } from "react-native";
import { BASE_URL } from "../api/api";
import { useNavigation, useRoute } from "@react-navigation/native";
import { GoogleSignin } from '@react-native-google-signin/google-signin';
import auth from '@react-native-firebase/auth';
import VideoCard from "../components/VideoCard"

const HomeScreen = () => {
  const [channelUrl, setChannelUrl] = useState("");
  const [channels, setChannels] = useState([]);
  const [userFeed, setUserFeed] = useState([]);
  const [loading, setLoading] = useState(false);
  const navigation = useNavigation();
  const route = useRoute();
  
  // Get user data passed from LoginScreen
  const { accessToken, userId, subscriptionsCount } = route.params || {};

  // Fetch user's personalized feed when screen loads
  useEffect(() => {
    if (accessToken && userId) {
      fetchUserFeed();
    }
  }, [accessToken, userId]);

  const fetchUserFeed = async () => {
    setLoading(true);
    try {
      console.log("📺 Fetching user's personalized feed...");
      console.log("📺 Fetching personalized feed from backend...");
      
      const response = await fetch(`${BASE_URL}/get_user_feed/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ access_token: accessToken, user_id: userId })
      });
      
      const feedData = await response.json();
      console.log("✅ User feed fetched successfully:", feedData);
      
      console.log(`✅ Got ${feedData.videos_count} videos from ${feedData.subscriptions_count} channels`);
      setUserFeed(feedData.videos || []);
      
    } catch (error) {
      console.error("❌ Error fetching user feed:", error);
    } finally {
      setLoading(false);
    }
  };

  const addChannel = async () => {
    if (channelUrl.trim() === "") return;

    try {
      const channelData = await getChannelInfo(channelUrl);
      setChannels([...channels, channelData]);
      setChannelUrl(""); // Reset input
    } catch (error) {
      console.error("Error fetching channel info:", error);
    }
  };

  const handleSignOut = async () => {
    try {
      await GoogleSignin.signOut();
      await auth().signOut();
      console.log("✅ Signed out successfully");
      navigation.replace("Login"); // Go back to login screen
    } catch (error) {
      console.error("❌ Sign out error:", error);
    }
  };

  return (
    <View style={{ padding: 20 }}>
      <Text style={{ fontSize: 20, fontWeight: "bold" }}>Your Personalized Feed</Text>
      
      {subscriptionsCount && (
        <Text style={{ marginBottom: 10 }}>
          📺 Synced {subscriptionsCount} subscriptions
        </Text>
      )}
      
      {loading && <Text>🔄 Loading your feed...</Text>}
      
      {/* Display personalized feed */}
      <FlatList
        data={userFeed}
        keyExtractor={(item) => item.video_id}
        renderItem={({item}) => (
          <VideoCard
          video ={item}
          onPress ={() =>navigation.navigate('VideoDetail', {video:item})}
          />
        )}


        ListEmptyComponent={
          !loading && (
            <Text>No videos found. Make sure you have YouTube subscriptions!</Text>
          )
        }
      />

      <Button
        title="🔄 Refresh Feed"
        onPress={fetchUserFeed}
      />
      
      {/* Manual channel addition - keep as fallback */}
      <Text style={{ fontSize: 16, fontWeight: "bold", marginTop: 20 }}>
        Or Add Channels Manually
      </Text>
      <TextInput
        value={channelUrl}
        onChangeText={setChannelUrl}
        placeholder="Enter YouTube channel URL"
        style={{ borderBottomWidth: 1, marginBottom: 10, padding: 8 }}
      />
      <Button title="Add Channel" onPress={addChannel} />

      <FlatList
        data={channels}
        keyExtractor={(item) => item.channel_url}
        renderItem={({ item }) => (
          <Text style={{ marginVertical: 5 }}>✅ {item.title}</Text>
        )}
      />

      <Button
        title="View Manual Feed"
        onPress={() => navigation.navigate("Feed", { channels })} //when pressed calls navigation.navigate("Feed", {channels}}), passes channels as route params
      />
      
      <View style={{ marginTop: 20 }}>
        <Button
          title="🚪 Sign Out"
          onPress={handleSignOut}
          color="red"
        />
      </View>
    </View>
  );
};

export default HomeScreen;
