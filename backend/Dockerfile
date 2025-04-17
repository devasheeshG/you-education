# Build stage
FROM python:3.11-slim AS builder

# Set environment variables for efficiency
ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    PIP_NO_CACHE_DIR=off

RUN pip install --no-cache-dir poetry

# Set work directory
WORKDIR /app

# Copy only dependencies files
COPY pyproject.toml ./

# Install dependencies
RUN poetry config virtualenvs.create false \
    && poetry install --no-interaction --no-ansi