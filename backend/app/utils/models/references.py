# Path: app/utils/models/references.py
# Description: Models for Exam CRUD operations

import uuid, enum
from pydantic import BaseModel, AnyUrl
from typing import List

class ReferencesTypeEnum(str, enum.Enum):
    TXT = "txt"
    PDF = "pdf"
    PPT = "ppt"
    DOCX = "docx"
    MD = "md"
    YT_VIDEO_URL = "yt_video_url"
    WEBSITE_URL = "website_url"

# Create Reference
# class ReferenceUploadRequest(BaseModel):
#     pass

class ReferenceUploadResponse(BaseModel):
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
    url: AnyUrl

# Delete Reference
# class DeleteReferenceRequest(BaseModel):
#     pass

# class DeleteReferenceResponse(BaseModel):
#    pass
