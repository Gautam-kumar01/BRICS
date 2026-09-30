// ============================================================================
// BRICS CivicPulse - Type Definitions (Aligned with PRD v1.0 MVP & Hack2Skills)
// ============================================================================

export type InfrastructureDomain = 'water' | 'roads' | 'connectivity' | 'energy' | 'sanitation' | 'health';

export type SubmissionChannel = 'web_voice' | 'web_text' | 'whatsapp' | 'sms_ussd' | 'assisted_desk';

export type SubmissionStatus = 
  | 'submitted' 
  | 'triaged' 
  | 'verified' 
  | 'clustered' 
  | 'in_review' 
  | 'approved' 
  | 'in_progress' 
  | 'resolved' 
  | 'rejected';

export type UrgencyLevel = 'low' | 'medium' | 'high' | 'critical';

export type SupportedLanguage = 'en' | 'hi' | 'pt' | 'ru' | 'zh' | 'ar' | 'sw';

export type DataStatusType = 'measured' | 'projected' | 'simulated' | 'not_available';

export type DataAvailabilityState = 'available' | 'partial' | 'not_available' | 'simulated';

export interface DataProvenanceInfo {
  datasetName: string;
  source: string;
  year: number;
  geography: string;
  lastUpdated: string;
  dataType: string;
  status: DataStatusType;
  methodologyUrl?: string;
  confidenceScore?: number;
  sampleCount?: number;
}

export interface BRICSCountryConfig {
  code: string;
  name: string;
  nativeName: string;
  flag: string;
  language: SupportedLanguage;
  currency: string;
  currencySymbol: string;
  administrativeLevels: {
    national: string;
    stateOrProvince: string;
    district: string;
    subDistrict: string;
  };
  datasetsAvailable: boolean;
  activePilots: string[];
  infrastructureIndicators: string[];
  dataAvailability: DataAvailabilityState;
}

export interface LocationGeo {
  latitude: number;
  longitude: number;
  district: string;
  subDistrict?: string;
  pincode?: string;
  ward?: string;
  landmark?: string;
  country: string;
  uncertaintyRadiusMeters: number;
  confidence: number;
  formattedAddress: string;
}

export interface ExtractedEntity {
  field: string;
  value: string;
  confidence: number;
  sourceSpan?: string;
}

export interface CitizenSubmission {
  id: string;
  referenceCode: string; // e.g. "CP-IN-2026-8491"
  timestamp: string;
  channel: SubmissionChannel;
  language: SupportedLanguage;
  rawInput: string;
  translatedText: string;
  audioDurationSeconds?: number;
  category: InfrastructureDomain;
  subcategory: string;
  urgency: UrgencyLevel;
  affectedPopulationEstimate?: number;
  location: LocationGeo;
  extractedEntities: ExtractedEntity[];
  aiConfidenceScore: number;
  status: SubmissionStatus;
  clusterId?: string;
  assignedDepartment?: string;
  isAssisted: boolean;
  assistedByOfficerId?: string;
  citizenConsent: {
    dataAnalytics: boolean;
    publicMapAggregation: boolean;
    contactForUpdates: boolean;
    contactValue?: string;
  };
  resolutionNotes?: string;
  citizenFeedback?: {
    rating: number; // 1-5
    comment?: string;
    submittedAt: string;
  };
  aiProviderUsed?: string;
  updatedAt: string;
  provenance?: DataProvenanceInfo;
  dataProvenance?: DataProvenanceInfo;
  dataStatus?: DataStatusType;
  smsDispatch?: {
    success: boolean;
    simulated: boolean;
    provider: 'twilio' | 'fast2sms' | 'simulation';
    referenceCode: string;
    recipient: string;
    message: string;
    dispatchId?: string;
    note?: string;
    error?: string;
  };
}

export interface DemandCluster {
  id: string;
  clusterCode: string; // e.g. "CL-WATER-MH-04"
  title: string;
  domain: InfrastructureDomain;
  country: string;
  district: string;
  centerCoordinates: {
    lat: number;
    lng: number;
  };
  memberSubmissionIds: string[];
  submissionCount: number;
  severityScore: number; // 0 - 100
  unmetNeedScore: number; // 0 - 100
  vulnerabilityIndex: number; // 0 - 100
  affectedPopulation: number;
  estimatedCostUsd: number;
  firstReportedAt: string;
  lastReportedAt: string;
  status: 'active' | 'investigating' | 'promoted_to_project' | 'closed';
  summaryRationale: string;
  aiSuggestedIntervention: string;
  provenance?: DataProvenanceInfo;
  dataStatus?: DataStatusType;
}

export interface InfrastructureIndicator {
  id: string;
  name: string;
  domain: InfrastructureDomain;
  district: string;
  country: string;
  currentValue: number;
  unit: string;
  targetValue: number;
  baselineYear: number;
  vulnerabilityWeight: number; // 0.0 - 1.0
  sourceDataset: string;
  dataFreshnessDate: string;
  qualityRating: 'verified_official' | 'satellite_modelled' | 'provisional';
  provenance?: DataProvenanceInfo;
  dataStatus?: DataStatusType;
}

