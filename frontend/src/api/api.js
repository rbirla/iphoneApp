import axios from "axios";

// ✅ Replace with your backend IP (run `ipconfig` if needed)
const BASE_URL = "http://192.168.86.32:8000";

const axiosInstance = axios.create({
  baseURL: BASE_URL,
  timeout: 10000, // 10 seconds timeout
});

// ✅ POST to fetch channel info using a YouTube URL
export const getChannelInfo = async (channelUrl) => {
  try {
    const response = await axiosInstance.post("/get_channel_info/", {
      url: channelUrl,
    });
    return response.data;
  } catch (error) {
    console.error("❌ Error fetching channel info:", error.message);
    throw error;
  }
};

// ✅ GET to fetch latest videos by channel ID
export const getLatestVideos = async (channelId) => {
  try {
    const response = await axiosInstance.get(`/get_latest_videos/${channelId}`);
    return response.data;
  } catch (error) {
    console.error("❌ Error fetching latest videos:", error.message);
    throw error;
  }
};
