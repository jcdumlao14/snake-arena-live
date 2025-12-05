export type Direction = 'UP' | 'DOWN' | 'LEFT' | 'RIGHT';

export type GameMode = 'walls' | 'pass-through';

export type GameStatus = 'idle' | 'playing' | 'paused' | 'game-over';

export interface Position {
  x: number;
  y: number;
}

export interface User {
  id: string;
  username: string;
  email: string;
  createdAt: string;
}

export interface LeaderboardEntry {
  id: string;
  rank: number;
  username: string;
  score: number;
  gameMode: GameMode;
  date: string;
}

export interface ActiveGame {
  id: string;
  username: string;
  score: number;
  gameMode: GameMode;
  snake: Position[];
  food: Position;
  direction: Direction;
  startedAt: string;
}

export interface AuthCredentials {
  email: string;
  password: string;
  username?: string;
}

export interface GameState {
  snake: Position[];
  food: Position;
  direction: Direction;
  score: number;
  status: GameStatus;
  gameMode: GameMode;
  speed: number;
}
