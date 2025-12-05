import { describe, it, expect } from 'vitest';
import { gameLogic } from './useSnakeGame';
import { Position, Direction } from '@/types';

describe('gameLogic', () => {
  describe('createInitialSnake', () => {
    it('creates a snake with 3 segments', () => {
      const snake = gameLogic.createInitialSnake();
      expect(snake).toHaveLength(3);
    });

    it('creates snake at correct starting position', () => {
      const snake = gameLogic.createInitialSnake();
      expect(snake[0]).toEqual({ x: 10, y: 10 });
    });

    it('creates snake segments in a row', () => {
      const snake = gameLogic.createInitialSnake();
      expect(snake[1].x).toBe(snake[0].x - 1);
      expect(snake[2].x).toBe(snake[1].x - 1);
    });
  });

  describe('generateFood', () => {
    it('generates food within grid bounds', () => {
      const snake = [{ x: 5, y: 5 }];
      const food = gameLogic.generateFood(snake);
      expect(food.x).toBeGreaterThanOrEqual(0);
      expect(food.x).toBeLessThan(20);
      expect(food.y).toBeGreaterThanOrEqual(0);
      expect(food.y).toBeLessThan(20);
    });

    it('does not generate food on snake position', () => {
      const snake = [{ x: 5, y: 5 }, { x: 4, y: 5 }, { x: 3, y: 5 }];
      for (let i = 0; i < 100; i++) {
        const food = gameLogic.generateFood(snake);
        const onSnake = snake.some(s => s.x === food.x && s.y === food.y);
        expect(onSnake).toBe(false);
      }
    });
  });

  describe('getNextHead', () => {
    const head: Position = { x: 10, y: 10 };

    it('moves up correctly', () => {
      expect(gameLogic.getNextHead(head, 'UP')).toEqual({ x: 10, y: 9 });
    });

    it('moves down correctly', () => {
      expect(gameLogic.getNextHead(head, 'DOWN')).toEqual({ x: 10, y: 11 });
    });

    it('moves left correctly', () => {
      expect(gameLogic.getNextHead(head, 'LEFT')).toEqual({ x: 9, y: 10 });
    });

    it('moves right correctly', () => {
      expect(gameLogic.getNextHead(head, 'RIGHT')).toEqual({ x: 11, y: 10 });
    });
  });

  describe('wrapPosition', () => {
    it('wraps negative x to max', () => {
      expect(gameLogic.wrapPosition({ x: -1, y: 5 })).toEqual({ x: 19, y: 5 });
    });

    it('wraps x beyond max to 0', () => {
      expect(gameLogic.wrapPosition({ x: 20, y: 5 })).toEqual({ x: 0, y: 5 });
    });

    it('wraps negative y to max', () => {
      expect(gameLogic.wrapPosition({ x: 5, y: -1 })).toEqual({ x: 5, y: 19 });
    });

    it('wraps y beyond max to 0', () => {
      expect(gameLogic.wrapPosition({ x: 5, y: 20 })).toEqual({ x: 5, y: 0 });
    });

    it('does not change valid position', () => {
      expect(gameLogic.wrapPosition({ x: 10, y: 10 })).toEqual({ x: 10, y: 10 });
    });
  });

  describe('isOutOfBounds', () => {
    it('returns true for negative x', () => {
      expect(gameLogic.isOutOfBounds({ x: -1, y: 5 })).toBe(true);
    });

    it('returns true for x beyond grid', () => {
      expect(gameLogic.isOutOfBounds({ x: 20, y: 5 })).toBe(true);
    });

    it('returns true for negative y', () => {
      expect(gameLogic.isOutOfBounds({ x: 5, y: -1 })).toBe(true);
    });

    it('returns true for y beyond grid', () => {
      expect(gameLogic.isOutOfBounds({ x: 5, y: 20 })).toBe(true);
    });

    it('returns false for valid position', () => {
      expect(gameLogic.isOutOfBounds({ x: 10, y: 10 })).toBe(false);
    });

    it('returns false for edge positions', () => {
      expect(gameLogic.isOutOfBounds({ x: 0, y: 0 })).toBe(false);
      expect(gameLogic.isOutOfBounds({ x: 19, y: 19 })).toBe(false);
    });
  });

  describe('checkSelfCollision', () => {
    it('returns true when head collides with body', () => {
      const head = { x: 5, y: 5 };
      const body = [{ x: 4, y: 5 }, { x: 5, y: 5 }, { x: 6, y: 5 }];
      expect(gameLogic.checkSelfCollision(head, body)).toBe(true);
    });

    it('returns false when no collision', () => {
      const head = { x: 5, y: 5 };
      const body = [{ x: 4, y: 5 }, { x: 3, y: 5 }, { x: 2, y: 5 }];
      expect(gameLogic.checkSelfCollision(head, body)).toBe(false);
    });
  });

  describe('isOppositeDirection', () => {
    it('UP is opposite to DOWN', () => {
      expect(gameLogic.isOppositeDirection('UP', 'DOWN')).toBe(true);
    });

    it('DOWN is opposite to UP', () => {
      expect(gameLogic.isOppositeDirection('DOWN', 'UP')).toBe(true);
    });

    it('LEFT is opposite to RIGHT', () => {
      expect(gameLogic.isOppositeDirection('LEFT', 'RIGHT')).toBe(true);
    });

    it('RIGHT is opposite to LEFT', () => {
      expect(gameLogic.isOppositeDirection('RIGHT', 'LEFT')).toBe(true);
    });

    it('UP is not opposite to LEFT', () => {
      expect(gameLogic.isOppositeDirection('UP', 'LEFT')).toBe(false);
    });

    it('same direction is not opposite', () => {
      expect(gameLogic.isOppositeDirection('UP', 'UP')).toBe(false);
    });
  });

  describe('moveSnake', () => {
    describe('walls mode', () => {
      it('moves snake in direction', () => {
        const snake = [{ x: 10, y: 10 }, { x: 9, y: 10 }];
        const food = { x: 5, y: 5 };
        const result = gameLogic.moveSnake(snake, 'RIGHT', food, 'walls');
        
        expect(result.gameOver).toBe(false);
        expect(result.snake[0]).toEqual({ x: 11, y: 10 });
        expect(result.snake).toHaveLength(2);
      });

      it('game over when hitting wall', () => {
        const snake = [{ x: 19, y: 10 }, { x: 18, y: 10 }];
        const food = { x: 5, y: 5 };
        const result = gameLogic.moveSnake(snake, 'RIGHT', food, 'walls');
        
        expect(result.gameOver).toBe(true);
      });

      it('game over when hitting top wall', () => {
        const snake = [{ x: 10, y: 0 }, { x: 10, y: 1 }];
        const food = { x: 5, y: 5 };
        const result = gameLogic.moveSnake(snake, 'UP', food, 'walls');
        
        expect(result.gameOver).toBe(true);
      });

      it('snake grows when eating food', () => {
        const snake = [{ x: 10, y: 10 }, { x: 9, y: 10 }];
        const food = { x: 11, y: 10 };
        const result = gameLogic.moveSnake(snake, 'RIGHT', food, 'walls');
        
        expect(result.ate).toBe(true);
        expect(result.snake).toHaveLength(3);
        expect(result.food).not.toEqual(food);
      });
    });

    describe('pass-through mode', () => {
      it('wraps around right wall', () => {
        const snake = [{ x: 19, y: 10 }, { x: 18, y: 10 }];
        const food = { x: 5, y: 5 };
        const result = gameLogic.moveSnake(snake, 'RIGHT', food, 'pass-through');
        
        expect(result.gameOver).toBe(false);
        expect(result.snake[0]).toEqual({ x: 0, y: 10 });
      });

      it('wraps around left wall', () => {
        const snake = [{ x: 0, y: 10 }, { x: 1, y: 10 }];
        const food = { x: 5, y: 5 };
        const result = gameLogic.moveSnake(snake, 'LEFT', food, 'pass-through');
        
        expect(result.gameOver).toBe(false);
        expect(result.snake[0]).toEqual({ x: 19, y: 10 });
      });

      it('wraps around top wall', () => {
        const snake = [{ x: 10, y: 0 }, { x: 10, y: 1 }];
        const food = { x: 5, y: 5 };
        const result = gameLogic.moveSnake(snake, 'UP', food, 'pass-through');
        
        expect(result.gameOver).toBe(false);
        expect(result.snake[0]).toEqual({ x: 10, y: 19 });
      });

      it('wraps around bottom wall', () => {
        const snake = [{ x: 10, y: 19 }, { x: 10, y: 18 }];
        const food = { x: 5, y: 5 };
        const result = gameLogic.moveSnake(snake, 'DOWN', food, 'pass-through');
        
        expect(result.gameOver).toBe(false);
        expect(result.snake[0]).toEqual({ x: 10, y: 0 });
      });
    });

    describe('self collision', () => {
      it('game over when snake hits itself', () => {
        const snake = [
          { x: 10, y: 10 },
          { x: 11, y: 10 },
          { x: 11, y: 11 },
          { x: 10, y: 11 },
          { x: 9, y: 11 },
        ];
        const food = { x: 5, y: 5 };
        const result = gameLogic.moveSnake(snake, 'DOWN', food, 'walls');
        
        expect(result.gameOver).toBe(true);
      });
    });
  });

  describe('calculateSpeed', () => {
    it('returns initial speed for score 0', () => {
      expect(gameLogic.calculateSpeed(0)).toBe(150);
    });

    it('decreases speed as score increases', () => {
      expect(gameLogic.calculateSpeed(50)).toBe(145);
      expect(gameLogic.calculateSpeed(100)).toBe(140);
    });

    it('never goes below minimum speed', () => {
      expect(gameLogic.calculateSpeed(10000)).toBe(50);
    });
  });
});
