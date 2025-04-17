# Path: app/utils/mongodb/client.py
# Description: MongoDB client for handling intractions with MongoDB.

import uuid
from pymongo import MongoClient
from functools import lru_cache
from app.config import get_settings
from app.logger import get_logger
from app.utils.models import MongoDbChunkDocument

settings = get_settings()
logger = get_logger()

class MongoDBClient:
    def __init__(self):
        """Initialize MongoDB client with connection to the database."""
        self.client = MongoClient(settings.get_mongo_uri())
        self.db = self.client[settings.MONGO_DB]
        self.collection = self.db[settings.MONGO_COLLECTION_REFERENCES_CHUNKS]
        logger.info(f"MongoDB client initialized for {settings.MONGO_DB}.{settings.MONGO_COLLECTION_REFERENCES_CHUNKS}")
        
    def insert_chunk(self, chunk: MongoDbChunkDocument) -> None:
        """
        Insert a document chunk into MongoDB.
        
        Args:
            chunk: The document chunk to insert
        """
        try:
            logger.debug(f"Inserting chunk into MongoDB: {chunk}")
            self.collection.insert_one(chunk.model_dump())
        except Exception as e:
            logger.error(f"Error inserting chunk into MongoDB: {str(e)}")
            raise
    
    def delete_chunk(self, chunk_id: uuid.UUID) -> None:
        """
        Delete a document chunk from MongoDB.
        
        Args:
            chunk_id: UUID of the reference
        """
        try:
            logger.debug(f"Deleting chunk from MongoDB with ID: {chunk_id}")
            self.collection.delete_many({"chunk_id": str(chunk_id)})
        except Exception as e:
            logger.error(f"Error deleting chunks from MongoDB: {str(e)}")
            raise

@lru_cache
def get_mongodb_client() -> MongoDBClient:
    """Get a singleton instance of the MongoDB client."""
    return MongoDBClient()
