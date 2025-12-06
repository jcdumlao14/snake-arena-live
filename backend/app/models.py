from datetime import datetime
from enum import Enum
from typing import List, Optional
from pydantic import BaseModel, EmailStr, Field

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
    id: str
    username: str
    email: EmailStr
    createdAt: datetime

class AuthCredentials(BaseModel):
    email: EmailStr
    password: str
    username: Optional[str] = None # Username is optional for login if using email, but required for signup usually. The spec has it as required in schema but maybe separate login/signup schemas would be better. Spec says: required: [email, password] for AuthCredentials. Wait, the spec has 'username' in AuthCredentials but only email/password required? No, let me check spec again.
    # Spec line 37: AuthCredentials... properties: email, password, username. required: [email, password]. So username is optional.

class AuthResponse(BaseModel):
    user: User
    token: str

class LeaderboardEntry(BaseModel):
    id: str
    rank: int
    username: str
    score: int
    gameMode: GameMode
    date: datetime

class ActiveGame(BaseModel):
    id: str
    username: str
    score: int
    gameMode: GameMode
    snake: List[Position]
    food: Position
    direction: Direction
    startedAt: datetime

class ScoreSubmission(BaseModel):
    score: int
    gameMode: GameMode
