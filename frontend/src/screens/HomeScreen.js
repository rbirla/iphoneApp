import React, { useState } from "react";
import { View, Text, TextInput, Button, FlatList } from "react-native";
import { getChannelInfo } from "../api/api"; // ✅ Corrected import
import { useNavigation } from "@react-navigation/native";

const HomeScreen = () => {
  const [channelUrl, setChannelUrl] = useState("");
  const [channels, setChannels] = useState([]);
  const navigation = useNavigation();

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

  return (
    <View style={{ padding: 20 }}>
      <Text style={{ fontSize: 20, fontWeight: "bold" }}>Add YouTube Channels</Text>
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
        title="View Feed"
        onPress={() => navigation.navigate("Feed", { channels })}
      />
    </View>
  );
};

export default HomeScreen;
