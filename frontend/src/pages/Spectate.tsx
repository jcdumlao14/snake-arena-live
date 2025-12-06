import { useState, useEffect } from 'react';
import { ActiveGame } from '@/types';
import { SpectatorCard } from '@/components/SpectatorCard';
import { SpectatorView } from '@/components/SpectatorView';
import api from '@/services/api';
import { Eye, Loader2 } from 'lucide-react';

const Spectate = () => {
  const [games, setGames] = useState<ActiveGame[]>([]);
  const [selectedGameId, setSelectedGameId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setIsLoading(true);
    api.spectate.getActiveGames().then(data => {
      setGames(data);
      setIsLoading(false);
    });
  }, []);

  if (selectedGameId) {
    return (
      <div className="min-h-screen pt-24 pb-12 px-4">
        <div className="container mx-auto">
          <SpectatorView
            gameId={selectedGameId}
            onBack={() => setSelectedGameId(null)}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-24 pb-12 px-4">
      <div className="container mx-auto max-w-4xl">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-neon-pink/20 border border-neon-pink/30 mb-4">
            <Eye className="h-8 w-8 text-neon-pink" />
          </div>
          <h1 className="font-display text-2xl md:text-3xl text-neon-pink text-glow-pink mb-2">
            SPECTATE
          </h1>
          <p className="text-muted-foreground">
            Watch other players in real-time
          </p>
        </div>

        {/* Live games count */}
        <div className="flex justify-center mb-6">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-card border border-border">
            <span className="w-2 h-2 rounded-full bg-destructive animate-pulse" />
            <span className="text-sm">
              <span className="font-medium text-foreground">{games.length}</span>
              <span className="text-muted-foreground"> games live now</span>
            </span>
          </div>
        </div>

        {/* Games grid */}
        {isLoading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-neon-pink" />
          </div>
        ) : games.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground mb-2">No active games right now</p>
            <p className="text-sm text-muted-foreground">
              Check back later or start your own game!
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {games.map(game => (
              <SpectatorCard
                key={game.id}
                game={game}
                onWatch={setSelectedGameId}
              />
            ))}
          </div>
        )}

        {/* Info */}
        <div className="mt-8 text-center text-sm text-muted-foreground">
          <p>Games are simulated for demo purposes.</p>
          <p>In production, these would be real players!</p>
        </div>
      </div>
    </div>
  );
};

export default Spectate;
