# Path: app/routers/references.py
# Description: This file contains the routers for the References API.

import io, uuid
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Path, status
from sqlalchemy.orm import Session
from app.utils.postgres import Reference, Exam, get_db
from app.utils.models import (
    ReferencesTypeEnum,
    ReferenceCreateRequest,
    ReferenceCreateResponse,
    ReferenceUploadResponse,
    ReferenceItem,
    ListReferenceResponse,
    DownloadReferenceResponse
)
from app.utils.minio.client import get_minio_client
from app.logger import get_logger

minio_client = get_minio_client()

logger = get_logger()

router = APIRouter(
    prefix="/exams/{exam_id}/references",
    tags=["References"]
)

# Content type mapping for file uploads
CONTENT_TYPE_MAPPING = {
    ReferencesTypeEnum.TXT: "text/plain",
    ReferencesTypeEnum.PDF: "application/pdf",
    ReferencesTypeEnum.PPT: "application/vnd.ms-powerpoint",
    ReferencesTypeEnum.DOCX: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    ReferencesTypeEnum.MD: "text/markdown",
    ReferencesTypeEnum.WEBSITE_URL: None,
    ReferencesTypeEnum.YT_VIDEO_URL: None,
}

@router.post(
    "/upload",
    status_code=status.HTTP_201_CREATED,
    response_model=ReferenceUploadResponse,
    responses={
        201: {"description": "Reference uploaded successfully"},
        400: {"description": "Bad request - Invalid file type or reference already exists"},
        404: {"description": "Not found - Exam not found"},
        500: {"description": "Internal server error"}
    },
    summary="Upload a reference file"
)
def upload_reference(
    file: UploadFile = File(...),
    exam_id: uuid.UUID = Path(...),
    db: Session = Depends(get_db)
) -> ReferenceUploadResponse:
    """
    Upload a reference file for an exam.
    
    Supported file types:
    - txt: Plain text files
    - pdf: PDF documents
    - ppt: PowerPoint presentations
    - docx: Word documents
    - md: Markdown files
    
    - **file**: The reference file to upload
    - **exam_id**: UUID of the exam this reference belongs to
    """
    try:
        # Check if exam exists
        exam = db.query(Exam).filter(Exam.id == exam_id).first()
        if not exam:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Exam with ID {exam_id} not found."
            )
        
        # Check if the reference with the same name already exists
        existing_reference = (
            db.query(Reference)
            .filter(Reference.exam_id == exam_id)
            .filter(Reference.file_name == file.filename)
            .first()
        )
        
        if existing_reference:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Reference with name {file.filename} already exists."
            )
        
        # Validate file extension and type
        file_ext = file.filename.split('.')[-1].lower()
        if file_ext not in ["txt", "pdf", "ppt", "docx", "md"]:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Unsupported file type: {file_ext}. Supported types: txt, pdf, ppt, docx, md"
            )
        
        # Map file extension to enum type
        file_type = ReferencesTypeEnum(file_ext)
        
        # Save reference in database
        reference = Reference(
            exam_id=exam_id,
            file_type=file_type,
            file_name=file.filename,
        )
        
        # Commit the reference to the database
        db.add(reference)
        db.commit()
        db.refresh(reference)

        # Upload to MinIO
        if CONTENT_TYPE_MAPPING[file_type]:
            try:
                minio_client.upload_file(
                    file_data=io.BytesIO(file.read()),
                    object_name=f"{exam_id}/{file.filename}",
                    content_type=CONTENT_TYPE_MAPPING[file_type],
                )
            except Exception as e:
                logger.error(f"Error uploading file to MinIO: {e}")
                raise HTTPException(
                    status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, 
                    detail="Failed to upload file to storage."
                )
        
        return ReferenceUploadResponse(
            id=reference.id,
            type=file_type,
            name=file.filename
        )
    
    except HTTPException:
        # Re-raise HTTP exceptions
        raise
    
    except Exception as e:
        db.rollback()
        logger.error(f"Error uploading reference: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to upload reference: {str(e)}"
        )

@router.post(
    "/create",
    status_code=status.HTTP_201_CREATED,
    response_model=ReferenceCreateResponse,
    responses={
        201: {"description": "Reference created successfully"},
        400: {"description": "Bad request - Invalid URL or reference already exists"},
        404: {"description": "Not found - Exam not found"},
        500: {"description": "Internal server error"}
    },
    summary="Create a reference via URL"
)
def create_reference(
    request: ReferenceCreateRequest,
    exam_id: uuid.UUID = Path(...),
    db: Session = Depends(get_db)
) -> ReferenceCreateResponse:
    """
    Create a reference using a URL for an exam.
    
    - **url**: The URL of the reference
    - **exam_id**: UUID of the exam this reference belongs to
    """
    try:
        # Check if exam exists
        exam = db.query(Exam).filter(Exam.id == exam_id).first()
        if not exam:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Exam with ID {exam_id} not found."
            )
        
        # Check if the reference with the same name already exists
        existing_reference = (
            db.query(Reference)
            .filter(Reference.exam_id == exam_id)
            .filter(Reference.file_name == request.url)
            .first()
        )
        
        if existing_reference:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Reference with URL {request.url} already exists."
            )
        
        # Save reference in database
        reference = Reference(
            exam_id=exam_id,
            file_type=request.type,
            file_name=request.url,
        )
        
        db.add(reference)
        db.commit()
        db.refresh(reference)
        
        return ReferenceCreateResponse(
            id=reference.id,
            type=ReferencesTypeEnum.WEBSITE_URL,
            name=request.url
        )
    
    except HTTPException:
        # Re-raise HTTP exceptions
        raise
    
    except Exception as e:
        db.rollback()
        logger.error(f"Error creating reference: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to create reference: {str(e)}"
        )

