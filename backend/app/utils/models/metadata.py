# Path: app/utils/models/metadata.py
# Description: Models for metadata extraction from YouTube and websites

from pydantic import BaseModel

# YouTube Video Metadata
class YouTubeMetadataRequest(BaseModel):
    url: str

class YouTubeMetadataResponse(BaseModel):
    title: str
    description: str

# Website Metadata
class WebsiteMetadataRequest(BaseModel):
    url: str

class WebsiteMetadataResponse(BaseModel):
    title: str
