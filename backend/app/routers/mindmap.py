# Path: app/routers/mindmap.py
# Description: This file contains the routers for the Mindmap API.

import uuid, json
from fastapi import APIRouter, Depends, HTTPException, Path, Query, status
from typing import List, Dict, Any
from sqlalchemy.orm import Session
from openai import OpenAI
from app.utils.postgres import Reference, Exam, Chunks, get_db
from app.utils.mongodb import get_mongodb_client
from app.utils.youtube import get_youtube_client
from app.logger import get_logger
from app.config import get_settings


# Get logger
logger = get_logger()

# Get app config
settings = get_settings()

# Initialize OpenAI client
oai_llm_client = OpenAI(
    api_key=settings.MINDMAP_LLM_API_KEY,
    base_url=settings.MINDMAP_LLM_BASE_URL,
)

# Initialize MongoDB client
mongodb_client = get_mongodb_client()

# Get YouTube client
youtube_client = get_youtube_client()

# Initialize FastAPI router
router = APIRouter(
    prefix="/exams/{exam_id}/mindmap",
    tags=["Mindmap"]
)

MINDMAP_GENERATOR_PROMPT = """You are an expert educational content organizer. Your task is to create a hierarchical mindmap based on the provided educational content chunks.

The mindmap should have the following structure:
1. A main topic derived from the overall content
2. Subtopics that represent key concepts or areas
3. Further subdivisions as needed to create a comprehensive learning path

IMPORTANT: For the smallest subdivisions (leaf nodes), mark them with "is_last_subtopic": true. These leaf nodes will be used to search YouTube for relevant educational videos.

Format your response as a JSON object following this structure:
{
    "title": "Main Topic",
    "is_last_subtopic": false,
    "subtopics": [
        {
        "title": "Subtopic 1",
        "is_last_subtopic": false,
        "subtopics": [
            {
                "title": "Specific Concept 1",
                "is_last_subtopic": true
            }
        ]
        }
    ]
}

Make sure titles are concise, clear, and would work well as YouTube search terms.
"""

# MINDMAP_REFINER_PROMPT = """You are an expert educational content curator. You have been provided with:
# 1. An initial mindmap structure
# 2. YouTube video results for each leaf node in the mindmap

# Your task is to refine the mindmap and integrate the most relevant YouTube resources for each leaf node.

# For each leaf node (where "is_last_subtopic" is true), select up to 3 of the most relevant YouTube videos and integrate them into the final mindmap.

# Return your response as a JSON object following this structure:
# {
#     "title": "Main Topic",
#     "is_last_subtopic": false,
#     "subtopics": [
#         {
#         "title": "Subtopic 1",
#         "is_last_subtopic": false,
#         "subtopics": [
#             {
#             "title": "Specific Concept 1",
#             "is_last_subtopic": true,
#             "resources": [
#                 {
#                     "type": "youtube",
#                     "data": {
#                         "url": "https://youtu.be/video-id",
#                         "title": "Video Title",
#                         "description": "Brief description of the video"
#                     }
#                 }
#             ]
#             }
#         ]
#         }
#     ]
# }

# Ensure the integrated resources are highly relevant to the specific leaf node topics.
# """

MINDMAP_REFINER_PROMPT = """You are an expert educational content curator. You have been provided with:
1. An initial mindmap structure
2. YouTube video results for each leaf node in the mindmap
3. Notes of the user

Your task is to refine the mindmap and integrate the most relevant YouTube resources for each leaf node. Also add short notes for each leaf node.

For each leaf node (where "is_last_subtopic" is true), select up to 3 of the most relevant YouTube videos and integrate them into the final mindmap.

Return your response as a JSON object following this structure:
{
    "title": "Main Topic",
    "is_last_subtopic": false,
    "subtopics": [
        {
        "title": "Subtopic 1",
        "is_last_subtopic": false,
        "subtopics": [
            {
            "title": "Specific Concept 1",
            "is_last_subtopic": true,
            "resources": [
                {
                    "type": "youtube",
                    "data": {
                        "url": "https://youtu.be/video-id",
                        "title": "Video Title",
                        "description": "Brief description of the video"
                    }
                },
                {
                    "type": "notes",
                    "data": "...multiline notes..."
                }
            ]
            }
        ]
        }
    ]
}

Ensure the integrated resources are highly relevant to the specific leaf node topics.
"""

def search_youtube(query: str, max_results: int = 3) -> List[Dict[str, Any]]:
    """
    Search YouTube for videos related to the given query
    
    Args:
        query: The search term
        max_results: Maximum number of results to return
        
    Returns:
        List of video information dictionaries
    """
    request = youtube_client.search().list(
        q=query,
        part="snippet",
        type="video",
        maxResults=max_results
    )
    
    response = request.execute()
    
    results = []
    for item in response.get("items", []):
        video_id = item["id"]["videoId"]
        title = item["snippet"]["title"]
        description = item["snippet"]["description"]
        
        results.append({
            "url": f"https://youtu.be/{video_id}",
            "title": title,
            "description": description
        })
    
    return results

def extract_leaf_nodes(mindmap: Dict[str, Any]) -> List[Dict[str, Any]]:
    """
    Extract all leaf nodes from the mindmap
    
    Args:
        mindmap: The mindmap structure
        
    Returns:
        List of leaf nodes with their paths
    """
    leaf_nodes = []
    
    def traverse(node, path=[]):
        if node.get("is_last_subtopic", False):
            leaf_nodes.append({
                "node": node,
                "path": path + [node["title"]]
            })
        else:
            for subtopic in node.get("subtopics", []):
                traverse(subtopic, path + [node["title"]])
    
    traverse(mindmap)
    return leaf_nodes

