import uuid
from typing import List, Optional
from pydantic import BaseModel

class ChatMessage(BaseModel):
    role: str
    content: str

class ChatRequest(BaseModel):
    message: str
    reference_ids: List[uuid.UUID]
    exam_id: uuid.UUID
    previous_messages: Optional[List[ChatMessage]] = None
