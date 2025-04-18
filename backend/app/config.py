# Path: app/config.py
# Description: This file contains code to load `.env` file and make a pydantic `BaseSettings` class which can be used to access environment variables in the application.

from pydantic_settings import BaseSettings
from functools import lru_cache

class Settings(BaseSettings):
    # Environment Configuration
    ENV: str = "development"

    # PostgreSQL Configuration
    POSTGRES_USER: str
    POSTGRES_PASSWORD: str
    POSTGRES_HOST: str
    POSTGRES_PORT: str
    POSTGRES_DB: str

    def get_postgres_uri(self) -> str:
        return f"postgresql://{self.POSTGRES_USER}:{self.POSTGRES_PASSWORD}@{self.POSTGRES_HOST}:{self.POSTGRES_PORT}/{self.POSTGRES_DB}"

    # MinIO Configuration
    MINIO_ENDPOINT: str
    MINIO_ACCESS_KEY: str
    MINIO_SECRET_KEY: str
    MINIO_BUCKET_NAME: str
    MINIO_SECURE: bool

    # MongoDB Configuration
    MONGO_USER: str
    MONGO_PASSWORD: str
    MONGO_HOST: str
    MONGO_PORT: str
    MONGO_DB: str
    MONGO_COLLECTION_REFERENCES_CHUNKS: str
    MONGO_COLLECTION_MINDMAPS: str

    def get_mongo_uri(self) -> str:
        return f"mongodb://{self.MONGO_USER}:{self.MONGO_PASSWORD}@{self.MONGO_HOST}:{self.MONGO_PORT}/{self.MONGO_DB}?authSource=admin"

    # Milvus Configuration
    # MILVUS_USER: str
    # MILVUS_PASSWORD: str
    MILVUS_HOST: str
    MILVUS_PORT: str
    # MILVUS_DB: str
    MILVUS_COLLECTION: str

    # LLM Configuration for chat
    CHAT_LLM_BASE_URL: str
    CHAT_LLM_API_KEY: str
    CHAT_LLM_MODEL_NAME: str
    
    # LLM Configuration for mindmap generation
    MINDMAP_LLM_BASE_URL: str
    MINDMAP_LLM_API_KEY: str
    MINDMAP_LLM_MODEL_NAME: str
    
    # Embeddings Configuration
    EMBEDDINGS_BASE_URL: str
    EMBEDDINGS_API_KEY: str
    EMBEDDINGS_MODEL_NAME: str
    EMBEDDINGS_N_DIM: int

    # YouTube API Configuration
    YOUTUBE_API_KEY: str

    class Config:
        env_file = ".env"
        env_file_encoding = "utf-8"

@lru_cache
def get_settings() -> Settings:
    return Settings()
