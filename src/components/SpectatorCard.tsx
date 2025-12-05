import { useState, useEffect } from 'react';
import { ActiveGame } from '@/types';
import { GameCanvas } from './GameCanvas';
import { Button } from '@/components/ui/button';
import { Eye, Users } from 'lucide-react';
import api from '@/services/api';

interface SpectatorCardProps {
  game: ActiveGame;
  onWatch: (gameId: string) => void;
}

export function SpectatorCard({ game: initialGame, onWatch }: SpectatorCardProps) {
  const [game, setGame] = useState(initialGame);

  useEffect(() => {
    const unsubscribe = api.spectate.subscribeToGame(initialGame.id, (updatedGame) => {
      setGame(updatedGame);
    });

    return unsubscribe;
  }, [initialGame.id]);

  const getModeStyles = (mode: string) => {
    return mode === 'walls' 
      ? 'bg-primary/20 text-primary border-primary/30'
      : 'bg-neon-blue/20 text-neon-blue border-neon-blue/30';
  };

  return (
    <div className="group relative rounded-xl bg-card border border-border p-4 hover:border-neon-pink/50 transition-all duration-300">
      {/* Live indicator */}
      <div className="absolute top-3 right-3 flex items-center gap-1.5 px-2 py-1 rounded-full bg-destructive/20 border border-destructive/30">
        <span className="w-2 h-2 rounded-full bg-destructive animate-pulse" />
        <span className="text-xs text-destructive font-medium">LIVE</span>
      </div>

      {/* Mini game preview */}
      <div className="flex justify-center mb-4">
        <div className="transform scale-50 origin-top">
          <GameCanvas
            snake={game.snake}
            food={game.food}
            gridSize={20}
            cellSize={15}
            isSpectating
          />
        </div>
      </div>

      {/* Player info */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Users className="h-4 w-4 text-neon-pink" />
            <span className="font-medium">{game.username}</span>
          </div>
          <span className={`px-2 py-0.5 rounded text-xs font-medium border ${getModeStyles(game.gameMode)}`}>
            {game.gameMode === 'walls' ? 'WALLS' : 'PASS'}
          </span>
        </div>

        <div className="flex items-center justify-between">
          <span className="text-sm text-muted-foreground">Score</span>
          <span className="font-display text-lg text-primary">{game.score}</span>
        </div>

        <Button
          variant="neonPink"
          className="w-full gap-2"
          onClick={() => onWatch(game.id)}
        >
          <Eye className="h-4 w-4" />
          WATCH
        </Button>
      </div>
    </div>
  );
}
