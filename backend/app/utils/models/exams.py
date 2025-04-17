# Path: app/utils/models/exams.py
# Description: Models for Exam CRUD operations

import uuid
from pydantic import BaseModel, Field
from datetime import datetime
from typing import Optional, List
from .subjects import SubjectItem

# Create Exam
class ExamCreateRequest(BaseModel):
    name: str = Field(..., min_length=1, max_length=100, description="Name of the exam")
    subject_id: uuid.UUID = Field(..., description="ID of the subject this exam belongs to")
    description: Optional[str] = Field(None, description="Description of the exam")
    exam_datetime: datetime = Field(..., description="Date and time of the exam with timezone")
    total_hours_to_dedicate: float = Field(..., ge=1, le=50, description="Total hours to dedicate to studying")

class ExamCreateResponse(BaseModel):
    id: uuid.UUID
    name: str
    description: Optional[str]
    exam_datetime: datetime
    total_hours_to_dedicate: float
    subject: SubjectItem

# List Exam
# class ListExamRequest(BaseModel):
#     pass

class ExamItem(BaseModel):
    id: uuid.UUID
    name: str
    description: Optional[str]
    exam_datetime: datetime
    total_hours_to_dedicate: float
    subject: SubjectItem

class ListExamResponse(BaseModel):
    upcoming_exams: List[ExamItem]
    previous_exams: List[ExamItem]

# Get Exam
# We'll never need to get a single exam by ID.

# Update Exam
class UpdateExamRequest(BaseModel):
    name: Optional[str] = Field(None, min_length=1, max_length=100, description="Name of the exam")
    subject_id: Optional[uuid.UUID] = Field(None, description="ID of the subject this exam belongs to")
    description: Optional[str] = Field(None, description="Description of the exam")
    exam_datetime: Optional[datetime] = Field(None, description="Date and time of the exam with timezone")
    total_hours_to_dedicate: Optional[float] = Field(None, ge=1, le=50, description="Total hours to dedicate to studying")

class UpdateExamResponse(BaseModel):
    id: uuid.UUID
    name: str
    description: Optional[str]
    exam_datetime: datetime
    total_hours_to_dedicate: float
    subject: SubjectItem

# Delete Exam
# class DeleteExamRequest(BaseModel):
#     pass  # Empty as the ID is in the URL

# class DeleteExamResponse(BaseModel):
#     pass  # Empty as the response is 204 No Content
