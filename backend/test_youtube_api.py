# import requests

# BASE_URL = "http://127.0.0.1:8000"

# # ✅ Test Getting Channel Info via FastAPI
# youtube_url = "https://www.youtube.com/@ChrisWillx"
# response = requests.post(f"{BASE_URL}/get_channel_info/", json={"url": youtube_url})
# print("\n📡 Channel Info Response:")
# print(response.json())

# # ✅ Test Getting Latest Videos via FastAPI
# channel_id = "UCIaH-gZIVC432YRjNVvnyCA"  # Replace with actual ID from previous response
# response = requests.get(f"{BASE_URL}/get_latest_videos/{channel_id}")
# print("\n📺 Latest Videos Response:")
# print(response.json())

# # ✅ Test Summarizing a Video via FastAPI
# video_id = "abcd1234"  # Replace with actual video ID from previous response
# response = requests.get(f"{BASE_URL}/summarize_video/{video_id}")
# print("\n📜 Video Summary Response:")
# print(response.json())


import requests

BASE_URL = "http://127.0.0.1:8000"

# ✅ Step 1: Get Channel Info
youtube_url = "https://www.youtube.com/@ChrisWillx"
response = requests.post(f"{BASE_URL}/get_channel_info/", json={"url": youtube_url})
channel_info = response.json()
print("\n📡 Channel Info Response:")
print(channel_info)

# ✅ Step 2: Get Latest Videos
channel_id = channel_info.get("channel_url", "").split("/")[-1]  # Extracts channel ID
response = requests.get(f"{BASE_URL}/get_latest_videos/{channel_id}")
latest_videos = response.json()
print("\n📺 Latest Videos Response:")
print(latest_videos)

# ✅ Step 3: Summarize the First Video
if latest_videos:
    first_video_id = latest_videos[0]["video_id"]  # ✅ Correctly gets the first video ID
    print(f"\n🎥 Summarizing Video: {first_video_id}")
    
    response = requests.get(f"{BASE_URL}/summarize_video/{first_video_id}")
    print("\n📜 Video Summary Response:")
    print(response.json())
else:
    print("❌ No videos found!")
