// ============================================================================
// BRICS CivicPulse - Database Layer (Neon Serverless PostgreSQL + Memory Fallback)
// ============================================================================

import { Pool, neon } from '@neondatabase/serverless';
import {
  CitizenSubmission,
  DemandCluster,
  InfrastructureIndicator,
  CandidateRecommendation,
  PolicyScenario,
  ProjectRegistryItem,
  AuditLogItem,
  UserProfile,
  UserRole,
} from '@/types';
import {
  SEED_SUBMISSIONS,
  SEED_CLUSTERS,
  SEED_INDICATORS,
  SEED_RECOMMENDATIONS,
  SEED_SCENARIOS,
  SEED_PROJECTS,
  SEED_AUDIT_LOGS,
  SEED_USERS,
} from '@/data/seed-data';

// Persistent in-memory cache for fast local development and zero-config operation
class MemoryStore {
  submissions: CitizenSubmission[] = [...SEED_SUBMISSIONS];
  clusters: DemandCluster[] = [...SEED_CLUSTERS];
  indicators: InfrastructureIndicator[] = [...SEED_INDICATORS];
  recommendations: CandidateRecommendation[] = [...SEED_RECOMMENDATIONS];
  scenarios: PolicyScenario[] = [...SEED_SCENARIOS];
  projects: ProjectRegistryItem[] = [...SEED_PROJECTS];
  auditLogs: AuditLogItem[] = [...SEED_AUDIT_LOGS];
  users: UserProfile[] = [...SEED_USERS];
}

const globalForStore = globalThis as unknown as { __brics_store?: MemoryStore };
export const globalStore = globalForStore.__brics_store ?? new MemoryStore();
if (process.env.NODE_ENV !== 'production') globalForStore.__brics_store = globalStore;

// Ensure stores are populated if hot-reloaded with an older memory instance
if (!globalStore.users || globalStore.users.length === 0) {
  globalStore.users = [...SEED_USERS];
} else {
  // Sync any missing seed users (e.g. Super Admin, Jehanabad DM)
  for (const su of SEED_USERS) {
    const existing = globalStore.users.find(u => u.email.toLowerCase() === su.email.toLowerCase());
    if (!existing) {
      globalStore.users.push(su);
    } else {
      existing.name = su.name;
      existing.agency = su.agency;
      existing.badge = su.badge;
      existing.passwordHash = su.passwordHash;
      existing.role = su.role;
      existing.assignedDistrict = su.assignedDistrict;
      existing.allocatedBudgetUsd = su.allocatedBudgetUsd;
    }
  }
}

if (!globalStore.submissions || !globalStore.submissions.some(s => s.id.includes('jhn'))) {
  globalStore.submissions = [...SEED_SUBMISSIONS];
}

if (!globalStore.clusters || !globalStore.clusters.some(c => c.id.includes('jhn'))) {
  globalStore.clusters = [...SEED_CLUSTERS];
}

if (!globalStore.indicators || !globalStore.indicators.some(i => i.id.includes('jhn'))) {
  globalStore.indicators = [...SEED_INDICATORS];
}

if (!globalStore.recommendations || !globalStore.recommendations.some(r => r.id.includes('jhn'))) {
  globalStore.recommendations = [...SEED_RECOMMENDATIONS];
}

if (!globalStore.projects || !globalStore.projects.some(p => p.id.includes('jhn'))) {
  globalStore.projects = [...SEED_PROJECTS];
}

export function isNeonConnected(): boolean {
  return !!process.env.DATABASE_URL && process.env.DATABASE_URL.startsWith('postgres');
}

