import asyncio
import json
from typing import List

from fastapi import APIRouter, HTTPException, Request, Depends
from fastapi.responses import StreamingResponse
from sqlalchemy.ext.asyncio import AsyncSession

from app.schemas import ActiveGame
from app.database import get_db, AsyncSessionLocal
import app.crud as crud

router = APIRouter(prefix="/games", tags=["Spectate"])

@router.get("/active", response_model=List[ActiveGame])
async def get_active_games(db: AsyncSession = Depends(get_db)):
    return await crud.list_active_games(db)

@router.get("/{id}", response_model=ActiveGame)
async def get_game_state(id: str, db: AsyncSession = Depends(get_db)):
    game = await crud.get_game(db, id)
    if not game:
        raise HTTPException(status_code=404, detail="Game not found")
    return game

@router.get("/{id}/subscribe")
async def subscribe_game(id: str, request: Request):
    # Initial check (using a temporary session)
    async with AsyncSessionLocal() as db:
        game = await crud.get_game(db, id)
        if not game:
            raise HTTPException(status_code=404, detail="Game not found")
    
    async def event_generator():
        while True:
            if await request.is_disconnected():
                break
            
            # Fetch latest state with a new session each time
            async with AsyncSessionLocal() as db:
                current_game = await crud.get_game(db, id)
            
            if not current_game:
                break
            
            # SSE format: data: {json}\n\n
            yield f"data: {json.dumps(current_game.model_dump(mode='json'))}\n\n"
            await asyncio.sleep(1) # Send update every 1 second
            
    return StreamingResponse(event_generator(), media_type="text/event-stream")
