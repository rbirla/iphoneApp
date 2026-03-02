/*import React from "react";
import {View, Text, Image, TouchableOpacity, StyleSheet} from "react-native";

export default function VideoCard({video, onPress}){
    const initials = video.channel_title
    ? video.channel_title.split(' ').map(w => w[0]).join('').slice(0,2).toUpperCase()
    : '??';

    const timeAgo = new Date(video.published_at).tolocaleDateString();

    return(
        <TouchableOpacity style ={styles.card} onPress={onPress} activeOpacity={0.85}>
            </TouchableOpacity>
    )


}*/

  import React from "react";
  import { View, Text, Image, TouchableOpacity, StyleSheet } from "react-native";


/*Homescreen.js has access to the data and navigation.
Data is the userFeed array (vids it fetched from backend)
    Homescreen passes down video={item} which is the actual video data
Navigation object from the useNavigation() hook 
    Homescreen passes down onpress={() => navigation.navigate(...)} -> navigation action wrapped as a fn
*/

  export default function VideoCard({ video, onPress }) { 
    const initials = video.channel_title
      ? video.channel_title.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase()
      : '??';

    const timeAgo = new Date(video.published_at).toLocaleDateString();

    return (
      <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.85}>

        <View style={styles.header}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{initials}</Text>
          </View>
          <View>
            <Text style={styles.channelName}>{video.channel_title}</Text>
            <Text style={styles.date}>{timeAgo}</Text>
          </View>
        </View>

        <Text style={styles.title} numberOfLines={2}>{video.title}</Text>

        {video.thumbnail_url ? (
          <Image source={{ uri: video.thumbnail_url }} style={styles.thumbnail} resizeMode="cover" />
        ) : (
          <View style={[styles.thumbnail, styles.thumbnailFallback]}>
            <Text style={{ color: '#fff', fontSize: 28 }}>▶</Text>
          </View>
        )}

        <View style={styles.footer}>
          <Text style={styles.summaryLabel}>📝 Tap for AI Summary</Text>
        </View>

      </TouchableOpacity>
    );
  }

  const styles = StyleSheet.create({
    card: {
      backgroundColor: '#fff',
      borderRadius: 12,
      marginHorizontal: 12,
      marginVertical: 6,
      overflow: 'hidden',
      borderWidth: 1,
      borderColor: '#E5E7EB',
    },
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 10,
      padding: 12,
      paddingBottom: 8,
    },
    avatar: {
      width: 36, height: 36,
      borderRadius: 18,
      backgroundColor: '#1D4ED8',
      alignItems: 'center', justifyContent: 'center',
    },
    avatarText: {
      color: '#fff', fontSize: 12, fontWeight: '800',
    },
    channelName: {
      fontSize: 14, fontWeight: '700', color: '#111',
    },
    date: {
      fontSize: 12, color: '#9CA3AF',
    },
    title: {
      fontSize: 15, fontWeight: '700',
      color: '#111', lineHeight: 21,
      paddingHorizontal: 12, paddingBottom: 10,
    },
    thumbnail: {
      width: '100%', height: 180,
    },
    thumbnailFallback: {
      backgroundColor: '#1e3a5f',
      alignItems: 'center', justifyContent: 'center',
    },
    footer: {
      padding: 12, paddingTop: 10,
      borderTopWidth: 1, borderTopColor: '#F3F4F6',
    },
    summaryLabel: {
      color: '#2563EB', fontSize: 13, fontWeight: '600',
    },
  });




