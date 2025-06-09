from sqlalchemy import  MetaData
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.ext.asyncio import AsyncSession, create_async_engine
from sqlalchemy.orm import sessionmaker
from backend.config import DATABASE_URL

# Raise an error if it's not set
if not DATABASE_URL:
    raise ValueError("DATABASE_URL is not set in the environment.")

# Async SQLAlchemy engine
async_engine = create_async_engine(DATABASE_URL, echo=True)

# Async sessionmaker
async_session_maker = sessionmaker(
    async_engine, expire_on_commit=False, class_=AsyncSession
)
metadata = MetaData()
Base = declarative_base(metadata=metadata)

async def get_async_session() -> AsyncSession:
    async with async_session_maker() as session:
        yield session
async def get_db() -> AsyncSession:
    async with async_session_maker() as session:
        yield session