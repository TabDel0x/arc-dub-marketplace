'use client';

import { useReadContract, useAccount, useWriteContract, useWaitForTransactionReceipt } from 'wagmi';
import { JOB_CONTRACT_ADDRESS, USDC_ADDRESS } from '@/lib/wagmi';
import { JOB_CONTRACT_ABI, ERC20_ABI } from '@/lib/abi';
import { useState, useEffect } from 'react';
import { 
  BadgeCheck, 
  Clock, 
  DollarSign, 
  ExternalLink, 
  CheckCircle2, 
  AlertCircle,
  FileVideo,
  PlayCircle,
  Loader2,
  Lock,
  X,
  Languages,
  Video,
  Calendar,
  Sparkles,
  Info
} from 'lucide-react';
import { formatUnits, parseUnits } from 'viem';

const JOB_STATUS_LABELS = [
  'None', 'Created', 'Funded', 'Submitted', 'Completed', 'Cancelled'
];

export function Marketplace() {
  const { address } = useAccount();
  const { data: nextJobId } = useReadContract({
    address: JOB_CONTRACT_ADDRESS as `0x${string}`,
    abi: JOB_CONTRACT_ABI,
    functionName: 'nextJobId',
    query: {
      refetchInterval: 5000,
    }
  });

  const [jobs, setJobs] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (nextJobId) {
      const fetchJobs = async () => {
        setLoading(true);
        const count = Number(nextJobId);
        const fetchedJobs = [];
        for (let i = count; i > Math.max(0, count - 5); i--) {
          fetchedJobs.push(i);
        }
        setJobs(fetchedJobs);
        setLoading(false);
      };
      fetchJobs();
    }
  }, [nextJobId]);

  const [selectedJob, setSelectedJob] = useState<any>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <section id="explore" className="max-w-7xl mx-auto px-4 py-24">
      <div className="flex items-center justify-between mb-12">
        <div>
          <h2 className="text-3xl font-extrabold text-foreground text-glow">Active Jobs</h2>
          <p className="text-text-secondary mt-2 font-medium text-sm tracking-wide">Browse translation and dubbing jobs on Arc Network.</p>
        </div>
        <div className="flex gap-2">
          <span className="bg-card border border-surface px-4 py-2 rounded-xl text-sm text-primary font-bold shadow-inner">
            Total Jobs: {nextJobId ? Number(nextJobId) : 0}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {jobs.map((id) => (
          <JobCard 
            key={id} 
            jobId={id} 
            currentUser={address!} 
            onViewDetails={(jobData) => {
              setSelectedJob({ ...jobData, jobId: id });
              setIsModalOpen(true);
            }} 
          />
        ))}
        {jobs.length === 0 && !loading && (
          <div className="col-span-full py-20 text-center border-2 border-dashed border-surface rounded-3xl group">
            <FileVideo className="w-12 h-12 text-surface mx-auto mb-4 group-hover:text-primary transition-colors" />
            <p className="text-text-muted font-bold uppercase tracking-widest text-sm">No jobs found. Create the first one!</p>
          </div>
        )}
      </div>

      {isModalOpen && selectedJob && (
        <JobDetailModal 
          job={selectedJob} 
          onClose={() => setIsModalOpen(false)} 
        />
      )}
    </section>
  );
}

function parseJobDescription(desc: string) {
  if (desc?.startsWith('ARC_JOB_V1|')) {
    const parts = desc.split('|');
    return {
      sourceLang: parts[1],
      targetLang: parts[2],
      videoUrl: parts[3],
      instructions: parts[4],
      isStructured: true
    };
  }
  return {
    sourceLang: '?',
    targetLang: '?',
    videoUrl: desc?.split('| Video: ')[1] || 'N/A',
    instructions: desc?.split('| Video: ')[0] || desc,
    isStructured: false
  };
}

