import re
import math

DIGIPIN_ALLOWED_PATTERN = re.compile(r"^[FCJKLMPT2-9]+$")

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

def is_valid_digipin(digipin: str) -> bool:
    """Validate if a given digipin string is valid."""    
    return len(digipin) == 10 and bool(DIGIPIN_ALLOWED_PATTERN.fullmatch(digipin))


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

def haversine(lat1, lon1, lat2, lon2):
    R = 6371
    phi1, phi2 = math.radians(lat1), math.radians(lat2)
    dphi = math.radians(lat2 - lat1)
    dlambda = math.radians(lon2 - lon1)
    a = math.sin(dphi/2)**2 + math.cos(phi1)*math.cos(phi2)*math.sin(dlambda/2)**2
    return R * 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a)) * 1000

