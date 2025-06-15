from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from uuid import UUID

from database import get_async_session
from models import Event  
from schemas.event_schemas import EventCreate, EventRead
import logging
from utils.Log import Logger
Logging = Logger(name="events", log_file="backend/Logs/app.log", level=logging.DEBUG)
router = APIRouter(prefix="/events", tags=["events"])

# Create Event
@router.post("/", response_model=EventRead, status_code=status.HTTP_201_CREATED)
async def create_event(event_in: EventCreate, db: AsyncSession = Depends(get_async_session)):
    Logging.info("Incoming event data:", event_in)
    new_event = Event(**event_in.dict())
    db.add(new_event)
    await db.commit()
    await db.refresh(new_event)
    return new_event

# Get Event by ID
@router.get("/{event_id}", response_model=EventRead)
async def get_event(event_id: UUID, db: AsyncSession = Depends(get_async_session)):
    result = await db.execute(select(Event).where(Event.id == event_id))
    event = result.scalars().first()
    if not event:
        raise HTTPException(status_code=404, detail="Event not found")
    return event

# List all Events
@router.get("/", response_model=list[EventRead])
async def list_events(skip: int = 0, limit: int = 100, db: AsyncSession = Depends(get_async_session)):
    result = await db.execute(select(Event).offset(skip).limit(limit))
    events = result.scalars().all()
    return events

# Update Event by ID
@router.put("/{event_id}", response_model=EventRead)
async def update_event(event_id: UUID, event_in: EventCreate, db: AsyncSession = Depends(get_async_session)):
    result = await db.execute(select(Event).where(Event.id == event_id))
    event = result.scalars().first()
    if not event:
        raise HTTPException(status_code=404, detail="Event not found")
    for key, value in event_in.dict().items():
        setattr(event, key, value)
    await db.commit()
    await db.refresh(event)
    return event

# Delete Event by ID
@router.delete("/{event_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_event(event_id: UUID, db: AsyncSession = Depends(get_async_session)):
    result = await db.execute(select(Event).where(Event.id == event_id))
    event = result.scalars().first()
    if not event:
        raise HTTPException(status_code=404, detail="Event not found")
    await db.delete(event)
    await db.commit()
    return
