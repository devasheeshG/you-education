# Path: app/env.py
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

    class Config:
        env_file = ".env"
        env_file_encoding = "utf-8"

@lru_cache
def get_settings() -> Settings:
    return Settings()
