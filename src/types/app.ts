/** Shared catalog app shape (Store / cards / API). */
export interface AppItem {
  id: string;
  name: string;
  version: string;
  developer: string;
  description: string;
  category: string;
  ipfsHash: string;
  reputationStaked: number;
  authorizerSignature: string;
  virustotalScore: string;
  permissionsCount: number;
  staticScanStatus: 'clean' | 'warning' | 'critical';
  installCount: number;
  trustScore: number;
  stakingAddress: string;
  isSlashed?: boolean;
  downloadUrl?: string;
  hashVerified?: boolean;
  source?: string;
  sha256?: string;
}
