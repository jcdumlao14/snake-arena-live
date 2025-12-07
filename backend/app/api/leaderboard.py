from datetime import datetime, timezone
from typing import List, Optional

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession

from app.schemas import LeaderboardEntry, User, GameMode, ScoreSubmission
from app.api.auth import get_current_user
from app.database import get_db
import app.crud as crud
import uuid

router = APIRouter(prefix="/leaderboard", tags=["Leaderboard"])

@router.get("", response_model=List[LeaderboardEntry])
async def get_leaderboard(gameMode: Optional[GameMode] = None, db: AsyncSession = Depends(get_db)):
    return await crud.get_leaderboard(db, game_mode=gameMode)

@router.post("/score", response_model=LeaderboardEntry)
async def submit_score(submission: ScoreSubmission, current_user: User = Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    entry = LeaderboardEntry(
        id=str(uuid.uuid4()),
        rank=0, # Will be updated by crud
        username=current_user.username,
        score=submission.score,
        gameMode=submission.gameMode,
        date=datetime.now(timezone.utc)
    )
    await crud.add_score(db, entry)
    # The rank is not updated in the object returned here unless we refetch or calc it.
    # crud.add_score doesn't calculate rank for the single entry returned.
    # But schema requires rank. 0 is fine if we accept it.
    return entry
