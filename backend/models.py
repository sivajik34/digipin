from fastapi_users.db import SQLAlchemyBaseUserTableUUID
from sqlalchemy import Boolean, Column, String,ForeignKey, DateTime, func
from backend.database import Base
from sqlalchemy.orm import relationship
from sqlalchemy.dialects.postgresql import UUID
from uuid import uuid4

class User(SQLAlchemyBaseUserTableUUID, Base):
    __tablename__ = "users"
    # Optional additional fields
    full_name = Column(String, nullable=True)
    digipins = relationship("SavedDigipin", back_populates="user")

class SavedDigipin(Base):
    __tablename__ = "saved_digipins"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid4,index=True)
    digipin = Column(String(10), nullable=False)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    user = relationship("User", back_populates="digipins")