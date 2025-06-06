import os
from dotenv import load_dotenv
from databases import Database
from sqlalchemy import create_engine, MetaData

# Load environment variables from .env file
load_dotenv()

# Read the DATABASE_URL from environment
DATABASE_URL = os.getenv("DATABASE_URL")

# Raise an error if it's not set
if not DATABASE_URL:
    raise ValueError("DATABASE_URL is not set in the environment.")

# Create async database connection
database = Database(DATABASE_URL)
metadata = MetaData()

# Create sync engine (for Alembic or other synchronous tasks)
engine = create_engine(DATABASE_URL.replace("+asyncpg", ""), echo=True)

