# Build stage
FROM python:3.11-slim AS builder

# Set environment variables for efficiency
ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    PIP_NO_CACHE_DIR=off

# Install Poetry
RUN pip install --no-cache-dir poetry

# Set work directory
WORKDIR /app

# Copy only dependencies files
COPY pyproject.toml poetry.lock* ./

# Generate requirements file for better caching
RUN poetry export -f requirements.txt > requirements.txt

# Runtime stage
FROM python:3.11-slim

ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1

WORKDIR /app

# Install dependencies from the builder stage
COPY --from=builder /app/requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy application code last (for better layer caching)
COPY . .