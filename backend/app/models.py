from sqlalchemy import Column, Integer, String, DateTime, Enum as SAEnum, JSON, ForeignKey
from sqlalchemy.orm import relationship
from datetime import datetime
import uuid

from app.database import Base
from app.schemas import GameMode, Direction, GameStatus

# Helper definitions for Enums if needed, or use String
# Helper for GUID
def generate_uuid():
    return str(uuid.uuid4())

class User(Base):
    __tablename__ = "users"

    id = Column(String, primary_key=True, default=generate_uuid)
    username = Column(String, unique=True, index=True, nullable=False)
    email = Column(String, unique=True, index=True, nullable=False)
    hashed_password = Column(String, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)

class LeaderboardEntry(Base):
    __tablename__ = "leaderboard"

    id = Column(String, primary_key=True, default=generate_uuid)
    username = Column(String, index=True, nullable=False) # In real app, ForeignKey to users.id
    score = Column(Integer, nullable=False)
    game_mode = Column(String, nullable=False) # Store Enum as string
    date = Column(DateTime, default=datetime.utcnow)
    
    # We don't store rank, it's calculated on query key

class ActiveGame(Base):
    __tablename__ = "active_games"

    id = Column(String, primary_key=True, default=generate_uuid)
    username = Column(String, nullable=False)
    score = Column(Integer, default=0)
    game_mode = Column(String, nullable=False)
    snake = Column(JSON, nullable=False) # List[dict] or List[Position]
    food = Column(JSON, nullable=False)  # dict or Position
    direction = Column(String, nullable=False)
    started_at = Column(DateTime, default=datetime.utcnow)
    status = Column(String, default="playing") # idle, playing, paused, game-over
