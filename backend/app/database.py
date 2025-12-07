from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession
from sqlalchemy.orm import sessionmaker, declarative_base
from sqlalchemy.pool import NullPool
import os

# Default to SQLite for local development if not specified
DATABASE_URL = os.getenv("DATABASE_URL", "sqlite+aiosqlite:///./snake_arena.db")

# Handle Postgres URL fix for SQLAlchemy (postgres:// -> postgresql://)
if DATABASE_URL.startswith("postgres://"):
    DATABASE_URL = DATABASE_URL.replace("postgres://", "postgresql+asyncpg://", 1)
elif DATABASE_URL.startswith("postgresql://"):
     if "asyncpg" not in DATABASE_URL:
         DATABASE_URL = DATABASE_URL.replace("postgresql://", "postgresql+asyncpg://", 1)

# SQLite specific connect args
connect_args = {}
if "sqlite" in DATABASE_URL:
    connect_args = {"check_same_thread": False}

engine = create_async_engine(
    DATABASE_URL,
    echo=True, # Enable SQL echo for debugging
    future=True,
    connect_args=connect_args,
    # For SQLite, we might want to disable pooling to avoid locking issues in some setups,
    # but standard pool is usually fine.
)

AsyncSessionLocal = sessionmaker(
    bind=engine,
    class_=AsyncSession,
    expire_on_commit=False,
    autocommit=False,
    autoflush=False,
)

Base = declarative_base()

async def get_db():
    async with AsyncSessionLocal() as session:
        try:
            yield session
        finally:
            await session.close()
