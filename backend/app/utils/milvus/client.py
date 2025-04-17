import uuid
from functools import lru_cache
from pymilvus import connections, Collection
from app.config import get_settings
from app.logger import get_logger
from app.utils.models import MilvusChunkRecord

settings = get_settings()
logger = get_logger()

class MilvusClient:
    def __init__(self):
        """Initialize Milvus client with connection to the collection."""
        # Connect to Milvus server
        connections.connect(
            alias="default",
            host=settings.MILVUS_HOST,
            port=settings.MILVUS_PORT
        )
        
        # Get collection
        self.collection = Collection(settings.MILVUS_COLLECTION)
        self.collection.load()
        logger.info(f"Milvus client initialized for collection {settings.MILVUS_COLLECTION}")
    
    def insert_vector(self, record: MilvusChunkRecord) -> None:
        """
        Insert embedding vector into Milvus.
        
        Args:
            record: MilvusChunkRecord objects containing chunk_id, reference_id and embedding
        """
        try:
            logger.debug(f"Inserting vector into Milvus: {record}")
            self.collection.insert(record.model_dump())
        except Exception as e:
            logger.error(f"Error inserting vectors into Milvus: {str(e)}")
            raise
    
    def delete_vector(self, chunk_id: uuid.UUID) -> None:
        """
        Delete embedding vector from Milvus.
        
        Args:
            chunk_id: UUID of the reference
        """
        try:
            logger.debug(f"Deleting vector from Milvus with ID: {chunk_id}")
            self.collection.delete(f"chunk_id == '{str(chunk_id)}'")
        except Exception as e:
            logger.error(f"Error deleting vectors from Milvus: {str(e)}")
            raise

@lru_cache
def get_milvus_client() -> MilvusClient:
    """Get a singleton instance of the Milvus client."""
    return MilvusClient()
