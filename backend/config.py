# backend/config.py
import os
from dotenv import load_dotenv

load_dotenv()

SECRET = os.getenv("SECRET")
DATABASE_URL = os.getenv("DATABASE_URL")
JWT_LIFETIME_SECONDS = int(os.getenv("JWT_LIFETIME_SECONDS", 3600))
DIGIPIN_API_BASE = os.getenv("DIGIPIN_API_BASE", "http://localhost:5000")