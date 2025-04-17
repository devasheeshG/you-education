# Path: app/utils/models/references.py
# Description: Models for Exam CRUD operations

import uuid, enum
from pydantic import BaseModel, HttpUrl, field_validator
from typing import List

class ReferencesTypeEnum(str, enum.Enum):
    TXT = "txt"
    PDF = "pdf"
    PPT = "ppt"
    DOCX = "docx"
    MD = "md"
    YT_VIDEO_URL = "yt_video_url"
    WEBSITE_URL = "website_url"

# Create Reference (File)
# class ReferenceUploadRequest(BaseModel):
#     pass

class ReferenceUploadResponse(BaseModel):
    id: uuid.UUID
    type: ReferencesTypeEnum
    name: str

# Create Reference (URL)
class ReferenceCreateRequest(BaseModel):
    type: ReferencesTypeEnum
    url: HttpUrl
    
    @field_validator("type")
    def validate_type(cls, v):
        if v not in [ReferencesTypeEnum.YT_VIDEO_URL, ReferencesTypeEnum.WEBSITE_URL]:
            raise ValueError("Invalid reference type for URL")
        return v

class ReferenceCreateResponse(BaseModel):
    id: uuid.UUID
    type: ReferencesTypeEnum
    name: str

# List References
# class ListReferenceRequest(BaseModel):
#     pass

class ReferenceItem(BaseModel):
    id: uuid.UUID
    type: ReferencesTypeEnum
    name: str

class ListReferenceResponse(BaseModel):
    references: List[ReferenceItem]

# Download Reference
# class DownloadReferenceRequest(BaseModel):
#     pass

class DownloadReferenceResponse(BaseModel):
    url: HttpUrl

# Delete Reference
# class DeleteReferenceRequest(BaseModel):
#     pass

# class DeleteReferenceResponse(BaseModel):
#    pass
