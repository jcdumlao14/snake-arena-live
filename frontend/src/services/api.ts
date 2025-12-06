import { User, LeaderboardEntry, ActiveGame, AuthCredentials, GameMode } from '@/types';

// Simulated delay to mimic network requests
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// Mock data storage (simulating database)
const mockUsers: User[] = [
  { id: '1', username: 'PixelMaster', email: 'pixel@game.com', createdAt: '2024-01-15' },
  { id: '2', username: 'NeonViper', email: 'neon@game.com', createdAt: '2024-02-20' },
  { id: '3', username: 'RetroKing', email: 'retro@game.com', createdAt: '2024-03-10' },
];

let currentUser: User | null = null;

const mockLeaderboard: LeaderboardEntry[] = [
  { id: '1', rank: 1, username: 'PixelMaster', score: 2450, gameMode: 'walls', date: '2024-12-01' },
  { id: '2', rank: 2, username: 'NeonViper', score: 2100, gameMode: 'pass-through', date: '2024-12-03' },
  { id: '3', rank: 3, username: 'RetroKing', score: 1890, gameMode: 'walls', date: '2024-12-02' },
  { id: '4', rank: 4, username: 'ArcadeQueen', score: 1750, gameMode: 'pass-through', date: '2024-12-04' },
  { id: '5', rank: 5, username: 'SnakeCharmer', score: 1620, gameMode: 'walls', date: '2024-12-01' },
  { id: '6', rank: 6, username: 'GlitchHunter', score: 1500, gameMode: 'pass-through', date: '2024-12-05' },
  { id: '7', rank: 7, username: 'ByteRunner', score: 1380, gameMode: 'walls', date: '2024-12-02' },
  { id: '8', rank: 8, username: 'CyberNinja', score: 1250, gameMode: 'pass-through', date: '2024-12-03' },
  { id: '9', rank: 9, username: 'VectorVenom', score: 1100, gameMode: 'walls', date: '2024-12-04' },
  { id: '10', rank: 10, username: 'DigitalDragon', score: 980, gameMode: 'pass-through', date: '2024-12-05' },
];

const mockActiveGames: ActiveGame[] = [
  {
    id: 'game1',
    username: 'NeonViper',
    score: 340,
    gameMode: 'walls',
    snake: [{ x: 10, y: 10 }, { x: 9, y: 10 }, { x: 8, y: 10 }],
    food: { x: 15, y: 12 },
    direction: 'RIGHT',
    startedAt: new Date().toISOString(),
  },
  {
    id: 'game2',
    username: 'RetroKing',
    score: 180,
    gameMode: 'pass-through',
    snake: [{ x: 5, y: 5 }, { x: 5, y: 6 }, { x: 5, y: 7 }],
    food: { x: 12, y: 8 },
    direction: 'UP',
    startedAt: new Date().toISOString(),
  },
  {
    id: 'game3',
    username: 'ArcadeQueen',
    score: 520,
    gameMode: 'walls',
    snake: [{ x: 15, y: 15 }, { x: 14, y: 15 }, { x: 13, y: 15 }, { x: 12, y: 15 }],
    food: { x: 3, y: 7 },
    direction: 'RIGHT',
    startedAt: new Date().toISOString(),
  },
];

