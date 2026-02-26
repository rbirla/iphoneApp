// import React, { useState, useEffect } from "react";
// import { View, Text, StyleSheet, ScrollView, Button, ActivityIndicator, Alert } from "react-native";
// import { useRoute, useNavigation } from "@react-navigation/native";

// const VideoDetailScreen = () => {
//   const [summary, setSummary] = useState("");
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState("");
  
//   const route = useRoute();
//   const navigation = useNavigation();
  
//   // Get video data passed from the feed
//   const { video } = route.params || {};
  
//   useEffect(() => {
//     if (video && video.video_id) {
//       fetchVideoSummary(video.video_id);
//     } else {
//       setError("No video data provided");
//       setLoading(false);
//     }
//   }, [video]);

//   const fetchVideoSummary = async (videoId) => {
//     try {
//       setLoading(true);
//       console.log(`🔍 Fetching summary for video: ${videoId}`);
      
//       // Call the backend summarization endpoint
//       const response = await fetch(`http://192.168.86.20:8000/summarize_video/${videoId}`);
//       const data = await response.json();
      
//       if (data.error) {
//         setError(data.error);
//         console.log(`❌ No transcript available for video: ${videoId}`);
//       } else {
//         setSummary(data.summary);
//         console.log(`✅ Summary received for video: ${videoId}`);
//       }
      
//     } catch (err) {
//       console.error("❌ Error fetching video summary:", err);
//       setError("Failed to load video summary. Please try again.");
//     } finally {
//       setLoading(false);
//     }
//   };

//   const handleRetry = () => {
//     if (video && video.video_id) {
//       fetchVideoSummary(video.video_id);
//     }
//   };

//   const openVideoInBrowser = () => {
//     if (video && video.video_url) {
//       // In a real app, you'd use Linking.openURL
//       Alert.alert("Open Video", `Would open: ${video.video_url}`, [
//         { text: "Cancel" },
//         { text: "OK" }
//       ]);
//     }
//   };

//   if (!video) {
//     return (
//       <View style={styles.container}>
//         <Text style={styles.errorText}>No video data provided</Text>
//         <Button title="Go Back" onPress={() => navigation.goBack()} />
//       </View>
//     );
//   }

//   return (
//     <ScrollView style={styles.container}>
//       {/* Video Info Header */}
//       <View style={styles.header}>
//         <Text style={styles.title}>{video.title}</Text>
//         <Text style={styles.channel}>{video.channel_title}</Text>
//         <Text style={styles.date}>
//           Published: {new Date(video.published_at).toLocaleDateString()}
//         </Text>
        
//         <Button
//           title="📺 Watch on YouTube"
//           onPress={openVideoInBrowser}
//           color="#FF0000"
//         />
//       </View>

//       {/* Summary Section */}
//       <View style={styles.summarySection}>
//         <Text style={styles.sectionTitle}>🤖 AI Summary</Text>
        
//         {loading && (
//           <View style={styles.loadingContainer}>
//             <ActivityIndicator size="large" color="#0066cc" />
//             <Text style={styles.loadingText}>Generating AI summary...</Text>
//             <Text style={styles.loadingSubtext}>This may take a few moments</Text>
//           </View>
//         )}
        
//         {error && (
//           <View style={styles.errorContainer}>
//             <Text style={styles.errorText}>❌ {error}</Text>
//             <Button title="🔄 Retry" onPress={handleRetry} />
//           </View>
//         )}
        
//         {summary && !loading && (
//           <View style={styles.summaryContainer}>
//             <Text style={styles.summaryText}>{summary}</Text>
//           </View>
//         )}
//       </View>

