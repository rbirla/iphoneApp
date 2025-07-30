import os
import requests
import re
import openai
from dotenv import load_dotenv
from fastapi import FastAPI, HTTPException
from youtube_transcript_api import YouTubeTranscriptApi
from pydantic import BaseModel

# Load environment variables from .env file
load_dotenv()

# Retrieve API keys
OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")
YOUTUBE_API_KEY = os.getenv("YOUTUBE_API_KEY")
MONGO_URI = os.getenv("MONGO_URI")

# Ensure API keys are available
if not OPENAI_API_KEY or not YOUTUBE_API_KEY:
    raise RuntimeError("❌ Missing API Keys! Check your .env file.")

# Initialize FastAPI app
app = FastAPI()

openai.api_key = OPENAI_API_KEY  # Set OpenAI API Key

# Root endpoint to prevent 404 error on startup
@app.get("/")
def home():
    return {"message": "FastAPI YouTube API is running!"}

# Pydantic model for request validation
class YouTubeURL(BaseModel):
    url: str

# Extracts the Channel ID from a YouTube channel URL
def extract_channel_id(youtube_url):
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
            return fetch_channel_id(match.group(1))

    raise HTTPException(status_code=400, detail="Invalid YouTube URL format.")

# Converts a YouTube handle into a Channel ID
def fetch_channel_id(username_or_id):
    url = f"https://www.googleapis.com/youtube/v3/channels?part=id&forHandle=@{username_or_id}&key={YOUTUBE_API_KEY}"
    response = requests.get(url).json()

    if "items" in response and response["items"]:
        return response["items"][0]["id"]

    raise HTTPException(status_code=404, detail="Channel ID not found. Check if the YouTube handle is correct.")

# Fetches channel details
def get_channel_data(channel_id):
    url = f"https://www.googleapis.com/youtube/v3/channels?part=snippet,statistics&id={channel_id}&key={YOUTUBE_API_KEY}"
    response = requests.get(url).json()

    if "items" in response and response["items"]:
        channel_info = response["items"][0]
        return {
            "title": channel_info["snippet"]["title"],
            "description": channel_info["snippet"]["description"],
            "subscriber_count": channel_info["statistics"]["subscriberCount"],
            "video_count": channel_info["statistics"]["videoCount"],
            "channel_url": f"https://www.youtube.com/channel/{channel_id}"
        }

    raise HTTPException(status_code=404, detail="Channel not found.")

# Fetches the latest 3 videos from the channel
def get_latest_videos(channel_id):
    url = f"https://www.googleapis.com/youtube/v3/search?key={YOUTUBE_API_KEY}&channelId={channel_id}&part=snippet&order=date&maxResults=3"
    response = requests.get(url).json()

    if "items" in response:
        return [
            {
                "title": item["snippet"]["title"],
                "video_id": item["id"].get("videoId", "N/A"),  # Prevent KeyError
                "published_at": item["snippet"]["publishedAt"],
                "video_url": f"https://youtu.be/{item['id'].get('videoId', '')}"
            }
            for item in response["items"]
            if "videoId" in item["id"]
        ]

    raise HTTPException(status_code=404, detail="No recent videos found.")

def get_transcript(video_id):
    try:
        # Try fetching manually created subtitles
        transcript_list = YouTubeTranscriptApi.get_transcript(video_id)
        return ' '.join([entry['text'] for entry in transcript_list])
    except Exception:
        try:
            # Try fetching auto-generated subtitles
            transcript_list = YouTubeTranscriptApi.get_transcript(video_id, languages=['en'])
            return ' '.join([entry['text'] for entry in transcript_list])
        except Exception as e:
            return None  # No transcript available


from openai import OpenAI

# Initialize OpenAI client
client = OpenAI(api_key=OPENAI_API_KEY)

def summarize_text(text):
    prompt = f"Summarize the following text:\n\n{text}"
    try:
        response = client.chat.completions.create(
            model="gpt-4",
            messages=[
                {"role": "system", "content": "You are a helpful assistant."},
                {"role": "user", "content": prompt}
            ],
            max_tokens=300,
            temperature=0.5
        )
        return response.choices[0].message.content
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error with OpenAI API: {str(e)}")

# API Endpoint: Get channel details
@app.post("/get_channel_info/")
def get_channel_info(request: YouTubeURL):
    channel_id = extract_channel_id(request.url)
    return get_channel_data(channel_id)

# API Endpoint: Get latest videos
@app.get("/get_latest_videos/{channel_id}")
def fetch_latest_videos(channel_id: str):
    return get_latest_videos(channel_id)

# API Endpoint: Summarize a specific video
@app.get("/summarize_video/{video_id}")
def summarize_video(video_id: str):
    print(f"\n🔍 Fetching transcript for video: {video_id}")
    transcript = get_transcript(video_id)

    if transcript:
        print(f"✅ Transcript Found! Summarizing...")
        summary = summarize_text(transcript)
        return {"video_id": video_id, "summary": summary}

    print(f"❌ No transcript available for video: {video_id}")
    return {"error": "No transcript available", "video_id": video_id}  # ✅ Return JSON instead of empty response

