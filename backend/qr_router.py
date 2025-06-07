import re
import qrcode
from io import BytesIO
from fastapi import APIRouter, Query, HTTPException
from fastapi.responses import StreamingResponse

router = APIRouter()

# Regex for allowed DIGIPIN characters
ALLOWED_PATTERN = re.compile(r"^[FCJKLMPT2-9]+$", re.IGNORECASE)

@router.get("/api/qr", summary="Generate QR code image for DIGIPIN")
async def get_qr_image(digipin: str = Query(..., min_length=1, max_length=10)):
    """Returns a QR code PNG image for a given DIGIPIN"""
    clean_digipin = digipin.replace("-", "")
    if len(clean_digipin) != 10:
        raise HTTPException(status_code=400, detail="DIGIPIN must be 10 characters long after cleaning.")
    if not ALLOWED_PATTERN.fullmatch(clean_digipin):
        raise HTTPException(status_code=400, detail="Invalid DIGIPIN format")

    img = qrcode.make(clean_digipin)
    buffer = BytesIO()
    img.save(buffer, format="PNG")
    buffer.seek(0)

    return StreamingResponse(buffer, media_type="image/png")


@router.get("/api/qr/download", summary="Download QR code for DIGIPIN")
async def download_qr_image(digipin: str = Query(..., min_length=1, max_length=10)):
    """Returns a downloadable QR code PNG image for a given DIGIPIN"""
    if not ALLOWED_PATTERN.fullmatch(digipin):
        raise HTTPException(status_code=400, detail="Invalid DIGIPIN format")

    img = qrcode.make(digipin)
    buffer = BytesIO()
    img.save(buffer, format="PNG")
    buffer.seek(0)

    headers = {
        "Content-Disposition": f"attachment; filename=digipin_{digipin}.png"
    }

    return StreamingResponse(buffer, media_type="image/png", headers=headers)
