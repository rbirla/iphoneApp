import React, { useEffect, useState } from "react";
import { View, Text, FlatList, ActivityIndicator } from "react-native";
import { getLatestVideos } from "../api/api"; // ✅ Corrected import

const FeedScreen = ({ route }) => {//recieves the {channels} which was passed from HomeScreen
  const { channels } = route.params;//loops through each channel, calls getLaatestVideos and displays the results in a list
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchVideos = async () => {
      try {
        const allVideos = [];
        for (let channel of channels) {
          const channelVideos = await getLatestVideos(channel.channel_url.split("/").pop());
          allVideos.push(...channelVideos);
        }
        setVideos(allVideos);
      } catch (error) {
        console.error("Error fetching videos:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchVideos();
  }, [channels]);

  if (loading) return <ActivityIndicator size="large" style={{ flex: 1 }} />;

  return (
    <View style={{ padding: 20 }}>
      <Text style={{ fontSize: 20, fontWeight: "bold" }}>Latest Videos</Text>
      <FlatList
        data={videos}
        keyExtractor={(item) => item.video_id}
        renderItem={({ item }) => (
          <Text style={{ marginVertical: 5 }}>📺 {item.title}</Text>
        )}
      />
    </View>
  );
};

export default FeedScreen;
