import { LeaderboardEntry, GameMode } from '@/types';
import { Trophy, Medal } from 'lucide-react';

interface LeaderboardTableProps {
  entries: LeaderboardEntry[];
  filter?: GameMode | 'all';
}

export function LeaderboardTable({ entries, filter = 'all' }: LeaderboardTableProps) {
  const filteredEntries = filter === 'all' 
    ? entries 
    : entries.filter(e => e.gameMode === filter);

  const getRankIcon = (rank: number) => {
    if (rank === 1) return <Trophy className="h-5 w-5 text-yellow-400" />;
    if (rank === 2) return <Medal className="h-5 w-5 text-gray-300" />;
    if (rank === 3) return <Medal className="h-5 w-5 text-amber-600" />;
    return <span className="text-muted-foreground w-5 text-center">{rank}</span>;
  };

  const getModeStyles = (mode: GameMode) => {
    return mode === 'walls' 
      ? 'bg-primary/20 text-primary border-primary/30'
      : 'bg-neon-blue/20 text-neon-blue border-neon-blue/30';
  };

  return (
    <div className="space-y-2">
      {filteredEntries.length === 0 ? (
        <div className="text-center py-8 text-muted-foreground">
          No entries yet. Be the first to play!
        </div>
      ) : (
        filteredEntries.map((entry, index) => (
          <div
            key={entry.id}
            className={`flex items-center gap-4 p-4 rounded-lg bg-card border border-border hover:border-primary/30 transition-all duration-200 ${
              index < 3 ? 'animate-slide-in' : ''
            }`}
            style={{ animationDelay: `${index * 50}ms` }}
          >
            <div className="flex items-center justify-center w-8">
              {getRankIcon(entry.rank)}
            </div>
            
            <div className="flex-1 min-w-0">
              <p className="font-medium truncate">{entry.username}</p>
              <p className="text-xs text-muted-foreground">{entry.date}</p>
            </div>

            <span className={`px-2 py-1 rounded text-xs font-medium border ${getModeStyles(entry.gameMode)}`}>
              {entry.gameMode === 'walls' ? 'WALLS' : 'PASS'}
            </span>

            <div className="text-right">
              <p className="font-display text-lg text-primary">{entry.score.toLocaleString()}</p>
            </div>
          </div>
        ))
      )}
    </div>
  );
}
