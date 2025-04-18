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
            logger.debug(f"Inserting vector into Milvus for chunk: {record.chunk_id}")
            self.collection.insert(record.model_dump())
        except Exception as e:
            logger.error(f"Error inserting vectors into Milvus: {str(e)}")
            raise
    
    def search_vector(
        self, 
        query_vector: list[float], 
        reference_ids: list[str], 
        limit: int, 
        threshold: float
    ) -> list:
        """
        Search for similar vectors in Milvus.
        
        Args:
            query_vector: The vector to search for
            reference_ids: List of reference IDs to filter the search
            limit: Number of results to return
            threshold: Minimum similarity score to consider a match
            
        Returns:
            List of top similar vectors
        """
        try:
            logger.debug(f"Searching for similar vectors in Milvus with query vector")
            search_params = {
                "metric_type": "COSINE",
                "params": {"nprobe": 10}
            }
            
            # Format reference_ids for query
            ref_ids_str = ", ".join([f"'{ref_id}'" for ref_id in reference_ids])
            expr = f"reference_id in [{ref_ids_str}]"
            
            results = self.collection.search(
                data=[query_vector],
                anns_field="embedding",
                param=search_params,
                limit=limit * 3,
                expr=expr
            )
            
            # Post-process results to apply threshold filter on distances
            filtered_results = []
            for hit in results[0]:
                # For COSINE similarity, higher scores are better (closer to 1)
                # Convert to a distance metric by using 1-score for consistent comparison with threshold
                distance = 1 - hit.score
                if distance < threshold:
                    filtered_results.append(hit)
                    if len(filtered_results) >= limit:
                        break
            
            # Create a new result object with the filtered hits
            results[0] = filtered_results[:limit]
            logger.debug(f"Search results after filtering: {len(results[0])} items")
            return results[0]
        except Exception as e:
            logger.error(f"Error searching vectors in Milvus: {str(e)}")
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
