import os
import requests
import re
from google import genai
from dotenv import load_dotenv
from fastapi import FastAPI, HTTPException
from youtube_transcript_api import YouTubeTranscriptApi
from pydantic import BaseModel
from typing import List, Dict, Any

# Load environment variables from .env file
load_dotenv()

# Retrieve API keys
YOUTUBE_API_KEY = os.getenv("YOUTUBE_API_KEY")
GEMINI_API_KEY =  os.getenv("GEMINI_API_KEY")  # From api_keys.txt
MONGO_URI = os.getenv("MONGO_URI")

# Configure Gemini Client
client = genai.Client(api_key=GEMINI_API_KEY)

# Ensure API keys are available
if not YOUTUBE_API_KEY:
    raise RuntimeError("❌ Missing API Keys! Check your .env file.")

# Initialize FastAPI app
app = FastAPI()

# Root endpoint to prevent 404 error on startup
@app.get("/")
def home():
    return {"message": "FastAPI YouTube API is running!"}

# Pydantic models for request validation
class YouTubeURL(BaseModel):
    url: str

class UserSubscriptionSync(BaseModel):
    access_token: str
    user_id: str

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

# Fetch user's YouTube subscriptions using their access token
def fetch_user_subscriptions(access_token: str) -> List[Dict[str, Any]]:
    """
    Fetches user's YouTube subscriptions using their Google OAuth access token
    Returns list of subscribed channels with details
    """
    print(f"Fetching user subscriptions...")
    
    # Fetch subscriptions from YouTube API
    url = "https://www.googleapis.com/youtube/v3/subscriptions"
    params = {
        "part": "snippet",
        "mine": "true",
        "maxResults": 50,  # Get up to 50 subscriptions
        "order": "relevance"
    }
    headers = {
        "Authorization": f"Bearer {access_token}"
    }
    
    try:
        response = requests.get(url, params=params, headers=headers)
        response.raise_for_status()
        data = response.json()
        
        if "items" not in data:
            print("No subscription data found")
            return []
        
        subscriptions = []
        for item in data["items"]:
            snippet = item["snippet"]
            channel_data = {
                "channel_id": snippet["resourceId"]["channelId"],
                "title": snippet["title"],
                "description": snippet["description"],
                "thumbnail_url": snippet["thumbnails"]["high"]["url"],
                "published_at": snippet["publishedAt"]
            }
            subscriptions.append(channel_data)
            
        print(f"Found {len(subscriptions)} subscriptions")
        return subscriptions
        
    except requests.exceptions.HTTPError as e:
        print(f"HTTP Error: {e}")
        if e.response.status_code == 403:
            raise HTTPException(status_code=403, detail="YouTube API access denied. Check permissions.")
        raise HTTPException(status_code=500, detail=f"Error fetching subscriptions: {str(e)}")
    except Exception as e:
        print(f"Error: {e}")
        raise HTTPException(status_code=500, detail=f"Error fetching subscriptions: {str(e)}")

# Get aggregated latest videos from multiple channels
def get_aggregated_feed(channel_ids: List[str], max_videos_per_channel: int = 3) -> List[Dict[str, Any]]:
    """
    Fetches latest videos from multiple channels and aggregates them
    """
    print(f"Fetching aggregated feed from {len(channel_ids)} channels...")
    
    all_videos = []
    
    for channel_id in channel_ids:
        try:
            # Get latest videos from this channel
            url = f"https://www.googleapis.com/youtube/v3/search"
            params = {
                "key": YOUTUBE_API_KEY,
                "channelId": channel_id,
                "part": "snippet",
                "order": "date",
                "maxResults": max_videos_per_channel,
                "type": "video"  # Only get videos, not playlists or channels
            }
            
            response = requests.get(url, params=params)
            response.raise_for_status()
            data = response.json()
            
            if "items" in data:
                for item in data["items"]:
                    if "videoId" in item["id"]:
                        video_data = {
                            "title": item["snippet"]["title"],
                            "video_id": item["id"]["videoId"],
                            "published_at": item["snippet"]["publishedAt"],
                            "video_url": f"https://youtu.be/{item['id']['videoId']}",
                            "thumbnail_url": item["snippet"]["thumbnails"]["high"]["url"],
                            "channel_title": item["snippet"]["channelTitle"],
                            "channel_id": channel_id,
                            "description": item["snippet"]["description"]
                        }
                        all_videos.append(video_data)
                        
        except Exception as e:
            print(f"Error fetching videos from channel {channel_id}: {e}")
            continue
    
    # Sort all videos by published date (most recent first)
    all_videos.sort(key=lambda x: x["published_at"], reverse=True)
    
    print(f"Found {len(all_videos)} total videos from user subscriptions")
    return all_videos

def get_transcript(video_id):
    try:
        # Use static method approach 
        transcript_data = YouTubeTranscriptApi.get_transcript(video_id, languages=['en'])
        
        # Extract text from the transcript data
        return ' '.join([entry['text'] for entry in transcript_data])
        
    except Exception as e:
        try:
            # Fallback: try without language specification
            transcript_data = YouTubeTranscriptApi.get_transcript(video_id)
            return ' '.join([entry['text'] for entry in transcript_data])
        except Exception as e2:
            print(f"No transcript available for video {video_id}: {e2}")
            return None


