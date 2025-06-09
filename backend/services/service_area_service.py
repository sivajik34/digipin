from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from geoalchemy2.functions import ST_Contains, ST_SetSRID, ST_MakePoint
from backend.models import ServiceArea

async def is_within_service_area(db: AsyncSession, lat: float, lon: float) -> bool:
    point = ST_SetSRID(ST_MakePoint(lon, lat), 4326)  # Note: lon first
    stmt = select(ServiceArea).where(ST_Contains(ServiceArea.region, point))
    result = await db.execute(stmt)
    return result.scalar() is not None
