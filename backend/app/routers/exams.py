# Path: app/routers/exams.py
# Description: This file contains the routers for the Exams API.

import uuid
from datetime import datetime, timezone
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session, joinedload
from app.utils.postgres import Exam, Subject, get_db
from app.utils.models import (
    SubjectItem,
    ExamItem,
    ExamCreateRequest,
    ExamCreateResponse,
    GetExamResponse,
    ListExamResponse,
    UpdateExamRequest,
    UpdateExamResponse,
)
from app.logger import get_logger
from app.utils.mongodb import get_mongodb_client

logger = get_logger()
mongodb_client = get_mongodb_client()

router = APIRouter(
    prefix="/exams",
    tags=["Exams"]
)

@router.post(
    "",
    status_code=status.HTTP_201_CREATED,
    response_model=ExamCreateResponse,
    responses={
        201: {"description": "Exam created successfully"},
        400: {"description": "Bad request - Invalid input data"},
        404: {"description": "Not found - Subject not found"},
        409: {"description": "Conflict - Exam with this name already exists for the subject"},
        500: {"description": "Internal server error - Unexpected error occurred"}
    },
    summary="Create a new exam",
)
def create_exam(
    request: ExamCreateRequest,
    db: Session = Depends(get_db)
) -> ExamCreateResponse:
    """
    Create a new exam entry for a specific subject.
    
    - **name**: Name of the exam (1-100 characters)
    - **subject_id**: UUID of the subject this exam belongs to
    - **description**: Optional description of the exam
    - **exam_datetime**: Date and time when the exam will take place (with timezone)
    - **total_hours_to_dedicate**: Total study hours needed for preparation (between 1 and 50)
    """
    try:
        # Check if subject exists
        subject = (
            db.query(Subject)
            .filter(Subject.id == request.subject_id)
            .first()
        )
        if not subject:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Subject not found")

        # Check if exam with the same name already exists for this subject
        existing_exam = (
            db.query(Exam)
            .filter(Exam.name == request.name)
            .filter(Exam.subject_id == request.subject_id)
            .first()
        )
        if existing_exam:
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail="Exam with this name already exists for this subject"
            )

        # Create exam in database
        exam = Exam(
            name=request.name,
            subject_id=request.subject_id,
            description=request.description,
            exam_datetime=request.exam_datetime,
            total_hours_to_dedicate=request.total_hours_to_dedicate,
        )

        db.add(exam)
        db.commit()

        # Reload the exam with its subject relationship
        exam = (
            db.query(Exam)
            .options(joinedload(Exam.subject))
            .filter(Exam.id == exam.id)
            .first()
        )

        # Create proper Pydantic models from SQLAlchemy models
        subject_item = SubjectItem(
            id=exam.subject.id,
            name=exam.subject.name,
            color=exam.subject.color
        )

        return ExamCreateResponse(
            exam=ExamItem(
                id=exam.id,
                name=exam.name,
                description=exam.description,
                exam_datetime=exam.exam_datetime,
                total_hours_to_dedicate=exam.total_hours_to_dedicate,
                subject=subject_item
            )
        )

    except HTTPException:
        # Re-raise HTTP exceptions so they maintain their status codes
        raise

    except Exception as e:
        db.rollback()
        logger.error(f"Error creating exam: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to create exam."
        )

@router.get(
    "/{exam_id}",
    response_model=GetExamResponse,
    responses={
        200: {"description": "Exam retrieved successfully"},
        404: {"description": "Not found - Exam or Subject not found"},
        500: {"description": "Internal server error - Unexpected error occurred"}
    },
    summary="Get an exam by ID",
)
def get_exam(
    exam_id: uuid.UUID,
    db: Session = Depends(get_db)
) -> GetExamResponse:
    """
    Retrieve an exam by its ID.
    
    - **exam_id**: UUID of the exam to retrieve
    """
    try:
        # Find the exam, eager load subject
        exam = (
            db.query(Exam)
            .options(joinedload(Exam.subject))
            .filter(Exam.id == exam_id)
            .first()
        )

        if not exam:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Exam not found")

        # Create proper Pydantic models from SQLAlchemy models
        subject_item = SubjectItem(
            id=exam.subject.id,
            name=exam.subject.name,
            color=exam.subject.color
        )

        return GetExamResponse(
            exam=ExamItem(
                id=exam.id,
                name=exam.name,
                description=exam.description,
                exam_datetime=exam.exam_datetime,
                total_hours_to_dedicate=exam.total_hours_to_dedicate,
                subject=subject_item
            )
        )

    except HTTPException:
        # Re-raise HTTP exceptions
        raise

    except Exception as e:
        logger.error(f"Error retrieving exam: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to retrieve exam."
        )

