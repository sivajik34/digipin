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

    model_config = {
    "from_attributes": True
}
        
class EncodeDigipinResponse(BaseModel):
    digipin: str

class DecodeDigipinResponse(BaseModel):
    latitude: float
    longitude: float

class AddressResponse(BaseModel):
    latitude: float
    longitude: float
    full_address: str | None
    pincode: str | None
    city: str | None
    state: str | None
    country: str | None        
