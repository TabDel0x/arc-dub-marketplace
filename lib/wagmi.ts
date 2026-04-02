import { getDefaultConfig } from '@rainbow-me/rainbowkit';
import { arcTestnet } from './chains';

export const config = getDefaultConfig({
  appName: 'AI Video Dubber Marketplace',
  projectId: process.env.NEXT_PUBLIC_PROJECT_ID || '8143a88c7d57716495366f10355a1b01',
  chains: [arcTestnet],
  ssr: true,
});

export const USDC_ADDRESS = process.env.NEXT_PUBLIC_USDC_ADDRESS || '0x3600000000000000000000000000000000000000';
export const JOB_CONTRACT_ADDRESS = process.env.NEXT_PUBLIC_JOB_CONTRACT_ADDRESS || '0x9B439788d7622B7575CB73C0De1f52E27b9F5090';
