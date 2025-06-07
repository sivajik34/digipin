from pydantic import BaseModel
from uuid import UUID
from datetime import datetime

class DigipinCreate(BaseModel):
    digipin: str

class DigipinRead(BaseModel):
    id: UUID
    digipin: str
    created_at: datetime

    class Config:
        orm_mode = True
