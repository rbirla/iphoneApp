import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet, ScrollView, Button, ActivityIndicator, Alert,  Platform } from "react-native";
import {useRoute, useNavigation} from "@react-navigation/native";


import { BASE_URL } from "../api/api";


export default function VideoDetailScreen() {

const parameter = useRoute(); //gets entire video object including video_url, name
const navigation = useNavigation(); 
const video = parameter?.params?.video; //shorthand way to pull video details through params

const [summary, setSummary] = useState(""); //VideoSummary used to hold current value and fetchVideoSummary is the function used to update the state
const [loading, setLoading] = useState(false);

// Set the header title dynamically using React Navigation
useEffect(() => {
  if (video?.title) {
    navigation.setOptions({ title: "Video Summary: " + video.title });
  }
}, [video, navigation]);

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
  <View style={{ flex: 1, padding: 20 }}>
    <Text style={{ fontSize: 18, fontWeight: 'bold', marginBottom: 10 }}>{video.title}</Text>
    <Text>{summary}</Text>
  </View>
  )

}

/*
On line 272 to 276, why are we using Stack.Screen? What is the point of it?
Currently it does not load and we get an error that says: "ERROR  Warning: Error: No filename found. This is likely a bug in expo-router."
What else could we do instead of this, or what should we do to fix this? What imports or elements are missing from this page? Compare to other pages which are working properly because this page gives an error.
*/
//need to display the summary using openai api call