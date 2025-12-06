from typing import Dict, List, Optional
from datetime import datetime
import bcrypt
from app.models import User, LeaderboardEntry, ActiveGame, GameMode, Direction, Position

class MockDB:
    def __init__(self):
        self.users: Dict[str, User] = {} # username -> User
        self.user_credentials: Dict[str, str] = {} # email -> hashed_password
        self.users_by_email: Dict[str, User] = {} # email -> User
        
        self.leaderboard: List[LeaderboardEntry] = []
        self.active_games: Dict[str, ActiveGame] = {}
        
        self._seed_data()
        
    def _seed_data(self):
        # 1. Create Users
        # Password for all is 'password123'
        pw_hash = bcrypt.hashpw(b"password123", bcrypt.gensalt()).decode('utf-8')
        
        users_data = [
            User(id="1", username="PixelMaster", email="pixel@game.com", createdAt=datetime.now()),
            User(id="2", username="NeonViper", email="neon@game.com", createdAt=datetime.now()),
            User(id="3", username="RetroKing", email="retro@game.com", createdAt=datetime.now())
        ]
        
        for user in users_data:
            self.create_user(user, pw_hash)
            
        # 2. Leaderboard
        self.leaderboard = [
            LeaderboardEntry(id="1", rank=1, username="PixelMaster", score=2450, gameMode=GameMode.WALLS, date=datetime.now()),
            LeaderboardEntry(id="2", rank=2, username="NeonViper", score=2100, gameMode=GameMode.PASS_THROUGH, date=datetime.now()),
            LeaderboardEntry(id="3", rank=3, username="RetroKing", score=1890, gameMode=GameMode.WALLS, date=datetime.now()),
            LeaderboardEntry(id="4", rank=4, username="ArcadeQueen", score=1750, gameMode=GameMode.PASS_THROUGH, date=datetime.now()),
            LeaderboardEntry(id="5", rank=5, username="SnakeCharmer", score=1620, gameMode=GameMode.WALLS, date=datetime.now()),
        ]
        
        # 3. Active Games
        game1 = ActiveGame(
            id="game1",
            username="NeonViper",
            score=340,
            gameMode=GameMode.WALLS,
            snake=[Position(x=10, y=10), Position(x=9, y=10), Position(x=8, y=10)],
            food=Position(x=15, y=12),
            direction=Direction.RIGHT,
            startedAt=datetime.now()
        )
        self.active_games[game1.id] = game1

    def create_user(self, user: User, password_hash: str):
        if user.email in self.users_by_email:
            raise ValueError("Email already registered")
        if user.username in self.users:
            raise ValueError("Username already taken")
            
        self.users[user.username] = user
        self.users_by_email[user.email] = user
        self.user_credentials[user.email] = password_hash
        return user

    def get_user_by_email(self, email: str) -> Optional[User]:
        return self.users_by_email.get(email)

    def get_user_by_username(self, username: str) -> Optional[User]:
        return self.users.get(username)
    
    def get_password_hash(self, email: str) -> Optional[str]:
        return self.user_credentials.get(email)

    def add_score(self, entry: LeaderboardEntry):
        self.leaderboard.append(entry)
        # Sort by score descending
        self.leaderboard.sort(key=lambda x: x.score, reverse=True)
        # Update ranks
        for i, ent in enumerate(self.leaderboard):
            ent.rank = i + 1

    def get_leaderboard(self, limit: int = 10, game_mode: str = None) -> List[LeaderboardEntry]:
        results = self.leaderboard
        if game_mode:
            results = [entry for entry in results if entry.gameMode == game_mode]
        return results[:limit]

    def create_game(self, game: ActiveGame):
        self.active_games[game.id] = game
        return game

    def get_game(self, game_id: str) -> Optional[ActiveGame]:
        return self.active_games.get(game_id)
    
    def list_active_games(self) -> List[ActiveGame]:
        return list(self.active_games.values())

# Global instance
db = MockDB()
