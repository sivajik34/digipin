from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from uuid import uuid4
from backend.database import get_async_session
from backend.auth import current_active_user
from backend.models import SavedDigipin, User
from backend.schemas.digipin_schemas import DigipinCreate, DigipinRead
from typing import List
from uuid import  UUID
router = APIRouter(prefix="/api/digipin/user", tags=["user-digipins"])

@router.post("/save", response_model=DigipinRead)
async def save_digipin(
    data: DigipinCreate,
    user: User = Depends(current_active_user),
    session: AsyncSession = Depends(get_async_session),
):
    digipin_clean = data.digipin.replace("-", "").upper()
    if len(digipin_clean) != 10:
        raise HTTPException(status_code=400, detail="Invalid DIGIPIN format")

    new_dp = SavedDigipin(id=uuid4(), digipin=digipin_clean, user_id=user.id)
    session.add(new_dp)
    await session.commit()
    await session.refresh(new_dp)
    return new_dp

@router.get("/list", response_model=List[DigipinRead])
async def list_user_digipins(
    user: User = Depends(current_active_user),
    session: AsyncSession = Depends(get_async_session),
):
    result = await session.execute(
        select(SavedDigipin).where(SavedDigipin.user_id == user.id).order_by(SavedDigipin.created_at.desc())
    )
    return result.scalars().all()

@router.delete("/delete/{digipin_id}")
async def delete_user_digipin(
    digipin_id: UUID,
    user: User = Depends(current_active_user),
    session: AsyncSession = Depends(get_async_session),
):
    result = await session.execute(
        select(SavedDigipin).where(SavedDigipin.id == digipin_id, SavedDigipin.user_id == user.id)
    )
    digipin = result.scalar_one_or_none()
    if not digipin:
        raise HTTPException(status_code=404, detail="DIGIPIN not found")
    
    await session.delete(digipin)
    await session.commit()
    return {"detail": "Deleted"}