@router.get(
    "",
    response_model=ListReferenceResponse,
    responses={
        200: {"description": "References listed successfully"},
        404: {"description": "Not found - Exam not found"},
        500: {"description": "Internal server error"}
    },
    summary="List all references for an exam"
)
def list_references(
    exam_id: uuid.UUID = Path(...),
    db: Session = Depends(get_db)
) -> ListReferenceResponse:
    """
    List all references associated with a specific exam.
    
    - **exam_id**: UUID of the exam to list references for
    """
    try:
        # Check if exam exists
        exam = db.query(Exam).filter(Exam.id == exam_id).first()
        if not exam:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Exam with ID {exam_id} not found."
            )
        
        # Get references for this exam
        references = (
            db.query(Reference)
            .filter(Reference.exam_id == exam_id)
            .all()
        )
        
        reference_items = [
            ReferenceItem(
                id=ref.id,
                type=ref.file_type,
                name=ref.file_name
            ) for ref in references
        ]
        
        return ListReferenceResponse(references=reference_items)
    
    except HTTPException:
        # Re-raise HTTP exceptions
        raise
    
    except Exception as e:
        logger.error(f"Error listing references: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to list references: {str(e)}"
        )

@router.get(
    "/{reference_id}/download",
    response_model=DownloadReferenceResponse,
    responses={
        200: {"description": "Download URL generated successfully"},
        404: {"description": "Not found - Reference not found or exam not found"},
        500: {"description": "Internal server error"}
    },
    summary="Get download URL for a reference"
)
def download_reference(
    reference_id: uuid.UUID,
    exam_id: uuid.UUID = Path(...),
    db: Session = Depends(get_db)
) -> DownloadReferenceResponse:
    """
    Generate a download URL for a specific reference file.
    
    - **exam_id**: UUID of the exam the reference belongs to
    - **reference_id**: UUID of the reference to download
    """
    try:
        # Find the reference
        reference = (
            db.query(Reference)
            .filter(Reference.id == reference_id)
            .filter(Reference.exam_id == exam_id)
            .first()
        )
        
        if not reference:
            logger.error(f"Reference with ID {reference_id} not found for exam {exam_id}.")
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Reference with ID {reference_id} not found for exam {exam_id}."
            )
        
        # Skip URL generation for URL-based references (they are already URLs)
        if reference.file_type in [ReferencesTypeEnum.WEBSITE_URL, ReferencesTypeEnum.YT_VIDEO_URL]:
            # For URL references, simply return the stored filename as the URL
            return DownloadReferenceResponse(url=reference.file_name)
        
        # Generate download URL for file-based references
        object_name = f"{exam_id}/{reference.file_name}"
        
        # Check if file exists in storage
        if not minio_client.file_exists(object_name):
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Reference file not found in storage."
            )
        
        # Generate download URL
        download_url = minio_client.get_download_url(object_name)
        
        return DownloadReferenceResponse(url=download_url)
    
    except HTTPException:
        # Re-raise HTTP exceptions
        raise
    
    except Exception as e:
        logger.error(f"Error generating download URL: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to generate download URL: {str(e)}"
        )

@router.delete(
    "/{reference_id}",
    status_code=status.HTTP_204_NO_CONTENT,
    responses={
        204: {"description": "Reference deleted successfully - No content returned"},
        404: {"description": "Not found - Reference not found or exam not found"},
        500: {"description": "Internal server error"}
    },
    summary="Delete a reference"
)
def delete_reference(
    reference_id: uuid.UUID,
    exam_id: uuid.UUID = Path(...),
    db: Session = Depends(get_db)
):
    """
    Delete a reference by its ID.
    
    - **exam_id**: UUID of the exam the reference belongs to
    - **reference_id**: UUID of the reference to delete
    """
    try:
        # Find the reference
        reference = (
            db.query(Reference)
            .filter(Reference.id == reference_id)
            .filter(Reference.exam_id == exam_id)
            .first()
        )
        
        if not reference:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Reference not found"
            )
        
        # Delete from storage if it's a file-based reference
        if reference.file_type not in [ReferencesTypeEnum.WEBSITE_URL, ReferencesTypeEnum.YT_VIDEO_URL]:
            object_name = f"{exam_id}/{reference.file_name}"
            try:
                # Check if file exists before attempting deletion
                if minio_client.file_exists(object_name):
                    minio_client.delete_file(object_name)
            except Exception as e:
                logger.warning(f"Error deleting file from storage (continuing anyway): {str(e)}")
        
        # Delete the reference from the database
        db.delete(reference)
        db.commit()
        
        return None
    
    except HTTPException:
        # Re-raise HTTP exceptions
        raise
    
    except Exception as e:
        db.rollback()
        logger.error(f"Error deleting reference: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to delete reference: {str(e)}"
        )
