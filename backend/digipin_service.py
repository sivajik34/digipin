# digipin_service.py
import os
from dotenv import load_dotenv
import httpx
from fastapi import APIRouter, Query,  HTTPException
import re

load_dotenv()
router = APIRouter()

DIGIPIN_API_BASE = os.getenv("DIGIPIN_API_BASE", "http://localhost:5000")
ALLOWED_PATTERN = re.compile(r"^[FCJKLMPT2-9]+$", re.IGNORECASE)

@router.get("/api/digipin")
async def get_digipin(
    lat: float = Query(..., ge=8, le=37),
    lng: float = Query(..., ge=68, le=98),
):
    try:
        async with httpx.AsyncClient() as client:
            res = await client.get(
                f"{DIGIPIN_API_BASE}/api/digipin/encode",
                params={"latitude": lat, "longitude": lng},
                timeout=5.0,
            )
        res.raise_for_status()
        return res.json()
    except httpx.RequestError as e:
        raise HTTPException(status_code=502, detail="Unable to connect to DIGIPIN service")
    except httpx.HTTPStatusError as e:
        raise HTTPException(status_code=e.response.status_code, detail="DIGIPIN service error")

@router.get("/api/latlng")
async def get_latlng(
    digipin: str = Query(
        ...,
        min_length=1,
        max_length=14,
        description="DIGIPIN code with allowed chars F,C,J,K,L,M,P,T or digits 2-9",
    )
):
    clean_digipin = digipin.replace("-", "").upper()
    if len(clean_digipin) != 10 or not ALLOWED_PATTERN.fullmatch(clean_digipin):
        raise HTTPException(
            status_code=400,
            detail="Invalid DIGIPIN: must be exactly 10 characters using only F,C,J,K,L,M,P,T and digits 2-9",
        )
    
    async with httpx.AsyncClient() as client:
        res = await client.get(
            f"{DIGIPIN_API_BASE}/api/digipin/decode", params={"digipin": clean_digipin}
        )
    return res.json()

@router.get("/api/address")
async def get_address_from_digipin(digipin: str = Query(...)):
    clean_digipin = digipin.replace("-", "").upper()
    if len(clean_digipin) != 10 or not ALLOWED_PATTERN.fullmatch(clean_digipin):
        raise HTTPException(status_code=400, detail="Invalid DIGIPIN")

    async with httpx.AsyncClient() as client:
        decode_res = await client.get(
            f"{DIGIPIN_API_BASE}/api/digipin/decode",
            params={"digipin": clean_digipin}
        )
        decode_res.raise_for_status()
        coords = decode_res.json()
        lat, lng = coords["latitude"], coords["longitude"]

        reverse_res = await client.get(
            "https://nominatim.openstreetmap.org/reverse",
            params={
                "lat": lat,
                "lon": lng,
                "format": "json",
                "addressdetails": 1,
            },
            headers={"User-Agent": "digipin-app"}
        )
        reverse_res.raise_for_status()
        data = reverse_res.json()
        address = data.get("address", {})

        return {
            "latitude": lat,
            "longitude": lng,
            "full_address": data.get("display_name"),
            "pincode": address.get("postcode"),
            "city": address.get("city") or address.get("town") or address.get("village"),
            "state": address.get("state"),
            "country": address.get("country"),
        }


