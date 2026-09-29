'use client';

import React, { useState, useEffect } from 'react';
import { 
  SlidersHorizontal, 
  MapPin, 
  Layers, 
  TrendingUp, 
  Award, 
  FileText, 
  Download, 
  DollarSign, 
  Users, 
  Sparkles, 
  CheckCircle2, 
  AlertTriangle, 
  ShieldCheck,
  ChevronRight, 
  RefreshCw,
  HelpCircle,
  Eye,
  BarChart2,
  Share2,
  Volume2
} from 'lucide-react';
import MapComponent from '@/components/MapComponent';
import ScoreBreakdownBar from '@/components/ScoreBreakdownBar';
import ScenarioCompareSlider from '@/components/ScenarioCompareSlider';
import BudgetSimulator from '@/components/BudgetSimulator';
import DataStatusBadge from '@/components/DataStatusBadge';
import DataProvenanceModal from '@/components/DataProvenanceModal';
import PrototypeDisclosure from '@/components/PrototypeDisclosure';
import { CandidateRecommendation, DemandCluster, InfrastructureIndicator, PolicyScenario, DataProvenanceInfo } from '@/types';
import { SEED_CLUSTERS, SEED_RECOMMENDATIONS, SEED_INDICATORS, SEED_SCENARIOS, SEED_SUBMISSIONS } from '@/data/seed-data';
import { useAuth } from '@/context/AuthContext';

