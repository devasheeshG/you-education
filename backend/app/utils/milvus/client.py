from functools import lru_cache
import uuid
from typing import List, Tuple
from pymilvus import connections, Collection, utility
from app.config import get_settings
from app.logger import get_logger
from app.utils.models.internal import MilvusChunkRecord

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
    
    def insert_vectors(self, records: List[MilvusChunkRecord]) -> bool:
        """
        Insert embedding vectors into Milvus.
        
        Args:
            records: List of MilvusChunkRecord objects containing chunk_id, reference_id and embedding
            
        Returns:
            bool: True if insertion was successful
        """
        try:
            if not records:
                return True
                
            # Format data for Milvus insertion
            chunk_ids = [str(record.chunk_id) for record in records]
            reference_ids = [str(record.reference_id) for record in records]
            embeddings = [record.embedding for record in records]
            
            # Insert data
            self.collection.insert([
                chunk_ids,    # chunk_id field
                reference_ids,  # reference_id field
                embeddings    # embedding field
            ])
            logger.info(f"Inserted {len(records)} vectors into Milvus")
            return True
        except Exception as e:
            logger.error(f"Error inserting vectors into Milvus: {str(e)}")
            return False
    
    def search_similar(self, query_embedding: List[float], top_k: int = 5) -> List[Tuple[str, float]]:
        """
        Search for similar vectors in Milvus.
        
        Args:
            query_embedding: The embedding vector to search for
            top_k: Number of results to return
            
        Returns:
            List of tuples (chunk_id, similarity_score)
        """
        try:
            search_params = {
                "metric_type": "COSINE",
                "params": {"nprobe": 10}  # You may want to adjust nprobe based on your index
            }
            
            results = self.collection.search(
                data=[query_embedding],
                anns_field="embedding",
                param=search_params,
                limit=top_k,
                output_fields=["reference_id"]
            )
            
            # Format results
            similar_chunks = []
            for hits in results:
                for hit in hits:
                    chunk_id = hit.id
                    score = hit.score
                    similar_chunks.append((chunk_id, score))
            
            return similar_chunks
        except Exception as e:
            logger.error(f"Error searching in Milvus: {str(e)}")
            return []
    
    def delete_by_reference(self, reference_id: uuid.UUID) -> bool:
        """
        Delete all vectors associated with a reference ID.
        
        Args:
            reference_id: UUID of the reference
            
        Returns:
            bool: True if deletion was successful
        """
        try:
            expr = f'reference_id == "{str(reference_id)}"'
            self.collection.delete(expr)
            return True
        except Exception as e:
            logger.error(f"Error deleting vectors from Milvus: {str(e)}")
            return False

@lru_cache
def get_milvus_client() -> MilvusClient:
    """Get a singleton instance of the Milvus client."""
    return MilvusClient()