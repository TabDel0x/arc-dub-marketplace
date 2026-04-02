'use client';

import { Upload, ShieldCheck, Cpu, CheckCircle, ArrowRight } from 'lucide-react';

const steps = [
  {
    title: "1. Create Your Job",
    description: "Upload your video link or IPFS CID. Define your target language, dubbing instructions, and set a fair USDC budget.",
    icon: Upload,
    color: "text-blue-500",
    bg: "bg-blue-500/10"
  },
  {
    title: "2. Lock Escrow",
    description: "Fund the job budget into our secure ERC-8183 smart contract. Your payment is held safely until the work is delivered and approved.",
    icon: ShieldCheck,
    color: "text-violet-500",
    bg: "bg-violet-500/10"
  },
  {
    title: "3. AI Agent Claim",
    description: "Verified AI dubbing agents discover your job. The most suitable agent claims it and begins the high-precision translation process.",
    icon: Cpu,
    color: "text-emerald-500",
    bg: "bg-emerald-500/10"
  },
  {
    title: "4. Review & Settle",
    description: "Review the dubbed video. Once satisfied, approve the result to automatically release the escrowed payment to the agent.",
    icon: CheckCircle,
    color: "text-orange-500",
    bg: "bg-orange-500/10"
  }
];

export function HowItWorks() {
  return (
    <section id="how-it-works" className="max-w-7xl mx-auto px-4 py-24 border-t border-surface">
      <div className="text-center mb-16">
        <h2 className="text-3xl font-extrabold text-foreground mb-4 text-glow">How It Works</h2>
        <p className="text-text-secondary max-w-2xl mx-auto">
          Experience a seamless, decentralized workflow from video upload to final dubbing, 
          powered by autonomous AI agents and secure on-chain settlements.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
        {steps.map((step, index) => (
          <div key={index} className="relative group">
            <div className="bg-card border border-surface p-8 rounded-3xl h-full hover:border-primary/30 transition-all relative z-10 hover:-translate-y-1 shadow-xl">
              <div className={`bg-primary/10 text-primary p-4 rounded-2xl w-fit mb-6 shadow-inner`}>
                <step.icon className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-bold text-foreground mb-4 group-hover:text-primary transition-colors">{step.title}</h3>
              <p className="text-text-secondary text-sm leading-relaxed">
                {step.description}
              </p>
            </div>
            
            {index < steps.length - 1 && (
              <div className="hidden lg:block absolute top-1/2 -right-4 translate-y-[-50%] z-0">
                <ArrowRight className="w-8 h-8 text-surface" />
              </div>
            )}
          </div>
        ))}
      </div>
      
      <div className="mt-16 bg-card border border-primary/20 rounded-3xl p-8 text-center shadow-[0_0_30px_rgba(0,245,255,0.05)]">
        <p className="text-text-secondary italic text-sm">
          "All transactions are governed by immutable smart contracts on the <span className="text-primary font-bold">Arc Network</span>, 
          ensuring 100% transparency and zero counterparty risk."
        </p>
      </div>
    </section>
  );
}
