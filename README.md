
DIGIPIN FastAPI Service
========================

This FastAPI application provides a geolocation encoding and routing optimization system based on custom DIGIPIN codes. DIGIPIN is a proprietary location encoding format based on a 4x4 grid that maps geospatial coordinates into a 10-character string.

Features
--------

- Encode latitude and longitude to a DIGIPIN
- Decode DIGIPIN to latitude and longitude
- Retrieve address details from a DIGIPIN using OpenStreetMap
- Validate DIGIPIN within a service area
- Optimize multi-vehicle routing using DIGIPIN locations

API Endpoints
-------------

### 1. Encode DIGIPIN
**GET** `/api/digipin`

Query Params:
- `lat` (float): Latitude between 8 and 37
- `lng` (float): Longitude between 68 and 98

Returns:
- `digipin` (str)

---

### 2. Decode DIGIPIN
**GET** `/api/latlng`

Query Params:
- `digipin` (str): A 10-character DIGIPIN

Returns:
- `latitude` (float)
- `longitude` (float)

---

### 3. Get Address from DIGIPIN
**GET** `/api/address`

Query Params:
- `digipin` (str): A 10-character DIGIPIN

Returns:
- `full_address`, `city`, `state`, `country`, `pincode`, `latitude`, `longitude`

---

### 4. Validate DIGIPIN Service Area
**GET** `/api/digipin/validate`

Query Params:
- `digipin` (str)

Returns:
- Validation result including coordinates and `is_within_service_area` (bool)

---

### 5. Optimize Route
**POST** `/api/optimize-route`

Body:
```
{
  "depot": "DIGIPIN",
  "vehicles": 2,
  "locations": [
    {
      "digipin": "DIGIPIN",
      "priority": 1,
      "time_window": [0, 300]
    }
  ]
}
```

Returns:
- Optimized routes for each vehicle




6. Generate QR Code
GET /api/qr?digipin=FCJ-KLM-PT29
- Generates a QR Code PNG image for the given DIGIPIN.
- Query Parameters:
  - digipin: DIGIPIN string (10 characters after removing hyphens)
- Returns: Image (image/png)
- Validation:
  - Allowed characters: F, C, J, K, L, M, P, T, 2-9
  - Exactly 10 characters after cleaning '-'

7. Download QR Code
GET /api/qr/download?digipin=FCJ-KLM-PT29
- Downloads the QR Code image as a file.
- Returns: Downloadable PNG with filename digipin_{DIGIPIN}.png

👤 User DIGIPIN API (Requires Auth)

8. Save DIGIPIN
POST /api/digipin/user/save
- Saves a DIGIPIN for the current user.
- Body (application/json):
{
  "digipin": "FCJ-KLM-PT29",
  "user_friendly_name": "My Home Location"
}
- Returns: Saved DIGIPIN details

9. List Saved DIGIPINs
GET /api/digipin/user/list
- Lists DIGIPINs saved by the authenticated user.

10. Delete DIGIPIN
DELETE /api/digipin/user/delete/{digipin_id}
- Deletes a saved DIGIPIN using its UUID.

🧪 DIGIPIN Format Rules
- Must be exactly 10 characters (after removing '-')
- Allowed characters:
  - Uppercase letters: F, C, J, K, L, M, P, T
  - Digits: 2–9
- Invalid formats raise HTTP 400 errors.

Technologies Used
-----------------

- FastAPI
- SQLAlchemy (async)
- OR-Tools (Google)
- httpx
- OpenStreetMap Nominatim API

How to Run
----------

1. Install dependencies:
   ```
   pip install requirements.txt
   ```

2. Run the server:
   ```
   uvicorn backend.main:app --reload
   ```



License
-------

This project is licensed under the Opensource License.
