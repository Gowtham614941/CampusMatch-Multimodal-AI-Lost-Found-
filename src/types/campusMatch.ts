export type ItemStatus = 'found' | 'pending' | 'returned';

export type ItemCategory =
  | 'All'
  | 'Electronics'
  | 'Apparel'
  | 'Bottles & Bags'
  | 'Keys & IDs';

export type PortalMode = 'student' | 'admin';

export type AdminSection = 'dashboard' | 'intake' | 'settings';

export interface ClaimDetails {
  claimantName: string;
  claimantEmail: string;
  submittedAt: string;
  proofAnswer: string;
  claimRef: string;
}

export interface CustodyLog {
  studentIdNumber: string;
  returnedAt: string;
  approvedBy: string;
}

export interface FoundItem {
  id: string;
  title: string;
  category: Exclude<ItemCategory, 'All'>;
  imageUrl: string;
  locationFound: string;
  foundRelativeTime: string;
  pickupDesk: string;
  aiTags: string[];
  proofQuestion: string;
  status: ItemStatus;
  claim?: ClaimDetails;
  custodyLog?: CustodyLog;
}

export interface IntakePreset {
  id: string;
  label: string;
  title: string;
  category: Exclude<ItemCategory, 'All'>;
  imageUrl: string;
  aiTags: string[];
  locationFound: string;
  proofQuestion: string;
}
