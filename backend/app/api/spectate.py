import asyncio
import json
from typing import List

from fastapi import APIRouter, HTTPException, Request
from fastapi.responses import StreamingResponse

from app.db import db
from app.models import ActiveGame

router = APIRouter(prefix="/games", tags=["Spectate"])

@router.get("/active", response_model=List[ActiveGame])
async def get_active_games():
    return db.list_active_games()

@router.get("/{id}", response_model=ActiveGame)
async def get_game_state(id: str):
    game = db.get_game(id)
    if not game:
        raise HTTPException(status_code=404, detail="Game not found")
    return game

@router.get("/{id}/subscribe")
async def subscribe_game(id: str, request: Request):
    game = db.get_game(id)
    if not game:
        raise HTTPException(status_code=404, detail="Game not found")
    
    async def event_generator():
        while True:
            if await request.is_disconnected():
                break
            
            # Fetch latest state (in a real app this would come from a channel/pubsub)
            current_game = db.get_game(id)
            if not current_game:
                break
            
            # SSE format: data: {json}\n\n
            yield f"data: {json.dumps(current_game.model_dump(mode='json'))}\n\n"
            await asyncio.sleep(1) # Send update every 1 second
            
    return StreamingResponse(event_generator(), media_type="text/event-stream")
