import { useRef, useEffect } from 'react';
import { Position } from '@/types';

interface GameCanvasProps {
  snake: Position[];
  food: Position;
  gridSize: number;
  cellSize?: number;
  isSpectating?: boolean;
}

export function GameCanvas({
  snake,
  food,
  gridSize,
  cellSize = 20,
  isSpectating = false,
}: GameCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const canvasSize = gridSize * cellSize;

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Clear canvas
    ctx.fillStyle = '#0a0f14';
    ctx.fillRect(0, 0, canvasSize, canvasSize);

    // Draw grid
    ctx.strokeStyle = 'rgba(34, 197, 94, 0.1)';
    ctx.lineWidth = 0.5;
    for (let i = 0; i <= gridSize; i++) {
      ctx.beginPath();
      ctx.moveTo(i * cellSize, 0);
      ctx.lineTo(i * cellSize, canvasSize);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(0, i * cellSize);
      ctx.lineTo(canvasSize, i * cellSize);
      ctx.stroke();
    }

    // Draw food
    const foodX = food.x * cellSize + cellSize / 2;
    const foodY = food.y * cellSize + cellSize / 2;
    const foodRadius = cellSize / 2 - 2;

    ctx.fillStyle = '#facc15';
    ctx.beginPath();
    ctx.arc(foodX, foodY, foodRadius, 0, Math.PI * 2);
    ctx.fill();

    // Draw snake
    snake.forEach((segment, index) => {
      const x = segment.x * cellSize;
      const y = segment.y * cellSize;
      const isHead = index === 0;

      // Calculate color gradient for body
      const intensity = 1 - (index / snake.length) * 0.5;
      const green = Math.floor(197 * intensity);
      ctx.fillStyle = isHead ? '#22c55e' : `rgb(34, ${green}, 94)`;

      // Rounded rectangle for segment
      const padding = 1;
      const radius = 4;
      ctx.beginPath();
      ctx.roundRect(x + padding, y + padding, cellSize - padding * 2, cellSize - padding * 2, radius);
      ctx.fill();

      // Eyes on head
      if (isHead) {
        ctx.fillStyle = '#0a0f14';
        const eyeSize = 3;
        ctx.beginPath();
        ctx.arc(x + cellSize * 0.65, y + cellSize * 0.35, eyeSize, 0, Math.PI * 2);
        ctx.arc(x + cellSize * 0.65, y + cellSize * 0.65, eyeSize, 0, Math.PI * 2);
        ctx.fill();
      }
    });

    // Border
    ctx.strokeStyle = isSpectating ? 'rgba(236, 72, 153, 0.5)' : 'rgba(34, 197, 94, 0.5)';
    ctx.lineWidth = 2;
    ctx.strokeRect(1, 1, canvasSize - 2, canvasSize - 2);
  }, [snake, food, gridSize, cellSize, canvasSize, isSpectating]);

  return (
    <canvas
      ref={canvasRef}
      width={canvasSize}
      height={canvasSize}
      className="rounded-lg"
      style={{
        boxShadow: isSpectating
          ? '0 0 20px rgba(236, 72, 153, 0.2)'
          : '0 0 20px rgba(34, 197, 94, 0.2)',
      }}
    />
  );
}