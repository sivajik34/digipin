import uuid
from fastapi_users import schemas
from pydantic import Field

class UserRead(schemas.BaseUser[uuid.UUID]):
    full_name: str | None = None
    is_oauth: bool = False
    phone_number: str | None = None
    role: str  # ✅ include role

class UserCreate(schemas.BaseUserCreate):
    full_name: str | None = None
    is_oauth: bool = False
    phone_number: str | None = None
    role: str = Field(default="user", example="user")  # ✅ default to user

class UserUpdate(schemas.BaseUserUpdate):
    full_name: str | None = None
    phone_number: str | None = None
    role: str | None = None  # ✅ allow updating role
