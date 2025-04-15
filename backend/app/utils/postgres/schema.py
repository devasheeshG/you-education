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
    Float, 
    ForeignKeyConstraint,
    UniqueConstraint
)

class Subject(DatabaseBase):
    __tablename__ = "subjects"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    name = Column(String, nullable=False)
    color = Column(VARCHAR(length=6), nullable=False)  # hex color code
    # created_at = Column(DateTime(timezone=True), nullable=False, default=lambda: datetime.now(timezone.utc))
    # updated_at = Column(DateTime(timezone=True), nullable=False, default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))

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
    total_hours = Column(Float, nullable=False)  # Total hours to dedicate
    # created_at = Column(DateTime(timezone=True), nullable=False, default=lambda: datetime.now(timezone.utc))
    # updated_at = Column(DateTime(timezone=True), nullable=False, default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))

    __table_args__ = (
        UniqueConstraint("name", "subject_id", name="unique_exam_name_per_subject"),
        ForeignKeyConstraint(
            ["subject_id"],
            ["subjects.id"],
            ondelete="CASCADE",
        ),
    )
