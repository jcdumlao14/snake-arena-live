import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { User, Trophy, Eye, Gamepad2, LogOut } from 'lucide-react';

interface HeaderProps {
  onLoginClick: () => void;
}

export function Header({ onLoginClick }: HeaderProps) {
  const { user, logout } = useAuth();
  const location = useLocation();

  const navItems = [
    { path: '/', label: 'Play', icon: Gamepad2 },
    { path: '/leaderboard', label: 'Leaderboard', icon: Trophy },
    { path: '/spectate', label: 'Spectate', icon: Eye },
  ];

  return (
    <header className="fixed top-0 left-0 right-0 z-50 border-b border-border bg-background/80 backdrop-blur-md">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          <Link to="/" className="flex items-center gap-3">
            <div className="relative">
              <div className="h-8 w-8 rounded bg-primary animate-pulse-glow" />
              <div className="absolute inset-0 h-8 w-8 rounded bg-primary/50 blur-sm" />
            </div>
            <span className="font-display text-sm text-primary text-glow">
              NEON SNAKE
            </span>
          </Link>

          <nav className="hidden md:flex items-center gap-1">
            {navItems.map(({ path, label, icon: Icon }) => (
              <Link key={path} to={path}>
                <Button
                  variant={location.pathname === path ? 'neon' : 'ghost'}
                  size="sm"
                  className="gap-2"
                >
                  <Icon className="h-4 w-4" />
                  <span className="hidden lg:inline">{label}</span>
                </Button>
              </Link>
            ))}
          </nav>

          <div className="flex items-center gap-3">
            {user ? (
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2 px-3 py-1.5 rounded-md bg-muted border border-border">
                  <User className="h-4 w-4 text-primary" />
                  <span className="text-sm font-medium">{user.username}</span>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={logout}
                  title="Logout"
                >
                  <LogOut className="h-4 w-4" />
                </Button>
              </div>
            ) : (
              <Button variant="neonPink" size="sm" onClick={onLoginClick}>
                <User className="h-4 w-4" />
                Sign In
              </Button>
            )}
          </div>
        </div>

        {/* Mobile navigation */}
        <nav className="flex md:hidden items-center justify-center gap-1 pb-3">
          {navItems.map(({ path, label, icon: Icon }) => (
            <Link key={path} to={path}>
              <Button
                variant={location.pathname === path ? 'neon' : 'ghost'}
                size="sm"
                className="gap-2"
              >
                <Icon className="h-4 w-4" />
                {label}
              </Button>
            </Link>
          ))}
        </nav>
      </div>
    </header>
  );
}