// API Service - All backend calls centralized here
export const api = {
  // Auth endpoints
  auth: {
    async login(credentials: AuthCredentials): Promise<{ user: User; token: string }> {
      await delay(500);
      const user = mockUsers.find(u => u.email === credentials.email);
      if (!user) {
        throw new Error('Invalid credentials');
      }
      currentUser = user;
      return { user, token: 'mock-jwt-token-' + user.id };
    },

    async signup(credentials: AuthCredentials): Promise<{ user: User; token: string }> {
      await delay(700);
      if (mockUsers.find(u => u.email === credentials.email)) {
        throw new Error('Email already exists');
      }
      if (mockUsers.find(u => u.username === credentials.username)) {
        throw new Error('Username already taken');
      }
      const newUser: User = {
        id: String(mockUsers.length + 1),
        username: credentials.username!,
        email: credentials.email,
        createdAt: new Date().toISOString(),
      };
      mockUsers.push(newUser);
      currentUser = newUser;
      return { user: newUser, token: 'mock-jwt-token-' + newUser.id };
    },

    async logout(): Promise<void> {
      await delay(200);
      currentUser = null;
    },

    async getCurrentUser(): Promise<User | null> {
      await delay(100);
      return currentUser;
    },
  },

  // Leaderboard endpoints
  leaderboard: {
    async getAll(gameMode?: GameMode): Promise<LeaderboardEntry[]> {
      await delay(300);
      if (gameMode) {
        return mockLeaderboard.filter(e => e.gameMode === gameMode);
      }
      return mockLeaderboard;
    },

    async submitScore(score: number, gameMode: GameMode): Promise<LeaderboardEntry> {
      await delay(400);
      if (!currentUser) {
        throw new Error('Must be logged in to submit score');
      }
      const entry: LeaderboardEntry = {
        id: String(mockLeaderboard.length + 1),
        rank: 0,
        username: currentUser.username,
        score,
        gameMode,
        date: new Date().toISOString().split('T')[0],
      };
      mockLeaderboard.push(entry);
      mockLeaderboard.sort((a, b) => b.score - a.score);
      mockLeaderboard.forEach((e, i) => e.rank = i + 1);
      return entry;
    },
  },

  // Spectate endpoints
  spectate: {
    async getActiveGames(): Promise<ActiveGame[]> {
      await delay(200);
      return mockActiveGames;
    },

    async getGameById(gameId: string): Promise<ActiveGame | null> {
      await delay(100);
      return mockActiveGames.find(g => g.id === gameId) || null;
    },

    // Subscribe to game updates (mock implementation)
    subscribeToGame(gameId: string, callback: (game: ActiveGame) => void): () => void {
      const game = mockActiveGames.find(g => g.id === gameId);
      if (!game) return () => { };

      const interval = setInterval(() => {
        // Simulate game movement
        const directions: Record<string, { x: number; y: number }> = {
          'UP': { x: 0, y: -1 },
          'DOWN': { x: 0, y: 1 },
          'LEFT': { x: -1, y: 0 },
          'RIGHT': { x: 1, y: 0 },
        };

        const move = directions[game.direction];
        const head = game.snake[0];
        const newHead = { x: head.x + move.x, y: head.y + move.y };

        // Wrap around for pass-through mode
        if (game.gameMode === 'pass-through') {
          if (newHead.x < 0) newHead.x = 19;
          if (newHead.x > 19) newHead.x = 0;
          if (newHead.y < 0) newHead.y = 19;
          if (newHead.y > 19) newHead.y = 0;
        }

        // Check if food eaten
        const ateFood = newHead.x === game.food.x && newHead.y === game.food.y;

        game.snake = [newHead, ...game.snake];
        if (!ateFood) {
          game.snake.pop();
        } else {
          game.score += 10;
          game.food = {
            x: Math.floor(Math.random() * 20),
            y: Math.floor(Math.random() * 20),
          };
        }

        // Random direction change
        if (Math.random() < 0.1) {
          const dirs: ('UP' | 'DOWN' | 'LEFT' | 'RIGHT')[] = ['UP', 'DOWN', 'LEFT', 'RIGHT'];
          const opposite: Record<string, string> = { 'UP': 'DOWN', 'DOWN': 'UP', 'LEFT': 'RIGHT', 'RIGHT': 'LEFT' };
          const validDirs = dirs.filter(d => d !== opposite[game.direction]);
          game.direction = validDirs[Math.floor(Math.random() * validDirs.length)];
        }

        callback({ ...game });
      }, 200);

      return () => clearInterval(interval);
    },
  },
};

export default api;
