import { User, LeaderboardEntry, ActiveGame, AuthCredentials, GameMode } from '@/types';

const envUrl = import.meta.env.VITE_API_URL || 'http://localhost:8000';
const API_BASE_URL = envUrl.startsWith('http') ? envUrl : `https://${envUrl}`;

class ApiError extends Error {
  constructor(public status: number, message: string) {
    super(message);
    this.name = 'ApiError';
  }
}

async function fetchWithAuth(endpoint: string, options: RequestInit = {}): Promise<any> {
  const token = localStorage.getItem('token');
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...options.headers as any,
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    let errorMessage = 'An error occurred';
    try {
      const errorData = await response.json();
      errorMessage = errorData.detail || errorMessage;
    } catch {
      // Ignore JSON parse error if response is not JSON
    }
    throw new ApiError(response.status, errorMessage);
  }

  // Handle empty responses (like 204 No Content) or non-JSON responses if needed
  if (response.status === 204) {
    return null;
  }

  // Some endpoints might return void/empty, but usually API returns JSON.
  // We'll try to parse JSON, if it fails and status is ok, maybe return text or null.
  try {
    return await response.json();
  } catch (e) {
    return null;
  }
}

export const api = {
  // Auth endpoints
  auth: {
    async login(credentials: AuthCredentials): Promise<{ user: User; token: string }> {
      const data = await fetchWithAuth('/auth/login', {
        method: 'POST',
        body: JSON.stringify(credentials),
      });
      localStorage.setItem('token', data.token);
      return data;
    },

    async signup(credentials: AuthCredentials): Promise<{ user: User; token: string }> {
      const data = await fetchWithAuth('/auth/signup', {
        method: 'POST',
        body: JSON.stringify(credentials),
      });
      localStorage.setItem('token', data.token);
      return data;
    },

    async logout(): Promise<void> {
      try {
        await fetchWithAuth('/auth/logout', { method: 'POST' });
      } finally {
        localStorage.removeItem('token');
      }
    },

    async getCurrentUser(): Promise<User | null> {
      try {
        if (!localStorage.getItem('token')) return null;
        return await fetchWithAuth('/auth/me');
      } catch (error) {
        if (error instanceof ApiError && error.status === 401) {
          localStorage.removeItem('token');
          return null;
        }
        throw error;
      }
    },
  },

  // Leaderboard endpoints
  leaderboard: {
    async getAll(gameMode?: GameMode): Promise<LeaderboardEntry[]> {
      const query = gameMode ? `?gameMode=${gameMode}` : '';
      return await fetchWithAuth(`/leaderboard${query}`);
    },

    async submitScore(score: number, gameMode: GameMode): Promise<LeaderboardEntry> {
      return await fetchWithAuth('/leaderboard/score', {
        method: 'POST',
        body: JSON.stringify({ score, gameMode }),
      });
    },
  },

  // Spectate endpoints
  spectate: {
    async getActiveGames(): Promise<ActiveGame[]> {
      return await fetchWithAuth('/games/active');
    },

    async getGameById(gameId: string): Promise<ActiveGame | null> {
      try {
        return await fetchWithAuth(`/games/${gameId}`);
      } catch (error) {
        if (error instanceof ApiError && error.status === 404) {
          return null;
        }
        throw error;
      }
    },

    // Subscribe to game updates using EventSource (SSE)
    subscribeToGame(gameId: string, callback: (game: ActiveGame) => void): () => void {
      const eventSource = new EventSource(`${API_BASE_URL}/games/${gameId}/subscribe`);

      eventSource.onmessage = (event) => {
        try {
          const gameData = JSON.parse(event.data);
          callback(gameData);
        } catch (error) {
          console.error('Error parsing game update:', error);
        }
      };

      eventSource.onerror = (error) => {
        console.error('EventSource error:', error);
        eventSource.close();
      };

      return () => {
        eventSource.close();
      };
    },
  },
};

export default api;
