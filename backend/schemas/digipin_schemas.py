from pydantic import BaseModel,Field
from uuid import UUID
from datetime import datetime
from typing import Optional,Tuple,List

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

class RouteLocation(BaseModel):
    digipin: str
    priority: int = Field(..., ge=1, le=3)
    time_window: Tuple[int, int] = Field(..., description="Start and end time window")

class OptimizeRouteRequest(BaseModel):
    depot: str
    vehicles: int
    locations: List[RouteLocation]

class OptimizedRoute(BaseModel):
    vehicle_id: int
    stops: List[str]

class OptimizeRouteResponse(BaseModel):
    routes: List[OptimizedRoute]