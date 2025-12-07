from typing import List, Optional
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy import desc
import uuid

# Models
from app.models import User, LeaderboardEntry, ActiveGame
# Schemas
from app.schemas import User as UserSchema, LeaderboardEntry as LeaderboardEntrySchema, ActiveGame as ActiveGameSchema
# Other deps
from datetime import datetime

# Logic currently in DB that needs to be here? 
# The DB handled some logic like "check if exists". CRUD should probably just do DB ops.
# But existing API expects `db.create_user` to raise ValueError if exists.
# I will implement similar logic.

async def get_user_by_email(db: AsyncSession, email: str) -> Optional[User]:
    result = await db.execute(select(User).where(User.email == email))
    return result.scalars().first()

async def get_user_by_username(db: AsyncSession, username: str) -> Optional[User]:
    result = await db.execute(select(User).where(User.username == username))
    return result.scalars().first()

async def create_user(db: AsyncSession, user: UserSchema, password_hash: str) -> User:
    # Check existence
    if await get_user_by_email(db, user.email):
        raise ValueError("Email already registered")
    if await get_user_by_username(db, user.username):
        raise ValueError("Username already taken")

    # user.id is usually provided by schema or generated. Schema has it.
    # If schema has ID, use it. Else generate.
    
    db_user = User(
        id=user.id,
        username=user.username,
        email=user.email,
        hashed_password=password_hash,
        created_at=user.createdAt
    )
    db.add(db_user)
    await db.commit()
    await db.refresh(db_user)
    return db_user

async def get_password_hash(db: AsyncSession, email: str) -> Optional[str]:
    user = await get_user_by_email(db, email)
    if user:
        return user.hashed_password
    return None

async def add_score(db: AsyncSession, entry: LeaderboardEntrySchema):
    # entry is Pydantic. Create ORM.
    # Note: rank is calculated dynamically in SQL usually, or updated.
    # MockDB stored rank. SQL way: query with order, or store it.
    # Storing rank is complex if others change.
    # Simple way: just insert score. Rank can be calculated on read.
    # The existing API returns LeaderboardEntry which has rank.
    # I'll just save it.
    
    db_entry = LeaderboardEntry(
        id=entry.id,
        username=entry.username,
        score=entry.score,
        game_mode=entry.gameMode.value, # Store string
        date=entry.date
    )
    db.add(db_entry)
    await db.commit()
    await db.refresh(db_entry)
    # Rank is not stored in DB_Entry (comment says so in models.py).
    # We should calculate rank? Or maybe I should update rank update.
    # For now, let's just save.
    
async def get_leaderboard(db: AsyncSession, limit: int = 10, game_mode: str = None) -> List[LeaderboardEntry]:
    query = select(LeaderboardEntry).order_by(desc(LeaderboardEntry.score))
    if game_mode:
        query = query.where(LeaderboardEntry.game_mode == game_mode)
    query = query.limit(limit)
    
    result = await db.execute(query)
    entries = result.scalars().all()
    
    # Calculate ranks
    # Ideally should be done in DB or just enumerated here.
    # Since we paginate/limit, checking absolute rank requires counting better items.
    # For this simple app, I will just enumerate 1..N for the returned list.
    for i, entry in enumerate(entries):
        entry.rank = i + 1
        
    return entries

async def create_game(db: AsyncSession, game: ActiveGameSchema):
    # Convert Pydantic to ORM
    # snake/food are Pydantic models. need to dump to dict/json.
    db_game = ActiveGame(
        id=game.id,
        username=game.username,
        score=game.score,
        game_mode=game.gameMode.value,
        snake=[p.model_dump() for p in game.snake],
        food=game.food.model_dump(),
        direction=game.direction.value,
        started_at=game.startedAt
    )
    db.add(db_game)
    await db.commit()
    await db.refresh(db_game)
    return db_game

async def get_game(db: AsyncSession, game_id: str) -> Optional[ActiveGame]:
    result = await db.execute(select(ActiveGame).where(ActiveGame.id == game_id))
    return result.scalars().first()

async def list_active_games(db: AsyncSession) -> List[ActiveGame]:
    result = await db.execute(select(ActiveGame))
    return result.scalars().all()

# Additional helper to update game state?
async def update_game(db: AsyncSession, game_id: str, **kwargs):
    # Implementation depends on needs.
    pass
