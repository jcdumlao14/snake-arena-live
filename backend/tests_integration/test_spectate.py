import pytest
from datetime import datetime
from sqlalchemy.ext.asyncio import AsyncSession
from app import crud
from app.schemas import ActiveGame, GameMode, Direction, Position

@pytest.mark.asyncio
async def test_get_active_games_empty(client):
    response = await client.get("/games/active")
    assert response.status_code == 200
    assert response.json() == []

@pytest.mark.asyncio
async def test_get_game_state_not_found(client):
    response = await client.get("/games/nonexistent")
    assert response.status_code == 404

# Mocking internal DB state for testing spectate as we don't have endpoints to creating active games externally easily
# (Active games start via websocket usually, but here we just mock DB state manually for test)
@pytest.mark.asyncio
async def test_get_active_game_state(client, session: AsyncSession):
    game = ActiveGame(
        id="game1",
        username="u1",
        score=10,
        gameMode=GameMode.WALLS,
        snake=[Position(x=10, y=10)],
        food=Position(x=5, y=5),
        direction=Direction.UP,
        startedAt=datetime.now()
    )
    # Use CRUD to create game
    await crud.create_game(session, game)
    
    response = await client.get("/games/game1")
    assert response.status_code == 200
    data = response.json()
    assert data["id"] == "game1"
    assert data["score"] == 10
