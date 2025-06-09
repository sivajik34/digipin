"""Add service_areas table with PostGIS support

Revision ID: 45268f999348
Revises: c553fd2a6797
Create Date: 2025-06-09 21:18:46.308264

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
from geoalchemy2 import Geography

# revision identifiers, used by Alembic.
revision: str = '45268f999348'
down_revision: Union[str, None] = 'c553fd2a6797'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    #op.execute('CREATE EXTENSION IF NOT EXISTS postgis')
    op.create_table(
        'service_areas',
        sa.Column('id', sa.Integer, primary_key=True),
        sa.Column('name', sa.String, nullable=False),
        sa.Column('region', Geography(geometry_type='POLYGON', srid=4326), nullable=False)
    )


def downgrade() -> None:
    """Downgrade schema."""
    op.drop_table('service_areas')
