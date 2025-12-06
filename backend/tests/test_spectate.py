from datetime import datetime

def test_get_active_games_empty(client):
    response = client.get("/games/active")
    assert response.status_code == 200
    assert response.json() == []

def test_get_game_state_not_found(client):
    response = client.get("/games/nonexistent")
    assert response.status_code == 404

# Mocking internal DB state for testing spectate as we don't have endpoints to creating active games externally easily
# (Active games start via websocket usually, but here we just mock DB state manually for test)
def test_get_active_game_state(client):
    from app.db import db
    from app.models import ActiveGame, GameMode, Direction, Position
    
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
    db.create_game(game)
    
    response = client.get("/games/game1")
    assert response.status_code == 200
    data = response.json()
    assert data["id"] == "game1"
    assert data["score"] == 10
