'use client';

import { useState } from 'react';
import { useWriteContract, useAccount, useReadContract, useWaitForTransactionReceipt } from 'wagmi';
import { JOB_CONTRACT_ADDRESS, USDC_ADDRESS } from '@/lib/wagmi';
import { JOB_CONTRACT_ABI, ERC20_ABI } from '@/lib/abi';
import { Upload, Link as LinkIcon, AlertCircle, Loader2, Lock, ShieldCheck } from 'lucide-react';
import { useEffect } from 'react';

export function JobForm() {
  const { isConnected, address } = useAccount();
  const [videoUrl, setVideoUrl] = useState('');
  const [description, setDescription] = useState('');
  const [sourceLang, setSourceLang] = useState('English');
  const [targetLang, setTargetLang] = useState('Spanish');
  const [budget, setBudget] = useState('10'); // Default 10 USDC
  const [expiryDays, setExpiryDays] = useState('7'); // Default 7 days
  const [urlError, setUrlError] = useState('');

  const YOUTUBE_REGEX = /^(https?:\/\/)?(www\.)?(youtube\.com|youtu\.?be)\/.+$/;

  const languages = [
    'Turkish', 'English', 'Spanish', 'French', 'German', 
    'Japanese', 'Korean', 'Chinese', 'Arabic', 'Russian'
  ];

  const budgetInUnits = BigInt(parseFloat(budget || '0') * 1_000_000); // 6 decimals for USDC
  const expiryTimestamp = BigInt(Math.floor(Date.now() / 1000) + (parseInt(expiryDays || '0') * 86400));

  const { data: allowance, refetch: refetchAllowance } = useReadContract({
    address: USDC_ADDRESS as `0x${string}`,
    abi: ERC20_ABI,
    functionName: 'allowance',
    args: [address as `0x${string}`, JOB_CONTRACT_ADDRESS as `0x${string}`],
  });

  const { writeContract, data: hash, isPending, isSuccess, error } = useWriteContract();
  
  const { isLoading: isWaitingForTx, isSuccess: isTxSuccess } = useWaitForTransactionReceipt({
    hash,
  });

  const needsApproval = allowance !== undefined && budgetInUnits > (allowance as bigint);

  // Auto-scroll to marketplace after transaction success
  useEffect(() => {
    if (isTxSuccess && !needsApproval) {
      setTimeout(() => {
        const explorer = document.getElementById('explore');
        if (explorer) {
          explorer.scrollIntoView({ behavior: 'smooth' });
        }
      }, 1500); // Small delay to let the user see the success message first
    }
  }, [isTxSuccess, needsApproval]);

  useEffect(() => {
    if (hash && !isWaitingForTx) {
      refetchAllowance();
    }
  }, [hash, isWaitingForTx, refetchAllowance]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isConnected) return;
    
    if (!YOUTUBE_REGEX.test(videoUrl)) {
      setUrlError('Please enter a valid YouTube URL');
      return;
    }
    setUrlError('');

    const structuredDescription = `ARC_JOB_V1|${sourceLang}|${targetLang}|${videoUrl}|${description}`;

    if (needsApproval) {
      writeContract({
        address: USDC_ADDRESS as `0x${string}`,
        abi: ERC20_ABI,
        functionName: 'approve',
        args: [JOB_CONTRACT_ADDRESS as `0x${string}`, budgetInUnits],
      });
    } else {
      writeContract({
        address: JOB_CONTRACT_ADDRESS as `0x${string}`,
        abi: JOB_CONTRACT_ABI,
        functionName: 'createAndFund',
        args: [
          '0x0000000000000000000000000000000000000000', // provider
          address as `0x${string}`,                    // evaluator
          budgetInUnits,                               // budget
          expiryTimestamp,                             // expiry
          structuredDescription,
        ],
      });
    }
  };

  return (
    <section id="create" className="max-w-3xl mx-auto px-4 py-24">
      <div className="bg-card border border-surface rounded-3xl p-8 md:p-12 shadow-2xl relative overflow-hidden group hover:border-primary/20 transition-all">
        <div className="relative z-10">
          <h2 className="text-3xl font-extrabold text-foreground mb-2 text-glow">Create & Stake Job</h2>
          <p className="text-text-secondary mb-10">Automatically lock your USDC budget in a secure escrow (stake) until the AI dubbing is completed.</p>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-bold text-text-secondary mb-2 uppercase tracking-widest">Video URL or IPFS CID</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <LinkIcon className="h-5 w-5 text-primary" />
                </div>
                <input
                  type="text"
                  value={videoUrl}
                  onChange={(e) => {
                    setVideoUrl(e.target.value);
                    if (urlError) setUrlError('');
                  }}
                  placeholder="https://youtube.com/watch?v=..."
                  className={`block w-full pl-11 pr-4 py-3 bg-background border ${urlError ? 'border-danger' : 'border-surface group-hover:border-primary/30'} rounded-xl text-foreground placeholder-text-muted focus:ring-2 focus:ring-primary focus:border-transparent transition-all font-medium`}
                  required
                />
              </div>
              {urlError && <p className="text-danger text-xs mt-1 ml-1">{urlError}</p>}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-bold text-text-secondary mb-2 uppercase tracking-widest">Source Language</label>
                <select 
                  value={sourceLang}
                  onChange={(e) => setSourceLang(e.target.value)}
                  className="block w-full px-4 py-3 bg-background border border-surface rounded-xl text-foreground focus:ring-2 focus:ring-primary transition-all appearance-none cursor-pointer font-medium"
                >
                  {languages.map(lang => <option key={lang} value={lang}>{lang}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-bold text-text-secondary mb-2 uppercase tracking-widest">Target Language</label>
                <select 
                  value={targetLang}
                  onChange={(e) => setTargetLang(e.target.value)}
                  className="block w-full px-4 py-3 bg-background border border-surface rounded-xl text-foreground focus:ring-2 focus:ring-primary transition-all appearance-none cursor-pointer font-medium"
                >
                  {languages.map(lang => <option key={lang} value={lang}>{lang}</option>)}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-bold text-text-secondary mb-2 uppercase tracking-widest">Translation Instructions</label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={4}
                placeholder="Ex: Translate from English to Spanish. Use a natural tone and high-quality audio."
                className="block w-full px-4 py-3 bg-background border border-surface rounded-xl text-foreground placeholder-text-muted focus:ring-2 focus:ring-primary focus:border-transparent transition-all resize-none font-medium"
                required
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-bold text-text-secondary mb-2 uppercase tracking-widest">Budget (USDC)</label>
                <div className="relative">
                  <input
                    type="number"
                    value={budget}
                    onChange={(e) => setBudget(e.target.value)}
                    min="1"
                    step="1"
                    className="block w-full px-4 py-3 bg-background border border-surface rounded-xl text-foreground focus:ring-2 focus:ring-primary focus:border-transparent transition-all font-bold"
                    required
                  />
                  <div className="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none">
                    <span className="text-primary font-bold text-sm">USDC</span>
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold text-text-secondary mb-2 uppercase tracking-widest">Deadline (Days)</label>
                <input
                  type="number"
                  value={expiryDays}
                  onChange={(e) => setExpiryDays(e.target.value)}
                  min="1"
                  max="365"
                  className="block w-full px-4 py-3 bg-background border border-surface rounded-xl text-foreground focus:ring-2 focus:ring-primary focus:border-transparent transition-all font-bold"
                  required
                />
              </div>
            </div>


            <button
              type="submit"
              disabled={isPending || isWaitingForTx || !isConnected}
              className={`w-full flex items-center justify-center gap-2 font-bold py-4 px-6 rounded-xl transition-all shadow-lg ${
                needsApproval 
                ? 'bg-primary hover:bg-arc-accent-gradient text-background shadow-primary/20' 
                : 'bg-success hover:scale-[1.02] text-background shadow-success/20'
              } disabled:opacity-50 group/btn active:scale-95`}
            >
              {isPending || isWaitingForTx ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  {needsApproval ? 'Approving USDC...' : 'Creating & Staking...'}
                </>
              ) : isSuccess && !needsApproval ? (
                <>
                  <ShieldCheck className="w-5 h-5" />
                  Job Created & Staked!
                </>
              ) : needsApproval ? (
                <>
                  <Lock className="w-5 h-5" />
                  1. Approve USDC Spending
                </>
              ) : (
                <>
                  <Upload className="w-5 h-5 group-hover/btn:-translate-y-1 transition-transform" />
                  2. Confirm, Create & Stake
                </>
              )}
            </button>

            {error && (
              <div className="flex items-start gap-2 p-4 bg-danger/10 border border-danger/20 rounded-xl text-danger text-sm shadow-inner">
                <AlertCircle className="w-5 h-5 flex-shrink-0" />
                <p className="font-medium">Error: {error.message.split('\n')[0]}</p>
              </div>
            )}

            {!isConnected && (
              <p className="text-center text-sm text-primary animate-pulse font-bold">
                Please connect your wallet to create a job.
              </p>
            )}
          </form>
        </div>

        {/* Decorative elements */}
        <div className="absolute top-0 right-0 -translate-y-1/2 translate-x-1/2 w-64 h-64 bg-primary/10 rounded-full blur-3xl pointer-events-none animate-glow"></div>
      </div>
    </section>
  );
}
