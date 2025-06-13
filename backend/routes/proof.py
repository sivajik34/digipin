from fastapi import APIRouter, HTTPException
from fastapi.responses import StreamingResponse
from pydantic import BaseModel
from io import BytesIO
from reportlab.pdfgen import canvas
from reportlab.lib.pagesizes import A4
from reportlab.lib.utils import ImageReader

from utils.digipin import is_valid_digipin, get_lat_lng_from_digipin
from routes.qrcode import generate_qr_image

router = APIRouter()

class DigipinRequest(BaseModel):
    digipin: str

@router.post("/api/proof-of-location", summary="Generate PDF Location Proof with QR")
async def generate_location_proof(request: DigipinRequest):
    digipin = request.digipin.replace("-", "")
    if not is_valid_digipin(digipin):
        raise HTTPException(status_code=400, detail="Invalid DIGIPIN format")

    # Decode to get lat/lng
    location = get_lat_lng_from_digipin(digipin)
    lat, lng = location["latitude"], location["longitude"]
    maps_url = f"https://www.google.com/maps?q={lat},{lng}"

    # Generate QR Code image
    qr_buffer = generate_qr_image(digipin, fmt="json", img_format="png")

    # Create PDF in memory
    buffer = BytesIO()
    c = canvas.Canvas(buffer, pagesize=A4)
    width, height = A4

    c.setFont("Helvetica", 14)
    c.drawString(50, height - 80, f"Proof of Location for DIGIPIN: {digipin}")
    c.setFont("Helvetica", 12)
    c.drawString(50, height - 120, f"Latitude: {lat}")
    c.drawString(50, height - 140, f"Longitude: {lng}")
    c.drawString(50, height - 160, f"Google Maps URL: {maps_url}")

    # Draw QR code
    qr_img = ImageReader(qr_buffer)
    c.drawImage(qr_img, 50, height - 400, width=150, height=150)

    c.showPage()
    c.save()
    buffer.seek(0)

    headers = {
        "Content-Disposition": f"attachment; filename=digipin_proof_{digipin}.pdf"
    }
    return StreamingResponse(buffer, media_type="application/pdf", headers=headers)
