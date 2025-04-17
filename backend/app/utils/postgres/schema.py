# Path: app/utils/postgres/schema.py
# Description: This file contains the database schema of the application.

import uuid
from app.utils.postgres.base import DatabaseBase
from sqlalchemy import (
    Column, 
    String, 
    VARCHAR, 
    UUID, 
    DateTime, 
    Integer,
    Enum as SQLEnum,
    ForeignKeyConstraint,
    UniqueConstraint
)
from sqlalchemy.orm import relationship
from app.utils.models import ReferencesTypeEnum

class Subject(DatabaseBase):
    __tablename__ = "subjects"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    name = Column(String, nullable=False)
    color = Column(VARCHAR(length=6), nullable=False)  # hex color code
    
    __table_args__ = (
        UniqueConstraint("name", name="unique_subject_name"),
    )

class Exam(DatabaseBase):
    __tablename__ = "exams"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    name = Column(String, nullable=False)
    subject_id = Column(UUID(as_uuid=True), nullable=False)
    description = Column(String, nullable=True)
    exam_datetime = Column(DateTime(timezone=True), nullable=False)
    total_hours_to_dedicate = Column(Integer, nullable=False)
    
    # Define relationship to Subject
    subject = relationship("Subject", backref="exams")
    
    __table_args__ = (
        UniqueConstraint("name", "subject_id", name="unique_exam_name_per_subject"),
        ForeignKeyConstraint(
            ["subject_id"],
            ["subjects.id"],
            ondelete="CASCADE",
        ),
    )

class Reference(DatabaseBase):
    __tablename__ = "references"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    exam_id = Column(UUID(as_uuid=True), nullable=False)
    file_type = Column(SQLEnum(ReferencesTypeEnum), nullable=False)
    file_name = Column(String, nullable=False)
    
    # Define relationship to Exam
    exam = relationship("Exam", backref="references")
    
    __table_args__ = (
        UniqueConstraint("file_type", "file_name", "exam_id", name="unique_reference_file_per_exam"),
        ForeignKeyConstraint(
            ["exam_id"],
            ["exams.id"],
            ondelete="CASCADE",
        ),
    )

class Chunks(DatabaseBase):
    __tablename__ = "chunks"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    reference_id = Column(UUID(as_uuid=True), nullable=False)
    chunk_number = Column(Integer, nullable=False)
    total_chunks = Column(Integer, nullable=False)
    
    # Define relationship to Reference
    reference = relationship("Reference", backref="chunks")
    
    __table_args__ = (
        UniqueConstraint("reference_id", "chunk_number", name="unique_chunk_number_per_reference"),
        ForeignKeyConstraint(
            ["reference_id"],
            ["references.id"],
            ondelete="CASCADE",
        ),
    )