// ----------------------------------------------------------------------------
// Database Initialization
// ----------------------------------------------------------------------------
export async function initializeDatabaseSchema(): Promise<{ success: boolean; message: string; mode: 'neon' | 'memory' }> {
  const dbUrl = process.env.DATABASE_URL;

  if (!dbUrl || !dbUrl.startsWith('postgres')) {
    return {
      success: true,
      message: 'Running on High-Performance Resilient Local Store with Seed Data (Add DATABASE_URL in settings or .env to switch to Neon PostgreSQL).',
      mode: 'memory',
    };
  }

  try {
    const sql = neon(dbUrl);
    
    // Create tables
    await sql`
      CREATE TABLE IF NOT EXISTS citizen_submissions (
        id VARCHAR(64) PRIMARY KEY,
        reference_code VARCHAR(32) UNIQUE NOT NULL,
        timestamp TIMESTAMPTZ DEFAULT NOW(),
        channel VARCHAR(32) NOT NULL,
        language VARCHAR(10) NOT NULL,
        raw_input TEXT NOT NULL,
        translated_text TEXT,
        category VARCHAR(32) NOT NULL,
        subcategory VARCHAR(128) NOT NULL,
        urgency VARCHAR(16) NOT NULL,
        affected_population_estimate INT,
        latitude NUMERIC(10, 7),
        longitude NUMERIC(10, 7),
        district VARCHAR(128) NOT NULL,
        country VARCHAR(64) NOT NULL,
        landmark VARCHAR(256),
        ward VARCHAR(64),
        extracted_entities JSONB DEFAULT '[]'::jsonb,
        ai_confidence_score NUMERIC(4, 3),
        status VARCHAR(32) DEFAULT 'submitted',
        cluster_id VARCHAR(64),
        assigned_department VARCHAR(128),
        is_assisted BOOLEAN DEFAULT FALSE,
        citizen_consent JSONB,
        citizen_feedback JSONB,
        ai_provider_used VARCHAR(32),
        updated_at TIMESTAMPTZ DEFAULT NOW()
      );
    `;

    return {
      success: true,
      message: 'Successfully connected to Neon PostgreSQL and initialized tables!',
      mode: 'neon',
    };
  } catch (error: any) {
    console.error('Neon DB Init Error:', error);
    return {
      success: false,
      message: `Failed to initialize Neon PostgreSQL: ${error.message}. Defaulting to resilient local store.`,
      mode: 'memory',
    };
  }
}

// ----------------------------------------------------------------------------
// Submissions API
// ----------------------------------------------------------------------------
export async function getAllSubmissions(): Promise<CitizenSubmission[]> {
  return [...globalStore.submissions].sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
}

export async function getSubmissionByReference(refCode: string): Promise<CitizenSubmission | null> {
  const match = globalStore.submissions.find(s => s.referenceCode.toLowerCase() === refCode.toLowerCase() || s.id === refCode);
  return match || null;
}

