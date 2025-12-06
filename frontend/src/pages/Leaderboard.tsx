import { useState, useEffect } from 'react';
import { LeaderboardEntry, GameMode } from '@/types';
import { LeaderboardTable } from '@/components/LeaderboardTable';
import { Button } from '@/components/ui/button';
import api from '@/services/api';
import { Trophy, Loader2 } from 'lucide-react';

const Leaderboard = () => {
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  const [filter, setFilter] = useState<'all' | GameMode>('all');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setIsLoading(true);
    api.leaderboard.getAll().then(data => {
      setEntries(data);
      setIsLoading(false);
    });
  }, []);

  return (
    <div className="min-h-screen pt-24 pb-12 px-4">
      <div className="container mx-auto max-w-2xl">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/20 border border-primary/30 mb-4">
            <Trophy className="h-8 w-8 text-primary" />
          </div>
          <h1 className="font-display text-2xl md:text-3xl text-primary text-glow mb-2">
            LEADERBOARD
          </h1>
          <p className="text-muted-foreground">
            Top snake masters ranked by score
          </p>
        </div>

        {/* Filter buttons */}
        <div className="flex justify-center gap-2 mb-6">
          <Button
            variant={filter === 'all' ? 'neonPink' : 'outline'}
            size="sm"
            onClick={() => setFilter('all')}
          >
            ALL
          </Button>
          <Button
            variant={filter === 'walls' ? 'neon' : 'outline'}
            size="sm"
            onClick={() => setFilter('walls')}
          >
            WALLS
          </Button>
          <Button
            variant={filter === 'pass-through' ? 'neonBlue' : 'outline'}
            size="sm"
            onClick={() => setFilter('pass-through')}
          >
            PASS-THROUGH
          </Button>
        </div>

        {/* Leaderboard */}
        {isLoading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : (
          <LeaderboardTable entries={entries} filter={filter} />
        )}

        {/* Stats */}
        <div className="mt-8 grid grid-cols-3 gap-4 text-center">
          <div className="p-4 rounded-lg bg-card border border-border">
            <p className="font-display text-xl text-primary">{entries.length}</p>
            <p className="text-xs text-muted-foreground">Total Entries</p>
          </div>
          <div className="p-4 rounded-lg bg-card border border-border">
            <p className="font-display text-xl text-primary">
              {entries[0]?.score.toLocaleString() || 0}
            </p>
            <p className="text-xs text-muted-foreground">High Score</p>
          </div>
          <div className="p-4 rounded-lg bg-card border border-border">
            <p className="font-display text-xl text-primary">
              {entries[0]?.username || '-'}
            </p>
            <p className="text-xs text-muted-foreground">#1 Player</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Leaderboard;
