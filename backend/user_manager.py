# backend/user_manager.py
from fastapi_users import BaseUserManager,UUIDIDMixin
from fastapi_users.db import SQLAlchemyUserDatabase
from models import User
from database import get_async_session
from sqlalchemy.dialects.postgresql import UUID
from fastapi import Depends
from sqlalchemy.ext.asyncio import AsyncSession
from config import SECRET

class CustomUserDatabase(SQLAlchemyUserDatabase[User, UUID]):
    def __init__(self, session, model):
        super().__init__(session, model)

    def parse_id(self, id: str) -> UUID:
        print("parse_id received:", id)
        return id

class UserManager(UUIDIDMixin,BaseUserManager[User, UUID]):
    reset_password_token_secret = SECRET
    verification_token_secret = SECRET

    async def on_after_register(self, user: User, request=None):
        print(f"User {user.id} has registered.")

    async def on_after_forgot_password(self, user: User, token: str, request=None):
        print(f"User {user.id} has forgot their password. Reset token: {token}")

async def get_user_db(session: AsyncSession = Depends(get_async_session)):
    yield CustomUserDatabase(session,User)

async def get_user_manager(user_db=Depends(get_user_db)):
    yield UserManager(user_db)
    


