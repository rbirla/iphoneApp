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

import { Button } from "@react-navigation/elements";
import { Link } from "@react-navigation/native";
import React from "react";
import { View, Text, Image, TouchableOpacity, StyleSheet } from "react-native";

import { useNavigation } from "@react-navigation/native";

/*Homescreen.js has access to the data and navigation.
Data is the userFeed array (vids it fetched from backend)
    Homescreen passes down video={item} which is the actual video data
Navigation object from the useNavigation() hook 
    Homescreen passes down onpress={() => navigation.navigate(...)} -> navigation action wrapped as a fn
*/

  export default function VideoCard({ logoMap, video, onPress }) { 
    const initials = video.channel_title //this line takes video.channel_title and splits to words, maps each word to first letter and joins them back like tim warren to TW
      ? video.channel_title.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase()
      : '??';
    const navigation = useNavigation();
    const timeAgo = getTimeAgo(video.published_at);

    console.log("LOGO IS BELOW");
    console.log(logoMap[video.channel_id]);
    


    return(
        <View style = {styles.card}>

            {/*upper portion of card*/}
            <View style={styles.cardTop}>
                {/* call ChannelPage with the Id channelId={video.channel_id}  */}
                <TouchableOpacity onPress={() => navigation.navigate("Home")}>
                    <Image 
                        source={{uri: logoMap[video.channel_id]}} 
                        style={styles.avatar} 
                    />
                </TouchableOpacity>
                <Text>{video.channel_title}</Text>
                <Text>{timeAgo}</Text>
            </View>


        {/*bottom portion of card*/}
            <View style ={styles.cardBottom}>
            <Image source = {{uri:video.thumbnail_url}} style ={styles.thumbnail}/>
            </View>


        </View>
    );}

    /*
        flexDirection: "row",
        flexx: 1
        justifyContent
        A B C D E F G H I J K...

        SELECT * FROM LETTERS LIMIT 5 OFFSET 10
    */
//    const limit = 5;
//    let offset = 0;

//    offset += limit;

    const styles = StyleSheet.create({
        card: {
        
            flexDirection: "column",
            flex: 1,

            marginHorizontal: "10",
            marginVertical: 10,
            backgroundColor: 'green',
        },
        cardTop: {
            flexDirection: "row",
            flex: 1,
            justifyContent: ""
        },
        avatar: {
            verticalPadding: 100,
            width: 40,
            height: 40,
            borderRadius: 20,
        },
        thumbnail:{
            verticalPadding: 100,
            width: 70,
            height: 70,
        },

        cardBottom:{
            FlexDirection: "row",
            flex: 1,
        }

    })


function getTimeAgo(dateString) {
    const date = new Date(dateString); // ✅ convert once, reuse everywhere
    const seconds = Math.floor((new Date() - date) / 1000);

    if (seconds < 60) return seconds + 's';
    if (seconds < 3600) return Math.floor(seconds / 60) + 'm';
    if (seconds < 86400) return Math.floor(seconds / 3600) + 'h';
    if (seconds < 2592000) return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
    if (new Date().getUTCFullYear() !== date.getFullYear()) return date.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}
   /*activeOpacity is how transparent the card is when clicked on*/
//     return (
//       <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.85}> 
   
//         <View style={styles.header}>
            
//           <View style={styles.avatar}>
//             {/*Update here to be an image insteafd of text with the logo */}
//             <Text style={styles.avatarText}>{initials}</Text>
//           </View>
//           <View>
//             <Text style={styles.channelName}>{video.channel_title}</Text>
//             <Text style={styles.date}>{timeAgo}</Text>
//           </View>
//         </View>

//         <Text style={styles.title} numberOfLines={2}>{video.title}</Text>

//         {video.thumbnail_url ? (
//           <Image source={{ uri: video.thumbnail_url }} style={styles.thumbnail} resizeMode="cover" />
//         ) : (
//           <View style={[styles.thumbnail, styles.thumbnailFallback]}>
//             <Text style={{ color: '#fff', fontSize: 28 }}>▶</Text>
//           </View>
//         )}

//         <View style={styles.footer}>
//           <Text style={styles.summaryLabel}>📝 Tap for AI Summary</Text>
//         </View>

//       </TouchableOpacity>
//     );
//   }

//   const styles = StyleSheet.create({
//     card: { //card is for the box that encapsulates the entire video object - channel, date, avactar and thumbnail
//       backgroundColor: '#fff',
//       borderRadius: 12,
//       marginHorizontal: 12,
//       marginVertical: 6,
//       overflow: 'hidden',
//       borderWidth: 1,
//       borderColor: '#E5E7EB',
//     },
//     header: {
//       flexDirection: 'row',
//       alignItems: 'center',
//       gap: 10,
//       padding: 12,
//       paddingBottom: 8,
//     },
//     avatar: {
//       width: 36, height: 36,
//       borderRadius: 18,
//       backgroundColor: '#1D4ED8',
//       alignItems: 'center', justifyContent: 'center',
//     },
//     avatarText: {
//       color: '#fff', fontSize: 12, fontWeight: '800',
//     },
//     channelName: {
//       fontSize: 14, fontWeight: '700', color: '#111',
//     },
//     date: {
//       fontSize: 12, color: '#9CA3AF',
//     },
//     title: {
//       fontSize: 15, fontWeight: '700',
//       color: '#111', lineHeight: 21,
//       paddingHorizontal: 12, paddingBottom: 10,
//     },
//     thumbnail: {
//       width: '100%', height: 180,
//     },
//     thumbnailFallback: {
//       backgroundColor: '#1e3a5f',
//       alignItems: 'center', justifyContent: 'center',
//     },
//     footer: {
//       padding: 12, paddingTop: 10,
//       borderTopWidth: 1, borderTopColor: '#F3F4F6',
//     },
//     summaryLabel: {
//       color: '#2563EB', fontSize: 13, fontWeight: '600',
//     },
//   });
