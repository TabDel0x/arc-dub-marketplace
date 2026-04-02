'use client';

import { Header } from '@/components/Header';
import { Hero } from '@/components/Hero';
import { HowItWorks } from '@/components/HowItWorks';
import { JobForm } from '@/components/JobForm';
import { Marketplace } from '@/components/Marketplace';

export default function Home() {
  return (
    <main className="min-h-screen bg-background text-foreground selection:bg-primary/30">
      <Header />
      <Hero />
      <HowItWorks />
      <div className="max-w-7xl mx-auto px-4 py-20 relative">
        <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-surface to-transparent"></div>
        <JobForm />
        <Marketplace />
      </div>
      
      {/* Footer */}
      <footer className="border-t border-surface bg-background py-12">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <p className="text-sm text-text-muted font-medium">
            Built with ❤️ on <span className="text-primary font-bold">Arc Network</span> for the Global Creator Economy.
          </p>
          <div className="mt-4 flex justify-center gap-6 text-[10px] text-text-muted font-bold">
            <a href="#" className="hover:text-primary transition-colors uppercase tracking-[0.2em] leading-loose">Docs</a>
            <a href="#" className="hover:text-primary transition-colors uppercase tracking-[0.2em] leading-loose">Explorer</a>
            <a href="#" className="hover:text-primary transition-colors uppercase tracking-[0.2em] leading-loose">Support</a>
          </div>
        </div>
      </footer>
    </main>
  );
}