def find_videos_for_leaf_nodes(leaf_nodes: List[Dict[str, Any]]) -> Dict[str, List[Dict[str, Any]]]:
    """
    Search YouTube for videos for each leaf node
    
    Args:
        leaf_nodes: List of leaf nodes
        
    Returns:
        Dictionary mapping paths to video results
    """
    results = {}
    
    for leaf in leaf_nodes:
        node_title = leaf["node"]["title"]
        path_str = " > ".join(leaf["path"])
        
        logger.info(f"Searching YouTube for: {node_title}")
        videos = search_youtube(node_title)
        
        results[path_str] = videos
    
    return results

@router.get(
    "",
    # response_model=MindmapResponse,
    response_model=dict,
    responses={
        200: {"description": "Mindmap retrieved or generated successfully"},
        404: {"description": "Not found - Exam not found or no references available"},
        500: {"description": "Internal server error"}
    },
    summary="Get or generate a mindmap for an exam"
)

def get_mindmap(
    exam_id: uuid.UUID = Path(...),
    refresh: bool = Query(False, description="Whether to generate a new mindmap"),
    db: Session = Depends(get_db)
):
    """
    Get or generate a mindmap for a specific exam.
    
    Parameters:
        - **exam_id**: UUID of the exam
        - **refresh**: Whether to force regeneration of the mindmap (default: False)
    
    Returns the mindmap structure with resources for study.
    """
    try:
        # Check if exam exists and load related subject
        exam = (
            db.query(Exam)
            .filter(Exam.id == exam_id)
            .first()
        )
        
        if not exam:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Exam with ID {exam_id} not found."
            )
        
        # If not refresh, try to get existing mindmap from MongoDB
        if not refresh:
            existing_mindmap = mongodb_client.get_mindmap(exam_id)
            if existing_mindmap:
                logger.info(f"Returning existing mindmap for exam {exam_id}")
                return existing_mindmap["mindmap"]
        
        # If we need to generate a new mindmap, first get all references for this exam
        references = (
            db.query(Reference)
            .filter(Reference.exam_id == exam_id)
            .all()
        )
        
        if not references:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"No references found for exam {exam_id}."
            )
        
        # Get all chunks for all references in order
        all_chunks_content = []
        for reference in references:
            chunks = (
                db.query(Chunks)
                .filter(Chunks.reference_id == reference.id)
                .order_by(Chunks.chunk_number)
                .all()
            )
            
            for chunk in chunks:
                # Get chunk content from MongoDB
                try:
                    chunk_doc = mongodb_client.get_chunk(chunk.id)
                    all_chunks_content.append(chunk_doc.content)
                except Exception as e:
                    logger.error(f"Error getting chunk content: {str(e)}")
        
        if not all_chunks_content:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"No chunk content found for exam {exam_id}."
            )
        
        # Generate initial mindmap using the LLM
        logger.info(f"Generating initial mindmap for exam {exam_id}")
        content_for_llm = "\n\n".join(all_chunks_content)
        
        try:
            response = oai_llm_client.chat.completions.create(
                model=settings.MINDMAP_LLM_MODEL_NAME,
                messages=[
                    {"role": "system", "content": MINDMAP_GENERATOR_PROMPT},
                    {"role": "user", "content": f"Generate a mindmap for the following content:\n\n{content_for_llm}"}
                ],
                response_format={"type": "json_object"}
            )
            
            # Parse the initial mindmap
            initial_mindmap = response.choices[0].message.content
            initial_mindmap = json.loads(initial_mindmap) if isinstance(initial_mindmap, str) else initial_mindmap
            
            # Extract leaf nodes and search YouTube for each
            leaf_nodes = extract_leaf_nodes(initial_mindmap)
            video_results = find_videos_for_leaf_nodes(leaf_nodes)
            
            # Refine the mindmap with video results
            logger.info(f"Refining mindmap with video results for exam {exam_id}")
            
            refine_response = oai_llm_client.chat.completions.create(
                model=settings.MINDMAP_LLM_MODEL_NAME,
                messages=[
                    {"role": "system", "content": MINDMAP_REFINER_PROMPT},
                    # {"role": "user", "content": f"Initial mindmap:\n{initial_mindmap}\n\nVideo results:\n{video_results}"}
                    {"role": "user", "content": f"Initial mindmap:\n{initial_mindmap}\n\nVideo results:\n{video_results}\n\nNotes:\n{content_for_llm}"}
                ],
                response_format={"type": "json_object"}
            )
            
            # Parse the final mindmap
            final_mindmap = refine_response.choices[0].message.content
            final_mindmap = json.loads(final_mindmap) if isinstance(final_mindmap, str) else final_mindmap
            
            # Save to MongoDB for future use
            mongodb_client.insert_mindmap(exam_id, final_mindmap)
            
            return final_mindmap
            
        except Exception as e:
            logger.error(f"Error generating mindmap: {str(e)}")
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"Failed to generate mindmap: {str(e)}"
            )
            
    except HTTPException:
        # Re-raise HTTP exceptions
        raise
    
    except Exception as e:
        logger.error(f"Error in mindmap generation: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to process mindmap request: {str(e)}"
        )
