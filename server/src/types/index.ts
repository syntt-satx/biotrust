export type UserRole = 'SCIENTIST' | 'REVIEWER' | 'ORGANIZATION' | 'GOVERNMENT' | 'ADMIN' | 'PUBLIC';

export type UserStatus = 'ACTIVE' | 'DEACTIVATED';

export type ThreatLevel = 
  | 'Least Concern' 
  | 'Near Threatened' 
  | 'Vulnerable' 
  | 'Endangered' 
  | 'Critically Endangered' 
  | 'Extinct in the Wild' 
  | 'Extinct';

export type RecordStatus = 'DRAFT' | 'UNDER_REVIEW' | 'VERIFIED' | 'DISPUTED' | 'PUBLISHED';

export type VerificationDecision = 'Verified' | 'Disputed' | 'RequestInfo';

export interface LocationData {
  latitude: number;
  longitude: number;
  region: string;
  country: string;
  habitatType: string;
  isSensitive?: boolean;
}

export interface MaskedLocationData {
  latitudeMasked: string;
  longitudeMasked: string;
  region: string;
  country: string;
  habitatType: string;
  isSensitive: boolean;
  maskingNotice: string;
}

export interface User {
  userId: string;
  name: string;
  email: string;
  password?: string;
  role: UserRole;
  status: UserStatus;
  organizationName?: string;
  reputationScore: number;
  expertiseTags: string[]; // e.g. ['Mammalia', 'Panthera', 'Forest', 'Genetics']
  createdAt: string;
}

export interface Species {
  speciesId: string;
  commonName: string;
  scientificName: string;
  kingdom: string;
  phylum: string;
  class: string;
  order: string;
  family: string;
  genus: string;
  description: string;
  habitat: string;
  distribution: string;
  threatLevel: ThreatLevel;
  isProtected: boolean;
  threatFactors: string[];
  imageUrl?: string;
  updatedAt: string;
}

export interface DNASample {
  sampleId: string;
  recordId: string;
  sampleType: 'Tissue' | 'Blood' | 'Hair/Fur' | 'eDNA' | 'Leaf' | 'Fecal' | 'Bone' | 'Swab';
  collectionDate: string;
  description: string;
  sequenceAccession?: string; // NCBI GenBank / RefSeq accession
  labName?: string;
  primerNotes?: string;
}

export interface ResearchPaper {
  paperId: string;
  recordId: string;
  title: string;
  authors: string[];
  publicationDate: string;
  journal: string;
  doi?: string;
  documentUrl?: string;
  abstract?: string;
}

export interface VerificationReview {
  verificationId: string;
  recordId: string;
  reviewerId: string;
  reviewerName: string;
  decision: VerificationDecision;
  comments: string;
  reviewDate: string;
  confidenceScore: number; // 1-5
}

export interface RecordVersionSnapshot {
  version: number;
  timestamp: string;
  updatedBy: string;
  description: string;
  location: LocationData;
  dnaSamplesCount: number;
  researchPapersCount: number;
  changesSummary: string;
}

export interface BiodiversityRecord {
  recordId: string;
  speciesId: string;
  submittedBy: string; // userId
  submitterName: string;
  submissionDate: string;
  status: RecordStatus;
  description: string;
  location: LocationData;
  version: number;
  trustScore: number;
  trustBadge: 'High' | 'Medium' | 'Low';
  requiredConsensus: number; // usually 2
  assignedReviewers: string[];
  verifications: VerificationReview[];
  reviewerNotes?: string[];
  dnaSamples: DNASample[];
  researchPapers: ResearchPaper[];
  versionHistory: RecordVersionSnapshot[];
  duplicateWarning?: string;
  conflictFlag?: boolean;
}

export interface ConservationProject {
  projectId: string;
  projectName: string;
  organizationId: string;
  organizationName: string;
  speciesId: string;
  speciesCommonName?: string;
  description: string;
  status: 'Planning' | 'Active' | 'Milestone_Met' | 'Completed' | 'Suspended';
  startDate: string;
  endDate?: string;
  budget: string;
  targetImpact: string;
  milestones: {
    id: string;
    title: string;
    completed: boolean;
    targetDate: string;
  }[];
  impactLogs: {
    date: string;
    log: string;
    recordedBy: string;
  }[];
}

export interface ThreatProposal {
  proposalId: string;
  speciesId: string;
  speciesName: string;
  currentThreatLevel: ThreatLevel;
  proposedThreatLevel: ThreatLevel;
  proposedBy: string;
  proposerName: string;
  justification: string;
  scientificEvidence: string;
  proposedDate: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  approvedBy?: string;
  approverName?: string;
  approvalDate?: string;
  approvalNotes?: string;
}

export interface NotificationItem {
  notificationId: string;
  recipientId: string; // or 'ALL' or 'ROLE:REVIEWER'
  recipientRole?: UserRole;
  title: string;
  message: string;
  type: 'SUBMISSION' | 'PENDING_REVIEW' | 'VERIFIED' | 'DISPUTED' | 'REQUEST_INFO' | 'THREAT_UPDATE' | 'WATCHLIST_ALERT' | 'SYSTEM';
  date: string;
  readStatus: boolean;
  linkId?: string;
  linkType?: 'record' | 'species' | 'project';
}

export interface AuditLogEntry {
  auditId: string;
  timestamp: string;
  userId: string;
  userName: string;
  userRole: UserRole;
  action: 
    | 'USER_REGISTERED'
    | 'USER_LOGIN'
    | 'ROLE_ASSIGNED'
    | 'ACCOUNT_TOGGLED'
    | 'SPECIES_ADDED'
    | 'SPECIES_UPDATED'
    | 'RECORD_CREATED'
    | 'RECORD_SUBMITTED'
    | 'DRAFT_UPDATED'
    | 'DNA_SAMPLE_ADDED'
    | 'RESEARCH_PAPER_ADDED'
    | 'RECORD_REVIEWED'
    | 'RECORD_VERIFIED'
    | 'RECORD_DISPUTED'
    | 'INFO_REQUESTED'
    | 'RECORD_PUBLISHED'
    | 'THREAT_PROPOSED'
    | 'THREAT_APPROVED'
    | 'PROJECT_CREATED'
    | 'PROJECT_UPDATED';
  recordId?: string;
  speciesId?: string;
  oldValue?: string;
  newValue?: string;
  justification?: string;
}

export interface WatchlistSubscription {
  subscriptionId: string;
  userId: string;
  speciesId?: string;
  region?: string;
  createdAt: string;
}
