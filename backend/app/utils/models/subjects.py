# Path: app/utils/models/subjects.py
# Description: Models for Subjects CRUD operations

import re, uuid
from pydantic import BaseModel, Field, field_validator
from typing import Optional, List

# Helper for color validation
def validate_hex_color(color: str) -> str:
    """Validate and format hex color code."""
    pattern = r'^([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$'
    if not re.match(pattern, color):
        raise ValueError('Invalid hex color code')
    
    return color

# Create Subject
class SubjectCreateRequest(BaseModel):
    name: str = Field(..., min_length=1, max_length=100, description="Name of the subject")
    color: str = Field(..., description="Hex color code (e.g., FF5733) without #")
    
    @field_validator('color')
    def validate_color(cls, value):
        return validate_hex_color(value)

class SubjectCreateResponse(BaseModel):
    id: uuid.UUID
    name: str
    color: str

# Get Subject
# We'll never need to get a single subject by ID.

# List Subject
# class ListSubjectRequest(BaseModel):
#     pass  # Empty as there are no specific parameters

class SubjectItem(BaseModel):
    id: uuid.UUID
    name: str
    color: str

class ListSubjectResponse(BaseModel):
    subjects: List[SubjectItem]

# Update Subject
class UpdateSubjectRequest(BaseModel):
    name: Optional[str] = Field(None, min_length=1, max_length=100, description="Name of the subject")
    color: Optional[str] = Field(None, description="Hex color code (e.g., FF5733) without #")
    
    @field_validator('color')
    def validate_color(cls, value):
        if value is None:
            return value
        
        return validate_hex_color(value)

class UpdateSubjectResponse(BaseModel):
    id: uuid.UUID
    name: str
    color: str

# Delete Subject
# class DeleteSubjectRequest(BaseModel):
#     pass  # Empty as the ID is in the URL

# class DeleteSubjectResponse(BaseModel):
#     pass  # Empty as the response is 204 No Content
