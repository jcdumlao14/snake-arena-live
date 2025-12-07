from datetime import datetime
from enum import Enum
from typing import List, Optional
from pydantic import BaseModel, EmailStr, Field, ConfigDict

class GameMode(str, Enum):
    WALLS = "walls"
    PASS_THROUGH = "pass-through"

class Direction(str, Enum):
    UP = "UP"
    DOWN = "DOWN"
    LEFT = "LEFT"
    RIGHT = "RIGHT"

class GameStatus(str, Enum):
    IDLE = "idle"
    PLAYING = "playing"
    PAUSED = "paused"
    GAME_OVER = "game-over"

class Position(BaseModel):
    x: int
    y: int

class User(BaseModel):
    model_config = ConfigDict(from_attributes=True, populate_by_name=True)

    id: str
    username: str
    email: EmailStr
    createdAt: datetime = Field(validation_alias="created_at", serialization_alias="createdAt")

class AuthCredentials(BaseModel):
    email: EmailStr
    password: str
    username: Optional[str] = None 

class AuthResponse(BaseModel):
    user: User
    token: str

class LeaderboardEntry(BaseModel):
    model_config = ConfigDict(from_attributes=True, populate_by_name=True)

    id: str
    rank: int = 0
    username: str
    score: int
    gameMode: GameMode = Field(validation_alias="game_mode", serialization_alias="gameMode")
    date: datetime

class ActiveGame(BaseModel):
    model_config = ConfigDict(from_attributes=True, populate_by_name=True)

    id: str
    username: str
    score: int
    gameMode: GameMode = Field(validation_alias="game_mode", serialization_alias="gameMode")
    snake: List[Position]
    food: Position
    direction: Direction
    startedAt: datetime = Field(validation_alias="started_at", serialization_alias="startedAt")

class ScoreSubmission(BaseModel):
    score: int
    gameMode: GameMode
