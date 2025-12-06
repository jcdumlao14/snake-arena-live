import { useSnakeGame } from '@/hooks/useSnakeGame';
import { GameCanvas } from '@/components/GameCanvas';
import { GameControls } from '@/components/GameControls';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import api from '@/services/api';
import { useEffect } from 'react';

const Index = () => {
  const {
    snake,
    food,
    direction,
    score,
    status,
    gameMode,
    gridSize,
    startGame,
    pauseGame,
    resumeGame,
    resetGame,
    setDirection,
    setGameMode,
  } = useSnakeGame();

  const { user } = useAuth();

  // Submit score when game ends
  useEffect(() => {
    if (status === 'game-over' && score > 0 && user) {
      api.leaderboard.submitScore(score, gameMode).then(() => {
        toast.success('Score submitted to leaderboard!');
      }).catch(() => {
        // Silent fail for demo
      });
    }
  }, [status, score, gameMode, user]);

  return (
    <div className="min-h-screen pt-24 pb-12 px-4">
      <div className="container mx-auto">
        {/* Title */}
        <div className="text-center mb-8">
          <h1 className="font-display text-2xl md:text-4xl text-primary text-glow mb-2">
            NEON SNAKE
          </h1>
          <p className="text-muted-foreground">
            Classic arcade action with a modern twist
          </p>
        </div>

        {/* Game area */}
        <div className="flex flex-col lg:flex-row gap-8 items-center lg:items-start justify-center">
          {/* Canvas */}
          <div className="flex-shrink-0">
            <GameCanvas
              snake={snake}
              food={food}
              gridSize={gridSize}
              cellSize={20}
            />
          </div>

          {/* Controls panel */}
          <div className="w-full max-w-xs p-6 rounded-xl bg-card border border-border">
            <GameControls
              status={status}
              gameMode={gameMode}
              score={score}
              onStart={startGame}
              onPause={pauseGame}
              onResume={resumeGame}
              onReset={() => resetGame()}
              onDirectionChange={setDirection}
              onModeChange={setGameMode}
            />
          </div>
        </div>

        {/* Mode description */}
        <div className="mt-8 text-center max-w-lg mx-auto">
          <p className="text-sm text-muted-foreground">
            {gameMode === 'walls' ? (
              <>
                <span className="text-primary font-medium">Walls Mode:</span> Hit a wall and it's game over!
              </>
            ) : (
              <>
                <span className="text-neon-blue font-medium">Pass-Through Mode:</span> Walls wrap around - exit one side, enter the other!
              </>
            )}
          </p>
        </div>

        {/* Login prompt for score saving */}
        {!user && (
          <div className="mt-6 text-center">
            <p className="text-sm text-muted-foreground">
              Sign in to save your scores to the leaderboard!
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Index;
