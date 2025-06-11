import qrcode
from io import BytesIO
from fastapi import APIRouter, Query, HTTPException
from fastapi.responses import StreamingResponse
from backend.utils.digipin import is_valid_digipin

router = APIRouter()


@router.get("/api/qr", summary="Generate QR code image for DIGIPIN",tags=["DIGIPIN"])
async def get_qr_image(digipin: str = Query(..., min_length=1, max_length=10)):
    """Returns a QR code PNG image for a given DIGIPIN"""
    clean_digipin = digipin.replace("-", "")    
    if not is_valid_digipin(clean_digipin):
        raise HTTPException(status_code=400, detail="Invalid DIGIPIN format")

    img = qrcode.make(clean_digipin)
    buffer = BytesIO()
    img.save(buffer, format="PNG")
    buffer.seek(0)

    return StreamingResponse(buffer, media_type="image/png")


@router.get("/api/qr/download", summary="Download QR code for DIGIPIN",tags=["DIGIPIN"])
async def download_qr_image(digipin: str = Query(..., min_length=1, max_length=10)):
    """Returns a downloadable QR code PNG image for a given DIGIPIN"""
    if not is_valid_digipin(digipin):
        raise HTTPException(status_code=400, detail="Invalid DIGIPIN format")

    img = qrcode.make(digipin)
    buffer = BytesIO()
    img.save(buffer, format="PNG")
    buffer.seek(0)

    headers = {
        "Content-Disposition": f"attachment; filename=digipin_{digipin}.png"
    }

    return StreamingResponse(buffer, media_type="image/png", headers=headers)
