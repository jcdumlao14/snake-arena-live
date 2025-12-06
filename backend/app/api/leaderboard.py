from datetime import datetime
from typing import List, Optional

from fastapi import APIRouter, Depends, HTTPException

from app.db import db
from app.models import LeaderboardEntry, User, GameMode, ScoreSubmission
from app.api.auth import get_current_user
import uuid

router = APIRouter(prefix="/leaderboard", tags=["Leaderboard"])

@router.get("", response_model=List[LeaderboardEntry])
async def get_leaderboard(gameMode: Optional[GameMode] = None):
    return db.get_leaderboard(game_mode=gameMode)

@router.post("/score", response_model=LeaderboardEntry)
async def submit_score(submission: ScoreSubmission, current_user: User = Depends(get_current_user)):
    entry = LeaderboardEntry(
        id=str(uuid.uuid4()),
        rank=0, # Will be updated by db.add_score
        username=current_user.username,
        score=submission.score,
        gameMode=submission.gameMode,
        date=datetime.now()
    )
    db.add_score(entry)
    return entry
