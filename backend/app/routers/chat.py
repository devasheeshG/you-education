# Path: app/routers/chat.py
# Description: This file contains the router for the Chat API.

import uuid, time
from typing import List, Iterator
from fastapi import APIRouter, Depends, HTTPException, Path, status
from fastapi.responses import StreamingResponse
from sqlalchemy.orm import Session, joinedload
from openai import OpenAI
from app.utils.postgres import Reference, Exam, Chunks, get_db
from app.utils.models import ChatRequest
from app.utils.mongodb import get_mongodb_client
from app.utils.milvus import get_milvus_client
from app.logger import get_logger
from app.config import get_settings

# Get logger
logger = get_logger()

# Get app config
settings = get_settings()

# Initialize MongoDB client
mongodb_client = get_mongodb_client()

# Initialize Milvus client
milvus_client = get_milvus_client()

# Define the prompt template
CHAT_PROMPT = """You are a helpful study assistant developed by You Education. 
User has an upcoming exam for {exam_name} of subject {subject_name} and wants to prepare for it.
You are given access to user notes and references related to the exam. User that information to answer their questions.
If you don't know the answer based on this information, say so.

Context:
{context}

Please provide a detailed, accurate response based on the provided context. Include specific facts and examples from the
reference materials where relevant.
"""

# Initialize OpenAI client for chat completions
oai_llm_client = OpenAI(
    api_key=settings.LLM_API_KEY,
    base_url=settings.LLM_BASE_URL,
)

# Initialize OpenAI client for embeddings
oai_client = OpenAI(
    api_key=settings.EMBEDDINGS_API_KEY,
    base_url=settings.EMBEDDINGS_BASE_URL,
)

router = APIRouter(
    prefix="/exams/{exam_id}/chat",
    tags=["Chat"]
)

@router.post(
    "",
    responses={
        200: {"description": "Chat response streamed successfully"},
        404: {"description": "Not found - Exam or references not found"},
        500: {"description": "Internal server error"}
    },
    summary="Chat with references"
)
def chat_with_references(
    request: ChatRequest,
    exam_id: uuid.UUID = Path(...),
    db: Session = Depends(get_db)
):
    """
    Chat with references for a specific exam.
    
    Parameters:
        - **request**: ChatRequest containing the message and reference IDs
        - **exam_id**: UUID of the exam the references belong to
    
    Returns a streaming response with the AI's reply.
    """
    try:
        # Check if exam exists and load that with its subject relationship
        exam = (
            db.query(Exam)
            .options(joinedload(Exam.subject))
            .filter(Exam.id == exam_id)
            .first()
        )
        if not exam:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Exam with ID {exam_id} not found."
            )
        
        # Validate that all references exist and belong to this exam
        references = (
            db.query(Reference)
            .filter(Reference.id.in_(request.reference_ids))
            .filter(Reference.exam_id == exam_id)
            .all()
        )
        
        if len(references) != len(request.reference_ids):
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="One or more references not found for this exam."
            )
        
        # Get relevant chunks using Milvus similarity search
        # query_embedding = oai_client.embeddings.create(
        #     input=request.message,
        #     model=settings.EMBEDDINGS_MODEL_NAME,
        # ).data[0].embedding
        
        # Search for top 10 most relevant chunks
        # top_chunks = milvus_client.search_vector(
        #     query_vector=query_embedding,
        #     reference_ids=[str(ref.id) for ref in references],
        #     limit=5,
        #     threshold=0.4,
        # )
        # if not top_chunks:
        #     logger.warning("No relevant chunks found.")
        
        # Create context from relevant chunks
        # context_parts = []
        # for result in top_chunks:
        #     chunk_id = result.entity.id
        #     # Get reference info
        #     chunk = db.query(Chunks).filter(Chunks.id == chunk_id).first()
        #     reference = db.query(Reference).filter(Reference.id == chunk.reference_id).first()
        
        #     # Get chunk content from MongoDB
        #     mongo_chunk = mongodb_client.get_chunk(chunk_id)
        
        #     # Format context part
        #     context_part = (
        #         f"Reference Type: {reference.file_type}\n"
        #         f"Reference Name: {reference.file_name}\n"
        #         f"Reference Content:\n{mongo_chunk.content}\n\n\n"
        #     )
        #     context_parts.append(context_part)
        
        # FIXME: For now, just get all chunks of all references given by user
        context_parts = []
        for ref in references:
            # Get reference info
            reference = db.query(Reference).filter(Reference.id == ref.id).first()
            
            # Get all chunks for this reference
            chunks = db.query(Chunks).filter(Chunks.reference_id == reference.id).all()
            
            # Get chunk content from MongoDB
            for chunk in chunks:
                mongo_chunk = mongodb_client.get_chunk(chunk.id)
                
                # Format context part
                context_part = (
                    f"Reference Type: {reference.file_type}\n"
                    f"Reference Name: {reference.file_name}\n"
                    f"Reference Content:\n{mongo_chunk.content}\n\n\n"
                )
                context_parts.append(context_part)
        
        # Join all context parts
        context = "".join(context_parts)
        
        # Build conversation history
        messages = []
        
        # Add system message with context
        system_prompt = CHAT_PROMPT.format(
            context=context, 
            exam_name=exam.name, 
            subject_name=exam.subject.name
        )
        messages.append({"role": "system", "content": system_prompt})
        
        # Add previous messages if they exist
        if request.previous_messages:
            for msg in request.previous_messages:
                messages.append({"role": msg.role, "content": msg.content})
        
        # Add the current user message
        messages.append({"role": "user", "content": request.message})
        logger.info(f"Chat messages: {messages}")
        
        # Stream the response
        return StreamingResponse(
            stream_chat_response(messages),
            media_type="text/event-stream"
        )
    
    except HTTPException:
        # Re-raise HTTP exceptions
        raise
    
    except Exception as e:
        logger.error(f"Error in chat: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to process chat request."
        )

def stream_chat_response(messages: List[dict]) -> Iterator[str]:
    """
    Stream the chat response from the AI model using SSE format.
    
    Args:
        messages: List of message dictionaries to send to the model
        
    Returns:
        Iterator of SSE-formatted text chunks
    """
    try:
        # Create streaming response from OpenAI
        response_stream = oai_client.chat.completions.create(
            model=settings.LLM_MODEL_NAME,
            messages=messages,
            stream=True
        )
        
        for chunk in response_stream:
            if chunk.choices and chunk.choices[0].delta.content:
                content = chunk.choices[0].delta.content
                # Format as SSE
                yield f"data: {content}\n\n"
                # Small delay to control streaming rate
                time.sleep(0.01)
        
        # Signal completion
        yield "data: [DONE]\n\n"
    
    except Exception as e:
        logger.error(f"Error streaming chat response: {str(e)}")
        yield f"data: Error: {str(e)}\n\n"
        yield "data: [DONE]\n\n"
