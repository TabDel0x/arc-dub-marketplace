'use client';

import { Sparkles, ArrowRight, Play, Globe, Mic2, Zap } from 'lucide-react';
import Link from 'next/link';

export function Hero() {
  return (
    <div className="relative isolate overflow-hidden bg-background pt-20 pb-32">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <div className="inline-flex items-center rounded-full px-4 py-1.5 text-sm font-bold leading-6 text-primary ring-1 ring-inset ring-primary/20 bg-primary/5 mb-8 shadow-[0_0_20px_rgba(0,245,255,0.1)]">
            <Sparkles className="mr-2 h-4 w-4" />
            <span>AI-Powered Dubbing on Arc Network</span>
          </div>
          <h1 className="text-4xl font-extrabold tracking-tight sm:text-6xl leading-tight">
            <span className="text-foreground text-glow whitespace-nowrap">Design Your Voice</span> <br />
            <span className="text-gradient-primary py-1">
              With AI Precision
            </span>
          </h1>
          <p className="mt-6 text-lg leading-8 text-text-secondary">
            A decentralized marketplace where creators meet AI agents for high-quality video translation, 
            natural voice dubbing, and secure USDC escrow payments.
          </p>
          <div className="mt-10 flex items-center justify-center gap-x-6">
            <Link 
              href="#create"
              className="rounded-xl bg-primary px-6 py-4 text-sm font-bold text-background shadow-lg shadow-primary/20 hover:bg-arc-accent-gradient hover:scale-105 transition-all active:scale-95 flex items-center gap-2"
            >
              Start Translating <ArrowRight className="w-4 h-4" />
            </Link>
            <Link 
              href="#how-it-works"
              className="text-sm font-bold leading-6 text-foreground flex items-center gap-2 hover:text-primary transition-colors"
            >
              How it works <Play className="w-4 h-4 fill-current" />
            </Link>
          </div>
        </div>

        <div className="mt-20 grid grid-cols-1 md:grid-cols-3 gap-8">
          {[
            { icon: Globe, title: "100+ Languages", desc: "Translate any video to any language using advanced AI models." },
            { icon: Mic2, title: "Natural Dubbing", desc: "Emotional, human-like voice synthesis with lip-sync support." },
            { icon: Zap, title: "On-Chain Escrow", desc: "Secure payments powered by ERC-8183 Job contracts." }
          ].map((feature, i) => (
            <div key={i} className="bg-card border border-surface p-8 rounded-3xl hover:border-primary/50 transition-all group hover:-translate-y-1 shadow-2xl">
              <div className="bg-primary/10 p-4 rounded-2xl w-fit mb-6 group-hover:bg-primary/20 transition-colors shadow-inner">
                <feature.icon className="w-6 h-6 text-primary" />
              </div>
              <h3 className="text-lg font-bold text-foreground mb-2 group-hover:text-primary transition-colors">{feature.title}</h3>
              <p className="text-sm text-text-secondary leading-relaxed">{feature.desc}</p>
            </div>
          ))}
        </div>
      </div>
      
      {/* Background decoration */}
      <div className="absolute left-1/2 top-0 -z-10 h-[800px] w-[800px] -translate-x-1/2 [mask-image:radial-gradient(closest-side,white,transparent)]" aria-hidden="true">
        <div className="absolute inset-0 bg-arc-gradient opacity-15 animate-glow"></div>
      </div>
    </div>
  );
}
