# Path: app/routers/metadata.py
# Description: Router for extracting metadata from YouTube videos and websites

import re
from fastapi import APIRouter, HTTPException, status
from selenium import webdriver
from selenium.webdriver.chrome.options import Options
from selenium.webdriver.common.by import By
from app.utils.models import (
    YouTubeMetadataRequest,
    YouTubeMetadataResponse,
    WebsiteMetadataRequest,
    WebsiteMetadataResponse,
)
from app.utils.youtube import get_youtube_client
from app.logger import get_logger

# Get logger
logger = get_logger()

# Initialize router
router = APIRouter(
    prefix="/metadata",
    tags=["Metadata"]
)

@router.post(
    "/youtube",
    response_model=YouTubeMetadataResponse,
    responses={
        200: {"description": "YouTube metadata extracted successfully"},
        400: {"description": "Bad request - Invalid YouTube URL"},
        500: {"description": "Internal server error"}
    },
    summary="Extract metadata from a YouTube video"
)
def extract_youtube_metadata(request: YouTubeMetadataRequest) -> YouTubeMetadataResponse:
    """
    Extract title and description from a YouTube video URL.
    
    Parameters:
        - **url**: A valid YouTube video URL
        
    Returns:
        - **title**: The title of the YouTube video
        - **description**: The description of the YouTube video
    """
    try:
        # Extract video ID from URL
        video_id = None
        youtube_patterns = [
            r'(?:https?:\/\/)?(?:www\.)?youtube\.com\/watch\?v=([^&\s]+)',
            r'(?:https?:\/\/)?(?:www\.)?youtu\.be\/([^\?\s]+)',
            r'(?:https?:\/\/)?(?:www\.)?youtube\.com\/embed\/([^\?\s]+)',
            r'(?:https?:\/\/)?(?:www\.)?youtube\.com\/shorts\/([^\?\s]+)'
        ]
        
        for pattern in youtube_patterns:
            match = re.search(pattern, request.url)
            if match:
                video_id = match.group(1)
                break
        
        if not video_id:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Invalid YouTube URL. Could not extract video ID."
            )
        
        # Get YouTube client
        youtube = get_youtube_client()
        
        # Call the YouTube API to get video details
        response = youtube.videos().list(
            part="snippet",
            id=video_id
        ).execute()
        
        # Check if any videos were found
        if not response.get("items"):
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="YouTube video not found or unavailable."
            )
        
        # Extract title and description
        snippet = response["items"][0]["snippet"]
        title = snippet["title"]
        description = snippet["description"]
        
        return YouTubeMetadataResponse(
            title=title,
            description=description
        )
    
    except HTTPException:
        # Re-raise HTTP exceptions
        raise
    
    except Exception as e:
        logger.error(f"Error extracting YouTube metadata: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to extract YouTube metadata."
        )

@router.post(
    "/website",
    response_model=WebsiteMetadataResponse,
    responses={
        200: {"description": "Website metadata extracted successfully"},
        400: {"description": "Bad request - Invalid URL"},
        500: {"description": "Internal server error"}
    },
    summary="Extract metadata from a website"
)
def extract_website_metadata(request: WebsiteMetadataRequest) -> WebsiteMetadataResponse:
    """
    Extract title from a website URL.
    
    Parameters:
        - **url**: A valid website URL
        
    Returns:
        - **title**: The title of the website
    """
    try:
        # Setup headless Chrome browser
        chrome_options = Options()
        chrome_options.add_argument("--headless")
        chrome_options.add_argument("--no-sandbox")
        chrome_options.add_argument("--disable-dev-shm-usage")
        
        # Initialize driver
        driver = webdriver.Chrome(options=chrome_options)
        
        try:
            # Load the website
            driver.get(request.url)
            
            # Get the title
            title = driver.title
            
            if not title:
                # Try to find title tag directly
                try:
                    title_element = driver.find_element(By.TAG_NAME, "title")
                    title = title_element.text
                except:
                    title = "Untitled website"
            
            return WebsiteMetadataResponse(title=title)
            
        finally:
            # Always close the driver
            driver.quit()
    
    except Exception as e:
        logger.error(f"Error extracting website metadata: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to extract website metadata."
        )
