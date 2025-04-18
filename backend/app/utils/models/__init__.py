# Path: app/utils/models/__init__.py
# Description: Import and export all models

from .subjects import (
    SubjectItem,
    SubjectCreateRequest,
    SubjectCreateResponse,
    ListSubjectResponse,
    UpdateSubjectRequest,
    UpdateSubjectResponse,
)
from .exams import (
    ExamItem,
    ExamCreateRequest,
    ExamCreateResponse,
    GetExamResponse,
    ListExamResponse,
    UpdateExamRequest,
    UpdateExamResponse,
)

from .references import (
    ReferencesTypeEnum,
    ReferenceCreateRequest,
    ReferenceCreateResponse,
    ReferenceUploadResponse,
    ReferenceItem,
    ListReferenceResponse,
    DownloadReferenceResponse,
)

from .internal import (
    MongoDbChunkDocument,
    MilvusChunkRecord,
)

from .chat import (
    ChatMessage,
    ChatRequest,
)

from .metadata import (
    YouTubeMetadataRequest,
    YouTubeMetadataResponse,
    WebsiteMetadataRequest,
    WebsiteMetadataResponse,
)

__all__ = [
    # Subjects
    "SubjectItem",
    "SubjectCreateRequest",
    "SubjectCreateResponse",
    "ListSubjectResponse",
    "UpdateSubjectRequest",
    "UpdateSubjectResponse",
    
    # Exams
    "ExamItem",
    "ExamCreateRequest",
    "ExamCreateResponse",
    "GetExamResponse",
    "ListExamResponse",
    "UpdateExamRequest",
    "UpdateExamResponse",
    
    # References
    "ReferencesTypeEnum",
    "ReferenceCreateRequest",
    "ReferenceCreateResponse",
    "ReferenceUploadResponse",
    "ReferenceItem",
    "ListReferenceResponse",
    "DownloadReferenceResponse",
    
    # Internal
    "MongoDbChunkDocument",
    "MilvusChunkRecord",
    
    # Chat
    "ChatMessage",
    "ChatRequest",
    
    # Metadata
    "YouTubeMetadataRequest",
    "YouTubeMetadataResponse",
    "WebsiteMetadataRequest",
    "WebsiteMetadataResponse",
]
