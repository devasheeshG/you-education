"""exams and subjects

Revision ID: a079509a3c2b
Revises: 
Create Date: 2025-04-16 18:34:40.200146

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = 'a079509a3c2b'
down_revision: Union[str, None] = None
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    # ### commands auto generated by Alembic - please adjust! ###
    op.create_table('subjects',
    sa.Column('id', sa.UUID(), nullable=False),
    sa.Column('name', sa.String(), nullable=False),
    sa.Column('color', sa.VARCHAR(length=6), nullable=False),
    sa.PrimaryKeyConstraint('id'),
    sa.UniqueConstraint('name', name='unique_subject_name')
    )
    op.create_table('exams',
    sa.Column('id', sa.UUID(), nullable=False),
    sa.Column('name', sa.String(), nullable=False),
    sa.Column('subject_id', sa.UUID(), nullable=False),
    sa.Column('description', sa.String(), nullable=True),
    sa.Column('exam_datetime', sa.DateTime(timezone=True), nullable=False),
    sa.Column('total_hours_to_dedicate', sa.Float(), nullable=False),
    sa.ForeignKeyConstraint(['subject_id'], ['subjects.id'], ondelete='CASCADE'),
    sa.PrimaryKeyConstraint('id'),
    sa.UniqueConstraint('name', 'subject_id', name='unique_exam_name_per_subject')
    )
    # ### end Alembic commands ###


def downgrade() -> None:
    """Downgrade schema."""
    # ### commands auto generated by Alembic - please adjust! ###
    op.drop_table('exams')
    op.drop_table('subjects')
    # ### end Alembic commands ###
