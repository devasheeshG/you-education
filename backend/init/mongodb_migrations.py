from pymongo import MongoClient, ASCENDING
from pymongo.errors import ServerSelectionTimeoutError
from app.config import get_settings

settings = get_settings()

def create_collection_if_not_exists() -> None:
    """Create MongoDB database and collection if they don't exist."""
    try:
        client = MongoClient(settings.get_mongo_uri(), serverSelectionTimeoutMS=5000)
        # Ping server to check connection
        client.admin.command('ping')
    except ServerSelectionTimeoutError:
        raise ConnectionError(f"Could not connect to MongoDB at {settings.get_mongo_uri()}")

    # Create database if it doesn't exist
    # In MongoDB, creating a database is implicit when creating first collection
    db = client[settings.MONGO_DB]

    # Create projects collection if it doesn't exist
    if settings.MONGO_COLLECTION_REFERENCES_CHUNKS not in db.list_collection_names():
        collection = db.create_collection(settings.MONGO_COLLECTION_REFERENCES_CHUNKS)

        # Create indexes
        collection.create_index([("_id", ASCENDING)])

        # Insert initial empty document to ensure database creation
        collection.insert_one({"_id": "schema_version", "version": 1})

if __name__ == "__main__":
    create_collection_if_not_exists()