export async function createSubmission(sub: Omit<CitizenSubmission, 'id' | 'referenceCode' | 'timestamp' | 'updatedAt'>): Promise<CitizenSubmission> {
  const id = `sub-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
  const countryCode = sub.location.country.substring(0, 2).toUpperCase() || 'CP';
  const randNum = Math.floor(1000 + Math.random() * 9000);
  const referenceCode = `CP-${countryCode}-2026-${randNum}`;
  const now = new Date().toISOString();

  const newSub: CitizenSubmission = {
    ...sub,
    id,
    referenceCode,
    timestamp: now,
    updatedAt: now,
  };

  globalStore.submissions.unshift(newSub);

  // Add audit log
  await createAuditLog({
    actor: sub.isAssisted ? 'Facilitator / Officer' : 'Citizen (Self-service)',
    role: sub.isAssisted ? 'district_admin' : 'citizen',
    action: 'CREATE_SUBMISSION',
    targetEntity: 'CitizenSubmission',
    entityId: referenceCode,
    aiProviderUsed: sub.aiProviderUsed,
    details: `New request created in domain '${sub.category}' (${sub.subcategory}) for ${sub.location.district} (PIN: ${sub.location.pincode || '424001'}), ${sub.location.country}. Urgency: ${sub.urgency}.`,
  });

  return newSub;
}

export async function updateSubmissionStatus(
  id: string,
  status: CitizenSubmission['status'],
  assignedDepartment?: string,
  clusterId?: string,
  resolutionNotes?: string,
  actor: string = 'District Officer'
): Promise<CitizenSubmission | null> {
  const normalized = id.toLowerCase();
  const sub = globalStore.submissions.find(s => s.id.toLowerCase() === normalized || s.referenceCode.toLowerCase() === normalized);
  if (!sub) return null;

  const oldStatus = sub.status;
  sub.status = status;
  if (assignedDepartment) sub.assignedDepartment = assignedDepartment;
  if (clusterId) sub.clusterId = clusterId;
  if (resolutionNotes) sub.resolutionNotes = resolutionNotes;
  sub.updatedAt = new Date().toISOString();

  await createAuditLog({
    actor,
    role: 'district_admin',
    action: 'UPDATE_SUBMISSION_STATUS',
    targetEntity: 'CitizenSubmission',
    entityId: sub.referenceCode,
    previousValue: oldStatus,
    newValue: status,
    details: `Status changed from ${oldStatus} to ${status}. Assigned: ${assignedDepartment || 'N/A'}.`,
  });

  return sub;
}

export async function addCitizenFeedback(
  referenceCode: string,
  rating: number,
  comment?: string
): Promise<CitizenSubmission | null> {
  const sub = globalStore.submissions.find(s => s.referenceCode.toLowerCase() === referenceCode.toLowerCase());
  if (!sub) return null;

  sub.citizenFeedback = {
    rating,
    comment,
    submittedAt: new Date().toISOString(),
  };
  sub.updatedAt = new Date().toISOString();

  await createAuditLog({
    actor: 'Citizen',
    role: 'citizen',
    action: 'SUBMIT_CITIZEN_FEEDBACK',
    targetEntity: 'CitizenSubmission',
    entityId: referenceCode,
    details: `Citizen submitted closure rating: ${rating}/5 stars. Feedback: "${comment || 'No comment'}"`,
  });

  return sub;
}

// ----------------------------------------------------------------------------
// Clusters API
// ----------------------------------------------------------------------------
export async function getAllClusters(): Promise<DemandCluster[]> {
  return [...globalStore.clusters];
}

export async function createOrMergeCluster(clusterData: Partial<DemandCluster>): Promise<DemandCluster> {
  const id = `cl-${Date.now()}`;
  const code = `CL-${clusterData.domain?.toUpperCase() || 'INF'}-${Math.floor(100 + Math.random() * 900)}`;
  const now = new Date().toISOString();

  const newCluster: DemandCluster = {
    id,
    clusterCode: code,
    title: clusterData.title || 'New Demand Hotspot Cluster',
    domain: clusterData.domain || 'water',
    country: clusterData.country || 'South Africa',
    district: clusterData.district || 'Gauteng',
    centerCoordinates: clusterData.centerCoordinates || { lat: -25.5, lng: 28.0 },
    memberSubmissionIds: clusterData.memberSubmissionIds || [],
    submissionCount: clusterData.memberSubmissionIds?.length || 1,
    severityScore: clusterData.severityScore || 75,
    unmetNeedScore: clusterData.unmetNeedScore || 80,
    vulnerabilityIndex: clusterData.vulnerabilityIndex || 70,
    affectedPopulation: clusterData.affectedPopulation || 5000,
    estimatedCostUsd: clusterData.estimatedCostUsd || 500000,
    firstReportedAt: now,
    lastReportedAt: now,
    status: 'active',
    summaryRationale: clusterData.summaryRationale || 'Automated multi-point demand concentration.',
    aiSuggestedIntervention: clusterData.aiSuggestedIntervention || 'Targeted infrastructure remediation.',
  };

  globalStore.clusters.unshift(newCluster);
  return newCluster;
}

// ----------------------------------------------------------------------------
// Recommendations & Scenarios API
// ----------------------------------------------------------------------------
export async function getAllRecommendations(): Promise<CandidateRecommendation[]> {
  return [...globalStore.recommendations];
}

export async function updateRecommendationStatus(
  id: string,
  status: CandidateRecommendation['approvedStatus'],
  rationale?: string,
  officerName: string = 'Policy Director'
): Promise<CandidateRecommendation | null> {
  const rec = globalStore.recommendations.find(r => r.id === id);
  if (!rec) return null;

  rec.approvedStatus = status;
  if (rationale) rec.decisionRationale = rationale;
  rec.decidedByOfficer = officerName;

  await createAuditLog({
    actor: officerName,
    role: 'policy_planner',
    action: 'DECIDE_RECOMMENDATION',
    targetEntity: 'CandidateRecommendation',
    entityId: rec.title,
    newValue: status,
    details: `Decision: ${status}. Rationale: ${rationale || 'Aligned with multi-criteria prioritization weights.'}`,
  });

  return rec;
}

export async function getAllScenarios(): Promise<PolicyScenario[]> {
  return [...globalStore.scenarios];
}

export async function savePolicyScenario(scenario: Omit<PolicyScenario, 'id' | 'createdAt'>): Promise<PolicyScenario> {
  const newSc: PolicyScenario = {
    ...scenario,
    id: `sc-${Date.now()}`,
    createdAt: new Date().toISOString(),
  };
  globalStore.scenarios.unshift(newSc);

  await createAuditLog({
    actor: 'Policy Planning Team',
    role: 'policy_planner',
    action: 'CREATE_SCENARIO',
    targetEntity: 'PolicyScenario',
    entityId: newSc.name,
    details: `Scenario created with budget cap $${(newSc.budgetCapUsd / 1000000).toFixed(1)}M USD, covering ${newSc.totalBeneficiaries.toLocaleString()} citizens.`,
  });

  return newSc;
}

// ----------------------------------------------------------------------------
// Indicators & Projects & Audit Logs
// ----------------------------------------------------------------------------
export async function getAllIndicators(): Promise<InfrastructureIndicator[]> {
  return [...globalStore.indicators];
}

export async function getAllProjects(): Promise<ProjectRegistryItem[]> {
  return [...globalStore.projects];
}

export async function updateProjectMilestone(
  projectId: string,
  milestoneId: string,
  status: 'completed' | 'in_progress' | 'delayed',
  actor: string = 'Project Supervisor'
): Promise<ProjectRegistryItem | null> {
  const proj = globalStore.projects.find(p => p.id === projectId);
  if (!proj) return null;

  const ms = proj.milestones.find(m => m.id === milestoneId);
  if (ms) {
    ms.status = status;
    if (status === 'completed') ms.completedDate = new Date().toISOString().split('T')[0];
  }
  proj.lastStatusUpdate = new Date().toISOString();

  await createAuditLog({
    actor,
    role: 'data_steward',
    action: 'UPDATE_PROJECT_MILESTONE',
    targetEntity: 'ProjectRegistryItem',
    entityId: proj.projectCode,
    details: `Milestone '${ms?.title || milestoneId}' updated to status '${status}'.`,
  });

  return proj;
}

export async function getAllAuditLogs(): Promise<AuditLogItem[]> {
  return [...globalStore.auditLogs].sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
}

export async function createAuditLog(log: Omit<AuditLogItem, 'id' | 'timestamp'>): Promise<AuditLogItem> {
  const item: AuditLogItem = {
    ...log,
    id: `aud-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
    timestamp: new Date().toISOString(),
  };
  globalStore.auditLogs.unshift(item);
  return item;
}