function JobCard({ jobId, currentUser, onViewDetails }: { jobId: number, currentUser: string, onViewDetails: (job: any) => void }) {
  const { data: job } = useReadContract({
    address: JOB_CONTRACT_ADDRESS as `0x${string}`,
    abi: JOB_CONTRACT_ABI,
    functionName: 'getJob',
    args: [BigInt(jobId)],
  });

  const { data: allowance, refetch: refetchAllowance } = useReadContract({
    address: USDC_ADDRESS as `0x${string}`,
    abi: ERC20_ABI,
    functionName: 'allowance',
    args: [currentUser as `0x${string}`, JOB_CONTRACT_ADDRESS as `0x${string}`],
  });

  const { writeContract, data: hash, isPending: isActionPending } = useWriteContract();
  
  const { isLoading: isWaitingForTx } = useWaitForTransactionReceipt({
    hash,
  });

  useEffect(() => {
    if (hash && !isWaitingForTx) {
       refetchAllowance();
    }
  }, [hash, isWaitingForTx, refetchAllowance]);

  if (!job || typeof job !== 'object') return null;

  const { 
    client, 
    provider, 
    evaluator, 
    budget, 
    expiredAt, 
    status, 
    description 
  } = job as any;

  const jobDetails = parseJobDescription(description);
  
  const isUnassigned = provider === '0x0000000000000000000000000000000000000000';
  const statusLabel = isUnassigned ? (status === 1 ? 'Open (Awaiting Funds)' : (status === 2 ? 'Open (Funded)' : 'Open')) : (JOB_STATUS_LABELS[status] || 'Unknown');

  const needsApproval = allowance !== undefined && budget !== undefined && (allowance as bigint) < (budget as bigint);

  const handleApprove = () => {
    writeContract({
      address: USDC_ADDRESS as `0x${string}`,
      abi: ERC20_ABI,
      functionName: 'approve',
      args: [JOB_CONTRACT_ADDRESS as `0x${string}`, budget],
    });
  };

  const handleFund = () => {
    writeContract({
      address: JOB_CONTRACT_ADDRESS as `0x${string}`,
      abi: JOB_CONTRACT_ABI,
      functionName: 'fund',
      args: [BigInt(jobId), '0x'],
    });
  };

  const handleClaim = () => {
    writeContract({
      address: JOB_CONTRACT_ADDRESS as `0x${string}`,
      abi: JOB_CONTRACT_ABI,
      functionName: 'claimJob',
      args: [BigInt(jobId)],
    });
  };

  const handleComplete = () => {
    writeContract({
      address: JOB_CONTRACT_ADDRESS as `0x${string}`,
      abi: JOB_CONTRACT_ABI,
      functionName: 'complete',
      args: [BigInt(jobId), '0x0000000000000000000000000000000000000000000000000000000000000001', '0x'],
    });
  };
   

  return (
    <div className="bg-card border border-surface rounded-3xl p-6 hover:border-primary/40 transition-all group flex flex-col h-full shadow-2xl relative overflow-hidden">
      <div className="flex items-start justify-between mb-4">
        <div className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest border ${
          status === 4 ? 'bg-success/10 text-success border-success/20' : 
          isUnassigned ? 'bg-primary/10 text-primary border-primary/20 shadow-[0_0_10px_rgba(0,245,255,0.1)]' :
          status === 0 ? 'bg-surface text-text-muted border-surface' : 'bg-secondary/10 text-secondary border-secondary/20'
        }`}>
          {statusLabel}
        </div>
        <div className="text-xs text-text-muted flex items-center gap-1 font-mono font-bold">
          ID: #{jobId.toString()}
        </div>
      </div>

      <h3 className="text-lg font-bold text-foreground mb-4 flex items-center gap-2">
        {jobDetails.isStructured ? (
          <>
            <span className="text-primary">{jobDetails.sourceLang}</span>
            <Sparkles className="w-4 h-4 text-secondary animate-pulse" />
            <span className="text-secondary">{jobDetails.targetLang}</span>
          </>
        ) : (
          <span className="line-clamp-2">{jobDetails.instructions}</span>
        )}
      </h3>

      <div className="space-y-3 mb-8 flex-grow">
        <div className="flex items-center justify-between text-sm">
          <span className="text-text-secondary font-bold flex items-center gap-1.5 uppercase tracking-tighter"><Clock className="w-4 h-4 text-primary" /> Expires</span>
          <span className="text-foreground font-mono">
            {expiredAt ? new Date(Number(expiredAt) * 1000).toLocaleDateString() : 'N/A'}
          </span>
        </div>
        <div className="flex items-center justify-between text-sm">
          <span className="text-text-secondary font-bold flex items-center gap-1.5 uppercase tracking-tighter"><DollarSign className="w-4 h-4 text-success" /> Budget</span>
          <span className="text-success font-extrabold text-lg">
            {budget ? formatUnits(budget, 6) : '0'} <span className="text-xs">USDC</span>
          </span>
        </div>
      </div>

      <div className="pt-6 border-t border-surface mt-auto flex flex-col gap-2">
        {status === 1 && client === currentUser && (
          needsApproval ? (
            <button 
              type="button"
              onClick={handleApprove}
              disabled={isActionPending || isWaitingForTx}
              className="w-full bg-primary hover:bg-arc-accent-gradient disabled:opacity-50 text-background text-sm font-bold py-3 rounded-xl transition-all shadow-lg shadow-primary/20 flex items-center justify-center gap-2 uppercase tracking-widest"
            >
              {isActionPending || isWaitingForTx ? <Loader2 className="w-4 h-4 animate-spin" /> : <Lock className="w-4 h-4" />}
              1. Approve USDC
            </button>
          ) : (
            <button 
              type="button"
              onClick={handleFund}
              disabled={isActionPending || isWaitingForTx}
              className="w-full bg-success hover:scale-[1.02] disabled:opacity-50 text-background text-sm font-bold py-3 rounded-xl transition-all shadow-lg shadow-success/20 flex items-center justify-center gap-2 uppercase tracking-widest"
            >
              {isActionPending || isWaitingForTx ? <Loader2 className="w-4 h-4 animate-spin" /> : <DollarSign className="w-4 h-4" />}
              2. Deposit Funds
            </button>
          )
        )}

        {isUnassigned && (status === 1 || status === 2) && client !== currentUser && (
          <button 
            type="button"
            onClick={handleClaim}
            disabled={isActionPending || isWaitingForTx || status === 1}
            className={`w-full text-sm font-bold py-3 rounded-xl transition-all shadow-lg flex items-center justify-center gap-2 uppercase tracking-widest ${
              status === 1 ? 'bg-surface cursor-not-allowed text-text-muted' : 'bg-primary hover:bg-arc-accent-gradient text-background shadow-primary/20'
            }`}
          >
            {isActionPending || isWaitingForTx ? <Loader2 className="w-4 h-4 animate-spin" /> : <BadgeCheck className="w-4 h-4" />}
            {status === 1 ? 'Awaiting Funds' : 'Claim Job'}
          </button>
        )}

        {status === 3 && (evaluator === currentUser || client === currentUser) && (
          <button 
            type="button"
            onClick={handleComplete}
            disabled={isActionPending || isWaitingForTx}
            className="w-full bg-success hover:scale-[1.02] disabled:opacity-50 text-background text-sm font-bold py-3 rounded-xl transition-all shadow-lg shadow-success/20 flex items-center justify-center gap-2 uppercase tracking-widest"
          >
            {isActionPending || isWaitingForTx ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
            Approve & Pay
          </button>
        )}
        {status === 4 && (
          <div className="w-full bg-surface text-success text-center text-sm font-bold py-3 rounded-xl flex items-center justify-center gap-2 border border-success/10 uppercase tracking-widest">
            <CheckCircle2 className="w-4 h-4" /> Completed
          </div>
        )}
        <button 
          type="button"
          onClick={() => onViewDetails({ ...job as any, ...jobDetails, jobId })}
          className="w-full mt-2 text-xs font-bold text-text-muted hover:text-primary transition-colors py-2 flex items-center justify-center gap-1 uppercase tracking-widest"
        >
          View Details <Info className="w-3 h-3" />
        </button>
      </div>
    </div>
  );
}

function JobDetailModal({ job, onClose }: { job: any, onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-background/90 backdrop-blur-md" onClick={onClose}></div>
      <div className="relative bg-card border border-surface w-full max-w-2xl rounded-3xl overflow-hidden shadow-[0_0_50px_rgba(0,0,0,0.5)] animate-in fade-in zoom-in duration-200">
        <div className="p-8">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-primary/10 rounded-2xl shadow-inner">
                <FileVideo className="w-6 h-6 text-primary" />
              </div>
              <div>
                <h4 className="text-xl font-extrabold text-foreground text-glow uppercase tracking-tighter">Job Intelligence</h4>
                <p className="text-xs text-text-muted font-mono font-bold">NODE_ID: #{job.jobId.toString()}</p>
              </div>
            </div>
            <button onClick={onClose} className="p-2 hover:bg-surface rounded-xl transition-colors group">
              <X className="w-6 h-6 text-text-muted group-hover:text-primary transition-colors" />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
            <div className="space-y-6">
              <div>
                <label className="text-[10px] font-bold text-primary uppercase tracking-[0.2em] block mb-2">Translation Pipeline</label>
                <div className="flex items-center gap-4 bg-background p-5 rounded-2xl border border-surface shadow-inner">
                  <div className="text-center flex-1">
                    <p className="text-[10px] text-text-muted font-bold mb-1 uppercase">Source</p>
                    <p className="text-foreground font-extrabold text-lg">{job.sourceLang}</p>
                  </div>
                  <div className="flex items-center justify-center">
                    <Sparkles className="w-5 h-5 text-secondary animate-pulse" />
                  </div>
                  <div className="text-center flex-1">
                    <p className="text-[10px] text-text-muted font-bold mb-1 uppercase">Target</p>
                    <p className="text-primary font-extrabold text-lg">{job.targetLang}</p>
                  </div>
                </div>
              </div>

              <div>
                <label className="text-[10px] font-bold text-primary uppercase tracking-[0.2em] block mb-2">Source Asset</label>
                <a 
                  href={job.videoUrl} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="flex items-center justify-between gap-3 bg-background p-4 rounded-2xl border border-surface hover:border-primary/50 transition-all group shadow-inner"
                >
                  <div className="flex items-center gap-3 overflow-hidden">
                    <Video className="w-5 h-5 text-primary flex-shrink-0" />
                    <span className="text-xs text-text-secondary truncate font-mono">{job.videoUrl}</span>
                  </div>
                  <ExternalLink className="w-4 h-4 text-text-muted group-hover:text-primary transition-colors" />
                </a>
              </div>
            </div>

            <div className="space-y-6">
              <div>
                <label className="text-[10px] font-bold text-primary uppercase tracking-[0.2em] block mb-2">System Instructions</label>
                <div className="bg-background p-5 rounded-2xl border border-surface min-h-[100px] shadow-inner">
                  <p className="text-sm text-foreground leading-relaxed font-medium italic">
                    "{job.instructions || 'No additional instructions provided.'}"
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="bg-background p-4 rounded-2xl border border-surface text-center shadow-inner group hover:border-success/30 transition-colors">
                  <DollarSign className="w-4 h-4 text-success mx-auto mb-2 group-hover:scale-110 transition-transform" />
                  <p className="text-[10px] text-text-muted font-bold mb-1 uppercase">Stake</p>
                  <p className="text-lg font-extrabold text-success">{formatUnits(job.budget, 6)} <span className="text-[10px]">USDC</span></p>
                </div>
                <div className="bg-background p-4 rounded-2xl border border-surface text-center shadow-inner group hover:border-primary/30 transition-colors">
                  <Calendar className="w-4 h-4 text-primary mx-auto mb-2 group-hover:scale-110 transition-transform" />
                  <p className="text-[10px] text-text-muted font-bold mb-1 uppercase">Expiry</p>
                  <p className="text-sm font-bold text-foreground">{new Date(Number(job.expiredAt) * 1000).toLocaleDateString()}</p>
                </div>
              </div>
            </div>
          </div>

          <div className="pt-8 border-t border-surface">
             <div className="flex items-center justify-between text-[10px] font-bold uppercase tracking-widest text-text-muted">
               <div className="flex items-center gap-2">
                 <BadgeCheck className="w-4 h-4 text-primary" />
                 <span>Status: <span className="text-foreground">{JOB_STATUS_LABELS[job.status]}</span></span>
               </div>
               <span>Owner: <span className="text-foreground font-mono">{job.client.slice(0,6)}...{job.client.slice(-4)}</span></span>
             </div>
          </div>
        </div>
      </div>
    </div>
  );
}
