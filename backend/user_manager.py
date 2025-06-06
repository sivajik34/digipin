# backend/user_manager.py
from fastapi_users import BaseUserManager,UUIDIDMixin
from fastapi_users.db import SQLAlchemyUserDatabase
from backend.models import User
from backend.database import get_async_session
from uuid import UUID
from fastapi import Depends
from sqlalchemy.ext.asyncio import AsyncSession
SECRET = "SUPERSECRETSECRET"  # Replace with a secure secret!

class UserManager(UUIDIDMixin,BaseUserManager[User, UUID]):
    reset_password_token_secret = SECRET
    verification_token_secret = SECRET

    async def on_after_register(self, user: User, request=None):
        print(f"User {user.id} has registered.")

    async def on_after_forgot_password(self, user: User, token: str, request=None):
        print(f"User {user.id} has forgot their password. Reset token: {token}")

async def get_user_db(session: AsyncSession = Depends(get_async_session)):
    yield SQLAlchemyUserDatabase(session, User)

async def get_user_manager(user_db=Depends(get_user_db)):
    yield UserManager(user_db)


