from fastapi_users.db import SQLAlchemyBaseUserTableUUID
from sqlalchemy import Boolean, Column, String
from backend.database import Base
from uuid import UUID

class User(SQLAlchemyBaseUserTableUUID, Base):
    __tablename__ = "users"
    # Optional additional fields
    full_name = Column(String, nullable=True)