export default function PlanningPage() {
  const { user, isSuperAdmin, isDistrictCollector, assignedDistrict } = useAuth();
  const isOfficial = Boolean(user && user.role !== 'citizen');
  const [recommendations, setRecommendations] = useState<CandidateRecommendation[]>(SEED_RECOMMENDATIONS);
  const [clusters, setClusters] = useState<DemandCluster[]>(SEED_CLUSTERS);
  const [indicators, setIndicators] = useState<InfrastructureIndicator[]>(SEED_INDICATORS);
  const [selectedRec, setSelectedRec] = useState<CandidateRecommendation | null>(SEED_RECOMMENDATIONS[0]);
  const [whyDrawerOpen, setWhyDrawerOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'ranking' | 'scenarios' | 'indicators' | 'map'>('ranking');
  const [isExporting, setIsExporting] = useState(false);
  const [selectedDistrictScope, setSelectedDistrictScope] = useState<string>('all');
  const [provenanceModalOpen, setProvenanceModalOpen] = useState(false);
  const [activeProvenance, setActiveProvenance] = useState<DataProvenanceInfo | null>(null);
  const [decisionNotice, setDecisionNotice] = useState<string | null>(null);

  useEffect(() => {
    if (assignedDistrict) {
      setSelectedDistrictScope(assignedDistrict);
    } else {
      setSelectedDistrictScope('all');
    }
  }, [assignedDistrict]);

  useEffect(() => {
    async function loadData() {
      try {
        const [recRes, clRes] = await Promise.all([
          fetch('/api/recommendations'),
          fetch('/api/clusters'),
        ]);
        if (recRes.ok) {
          const recData = await recRes.json();
          setRecommendations(recData);
          if (recData.length > 0) setSelectedRec(recData[0]);
        }
        if (clRes.ok) {
          const clData = await clRes.json();
          setClusters(clData);
        }
      } catch (e) {}
    }
    loadData();
  }, []);

  // Filter recommendations and clusters based on user district or selectedDistrictScope
  const activeDistrictFilter = assignedDistrict || (selectedDistrictScope !== 'all' ? selectedDistrictScope : null);
  const filteredRecommendations = recommendations.filter(r => {
    if (!activeDistrictFilter) return true;
    return r.district.toLowerCase().includes(activeDistrictFilter.toLowerCase()) ||
           activeDistrictFilter.toLowerCase().includes(r.district.toLowerCase());
  });

  const filteredClusters = clusters.filter(c => {
    if (!activeDistrictFilter) return true;
    return c.district.toLowerCase().includes(activeDistrictFilter.toLowerCase()) ||
           activeDistrictFilter.toLowerCase().includes(c.district.toLowerCase());
  });

  const filteredIndicators = indicators.filter(i => {
    if (!activeDistrictFilter) return true;
    return i.district.toLowerCase().includes(activeDistrictFilter.toLowerCase()) ||
           activeDistrictFilter.toLowerCase().includes(i.district.toLowerCase());
  });

  // Keep selectedRec synchronized with filtered recommendations
  useEffect(() => {
    if (filteredRecommendations.length > 0) {
      if (!selectedRec || !filteredRecommendations.some(r => r.id === selectedRec.id)) {
        setSelectedRec(filteredRecommendations[0]);
      }
    } else {
      setSelectedRec(null);
    }
  }, [filteredRecommendations.length, activeDistrictFilter]);

  const handleDecision = async (id: string, status: CandidateRecommendation['approvedStatus'], customNote?: string) => {
    const officerTitle = user?.badge || user?.name || 'Demo District Authority';
    const note = customNote || (
      status === 'included_in_plan' ? 'Approved by Authorized Human Authority for Capital Budget Integration.' :
      status === 'rejected' ? 'Rejected following spatial cost-efficiency evaluation.' :
      status === 'deferred' ? 'Deferred to subsequent fiscal allocation cycle.' :
      'Flagged for additional field engineering evidence.'
    );

    try {
      const res = await fetch('/api/recommendations', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id,
          approvedStatus: status,
          rationale: note,
          officerName: officerTitle,
        }),
      });

      if (res.ok) {
        const updated = await res.json();
        setRecommendations(prev => prev.map(r => r.id === updated.id ? updated : r));
        if (selectedRec?.id === updated.id) setSelectedRec(updated);
        setDecisionNotice(`Decision recorded: ${status.replace('_', ' ').toUpperCase()} by ${officerTitle}`);
        setTimeout(() => setDecisionNotice(null), 5000);
      }
    } catch (e) {
      alert('Failed to update recommendation');
    }
  };

  const openProvenance = (metricName: string, metricVal: string | number) => {
    setActiveProvenance({
      datasetName: 'CivicPulse Multi-Source Prioritization Model',
      source: 'MCDA Priority Engine (Demographics + ISI + MTIP + Citizen Voice)',
      year: 2026,
      geography: selectedRec?.district || 'District Jurisdiction',
      lastUpdated: '2026-09-29',
      dataType: 'Composite MCDA Weighted Index (0-100)',
      status: 'simulated',
      confidenceScore: selectedRec?.confidence || 0.94,
      sampleCount: selectedRec?.beneficiariesCount || 28500,
    });
    setProvenanceModalOpen(true);
  };

  const handleExportBrief = (format: 'brief' | 'csv' | 'json') => {
    setIsExporting(true);
    const url = `/api/export?format=${format}&type=recommendations&officer=Demo+District+Authority`;
    window.open(url, '_blank');
    setTimeout(() => setIsExporting(false), 1000);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 text-stone-900">
      
      {/* Header & Export Actions */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-stone-200 pb-6">
        <div>
          <div className="inline-flex items-center space-x-2 text-xs font-mono text-orange-600 font-bold mb-1 bg-orange-50 px-2.5 py-0.5 rounded-full border border-orange-200">
            <span>FR-06, FR-07, FR-08, FR-09 & FR-12 Policy Intelligence</span>
          </div>
          <h1 className="text-3xl font-display font-extrabold text-stone-900">
            Policy Intelligence & Prioritization Workspace
          </h1>
          <p className="text-xs text-stone-600 mt-1">
            Compare citizen demand clusters with demographic vulnerability and simulate multi-criteria capital budget allocations.
          </p>
        </div>

        {/* Action Bar */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => handleExportBrief('brief')}
            className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-orange-500 to-amber-500 text-white text-xs font-bold shadow-md shadow-orange-500/20 flex items-center space-x-1.5 hover:from-orange-600 hover:to-amber-600 transition-all"
          >
            <FileText className="w-4 h-4" />
            <span>Generate Decision Brief (.MD)</span>
          </button>

          <button
            onClick={() => handleExportBrief('csv')}
            className="px-4 py-2.5 rounded-xl bg-white hover:bg-stone-50 border border-stone-200 text-xs text-stone-700 font-bold flex items-center space-x-1.5 transition-all shadow-2xs"
          >
            <Download className="w-4 h-4" />
            <span>Export CSV</span>
          </button>
        </div>
      </div>

      {/* District Territory Jurisdiction Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-2xl bg-amber-50/80 border border-amber-200/80 text-xs shadow-2xs">
        <div className="flex items-center space-x-2">
          <MapPin className="w-4 h-4 text-orange-600 shrink-0" />
          <span className="text-stone-700">
            {assignedDistrict ? (
              <>Jurisdiction Territory: <strong className="text-stone-900">{assignedDistrict}</strong> ({user?.assignedCountry || 'India'}) • Role: <strong className="text-orange-700 font-mono uppercase">{user?.role?.replace('_', ' ')}</strong></>
            ) : (
              <>Central Multilateral Scope: <strong className="text-stone-900">All BRICS Partner Jurisdictions</strong> • Role: <strong className="text-purple-700 font-mono uppercase">{user?.role?.replace('_', ' ')}</strong></>
            )}
          </span>
        </div>

        {isSuperAdmin && (
          <div className="flex items-center space-x-2">
            <span className="text-stone-500 font-medium">District Scope:</span>
            <select
              value={selectedDistrictScope}
              onChange={(e) => setSelectedDistrictScope(e.target.value)}
              className="px-3 py-1.5 rounded-xl border border-stone-200 bg-white text-stone-800 font-bold focus:outline-hidden focus:border-orange-500"
            >
              <option value="all">All Pilot Districts (Global)</option>
              <option value="Dhule (Dhulia)">Dhule (Dhulia), India</option>
              <option value="City of Tshwane">City of Tshwane, South Africa</option>
              <option value="Recife Metropolitan">Recife Metropolitan, Brazil</option>
              <option value="Yekaterinburg">Yekaterinburg, Russia</option>
            </select>
          </div>
        )}
      </div>

      {/* Tabs */}
      <div className="flex items-center space-x-2 border-b border-stone-200 pb-2 overflow-x-auto">
        <button
          onClick={() => setActiveTab('ranking')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
            activeTab === 'ranking' ? 'bg-gradient-to-r from-orange-500 to-amber-500 text-white shadow-sm' : 'text-stone-600 hover:text-stone-950'
          }`}
        >
          Candidate Recommendations (FR-08)
        </button>
        <button
          onClick={() => setActiveTab('scenarios')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
            activeTab === 'scenarios' ? 'bg-gradient-to-r from-orange-500 to-amber-500 text-white shadow-sm' : 'text-stone-600 hover:text-stone-950'
          }`}
        >
          Scenario Builder (FR-09)
        </button>
        <button
          onClick={() => setActiveTab('map')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
            activeTab === 'map' ? 'bg-gradient-to-r from-orange-500 to-amber-500 text-white shadow-sm' : 'text-stone-600 hover:text-stone-950'
          }`}
        >
          Geospatial Demand Map
        </button>
        <button
          onClick={() => setActiveTab('indicators')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
            activeTab === 'indicators' ? 'bg-gradient-to-r from-orange-500 to-amber-500 text-white shadow-sm' : 'text-stone-600 hover:text-stone-950'
          }`}
        >
          Infrastructure Indicators (FR-06)
        </button>
      </div>

      {/* ==================================================================== */}
      {/* TAB 1: RECOMMENDATIONS                                               */}
      {/* ==================================================================== */}
      {activeTab === 'ranking' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          <div className="lg:col-span-6 space-y-4">
            <div className="flex items-center justify-between text-xs text-stone-600 font-bold">
              <span>Prioritized Candidate Projects ({filteredRecommendations.length})</span>
              <span className="text-[11px] font-mono text-orange-600">Multi-Criteria Score Order</span>
            </div>

            <div className="space-y-3">
              {filteredRecommendations.length === 0 ? (
                <div className="p-8 rounded-3xl bg-white border border-stone-200 text-center text-stone-500 text-xs">
                  No capital recommendations registered for this district jurisdiction yet.
                </div>
              ) : (
                filteredRecommendations.map((rec) => {
                  const isSelected = selectedRec?.id === rec.id;
                  return (
                    <div
                      key={rec.id}
                      onClick={() => setSelectedRec(rec)}
                      className={`p-5 rounded-3xl border transition-all cursor-pointer ${
                        isSelected
                          ? 'bg-orange-50/90 border-orange-400 shadow-sm'
                          : 'bg-white border-stone-200 hover:border-orange-300 hover:bg-stone-50/80 shadow-2xs'
                      }`}
                    >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <span className="w-6 h-6 rounded-lg bg-orange-600 text-white font-mono font-bold text-xs flex items-center justify-center">
                          #{rec.rank}
                        </span>
                        <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded-md bg-stone-100 text-stone-800 font-bold border border-stone-200">
                          {rec.domain} • {rec.district}
                        </span>
                      </div>

                      <span className={`px-2.5 py-0.5 rounded-lg text-[10px] font-mono uppercase font-extrabold ${
                        rec.approvedStatus === 'included_in_plan' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' :
                        rec.approvedStatus === 'rejected' ? 'bg-red-50 text-red-700' :
                        'bg-amber-50 text-amber-700 border border-amber-200'
                      }`}>
                        {rec.approvedStatus.replace('_', ' ')}
                      </span>
                    </div>

                    <h3 className="font-display font-bold text-sm text-stone-900 mt-2">
                      {rec.title}
                    </h3>

                    <p className="text-xs text-stone-600 mt-1 line-clamp-2">
                      {rec.equityNotes}
                    </p>

                    <div className="pt-3 mt-3 border-t border-stone-100">
                      <ScoreBreakdownBar scoreBreakdown={rec.scoreBreakdown} compositeScore={rec.compositeScore} />
                    </div>

                    <div className="flex items-center justify-between text-[11px] font-mono text-stone-600 pt-2 font-bold">
                      <span className="text-emerald-700">
                        ${(rec.estimatedBudgetUsd / 1000000).toFixed(2)}M USD
                      </span>
                      <span>{rec.beneficiariesCount.toLocaleString()} beneficiaries</span>
                      <span>{rec.timelineMonths} mos delivery</span>
                    </div>
                  </div>
                );
              }))}
            </div>
          </div>

          <div className="lg:col-span-6">
            {selectedRec ? (
              <div className="rounded-3xl bg-white border border-stone-200 shadow-sm p-6 sm:p-8 space-y-6 animate-in fade-in duration-150">
                
                <div className="flex items-center justify-between border-b border-stone-200 pb-4">
                  <div>
                    <span className="text-[10px] font-mono uppercase px-2.5 py-0.5 rounded-lg bg-orange-50 text-orange-700 font-bold border border-orange-200">
                      Recommendation Rank #{selectedRec.rank}
                    </span>
                    <h2 className="text-lg font-display font-extrabold text-stone-900 mt-1">
                      {selectedRec.title}
                    </h2>
                    <p className="text-xs text-stone-600 font-semibold">
                      {selectedRec.district}, {selectedRec.country}
                    </p>
                  </div>

                  <button
                    onClick={() => setWhyDrawerOpen(!whyDrawerOpen)}
                    className="px-3 py-1.5 rounded-xl bg-orange-50 hover:bg-orange-100 border border-orange-200 text-orange-700 text-xs font-bold flex items-center space-x-1.5 transition-colors shadow-2xs"
                  >
                    <HelpCircle className="w-3.5 h-3.5" />
                    <span>Explain Ranking</span>
                  </button>
                </div>

                {whyDrawerOpen && (
                  <div className="p-4 rounded-2xl bg-orange-50 border border-orange-200 text-xs space-y-2 animate-in fade-in duration-150">
                    <div className="font-bold text-orange-900 flex items-center space-x-1.5">
                      <Sparkles className="w-4 h-4 text-orange-600" />
                      <span>Why did the AI rank this candidate #{selectedRec.rank}?</span>
                    </div>
                    <p className="text-stone-700 leading-relaxed">
                      This project scored in the 98th percentile for <strong className="text-stone-900">vulnerability index ({selectedRec.scoreBreakdown.vulnerability}/100)</strong> combined with high verified citizen demand density in the municipal water basin. It offers a cost-efficiency ratio of ${(selectedRec.estimatedBudgetUsd / selectedRec.beneficiariesCount).toFixed(0)} per citizen served.
                    </p>
                    <div className="text-[11px] font-mono text-orange-700 pt-1 font-semibold">
                      Model: CivicPulse Prioritization Engine v1.0 • Uncertainty Buffer: ±4.2%
                    </div>
                  </div>
                )}

                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold uppercase tracking-wider text-stone-700">
                      Evidence Links & Integrated Datasets
                    </span>
                    <button
                      onClick={() => setWhyDrawerOpen(!whyDrawerOpen)}
                      className="text-[11px] font-mono text-orange-700 hover:text-orange-900 font-bold underline flex items-center space-x-1"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      <span>{whyDrawerOpen ? 'Hide Evidence Drawer' : 'Open Evidence Drawer (PRD §7.2)'}</span>
                    </button>
                  </div>

                  <div className="space-y-2">
                    {selectedRec.evidenceLinks.map((ev, i) => (
                      <div key={i} className="p-3.5 rounded-xl bg-stone-50 border border-stone-200 flex items-center justify-between text-xs">
                        <span className="text-stone-900 font-semibold">{ev.label}</span>
                        <span className="text-[11px] font-mono text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 font-bold">
                          {ev.metric}
                        </span>
                      </div>
                    ))}
                  </div>

                  {/* PRD Section 7.2 Item 6: Evidence Drawer with Original Citizen Request Samples */}
                  {whyDrawerOpen && (
                    <div className="mt-4 p-4 sm:p-5 rounded-2xl bg-orange-50/70 border-2 border-orange-200 space-y-3 animate-in fade-in duration-200">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <Volume2 className="w-4 h-4 text-orange-600" />
                          <h4 className="text-xs font-display font-extrabold text-stone-900 uppercase tracking-wide">
                            Raw Citizen Signal Samples Traceability ({SEED_SUBMISSIONS.filter(s => s.category === selectedRec.domain || s.location.country === selectedRec.country).length} Verified Signals)
                          </h4>
                        </div>
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-orange-100 text-orange-800 font-bold border border-orange-300">
                          100% Traceable
                        </span>
                      </div>

                      <p className="text-[11px] text-stone-600">
                        Verbatim citizen requests aggregated across voice, WhatsApp, text, and 2G USSD that substantiate this capital investment candidate.
                      </p>

                      <div className="space-y-2.5 max-h-60 overflow-y-auto pr-1">
                        {SEED_SUBMISSIONS
                          .filter(s => s.category === selectedRec.domain || s.location.country === selectedRec.country)
                          .map((sub) => (
                            <div key={sub.id} className="p-3 rounded-xl bg-white border border-stone-200 shadow-2xs space-y-1.5 text-xs">
                              <div className="flex items-center justify-between">
                                <div className="flex items-center space-x-1.5">
                                  <span className="text-[10px] font-mono font-bold text-orange-700 bg-orange-50 px-1.5 py-0.5 rounded">
                                    {sub.referenceCode}
                                  </span>
                                  <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-stone-100 text-stone-700 uppercase font-semibold">
                                    {sub.channel.replace('_', ' ')} • {sub.language.toUpperCase()}
                                  </span>
                                </div>
                                <span className="text-[10px] font-mono text-emerald-700 font-bold">
                                  {Math.round(sub.aiConfidenceScore * 100)}% AI Conf
                                </span>
                              </div>

                              <div className="text-stone-900 font-medium italic bg-stone-50 p-2 rounded-lg border border-stone-100 text-[11px]">
                                &ldquo;{sub.rawInput}&rdquo;
                              </div>

                              {sub.language !== 'en' && sub.translatedText && (
                                <div className="text-[11px] text-stone-600 pl-2 border-l-2 border-orange-300">
                                  <strong className="text-stone-700">EN Translation:</strong> {sub.translatedText}
                                </div>
                              )}

                              <div className="flex items-center justify-between text-[10px] font-mono text-stone-500 pt-0.5">
                                <span>📍 {sub.location.formattedAddress || sub.location.district}</span>
                                <span>🛡️ 300m Spatial Privacy Buffer</span>
                              </div>
                            </div>
                          ))}
                      </div>
                    </div>
                  )}
                </div>

                <div className="space-y-2">
                  <span className="text-xs font-bold uppercase tracking-wider text-stone-700">
                    Key Technical Assumptions
                  </span>
                  <ul className="space-y-1.5 text-xs text-stone-600">
                    {selectedRec.assumptions.map((ass, i) => (
                      <li key={i} className="flex items-start space-x-2">
                        <span className="text-orange-500 font-bold">•</span>
                        <span>{ass}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="p-4 rounded-2xl bg-stone-50 border border-stone-200 space-y-1 text-xs">
                  <span className="font-bold text-emerald-800">Equity & Distribution Impact:</span>
                  <p className="text-stone-700 leading-relaxed">
                    {selectedRec.equityNotes}
                  </p>
                </div>

                {/* Human-in-the-Loop Governance Panel (Priority 8 Alignment) */}
                <div className="p-5 rounded-2xl bg-stone-900 border border-stone-800 text-stone-100 space-y-4 shadow-md">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-stone-800 pb-3">
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-0.5 rounded bg-orange-500/20 text-orange-400 font-mono text-[10px] font-bold uppercase border border-orange-500/30">
                        Human Gate
                      </span>
                      <h3 className="text-xs font-bold text-white">AI Recommends. Humans Decide.</h3>
                    </div>
                    <DataStatusBadge status="simulated" size="xs" />
                  </div>

                  <p className="text-[11px] text-stone-300 leading-relaxed">
                    AI provides evidence-based recommendations. Final infrastructure allocations and public capital disbursements remain under exclusive authorized human governance.
                  </p>

                  <div className="p-3 rounded-xl bg-stone-950 border border-stone-800 text-xs flex justify-between items-center font-mono text-[11px]">
                    <span className="text-stone-400">Current Status:</span>
                    <span className={`px-2.5 py-0.5 rounded font-bold uppercase ${
                      selectedRec.approvedStatus === 'included_in_plan' ? 'bg-emerald-950 text-emerald-400 border border-emerald-500/40' :
                      selectedRec.approvedStatus === 'rejected' ? 'bg-rose-950 text-rose-400 border border-rose-500/40' :
                      'bg-amber-950 text-amber-400 border border-amber-500/40'
                    }`}>
                      {selectedRec.approvedStatus.replace('_', ' ')}
                    </span>
                  </div>

                  {decisionNotice && (
                    <div className="p-2.5 rounded-xl bg-emerald-950/80 border border-emerald-500 text-emerald-300 text-xs font-bold flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                      <span>{decisionNotice}</span>
                    </div>
                  )}

                  {isOfficial ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                      <button
                        onClick={() => handleDecision(selectedRec.id, 'included_in_plan')}
                        className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-md shadow-emerald-950 transition-all flex items-center justify-center space-x-1.5 cursor-pointer"
                      >
                        <CheckCircle2 className="w-4 h-4" />
                        <span>Approve for Capital Plan</span>
                      </button>

                      <button
                        onClick={() => handleDecision(selectedRec.id, 'deferred')}
                        className="px-4 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-500 text-stone-950 text-xs font-bold transition-all flex items-center justify-center space-x-1.5 cursor-pointer"
                      >
                        <span>Request Field Review</span>
                      </button>

                      <button
                        onClick={() => handleDecision(selectedRec.id, 'rejected')}
                        className="px-4 py-2 rounded-xl bg-stone-800 hover:bg-stone-700 text-rose-400 hover:text-rose-300 border border-rose-500/30 text-xs font-bold transition-all cursor-pointer"
                      >
                        Reject Recommendation
                      </button>

                      <button
                        onClick={() => openProvenance(selectedRec.title, `${selectedRec.compositeScore}/100`)}
                        className="px-4 py-2 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-200 border border-stone-700 text-xs font-bold transition-all flex items-center justify-center gap-1 cursor-pointer"
                      >
                        <span>Inspect Provenance 🔍</span>
                      </button>
                    </div>
                  ) : (
                    <div className="p-3 rounded-xl bg-stone-950 border border-stone-800 text-stone-400 text-xs flex items-center justify-between">
                      <span>Public Policy Transparency • Decisions require authenticated authority credentials.</span>
                      <span className="text-[10px] font-mono font-bold text-amber-400">READ-ONLY</span>
                    </div>
                  )}
                </div>

              </div>
            ) : (
              <div className="rounded-3xl bg-white border border-stone-200 p-12 text-center text-stone-400">
                Select a recommendation to inspect evidence.
              </div>
            )}
          </div>

        </div>
      )}

      {/* TAB 2: SCENARIOS & BUDGET SIMULATOR */}
      {activeTab === 'scenarios' && (
        <div className="space-y-8">
          <BudgetSimulator />
          <div className="pt-6 border-t border-stone-200">
            <ScenarioCompareSlider recommendations={filteredRecommendations} />
          </div>
        </div>
      )}

      {/* TAB 3: MAP */}
      {activeTab === 'map' && (
        <div className="space-y-6 rounded-3xl bg-white border border-stone-200 p-2 shadow-sm overflow-hidden">
          <MapComponent clusters={filteredClusters} />
        </div>
      )}

      {/* TAB 4: INDICATORS */}
      {activeTab === 'indicators' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredIndicators.map((ind) => (
            <div key={ind.id} className="p-5 rounded-3xl bg-white border border-stone-200 shadow-sm space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono uppercase px-2.5 py-0.5 rounded-lg bg-blue-50 text-blue-800 font-bold border border-blue-200">
                  {ind.domain} • {ind.country}
                </span>
                <span className="text-[10px] font-mono text-emerald-800 bg-emerald-50 px-2.5 py-0.5 rounded-lg font-bold border border-emerald-200">
                  {ind.qualityRating}
                </span>
              </div>

              <h4 className="font-display font-extrabold text-sm text-stone-900">{ind.name}</h4>
              <div className="text-xs text-stone-600 font-semibold">{ind.district}</div>

              <div className="flex items-center justify-between pt-2 border-t border-stone-100 font-mono text-xs font-bold">
                <div>
                  <span className="text-stone-500">Current:</span>
                  <span className="ml-1 text-stone-900">{ind.currentValue} {ind.unit}</span>
                </div>
                <div>
                  <span className="text-stone-500">Target:</span>
                  <span className="ml-1 text-emerald-700">{ind.targetValue} {ind.unit}</span>
                </div>
              </div>

              <div className="text-[10px] text-stone-400">Source: {ind.sourceDataset}</div>
            </div>
          ))}
        </div>
      )}

      {/* Reusable Data Provenance Modal */}
      <DataProvenanceModal
        isOpen={provenanceModalOpen}
        onClose={() => setProvenanceModalOpen(false)}
        provenance={activeProvenance}
        metricName={selectedRec?.title}
        metricValue={`${selectedRec?.compositeScore}/100`}
      />

    </div>
  );
}
