import { useState, useEffect } from 'react';
import { ActiveGame } from '@/types';
import { GameCanvas } from './GameCanvas';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Users } from 'lucide-react';
import api from '@/services/api';

interface SpectatorViewProps {
  gameId: string;
  onBack: () => void;
}

export function SpectatorView({ gameId, onBack }: SpectatorViewProps) {
  const [game, setGame] = useState<ActiveGame | null>(null);

  useEffect(() => {
    // Initial fetch
    api.spectate.getGameById(gameId).then(setGame);

    // Subscribe to updates
    const unsubscribe = api.spectate.subscribeToGame(gameId, setGame);

    return unsubscribe;
  }, [gameId]);

  if (!game) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-muted-foreground">Loading game...</p>
      </div>
    );
  }

  const getModeStyles = (mode: string) => {
    return mode === 'walls' 
      ? 'bg-primary/20 text-primary border-primary/30'
      : 'bg-neon-blue/20 text-neon-blue border-neon-blue/30';
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <Button variant="ghost" onClick={onBack} className="gap-2">
          <ArrowLeft className="h-4 w-4" />
          Back to Games
        </Button>

        <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-destructive/20 border border-destructive/30">
          <span className="w-2 h-2 rounded-full bg-destructive animate-pulse" />
          <span className="text-sm text-destructive font-medium">LIVE</span>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-8 items-center lg:items-start justify-center">
        <div className="flex-shrink-0">
          <GameCanvas
            snake={game.snake}
            food={game.food}
            gridSize={20}
            cellSize={20}
            isSpectating
          />
        </div>

        <div className="w-full max-w-xs space-y-6">
          {/* Player info */}
          <div className="p-4 rounded-xl bg-card border border-neon-pink/30 box-glow-pink">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-neon-pink/20 flex items-center justify-center">
                <Users className="h-5 w-5 text-neon-pink" />
              </div>
              <div>
                <p className="font-display text-sm text-neon-pink">{game.username}</p>
                <p className="text-xs text-muted-foreground">Playing now</p>
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Score</span>
                <span className="font-display text-2xl text-primary text-glow">{game.score}</span>
              </div>

              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Mode</span>
                <span className={`px-2 py-1 rounded text-xs font-medium border ${getModeStyles(game.gameMode)}`}>
                  {game.gameMode === 'walls' ? 'WALLS' : 'PASS-THROUGH'}
                </span>
              </div>

              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Snake Length</span>
                <span className="font-medium">{game.snake.length}</span>
              </div>
            </div>
          </div>

          <div className="text-center text-sm text-muted-foreground">
            <p>You are spectating this game.</p>
            <p>The snake moves automatically.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
