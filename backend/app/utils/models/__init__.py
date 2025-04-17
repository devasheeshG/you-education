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
]
