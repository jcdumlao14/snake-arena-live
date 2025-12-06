import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function AuthModal({ isOpen, onClose }: AuthModalProps) {
  const [mode, setMode] = useState<'login' | 'signup'>('login');
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    username: '',
  });
  const { login, signup } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      if (mode === 'login') {
        await login({ email: formData.email, password: formData.password });
        toast.success('Welcome back!');
      } else {
        await signup(formData);
        toast.success('Account created successfully!');
      }
      onClose();
      setFormData({ email: '', password: '', username: '' });
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Authentication failed');
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md border-primary/30 bg-card">
        <DialogHeader>
          <DialogTitle className="font-display text-lg text-center text-primary text-glow">
            {mode === 'login' ? 'SIGN IN' : 'CREATE ACCOUNT'}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {mode === 'signup' && (
            <div className="space-y-2">
              <Label htmlFor="username" className="text-sm">
                Username
              </Label>
              <Input
                id="username"
                name="username"
                placeholder="Enter your username"
                value={formData.username}
                onChange={handleInputChange}
                required
                className="bg-muted border-border focus:border-primary focus:ring-primary"
              />
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="email" className="text-sm">
              Email
            </Label>
            <Input
              id="email"
              name="email"
              type="email"
              placeholder="Enter your email"
              value={formData.email}
              onChange={handleInputChange}
              required
              className="bg-muted border-border focus:border-primary focus:ring-primary"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="password" className="text-sm">
              Password
            </Label>
            <Input
              id="password"
              name="password"
              type="password"
              placeholder="Enter your password"
              value={formData.password}
              onChange={handleInputChange}
              required
              className="bg-muted border-border focus:border-primary focus:ring-primary"
            />
          </div>

          <Button
            type="submit"
            variant="neon"
            className="w-full"
            disabled={isLoading}
          >
            {isLoading ? 'Loading...' : mode === 'login' ? 'SIGN IN' : 'CREATE ACCOUNT'}
          </Button>
        </form>

        <div className="text-center">
          <button
            type="button"
            onClick={() => setMode(mode === 'login' ? 'signup' : 'login')}
            className="text-sm text-muted-foreground hover:text-primary transition-colors"
          >
            {mode === 'login'
              ? "Don't have an account? Sign up"
              : 'Already have an account? Sign in'}
          </button>
        </div>

        {/* Demo credentials hint */}
        <div className="text-center p-3 rounded-md bg-muted/50 border border-border">
          <p className="text-xs text-muted-foreground">
            Demo: Use <span className="text-primary">pixel@game.com</span> to login
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}
