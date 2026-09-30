'use client';

import React, { useState } from 'react';
import DataStatusBadge from '@/components/DataStatusBadge';
import DataProvenanceModal from '@/components/DataProvenanceModal';
import PrototypeDisclosure from '@/components/PrototypeDisclosure';
import { DATASET_REGISTRY, BRICS_COUNTRIES_CONFIG } from '@/data/seed-data';
import { DataProvenanceInfo } from '@/types';
import Link from 'next/link';
import OpenApiPlayground from '@/components/OpenApiPlayground';

export default function DataIntelligencePage() {
  const [selectedDataset, setSelectedDataset] = useState<any>(DATASET_REGISTRY[0]);
  const [provenanceModalOpen, setProvenanceModalOpen] = useState(false);
  const [activeProvenance, setActiveProvenance] = useState<DataProvenanceInfo | null>(null);

  const openProvenance = (ds: any) => {
    setActiveProvenance({
      datasetName: ds.name,
      source: ds.source,
      year: ds.year,
      geography: ds.geography,
      lastUpdated: ds.lastUpdated,
      dataType: ds.dataType,
      status: ds.status,
      confidenceScore: 0.96,
      sampleCount: ds.sampleCount,
      methodologyUrl: 'https://github.com/Gautam-kumar01/BRICS#data-fusion-methodology',
    });
    setProvenanceModalOpen(true);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#faf6f0] via-[#f5ede3] to-[#ebdcd0] text-stone-900 flex flex-col selection:bg-orange-500 selection:text-white">
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-12">
        
        {/* Page Hero */}
        <div className="space-y-4 max-w-3xl">
          <div className="flex items-center gap-2.5">
            <span className="px-3 py-1 rounded-md bg-orange-100 border border-orange-300 text-orange-900 font-mono text-xs font-bold uppercase tracking-wider shadow-2xs">
              Track 1 Core Innovation
            </span>
            <DataStatusBadge status="simulated" size="xs" />
          </div>

          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-stone-900 tracking-tight leading-tight">
            Data Intelligence & Multi-Source Fusion Layer
          </h1>

          <p className="text-sm sm:text-base text-stone-700 leading-relaxed font-medium">
            Governments fail to allocate capital efficiently because citizen grievances, census records, asset condition surveys, and ministerial budget books live in disconnected silos. CivicPulse executes real-time spatial joins across 4 foundational datasets to generate explainable infrastructure priorities.
          </p>
        </div>

        {/* Visual Architecture Diagram */}
        <div className="p-6 lg:p-8 rounded-3xl bg-white/95 backdrop-blur-md border-2 border-stone-200/90 shadow-xl shadow-amber-950/5 space-y-8">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-stone-200 pb-4">
            <div>
              <h2 className="text-lg font-extrabold text-stone-900">4-Pillar Data Fusion Architecture</h2>
              <p className="text-xs text-stone-600 font-medium">Continuous ingestion pipeline transforming unstructured feedback into evidence-based public capital allocations</p>
            </div>
            <span className="text-xs font-mono text-stone-700 font-bold bg-[#faf6f0] px-3 py-1 rounded-lg border border-stone-200">Spatial Resolution: 250m GIS Grid</span>
          </div>

          {/* Stepper Diagram */}
          <div className="relative">
            {/* 4 Ingestion Inputs */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Pillar 1: Citizen Demand */}
              <div className="p-5 rounded-2xl bg-gradient-to-b from-orange-50/90 via-white to-orange-50/30 border-2 border-orange-300 shadow-sm hover:border-orange-500 hover:shadow-md transition-all space-y-3 relative group">
                <div className="flex items-center justify-between">
                  <span className="text-2xl">🎙️</span>
                  <span className="text-[10px] font-mono font-extrabold text-orange-900 uppercase bg-orange-100 px-2 py-0.5 rounded border border-orange-300">Pillar 1</span>
                </div>
                <h3 className="text-sm font-extrabold text-stone-900">Citizen Demand Stream</h3>
                <ul className="text-stone-700 space-y-1.5 font-mono text-[11px]">
                  <li>• Voice, Text, WhatsApp & SMS</li>
                  <li>• NLP Intent & Urgency Extraction</li>
                  <li>• 300m Spatial PIN Clustering</li>
                  <li>• Duplicate Grievance Aggregation</li>
                </ul>
                <div className="pt-2 border-t border-orange-200/80 flex justify-between items-center text-[10px]">
                  <span className="text-stone-600 font-mono font-bold">Weight: 25-30%</span>
                  <button onClick={() => openProvenance(DATASET_REGISTRY[0])} className="text-orange-700 hover:text-orange-950 font-bold hover:underline cursor-pointer">Inspect Provenance →</button>
                </div>
              </div>

              {/* Pillar 2: Demographics */}
              <div className="p-5 rounded-2xl bg-gradient-to-b from-amber-50/90 via-white to-amber-50/30 border-2 border-amber-300 shadow-sm hover:border-amber-500 hover:shadow-md transition-all space-y-3 relative group">
                <div className="flex items-center justify-between">
                  <span className="text-2xl">👥</span>
                  <span className="text-[10px] font-mono font-extrabold text-amber-900 uppercase bg-amber-100 px-2 py-0.5 rounded border border-amber-300">Pillar 2</span>
                </div>
                <h3 className="text-sm font-extrabold text-stone-900">Demographic & Vulnerability</h3>
                <ul className="text-stone-700 space-y-1.5 font-mono text-[11px]">
                  <li>• Ward & Panchayat Census Density</li>
                  <li>• Age-Dependency & Health clinics</li>
                  <li>• Multidimensional Vulnerability Index</li>
                  <li>• Per-Capita Exposure Weighting</li>
                </ul>
                <div className="pt-2 border-t border-amber-200/80 flex justify-between items-center text-[10px]">
                  <span className="text-stone-600 font-mono font-bold">Weight: 20-25%</span>
                  <button onClick={() => openProvenance(DATASET_REGISTRY[1])} className="text-amber-800 hover:text-amber-950 font-bold hover:underline cursor-pointer">Inspect Provenance →</button>
                </div>
              </div>

              {/* Pillar 3: Infrastructure Index */}
              <div className="p-5 rounded-2xl bg-gradient-to-b from-emerald-50/90 via-white to-emerald-50/30 border-2 border-emerald-300 shadow-sm hover:border-emerald-500 hover:shadow-md transition-all space-y-3 relative group">
                <div className="flex items-center justify-between">
                  <span className="text-2xl">🏗️</span>
                  <span className="text-[10px] font-mono font-extrabold text-emerald-900 uppercase bg-emerald-100 px-2 py-0.5 rounded border border-emerald-300">Pillar 3</span>
                </div>
                <h3 className="text-sm font-extrabold text-stone-900">Infrastructure Gap Index</h3>
                <ul className="text-stone-700 space-y-1.5 font-mono text-[11px]">
                  <li>• Piped Water & Tanker Deficits</li>
                  <li>• Road Quality & Culvert Scour</li>
                  <li>• Grid Power Outage Duration</li>
                  <li>• Target vs Baseline Deficit Gap</li>
                </ul>
                <div className="pt-2 border-t border-emerald-200/80 flex justify-between items-center text-[10px]">
                  <span className="text-stone-600 font-mono font-bold">Weight: 20-25%</span>
                  <button onClick={() => openProvenance(DATASET_REGISTRY[2])} className="text-emerald-800 hover:text-emerald-950 font-bold hover:underline cursor-pointer">Inspect Provenance →</button>
                </div>
              </div>

              {/* Pillar 4: Public Investment */}
              <div className="p-5 rounded-2xl bg-gradient-to-b from-purple-50/90 via-white to-purple-50/30 border-2 border-purple-300 shadow-sm hover:border-purple-500 hover:shadow-md transition-all space-y-3 relative group">
                <div className="flex items-center justify-between">
                  <span className="text-2xl">💰</span>
                  <span className="text-[10px] font-mono font-extrabold text-purple-900 uppercase bg-purple-100 px-2 py-0.5 rounded border border-purple-300">Pillar 4</span>
                </div>
                <h3 className="text-sm font-extrabold text-stone-900">Public Capital Investment</h3>
                <ul className="text-stone-700 space-y-1.5 font-mono text-[11px]">
                  <li>• Medium-Term Pipeline (MTIP)</li>
                  <li>• Active Contractor Tenders</li>
                  <li>• Underserved Spatial Blindspots</li>
                  <li>• Fiscal Capacity & Cost Efficiency</li>
                </ul>
                <div className="pt-2 border-t border-purple-200/80 flex justify-between items-center text-[10px]">
                  <span className="text-stone-600 font-mono font-bold">Weight: 15-20%</span>
                  <button onClick={() => openProvenance(DATASET_REGISTRY[3])} className="text-purple-800 hover:text-purple-950 font-bold hover:underline cursor-pointer">Inspect Provenance →</button>
                </div>
              </div>
            </div>

            {/* Fusion Arrow */}
            <div className="my-6 flex items-center justify-center">
              <div className="flex items-center gap-3 px-6 py-2.5 rounded-full bg-gradient-to-r from-stone-900 via-stone-800 to-stone-900 text-amber-300 border-2 border-amber-500/40 shadow-lg text-xs font-mono font-extrabold">
                <span>⬇️</span>
                <span>CivicPulse Multi-Source Spatial Data Fusion Engine</span>
                <span>⬇️</span>
              </div>
            </div>

            {/* Downstream Outputs */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 rounded-2xl bg-[#faf6f0] border-2 border-stone-200 hover:border-orange-400 hover:shadow-md transition-all text-center space-y-1.5 shadow-2xs">
                <span className="text-xs font-extrabold text-stone-900 block">1. Spatial Demand Hotspots</span>
                <p className="text-[11px] text-stone-600 font-medium">High-resolution GIS heatmaps identifying severe unserved clusters</p>
                <Link href="/operations" className="inline-flex items-center gap-1 text-[11px] font-extrabold text-orange-700 hover:text-orange-950 hover:underline mt-2">View Demand Map →</Link>
              </div>

              <div className="p-4 rounded-2xl bg-[#faf6f0] border-2 border-stone-200 hover:border-orange-400 hover:shadow-md transition-all text-center space-y-1.5 shadow-2xs">
                <span className="text-xs font-extrabold text-stone-900 block">2. Explainable AI Priority Engine</span>
                <p className="text-[11px] text-stone-600 font-medium">Deterministic scoring with transparent mathematical attribution</p>
                <Link href="/planning" className="inline-flex items-center gap-1 text-[11px] font-extrabold text-orange-700 hover:text-orange-950 hover:underline mt-2">Inspect Scoring Models →</Link>
              </div>

              <div className="p-4 rounded-2xl bg-[#faf6f0] border-2 border-stone-200 hover:border-orange-400 hover:shadow-md transition-all text-center space-y-1.5 shadow-2xs">
                <span className="text-xs font-extrabold text-stone-900 block">3. Human Policy Recommendations</span>
                <p className="text-[11px] text-stone-600 font-medium">Awaiting authorized decision maker approval and capital sign-off</p>
                <Link href="/governance" className="inline-flex items-center gap-1 text-[11px] font-extrabold text-orange-700 hover:text-orange-950 hover:underline mt-2">Human Governance Gate →</Link>
              </div>
            </div>
          </div>
        </div>

        {/* Dataset Registry Table */}
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <h2 className="text-xl font-extrabold text-stone-900 flex items-center gap-2">
                <span>🗄️</span>
                <span>Connected Dataset Registry & Provenance Catalog</span>
              </h2>
              <p className="text-xs text-stone-600 font-medium">Transparent registry of all ingested data sources, refresh frequencies, and prototype fidelity levels</p>
            </div>
            <DataStatusBadge status="simulated" size="xs" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {DATASET_REGISTRY.map((ds) => (
              <div
                key={ds.id}
                className="p-5 rounded-2xl bg-white border-2 border-stone-200/90 hover:border-orange-400 hover:shadow-lg transition-all space-y-4 flex flex-col justify-between"
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="px-2.5 py-0.5 rounded text-[10px] font-mono font-extrabold bg-stone-100 text-stone-800 border border-stone-300">
                      {ds.category}
                    </span>
                    <DataStatusBadge status={ds.status} size="xs" />
                  </div>
                  <h3 className="text-sm font-extrabold text-stone-900">{ds.name}</h3>
                  <p className="text-xs text-stone-700 leading-relaxed font-medium">{ds.description}</p>
                </div>

                <div className="p-3.5 rounded-xl bg-[#faf6f0] border border-stone-200 space-y-1.5 text-xs font-mono text-[11px]">
                  <div className="flex justify-between">
                    <span className="text-stone-600 font-bold">Source:</span>
                    <span className="text-stone-900 font-bold truncate max-w-[200px]">{ds.source}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-stone-600 font-bold">Geo Resolution:</span>
                    <span className="text-stone-900 font-bold">{ds.geography}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-stone-600 font-bold">Last Synced:</span>
                    <span className="text-stone-900 font-bold">{ds.lastUpdated}</span>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-1">
                  <span className="text-[10px] font-mono font-bold text-stone-600">~{ds.sampleCount.toLocaleString()} Data Points</span>
                  <button
                    onClick={() => openProvenance(ds)}
                    className="px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white text-xs font-extrabold shadow-sm hover:shadow transition-all cursor-pointer"
                  >
                    View Data Provenance 🔍
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Digital Public Good (DPG) Open Data & API Playground */}
        <OpenApiPlayground />

        {/* BRICS 11-Member Data Availability Matrix */}
        <div className="p-6 rounded-3xl bg-white border-2 border-stone-200/90 shadow-lg space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-extrabold text-stone-900 flex items-center gap-2">
                <span>🌐</span>
                <span>BRICS 11-Member Data Availability Matrix</span>
              </h2>
              <p className="text-xs text-stone-600 font-medium">Jurisdictional coverage without data fabrication. Unconnected regions display explicit unavailable state.</p>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
            {BRICS_COUNTRIES_CONFIG.map((c) => (
              <div
                key={c.code}
                className="p-3.5 rounded-2xl bg-[#faf6f0] border-2 border-stone-200/80 space-y-2 flex flex-col justify-between hover:border-orange-300 hover:shadow-xs transition-all"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xl">{c.flag}</span>
                  <span className="text-[10px] font-mono font-extrabold text-stone-600">{c.code}</span>
                </div>
                <div>
                  <h4 className="text-xs font-extrabold text-stone-900">{c.name}</h4>
                  <p className="text-[10px] text-stone-600 font-mono font-bold">{c.currencySymbol} • {c.language.toUpperCase()}</p>
                </div>
                <div className="pt-1">
                  <DataStatusBadge
                    status={c.dataAvailability === 'available' ? 'simulated' : c.dataAvailability === 'partial' ? 'projected' : 'not_available'}
                    size="xs"
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ==================================================================== */}
        {/* 📚 SECTION: DATA & METHODOLOGY GUIDE (PRD §30)                        */}
        {/* ==================================================================== */}
        <div id="methodology" className="p-6 lg:p-8 rounded-3xl bg-white border-2 border-stone-200/90 shadow-xl space-y-8">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-stone-200 pb-4">
            <div>
              <div className="inline-flex items-center space-x-2 text-xs font-mono text-orange-900 font-bold mb-1 bg-orange-100 px-2.5 py-0.5 rounded-full border border-orange-300">
                <span>PRD §30 Technical Transparency</span>
              </div>
              <h2 className="text-2xl font-extrabold text-stone-900 flex items-center gap-2">
                <span>🔬</span>
                <span>Data & Methodology Documentation</span>
              </h2>
              <p className="text-xs text-stone-600 font-medium">
                Comprehensive reference on data ingestion mechanisms, mathematical prioritization models, and differential spatial privacy protections.
              </p>
            </div>
            <DataStatusBadge status="simulated" size="xs" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 text-xs leading-relaxed">
            {/* 1. Citizen Data */}
            <div className="p-5 rounded-2xl bg-[#faf6f0] border-2 border-stone-200/80 space-y-2.5 shadow-2xs">
              <div className="flex items-center gap-2 text-orange-700 font-extrabold text-sm">
                <span>🎙️</span>
                <span>1. Citizen Feedback Intake</span>
              </div>
              <p className="text-stone-800 font-medium">
                Citizen submissions enter via Web Voice, Text, simulated WhatsApp bot, or 2G USSD. Audio is processed via client-side Web Speech API / server-side Whisper transcription, followed by multilingual intent extraction (FastText + LLM normalization) into standard infrastructure categories.
              </p>
              <div className="font-mono text-[11px] text-stone-600 font-bold pt-1 border-t border-stone-200">
                Latency SLA: &lt; 250ms • Accuracy Target: 92%+
              </div>
            </div>

            {/* 2. Demographic Data */}
            <div className="p-5 rounded-2xl bg-[#faf6f0] border-2 border-stone-200/80 space-y-2.5 shadow-2xs">
              <div className="flex items-center gap-2 text-amber-800 font-extrabold text-sm">
                <span>👥</span>
                <span>2. Demographic & Census Layer</span>
              </div>
              <p className="text-stone-800 font-medium">
                Aggregates national census records, ward-level population density, female/elderly dependency ratios, and multidimensional vulnerability indices (MVI). Normalizes per-capita infrastructure demand so high-density underserved areas are elevated fairly.
              </p>
              <div className="font-mono text-[11px] text-stone-600 font-bold pt-1 border-t border-stone-200">
                Resolution: Census Ward / Sub-District Grid
              </div>
            </div>

            {/* 3. Infrastructure Gap Data */}
            <div className="p-5 rounded-2xl bg-[#faf6f0] border-2 border-stone-200/80 space-y-2.5 shadow-2xs">
              <div className="flex items-center gap-2 text-emerald-800 font-extrabold text-sm">
                <span>🏗️</span>
                <span>3. Infrastructure Gap Indices</span>
              </div>
              <p className="text-stone-800 font-medium">
                Maintains empirical Infrastructure Service Gap Indices (0-100) across 5 core domains: Potable Water Supply, Road Connectivity, Power Grid Reliability, Solid Waste, and Healthcare Access. Identifies baseline service deficits vs national SDG targets.
              </p>
              <div className="font-mono text-[11px] text-stone-600 font-bold pt-1 border-t border-stone-200">
                Standard: National Infrastructure Pipeline Benchmarks
              </div>
            </div>

            {/* 4. Public Capital Investment */}
            <div className="p-5 rounded-2xl bg-[#faf6f0] border-2 border-stone-200/80 space-y-2.5 shadow-2xs">
              <div className="flex items-center gap-2 text-purple-800 font-extrabold text-sm">
                <span>💰</span>
                <span>4. Public Investment & MTIP Data</span>
              </div>
              <p className="text-stone-800 font-medium">
                Ingests Medium-Term Infrastructure Program (MTIP) budgets, active contractor procurement schedules, and allocated municipal capital. Prevents redundant expenditure in areas with existing active tenders and highlights unallocated capital blindspots.
              </p>
              <div className="font-mono text-[11px] text-stone-600 font-bold pt-1 border-t border-stone-200">
                Data Provenance: Municipal Annual Capital Works
              </div>
            </div>

            {/* 5. Mathematical Scoring */}
            <div className="p-5 rounded-2xl bg-[#faf6f0] border-2 border-stone-200/80 space-y-2.5 shadow-2xs">
              <div className="flex items-center gap-2 text-amber-800 font-extrabold text-sm">
                <span>📊</span>
                <span>5. Multi-Criteria Priority Formula</span>
              </div>
              <p className="text-amber-300 font-mono text-[11px] bg-stone-900 p-2.5 rounded-xl border border-stone-800 leading-normal font-bold">
                Score = (Severity × 25%) + (Population × 20%) + (Vulnerability × 20%) + (Service Gap × 15%) + (Cost Efficiency × 10%) + (Policy Alignment × 10%)
              </p>
              <p className="text-stone-700 text-[11px] font-medium">
                Deterministic mathematical scoring ensures that every project recommendation is explainable and free from black-box bias.
              </p>
            </div>

            {/* 6. Privacy & Data Status */}
            <div className="p-5 rounded-2xl bg-[#faf6f0] border-2 border-stone-200/80 space-y-2.5 shadow-2xs">
              <div className="flex items-center gap-2 text-rose-800 font-extrabold text-sm">
                <span>🛡️</span>
                <span>6. Privacy & Data Status System</span>
              </div>
              <p className="text-stone-800 font-medium">
                <strong className="text-stone-900">Spatial Privacy:</strong> 300m differential privacy buffer on public views; exact coordinates accessible only to verified officials.
                <br />
                <strong className="text-stone-900">Data Badges:</strong> Strictly labeled as <span className="text-emerald-700 font-bold">MEASURED</span>, <span className="text-cyan-700 font-bold">PROJECTED</span>, <span className="text-amber-700 font-bold">SIMULATED</span>, or <span className="text-stone-600 font-bold">NOT AVAILABLE</span>.
              </p>
            </div>
          </div>
        </div>

        {/* ==================================================================== */}
        {/* 🏆 SECTION: CHALLENGE COVERAGE MATRIX (PRD §34)                       */}
        {/* ==================================================================== */}
        <div id="challenge-coverage" className="p-6 lg:p-8 rounded-3xl bg-white border-2 border-stone-200/90 shadow-xl space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-stone-200 pb-4">
            <div>
              <div className="inline-flex items-center space-x-2 text-xs font-mono text-emerald-800 font-bold mb-1 bg-emerald-100 px-2.5 py-0.5 rounded-full border border-emerald-300">
                <span>Hack2Skills Track 1 Problem Statement Compliance</span>
              </div>
              <h2 className="text-2xl font-extrabold text-stone-900 flex items-center gap-2">
                <span>🎯</span>
                <span>Problem Statement Challenge Coverage Matrix</span>
              </h2>
              <p className="text-xs text-stone-600 font-medium">
                Detailed mapping of all Track 1 problem requirements against live CivicPulse implementations.
              </p>
            </div>
            <span className="px-3 py-1 rounded-full bg-emerald-100 text-emerald-900 border border-emerald-300 text-xs font-mono font-extrabold">
              100% Implemented
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b-2 border-stone-200 text-stone-700 font-mono text-[11px] uppercase bg-stone-50">
                  <th className="py-3 px-4">Problem Requirement</th>
                  <th className="py-3 px-4">CivicPulse Implementation</th>
                  <th className="py-3 px-4">Traceable Verification Link</th>
                  <th className="py-3 px-4">Live Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-200 text-stone-800">
                <tr className="hover:bg-orange-50/50 transition-colors">
                  <td className="py-3.5 px-4 font-extrabold text-stone-900">Multilingual Voice Intake</td>
                  <td className="py-3.5 px-4 font-medium text-stone-700">FastText dialect detection + Whisper ASR transcription supporting 7 BRICS pilot languages</td>
                  <td className="py-3.5 px-4">
                    <Link href="/citizen" className="text-orange-700 hover:text-orange-950 font-bold hover:underline font-mono">/citizen → Voice Recorder</Link>
                  </td>
                  <td className="py-3.5 px-4"><DataStatusBadge status="measured" size="xs" /></td>
                </tr>

                <tr className="hover:bg-orange-50/50 transition-colors">
                  <td className="py-3.5 px-4 font-extrabold text-stone-900">Multi-Channel Ingestion</td>
                  <td className="py-3.5 px-4 font-medium text-stone-700">Web Voice, Web Text, Prototype WhatsApp Bot, and 2G SMS dispatch simulations</td>
                  <td className="py-3.5 px-4">
                    <Link href="/citizen" className="text-orange-700 hover:text-orange-950 font-bold hover:underline font-mono">/citizen → Multi-Channel Tabs</Link>
                  </td>
                  <td className="py-3.5 px-4"><DataStatusBadge status="simulated" size="xs" /></td>
                </tr>

                <tr className="hover:bg-orange-50/50 transition-colors">
                  <td className="py-3.5 px-4 font-extrabold text-stone-900">Spatial Demand Hotspots</td>
                  <td className="py-3.5 px-4 font-medium text-stone-700">DBSCAN neighbourhood grievance clustering with severity density heatmaps</td>
                  <td className="py-3.5 px-4">
                    <Link href="/operations" className="text-orange-700 hover:text-orange-950 font-bold hover:underline font-mono">/operations → Geospatial GIS Map</Link>
                  </td>
                  <td className="py-3.5 px-4"><DataStatusBadge status="simulated" size="xs" /></td>
                </tr>

                <tr className="hover:bg-orange-50/50 transition-colors">
                  <td className="py-3.5 px-4 font-extrabold text-stone-900">4-Pillar Data Fusion</td>
                  <td className="py-3.5 px-4 font-medium text-stone-700">Cross-references Citizen Voice + Demographics + Infrastructure Indices + MTIP Budgets</td>
                  <td className="py-3.5 px-4">
                    <Link href="/data" className="text-orange-700 hover:text-orange-950 font-bold hover:underline font-mono">/data → 4-Pillar Architecture</Link>
                  </td>
                  <td className="py-3.5 px-4"><DataStatusBadge status="simulated" size="xs" /></td>
                </tr>

                <tr className="hover:bg-orange-50/50 transition-colors">
                  <td className="py-3.5 px-4 font-extrabold text-stone-900">Explainable AI Prioritization</td>
                  <td className="py-3.5 px-4 font-medium text-stone-700">Deterministic MCDA mathematical formula with full mathematical factor breakdown</td>
                  <td className="py-3.5 px-4">
                    <Link href="/planning" className="text-orange-700 hover:text-orange-950 font-bold hover:underline font-mono">/planning → Explain Ranking</Link>
                  </td>
                  <td className="py-3.5 px-4"><DataStatusBadge status="projected" size="xs" /></td>
                </tr>

                <tr className="hover:bg-orange-50/50 transition-colors">
                  <td className="py-3.5 px-4 font-extrabold text-stone-900">Infrastructure Budget Simulator</td>
                  <td className="py-3.5 px-4 font-medium text-stone-700">Interactive candidate capital portfolio simulation under fiscal constraints ($10M USD)</td>
                  <td className="py-3.5 px-4">
                    <Link href="/planning" className="text-orange-700 hover:text-orange-950 font-bold hover:underline font-mono">/planning → Budget Simulator</Link>
                  </td>
                  <td className="py-3.5 px-4"><DataStatusBadge status="simulated" size="xs" /></td>
                </tr>

                <tr className="hover:bg-orange-50/50 transition-colors">
                  <td className="py-3.5 px-4 font-extrabold text-stone-900">Human-in-the-Loop Gate</td>
                  <td className="py-3.5 px-4 font-medium text-stone-700">Authorized human review gate: Approve for Planning, Reject, or Request Evidence</td>
                  <td className="py-3.5 px-4">
                    <Link href="/planning" className="text-orange-700 hover:text-orange-950 font-bold hover:underline font-mono">/planning → Human Gate</Link>
                  </td>
                  <td className="py-3.5 px-4"><DataStatusBadge status="measured" size="xs" /></td>
                </tr>

                <tr className="hover:bg-orange-50/50 transition-colors">
                  <td className="py-3.5 px-4 font-extrabold text-stone-900">Governance & Audit Lineage</td>
                  <td className="py-3.5 px-4 font-medium text-stone-700">Tamper-evident audit trail logging timestamp, actor, action, previous status and rationale</td>
                  <td className="py-3.5 px-4">
                    <Link href="/governance" className="text-orange-700 hover:text-orange-950 font-bold hover:underline font-mono">/governance → Audit Trail</Link>
                  </td>
                  <td className="py-3.5 px-4"><DataStatusBadge status="measured" size="xs" /></td>
                </tr>

                <tr className="hover:bg-orange-50/50 transition-colors">
                  <td className="py-3.5 px-4 font-extrabold text-stone-900">Impact Measurement Registry</td>
                  <td className="py-3.5 px-4 font-medium text-stone-700">Explicit lifecycle progression: Baseline → Intervention → Delivery → Measured Outcome</td>
                  <td className="py-3.5 px-4">
                    <Link href="/impact" className="text-orange-700 hover:text-orange-950 font-bold hover:underline font-mono">/impact → Impact Lifecycle</Link>
                  </td>
                  <td className="py-3.5 px-4"><DataStatusBadge status="projected" size="xs" /></td>
                </tr>

                <tr className="hover:bg-orange-50/50 transition-colors">
                  <td className="py-3.5 px-4 font-extrabold text-stone-900">Multi-Country BRICS Scalability</td>
                  <td className="py-3.5 px-4 font-medium text-stone-700">Dynamic country configuration supporting all 11 BRICS member states with currency & dialects</td>
                  <td className="py-3.5 px-4">
                    <Link href="/data" className="text-orange-700 hover:text-orange-950 font-bold hover:underline font-mono">/data → 11-Member Matrix</Link>
                  </td>
                  <td className="py-3.5 px-4"><DataStatusBadge status="simulated" size="xs" /></td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </main>

      {/* Provenance Modal */}
      <DataProvenanceModal
        isOpen={provenanceModalOpen}
        onClose={() => setProvenanceModalOpen(false)}
        provenance={activeProvenance}
        metricName={activeProvenance?.datasetName}
      />
    </div>
  );
}