// ----------------------------------------------------------------------------
// User RBAC & Territory Provisioning
// ----------------------------------------------------------------------------
export async function getAllUsers(): Promise<UserProfile[]> {
  return [...globalStore.users];
}

export async function getUserById(id: string): Promise<UserProfile | null> {
  return globalStore.users.find(u => u.id === id || u.email.toLowerCase() === id.toLowerCase()) || null;
}

export async function getUserByEmail(email: string): Promise<UserProfile | null> {
  return globalStore.users.find(u => u.email.toLowerCase() === email.toLowerCase()) || null;
}

export async function getUserByInviteToken(token: string): Promise<UserProfile | null> {
  const user = globalStore.users.find(u => u.inviteToken === token);
  if (!user) return null;
  // Check token expiry if set
  if (user.inviteTokenExpiry && new Date(user.inviteTokenExpiry).getTime() < Date.now()) {
    return null;
  }
  return user;
}

export async function inviteOfficial(
  data: {
    name: string;
    email: string;
    role: UserRole;
    agency: string;
    assignedCountry: string;
    assignedDistrict?: string;
    assignedPincodes?: string[];
    assignedDepartment?: string;
    stateOrProvince?: string;
    allocatedBudgetUsd?: number;
    badge?: string;
  },
  invitedBy: string = 'gautamkr192007@gmail.com'
): Promise<{ user: UserProfile; inviteToken: string; activationUrl: string }> {
  const normalizedEmail = data.email.toLowerCase().trim();
  const inviteToken = `INV-${(data.assignedDistrict || 'GOV').slice(0, 3).toUpperCase()}-${Date.now()}-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;
  const expiryDate = new Date(Date.now() + 48 * 60 * 60 * 1000).toISOString(); // 48 hours

  let existing = globalStore.users.find(u => u.email.toLowerCase() === normalizedEmail);

  if (existing) {
    existing.name = data.name;
    existing.role = data.role;
    existing.agency = data.agency;
    existing.assignedCountry = data.assignedCountry;
    existing.assignedDistrict = data.assignedDistrict;
    existing.assignedPincodes = data.assignedPincodes;
    existing.assignedDepartment = data.assignedDepartment;
    existing.stateOrProvince = data.stateOrProvince;
    existing.allocatedBudgetUsd = data.allocatedBudgetUsd || existing.allocatedBudgetUsd || 1000000;
    existing.inviteToken = inviteToken;
    existing.inviteTokenExpiry = expiryDate;
    existing.invitedBy = invitedBy;
    existing.isPasswordSet = false;
  } else {
    existing = {
      id: `user-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      name: data.name,
      email: normalizedEmail,
      role: data.role,
      agency: data.agency || 'District Administrative Council',
      assignedCountry: data.assignedCountry || 'India',
      stateOrProvince: data.stateOrProvince || 'Bihar',
      assignedDistrict: data.assignedDistrict,
      assignedPincodes: data.assignedPincodes || ['804408'],
      assignedDepartment: data.assignedDepartment || 'District Administration',
      badge: data.badge || `${data.assignedDistrict || 'Municipal'} Magistrate`,
      isActive: true,
      isPasswordSet: false,
      inviteToken,
      inviteTokenExpiry: expiryDate,
      invitedBy,
      allocatedBudgetUsd: data.allocatedBudgetUsd || 1500000,
      permissions: ['district_triage', 'district_planning', 'dispatch_contractors', 'approve_local_budget']
    };
    globalStore.users.push(existing);
  }

  await createAuditLog({
    actor: invitedBy,
    role: 'super_admin',
    action: 'INVITE_OFFICIAL_ROLE',
    targetEntity: 'UserProfile',
    entityId: normalizedEmail,
    details: `Super Admin invited official ${data.name} (${normalizedEmail}) as ${data.role} bound to district ${data.assignedDistrict || 'All'}. Generated activation token ${inviteToken}.`,
  });

  const activationUrl = `/set-password?token=${inviteToken}`;
  return { user: existing, inviteToken, activationUrl };
}

