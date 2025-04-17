import uuid
from pydantic import BaseModel
from typing import List

class MongoDbChunkDocument(BaseModel):
    chunk_id: str
    content: str

class MilvusChunkRecord(BaseModel):
    chunk_id: str
    reference_id: str
    embedding: List[float]
