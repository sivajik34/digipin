from fastapi_users.db import SQLAlchemyBaseUserTable
from sqlalchemy import Boolean, Column, String
from database import metadata

class User(SQLAlchemyBaseUserTable, metadata):
    __tablename__ = "users"
    # additional fields if needed, e.g.
    # full_name = Column(String, nullable=True)

