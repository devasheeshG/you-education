from pymilvus import (
    Collection, 
    CollectionSchema, 
    FieldSchema, 
    DataType, 
    MilvusClient, 
    connections
)
from app.config import get_settings
from app.logger import get_logger

settings = get_settings()
logger = get_logger()

def create_milvus_collections() -> None:
    connections.connect(
        alias="default",
        host=settings.MILVUS_HOST,
        port=settings.MILVUS_PORT,
        # db_name=settings.MILVUS_DB
    )
    client = MilvusClient(
        uri=f"http://{settings.MILVUS_HOST}:{settings.MILVUS_PORT}"
    )
    # Create collection if it doesn't exist
    if settings.MILVUS_COLLECTION not in client.list_collections():
        # Define collection schema
        fields = [
            FieldSchema(name="chunk_id", dtype=DataType.VARCHAR, max_length=36, is_primary=True),
            FieldSchema(name="reference_id", dtype=DataType.VARCHAR, max_length=36),
            FieldSchema(name="embedding", dtype=DataType.FLOAT_VECTOR, dim=settings.EMBEDDINGS_N_DIM)
        ]

        schema = CollectionSchema(
            fields=fields,
            description="Stores text embeddings for semantic search"
        )

        collection = Collection(
            name=settings.MILVUS_COLLECTION,
            schema=schema,
            # using=settings.MILVUS_DB
        )

        # Create index for vector field
        index_params = {
            "metric_type": "COSINE",
            "index_type": "IVF_FLAT",
            "params": {
                # We can adjust nlist to trade off between search speed and accuracy.
                # A larger nlist value will yield higher search accuracy, but will take longer to search.
                # A smaller nlist value will yield lower search accuracy, but will be faster to search.
                "nlist": 1024
            }
        }
        collection.create_index(
            field_name="embedding",
            index_params=index_params
        )

        collection.load()
        logger.info(f"Collection {settings.MILVUS_COLLECTION} created successfully")
    else:
        # Load existing collection
        collection = Collection(settings.MILVUS_COLLECTION)
        collection.load()
        logger.info(f"Collection {settings.MILVUS_COLLECTION} already exists")

if __name__ == "__main__":
    create_milvus_collections()
