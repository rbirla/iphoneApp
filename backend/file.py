import requests
import re
import os
from dotenv import load_dotenv
from youtube_transcript_api import YouTubeTranscriptApi
import openai

# Load environment variables from .env file
load_dotenv()

# Retrieve API keys
OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")
YOUTUBE_API_KEY = os.getenv("YOUTUBE_API_KEY")

openai.api_key = OPENAI_API_KEY  # Set OpenAI API Key

def extract_channel_id(youtube_url):
    """
    Extracts the Channel ID from a YouTube channel URL.
    """
    youtube_url = youtube_url.strip()
    
    patterns = [
        r"youtube\.com/@([\w\d-]+)",  # Handle (@username)
        r"youtube\.com/c/([\w\d-]+)",  # Custom channel URL (/c/username)
        r"youtube\.com/channel/([\w\d-]+)",  # Direct channel ID
        r"youtube\.com/user/([\w\d-]+)"  # Old YouTube username format
    ]

    for pattern in patterns:
        match = re.search(pattern, youtube_url)
        if match:
            username_or_id = match.group(1)
            return fetch_channel_id(username_or_id)
    
    print("❌ Could not extract a valid Channel ID from the URL.")
    return None

def fetch_channel_id(username_or_id):
    """
    Converts a YouTube handle into a Channel ID.
    """
    url = f"https://www.googleapis.com/youtube/v3/channels?part=id&forHandle=@{username_or_id}&key={YOUTUBE_API_KEY}"
    response = requests.get(url).json()

    if "items" in response and response["items"]:
        return response["items"][0]["id"]
    else:
        print("❌ Failed to fetch Channel ID. API may have limits.")
        return None

def get_channel_data(channel_id):
    """
    Fetches channel details like title, description, subscriber count, etc.
    """
    url = f"https://www.googleapis.com/youtube/v3/channels?part=snippet,statistics&id={channel_id}&key={YOUTUBE_API_KEY}"
    response = requests.get(url).json()

    if "items" in response and response["items"]:
        channel_info = response["items"][0]
        data = {
            "title": channel_info["snippet"]["title"],
            "description": channel_info["snippet"]["description"],
            "subscriber_count": channel_info["statistics"]["subscriberCount"],
            "video_count": channel_info["statistics"]["videoCount"],
            "channel_url": f"https://www.youtube.com/channel/{channel_id}"
        }
        return data
    return None

def get_latest_videos(channel_id):
    """
    Fetches the latest 3 video uploads from the channel.
    """
    url = f"https://www.googleapis.com/youtube/v3/search?key={YOUTUBE_API_KEY}&channelId={channel_id}&part=snippet&order=date&maxResults=3"
    response = requests.get(url).json()

    videos = []
    if "items" in response:
        for item in response["items"]:
            if "videoId" in item["id"]:
                video_data = {
                    "title": item["snippet"]["title"],
                    "video_id": item["id"]["videoId"],
                    "published_at": item["snippet"]["publishedAt"],
                    "video_url": f"https://youtu.be/{item['id']['videoId']}"
                }
                videos.append(video_data)
    return videos

def get_transcript(video_id):
    """
    Fetches the transcript of a given YouTube video.
    """
    try:
        transcript_list = YouTubeTranscriptApi.get_transcript(video_id)
        transcript = ' '.join([entry['text'] for entry in transcript_list])
        return transcript
    except Exception as e:
        print(f"⚠️ No transcript available for video {video_id}: {e}")
        return None

def summarize_text(text):
    print("Summarizing text...")

    # Split long text into manageable chunks
    max_length = 4000
    chunks = [text[i:i+max_length] for i in range(0, len(text), max_length)]
    summaries = []

    for chunk in chunks:
        prompt = f"Summarize the following text:\n\n{chunk}"

        response = openai.chat.completions.create(
            model="gpt-4",
            messages=[
                {"role": "system", "content": "You are a helpful assistant."},
                {"role": "user", "content": prompt}
            ],
            max_tokens = 300,
            temperature = 0.5
        
        )

        summary = response.choices[0].message.content
        summaries.append(summary)

    return " ".join(summaries)

def main():
    youtube_url = input("Enter YouTube channel URL: ").strip()
    
    # Step 1: Extract Channel ID
    channel_id = extract_channel_id(youtube_url)
    if not channel_id:
        print("❌ Could not retrieve Channel ID. Exiting...")
        return

    # Step 2: Get Channel Data
    channel_info = get_channel_data(channel_id)
    if channel_info:
        print("\n🎬 **YouTube Channel Information:**")
        print(f"📌 Title: {channel_info['title']}")
        print(f"📃 Description: {channel_info['description'][:150]}...")  # Limit preview
        print(f"👥 Subscribers: {channel_info['subscriber_count']}")
        print(f"📹 Total Videos: {channel_info['video_count']}")
        print(f"🔗 Channel URL: {channel_info['channel_url']}")

    # Step 3: Get Latest Videos
    print("\n📌 **Latest Videos:**")
    videos = get_latest_videos(channel_id)
    if videos:
        for video in videos:
            print(f"🎥 {video['title']} - {video['video_url']} (Published: {video['published_at']})")

        # Step 4: Summarize Videos
        print("\n📌 **Summarizing Latest Videos:**")
        for video in videos:
            transcript = get_transcript(video["video_id"])
            if transcript:
                summary = summarize_text(transcript)
                print(f"\n📜 Summary for '{video['title']}':\n{summary}\n")
            else:
                print(f"⚠️ Skipping summary for {video['title']} (No transcript available).")
    else:
        print("❌ No recent videos found.")

if __name__ == "__main__":
    main()