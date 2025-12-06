from app.models import GameMode

def test_get_leaderboard_empty(client):
    response = client.get("/leaderboard")
    assert response.status_code == 200
    assert response.json() == []

def test_submit_score_unauthorized(client):
    response = client.post(
        "/leaderboard/score",
        json={"score": 100, "gameMode": "walls"}
    )
    assert response.status_code == 401

def test_submit_and_get_leaderboard(client):
    # Signup
    signup_resp = client.post(
        "/auth/signup",
        json={"email": "u1@e.com", "password": "p", "username": "u1"}
    )
    token = signup_resp.json()["token"]
    headers = {"Authorization": f"Bearer {token}"}

    # Submit score
    response = client.post(
        "/leaderboard/score",
        json={"score": 100, "gameMode": "walls"},
        headers=headers
    )
    assert response.status_code == 200
    
    # Get leaderboard
    response = client.get("/leaderboard")
    data = response.json()
    assert len(data) == 1
    assert data[0]["score"] == 100
    assert data[0]["username"] == "u1"

def test_leaderboard_sorting(client):
    # Signup u1
    token1 = client.post(
        "/auth/signup",
        json={"email": "u1@e.com", "password": "p", "username": "u1"}
    ).json()["token"]
    
    # Signup u2
    token2 = client.post(
        "/auth/signup",
        json={"email": "u2@e.com", "password": "p", "username": "u2"}
    ).json()["token"]

    client.post( "/leaderboard/score", json={"score": 50, "gameMode": "walls"}, headers={"Authorization": f"Bearer {token1}"})
    client.post( "/leaderboard/score", json={"score": 150, "gameMode": "walls"}, headers={"Authorization": f"Bearer {token2}"})

    response = client.get("/leaderboard")
    data = response.json()
    assert len(data) == 2
    assert data[0]["username"] == "u2" # 150 > 50
    assert data[1]["username"] == "u1"
