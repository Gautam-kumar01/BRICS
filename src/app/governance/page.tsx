'use client';

import React, { useState, useEffect } from 'react';
import { 
  ShieldCheck, 
  Cpu, 
  Database, 
  FileText, 
  Activity, 
  CheckCircle2, 
  AlertTriangle, 
  RefreshCw, 
  Sliders, 
  Lock, 
  KeyRound, 
  Server,
  Zap,
  Users,
  MapPin,
  Building,
  UserCheck,
  PlusCircle,
  Edit3,
  Mail,
  Copy,
  Check,
  ExternalLink,
  DollarSign,
  Search,
  Filter,
  Send,
  Sparkles,
  Award,
  Clock
} from 'lucide-react';
import { AuditLogItem, AIProviderStatus, UserProfile, UserRole } from '@/types';
import { SEED_AUDIT_LOGS, SEED_USERS } from '@/data/seed-data';
import { useAuth } from '@/context/AuthContext';
import PrototypeDisclosure from '@/components/PrototypeDisclosure';
import DataStatusBadge from '@/components/DataStatusBadge';

export default function GovernancePage() {
  const { user: currentUser, isSuperAdmin } = useAuth();
  const [auditLogs, setAuditLogs] = useState<AuditLogItem[]>(SEED_AUDIT_LOGS);
  const [providers, setProviders] = useState<AIProviderStatus[]>([]);
  const [usersList, setUsersList] = useState<UserProfile[]>(SEED_USERS);
  const [dbInfo, setDbInfo] = useState<{ isNeonConnected: boolean; message?: string }>({ isNeonConnected: false });
  const [loadingHealth, setLoadingHealth] = useState(false);
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [activeSubTab, setActiveSubTab] = useState<'user_roles' | 'model_cards' | 'metrics_framework' | 'readiness_gates' | 'switchboard' | 'database' | 'audit_logs'>('user_roles');
  const [editingUser, setEditingUser] = useState<UserProfile | null>(null);
  const [saveSuccessMsg, setSaveSuccessMsg] = useState<string | null>(null);
  const [isCreatingUser, setIsCreatingUser] = useState(false);
  
  // Official invitation dispatcher state
  const [dispatchedInvite, setDispatchedInvite] = useState<{
    user: UserProfile;
    inviteToken: string;
    activationUrl: string;
  } | null>(null);
  const [copiedToken, setCopiedToken] = useState(false);
  const [copiedUrl, setCopiedUrl] = useState(false);

  // Filters for user list
  const [userSearchQuery, setUserSearchQuery] = useState('');
  const [filterRole, setFilterRole] = useState<string>('all');
  const [filterDistrict, setFilterDistrict] = useState<string>('all');

  const [newUserData, setNewUserData] = useState({
    name: '',
    email: '',
    role: 'district_collector' as UserRole,
    agency: 'Office of the District Authority & Administration',
    assignedCountry: 'India',
    stateOrProvince: 'Bihar',
    assignedDistrict: 'Jehanabad',
    assignedPincodes: '804408, 804417',
    assignedDepartment: 'District Administration & Public Works',
    allocatedBudgetUsd: 1800000,
    badge: 'Demo District Authority (Jehanabad)'
  });

  useEffect(() => {
    fetchHealth();
    fetchDbStatus();
    fetchUsers();
  }, []);

  async function fetchUsers() {
    setLoadingUsers(true);
    try {
      const res = await fetch('/api/users');
      if (res.ok) {
        const data = await res.json();
        setUsersList(data);
      }
    } catch (e) {
    } finally {
      setLoadingUsers(false);
    }
  }

  async function fetchHealth() {
    setLoadingHealth(true);
    try {
      const res = await fetch('/api/ai/health');
      if (res.ok) {
        const data = await res.json();
        setProviders(data.providers || []);
      }
    } catch (e) {
    } finally {
      setLoadingHealth(false);
    }
  }

  async function fetchDbStatus() {
    try {
      const res = await fetch('/api/db/init');
      if (res.ok) {
        const data = await res.json();
        setDbInfo(data);
      }
    } catch (e) {}
  }

  async function handleSaveUserEdit(e: React.FormEvent) {
    e.preventDefault();
    if (!editingUser) return;
    try {
      const res = await fetch('/api/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'update_role',
          id: editingUser.id,
          role: editingUser.role,
          name: editingUser.name,
          assignedDistrict: editingUser.assignedDistrict,
          assignedPincodes: editingUser.assignedPincodes,
          assignedDepartment: editingUser.assignedDepartment,
          allocatedBudgetUsd: editingUser.allocatedBudgetUsd,
          isActive: editingUser.isActive,
          actor: currentUser?.name || 'Super Admin (gautamkr192007@gmail.com)'
        })
      });
      if (res.ok) {
        const updated = await res.json();
        setUsersList(prev => prev.map(u => u.id === updated.id ? updated : u));
        setEditingUser(null);
        setSaveSuccessMsg(`Successfully updated role, district jurisdiction & budget for ${updated.name}`);
        setTimeout(() => setSaveSuccessMsg(null), 4000);
      }
    } catch (e) {
      alert('Failed to update user profile');
    }
  }

  async function handleCreateAndInviteUser(e: React.FormEvent) {
    e.preventDefault();
    try {
      const res = await fetch('/api/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'invite_official',
          name: newUserData.name,
          email: newUserData.email,
          role: newUserData.role,
          agency: newUserData.agency,
          assignedCountry: newUserData.assignedCountry,
          stateOrProvince: newUserData.stateOrProvince,
          assignedDistrict: newUserData.assignedDistrict,
          assignedPincodes: newUserData.assignedPincodes ? newUserData.assignedPincodes.split(',').map(s => s.trim()) : undefined,
          assignedDepartment: newUserData.assignedDepartment,
          allocatedBudgetUsd: newUserData.allocatedBudgetUsd,
          badge: newUserData.badge,
          invitedBy: currentUser?.email || 'gautamkr192007@gmail.com'
        })
      });

      if (res.ok) {
        const result = await res.json();
        setUsersList(prev => {
          const exists = prev.find(u => u.email.toLowerCase() === result.user.email.toLowerCase());
          if (exists) {
            return prev.map(u => u.email.toLowerCase() === result.user.email.toLowerCase() ? result.user : u);
          }
          return [...prev, result.user];
        });

        setIsCreatingUser(false);
        setDispatchedInvite({
          user: result.user,
          inviteToken: result.inviteToken,
          activationUrl: result.activationUrl
        });

        setSaveSuccessMsg(`Official invitation generated for ${result.user.name}. Activation link dispatched.`);
        setTimeout(() => setSaveSuccessMsg(null), 5000);
      } else {
        const err = await res.json();
        alert(err.error || 'Failed to provision and invite official.');
      }
    } catch (e) {
      alert('Network error while provisioning official');
    }
  }

  const handleCopy = (text: string, type: 'token' | 'url') => {
    navigator.clipboard.writeText(text);
    if (type === 'token') {
      setCopiedToken(true);
      setTimeout(() => setCopiedToken(false), 2000);
    } else {
      setCopiedUrl(true);
      setTimeout(() => setCopiedUrl(false), 2000);
    }
  };

  const filteredUsers = usersList.filter(u => {
    if (filterRole !== 'all' && u.role !== filterRole) return false;
    if (filterDistrict !== 'all') {
      if (filterDistrict === 'national') {
        if (u.assignedDistrict) return false;
      } else {
        if (!u.assignedDistrict || !u.assignedDistrict.toLowerCase().includes(filterDistrict.toLowerCase())) return false;
      }
    }
    if (userSearchQuery) {
      const q = userSearchQuery.toLowerCase();
      return u.name.toLowerCase().includes(q) || 
             u.email.toLowerCase().includes(q) || 
             (u.assignedDistrict && u.assignedDistrict.toLowerCase().includes(q)) ||
             u.role.toLowerCase().includes(q);
    }
    return true;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 text-stone-900">
      
      {/* Prototype Environment Notice */}
      <PrototypeDisclosure variant="banner" />

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-stone-200 pb-6">
        <div>
          <div className="inline-flex items-center space-x-2 text-xs font-mono text-orange-600 font-bold mb-1 bg-orange-50 px-2.5 py-0.5 rounded-full border border-orange-200">
            <span>FR-13 & Section 10-15 Sovereign Governance Hub</span>
          </div>
          <h1 className="text-3xl font-display font-extrabold text-stone-900">
            Governance, AI Model Cards & RBAC Authority
          </h1>
          <p className="text-xs text-stone-600 mt-1">
            Manage provisioned government officials, dispatch email invitations, allocate district budgets, and audit cryptographic trails.
          </p>
        </div>

        <div className="flex items-center space-x-3">
          {isSuperAdmin ? (
            <button
              onClick={() => setIsCreatingUser(true)}
              className="flex items-center space-x-1.5 px-4 py-2 rounded-xl bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-700 hover:to-amber-700 text-white text-xs font-bold shadow-md shadow-orange-600/20 transition-all cursor-pointer"
            >
              <PlusCircle className="w-3.5 h-3.5" />
              <span>Provision & Invite Official</span>
            </button>
          ) : (
            <span className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-stone-100 border border-stone-200 text-stone-600 text-xs font-medium">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
              <span>Citizen / Public Observer Mode</span>
            </span>
          )}

          <button
            onClick={fetchHealth}
            disabled={loadingHealth}
            className="flex items-center space-x-1.5 px-4 py-2 rounded-xl bg-white hover:bg-stone-50 border border-stone-200 text-xs text-stone-800 font-bold transition-all shadow-2xs self-start md:self-auto cursor-pointer"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loadingHealth ? 'animate-spin' : ''}`} />
            <span>Telemetry Ping</span>
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center space-x-2 border-b border-stone-200 pb-2 overflow-x-auto">
        <button
          onClick={() => setActiveSubTab('user_roles')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap flex items-center space-x-1.5 ${
            activeSubTab === 'user_roles' ? 'bg-gradient-to-r from-orange-500 to-amber-500 text-white shadow-sm' : 'text-stone-600 hover:text-stone-950'
          }`}
        >
          <Users className="w-3.5 h-3.5" />
          <span>Official Roles & Territory RBAC ({usersList.length})</span>
        </button>
        <button
          onClick={() => setActiveSubTab('model_cards')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
            activeSubTab === 'model_cards' ? 'bg-gradient-to-r from-orange-500 to-amber-500 text-white shadow-sm' : 'text-stone-600 hover:text-stone-950'
          }`}
        >
          AI Model Cards & Ethics (§10)
        </button>
        <button
          onClick={() => setActiveSubTab('metrics_framework')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
            activeSubTab === 'metrics_framework' ? 'bg-gradient-to-r from-orange-500 to-amber-500 text-white shadow-sm' : 'text-stone-600 hover:text-stone-950'
          }`}
        >
          Measurement Framework (§11)
        </button>
        <button
          onClick={() => setActiveSubTab('readiness_gates')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
            activeSubTab === 'readiness_gates' ? 'bg-gradient-to-r from-orange-500 to-amber-500 text-white shadow-sm' : 'text-stone-600 hover:text-stone-950'
          }`}
        >
          Go/No-Go Readiness (§4.1 & §15)
        </button>
        <button
          onClick={() => setActiveSubTab('switchboard')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
            activeSubTab === 'switchboard' ? 'bg-gradient-to-r from-orange-500 to-amber-500 text-white shadow-sm' : 'text-stone-600 hover:text-stone-950'
          }`}
        >
          AI Gateway Switchboard
        </button>
        <button
          onClick={() => setActiveSubTab('database')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
            activeSubTab === 'database' ? 'bg-gradient-to-r from-orange-500 to-amber-500 text-white shadow-sm' : 'text-stone-600 hover:text-stone-950'
          }`}
        >
          Neon PostgreSQL Schema
        </button>
        <button
          onClick={() => setActiveSubTab('audit_logs')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
            activeSubTab === 'audit_logs' ? 'bg-gradient-to-r from-orange-500 to-amber-500 text-white shadow-sm' : 'text-stone-600 hover:text-stone-950'
          }`}
        >
          Tamper-Evident Audit Trail
        </button>
      </div>

      {saveSuccessMsg && (
        <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs font-bold flex items-center justify-between shadow-xs animate-in fade-in">
          <div className="flex items-center space-x-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>{saveSuccessMsg}</span>
          </div>
          <button onClick={() => setSaveSuccessMsg(null)} className="text-emerald-700 hover:text-emerald-900 text-[11px] font-bold">Dismiss</button>
        </div>
      )}

      {/* SUBTAB 0: USER ROLES & DISTRICT RBAC PROVISIONING */}
      {activeSubTab === 'user_roles' && (
        <div className="space-y-6">
          
          {/* Security & Access Notice Banner */}
          <div className="p-6 rounded-3xl bg-gradient-to-r from-stone-950 via-[#2D180F] to-stone-950 text-white border-2 border-orange-500/40 shadow-xl space-y-4">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
              <div className="flex items-center space-x-2.5 text-xs font-mono font-bold text-orange-400 uppercase tracking-wide">
                <ShieldCheck className="w-5 h-5 text-orange-400" />
                <span>National Sovereign RBAC, Budget Allocation & Email Invitation Engine</span>
              </div>
              <span className="text-[11px] font-mono px-3 py-1 rounded-full bg-emerald-950/90 text-emerald-300 border border-emerald-600/60 font-bold self-start md:self-auto">
                🔒 Public Self Sign-Up Blocked
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2 text-xs text-stone-300 border-t border-orange-500/20">
              <div className="p-3.5 rounded-2xl bg-black/40 border border-orange-500/30 space-y-1">
                <strong className="text-orange-300 block font-bold">🏛️ Central Super Admin (Demo):</strong>
                <p className="text-stone-300 text-[11px]">Omniscient multi-district visibility, official provisioning, and multi-million USD capital budget allocation.</p>
              </div>
              <div className="p-3.5 rounded-2xl bg-black/40 border border-orange-500/30 space-y-1">
                <strong className="text-amber-300 block font-bold">🏢 District Authorities (Demo Jehanabad / Dhule):</strong>
                <p className="text-stone-300 text-[11px]">Strict territory scoping. When Jehanabad Authority logs in, only Jehanabad complaints and demands are accessible.</p>
              </div>
              <div className="p-3.5 rounded-2xl bg-black/40 border border-orange-500/30 space-y-1">
                <strong className="text-emerald-300 block font-bold">✉️ Invitation-Driven Account Activation:</strong>
                <p className="text-stone-300 text-[11px]">Officials receive simulated government invitation dispatches and set their own passwords via cryptographic tokens.</p>
              </div>
            </div>

            <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
              <div className="text-xs text-stone-400">
                Authenticated Lead: <strong className="text-white">{currentUser?.name || 'Demo Super Administrator'}</strong> ({currentUser?.role || 'super_admin'}) • {currentUser?.email}
              </div>
              {isSuperAdmin ? (
                <button
                  onClick={() => setIsCreatingUser(true)}
                  className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white text-xs font-bold flex items-center space-x-1.5 shadow-md shadow-orange-500/20 transition-all active:scale-95 cursor-pointer"
                >
                  <PlusCircle className="w-4 h-4" />
                  <span>Provision New Official & Send Dispatch</span>
                </button>
              ) : (
                <span className="text-[11px] font-mono px-3 py-1 rounded-full bg-stone-900 text-stone-300 border border-stone-700">
                  🔒 Provisioning Restricted to Central Super Admin
                </span>
              )}
            </div>
          </div>

          {/* Search and Filters Bar */}
          <div className="p-4 rounded-2xl bg-white border border-stone-200 shadow-2xs flex flex-col md:flex-row items-center justify-between gap-3">
            <div className="relative w-full md:w-80">
              <Search className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={userSearchQuery}
                onChange={(e) => setUserSearchQuery(e.target.value)}
                placeholder="Search official by name, email, district..."
                className="w-full pl-9 pr-3 py-2 rounded-xl bg-stone-50 border border-stone-200 text-xs text-stone-900 focus:outline-none focus:border-orange-500 font-medium"
              />
            </div>

            <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
              <div className="flex items-center space-x-1 text-xs text-stone-600">
                <Filter className="w-3.5 h-3.5 text-stone-400" />
                <span className="font-bold">Role:</span>
              </div>
              <select
                value={filterRole}
                onChange={(e) => setFilterRole(e.target.value)}
                className="px-3 py-1.5 rounded-xl bg-stone-50 border border-stone-200 text-xs font-bold text-stone-800 focus:outline-none"
              >
                <option value="all">All Roles</option>
                <option value="super_admin">Super Admin</option>
                <option value="district_collector">District Collector</option>
                <option value="department_engineer">Department Engineer</option>
              </select>

              <select
                value={filterDistrict}
                onChange={(e) => setFilterDistrict(e.target.value)}
                className="px-3 py-1.5 rounded-xl bg-stone-50 border border-stone-200 text-xs font-bold text-stone-800 focus:outline-none"
              >
                <option value="all">All Districts</option>
                <option value="Jehanabad">Jehanabad (Bihar)</option>
                <option value="Dhule">Dhule (MH)</option>
                <option value="Tshwane">Tshwane (South Africa)</option>
                <option value="Recife">Recife (Brazil)</option>
                <option value="national">National / Omniscient</option>
              </select>

              <button
                onClick={fetchUsers}
                className="px-3 py-1.5 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-700 text-xs font-bold flex items-center space-x-1 cursor-pointer"
              >
                <RefreshCw className={`w-3 h-3 ${loadingUsers ? 'animate-spin' : ''}`} />
                <span>Refresh</span>
              </button>
            </div>
          </div>

          {/* User Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredUsers.map((usr) => {
              const isSuper = usr.role === 'super_admin';
              const isCollector = usr.role === 'district_collector';
              const isEngineer = usr.role === 'department_engineer';

              return (
                <div 
                  key={usr.id} 
                  className={`p-5 rounded-3xl border-2 transition-all space-y-4 shadow-sm ${
                    isSuper ? 'bg-purple-50/40 border-purple-200 hover:border-purple-300' :
                    isCollector ? 'bg-orange-50/40 border-orange-200 hover:border-orange-300' :
                    'bg-emerald-50/40 border-emerald-200 hover:border-emerald-300'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-start space-x-3">
                      <div className={`w-10 h-10 rounded-2xl flex items-center justify-center font-bold text-white shrink-0 shadow-xs ${
                        isSuper ? 'bg-purple-600' : isCollector ? 'bg-orange-600' : 'bg-emerald-600'
                      }`}>
                        {isSuper ? '🏛️' : isCollector ? '🏢' : '👷'}
                      </div>
                      <div className="space-y-0.5">
                        <div className="flex items-center space-x-2 flex-wrap">
                          <span className="font-extrabold text-stone-900 text-sm">{usr.name}</span>
                          <span className={`text-[9px] font-mono px-2 py-0.5 rounded-full font-bold uppercase ${
                            isSuper ? 'bg-purple-100 text-purple-900 border border-purple-300' :
                            isCollector ? 'bg-orange-100 text-orange-900 border border-orange-300' :
                            'bg-emerald-100 text-emerald-900 border border-emerald-300'
                          }`}>
                            {usr.role.replace('_', ' ')}
                          </span>
                        </div>
                        <div className="text-xs text-stone-600 font-mono">{usr.email}</div>
                      </div>
                    </div>

                    {isSuperAdmin ? (
                      <button
                        onClick={() => setEditingUser(usr)}
                        className="p-2 rounded-xl bg-white hover:bg-stone-100 text-stone-700 border border-stone-200 transition-all text-xs flex items-center space-x-1 font-bold shadow-2xs shrink-0 cursor-pointer"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                        <span>Configure</span>
                      </button>
                    ) : (
                      <span className="text-[10px] font-mono px-2 py-1 rounded-lg bg-stone-100 text-stone-600 border border-stone-200 font-semibold shrink-0">
                        Scope Fixed
                      </span>
                    )}
                  </div>

                  {/* Metadata and Scopes */}
                  <div className="space-y-2 pt-2 border-t border-stone-200/80 text-xs text-stone-700">
                    <div className="flex items-center justify-between">
                      <span className="text-stone-500 flex items-center space-x-1.5">
                        <MapPin className="w-3.5 h-3.5 text-orange-600" />
                        <span>Territory Scope:</span>
                      </span>
                      <span className="font-bold text-stone-900 bg-white px-2.5 py-0.5 rounded-md border border-stone-200 text-[11px]">
                        {usr.assignedDistrict 
                          ? `${usr.assignedDistrict} (${usr.stateOrProvince || usr.assignedCountry})` 
                          : `Omniscient: All BRICS Member Districts`}
                      </span>
                    </div>

                    {usr.allocatedBudgetUsd && (
                      <div className="flex items-center justify-between">
                        <span className="text-stone-500 flex items-center space-x-1.5">
                          <DollarSign className="w-3.5 h-3.5 text-emerald-600" />
                          <span>Allocated Budget:</span>
                        </span>
                        <span className="font-mono font-bold text-emerald-700 bg-emerald-100/60 px-2 py-0.5 rounded border border-emerald-300 text-[11px]">
                          ${usr.allocatedBudgetUsd.toLocaleString()} USD
                        </span>
                      </div>
                    )}

                    {usr.assignedDepartment && (
                      <div className="flex items-center justify-between">
                        <span className="text-stone-500 flex items-center space-x-1.5">
                          <Building className="w-3.5 h-3.5 text-stone-400" />
                          <span>Department:</span>
                        </span>
                        <span className="font-bold text-stone-800 text-[11px] truncate max-w-[220px]">
                          {usr.assignedDepartment}
                        </span>
                      </div>
                    )}

                    {/* Activation & Password Status */}
                    <div className="flex items-center justify-between pt-1 border-t border-stone-100">
                      <span className="text-stone-500">Security Credentials:</span>
                      {usr.isPasswordSet ? (
                        <span className="inline-flex items-center space-x-1 text-[10px] font-mono font-bold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-full border border-emerald-300">
                          <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                          <span>Active / Password Set</span>
                        </span>
                      ) : (
                        <span className="inline-flex items-center space-x-1 text-[10px] font-mono font-bold text-amber-800 bg-amber-100 px-2 py-0.5 rounded-full border border-amber-300">
                          <Clock className="w-3 h-3 text-amber-600" />
                          <span>Invite Dispatched / Pending</span>
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Action Bar for Invites */}
                  <div className="flex items-center justify-between pt-2 border-t border-stone-200/60 text-[11px]">
                    <span className="text-stone-500 font-mono text-[10px]">ID: {usr.id}</span>
                    
                    {!usr.isPasswordSet && usr.inviteToken && (
                      <button
                        onClick={() => setDispatchedInvite({
                          user: usr,
                          inviteToken: usr.inviteToken!,
                          activationUrl: `/set-password?token=${usr.inviteToken}`
                        })}
                        className="text-orange-700 hover:text-orange-900 font-bold inline-flex items-center space-x-1 underline cursor-pointer"
                      >
                        <Mail className="w-3 h-3" />
                        <span>View Invitation Dispatch Email</span>
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* SIMULATED OFFICIAL GOVERNMENT DISPATCH EMAIL MODAL */}
          {dispatchedInvite && (
            <div className="fixed inset-0 z-50 bg-stone-950/70 backdrop-blur-xs flex items-center justify-center p-4">
              <div className="bg-white rounded-3xl max-w-2xl w-full p-6 sm:p-8 shadow-2xl border-2 border-orange-300 space-y-6 animate-in fade-in zoom-in-95 duration-200">
                
                {/* Modal Header */}
                <div className="flex items-start justify-between border-b border-orange-100 pb-4">
                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 rounded-2xl bg-orange-600 text-white flex items-center justify-center font-bold text-xl shadow-md">
                      🇮🇳
                    </div>
                    <div>
                      <div className="text-[10px] font-mono font-extrabold uppercase tracking-wider text-orange-700 bg-orange-100 px-2.5 py-0.5 rounded-full inline-block mb-1">
                        Sovereign GovTech Mail Gateway
                      </div>
                      <h3 className="font-display font-extrabold text-xl text-stone-900">
                        Official Governance Onboarding Dispatch
                      </h3>
                      <p className="text-xs text-stone-500">
                        Simulated official invitation email dispatched to <strong className="text-stone-800">{dispatchedInvite.user.email}</strong>
                      </p>
                    </div>
                  </div>
                  <button 
                    onClick={() => setDispatchedInvite(null)} 
                    className="p-1.5 rounded-xl text-stone-400 hover:text-stone-700 hover:bg-stone-100 transition-colors"
                  >
                    ✕
                  </button>
                </div>

                {/* Email Body Preview Container */}
                <div className="rounded-2xl bg-stone-50 border-2 border-stone-200 p-5 space-y-4 text-xs text-stone-800">
                  
                  {/* Email Headers */}
                  <div className="space-y-1.5 border-b border-stone-200 pb-3 font-mono text-[11px]">
                    <div className="flex items-center space-x-2">
                      <span className="text-stone-500 font-bold">From:</span>
                      <span className="text-stone-900 font-bold">Central Governance Cell &lt;gautamkr192007@gmail.com&gt;</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className="text-stone-500 font-bold">To:</span>
                      <span className="text-orange-800 font-bold">{dispatchedInvite.user.name} &lt;{dispatchedInvite.user.email}&gt;</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className="text-stone-500 font-bold">Subject:</span>
                      <span className="text-stone-900 font-bold">
                        [OFFICIAL] Governance Delegation & Workspace Activation — {dispatchedInvite.user.assignedDistrict || 'National'} Jurisdiction
                      </span>
                    </div>
                  </div>

                  {/* Letter Body */}
                  <div className="space-y-3 leading-relaxed">
                    <p>Dear <strong>{dispatchedInvite.user.name}</strong>,</p>
                    
                    <p>
                      You have been provisioned in this prototype environment on the <strong>BRICS CivicPulse Sovereign Governance & Infrastructure Platform</strong> by Demo Super Administrator.
                    </p>

                    <div className="p-3.5 rounded-xl bg-white border border-stone-200 space-y-1.5 font-mono text-[11px]">
                      <div><strong>Assigned Role:</strong> {dispatchedInvite.user.role.toUpperCase()}</div>
                      <div><strong>Designated Territory:</strong> {dispatchedInvite.user.assignedDistrict || 'Omniscient (All BRICS Districts)'}</div>
                      <div><strong>Agency:</strong> {dispatchedInvite.user.agency}</div>
                      {dispatchedInvite.user.allocatedBudgetUsd && (
                        <div><strong>Allocated District Budget:</strong> ${dispatchedInvite.user.allocatedBudgetUsd.toLocaleString()} USD</div>
                      )}
                      <div><strong>Invitation Token:</strong> <span className="text-orange-700 font-bold">{dispatchedInvite.inviteToken}</span></div>
                    </div>

                    <p>
                      Please click the activation link below to generate your official password and access your district-scoped grievance triage and policy planning dashboards. This link is cryptographically protected and valid for 48 hours.
                    </p>
                  </div>

                  {/* Direct Activation Link Box */}
                  <div className="p-3 rounded-xl bg-orange-100/60 border border-orange-300 space-y-2">
                    <div className="text-[10px] font-bold text-orange-900 uppercase">Your Personal Activation URL:</div>
                    <div className="font-mono text-xs text-orange-950 font-bold break-all bg-white p-2 rounded-lg border border-orange-200">
                      {typeof window !== 'undefined' ? `${window.location.origin}${dispatchedInvite.activationUrl}` : dispatchedInvite.activationUrl}
                    </div>
                  </div>

                </div>

                {/* Modal Action Buttons */}
                <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
                  <div className="flex items-center space-x-2 w-full sm:w-auto">
                    <button
                      type="button"
                      onClick={() => handleCopy(dispatchedInvite.inviteToken, 'token')}
                      className="px-4 py-2.5 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-800 font-bold text-xs flex items-center space-x-1.5 transition-colors"
                    >
                      {copiedToken ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                      <span>{copiedToken ? 'Token Copied!' : 'Copy Token'}</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => handleCopy(`${window.location.origin}${dispatchedInvite.activationUrl}`, 'url')}
                      className="px-4 py-2.5 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-800 font-bold text-xs flex items-center space-x-1.5 transition-colors"
                    >
                      {copiedUrl ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                      <span>{copiedUrl ? 'Link Copied!' : 'Copy Link'}</span>
                    </button>
                  </div>

                  <a
                    href={dispatchedInvite.activationUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-700 hover:to-amber-700 text-white font-bold text-xs flex items-center justify-center space-x-1.5 shadow-md shadow-orange-600/20 transition-all"
                  >
                    <span>Open Activation Portal Now</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>

              </div>
            </div>
          )}

          {/* Edit User Territory Modal */}
          {editingUser && (
            <div className="fixed inset-0 z-50 bg-stone-950/60 backdrop-blur-xs flex items-center justify-center p-4">
              <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-stone-200 space-y-5 animate-in fade-in zoom-in-95 duration-150">
                <div className="flex items-center justify-between border-b border-stone-100 pb-3">
                  <div>
                    <h3 className="font-display font-extrabold text-lg text-stone-900">Configure Official RBAC Scope</h3>
                    <p className="text-xs text-stone-500">Reassign role, district boundaries, or budget allocations</p>
                  </div>
                  <button onClick={() => setEditingUser(null)} className="p-1 rounded-lg text-stone-400 hover:text-stone-600">✕</button>
                </div>

                <form onSubmit={handleSaveUserEdit} className="space-y-4 text-xs">
                  <div>
                    <label className="font-bold text-stone-700 block mb-1">Official Name</label>
                    <input
                      type="text"
                      value={editingUser.name}
                      onChange={(e) => setEditingUser({ ...editingUser, name: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 focus:outline-hidden focus:border-orange-500 font-medium"
                      required
                    />
                  </div>

                  <div>
                    <label className="font-bold text-stone-700 block mb-1">RBAC Role</label>
                    <select
                      value={editingUser.role}
                      onChange={(e) => setEditingUser({ ...editingUser, role: e.target.value as UserRole })}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 focus:outline-hidden focus:border-orange-500 font-medium bg-white"
                    >
                      <option value="super_admin">Super Admin (Central Multilateral Oversight)</option>
                      <option value="district_collector">District Collector (Jurisdiction Partitioned)</option>
                      <option value="department_engineer">Department Engineer (Technical Domain)</option>
                      <option value="policy_planner">Policy Planner (Multi-Criteria Scenarios)</option>
                      <option value="data_steward">Data Steward (Audit & Governance)</option>
                    </select>
                  </div>

                  <div>
                    <label className="font-bold text-stone-700 block mb-1">Assigned District Territory (Leave empty for All Districts)</label>
                    <input
                      type="text"
                      value={editingUser.assignedDistrict || ''}
                      onChange={(e) => setEditingUser({ ...editingUser, assignedDistrict: e.target.value || undefined })}
                      placeholder="e.g. Jehanabad, Dhule (Dhulia), City of Tshwane"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 focus:outline-hidden focus:border-orange-500 font-medium"
                    />
                  </div>

                  <div>
                    <label className="font-bold text-stone-700 block mb-1">Allocated District Budget ($ USD)</label>
                    <input
                      type="number"
                      value={editingUser.allocatedBudgetUsd || 0}
                      onChange={(e) => setEditingUser({ ...editingUser, allocatedBudgetUsd: Number(e.target.value) })}
                      placeholder="e.g. 1800000"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 focus:outline-hidden focus:border-orange-500 font-medium"
                    />
                  </div>

                  <div>
                    <label className="font-bold text-stone-700 block mb-1">Department Scope (Optional)</label>
                    <input
                      type="text"
                      value={editingUser.assignedDepartment || ''}
                      onChange={(e) => setEditingUser({ ...editingUser, assignedDepartment: e.target.value || undefined })}
                      placeholder="e.g. PHED Water Supply, Roads & Bridges, Power Distribution"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 focus:outline-hidden focus:border-orange-500 font-medium"
                    />
                  </div>

                  <div className="flex items-center justify-end space-x-2 pt-3 border-t border-stone-100">
                    <button
                      type="button"
                      onClick={() => setEditingUser(null)}
                      className="px-4 py-2 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-700 font-bold"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-5 py-2 rounded-xl bg-orange-600 hover:bg-orange-700 text-white font-bold shadow-sm"
                    >
                      Save Scope Updates
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {/* Provision New Official Modal */}
          {isCreatingUser && (
            <div className="fixed inset-0 z-50 bg-stone-950/60 backdrop-blur-xs flex items-center justify-center p-4">
              <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-stone-200 space-y-5 animate-in fade-in zoom-in-95 duration-150">
                <div className="flex items-center justify-between border-b border-stone-100 pb-3">
                  <div>
                    <h3 className="font-display font-extrabold text-lg text-stone-900">Provision & Invite Official</h3>
                    <p className="text-xs text-stone-500">Assign designated district jurisdiction and dispatch activation credentials</p>
                  </div>
                  <button onClick={() => setIsCreatingUser(false)} className="p-1 rounded-lg text-stone-400 hover:text-stone-600">✕</button>
                </div>

                <form onSubmit={handleCreateAndInviteUser} className="space-y-4 text-xs">
                  <div>
                    <label className="font-bold text-stone-700 block mb-1">Official Full Name</label>
                    <input
                      type="text"
                      value={newUserData.name}
                      onChange={(e) => setNewUserData({ ...newUserData, name: e.target.value })}
                      placeholder="e.g. Demo District Authority (Jehanabad)"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 focus:outline-hidden focus:border-orange-500 font-medium"
                      required
                    />
                  </div>

                  <div>
                    <label className="font-bold text-stone-700 block mb-1">Official Email Address</label>
                    <input
                      type="email"
                      value={newUserData.email}
                      onChange={(e) => setNewUserData({ ...newUserData, email: e.target.value })}
                      placeholder="e.g. dm.jehanabad@bihar.gov.in"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 focus:outline-hidden focus:border-orange-500 font-medium"
                      required
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="font-bold text-stone-700 block mb-1">Role</label>
                      <select
                        value={newUserData.role}
                        onChange={(e) => setNewUserData({ ...newUserData, role: e.target.value as UserRole })}
                        className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 focus:outline-hidden focus:border-orange-500 font-medium bg-white"
                      >
                        <option value="district_collector">District Collector</option>
                        <option value="super_admin">Super Admin</option>
                        <option value="department_engineer">Department Engineer</option>
                        <option value="policy_planner">Policy Planner</option>
                      </select>
                    </div>

                    <div>
                      <label className="font-bold text-stone-700 block mb-1">Country</label>
                      <select
                        value={newUserData.assignedCountry}
                        onChange={(e) => setNewUserData({ ...newUserData, assignedCountry: e.target.value })}
                        className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 focus:outline-hidden focus:border-orange-500 font-medium bg-white"
                      >
                        <option value="India">India</option>
                        <option value="South Africa">South Africa</option>
                        <option value="Brazil">Brazil</option>
                        <option value="Russia">Russia</option>
                        <option value="China">China</option>
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="font-bold text-stone-700 block mb-1">State / Province</label>
                      <input
                        type="text"
                        value={newUserData.stateOrProvince}
                        onChange={(e) => setNewUserData({ ...newUserData, stateOrProvince: e.target.value })}
                        placeholder="e.g. Bihar, Maharashtra"
                        className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 focus:outline-hidden focus:border-orange-500 font-medium"
                      />
                    </div>

                    <div>
                      <label className="font-bold text-stone-700 block mb-1">Assigned District</label>
                      <input
                        type="text"
                        value={newUserData.assignedDistrict}
                        onChange={(e) => setNewUserData({ ...newUserData, assignedDistrict: e.target.value })}
                        placeholder="e.g. Jehanabad, Dhule"
                        className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 focus:outline-hidden focus:border-orange-500 font-medium"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="font-bold text-stone-700 block mb-1">Postal / PIN Codes</label>
                      <input
                        type="text"
                        value={newUserData.assignedPincodes}
                        onChange={(e) => setNewUserData({ ...newUserData, assignedPincodes: e.target.value })}
                        placeholder="e.g. 804408, 804417"
                        className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 focus:outline-hidden focus:border-orange-500 font-medium"
                      />
                    </div>

                    <div>
                      <label className="font-bold text-stone-700 block mb-1">Allocated Budget ($ USD)</label>
                      <input
                        type="number"
                        value={newUserData.allocatedBudgetUsd}
                        onChange={(e) => setNewUserData({ ...newUserData, allocatedBudgetUsd: Number(e.target.value) })}
                        placeholder="e.g. 1800000"
                        className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 focus:outline-hidden focus:border-orange-500 font-medium"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="font-bold text-stone-700 block mb-1">Department</label>
                    <input
                      type="text"
                      value={newUserData.assignedDepartment}
                      onChange={(e) => setNewUserData({ ...newUserData, assignedDepartment: e.target.value })}
                      placeholder="e.g. Public Health Engineering & Administration"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 focus:outline-hidden focus:border-orange-500 font-medium"
                    />
                  </div>

                  <div className="flex items-center justify-end space-x-2 pt-3 border-t border-stone-100">
                    <button
                      type="button"
                      onClick={() => setIsCreatingUser(false)}
                      className="px-4 py-2 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-700 font-bold"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-700 hover:to-amber-700 text-white font-bold shadow-md shadow-orange-600/20 flex items-center space-x-1.5 cursor-pointer"
                    >
                      <Send className="w-3.5 h-3.5" />
                      <span>Provision & Generate Dispatch</span>
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </div>
      )}

      {/* SUBTAB 1: MODEL CARDS */}
      {activeSubTab === 'model_cards' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            <div className="p-6 rounded-3xl bg-white border border-stone-200 shadow-sm space-y-4">
              <div className="flex items-center space-x-2 text-xs font-bold text-orange-600 uppercase">
                <FileText className="w-4 h-4" />
                <span>Model Card: CivicPulse Gateway v1.0</span>
              </div>
              <h3 className="font-display font-extrabold text-base text-stone-900">
                Multilingual Intent & Entity Extraction Specifications
              </h3>
              <p className="text-xs text-stone-600 leading-relaxed font-sans">
                Trained to parse noisy spoken audio, code-mixed dialects, and written text across 7 pilot languages into structured public infrastructure categories without hallucinating urgency.
              </p>

              <div className="space-y-2 pt-2 border-t border-stone-100 text-xs">
                <div className="flex justify-between">
                  <span className="text-stone-500">Supported Dialects:</span>
                  <span className="text-stone-900 font-mono font-bold">Hindi, Portuguese, Russian, Mandarin, Swahili, Arabic, English</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-stone-500">Auto-Triage Gate:</span>
                  <span className="text-emerald-700 font-mono font-bold">≥ 85% Confidence</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-stone-500">Uncertainty Flagging:</span>
                  <span className="text-amber-700 font-mono font-bold">&lt; 70% Routes to Human Review</span>
                </div>
              </div>
            </div>

            <div className="p-6 rounded-3xl bg-white border border-red-200 shadow-sm space-y-4">
              <div className="flex items-center space-x-2 text-xs font-bold text-red-600 uppercase">
                <Lock className="w-4 h-4" />
                <span>Safety Boundaries & Prohibited AI Uses (PRD §3.2 & §10.1)</span>
              </div>
              <h3 className="font-display font-extrabold text-base text-stone-900">
                Strict Algorithmic Limits
              </h3>
              
              <ul className="space-y-2 text-xs text-stone-600">
                <li className="flex items-start space-x-2">
                  <span className="text-red-500 font-bold">✕</span>
                  <span>AI must NOT autonomously approve tenders, procurement, or funds.</span>
                </li>
                <li className="flex items-start space-x-2">
                  <span className="text-red-500 font-bold">✕</span>
                  <span>AI must NOT infer political affiliation or assign secret citizen credit/risk scores.</span>
                </li>
                <li className="flex items-start space-x-2">
                  <span className="text-red-500 font-bold">✕</span>
                  <span>No exact home coordinates exposed publicly; minimum 300m spatial cell aggregation.</span>
                </li>
              </ul>
            </div>

          </div>

          {/* PRD Section 10.3 Stratified Language Evaluation Matrix */}
          <div className="p-6 rounded-3xl bg-white border border-stone-200 shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-stone-200 pb-3">
              <h3 className="text-sm font-display font-extrabold text-stone-900 flex items-center space-x-2">
                <span>Stratified Dialect & Linguistic Parity Matrix (PRD §10.3)</span>
                <span className="text-[10px] font-mono bg-emerald-50 text-emerald-800 px-2 py-0.5 rounded border border-emerald-200 font-bold">
                  Zero Linguistic Disparity
                </span>
              </h3>
              <span className="text-[11px] text-stone-500 font-mono">Sample Size: n=1,450 audio/text clips</span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-stone-200 text-[11px] font-mono text-stone-500 uppercase">
                    <th className="py-2.5">Language / Region</th>
                    <th className="py-2.5">Dialects Tested</th>
                    <th className="py-2.5">Entity Extraction Precision</th>
                    <th className="py-2.5">WER (Spoken Audio)</th>
                    <th className="py-2.5">Human Acceptance Rate</th>
                    <th className="py-2.5">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-100 font-sans">
                  <tr>
                    <td className="py-2.5 font-bold text-stone-900">🇮🇳 Hindi / Hinglish</td>
                    <td className="py-2.5 text-stone-600">Bhojpuri, Khari Boli, Urban Hinglish</td>
                    <td className="py-2.5 font-mono font-bold text-emerald-700">96.4%</td>
                    <td className="py-2.5 font-mono text-stone-600">8.2%</td>
                    <td className="py-2.5 font-mono font-bold text-emerald-700">94.8% (Target ≥90%)</td>
                    <td className="py-2.5"><span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 text-[10px] font-bold">PASSED</span></td>
                  </tr>
                  <tr>
                    <td className="py-2.5 font-bold text-stone-900">🇿🇦 South Africa (Zulu, Xhosa, En)</td>
                    <td className="py-2.5 text-stone-600">Soshanguve urban dialect, Sepedi mix</td>
                    <td className="py-2.5 font-mono font-bold text-emerald-700">95.1%</td>
                    <td className="py-2.5 font-mono text-stone-600">9.1%</td>
                    <td className="py-2.5 font-mono font-bold text-emerald-700">93.2% (Target ≥90%)</td>
                    <td className="py-2.5"><span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 text-[10px] font-bold">PASSED</span></td>
                  </tr>
                  <tr>
                    <td className="py-2.5 font-bold text-stone-900">🇧🇷 Portuguese (BR)</td>
                    <td className="py-2.5 text-stone-600">Nordestino, Paulistano informal</td>
                    <td className="py-2.5 font-mono font-bold text-emerald-700">97.8%</td>
                    <td className="py-2.5 font-mono text-stone-600">6.4%</td>
                    <td className="py-2.5 font-mono font-bold text-emerald-700">96.5% (Target ≥90%)</td>
                    <td className="py-2.5"><span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 text-[10px] font-bold">PASSED</span></td>
                  </tr>
                  <tr>
                    <td className="py-2.5 font-bold text-stone-900">🇷🇺 Russian</td>
                    <td className="py-2.5 text-stone-600">Urals regional vernacular</td>
                    <td className="py-2.5 font-mono font-bold text-emerald-700">96.0%</td>
                    <td className="py-2.5 font-mono text-stone-600">7.8%</td>
                    <td className="py-2.5 font-mono font-bold text-emerald-700">95.1% (Target ≥90%)</td>
                    <td className="py-2.5"><span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 text-[10px] font-bold">PASSED</span></td>
                  </tr>
                  <tr>
                    <td className="py-2.5 font-bold text-stone-900">🇨🇳 Mandarin</td>
                    <td className="py-2.5 text-stone-600">Sichuanese colloquial expressions</td>
                    <td className="py-2.5 font-mono font-bold text-emerald-700">98.2%</td>
                    <td className="py-2.5 font-mono text-stone-600">5.9%</td>
                    <td className="py-2.5 font-mono font-bold text-emerald-700">97.0% (Target ≥90%)</td>
                    <td className="py-2.5"><span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 text-[10px] font-bold">PASSED</span></td>
                  </tr>
                  <tr>
                    <td className="py-2.5 font-bold text-stone-900">🇪🇬 Arabic</td>
                    <td className="py-2.5 text-stone-600">Egyptian Ammiya rural syntax</td>
                    <td className="py-2.5 font-mono font-bold text-emerald-700">94.7%</td>
                    <td className="py-2.5 font-mono text-stone-600">9.8%</td>
                    <td className="py-2.5 font-mono font-bold text-emerald-700">92.4% (Target ≥90%)</td>
                    <td className="py-2.5"><span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 text-[10px] font-bold">PASSED</span></td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* SUBTAB: MEASUREMENT FRAMEWORK (PRD SECTION 11) */}
      {activeSubTab === 'metrics_framework' && (
        <div className="rounded-3xl bg-white border border-stone-200 shadow-sm p-6 sm:p-8 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-stone-200 pb-4">
            <div>
              <div className="inline-flex items-center space-x-2 text-[10px] font-mono text-orange-700 font-bold uppercase bg-orange-100 px-2.5 py-0.5 rounded border border-orange-300 mb-1">
                <span>PRD Section 11 Evaluation Framework</span>
              </div>
              <h2 className="text-xl font-display font-extrabold text-stone-900">
                8 Core Product & Pilot Target Metrics
              </h2>
            </div>
            <span className="text-xs font-mono text-emerald-700 font-bold bg-emerald-50 px-3 py-1 rounded-xl border border-emerald-200">
              ● 8 of 8 Metrics Meeting or Exceeding Targets
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-4 rounded-2xl bg-stone-50 border border-stone-200 space-y-2">
              <span className="text-[10px] font-mono uppercase text-stone-500 font-bold">1. Usable Submission Rate</span>
              <div className="text-xl font-display font-extrabold text-stone-900">91.4%</div>
              <div className="text-xs text-emerald-700 font-bold font-mono">Pilot Target: ≥85%</div>
              <div className="text-[10px] text-stone-500">Method: Started-to-completed journey</div>
            </div>

            <div className="p-4 rounded-2xl bg-stone-50 border border-stone-200 space-y-2">
              <span className="text-[10px] font-mono uppercase text-stone-500 font-bold">2. Median Signal Time</span>
              <div className="text-xl font-display font-extrabold text-stone-900">4.2 Hours</div>
              <div className="text-xs text-emerald-700 font-bold font-mono">Pilot Target: &lt;24 hours</div>
              <div className="text-[10px] text-stone-500">Method: Intake to geocoded record</div>
            </div>

            <div className="p-4 rounded-2xl bg-stone-50 border border-stone-200 space-y-2">
              <span className="text-[10px] font-mono uppercase text-stone-500 font-bold">3. Language Quality</span>
              <div className="text-xl font-display font-extrabold text-stone-900">94.8%</div>
              <div className="text-xs text-emerald-700 font-bold font-mono">Pilot Target: ≥90% accepted</div>
              <div className="text-[10px] text-stone-500">Method: Stratified human-review sample</div>
            </div>

            <div className="p-4 rounded-2xl bg-stone-50 border border-stone-200 space-y-2">
              <span className="text-[10px] font-mono uppercase text-stone-500 font-bold">4. Cluster Precision</span>
              <div className="text-xl font-display font-extrabold text-stone-900">88.5%</div>
              <div className="text-xs text-emerald-700 font-bold font-mono">Pilot Target: ≥80%</div>
              <div className="text-[10px] text-stone-500">Method: Sampled merge/split audit</div>
            </div>

            <div className="p-4 rounded-2xl bg-stone-50 border border-stone-200 space-y-2">
              <span className="text-[10px] font-mono uppercase text-stone-500 font-bold">5. Planner Adoption</span>
              <div className="text-xl font-display font-extrabold text-stone-900">82.0% Weekly</div>
              <div className="text-xs text-emerald-700 font-bold font-mono">Pilot Target: ≥70% weekly</div>
              <div className="text-[10px] text-stone-500">Method: Active planner cohort tasks</div>
            </div>

            <div className="p-4 rounded-2xl bg-stone-50 border border-stone-200 space-y-2">
              <span className="text-[10px] font-mono uppercase text-stone-500 font-bold">6. Traceability</span>
              <div className="text-xl font-display font-extrabold text-emerald-700">100.0%</div>
              <div className="text-xs text-emerald-700 font-bold font-mono">Pilot Target: 100%</div>
              <div className="text-[10px] text-stone-500">Method: Recommendation evidence audit</div>
            </div>

            <div className="p-4 rounded-2xl bg-stone-50 border border-stone-200 space-y-2">
              <span className="text-[10px] font-mono uppercase text-stone-500 font-bold">7. Acknowledgement</span>
              <div className="text-xl font-display font-extrabold text-stone-900">97.2% in 48h</div>
              <div className="text-xs text-emerald-700 font-bold font-mono">Pilot Target: ≥90% in 48h</div>
              <div className="text-[10px] text-stone-500">Method: Delivery logs & SMS receipts</div>
            </div>

            <div className="p-4 rounded-2xl bg-stone-50 border border-stone-200 space-y-2">
              <span className="text-[10px] font-mono uppercase text-stone-500 font-bold">8. Outcome Coverage</span>
              <div className="text-xl font-display font-extrabold text-stone-900">3 Live Projects</div>
              <div className="text-xs text-emerald-700 font-bold font-mono">Pilot Target: ≥1 live project</div>
              <div className="text-[10px] text-stone-500">Method: Baseline vs target actuals</div>
            </div>
          </div>
        </div>
      )}

      {/* SUBTAB: READINESS CHECKLIST (PRD SECTION 4.1 & SECTION 15) */}
      {activeSubTab === 'readiness_gates' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="p-6 rounded-3xl bg-white border border-stone-200 shadow-sm space-y-4">
            <div className="flex items-center space-x-2 text-xs font-bold text-orange-600 uppercase">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>Section 4.1 Go/No-Go Decision Gates</span>
            </div>
            <h3 className="font-display font-extrabold text-base text-stone-900">
              Pilot Go/No-Go Evaluation Gates
            </h3>

            <div className="space-y-3 text-xs">
              <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-200 space-y-1">
                <div className="flex items-center justify-between font-bold text-emerald-900">
                  <span>1. Safe Intake Gate</span>
                  <span className="text-[10px] font-mono bg-emerald-200 text-emerald-900 px-2 py-0.5 rounded">PASSED</span>
                </div>
                <p className="text-emerald-800 text-[11px]">Consent, access scopes, retention and 300m spatial privacy passed audit.</p>
              </div>

              <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-200 space-y-1">
                <div className="flex items-center justify-between font-bold text-emerald-900">
                  <span>2. Signal Quality Gate</span>
                  <span className="text-[10px] font-mono bg-emerald-200 text-emerald-900 px-2 py-0.5 rounded">PASSED</span>
                </div>
                <p className="text-emerald-800 text-[11px]">94.8% human acceptance across Hindi, Zulu, Portuguese, Russian, Mandarin & Arabic.</p>
              </div>

              <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-200 space-y-1">
                <div className="flex items-center justify-between font-bold text-emerald-900">
                  <span>3. Planner Usefulness Gate</span>
                  <span className="text-[10px] font-mono bg-emerald-200 text-emerald-900 px-2 py-0.5 rounded">PASSED</span>
                </div>
                <p className="text-emerald-800 text-[11px]">Planners prioritize candidate projects 4x faster with transparent multi-criteria breakdown.</p>
              </div>

              <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-200 space-y-1">
                <div className="flex items-center justify-between font-bold text-emerald-900">
                  <span>4. Equity Coverage Gate</span>
                  <span className="text-[10px] font-mono bg-emerald-200 text-emerald-900 px-2 py-0.5 rounded">PASSED</span>
                </div>
                <p className="text-emerald-800 text-[11px]">2G USSD & assisted desk ensure offline and underserved communities are represented.</p>
              </div>

              <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-200 space-y-1">
                <div className="flex items-center justify-between font-bold text-emerald-900">
                  <span>5. Impact Loop Gate</span>
                  <span className="text-[10px] font-mono bg-emerald-200 text-emerald-900 px-2 py-0.5 rounded">PASSED</span>
                </div>
                <p className="text-emerald-800 text-[11px]">Water pipeline project demonstrates 40% fewer dry points with verified resident reviews.</p>
              </div>
            </div>
          </div>

          <div className="p-6 rounded-3xl bg-white border border-stone-200 shadow-sm space-y-4">
            <div className="flex items-center space-x-2 text-xs font-bold text-orange-600 uppercase">
              <ShieldCheck className="w-4 h-4 text-orange-600" />
              <span>Section 15 Final Readiness Checklist</span>
            </div>
            <h3 className="font-display font-extrabold text-base text-stone-900">
              Pre-Pilot & Pre-Scale Readiness
            </h3>

            <div className="space-y-2 text-xs">
              {[
                { label: 'Pilot geography, categories (Water, Roads, Connectivity) approved', checked: true },
                { label: 'Data sources have owners, licenses, refresh rules and quality ratings', checked: true },
                { label: 'Designed as a Digital Public Good with Section 8 privacy notices active', checked: true },
                { label: 'Government roles, access scopes and territory RBAC configured', checked: true },
                { label: 'Human review queue staffed and escalation policy tested', checked: true },
                { label: 'AI evaluation passed across 7 BRICS languages & channels', checked: true },
                { label: 'Accessibility Target: WCAG 2.2 AA compliant for citizen flows', checked: true },
                { label: 'Threat model, rate limiting & session protection verified', checked: true },
                { label: 'Incident, support and rollback runbooks published', checked: true },
                { label: 'Baseline metrics and measurement owners confirmed in registry', checked: true }
              ].map((item, idx) => (
                <div key={idx} className="flex items-center space-x-2.5 p-2 rounded-lg bg-stone-50 border border-stone-100">
                  <div className="w-4 h-4 rounded bg-emerald-600 text-white flex items-center justify-center font-bold text-[10px]">
                    ✓
                  </div>
                  <span className="text-stone-800 font-medium">{item.label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* SUBTAB 2: SWITCHBOARD TELEMETRY */}
      {activeSubTab === 'switchboard' && (
        <div className="rounded-3xl bg-white border border-stone-200 shadow-sm p-6 sm:p-8 space-y-6">
          <div className="flex items-center justify-between border-b border-stone-200 pb-4">
            <div className="flex items-center space-x-2 text-xs font-bold text-orange-600">
              <Zap className="w-4 h-4" />
              <span>AI Multi-Agent Gateway Failover Status</span>
            </div>
            <span className="text-[11px] text-stone-500 font-mono font-bold">
              Automatic Cascade on 429 Rate Limits
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {providers.map((p) => (
              <div key={p.id} className="p-4 rounded-2xl bg-stone-50 border border-stone-200 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-xs text-stone-900">{p.name}</span>
                  <span className={`w-2 h-2 rounded-full ${p.isHealthy ? 'bg-emerald-500 animate-pulse' : 'bg-stone-400'}`} />
                </div>
                <div className="text-[11px] font-mono text-stone-600">{p.modelName}</div>
                <div className="flex items-center justify-between text-[10px] font-mono pt-2 border-t border-stone-200">
                  <span className="text-stone-500">Latency:</span>
                  <span className="text-emerald-700 font-bold">{p.latencyMs}ms</span>
                </div>
              </div>
            ))}
          </div>

          <div className="p-4 rounded-2xl bg-orange-50 border border-orange-200 text-xs text-orange-950 flex items-start space-x-3">
            <ShieldCheck className="w-5 h-5 text-orange-600 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <span className="font-bold text-stone-900">Server-Side Enterprise Security:</span>
              <p className="text-[11px] text-stone-700 leading-relaxed">
                All AI keys (Google Gemini, Groq, OpenRouter) and your Neon Database URL are managed securely in <span className="font-mono text-stone-900 font-bold">.env.local</span> on your server to prevent unauthorized client access or token leaks.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* SUBTAB 3: DATABASE SCHEMA */}
      {activeSubTab === 'database' && (
        <div className="rounded-3xl bg-white border border-stone-200 shadow-sm p-6 sm:p-8 space-y-4">
          <div className="flex items-center justify-between border-b border-stone-200 pb-4">
            <div className="flex items-center space-x-2 text-xs font-bold text-emerald-700">
              <Database className="w-4 h-4" />
              <span>Neon PostgreSQL Serverless Architecture</span>
            </div>
            <span className={`text-[10px] font-mono px-3 py-1 rounded-full font-bold ${dbInfo.isNeonConnected ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' : 'bg-amber-50 text-amber-800 border border-amber-200'}`}>
              {dbInfo.isNeonConnected ? 'Neon Connected' : 'Resilient In-Memory Mode'}
            </span>
          </div>

          <p className="text-xs text-stone-600">
            {dbInfo.message || 'Connected and operational. Standard PostgreSQL DDL tables with geospatial indexing ready.'}
          </p>

          <div className="p-4 rounded-2xl bg-stone-900 border border-stone-800 text-xs font-mono text-amber-200 overflow-x-auto max-h-72">
            <pre>{`-- Active Tables:
1. citizen_submissions (id, reference_code, category, urgency, location, ai_confidence_score, status)
2. demand_clusters (id, cluster_code, title, domain, severity_score, affected_population, cost_usd)
3. infrastructure_indicators (id, name, domain, district, current_value, target_value)
4. candidate_recommendations (id, title, domain, composite_score, budget_usd, approved_status)
5. policy_scenarios (id, name, budget_cap_usd, weights, equity_coverage_score)
6. project_registry (id, project_code, title, allocated_budget_usd, milestones, live_status)
7. audit_logs (id, timestamp, actor, action, target_entity, details)`}</pre>
          </div>
        </div>
      )}

      {/* SUBTAB 4: AUDIT LOGS */}
      {activeSubTab === 'audit_logs' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between text-xs text-stone-600 font-bold">
            <span>Tamper-Evident Governance Logs ({auditLogs.length})</span>
            <span className="text-[11px] font-mono text-emerald-700">Immutable Audit Trail</span>
          </div>

          <div className="space-y-2.5">
            {auditLogs.map((log) => (
              <div key={log.id} className="p-4 rounded-2xl bg-white border border-stone-200 shadow-2xs text-xs space-y-1 font-mono">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <span className="font-extrabold text-orange-600">{log.action}</span>
                    <span className="text-stone-700 font-semibold">• {log.targetEntity}</span>
                  </div>
                  <span className="text-stone-400 text-[10px]">{new Date(log.timestamp).toLocaleString()}</span>
                </div>
                <div className="text-stone-800 font-sans font-medium">{log.details}</div>
                <div className="text-[10px] text-stone-500 pt-1">
                  Actor: <strong className="text-stone-900">{log.actor}</strong> ({log.role}) {log.aiProviderUsed && `• AI: ${log.aiProviderUsed}`}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

    </div>
  );
}
