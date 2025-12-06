import { useState, useCallback, useEffect, useRef } from 'react';
import { Direction, Position, GameMode, GameStatus, GameState } from '@/types';

const GRID_SIZE = 20;
const INITIAL_SPEED = 150;
const SPEED_INCREMENT = 5;
const MIN_SPEED = 50;

// Pure functions for game logic (easy to test)
export const gameLogic = {
  createInitialSnake(): Position[] {
    return [
      { x: 10, y: 10 },
      { x: 9, y: 10 },
      { x: 8, y: 10 },
    ];
  },

  generateFood(snake: Position[]): Position {
    let food: Position;
    do {
      food = {
        x: Math.floor(Math.random() * GRID_SIZE),
        y: Math.floor(Math.random() * GRID_SIZE),
      };
    } while (snake.some(segment => segment.x === food.x && segment.y === food.y));
    return food;
  },

  getNextHead(head: Position, direction: Direction): Position {
    const moves: Record<Direction, Position> = {
      UP: { x: head.x, y: head.y - 1 },
      DOWN: { x: head.x, y: head.y + 1 },
      LEFT: { x: head.x - 1, y: head.y },
      RIGHT: { x: head.x + 1, y: head.y },
    };
    return moves[direction];
  },

  wrapPosition(position: Position): Position {
    return {
      x: (position.x + GRID_SIZE) % GRID_SIZE,
      y: (position.y + GRID_SIZE) % GRID_SIZE,
    };
  },

  isOutOfBounds(position: Position): boolean {
    return position.x < 0 || position.x >= GRID_SIZE || position.y < 0 || position.y >= GRID_SIZE;
  },

  checkSelfCollision(head: Position, body: Position[]): boolean {
    return body.some(segment => segment.x === head.x && segment.y === head.y);
  },

  isOppositeDirection(current: Direction, next: Direction): boolean {
    const opposites: Record<Direction, Direction> = {
      UP: 'DOWN',
      DOWN: 'UP',
      LEFT: 'RIGHT',
      RIGHT: 'LEFT',
    };
    return opposites[current] === next;
  },

  moveSnake(
    snake: Position[],
    direction: Direction,
    food: Position,
    gameMode: GameMode
  ): { snake: Position[]; food: Position; ate: boolean; gameOver: boolean } {
    const head = snake[0];
    let nextHead = gameLogic.getNextHead(head, direction);

    // Handle wall collision based on game mode
    if (gameMode === 'walls') {
      if (gameLogic.isOutOfBounds(nextHead)) {
        return { snake, food, ate: false, gameOver: true };
      }
    } else {
      // pass-through mode - wrap around
      nextHead = gameLogic.wrapPosition(nextHead);
    }

    // Check self collision
    if (gameLogic.checkSelfCollision(nextHead, snake)) {
      return { snake, food, ate: false, gameOver: true };
    }

    // Check if eating food
    const ate = nextHead.x === food.x && nextHead.y === food.y;
    const newSnake = [nextHead, ...snake];
    
    if (!ate) {
      newSnake.pop();
    }

    const newFood = ate ? gameLogic.generateFood(newSnake) : food;

    return { snake: newSnake, food: newFood, ate, gameOver: false };
  },

  calculateSpeed(score: number): number {
    const speedReduction = Math.floor(score / 50) * SPEED_INCREMENT;
    return Math.max(MIN_SPEED, INITIAL_SPEED - speedReduction);
  },
};

export function useSnakeGame(gridSize: number = GRID_SIZE) {
  const [gameState, setGameState] = useState<GameState>(() => ({
    snake: gameLogic.createInitialSnake(),
    food: gameLogic.generateFood(gameLogic.createInitialSnake()),
    direction: 'RIGHT' as Direction,
    score: 0,
    status: 'idle' as GameStatus,
    gameMode: 'walls' as GameMode,
    speed: INITIAL_SPEED,
  }));

  const directionRef = useRef<Direction>(gameState.direction);
  const gameLoopRef = useRef<number | null>(null);

  const resetGame = useCallback((mode?: GameMode) => {
    const initialSnake = gameLogic.createInitialSnake();
    setGameState({
      snake: initialSnake,
      food: gameLogic.generateFood(initialSnake),
      direction: 'RIGHT',
      score: 0,
      status: 'idle',
      gameMode: mode || gameState.gameMode,
      speed: INITIAL_SPEED,
    });
    directionRef.current = 'RIGHT';
  }, [gameState.gameMode]);

  const startGame = useCallback(() => {
    setGameState(prev => ({ ...prev, status: 'playing' }));
  }, []);

  const pauseGame = useCallback(() => {
    setGameState(prev => ({ ...prev, status: 'paused' }));
  }, []);

  const resumeGame = useCallback(() => {
    setGameState(prev => ({ ...prev, status: 'playing' }));
  }, []);

  const setDirection = useCallback((newDirection: Direction) => {
    if (!gameLogic.isOppositeDirection(directionRef.current, newDirection)) {
      directionRef.current = newDirection;
    }
  }, []);

  const setGameMode = useCallback((mode: GameMode) => {
    resetGame(mode);
  }, [resetGame]);

  // Game loop
  useEffect(() => {
    if (gameState.status !== 'playing') {
      if (gameLoopRef.current) {
        cancelAnimationFrame(gameLoopRef.current);
        gameLoopRef.current = null;
      }
      return;
    }

    let lastTime = 0;

    const gameLoop = (currentTime: number) => {
      if (currentTime - lastTime >= gameState.speed) {
        lastTime = currentTime;

        setGameState(prev => {
          if (prev.status !== 'playing') return prev;

          const { snake, food, ate, gameOver } = gameLogic.moveSnake(
            prev.snake,
            directionRef.current,
            prev.food,
            prev.gameMode
          );

          if (gameOver) {
            return { ...prev, status: 'game-over' };
          }

          const newScore = ate ? prev.score + 10 : prev.score;
          const newSpeed = gameLogic.calculateSpeed(newScore);

          return {
            ...prev,
            snake,
            food,
            direction: directionRef.current,
            score: newScore,
            speed: newSpeed,
          };
        });
      }

      gameLoopRef.current = requestAnimationFrame(gameLoop);
    };

    gameLoopRef.current = requestAnimationFrame(gameLoop);

    return () => {
      if (gameLoopRef.current) {
        cancelAnimationFrame(gameLoopRef.current);
      }
    };
  }, [gameState.status, gameState.speed]);

  // Keyboard controls
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (gameState.status !== 'playing') return;

      const keyDirections: Record<string, Direction> = {
        ArrowUp: 'UP',
        ArrowDown: 'DOWN',
        ArrowLeft: 'LEFT',
        ArrowRight: 'RIGHT',
        w: 'UP',
        s: 'DOWN',
        a: 'LEFT',
        d: 'RIGHT',
        W: 'UP',
        S: 'DOWN',
        A: 'LEFT',
        D: 'RIGHT',
      };

      const newDirection = keyDirections[e.key];
      if (newDirection) {
        e.preventDefault();
        setDirection(newDirection);
      }

      if (e.key === ' ' || e.key === 'Escape') {
        e.preventDefault();
        pauseGame();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [gameState.status, setDirection, pauseGame]);

  return {
    ...gameState,
    gridSize,
    resetGame,
    startGame,
    pauseGame,
    resumeGame,
    setDirection,
    setGameMode,
  };
}