def summarize_youtube_video(youtube_url):
    """Summarize a YouTube video using Gemini API"""
    prompt = "Please provide a concise 3-4 sentence summary of this video's main content and key points."
    try:
        printf(f"In summarize_youtube_video before generate+content")
        response = client.models.generate_content(
            model="gemini-2.5-flash",
            contents=[
                {
                    "parts": [
                        {"file_data": {"file_uri": youtube_url}},
                        {"text": prompt}
                    ]
                }
            ]
        )
        return response.text
    except Exception as e:
        # Fallback to simple text approach if YouTube processing fails
        try:
            fallback_response = client.models.generate_content(
                model="gemini-2.5-flash",
                contents=f"Based on this YouTube URL: {youtube_url}, provide a general summary of what this video might contain based on the video ID and any patterns you recognize."
            )
            return fallback_response.text
        except Exception as fallback_error:
            raise HTTPException(status_code=500, detail=f"Error with Gemini API: {str(e)}, Fallback error: {str(fallback_error)}")

def summarize_text(text):
    """Legacy function for text-based summarization"""
    prompt = f"Summarize the following text in a concise way:\n\n{text}"
    try:
        response = client.models.generate_content(
            model="gemini-2.5-flash",
            contents=prompt
        )
        return response.text
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error with Gemini API: {str(e)}")

# API Endpoint: Get channel details
@app.post("/get_channel_info/")
def get_channel_info(request: YouTubeURL):
    channel_id = extract_channel_id(request.url)
    return get_channel_data(channel_id)

# API Endpoint: Get latest videos
@app.get("/get_latest_videos/{channel_id}")
def fetch_latest_videos(channel_id: str):
    return get_latest_videos(channel_id)

# API Endpoint: Summarize a specific video using Gemini direct YouTube processing
@app.get("/summarize_video/{video_id}")
def summarize_video(video_id: str):
    print(f"\nSummarizing video using Gemini: {video_id}")
    
    # Convert video ID to full YouTube URL
    youtube_url = f"https://www.youtube.com/watch?v={video_id}"
    
    try:
        # Use Gemini to directly process the YouTube video
        summary = summarize_youtube_video(youtube_url)
        print(f"Video summarized successfully!")
        return {"video_id": video_id, "summary": summary}
        
    except Exception as e:
        print(f"Error summarizing video {video_id}: {e}")
        
        # Fallback to transcript-based approach if available
        print(f"Trying fallback transcript approach...")
        transcript = get_transcript(video_id)
        
        if transcript:
            try:
                print(f"Transcript found! Using text summarization...")
                summary = summarize_text(transcript)
                return {"video_id": video_id, "summary": summary}
            except Exception as transcript_error:
                print(f"Transcript summarization failed: {transcript_error}")
        
        return {"error": f"Unable to summarize video: {str(e)}", "video_id": video_id}

# NEW API Endpoints for User Subscription Management

# API Endpoint: Sync user's YouTube subscriptions
@app.post("/sync_user_subscriptions/")
def sync_user_subscriptions(request: UserSubscriptionSync):
    """
    Syncs user's YouTube subscriptions using their Google OAuth access token
    Returns the user's subscribed channels
    """
    print(f"\nSyncing subscriptions for user: {request.user_id}")
    
    try:
        # Fetch subscriptions from YouTube API using user's access token
        subscriptions = fetch_user_subscriptions(request.access_token)
        
        # TODO: In the future, save subscriptions to database here
        # For now, just return the data to the frontend
        
        return {
            "success": True,
            "user_id": request.user_id,
            "subscriptions_count": len(subscriptions),
            "subscriptions": subscriptions
        }
        
    except Exception as e:
        print(f"Error syncing subscriptions: {e}")
        raise HTTPException(status_code=500, detail=f"Error syncing subscriptions: {str(e)}")

# API Endpoint: Get personalized feed from user's subscriptions
@app.post("/get_user_feed/")
def get_user_feed(request: UserSubscriptionSync):
    """
    Gets a personalized feed of latest videos from user's subscribed channels
    """
    print(f"\nGetting personalized feed for user: {request.user_id}")
    
    try:
        # First, fetch the user's subscriptions
        subscriptions = fetch_user_subscriptions(request.access_token)
        
        if not subscriptions:
            return {
                "success": True,
                "user_id": request.user_id,
                "videos": [],
                "message": "No subscriptions found"
            }
        
        # Extract channel IDs from subscriptions
        channel_ids = [sub["channel_id"] for sub in subscriptions]
        
        # Get aggregated feed from all subscribed channels
        feed_videos = get_aggregated_feed(channel_ids, max_videos_per_channel=3)
        
        return {
            "success": True,
            "user_id": request.user_id,
            "subscriptions_count": len(subscriptions),
            "videos_count": len(feed_videos),
            "videos": feed_videos
        }
        
    except Exception as e:
        print(f"Error getting user feed: {e}")
        raise HTTPException(status_code=500, detail=f"Error getting user feed: {str(e)}")

