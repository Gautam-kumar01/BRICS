'use client';

import React, { useState, useEffect } from 'react';
import { 
  CheckCircle2, 
  Clock, 
  TrendingUp, 
  DollarSign, 
  Award, 
  Star, 
  Layers, 
  Building2, 
  MapPin, 
  ExternalLink,
  ChevronRight,
  ShieldCheck,
  Activity,
  AlertCircle
} from 'lucide-react';
import { ProjectRegistryItem, DataProvenanceInfo } from '@/types';
import { SEED_PROJECTS } from '@/data/seed-data';
import DataStatusBadge from '@/components/DataStatusBadge';
import DataProvenanceModal from '@/components/DataProvenanceModal';
import PrototypeDisclosure from '@/components/PrototypeDisclosure';

export default function ImpactPage() {
  const [projects, setProjects] = useState<ProjectRegistryItem[]>(SEED_PROJECTS);
  const [selectedProject, setSelectedProject] = useState<ProjectRegistryItem | null>(SEED_PROJECTS[0]);
  const [provenanceModalOpen, setProvenanceModalOpen] = useState(false);
  const [activeProvenance, setActiveProvenance] = useState<DataProvenanceInfo | null>(null);

  useEffect(() => {
    async function loadProjects() {
      try {
        const res = await fetch('/api/projects');
        if (res.ok) {
          const data = await res.json();
          setProjects(data);
          if (data.length > 0) setSelectedProject(data[0]);
        }
      } catch (e) {}
    }
    loadProjects();
  }, []);

  const handleUpdateMilestone = async (projectId: string, milestoneId: string, status: 'completed' | 'in_progress' | 'delayed') => {
    try {
      const res = await fetch('/api/projects', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          projectId,
          milestoneId,
          status,
          actor: 'Project Oversight Auditor',
        }),
      });

      if (res.ok) {
        const updated: ProjectRegistryItem = await res.json();
        setProjects(prev => prev.map(p => p.id === updated.id ? updated : p));
        if (selectedProject?.id === updated.id) setSelectedProject(updated);
      }
    } catch (e) {
      alert('Failed to update milestone');
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 text-stone-900">
      
      {/* Prototype Environment Notice */}
      <PrototypeDisclosure variant="banner" />

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-stone-200 pb-6">
        <div>
          <div className="inline-flex items-center space-x-2 text-xs font-mono text-emerald-700 font-bold mb-1 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
            <span>FR-10 & FR-11 Impact & Delivery Registry</span>
          </div>
          <h1 className="text-3xl font-display font-extrabold text-stone-900">
            Infrastructure Delivery & Public Impact Registry
          </h1>
          <p className="text-xs text-stone-600 mt-1">
            Track funded projects from ground-breaking to citizen commissioning, measuring actual outcome change against initial baselines.
          </p>
        </div>

        <div className="flex items-center space-x-3 bg-white px-4 py-2.5 rounded-2xl border border-stone-200 text-xs shadow-2xs">
          <span className="text-stone-600 font-medium">Total Active Portfolio:</span>
          <span className="font-mono font-extrabold text-emerald-700 text-sm">$3.55M USD</span>
        </div>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Column: Projects List (5 cols) */}
        <div className="lg:col-span-5 space-y-3">
          <div className="flex items-center justify-between text-xs text-stone-600 font-bold px-1">
            <span>Active Infrastructure Initiatives ({projects.length})</span>
            <span className="text-[11px] font-mono text-emerald-700">Live Delivery</span>
          </div>

          <div className="space-y-3">
            {projects.map((proj) => {
              const isSelected = selectedProject?.id === proj.id;
              const burnPct = Math.round((proj.spentBudgetUsd / proj.allocatedBudgetUsd) * 100);

              return (
                <div
                  key={proj.id}
                  onClick={() => setSelectedProject(proj)}
                  className={`p-5 rounded-3xl border transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-orange-50/90 border-orange-400 shadow-sm'
                      : 'bg-white border-stone-200 hover:border-orange-300 hover:bg-stone-50/80 shadow-2xs'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-mono font-extrabold text-emerald-800 uppercase bg-emerald-50 px-2.5 py-0.5 rounded-lg border border-emerald-200">
                      {proj.projectCode}
                    </span>
                    <span className="text-[10px] font-mono uppercase px-2.5 py-0.5 rounded-lg bg-stone-100 text-stone-800 font-bold border border-stone-200">
                      {proj.liveStatus}
                    </span>
                  </div>

                  <h3 className="font-display font-bold text-sm text-stone-900 mt-2">
                    {proj.title}
                  </h3>

                  <p className="text-xs text-stone-600 mt-1 flex items-center space-x-1 font-semibold">
                    <MapPin className="w-3.5 h-3.5 text-orange-500" />
                    <span>{proj.district}, {proj.country}</span>
                  </p>

                  <div className="pt-3 mt-3 border-t border-stone-100 space-y-1.5 text-xs">
                    <div className="flex justify-between text-stone-600 text-[11px] font-mono font-bold">
                      <span>Budget Burn</span>
                      <span className="text-emerald-700">${(proj.spentBudgetUsd / 1000).toFixed(0)}k / ${(proj.allocatedBudgetUsd / 1000).toFixed(0)}k ({burnPct}%)</span>
                    </div>
                    <div className="w-full h-2 bg-stone-100 rounded-full overflow-hidden">
                      <div className="h-full bg-emerald-600" style={{ width: `${burnPct}%` }} />
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-[11px] font-mono text-stone-500 pt-2 font-bold">
                    <span className="flex items-center space-x-1 text-amber-500">
                      <Star className="w-3.5 h-3.5 fill-current" />
                      <span className="text-stone-800">{proj.citizenSatisfactionAverage}/5.0</span>
                      <span className="text-stone-500">({proj.totalCitizenReviews} reviews)</span>
                    </span>
                    <span className="text-stone-600">{proj.targetCompletionDate}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Column: Milestones (7 cols) */}
        <div className="lg:col-span-7">
          {selectedProject ? (
            <div className="rounded-3xl bg-white border border-stone-200 shadow-sm p-6 sm:p-8 space-y-6 animate-in fade-in duration-150">
              
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-stone-200 pb-4">
                <div>
                  <span className="text-[10px] font-mono uppercase px-2.5 py-0.5 rounded-lg bg-emerald-50 text-emerald-800 font-bold border border-emerald-200">
                    {selectedProject.projectCode} • Lead: {selectedProject.leadAgency}
                  </span>
                  <h2 className="text-xl font-display font-extrabold text-stone-900 mt-1">
                    {selectedProject.title}
                  </h2>
                  <p className="text-xs text-stone-600 font-semibold">
                    {selectedProject.district}, {selectedProject.country} • Target: {selectedProject.targetCompletionDate}
                  </p>
                </div>

                <div className="text-left sm:text-right">
                  <span className="text-xs text-stone-500 font-medium">Allocated Budget:</span>
                  <div className="text-base font-mono font-bold text-emerald-700">
                    ${(selectedProject.allocatedBudgetUsd / 1000000).toFixed(2)}M USD
                  </div>
                </div>
              </div>

              {/* Baseline → Intervention → Outcome Structured Progression (Priority 11) */}
              <div className="p-6 rounded-3xl bg-stone-900 border border-stone-800 text-stone-100 space-y-4 shadow-xl">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-stone-800 pb-3">
                  <div className="flex items-center space-x-2">
                    <TrendingUp className="w-4 h-4 text-orange-400" />
                    <h3 className="text-xs font-bold text-white uppercase tracking-wider font-mono">
                      Baseline → Intervention → Target Impact Progression
                    </h3>
                  </div>
                  <button
                    onClick={() => {
                      setActiveProvenance({
                        datasetName: selectedProject.title,
                        source: 'Municipal Public Works Registry & Sensor Telemetry',
                        year: 2026,
                        geography: `${selectedProject.district}, ${selectedProject.country}`,
                        lastUpdated: selectedProject.lastStatusUpdate,
                        dataType: 'Service Availability & Citizen Satisfaction Index',
                        status: 'simulated',
                        confidenceScore: 0.95,
                      });
                      setProvenanceModalOpen(true);
                    }}
                    className="text-[11px] font-mono text-orange-400 hover:underline font-bold"
                  >
                    View Data Provenance 🔍
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {/* Step 1: Baseline */}
                  <div className="p-4 rounded-2xl bg-stone-950 border border-rose-500/30 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] uppercase font-mono font-bold text-rose-400">1. Baseline (Pre-Intervention)</span>
                      <DataStatusBadge status="measured" size="xs" />
                    </div>
                    <div className="text-rose-400 font-mono font-extrabold text-base">{selectedProject.baselineMetric.value}</div>
                    <p className="text-[11px] text-stone-400 font-sans leading-tight">
                      Observed service deficit before public capital disbursement.
                    </p>
                  </div>

                  {/* Step 2: Current Progress */}
                  <div className="p-4 rounded-2xl bg-stone-950 border border-amber-500/30 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] uppercase font-mono font-bold text-amber-400">2. Current Delivery</span>
                      <DataStatusBadge status="simulated" size="xs" />
                    </div>
                    <div className="text-amber-400 font-mono font-extrabold text-base">{selectedProject.currentMetric.value}</div>
                    <p className="text-[11px] text-stone-400 font-sans leading-tight">
                      Ground engineering execution and interim telemetry.
                    </p>
                  </div>

                  {/* Step 3: Target Outcome */}
                  <div className="p-4 rounded-2xl bg-stone-950 border border-emerald-500/30 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] uppercase font-mono font-bold text-emerald-400">3. Target Outcome</span>
                      <DataStatusBadge status="projected" size="xs" />
                    </div>
                    <div className="text-emerald-400 font-mono font-extrabold text-base">{selectedProject.targetMetric.value}</div>
                    <p className="text-[11px] text-stone-400 font-sans leading-tight">
                      Model-forecasted statutory SDG benchmark upon commissioning.
                    </p>
                  </div>
                </div>

                {/* 6 Key Impact Tracking Indicators */}
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2 pt-2 border-t border-stone-800 text-[10px] font-mono">
                  <div className="p-2 rounded-xl bg-stone-950 text-center">
                    <span className="text-stone-500 block">Response Time</span>
                    <span className="text-emerald-400 font-bold">&lt; 42 Hours</span>
                  </div>
                  <div className="p-2 rounded-xl bg-stone-950 text-center">
                    <span className="text-stone-500 block">Service Coverage</span>
                    <span className="text-cyan-400 font-bold">94.8% Area</span>
                  </div>
                  <div className="p-2 rounded-xl bg-stone-950 text-center">
                    <span className="text-stone-500 block">Reliability</span>
                    <span className="text-orange-400 font-bold">99.2% Uptime</span>
                  </div>
                  <div className="p-2 rounded-xl bg-stone-950 text-center">
                    <span className="text-stone-500 block">Citizen Rating</span>
                    <span className="text-amber-400 font-bold">{selectedProject.citizenSatisfactionAverage}/5.0</span>
                  </div>
                  <div className="p-2 rounded-xl bg-stone-950 text-center">
                    <span className="text-stone-500 block">Completion</span>
                    <span className="text-white font-bold">{Math.round((selectedProject.spentBudgetUsd / selectedProject.allocatedBudgetUsd) * 100)}%</span>
                  </div>
                  <div className="p-2 rounded-xl bg-stone-950 text-center">
                    <span className="text-stone-500 block">Resolution</span>
                    <span className="text-emerald-400 font-bold">91.4% Rate</span>
                  </div>
                </div>
              </div>

              {/* Milestones */}
              <div className="space-y-3">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold uppercase tracking-wider text-stone-700">
                    Engineering & Delivery Milestones
                  </span>
                  <span className="text-[11px] font-mono text-orange-700 font-semibold">
                    Current: {selectedProject.currentMilestone}
                  </span>
                </div>

                <div className="space-y-2.5">
                  {selectedProject.milestones.map((ms) => (
                    <div
                      key={ms.id}
                      className={`p-4 rounded-2xl border flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs ${
                        ms.status === 'completed' ? 'bg-emerald-50 border-emerald-200 text-emerald-900' :
                        ms.status === 'in_progress' ? 'bg-orange-50 border-orange-300 text-stone-900 font-semibold' :
                        'bg-stone-50 border-stone-200 text-stone-500'
                      }`}
                    >
                      <div className="space-y-0.5">
                        <div className="font-bold flex items-center space-x-2">
                          {ms.status === 'completed' && <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />}
                          {ms.status === 'in_progress' && <Clock className="w-4 h-4 text-orange-600 animate-pulse shrink-0" />}
                          <span>{ms.title}</span>
                        </div>
                        <div className="text-[10px] text-stone-500 font-mono">
                          Target: {ms.targetDate} {ms.completedDate && `• Completed on ${ms.completedDate}`}
                        </div>
                      </div>

                      <div className="flex items-center space-x-2 self-end sm:self-auto">
                        <select
                          value={ms.status}
                          onChange={(e) => handleUpdateMilestone(selectedProject.id, ms.id, e.target.value as any)}
                          className="bg-white border border-stone-300 px-3 py-1 rounded-xl text-[11px] text-stone-800 font-mono font-bold focus:outline-none"
                        >
                          <option value="completed">Completed</option>
                          <option value="in_progress">In Progress</option>
                          <option value="delayed">Delayed</option>
                          <option value="pending">Pending</option>
                        </select>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* PRD Section 8.2 & 8.3: Citizen Closure Feedback & Satisfaction */}
              <div className="p-5 rounded-3xl bg-amber-50/60 border border-amber-200 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2 text-xs font-bold text-amber-800">
                    <Star className="w-4 h-4 fill-amber-500 text-amber-500" />
                    <span>Citizen Commissioning & Closure Verification (PRD §8.2)</span>
                  </div>
                  <span className="text-[10px] font-mono text-amber-900 bg-amber-100 px-2 py-0.5 rounded border border-amber-300 font-bold">
                    {selectedProject.citizenSatisfactionAverage} / 5.0 Rating
                  </span>
                </div>

                <p className="text-[11px] text-stone-600">
                  Post-delivery satisfaction surveys submitted by affected residents upon milestone commissioning.
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-xs">
                  <div className="p-3 bg-white rounded-xl border border-stone-200 space-y-1">
                    <div className="flex items-center space-x-1 text-amber-500 font-bold text-[11px]">
                      <span>★★★★★</span>
                      <span className="text-stone-700 font-semibold text-[10px] ml-1">Verified Resident (Ward 37)</span>
                    </div>
                    <p className="text-stone-700 italic text-[11px]">
                      &ldquo;The new bypass pipeline restored uninterrupted water pressure after 6 months of tanker dependency. Thank you!&rdquo;
                    </p>
                  </div>

                  <div className="p-3 bg-white rounded-xl border border-stone-200 space-y-1">
                    <div className="flex items-center space-x-1 text-amber-500 font-bold text-[11px]">
                      <span>★★★★☆</span>
                      <span className="text-stone-700 font-semibold text-[10px] ml-1">Community Facilitator</span>
                    </div>
                    <p className="text-stone-700 italic text-[11px]">
                      &ldquo;Work completed 2 weeks ahead of schedule. Road resurfacing over trenching was also finished smoothly.&rdquo;
                    </p>
                  </div>
                </div>
              </div>

              {/* Public Evidence URL */}
              {selectedProject.publicEvidenceUrl && (
                <div className="p-4 rounded-2xl bg-stone-50 border border-stone-200 flex items-center justify-between text-xs">
                  <span className="text-stone-700 font-medium">Official Transparency Tender & Evidence:</span>
                  <a
                    href={selectedProject.publicEvidenceUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="text-orange-600 hover:underline flex items-center space-x-1 font-mono text-[11px] font-bold"
                  >
                    <span>View Municipal Record</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>
              )}

            </div>
          ) : (
            <div className="rounded-3xl bg-white border border-stone-200 p-12 text-center text-stone-400">
              Select a project to inspect delivery telemetry.
            </div>
          )}
        </div>

      </div>

      {/* PRD Section 8.3: Minimum Impact Framework Benchmark */}
      <div className="p-6 sm:p-8 rounded-3xl bg-white border border-stone-200 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-stone-200 pb-4">
          <div>
            <div className="inline-flex items-center space-x-2 text-[10px] font-mono text-emerald-700 font-bold uppercase tracking-wider bg-emerald-50 px-2.5 py-0.5 rounded-md border border-emerald-200 mb-1">
              <span>PRD Section 8.3 & 11 Minimum Impact Example Benchmark</span>
            </div>
            <h3 className="text-lg font-display font-extrabold text-stone-900">
              Measurable Public Outcomes Beyond &ldquo;Work Completed&rdquo;
            </h3>
          </div>
          <span className="text-xs text-stone-500 font-mono">Evaluation Target: Controlled Pilot Cohort</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="p-4 rounded-2xl bg-stone-50 border border-stone-200 space-y-1.5">
            <span className="text-[10px] font-mono uppercase text-stone-500 font-bold">1. Water Reliability</span>
            <div className="text-xs font-bold text-stone-900">1,284 related signals</div>
            <div className="text-emerald-700 font-extrabold text-sm">↓ 40% Fewer Dry Points</div>
            <div className="text-[10px] text-stone-500 font-mono">Evidence: Trend + Field Check</div>
          </div>

          <div className="p-4 rounded-2xl bg-stone-50 border border-stone-200 space-y-1.5">
            <span className="text-[10px] font-mono uppercase text-stone-500 font-bold">2. Response Time</span>
            <div className="text-xs font-bold text-stone-900">5 days median baseline</div>
            <div className="text-emerald-700 font-extrabold text-sm">Under 48 Hours</div>
            <div className="text-[10px] text-stone-500 font-mono">Evidence: Workflow Timestamps</div>
          </div>

          <div className="p-4 rounded-2xl bg-stone-50 border border-stone-200 space-y-1.5">
            <span className="text-[10px] font-mono uppercase text-stone-500 font-bold">3. Infrastructure Coverage</span>
            <div className="text-xs font-bold text-stone-900">Service gap −34 points</div>
            <div className="text-emerald-700 font-extrabold text-sm">Gap Reduced by 15 pts</div>
            <div className="text-[10px] text-stone-500 font-mono">Evidence: Coverage GIS Refresh</div>
          </div>

          <div className="p-4 rounded-2xl bg-stone-50 border border-stone-200 space-y-1.5">
            <span className="text-[10px] font-mono uppercase text-stone-500 font-bold">4. Resident Experience</span>
            <div className="text-xs font-bold text-stone-900">Baseline Survey Score</div>
            <div className="text-emerald-700 font-extrabold text-sm">+20 Point Lift</div>
            <div className="text-[10px] text-stone-500 font-mono">Evidence: Post-Delivery Survey</div>
          </div>
        </div>
      </div>

      {/* Data Provenance Modal */}
      <DataProvenanceModal
        isOpen={provenanceModalOpen}
        onClose={() => setProvenanceModalOpen(false)}
        provenance={activeProvenance}
        metricName={activeProvenance?.datasetName}
      />

    </div>
  );
}
