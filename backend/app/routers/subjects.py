# Path: app/routers/subjects.py
# Description: This file contains the routers for the subjects API.

import uuid
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.utils.postgres import Subject, get_db
from app.utils.models import (
    SubjectCreateRequest,
    SubjectCreateResponse,
    ListSubjectResponse,
    UpdateSubjectRequest,
    UpdateSubjectResponse,
)

router = APIRouter(
    prefix="/subjects",
    tags=["Subjects"]
)

@router.post(
    "", 
    status_code=201,
    response_model=SubjectCreateResponse,
    responses={
        201: {"description": "Subject created successfully"},
        400: {"description": "Bad request"},
        409: {"description": "Subject already exists"},
        500: {"description": "Internal server error"}
    }
)
def create_subject(
    request: SubjectCreateRequest,
    db: Session = Depends(get_db)
) -> SubjectCreateResponse:
    """Create a new subject."""
    try:
        # Check if subject with the same name already exists
        existing_subject = (
            db.query(Subject)
            .filter(Subject.name == request.name)
            .first()
        )
        if existing_subject:
            raise HTTPException(status_code=409, detail="Subject with this name already exists")
        
        # Create subject in database
        subject = Subject(
            name=request.name,
            color=request.color,
        )
        
        db.add(subject)
        db.commit()
        db.refresh(subject)
        
        return subject

    except HTTPException:
        # Re-raise HTTP exceptions so they maintain their status codes
        raise
    
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=500,
            detail=f"Failed to create subject: {str(e)}"
        )

@router.get(
    "",
    response_model=ListSubjectResponse,
    responses={
        200: {"description": "Subjects listed successfully"},
        500: {"description": "Internal server error"}
    }
)
def list_subjects(
    db: Session = Depends(get_db)
) -> ListSubjectResponse:
    """List all subjects."""
    try:
        # Get all subjects from database
        subjects = (
            db.query(Subject)
            .all()
        )
        
        return ListSubjectResponse(subjects=subjects)
    
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Failed to list subjects: {str(e)}"
        )

@router.put(
    "/{subject_id}",
    response_model=UpdateSubjectResponse,
    responses={
        200: {"description": "Subject updated successfully"},
        404: {"description": "Subject not found"},
        409: {"description": "Subject name already exists"},
        500: {"description": "Internal server error"}
    }
)
def update_subject(
    subject_id: uuid.UUID,
    request: UpdateSubjectRequest,
    db: Session = Depends(get_db)
) -> UpdateSubjectResponse:
    """Update an existing subject."""
    try:
        # Find the subject
        subject = (
            db.query(Subject)
            .filter(Subject.id == subject_id)
            .first()
        )
        
        if not subject:
            raise HTTPException(status_code=404, detail="Subject not found")
        
        # Check if the new name already exists
        if request.name is not None:
            existing_subject = (
                db.query(Subject)
                .filter(Subject.name == request.name)
                .first()
            )
            if existing_subject and existing_subject.id != subject_id:
                raise HTTPException(status_code=409, detail="Subject with this name already exists")
        
        # Update fields if provided
        if request.name is not None:
            subject.name = request.name
            
        if request.color is not None:
            subject.color = request.color
        
        db.commit()
        db.refresh(subject)
        
        return subject

    except HTTPException:
        # Re-raise HTTP exceptions so they maintain their status codes
        raise

    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=500,
            detail=f"Failed to update subject: {str(e)}"
        )

@router.delete(
    "/{subject_id}",
    status_code=204,
    responses={
        204: {"description": "Subject deleted successfully"},
        404: {"description": "Subject not found"},
        500: {"description": "Internal server error"}
    }
)
def delete_subject(
    subject_id: uuid.UUID,
    db: Session = Depends(get_db)
):
    """Delete a subject."""
    try:
        # Find the subject
        subject = (
            db.query(Subject)
            .filter(Subject.id == subject_id)
            .first()
        )
        
        if not subject:
            raise HTTPException(status_code=404, detail="Subject not found")
        
        # Delete the subject
        db.delete(subject)
        db.commit()
        
        return None

    except HTTPException:
        # Re-raise HTTP exceptions so they maintain their status codes
        raise

    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=500,
            detail=f"Failed to delete subject: {str(e)}"
        )
