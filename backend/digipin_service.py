import httpx
from fastapi import APIRouter, Query, HTTPException,Depends
import re
from backend.schemas.digipin_schemas import EncodeDigipinResponse, DecodeDigipinResponse, AddressResponse
from backend.services.service_area_service import is_within_service_area
from sqlalchemy.ext.asyncio import AsyncSession
from backend.database import get_db
router = APIRouter()

ALLOWED_PATTERN = re.compile(r"^[FCJKLMPT2-9]+$", re.IGNORECASE)

# 4x4 grid used for digipin encoding
DIGIPIN_GRID = [
    ['F', 'C', '9', '8'],
    ['J', '3', '2', '7'],
    ['K', '4', '5', '6'],
    ['L', 'M', 'P', 'T']
]

# Bounding box for valid lat/lon
BOUNDS = {
    "minLat": 2.5,
    "maxLat": 38.5,
    "minLon": 63.5,
    "maxLon": 99.5
}

def get_digipin(lat: float, lon: float) -> str:
    """
    Encode latitude and longitude into a DIGIPIN code.
    """
    if lat < BOUNDS["minLat"] or lat > BOUNDS["maxLat"]:
        raise ValueError("Latitude out of range")
    if lon < BOUNDS["minLon"] or lon > BOUNDS["maxLon"]:
        raise ValueError("Longitude out of range")

    min_lat, max_lat = BOUNDS["minLat"], BOUNDS["maxLat"]
    min_lon, max_lon = BOUNDS["minLon"], BOUNDS["maxLon"]
    digipin = ""

    for level in range(1, 11):
        lat_div = (max_lat - min_lat) / 4
        lon_div = (max_lon - min_lon) / 4

        row = 3 - int((lat - min_lat) / lat_div)
        col = int((lon - min_lon) / lon_div)

        row = max(0, min(row, 3))
        col = max(0, min(col, 3))

        digipin += DIGIPIN_GRID[row][col]

        if level == 3 or level == 6:
            digipin += "-"

        max_lat = min_lat + lat_div * (4 - row)
        min_lat = min_lat + lat_div * (3 - row)
        min_lon = min_lon + lon_div * col
        max_lon = min_lon + lon_div

    return digipin


def get_lat_lng_from_digipin(digipin: str) -> dict:
    """
    Decode a DIGIPIN code into its corresponding latitude and longitude.
    """
    pin = digipin.replace("-", "")
    if len(pin) != 10:
        raise ValueError("Invalid DIGIPIN length")

    min_lat, max_lat = BOUNDS["minLat"], BOUNDS["maxLat"]
    min_lon, max_lon = BOUNDS["minLon"], BOUNDS["maxLon"]

    for char in pin:
        found = False
        for r in range(4):
            for c in range(4):
                if DIGIPIN_GRID[r][c] == char:
                    ri, ci = r, c
                    found = True
                    break
            if found:
                break

        if not found:
            raise ValueError(f"Invalid character in DIGIPIN: {char}")

        lat_div = (max_lat - min_lat) / 4
        lon_div = (max_lon - min_lon) / 4

        lat1 = max_lat - lat_div * (ri + 1)
        lat2 = max_lat - lat_div * ri
        lon1 = min_lon + lon_div * ci
        lon2 = min_lon + lon_div * (ci + 1)

        min_lat, max_lat = lat1, lat2
        min_lon, max_lon = lon1, lon2

    return {
        "latitude": round((min_lat + max_lat) / 2, 6),
        "longitude": round((min_lon + max_lon) / 2, 6)
    }


@router.get("/api/digipin", response_model=EncodeDigipinResponse, tags=["DIGIPIN"])
async def get_digipin_by_lat_lng(
    lat: float = Query(..., ge=8, le=37, description="Latitude value (8 to 37 degrees)"),
    lng: float = Query(..., ge=68, le=98, description="Longitude value (68 to 98 degrees)")
):
    """
    Generate a DIGIPIN code for the given latitude and longitude.

    - **lat**: Latitude in degrees
    - **lng**: Longitude in degrees
    - **Returns**: Encoded DIGIPIN code
    """
    try:
        digipin = get_digipin(lat, lng)
        return {"digipin": digipin}
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.get("/api/latlng", response_model=DecodeDigipinResponse, tags=["DIGIPIN"])
async def get_latlng(
    digipin: str = Query(
        ...,
        min_length=1,
        max_length=14,
        description="DIGIPIN code (10 characters using F,C,J,K,L,M,P,T and digits 2–9)"
    )
):
    """
    Decode a DIGIPIN code into its latitude and longitude.

    - **digipin**: A valid 10-character DIGIPIN
    - **Returns**: Latitude and longitude as float values
    """
    clean_digipin = digipin.replace("-", "").upper()
    if len(clean_digipin) != 10 or not ALLOWED_PATTERN.fullmatch(clean_digipin):
        raise HTTPException(
            status_code=400,
            detail="Invalid DIGIPIN: must be exactly 10 characters using only F,C,J,K,L,M,P,T and digits 2-9"
        )
    
    try:
        result = get_lat_lng_from_digipin(clean_digipin)
        return result
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.get("/api/address", response_model=AddressResponse, tags=["DIGIPIN"])
async def get_address_from_digipin(
    digipin: str = Query(..., description="DIGIPIN code to be decoded into address")
):
    """
    Get full address details from a DIGIPIN code using reverse geocoding.

    - **digipin**: A valid 10-character DIGIPIN
    - **Returns**: Address fields including full address, city, state, country, and pincode
    """
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

@router.get("/api/digipin/validate", tags=["DIGIPIN"])
async def validate_digipin_service_area(
    digipin: str = Query(..., description="DIGIPIN to validate"),
    db: AsyncSession = Depends(get_db)
):
    clean_digipin = digipin.replace("-", "").upper()
    if len(clean_digipin) != 10 or not ALLOWED_PATTERN.fullmatch(clean_digipin):
        raise HTTPException(status_code=400,detail="Invalid DIGIPIN: must be exactly 10 characters using only F,C,J,K,L,M,P,T and digits 2-9")
    coords = get_lat_lng_from_digipin(clean_digipin)
    is_valid = await is_within_service_area(db, coords["latitude"], coords["longitude"])
    return {
        "digipin": clean_digipin,
        "latitude": coords["latitude"],
        "longitude": coords["longitude"],
        "is_within_service_area": is_valid
    }        
