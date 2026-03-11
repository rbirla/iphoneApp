import { View, Text } from "react-native";
import {useEffect, useState} from "react"

export default function ChannelScreen({route}) {
    const {id} = route.params;

    const [channelInfo, setChannelInfo] = useState(null);

    useEffect(() => {
        async function loadChannel() {
            // do api call from your backend
            // const result = ...ChannelScreen.
            // set the state var here for whatever you want to show
            // setChannelInfo(result);
        }
        loadChannel();
    }, []);

    return (
        <View>
            <Text> Channel is : {id}</Text>
        </View>
    );
}