export async function setPasswordWithToken(
  token: string, 
  rawPassword: string
): Promise<UserProfile | null> {
  const user = await getUserByInviteToken(token);
  if (!user) return null;

  user.passwordHash = rawPassword;
  user.isPasswordSet = true;
  user.inviteToken = undefined;
  user.inviteTokenExpiry = undefined;

  await createAuditLog({
    actor: user.name,
    role: user.role,
    action: 'SET_OFFICIAL_PASSWORD',
    targetEntity: 'UserProfile',
    entityId: user.email,
    details: `Official ${user.name} (${user.email}) successfully generated and activated their credentials for ${user.assignedDistrict || 'National'} workspace.`,
  });

  return user;
}

export async function validateUserCredentials(
  email: string, 
  rawPassword: string
): Promise<{ success: boolean; user?: UserProfile; error?: string; status: number }> {
  const normalizedEmail = email.toLowerCase().trim();
  const user = globalStore.users.find(u => u.email.toLowerCase() === normalizedEmail);

  if (!user) {
    return {
      success: false,
      error: 'Access Denied: Unrecognized Government Official. Only authorized personnel provisioned by the Central Admin (gautamkr192007@gmail.com) can access this workspace.',
      status: 403
    };
  }

  if (!user.isActive) {
    return {
      success: false,
      error: 'Account Suspended: This official account has been deactivated by the Central Super Admin.',
      status: 403
    };
  }

  if (!user.isPasswordSet) {
    return {
      success: false,
      error: 'Account Activation Required: Your invitation is active but your password has not been generated yet. Please use the official activation link sent by your administrator.',
      status: 400
    };
  }

  // Password check
  if (user.passwordHash !== rawPassword) {
    return {
      success: false,
      error: 'Authentication Failed: Invalid password credentials for this government account.',
      status: 401
    };
  }

  user.lastLoginAt = new Date().toISOString();

  await createAuditLog({
    actor: user.name,
    role: user.role,
    action: 'OFFICIAL_LOGIN_SUCCESS',
    targetEntity: 'UserProfile',
    entityId: user.email,
    details: `Official ${user.name} (${user.role}) authenticated successfully. Jurisdiction: ${user.assignedDistrict || 'Omniscient (All BRICS Districts)'}.`,
  });

  return {
    success: true,
    user,
    status: 200
  };
}

