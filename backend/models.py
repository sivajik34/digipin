from fastapi_users.db import SQLAlchemyBaseUserTableUUID
from sqlalchemy import Boolean, Column, String,ForeignKey, DateTime, func,Integer, Text, Float, ForeignKey
from database import Base
from sqlalchemy.orm import relationship
from sqlalchemy.dialects.postgresql import UUID
from uuid import uuid4
from geoalchemy2 import Geometry

class User(SQLAlchemyBaseUserTableUUID, Base):
    __tablename__ = "users"
    # Optional additional fields
    full_name = Column(String, nullable=True)
    is_oauth = Column(Boolean, default=False)
    digipins = relationship("SavedDigipin", back_populates="user")
    phone_number = Column(String(15), unique=True, nullable=True)
    role = Column(String(20), default="user", nullable=False)
  
class SavedDigipin(Base):
    __tablename__ = "saved_digipins"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid4,index=True)
    digipin = Column(String(10), nullable=False)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())    
    user = relationship("User", back_populates="digipins")
    user_friendly_name = Column(String(100), nullable=True)

class ServiceArea(Base):
    __tablename__ = "service_areas"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    region = Column(Geometry(geometry_type="POLYGON", srid=4326), nullable=False)

class Event(Base):
    __tablename__ = "events"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid4, index=True)
    digipin = Column(String(12), nullable=False, index=True)  # with dashes, e.g. "FJKL-MCPT29"
    title = Column(String(100), nullable=False)
    description = Column(Text, nullable=True)
    start_time = Column(DateTime(timezone=True), nullable=False)
    end_time = Column(DateTime(timezone=True), nullable=True)
    host_name = Column(String(100), nullable=True)
    contact = Column(String(100), nullable=True)
    latitude = Column(Float, nullable=False)
    longitude = Column(Float, nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now(), nullable=False)

