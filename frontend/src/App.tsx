import { useState } from 'react';
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from '@/contexts/AuthContext';
import { Header } from '@/components/Header';
import { AuthModal } from '@/components/AuthModal';
import Index from "./pages/Index";
import Leaderboard from "./pages/Leaderboard";
import Spectate from "./pages/Spectate";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => {
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Header onLoginClick={() => setIsAuthModalOpen(true)} />
            <AuthModal
              isOpen={isAuthModalOpen}
              onClose={() => setIsAuthModalOpen(false)}
            />
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/leaderboard" element={<Leaderboard />} />
              <Route path="/spectate" element={<Spectate />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </TooltipProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
};

export default App;