@router.get(
    "",
    response_model=ListExamResponse,
    responses={
        200: {"description": "Exams listed successfully"},
        500: {"description": "Internal server error - Unexpected error occurred"}
    },
    summary="List all exams",
)
def list_exams(
    db: Session = Depends(get_db)
) -> ListExamResponse:
    """
    List all exams categorized by upcoming and previous.
    
    Returns two arrays:
    - **upcoming_exams**: Exams scheduled for the future, sorted by date (ascending)
    - **previous_exams**: Past exams, sorted by date (descending/most recent first)
    """
    try:
        # Get all exams from database, joining with subjects
        exams = (
            db.query(Exam)
            .options(joinedload(Exam.subject))
            .all()
        )

        now = datetime.now(timezone.utc)
        upcoming_exam_items = []
        previous_exam_items = []

        for exam in exams:
            # Ensure exam_datetime is timezone-aware for comparison
            exam_dt_aware = exam.exam_datetime
            
            # Create ExamItem from the SQLAlchemy model
            exam_item = ExamItem(
                id=exam.id,
                name=exam.name,
                description=exam.description,
                exam_datetime=exam.exam_datetime,
                total_hours_to_dedicate=exam.total_hours_to_dedicate,
                subject=SubjectItem(
                    id=exam.subject.id,
                    name=exam.subject.name,
                    color=exam.subject.color
                )
            )
            
            # Categorize based on date
            if exam_dt_aware >= now:
                upcoming_exam_items.append(exam_item)
            else:
                previous_exam_items.append(exam_item)

        # Sort exams by date
        upcoming_exam_items.sort(key=lambda x: x.exam_datetime)
        previous_exam_items.sort(key=lambda x: x.exam_datetime, reverse=True)

        return ListExamResponse(
            upcoming_exams=upcoming_exam_items,
            previous_exams=previous_exam_items
        )

    except Exception as e:
        logger.error(f"Error listing exams: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to create exam."
        )

@router.put(
    "/{exam_id}",
    response_model=UpdateExamResponse,
    responses={
        200: {"description": "Exam updated successfully"},
        404: {"description": "Not found - Exam or Subject not found"},
        409: {"description": "Conflict - Exam name already exists for the subject"},
        500: {"description": "Internal server error - Unexpected error occurred"}
    },
    summary="Update an existing exam",
)
def update_exam(
    exam_id: uuid.UUID,
    request: UpdateExamRequest,
    db: Session = Depends(get_db)
) -> UpdateExamResponse:
    """
    Update an existing exam identified by its ID.
    
    - **exam_id**: UUID of the exam to update
    - **name** (optional): New name for the exam (1-100 characters)
    - **subject_id** (optional): UUID of the new subject this exam belongs to
    - **description** (optional): New description of the exam
    - **exam_datetime** (optional): New date and time when the exam will take place
    - **total_hours_to_dedicate** (optional): New total study hours needed for preparation
    """
    try:
        # Find the exam, eager load subject
        exam = (
            db.query(Exam)
            .options(joinedload(Exam.subject))
            .filter(Exam.id == exam_id)
            .first()
        )

        if not exam:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Exam not found")

        # Check if subject_id is being updated and if the new subject exists
        if request.subject_id and request.subject_id != exam.subject_id:
            new_subject = (
                db.query(Subject)
                .filter(Subject.id == request.subject_id)
                .first()
            )
            if not new_subject:
                raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="New Subject not found")

        # Check for unique constraint violation if name or subject_id is changing
        if request.name and request.subject_id:
            existing_exam = (
                db.query(Exam)
                
                .filter(
                    Exam.name == request.name,
                    Exam.subject_id == request.subject_id,
                    Exam.id != exam_id
                )
                .first()
            )
            if existing_exam:
                raise HTTPException(
                    status_code=status.HTTP_409_CONFLICT,
                    detail="Exam with this name already exists for this subject"
                )

        # Update fields
        if request.name:
            exam.name = request.name
        if request.subject_id:
            exam.subject_id = request.subject_id
        if request.description:
            exam.description = request.description
        if request.exam_datetime:
            exam.exam_datetime = request.exam_datetime
        if request.total_hours_to_dedicate:
            exam.total_hours_to_dedicate = request.total_hours_to_dedicate

        # Commit changes to the database
        db.commit()
        db.refresh(exam)
        # Ensure subject is loaded after refresh if it was changed
        db.refresh(exam, attribute_names=['subject'])

        # Create proper Pydantic models from SQLAlchemy models
        subject_item = SubjectItem(
            id=exam.subject.id,
            name=exam.subject.name,
            color=exam.subject.color
        )

        return UpdateExamResponse(
            id=exam.id,
            name=exam.name,
            description=exam.description,
            exam_datetime=exam.exam_datetime,
            total_hours_to_dedicate=exam.total_hours_to_dedicate,
            subject=subject_item
        )

    except HTTPException:
        # Re-raise HTTP exceptions
        raise

    except Exception as e:
        db.rollback()
        logger.error(f"Error updating exam: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to create exam."
        )

@router.delete(
    "/{exam_id}",
    status_code=status.HTTP_204_NO_CONTENT,
    responses={
        204: {"description": "Exam deleted successfully - No content returned"},
        404: {"description": "Not found - Exam with the specified ID does not exist"},
        500: {"description": "Internal server error - Unexpected error occurred"}
    },
    summary="Delete an exam",
)
def delete_exam(
    exam_id: uuid.UUID,
    db: Session = Depends(get_db)
):
    """
    Delete an exam by its ID.
    
    - **exam_id**: UUID of the exam to delete
    """
    try:
        # Find the exam
        exam = (
            db.query(Exam)
            .filter(Exam.id == exam_id)
            .first()
        )

        if not exam:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Exam not found")

        # Delete the generated mindmap from MongoDB
        mongodb_client.delete_mindmap(exam_id)
        
        # TODO: delete references chunks from MongoDB
        # TODO: delete vector records from milvus

        # Delete the exam
        db.delete(exam)
        db.commit()

    except HTTPException:
        # Re-raise HTTP exceptions
        raise

    except Exception as e:
        db.rollback()
        logger.error(f"Error deleting exam: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to create exam."
        )
