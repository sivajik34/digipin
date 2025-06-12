import qrcode
from io import BytesIO
from fastapi import APIRouter, Query, HTTPException
from fastapi.responses import StreamingResponse
from backend.utils.digipin import is_valid_digipin
from backend.digipin_service import get_lat_lng_from_digipin
import logging
from backend.utils.Log import Logger
Logging = Logger(name="qr_router", log_file="backend/Logs/app.log", level=logging.DEBUG)
router = APIRouter()

def generate_qr_content(digipin: str,fmt: str = "json") -> str:    
    try:
        result= get_lat_lng_from_digipin(digipin)
        #Logging.info(result["latitude"])
        #Logging.info(result["longitude"])
        latitude=result["latitude"]
        longitude=result["longitude"]
    except Exception:
        raise HTTPException(status_code=400, detail="Failed to decode DIGIPIN")
    maps_url = f"https://www.google.com/maps?q={latitude},{longitude}"
    if fmt == "json":
        import json
        return json.dumps({
            "digipin": digipin,
            "location": {
                "lat": latitude,
                "lng": longitude
            },
            "maps_url": maps_url
        }, indent=2)
    
    elif fmt == "vcard":
        return f"""BEGIN:VCARD
VERSION:4.0
LABEL;TYPE=home:{digipin}
GEO:geo:{latitude},{longitude}
URL:{maps_url}
END:VCARD"""
    
    return f"DIGIPIN: {digipin}\nGoogle Maps: {maps_url}"

def generate_qr_image(digipin: str, fmt: str = "json") -> BytesIO:
    """
    Generates a QR code image from the URL.
    """
    content = generate_qr_content(digipin, fmt)
    img = qrcode.make(content)
    buffer = BytesIO()
    img.save(buffer, format="PNG")
    buffer.seek(0)
    return buffer

@router.get("/api/qr", summary="Generate QR code image for DIGIPIN",tags=["DIGIPIN"])
async def get_qr_image(digipin: str = Query(..., min_length=1, max_length=10),format: str = Query("json", enum=["text", "json", "vcard"])):
    """Returns a QR code PNG image for a given DIGIPIN"""
    clean_digipin = digipin.replace("-", "")    
    if not is_valid_digipin(clean_digipin):
        raise HTTPException(status_code=400, detail="Invalid DIGIPIN format")    
    buffer = generate_qr_image(clean_digipin, fmt=format)

    return StreamingResponse(buffer, media_type="image/png")


@router.get("/api/qr/download", summary="Download QR code for DIGIPIN",tags=["DIGIPIN"])
async def download_qr_image(digipin: str = Query(..., min_length=1, max_length=10),format: str = Query("json", enum=["text", "json", "vcard"])):
    """Returns a downloadable QR code PNG image for a given DIGIPIN"""
    clean_digipin = digipin.replace("-", "")
    if not is_valid_digipin(clean_digipin):
        raise HTTPException(status_code=400, detail="Invalid DIGIPIN format")    
    buffer = generate_qr_image(clean_digipin, fmt=format)
    headers = {
        "Content-Disposition": f"attachment; filename=digipin_{digipin}.png"
    }
    return StreamingResponse(buffer, media_type="image/png", headers=headers)
