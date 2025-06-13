from io import BytesIO
from fastapi import APIRouter, Query, HTTPException
from fastapi.responses import StreamingResponse
from utils.digipin import is_valid_digipin,generate_qr_image,get_lat_lng_from_digipin
import logging
from utils.Log import Logger
import zipfile
from tempfile import NamedTemporaryFile
from pydantic import BaseModel
from typing import List, Literal
Logging = Logger(name="qr_router", log_file="backend/Logs/app.log", level=logging.DEBUG)
router = APIRouter()

class BulkQrRequest(BaseModel):
    digipins: List[str]
    format: Literal["text", "json", "vcard"] = "json"
    img_format: Literal["png", "svg"] = "png"

@router.get("/api/qr", summary="Generate QR code image for DIGIPIN",tags=["DIGIPIN"])
async def get_qr_image(digipin: str = Query(..., min_length=1, max_length=10),
                       format: str = Query("json", enum=["text", "json", "vcard"]),img_format: str = Query("png", enum=["png", "svg"])):
    """Returns a QR code PNG image for a given DIGIPIN"""
    clean_digipin = digipin.replace("-", "")    
    if not is_valid_digipin(clean_digipin):
        raise HTTPException(status_code=400, detail="Invalid DIGIPIN format")    
    buffer = generate_qr_image(clean_digipin, fmt=format,img_format=img_format)
    media_type = "image/svg+xml" if img_format == "svg" else "image/png"
    return StreamingResponse(buffer, media_type=media_type)


@router.get("/api/qr/download", summary="Download QR code for DIGIPIN",tags=["DIGIPIN"])
async def download_qr_image(
    digipin: str = Query(..., min_length=1, max_length=10),
    format: str = Query("json", enum=["text", "json", "vcard"]),
    img_format: str = Query("png", enum=["png", "svg"])):
    """Returns a downloadable QR code PNG image for a given DIGIPIN"""
    clean_digipin = digipin.replace("-", "")
    if not is_valid_digipin(clean_digipin):
        raise HTTPException(status_code=400, detail="Invalid DIGIPIN format")    
    buffer = generate_qr_image(clean_digipin, fmt=format, img_format=img_format)
    
    media_type = "image/svg+xml" if img_format == "svg" else "image/png"
    file_ext = "svg" if img_format == "svg" else "png"
    headers = {
        "Content-Disposition": f"attachment; filename=digipin_{digipin}.{file_ext}"
    }
    return StreamingResponse(buffer, media_type=media_type, headers=headers)

@router.post("/api/qr/bulk", summary="Generate bulk QR code images", tags=["DIGIPIN"])
async def generate_bulk_qr_codes(request: BulkQrRequest):
    if not request.digipins:
        raise HTTPException(status_code=400, detail="digipins list cannot be empty")

    # Optional: Validate each digipin format (reuse your existing validator)
    for d in request.digipins:
        clean_d = d.replace("-", "")
        if not is_valid_digipin(clean_d):
            raise HTTPException(status_code=400, detail=f"Invalid DIGIPIN format: {d}")

    # Create in-memory ZIP archive
    zip_buffer = BytesIO()
    with zipfile.ZipFile(zip_buffer, "w") as zip_file:
        for digipin in request.digipins:
            clean_digipin = digipin.replace("-", "")
            img_buffer = generate_qr_image(clean_digipin, fmt=request.format, img_format=request.img_format)
            file_ext = request.img_format
            filename = f"digipin_{clean_digipin}.{file_ext}"
            # Write QR image bytes to zip archive
            zip_file.writestr(filename, img_buffer.getvalue())

    zip_buffer.seek(0)

    headers = {
        "Content-Disposition": f"attachment; filename=digipins_qr_codes.zip"
    }
    return StreamingResponse(zip_buffer, media_type="application/zip", headers=headers)