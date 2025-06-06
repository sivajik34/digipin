# digipin_service.py
import httpx
from fastapi import APIRouter, Query

router = APIRouter()

DIGIPIN_API_BASE = "http://localhost:5000"

@router.get("/api/digipin")
async def get_digipin(lat: float = Query(...), lng: float = Query(...)):
    async with httpx.AsyncClient() as client:
        res = await client.get(f"{DIGIPIN_API_BASE}/api/digipin/encode", params={"latitude": lat, "longitude": lng})
    return res.json()

@router.get("/api/latlng")
async def get_latlng(digipin: str):
    async with httpx.AsyncClient() as client:
        res = await client.get(f"{DIGIPIN_API_BASE}/api/digipin/decode", params={"digipin": digipin})
    return res.json()


