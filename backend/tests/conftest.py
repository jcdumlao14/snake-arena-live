import pytest
from fastapi.testclient import TestClient
from app.main import app
from app.db import db

@pytest.fixture
def client():
    return TestClient(app)

@pytest.fixture(autouse=True)
def clear_db():
    # Clear all data before each test
    db.users.clear()
    db.user_credentials.clear()
    db.users_by_email.clear()
    db.leaderboard.clear()
    db.active_games.clear()
