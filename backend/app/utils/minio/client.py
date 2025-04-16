# Path: app/utils/storage/minio_client.py
# Description: MinIO S3 client for file storage

from datetime import timedelta
from io import BytesIO
from minio import Minio
from minio.error import S3Error
from app.config import get_settings
from app.logger import get_logger
from functools import lru_cache

settings = get_settings()
logger = get_logger()

class MinioClient:
    def __init__(self):
        self.client = Minio(
            endpoint=settings.MINIO_ENDPOINT,
            access_key=settings.MINIO_ACCESS_KEY,
            secret_key=settings.MINIO_SECRET_KEY,
            secure=settings.MINIO_SECURE,
        )
        self.bucket_name = settings.MINIO_BUCKET_NAME
        
        # Ensure bucket exists
        self._ensure_bucket_exists()
    
    def _ensure_bucket_exists(self) -> None:
        """Create bucket if it doesn't exist."""
        try:
            if not self.client.bucket_exists(self.bucket_name):
                self.client.make_bucket(self.bucket_name)
                logger.info(f"Created bucket: {self.bucket_name}")
        except S3Error as e:
            logger.error(f"Error ensuring bucket exists: {e}")
            raise
    
    def upload_file(self, file_data: BytesIO, object_name: str, content_type: str) -> None:
        """Upload a file to MinIO."""
        try:
            logger.info(f"Uploading file to MinIO: {object_name}")
            self.client.put_object(
                bucket_name=self.bucket_name,
                object_name=object_name,
                data=file_data,
                length=file_data.getbuffer().nbytes,
                content_type=content_type
            )
        except S3Error as e:
            logger.error(f"Error uploading file to MinIO: {e}")
            raise
    
    def get_download_url(self, object_name: str) -> str:
        """Generate a presigned URL for downloading a file."""
        try:
            logger.info(f"Generating download URL for {object_name}")
            return self.client.presigned_get_object(
                bucket_name=self.bucket_name,
                object_name=object_name,
                expires=timedelta(minutes=5)  # URL valid for 5 minutes
            )
        except S3Error as e:
            logger.error(f"Error generating download URL: {e}")
            raise
    
    def delete_file(self, object_name) -> None:
        """Delete a file from MinIO."""
        try:
            self.client.remove_object(self.bucket_name, object_name)
        except S3Error as e:
            logger.error(f"Error deleting file from MinIO: {e}")
            raise

    def file_exists(self, object_name: str) -> bool:
        """Check if a file exists in MinIO."""
        try:
            self.client.stat_object(self.bucket_name, object_name)
            return True
        except S3Error as e:
            if e.code == 'NoSuchKey':
                return False
            else:
                logger.error(f"Error checking file existence: {e}")
                raise

@lru_cache
def get_minio_client() -> MinioClient:
    """Get a singleton instance of MinioClient."""
    return MinioClient()
