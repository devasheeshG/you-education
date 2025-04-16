# Path: app/routers/__init__.py
# Description: This file contains the main router of the application.

from fastapi import APIRouter
from . import exams, subjects

main_router = APIRouter(prefix="/api/v1")

main_router.include_router(subjects.router)
main_router.include_router(exams.router)
