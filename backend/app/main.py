# Path: app/main.py
# Description: Main FastAPI application

import toml, time, uuid
from fastapi import FastAPI, Request
from starlette.middleware.base import BaseHTTPMiddleware
# from fastapi.middleware.cors import CORSMiddleware
from app.logger import get_logger
from app.config import get_settings
from app.routers import main_router

# Get the settings
settings = get_settings()

# Get the logger
logger = get_logger()

# Load pyproject.toml
with open("pyproject.toml", "r") as file:
    config = toml.load(file)

app = FastAPI(
    title=config["tool"]["poetry"]["name"],
    description=config["tool"]["poetry"]["description"],
    version=config["tool"]["poetry"]["version"],
    openapi_url="/api/openapi.json" if settings.ENV == "development" else None,
    docs_url="/api/docs" if settings.ENV == "development" else None,
    redoc_url="/api/redoc" if settings.ENV == "development" else None,
)

# Advanced Middleware
class LoggingMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request: Request, call_next):
        # Process the request
        start_time = time.perf_counter()
        path = request.url.path
        
        response = await call_next(request)
        
        process_time = time.perf_counter() - start_time
        
        # Add response time to headers
        response.headers["X-Process-Time"] = str(process_time)
        
        # Add request ID to headers
        request_id = str(uuid.uuid4())
        response.headers["X-Request-Id"] = request_id
        
        logger.debug(f"Request {path} processed in {process_time:.4f} seconds with ID {request_id}")
        
        return response

# Add CORS Middleware
# app.add_middleware(
#     CORSMiddleware,
#     allow_origins=["*"],
#     allow_credentials=True,
#     allow_methods=["*"],
#     allow_headers=["*"],
# )

# Add Logging Middleware
app.add_middleware(LoggingMiddleware)

# Include routers
app.include_router(main_router)

@app.get("/health", tags=["Health"], include_in_schema=False)
def health_check():
    """Health check endpoint for monitoring."""
    return {"status": "ok"}
