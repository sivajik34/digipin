import asyncio
from logging.config import fileConfig
from sqlalchemy.ext.asyncio import async_engine_from_config
from sqlalchemy.ext.asyncio import AsyncEngine
from alembic import context
import os

import sys
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..')))
from backend.config import DATABASE_URL

# Alembic Config object
config = context.config

# Set from environment (escape `%`)
#DATABASE_URL = os.getenv("DATABASE_URL").replace("%", "%%")


# Interpret the config file for Python logging.
fileConfig(config.config_file_name)

if DATABASE_URL is None:
    raise ValueError("DATABASE_URL not set in .env")

# Override sqlalchemy.url in alembic.ini dynamically
config.set_main_option("sqlalchemy.url", DATABASE_URL)

# Import your models and Base here
from backend.database import Base  # Change this to your real import
import backend.models
target_metadata = Base.metadata


def run_migrations_offline():
    """Run migrations in 'offline' mode."""
    context.configure(
        url=DATABASE_URL,
        target_metadata=target_metadata,
        literal_binds=True,
        dialect_opts={"paramstyle": "named"},
    )

    with context.begin_transaction():
        context.run_migrations()


def do_run_migrations(connection):
    context.configure(connection=connection, target_metadata=target_metadata)

    with context.begin_transaction():
        context.run_migrations()


async def run_migrations_online():
    """Run migrations in 'online' mode."""

    connectable: AsyncEngine = async_engine_from_config(
        config.get_section(config.config_ini_section),
        prefix="sqlalchemy.",
        poolclass=None,
    )

    async with connectable.connect() as connection:
        await connection.run_sync(do_run_migrations)

    await connectable.dispose()


if context.is_offline_mode():
    run_migrations_offline()
else:
    asyncio.run(run_migrations_online())

