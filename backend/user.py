from fastapi_users.db import SQLAlchemyUserDatabase
from models import User
from database import database

async def get_user_db():
    yield SQLAlchemyUserDatabase(User, database)

