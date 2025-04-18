# Path: app/routers/__init__.py
# Description: This file contains the main router of the application.

from fastapi import APIRouter
from . import exams, subjects, references, chat, metadata, mindmap

main_router = APIRouter(prefix="/api/v1")

main_router.include_router(subjects.router)
main_router.include_router(exams.router)
main_router.include_router(references.router)
main_router.include_router(chat.router)
main_router.include_router(metadata.router)
main_router.include_router(mindmap.router)