//       {/* Navigation */}
//       <View style={styles.navigation}>
//         <Button
//           title="← Back to Feed"
//           onPress={() => navigation.goBack()}
//         />
//       </View>
//     </ScrollView>
//   );
// };

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     backgroundColor: '#fff',
//   },
//   header: {
//     padding: 20,
//     borderBottomWidth: 1,
//     borderBottomColor: '#eee',
//   },
//   title: {
//     fontSize: 18,
//     fontWeight: 'bold',
//     marginBottom: 8,
//     lineHeight: 24,
//   },
//   channel: {
//     fontSize: 16,
//     color: '#666',
//     marginBottom: 4,
//   },
//   date: {
//     fontSize: 14,
//     color: '#999',
//     marginBottom: 16,
//   },
//   summarySection: {
//     padding: 20,
//   },
//   sectionTitle: {
//     fontSize: 20,
//     fontWeight: 'bold',
//     marginBottom: 16,
//     color: '#333',
//   },
//   loadingContainer: {
//     alignItems: 'center',
//     padding: 40,
//   },
//   loadingText: {
//     marginTop: 16,
//     fontSize: 16,
//     color: '#666',
//   },
//   loadingSubtext: {
//     marginTop: 8,
//     fontSize: 14,
//     color: '#999',
//   },
//   errorContainer: {
//     alignItems: 'center',
//     padding: 20,
//     backgroundColor: '#ffe6e6',
//     borderRadius: 8,
//   },
//   errorText: {
//     fontSize: 16,
//     color: '#cc0000',
//     marginBottom: 16,
//     textAlign: 'center',
//   },
//   summaryContainer: {
//     backgroundColor: '#f8f9fa',
//     padding: 16,
//     borderRadius: 8,
//     borderLeftWidth: 4,
//     borderLeftColor: '#0066cc',
//   },
//   summaryText: {
//     fontSize: 16,
//     lineHeight: 24,
//     color: '#333',
//   },
//   navigation: {
//     padding: 20,
//     marginTop: 20,
//   },
// });

// export default VideoDetailScreen;


import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet, ScrollView, Button, ActivityIndicator, Alert,  Platform } from "react-native";
import {useRoute, useNavigation} from "@react-navigation/native";
import { Stack } from 'expo-router';


import { BASE_URL } from "../api/api";


export default function VideoDetailScreen() {

const parameter = useRoute(); //gets entire video object including video_url, name
const navigation = useNavigation(); 
const video = parameter?.params?.video; //shorthand way to pull video details through params

const [summary, setSummary] = useState(""); //VideoSummary used to hold current value and fetchVideoSummary is the function used to update the state
const [loading, setLoading] = useState(false);

console.log("1");
console.log(parameter.params);
console.log(parameter.params.video);
console.log(parameter.params.video.video_id);

useEffect(()=>{
  async function fetchVideoSummary(videoId){
    try{
      console.log("2");
      setLoading(true);
      const url = `${BASE_URL}/summarize_video/${encodeURIComponent(videoId)}`;
      console.log("3");
      console.log("GET", url);

      fetch(url)
      .then(response =>{ 
      console.log("Response: ", response) //gets api response of binary data format
      return response.json()})
    
      .then((json) =>{
        console.log("JSON", json); //decodes the message within json blob object and gives js object with keys {summary:"",video_id:""}
        setSummary(json.summary)})
    
    
      .catch(error=>console.log("error regarding the retrieval of", error));

      // summary = await url.json(); 
       console.log("Summary",summary);
       
    

    }
    catch (exp){
      console.log("4");
      console.log("EXP: ", exp);
    }
  }
  console.log("1.5")
  fetchVideoSummary(video.video_id);
}, [])

  return( 
  <View>
    <Stack>
      <Stack.Screen 
        name="Video Summary" 
        options ={({route})=>({title: "Video Summary" + route.params?.title})} /> 
    </Stack>
    <Text>{video.title}</Text>
    <Text>{summary}</Text>
  </View>
  )

}

/*
On line 272 to 276, why are we using Stack.Screen? What is the point of it?
Currently it does not load and we get an error that says: "ERROR  Warning: Error: No filename found. This is likely a bug in expo-router."
What else could we do instead of this, or what should we do to fix this? What imports or elements are missing from this page? Compare to other pages which are working properly because this page gives an error.
*/

// async function fetchVideoSummary(videoId){
//   try{
//     setLoading(true); 
//       const url = `${BASE_URL}/summarize_video/${encodeURIComponent(videoId)}`;
//       console.log("GET", url);

//       const response = await fetch(url, {headers:{Accept: "application/json"}});
//       if (!response.ok) {
//         throw new Error(`Server error ${res.status}: ${text.slice(0, 200)}`);
//       }

//   }
//   catch(error){
//     console.log(error);

//   }
// }





//need to display the summary using openai api call


