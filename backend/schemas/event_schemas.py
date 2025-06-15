from pydantic import BaseModel, Field, constr, condecimal
from typing import Optional
from datetime import datetime
from uuid import UUID

# For create/update requests (input)
class EventCreate(BaseModel):
    digipin: constr(min_length=10, max_length=12)  # including dashes optional
    title: constr(min_length=1, max_length=100)
    description: Optional[str] = None
    start_time: datetime
    end_time: Optional[datetime] = None
    host_name: Optional[str] = None
    contact: Optional[str] = None
    latitude: condecimal(gt=-90, lt=90)
    longitude: condecimal(gt=-180, lt=180)

# For response/output (what API returns)
class EventRead(EventCreate):
    id: UUID
    created_at: datetime
    updated_at: datetime

    model_config = {
    "from_attributes": True
}
