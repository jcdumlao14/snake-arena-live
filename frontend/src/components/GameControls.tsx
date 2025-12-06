import { Button } from '@/components/ui/button';
import { Direction, GameMode, GameStatus } from '@/types';
import { Play, Pause, RotateCcw, ArrowUp, ArrowDown, ArrowLeft, ArrowRight } from 'lucide-react';

interface GameControlsProps {
  status: GameStatus;
  gameMode: GameMode;
  score: number;
  onStart: () => void;
  onPause: () => void;
  onResume: () => void;
  onReset: () => void;
  onDirectionChange: (direction: Direction) => void;
  onModeChange: (mode: GameMode) => void;
}

export function GameControls({
  status,
  gameMode,
  score,
  onStart,
  onPause,
  onResume,
  onReset,
  onDirectionChange,
  onModeChange,
}: GameControlsProps) {
  return (
    <div className="flex flex-col gap-6">
      {/* Score display */}
      <div className="text-center">
        <p className="text-sm text-muted-foreground mb-1">SCORE</p>
        <p className="font-display text-3xl text-primary text-glow">{score}</p>
      </div>

      {/* Game mode selector */}
      <div className="space-y-2">
        <p className="text-xs text-muted-foreground text-center">GAME MODE</p>
        <div className="flex gap-2">
          <Button
            variant={gameMode === 'walls' ? 'neon' : 'outline'}
            size="sm"
            className="flex-1 text-xs"
            onClick={() => onModeChange('walls')}
            disabled={status === 'playing'}
          >
            WALLS
          </Button>
          <Button
            variant={gameMode === 'pass-through' ? 'neonBlue' : 'outline'}
            size="sm"
            className="flex-1 text-xs"
            onClick={() => onModeChange('pass-through')}
            disabled={status === 'playing'}
          >
            PASS-THROUGH
          </Button>
        </div>
      </div>

      {/* Game controls */}
      <div className="flex justify-center gap-2">
        {status === 'idle' || status === 'game-over' ? (
          <Button variant="neon" size="lg" onClick={onStart} className="gap-2">
            <Play className="h-5 w-5" />
            {status === 'game-over' ? 'PLAY AGAIN' : 'START'}
          </Button>
        ) : status === 'playing' ? (
          <Button variant="neonPink" size="lg" onClick={onPause} className="gap-2">
            <Pause className="h-5 w-5" />
            PAUSE
          </Button>
        ) : (
          <Button variant="neon" size="lg" onClick={onResume} className="gap-2">
            <Play className="h-5 w-5" />
            RESUME
          </Button>
        )}
        <Button variant="outline" size="lg" onClick={onReset}>
          <RotateCcw className="h-5 w-5" />
        </Button>
      </div>

      {/* Mobile direction controls */}
      <div className="md:hidden space-y-2">
        <p className="text-xs text-muted-foreground text-center">CONTROLS</p>
        <div className="grid grid-cols-3 gap-2 w-32 mx-auto">
          <div />
          <Button
            variant="outline"
            size="icon"
            onClick={() => onDirectionChange('UP')}
            disabled={status !== 'playing'}
          >
            <ArrowUp className="h-5 w-5" />
          </Button>
          <div />
          <Button
            variant="outline"
            size="icon"
            onClick={() => onDirectionChange('LEFT')}
            disabled={status !== 'playing'}
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            onClick={() => onDirectionChange('DOWN')}
            disabled={status !== 'playing'}
          >
            <ArrowDown className="h-5 w-5" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            onClick={() => onDirectionChange('RIGHT')}
            disabled={status !== 'playing'}
          >
            <ArrowRight className="h-5 w-5" />
          </Button>
        </div>
      </div>

      {/* Keyboard hints */}
      <div className="hidden md:block text-center text-xs text-muted-foreground space-y-1">
        <p>Use Arrow Keys or WASD to move</p>
        <p>Press Space to pause</p>
      </div>

      {/* Game over message */}
      {status === 'game-over' && (
        <div className="text-center p-4 rounded-lg bg-destructive/20 border border-destructive/50 animate-slide-in">
          <p className="font-display text-sm text-destructive">GAME OVER</p>
          <p className="text-sm text-muted-foreground mt-1">
            Final Score: {score}
          </p>
        </div>
      )}
    </div>
  );
}
