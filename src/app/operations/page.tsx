'use client';

import React, { useState, useEffect } from 'react';
import { 
  Layers, 
  Search, 
  Filter, 
  CheckCircle2, 
  AlertTriangle, 
  Clock, 
  MapPin, 
  Sparkles, 
  Edit3, 
  Share2, 
  UserCheck, 
  ArrowRight, 
  Building2, 
  Volume2, 
  ShieldAlert,
  ShieldCheck,
  ChevronRight, 
  RefreshCw, 
  Eye, 
  Check 
} from 'lucide-react';
import { CitizenSubmission, InfrastructureDomain, SubmissionStatus, UrgencyLevel } from '@/types';
import { SEED_SUBMISSIONS, SEED_CLUSTERS } from '@/data/seed-data';
import { useAuth } from '@/context/AuthContext';

export default function OperationsPage() {
  const { user, isSuperAdmin, isDistrictCollector, isDepartmentEngineer, assignedDistrict, assignedDepartment: userAssignedDepartment } = useAuth();
  const isOfficial = Boolean(user && user.role !== 'citizen');

  const [submissions, setSubmissions] = useState<CitizenSubmission[]>(SEED_SUBMISSIONS);
  const [selectedSub, setSelectedSub] = useState<CitizenSubmission | null>(SEED_SUBMISSIONS[0]);
  const [filterDomain, setFilterDomain] = useState<InfrastructureDomain | 'all'>('all');
  const [filterUrgency, setFilterUrgency] = useState<UrgencyLevel | 'all'>('all');
  const [filterStatus, setFilterStatus] = useState<SubmissionStatus | 'all'>('all');
  const [filterDistrictOverride, setFilterDistrictOverride] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(false);

  // Editable fields for human correction
  const [editedCategory, setEditedCategory] = useState<InfrastructureDomain>('water');
  const [editedSubcategory, setEditedSubcategory] = useState('');
  const [editedUrgency, setEditedUrgency] = useState<UrgencyLevel>('high');
  const [assignedDepartment, setAssignedDepartment] = useState('');
  const [resolutionNotes, setResolutionNotes] = useState('');
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);

  useEffect(() => {
    fetchSubmissions();
  }, []);

  async function fetchSubmissions() {
    setLoading(true);
    try {
      const res = await fetch('/api/submissions');
      if (res.ok) {
        const data: CitizenSubmission[] = await res.json();
        setSubmissions(data);
        if (data.length > 0 && !selectedSub) {
          selectSubmission(data[0]);
        }
      }
    } catch (e) {
    } finally {
      setLoading(false);
    }
  }

  function selectSubmission(sub: CitizenSubmission) {
    setSelectedSub(sub);
    setEditedCategory(sub.category);
    setEditedSubcategory(sub.subcategory);
    setEditedUrgency(sub.urgency);
    setAssignedDepartment(sub.assignedDepartment || 'Department of Public Works');
    setResolutionNotes(sub.resolutionNotes || '');
    setActionSuccess(null);
  }

  const handleUpdateStatus = async (newStatus: SubmissionStatus) => {
    if (!selectedSub) return;
    try {
      const res = await fetch(`/api/submissions/${selectedSub.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status: newStatus,
          assignedDepartment,
          resolutionNotes,
          actor: 'District Operations Officer (Triage Lead)',
        }),
      });

      if (res.ok) {
        const updated = await res.json();
        setSelectedSub(updated);
        setSubmissions(prev => prev.map(s => s.id === updated.id ? updated : s));
        setActionSuccess(`Submission marked as ${newStatus.toUpperCase()}`);
        setTimeout(() => setActionSuccess(null), 3000);
      }
    } catch (e) {
      alert('Failed to update submission');
    }
  };

  const handleSaveCorrection = async () => {
    if (!selectedSub) return;
    try {
      const res = await fetch(`/api/submissions/${selectedSub.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          category: editedCategory,
          subcategory: editedSubcategory,
          urgency: editedUrgency,
          assignedDepartment,
          resolutionNotes,
          actor: 'District Operations Officer (Triage Lead)',
        }),
      });

      if (res.ok) {
        const updated = await res.json();
        setSelectedSub(updated);
        setSubmissions(prev => prev.map(s => s.id === updated.id ? updated : s));
        setActionSuccess('Human-in-the-loop correction recorded & audit logged');
        setTimeout(() => setActionSuccess(null), 3000);
      }
    } catch (e) {
      alert('Failed to save correction');
    }
  };

  const filtered = submissions.filter(s => {
    // 1. Enforce District Collector Territory Scope
    if (isDistrictCollector && assignedDistrict) {
      const dLower = assignedDistrict.toLowerCase();
      const sDistLower = s.location.district.toLowerCase();
      if (!sDistLower.includes(dLower) && !dLower.includes(sDistLower)) {
        return false;
      }
    }

    // 2. Enforce Department Engineer Scope
    if (isDepartmentEngineer && userAssignedDepartment) {
      const deptLower = userAssignedDepartment.toLowerCase();
      const sDept = (s.assignedDepartment || '').toLowerCase();
      const sCat = s.category.toLowerCase();
      if (!sDept.includes(deptLower) && !sCat.includes(deptLower) && !deptLower.includes(sCat)) {
        return false;
      }
    }

    // 3. Super Admin / Manual District Override Filter
    if (filterDistrictOverride !== 'all') {
      const oLower = filterDistrictOverride.toLowerCase();
      if (!s.location.district.toLowerCase().includes(oLower)) {
        return false;
      }
    }

    if (filterDomain !== 'all' && s.category !== filterDomain) return false;
    if (filterUrgency !== 'all' && s.urgency !== filterUrgency) return false;
    if (filterStatus !== 'all' && s.status !== filterStatus) return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      return s.referenceCode.toLowerCase().includes(q) || 
             s.rawInput.toLowerCase().includes(q) || 
             s.location.district.toLowerCase().includes(q);
    }
    return true;
  });

  // Ensure selectedSub belongs to filtered results
  useEffect(() => {
    if (filtered.length > 0) {
      if (!selectedSub || !filtered.some(s => s.id === selectedSub.id)) {
        selectSubmission(filtered[0]);
      }
    } else {
      setSelectedSub(null);
    }
  }, [filtered.length, assignedDistrict, userAssignedDepartment, filterDistrictOverride, filterDomain, filterUrgency, filterStatus]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6 text-stone-900">
      
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-stone-200 pb-4">
        <div>
          <div className="inline-flex items-center space-x-2 text-xs font-mono text-orange-600 font-bold mb-1 bg-orange-50 px-2.5 py-0.5 rounded-full border border-orange-200">
            <span>FR-03, FR-04, FR-05 & FR-13 Operations Console</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-display font-extrabold text-stone-900">
            Operations Triage & Deduplication Desk
          </h1>
          <p className="text-xs text-stone-600">
            Verify AI entity extractions, manage deduplication clusters, and route citizen demands to accountable municipal departments.
          </p>
        </div>

        <button
          onClick={fetchSubmissions}
          disabled={loading}
          className="flex items-center space-x-1.5 px-4 py-2 rounded-xl bg-white hover:bg-stone-50 border border-stone-200 text-xs text-stone-800 font-bold transition-all shadow-2xs self-start md:self-auto"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          <span>Refresh Queue</span>
        </button>
      </div>

      {/* Territory Jurisdiction & RBAC Security Scope Banner */}
      <div className={`p-4 rounded-2xl border-2 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-2xs ${
        isDistrictCollector ? 'bg-orange-50/90 border-orange-300 text-orange-950' :
        isSuperAdmin ? 'bg-purple-50/90 border-purple-300 text-purple-950' :
        'bg-emerald-50/90 border-emerald-300 text-emerald-950'
      }`}>
        <div className="flex items-center space-x-3">
          <div className={`p-2 rounded-xl text-white ${
            isDistrictCollector ? 'bg-orange-600' :
            isSuperAdmin ? 'bg-purple-600' :
            'bg-emerald-600'
          }`}>
            <MapPin className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="text-xs font-extrabold font-display">
                {isDistrictCollector ? `📍 Collector Jurisdiction: ${assignedDistrict}` :
                 isSuperAdmin ? '🏛️ Central Government Oversight: All BRICS Member Districts' :
                 `👷 Department Authority Scope: ${assignedDepartment || 'Field Operations'}`}
              </span>
              <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-white border border-stone-200 uppercase">
                {user ? user.role.replace('_', ' ') : 'DEMO MODE'}
              </span>
            </div>
            <p className="text-[11px] opacity-80 mt-0.5 font-medium">
              {isDistrictCollector ? `Data is strictly partitioned to ${assignedDistrict}. Unauthorized cross-district access is blocked by RBAC.` :
               isSuperAdmin ? 'Super Admin can inspect all national pilot territories and reassign collector jurisdictions in Governance.' :
               'Viewing assigned department repair work orders.'}
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-2 shrink-0">
          <span className="font-mono text-xs font-extrabold bg-white px-3 py-1 rounded-xl border border-stone-300 shadow-2xs">
            {filtered.length} Active Complaints in Scope
          </span>
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-4 rounded-2xl bg-white border border-stone-200 shadow-sm text-xs">
        
        {/* Search */}
        <div className="flex items-center space-x-2 bg-stone-50 px-3.5 py-2 rounded-xl border border-stone-200 w-full sm:w-72">
          <Search className="w-4 h-4 text-orange-500" />
          <input
            type="text"
            placeholder="Search ref ID, text, district..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="bg-transparent text-stone-900 text-xs focus:outline-none w-full placeholder:text-stone-400 font-medium"
          />
        </div>

        {/* Super Admin District Filter Selector */}
        {isSuperAdmin && (
          <div className="flex items-center space-x-1.5">
            <span className="text-stone-700 font-bold">District Scope:</span>
            <select
              value={filterDistrictOverride}
              onChange={(e) => setFilterDistrictOverride(e.target.value)}
              className="bg-purple-50 border border-purple-300 px-3 py-2 rounded-xl text-xs text-purple-950 font-bold focus:outline-none focus:border-purple-500"
            >
              <option value="all">🌐 All BRICS Districts</option>
              <option value="Dhule">🇮🇳 Dhule District (India)</option>
              <option value="Tshwane">🇿🇦 City of Tshwane (South Africa)</option>
              <option value="Recife">🇧🇷 Recife Metropolitan (Brazil)</option>
              <option value="Kazan">🇷🇺 Kazan Urban District (Russia)</option>
              <option value="Chengdu">🇨🇳 Chengdu Rural Belt (China)</option>
            </select>
          </div>
        )}

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-2">
          <select
            value={filterDomain}
            onChange={(e) => setFilterDomain(e.target.value as any)}
            className="bg-stone-50 border border-stone-200 px-3 py-2 rounded-xl text-xs text-stone-800 font-semibold focus:outline-none focus:border-orange-500"
          >
            <option value="all">All Domains</option>
            <option value="water">💧 Water</option>
            <option value="roads">🚗 Roads</option>
            <option value="connectivity">📶 Connectivity</option>
          </select>

          <select
            value={filterUrgency}
            onChange={(e) => setFilterUrgency(e.target.value as any)}
            className="bg-stone-50 border border-stone-200 px-3 py-2 rounded-xl text-xs text-stone-800 font-semibold focus:outline-none focus:border-orange-500"
          >
            <option value="all">All Urgency</option>
            <option value="critical">🔴 Critical</option>
            <option value="high">🟠 High</option>
            <option value="medium">🟡 Medium</option>
            <option value="low">🟢 Low</option>
          </select>

          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value as any)}
            className="bg-stone-50 border border-stone-200 px-3 py-2 rounded-xl text-xs text-stone-800 font-semibold focus:outline-none focus:border-orange-500"
          >
            <option value="all">All Statuses</option>
            <option value="submitted">Submitted</option>
            <option value="triaged">Triaged</option>
            <option value="verified">Verified</option>
            <option value="clustered">Clustered</option>
            <option value="in_progress">In Progress</option>
            <option value="resolved">Resolved</option>
          </select>
        </div>

      </div>

      {/* Split View Console */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Column: Triage Queue (5 cols) */}
        <div className="lg:col-span-5 space-y-3">
          <div className="flex items-center justify-between text-xs text-stone-600 font-bold px-1">
            <span>Incoming Triage Queue ({filtered.length})</span>
            <span className="text-[11px] font-mono text-emerald-600">SLA: 94% on-track</span>
          </div>

          <div className="space-y-3 max-h-[720px] overflow-y-auto pr-1">
            {filtered.map((sub) => {
              const isSelected = selectedSub?.id === sub.id;
              return (
                <div
                  key={sub.id}
                  onClick={() => selectSubmission(sub)}
                  className={`p-4 rounded-2xl border transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-orange-50/90 border-orange-400 shadow-sm'
                      : 'bg-white border-stone-200 hover:border-orange-300 hover:bg-stone-50/80 shadow-2xs'
                  }`}
                >
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center space-x-1.5">
                      <span className="font-mono font-extrabold text-xs text-stone-900">
                        {sub.referenceCode}
                      </span>
                      {sub.isAssisted && (
                        <span className="px-1.5 py-0.2 rounded-full bg-purple-50 text-purple-700 text-[10px] font-mono font-bold border border-purple-200">
                          Assisted
                        </span>
                      )}
                    </div>
                    <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase ${
                      sub.urgency === 'critical' ? 'bg-red-50 text-red-700 border border-red-200' :
                      sub.urgency === 'high' ? 'bg-amber-50 text-amber-700 border border-amber-200' :
                      'bg-blue-50 text-blue-700 border border-blue-200'
                    }`}>
                      {sub.urgency}
                    </span>
                  </div>

                  <h4 className="text-xs font-bold text-stone-900 mt-1.5 line-clamp-1">
                    {sub.subcategory}
                  </h4>

                  <p className="text-xs text-stone-600 mt-1 line-clamp-2 leading-relaxed font-sans">
                    {sub.translatedText || sub.rawInput}
                  </p>

                  <div className="flex items-center justify-between text-[11px] text-stone-500 font-mono mt-2 pt-2 border-t border-stone-100">
                    <span className="flex items-center space-x-1">
                      <MapPin className="w-3 h-3 text-orange-500" />
                      <span className="text-stone-800 font-bold">{sub.location.district}</span>
                      <span className="text-orange-700 font-bold">({sub.location.pincode || '424001'})</span>
                    </span>
                    <span className="text-orange-600 font-bold">
                      AI Conf: {(sub.aiConfidenceScore * 100).toFixed(0)}%
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Column: Detailed Record & Human Actions (7 cols) */}
        <div className="lg:col-span-7">
          {selectedSub ? (
            <div className="rounded-3xl bg-white border border-stone-200 shadow-sm p-6 sm:p-8 space-y-6 animate-in fade-in duration-150">
              
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-stone-200 pb-4">
                <div>
                  <div className="flex items-center space-x-2">
                    <span className="font-mono font-extrabold text-base text-orange-600">
                      {selectedSub.referenceCode}
                    </span>
                    <span className="text-xs px-2.5 py-0.5 rounded-full bg-stone-100 text-stone-700 font-mono font-bold uppercase border border-stone-200">
                      Channel: {selectedSub.channel}
                    </span>
                  </div>
                  <p className="text-xs text-stone-500 mt-1">
                    Ingested: {new Date(selectedSub.timestamp).toLocaleString()} • Language: <span className="uppercase font-mono font-bold text-stone-800">{selectedSub.language}</span>
                  </p>
                </div>

                <div className="flex items-center space-x-2">
                  <span className="text-xs text-stone-500">Status:</span>
                  <span className="text-xs font-mono font-extrabold px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 uppercase">
                    {selectedSub.status}
                  </span>
                </div>
              </div>

              {/* Location & GPS Badge Row */}
              <div className="p-4 rounded-2xl bg-orange-50/60 border border-orange-200 flex flex-wrap items-center justify-between gap-3 text-xs">
                <div className="flex items-center space-x-2">
                  <MapPin className="w-4 h-4 text-orange-600 shrink-0" />
                  <span className="font-bold text-stone-900">
                    {selectedSub.location.district}, {selectedSub.location.country}
                  </span>
                  <span className="font-mono font-extrabold text-orange-800 bg-white px-2 py-0.5 rounded border border-orange-200">
                    PIN: {selectedSub.location.pincode || '424001'}
                  </span>
                </div>
                <div className="font-mono text-[11px] text-stone-600 bg-white px-2.5 py-1 rounded-xl border border-stone-200">
                  GPS: {selectedSub.location.latitude?.toFixed(4)}, {selectedSub.location.longitude?.toFixed(4)}
                </div>
              </div>

              {/* Original vs Translated */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                <div className="p-4 rounded-2xl bg-white border border-stone-200 space-y-1.5 shadow-2xs">
                  <div className="flex items-center justify-between text-stone-700 font-bold uppercase text-[10px]">
                    <span>Original Citizen Input ({selectedSub.language.toUpperCase()})</span>
                    {selectedSub.audioDurationSeconds && (
                      <span className="flex items-center space-x-1 text-orange-600 font-mono">
                        <Volume2 className="w-3 h-3" />
                        <span>{selectedSub.audioDurationSeconds}s</span>
                      </span>
                    )}
                  </div>
                  <p className="text-stone-800 leading-relaxed font-sans font-medium">{selectedSub.rawInput}</p>
                </div>

                <div className="p-4 rounded-2xl bg-white border border-stone-200 space-y-1.5 shadow-2xs">
                  <span className="text-stone-700 font-bold uppercase text-[10px]">
                    AI Normalized English Translation
                  </span>
                  <p className="text-stone-800 leading-relaxed font-sans font-medium">{selectedSub.translatedText || selectedSub.rawInput}</p>
                </div>
              </div>

              {/* Human-in-the-Loop Verification & Edit Form or Read-Only Card */}
              {isOfficial ? (
                <div className="p-5 rounded-2xl bg-orange-50/50 border-2 border-orange-200 space-y-4 text-xs">
                  <div className="flex items-center justify-between border-b border-orange-200 pb-2.5">
                    <div className="flex items-center space-x-2 font-bold text-stone-900">
                      <Edit3 className="w-4 h-4 text-orange-600" />
                      <span>Human Officer Verification & Taxonomy Adjustment</span>
                    </div>
                    <span className="text-[10px] text-orange-700 font-mono font-bold">FR-04 Official Authority</span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div>
                      <label className="text-stone-700 font-bold">Category</label>
                      <select
                        value={editedCategory}
                        onChange={(e) => setEditedCategory(e.target.value as any)}
                        className="w-full mt-1 px-3 py-2 rounded-xl bg-white border border-stone-300 text-stone-900 font-semibold focus:outline-none focus:border-orange-500"
                      >
                        <option value="water">💧 Water & Sanitation</option>
                        <option value="roads">🚗 Roads & Bridges</option>
                        <option value="connectivity">📶 Digital Connectivity</option>
                        <option value="energy">⚡ Energy & Grid</option>
                        <option value="sanitation">♻️ Waste Management</option>
                        <option value="health">🏥 Primary Health Clinic</option>
                      </select>
                    </div>

                    <div>
                      <label className="text-stone-700 font-bold">Priority / Urgency</label>
                      <select
                        value={editedUrgency}
                        onChange={(e) => setEditedUrgency(e.target.value as any)}
                        className="w-full mt-1 px-3 py-2 rounded-xl bg-white border border-stone-200 text-stone-900 font-semibold focus:outline-none focus:border-orange-500"
                      >
                        <option value="critical">🔴 Critical</option>
                        <option value="high">🟠 High</option>
                        <option value="medium">🟡 Medium</option>
                        <option value="low">🟢 Low</option>
                      </select>
                    </div>

                    <div>
                      <label className="text-stone-700 font-bold">Assign Department</label>
                      <input
                        type="text"
                        value={assignedDepartment}
                        onChange={(e) => setAssignedDepartment(e.target.value)}
                        className="w-full mt-1 px-3 py-2 rounded-xl bg-white border border-stone-200 text-stone-900 font-semibold focus:outline-none focus:border-orange-500"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-stone-700 font-bold">Resolution & Engineering Notes</label>
                    <textarea
                      rows={2}
                      value={resolutionNotes}
                      onChange={(e) => setResolutionNotes(e.target.value)}
                      placeholder="Enter dispatch notes, engineer assigned, or reason for status update..."
                      className="w-full mt-1 px-3 py-2 rounded-xl bg-white border border-stone-200 text-stone-900 focus:outline-none focus:border-orange-500"
                    />
                  </div>

                  <button
                    onClick={handleSaveCorrection}
                    className="px-4 py-2 rounded-xl bg-white border border-orange-300 text-orange-700 hover:bg-orange-100 font-bold transition-colors flex items-center space-x-1.5 shadow-2xs cursor-pointer"
                  >
                    <Check className="w-3.5 h-3.5" />
                    <span>Save Classification Correction</span>
                  </button>
                </div>
              ) : (
                <div className="p-5 rounded-2xl bg-stone-50 border border-stone-200 space-y-3 text-xs">
                  <div className="flex items-center justify-between border-b border-stone-200 pb-2">
                    <span className="font-bold text-stone-800 flex items-center space-x-1.5">
                      <ShieldCheck className="w-4 h-4 text-emerald-600" />
                      <span>Verified Triage Classification</span>
                    </span>
                    <span className="text-[10px] font-mono font-bold text-stone-500 uppercase bg-stone-100 px-2 py-0.5 rounded border border-stone-200">
                      Public Record (Read-Only)
                    </span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
                    <div className="p-2.5 rounded-xl bg-white border border-stone-200">
                      <span className="text-[10px] text-stone-500 uppercase font-bold block">Assigned Domain:</span>
                      <span className="font-bold text-stone-900 capitalize">{selectedSub.category}</span>
                    </div>
                    <div className="p-2.5 rounded-xl bg-white border border-stone-200">
                      <span className="text-[10px] text-stone-500 uppercase font-bold block">Triage Urgency:</span>
                      <span className="font-bold text-stone-900 uppercase font-mono">{selectedSub.urgency}</span>
                    </div>
                    <div className="p-2.5 rounded-xl bg-white border border-stone-200">
                      <span className="text-[10px] text-stone-500 uppercase font-bold block">Department:</span>
                      <span className="font-bold text-stone-900">{selectedSub.assignedDepartment || 'District Public Works'}</span>
                    </div>
                  </div>
                </div>
              )}

              {/* Status Action Buttons or Public Observer Banner */}
              {isOfficial ? (
                <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
                  <span className="text-xs font-bold text-stone-600">Workflow Actions:</span>

                  <div className="flex flex-wrap items-center gap-2">
                    <button
                      onClick={() => handleUpdateStatus('verified')}
                      className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-sm transition-all flex items-center space-x-1 cursor-pointer"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Verify Signal</span>
                    </button>

                    <button
                      onClick={() => handleUpdateStatus('clustered')}
                      className="px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-sm transition-all flex items-center space-x-1 cursor-pointer"
                    >
                      <Layers className="w-3.5 h-3.5" />
                      <span>Cluster with Demand</span>
                    </button>

                    <button
                      onClick={() => handleUpdateStatus('in_progress')}
                      className="px-3.5 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs shadow-sm transition-all flex items-center space-x-1 cursor-pointer"
                    >
                      <Clock className="w-3.5 h-3.5" />
                      <span>Dispatch Works</span>
                    </button>

                    <button
                      onClick={() => handleUpdateStatus('resolved')}
                      className="px-3.5 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs shadow-sm transition-all flex items-center space-x-1 cursor-pointer"
                    >
                      <Check className="w-3.5 h-3.5" />
                      <span>Resolve & Close</span>
                    </button>
                  </div>
                </div>
              ) : (
                <div className="p-3.5 rounded-2xl bg-amber-50/70 border border-amber-200 text-stone-700 text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-2 shadow-2xs">
                  <div className="flex items-center space-x-2">
                    <ShieldCheck className="w-4 h-4 text-amber-700 shrink-0" />
                    <span>Triage resolution status and department work dispatches are restricted to authenticated district nodal officers.</span>
                  </div>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-white border border-amber-300 text-amber-900 font-bold uppercase self-start sm:self-auto">
                    Authorized Officials Only
                  </span>
                </div>
              )}

              {actionSuccess && (
                <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold flex items-center space-x-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>{actionSuccess}</span>
                </div>
              )}

            </div>
          ) : (
            <div className="p-12 text-center text-stone-400 bg-white border border-stone-200 rounded-3xl">
              Select a submission from the left queue to view triage details.
            </div>
          )}
        </div>

      </div>

    </div>
  );
}
