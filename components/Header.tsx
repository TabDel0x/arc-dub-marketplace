'use client';

import { ConnectButton } from '@rainbow-me/rainbowkit';
import { Video, Globe, Zap } from 'lucide-react';
import Link from 'next/link';
import { useState, useEffect } from 'react';

export function Header() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <header className="border-b border-surface bg-background/80 backdrop-blur-md sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2 group">
          <div className="bg-primary p-2 rounded-xl group-hover:rotate-12 transition-transform duration-300 shadow-[0_0_15px_rgba(0,245,255,0.3)]">
            <Video className="w-6 h-6 text-background" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-foreground text-glow">
              ArcDub
            </h1>
            <p className="text-[10px] text-primary font-bold tracking-widest uppercase">
              AI Marketplace
            </p>
          </div>
        </Link>

        <nav className="hidden md:flex items-center gap-8 text-sm font-bold text-text-secondary">
          <Link href="#explore" className="hover:text-primary transition-colors">Explore</Link>
          <Link href="#create" className="hover:text-primary transition-colors">Create Job</Link>
          <Link href="#my-jobs" className="hover:text-primary transition-colors">My Jobs</Link>
        </nav>

        <div className="flex items-center gap-4">
          {mounted ? (
            <ConnectButton 
              label="Connect Wallet"
              accountStatus="avatar" 
              chainStatus="icon" 
              showBalance={false}
            />
          ) : (
            <div className="h-10 w-32 bg-card animate-pulse rounded-lg" />
          )}
        </div>
      </div>
    </header>
  );
}