export interface PrioritizationWeights {
  severity: number; // e.g. 25%
  affectedPopulation: number; // e.g. 20%
  vulnerabilityIndex: number; // e.g. 20%
  serviceGap: number; // e.g. 15%
  feasibilityCost: number; // e.g. 10%
  strategicAlignment: number; // e.g. 10%
}

export interface CandidateRecommendation {
  id: string;
  title: string;
  domain: InfrastructureDomain;
  district: string;
  country: string;
  clusterId: string;
  rank: number;
  compositeScore: number; // 0 - 100
  scoreBreakdown: {
    severity: number;
    population: number;
    vulnerability: number;
    serviceGap: number;
    costEfficiency: number;
    alignment: number;
  };
  estimatedBudgetUsd: number;
  timelineMonths: number;
  beneficiariesCount: number;
  confidence: number;
  assumptions: string[];
  evidenceLinks: Array<{ label: string; url?: string; metric: string }>;
  equityNotes: string;
  doNotUseWarning?: string; // Flag if data quality is insufficient
  approvedStatus: 'pending_review' | 'included_in_plan' | 'deferred' | 'rejected';
  decisionRationale?: string;
  decidedByOfficer?: string;
  provenance?: DataProvenanceInfo;
  dataStatus?: DataStatusType;
}

export interface PolicyScenario {
  id: string;
  name: string;
  description: string;
  country: string;
  budgetCapUsd: number;
  weights: PrioritizationWeights;
  selectedRecommendationIds: string[];
  totalCostUsd: number;
  totalBeneficiaries: number;
  equityCoverageScore: number;
  unresolvedDemandCount: number;
  createdAt: string;
  dataStatus?: DataStatusType;
}

export interface ProjectRegistryItem {
  id: string;
  projectCode: string; // e.g. "PRJ-WAT-2026-09"
  title: string;
  domain: InfrastructureDomain;
  country: string;
  district: string;
  leadAgency: string;
  allocatedBudgetUsd: number;
  spentBudgetUsd: number;
  startDate: string;
  targetCompletionDate: string;
  currentMilestone: string;
  milestones: Array<{
    id: string;
    title: string;
    targetDate: string;
    completedDate?: string;
    status: 'completed' | 'in_progress' | 'delayed' | 'pending';
  }>;
  baselineMetric: { name: string; value: string; status?: DataStatusType };
  targetMetric: { name: string; value: string; status?: DataStatusType };
  currentMetric: { name: string; value: string; status?: DataStatusType };
  citizenSatisfactionAverage: number; // 1 - 5
  totalCitizenReviews: number;
  liveStatus: 'planning' | 'procurement' | 'construction' | 'commissioned' | 'delivered';
  lastStatusUpdate: string;
  publicEvidenceUrl?: string;
  provenance?: DataProvenanceInfo;
  dataStatus?: DataStatusType;
}

export interface AIProviderStatus {
  id: 'gemini' | 'groq' | 'openrouter' | 'local_fallback';
  name: string;
  modelName: string;
  isConfigured: boolean;
  isHealthy: boolean;
  latencyMs: number;
  lastChecked: string;
  totalCalls: number;
  failedCalls: number;
  errorRatePercent: number;
}

export interface ModelCardMetadata {
  modelName: string;
  version: string;
  developer: string;
  primaryTasks: string[];
  supportedLanguages: string[];
  intendedDomain: string;
  ethicalSafeguards: string[];
  outOfScopeUses: string[];
  confidenceThresholds: {
    extractionAcceptance: number;
    autoTriageGate: number;
    uncertaintyFlag: number;
  };
}

export interface AuditLogItem {
  id: string;
  timestamp: string;
  actor: string;
  role: 'citizen' | 'district_admin' | 'policy_planner' | 'data_steward' | 'system_ai' | 'super_admin' | 'district_collector' | 'department_engineer';
  action: string;
  targetEntity: string;
  entityId: string;
  aiProviderUsed?: string;
  details: string;
  previousValue?: string;
  newValue?: string;
  decisionStatus?: 'pending_human_review' | 'approved_by_officer' | 'rejected_by_officer' | 'evidence_requested';
}

export type UserRole = 
  | 'super_admin' 
  | 'district_collector' 
  | 'department_engineer' 
  | 'policy_planner' 
  | 'data_steward' 
  | 'citizen';

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  passwordHash?: string;
  role: UserRole;
  agency: string;
  assignedCountry: string;
  assignedDistrict?: string;
  assignedPincodes?: string[];
  assignedDepartment?: string;
  badge: string;
  isActive: boolean;
  isPasswordSet: boolean;
  inviteToken?: string;
  inviteTokenExpiry?: string;
  invitedBy?: string;
  allocatedBudgetUsd?: number;
  stateOrProvince?: string;
  lastLoginAt?: string;
  permissions: string[];
}


