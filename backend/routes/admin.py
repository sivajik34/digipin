from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from dependencies import get_current_admin_user
from database import get_async_session
from models import User
from sqlalchemy.future import select

router = APIRouter(prefix="/admin", tags=["Admin"])

@router.get("/users")
async def list_all_users(
    session: AsyncSession = Depends(get_async_session),
    _: User = Depends(get_current_admin_user)
):
    result = await session.execute(select(User))
    return result.scalars().all()
