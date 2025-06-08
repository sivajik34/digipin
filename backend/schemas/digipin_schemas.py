from pydantic import BaseModel
from uuid import UUID
from datetime import datetime
from typing import Optional

class DigipinCreate(BaseModel):
    digipin: str
    user_friendly_name: Optional[str] = None

class DigipinRead(BaseModel):
    id: UUID
    digipin: str
    user_friendly_name: Optional[str] = None
    created_at: datetime

    class Config:
        orm_mode = True
