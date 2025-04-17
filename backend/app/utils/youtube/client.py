# Path: app/utils/youtube/client.py
# Description: This file contains code to get Youtube API client.

from functools import lru_cache
from googleapiclient.discovery import build
from app.logger import get_logger
from app.config import get_settings

# Get logger
logger = get_logger()

# Get app config
settings = get_settings()

# Initialize YouTube API client
@lru_cache
def get_youtube_client():
    """Create a YouTube API client."""
    try:
        youtube = build('youtube', 'v3', developerKey=settings.YOUTUBE_API_KEY)
        return youtube
    except Exception as e:
        logger.error(f"Error initializing YouTube API client: {str(e)}")
        raise