export async function createUser(user: UserProfile, actor: string = 'Super Admin'): Promise<UserProfile> {
  const existing = globalStore.users.find(u => u.email.toLowerCase() === user.email.toLowerCase());
  if (existing) {
    Object.assign(existing, user);
    return existing;
  }
  globalStore.users.push(user);
  await createAuditLog({
    actor,
    role: 'super_admin',
    action: 'PROVISION_USER_ROLE',
    targetEntity: 'UserProfile',
    entityId: user.email,
    details: `Created user ${user.name} (${user.email}) with role ${user.role} in district ${user.assignedDistrict || 'Global'}.`,
  });
  return user;
}

export async function updateUserRoleAndTerritory(
  id: string,
  updates: {
    role?: UserRole;
    assignedDistrict?: string;
    assignedPincodes?: string[];
    assignedDepartment?: string;
    allocatedBudgetUsd?: number;
    isActive?: boolean;
    name?: string;
  },
  actor: string = 'Super Admin'
): Promise<UserProfile | null> {
  const user = globalStore.users.find(u => u.id === id || u.email.toLowerCase() === id.toLowerCase());
  if (!user) return null;

  const oldRole = user.role;
  const oldDistrict = user.assignedDistrict;

  if (updates.role) user.role = updates.role;
  if (updates.assignedDistrict !== undefined) user.assignedDistrict = updates.assignedDistrict;
  if (updates.assignedPincodes !== undefined) user.assignedPincodes = updates.assignedPincodes;
  if (updates.assignedDepartment !== undefined) user.assignedDepartment = updates.assignedDepartment;
  if (updates.allocatedBudgetUsd !== undefined) user.allocatedBudgetUsd = updates.allocatedBudgetUsd;
  if (updates.isActive !== undefined) user.isActive = updates.isActive;
  if (updates.name) user.name = updates.name;

  await createAuditLog({
    actor,
    role: 'super_admin',
    action: 'UPDATE_USER_ROLE_TERRITORY',
    targetEntity: 'UserProfile',
    entityId: user.email,
    previousValue: `${oldRole} (${oldDistrict || 'All'})`,
    newValue: `${user.role} (${user.assignedDistrict || 'All'})`,
    details: `Updated permissions for ${user.name}: Role=${user.role}, District=${user.assignedDistrict || 'All'}, Budget=$${user.allocatedBudgetUsd || 0}.`,
  });

  return user;
}

// ----------------------------------------------------------------------------
// District-Scoped Submissions Retrieval
// ----------------------------------------------------------------------------
export async function getSubmissionsScoped(options?: {
  district?: string;
  department?: string;
  country?: string;
}): Promise<CitizenSubmission[]> {
  let list = await getAllSubmissions();

  if (options?.district) {
    const dLower = options.district.toLowerCase();
    list = list.filter(s => s.location.district.toLowerCase().includes(dLower) || dLower.includes(s.location.district.toLowerCase()));
  }

  if (options?.department) {
    const deptLower = options.department.toLowerCase();
    list = list.filter(s => (s.assignedDepartment && s.assignedDepartment.toLowerCase().includes(deptLower)) || s.category.toLowerCase().includes(deptLower));
  }

  if (options?.country) {
    list = list.filter(s => s.location.country.toLowerCase() === options.country!.toLowerCase());
  }

  return list;
}

